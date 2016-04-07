var express = require('express');
var mongoose = require('mongoose');

var Action = require('./models/action');

var app = express();
var config = require('./config');

mongoose.connect(config.databaseURL, function(err, db) {
  if(err) throw err;
  console.log("connected to databse at " + config.databaseURL);

  var stream = Action.find().tailable(true, {
    tailable: true,
    awaitdata: true,
    numberOfRetries: Number.MAX_VALUE
  }).stream();

  stream.on('data', function(doc) {
    console.log(doc);
  });

  app.get('/', function(req, res) {
    res.send("helloo");
  });

  app.listen(config.port, function() {
    console.log('listening on port ' + config.port);
  });
});
