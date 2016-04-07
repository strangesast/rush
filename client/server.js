var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient
var config = require('./config');

MongoClient.connect(config.databaseURL, function(err, db) {
  if(err) throw err;

  //db.collections(function(err, collections) {
  //  if(err) throw err;
  //  for(var col_i in collections) {
  //    console.log(collections[col_i].s.name);
  //    for(var prop in collections[col_i]) {
  //    }
  //  }
  //});

  var gamestates = db.collection('gamestates');
  gamestates.find({}).addCursorFlag('tailable', true).toArray(function(err,docs) {
    console.log(docs);
  });
});
