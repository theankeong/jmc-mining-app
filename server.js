const appInsights=require('applicationinsights');
appInsights.setup('00b84d21-5a94-4a3c-a11a-6b5ed2e01024').start();

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    engines = require('consolidate'),
    assert = require('assert'),
    ObjectId = require('mongodb').ObjectID,
    axios = require('axios'),
    redis = require('redis'),
    url = 'mongodb://localhost:27017/simplemean';

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.engine('html', engines.nunjucks);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

function errorHandler(err, req, res, next) {
    console.error(err.message);
    console.error(err.stack);
    res.status(500).render("error_template", { error: err});
}

async function main(){

    var kvsvc = require('./KV');
    //Get DB ConnString
    var kvconnstring = '';
    try {
        kvconnstring = await kvsvc.f_connstring();
        console.log(kvconnstring);
    } catch (error) {
        console.log(error);
    }
    url = kvconnstring;
    
    //Get Redis String
    var kvredistring = '';
    try {
        kvredistring = await kvsvc.f_redistring();
        console.log(kvredistring);
    } catch (error) {
        console.log(error);
    }
    url = kvconnstring;
    const REDISURL = process.env.REDISURL ;

    const redisClient = redis.createClient(6380,REDISURL,{auth_pass:kvredistring , tls: {c4ts: REDISURL}});
    // Print redis errors to the console
    redisClient.on('error', (err) => {
    console.log("Error " + err);
        });
    MongoClient.connect(process.env.MONGODB_URI || url,function(err, db){
        assert.equal(null, err);
       console.log('Successfully connected to MongoDB');
        var records_collection = db.collection('records');
       
        app.get('/records/:page/:itemsperpage', function (req, res, next) {
            var perPage = parseInt(req.params.itemsperpage) || 20;
            var page = req.params.page || 1;
            var rwp = [];
            //try to pull from redis cache first
            redisClient.get(page, function (err, reply) {
                //if error then throw error larh
                if (err) throw err;
    
                //if rediscache contains the correct KVP returns the JSON to display
                if (reply) {
                    //parse the json
                    const resultJSON = JSON.parse(reply);
                    //return the results
                    return res.status(200).json(resultJSON);
                }
                else {
                    records_collection.find({}).skip((perPage * page) - perPage).limit(perPage).toArray(function (err, records) {
                        if (err) throw err;
    
                        if (records.length < 1) {
                            console.log("No records found.");
                        }
                        else {
                            records_collection.count(function (err, countTotalItems) {
                                if (err) throw err;    
                                var lastPage=countTotalItems/perPage;                            
                                records.unshift(countTotalItems.toString());
                                redisClient.setex(page, 3600, JSON.stringify(records));
                                redisClient.setex("lastPage", 3600, JSON.stringify(lastPage));                          
                                res.json(records);
                            });
                        }
    
                    });
                }
            });
        });
    
        app.post('/records', function (req, res, next) {
            console.log(req.body);
            redisClient.get("lastPage",function (err, reply) {
                //if error then throw error larh
                if (err) throw err;
    
                //if found, delete lastPage from cache
                if (reply) {
                    redisClient.del("lastPage");
                }
            });
            records_collection.insert(req.body, function (err, doc) {
                if (err) throw err;
                console.log(doc);
                res.json(doc);
            });
        });
    
        app.delete('/records/:id/:currentPage', function (req, res, next) {
            var id = req.params.id;
            var currentPage = req.params.currentPage;
            console.log("delete " + id);
            redisClient.get(currentPage,function (err, reply) {
                //if error then throw error larh
                if (err) throw err;
    
                //if found, delete lastPage from cache
                if (reply) {
                    redisClient.del(currentPage);
                }
            });
            records_collection.deleteOne({ '_id': new ObjectId(id) }, function (err, results) {
                console.log(results);
                res.json(results);
            });
        });
    
        app.put('/records/:id/:currentPage', function (req, res, next) {
            var id = req.params.id;
            var currentPage = req.params.currentPage;
            redisClient.get(currentPage,function (err, reply) {
                //if error then throw error larh
                if (err) throw err;
    
                //if found, delete lastPage from cache
                if (reply) {
                    redisClient.del(currentPage);
                }
            });
            records_collection.updateOne(
                { '_id': new ObjectId(id) },
                {
                    $set: {
                        'name': req.body.name,
                        'email': req.body.email,
                        'phone': req.body.phone
                    }
                }, function (err, results) {
                    console.log(results);
                    res.json(results);
                });
        });
    
        app.use(errorHandler);
        var server = app.listen(process.env.PORT || 3000, function() {
            var port = server.address().port;
            console.log('Express server listening on port %s.', port);
        })
    })
}


main();
