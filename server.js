const appInsights=require('applicationinsights');
appInsights.setup('00b84d21-5a94-4a3c-a11a-6b5ed2e01024').start();

var express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    MongoClient = require('mongodb').MongoClient,
    engines = require('consolidate'),
    assert = require('assert'),
    ObjectId = require('mongodb').ObjectID,
    
    

url = 'mongodb://localhost:27017/simplemean';
console.log('Trying to connect DB');
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
    //KV
    var kvsvc = require('./KV');
    var kvsecrets = await kvsvc.f_getsecrets();
    url = kvsecrets;
    url = 'mongodb://myc4ts:6E4ks7zaCBxIy59C39rHuAFlO9SddfJ6CuSuWPlPSEMnuIFmpM3Fh80XHcfQfWdCVCEY2cw7POXpjod3nHM0PA==@myc4ts.documents.azure.com:10255/simplemean?ssl=true&replicaSet=globaldb';
    //KV
    MongoClient.connect(process.env.MONGODB_URI || url,function(err, db){
        assert.equal(null, err);
       console.log('Successfully connected to MongoDB.');
    
        var records_collection = db.collection('records');
    
        app.get('/records', function(req, res, next) {
            // console.log("Received get /records request");
            records_collection.find({}).toArray(function(err, records){
                if(err) throw err;
    
                if(records.length < 1) {
                    console.log("No records found.");
                }
    
                // console.log(records);
                res.json(records);
            });
        });
    
        app.post('/records', function(req, res, next){
            console.log(req.body);
            records_collection.insert(req.body, function(err, doc) {
                if(err) throw err;
                console.log(doc);
                res.json(doc);
            });
        });
    
        app.delete('/records/:id', function(req, res, next){
            var id = req.params.id;
            console.log("delete " + id);
            records_collection.deleteOne({'_id': new ObjectId(id)}, function(err, results){
                console.log(results);
                res.json(results);
            });
        });
    
        app.put('/records/:id', function(req, res, next){
            var id = req.params.id;
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
