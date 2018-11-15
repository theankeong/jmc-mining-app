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
        app.get('/records', function(req, res, next) {
            
        //try to pull from redis cache first
        redisClient.get('world',function(err,reply){
            //if error then throw error larh
            if(err) throw err;
             
            //if rediscache contains the correct KVP returns the JSON to display
            if(reply){
                //parse the json
                const resultJSON = JSON.parse(reply);
                //return the results
                return res.status(200).json(resultJSON);
        }
        //if redis cache does not have the information
        else{
            //retrieve all records from db
            records_collection.find({}).toArray(function(err, records){
                if(err) throw err;
                //check records length
                if(records.length < 1) {
                    console.log("No records found.");
                }
                else{
                    //create a KVP in redis with 'key','timeout in sec', content
                    redisClient.setex('world', 3600, JSON.stringify(records));
                    //return the records
                    res.json(records);
                }                
            });
        }
    });


        });
    
        app.post('/records', function(req, res, next){
            console.log(req.body);
            redisClient.del("world");
            records_collection.insert(req.body, function(err, doc) {
                if(err) throw err;
                console.log(doc);
                res.json(doc);
            });
        });
    
        app.delete('/records/:id', function(req, res, next){
            var id = req.params.id;
            redisClient.del("world");
            console.log("delete " + id);
            records_collection.deleteOne({'_id': new ObjectId(id)}, function(err, results){
                console.log(results);
                res.json(results);
            });
        });
    
        app.put('/records/:id', function(req, res, next){
            var id = req.params.id;
            redisClient.del("world");
            records_collection.updateOne(
                {'_id': new ObjectId(id)},
                { $set: {
                    'name' : req.body.name,
                    'email': req.body.email,
                    'phone': req.body.phone
                    }
                }, function(err, results){
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
