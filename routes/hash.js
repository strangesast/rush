var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer();
var util = require('util');
var Frisbe = require('../models/frisbe');
var Swimming = require('../models/swimming');
var Track = require('../models/track');
var Soccer = require('../models/soccer');

var gameTypes = {'frisbe': Frisbe, 'swimming': Swimming, 'track': Track, 'soccer': Soccer};

var tryToRender = function(_res, path, params) {
  return new Promise(function(resolve, reject) {
    return _res.render(path, params, function(err, html) {
      if(err) {
        return reject(err);
      }
      return resolve(html);
    });
  });
};

router.param('gameType', function(req, res, next, gameType) {
  if(gameType in gameTypes) {
    req.gameType = gameTypes[gameType];
    return next()
  } else {
    return next(new Error('unrecognized game type'));
  }
});

router.get('/:gameType/new', function(req, res, next) {
  var gameType = req.params.gameType; // soccer, basketball, etc
  var params = {};
  return tryToRender(res, gameType + '/new', params).catch(function(err) {
    // there's no specific page 'new' for type
    params = {objectname: gameType};
    return tryToRender(res, 'generic/new', params);
  }).then(function(html) {
    return res.json({
      hash: gameType + '/new',
      html: html,
      plain: params
    });
  }).catch(function(err) {
    return next(err);
  });
});

router.post('/:gameType/new', upload.array(), function(req, res, next) {
  var ob = new req.gameType(req.body);
  ob.save().then(function(doc) {
    return res.json({
      doc: doc
    });
  }).catch(function(err) {
    return next(err);
  });
});

router.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  return next(err);
});

router.use(function(err, req, res, next) {
  res.status(err.status || 500);
  var message = err.message;
  return res.render('generic/error', {
    message: err.message,
    error: err
  }, function(err, html) {
    return res.json({
      html: html,
      plain: message
    });
  });
});

module.exports = router;
