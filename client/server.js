var express = require('express');
var mongoose = require('mongoose');


var app = express();
var config = require('./config');


mongoose.connect(config.databaseURL, function(err) {
  var Action = require('./action');
  if(err) throw err;
  console.log("connected to databse at " + config.databaseURL);

  app.get('/', function(req, res) {
    res.send("helloo");
  });

  app.listen(config.port, function() {
    console.log('listening on port ' + config.port);
    Action.find({}).sort({ "$natural": -1 }).limit(1).exec(function(err,docs) {
      var doc = docs.slice(-1)[0];
      var stream = Action.find({ "_id": { "$gt": doc._id } }).tailable().stream();
    
      stream.on('data', function(doc) {
        console.log('new doc');
        console.log(doc.tag);
        console.log(doc.value);
      });
    
      stream.on('error', function(err) {
        console.log('error');
        console.log(err);
      });
    
      stream.on('end', function() {
        console.log('end of stream');
      });
    });
  });
});
