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

var genericFailureFactory = function(_next) {
  return function(error) {
    return _next(error);
  };
};

var tryWithFallbackGeneric = function(_res, root, path, params, objectName) {
  return tryToRender(_res, objectName + '/' + path, params).catch(function(err) {
    // there's no specific page 'new' for type
    params.objectname = objectName;
    return tryToRender(_res, 'generic/' + path, params);

  }).then(function(html) {
    return {
      hash: objectName + '/' + path,
      html: html,
      plain: params
    };
  });
};

// hash is redirect path or current path. could probably be grabbed from
// res by default
//var tryWithoutFallback = function(_res, _next, path, params, hash) {
//  return tryToRender(_res, path, params).then(function(html) {
//    return _res.json({
//      hash: hash,
//      html: html
//    });
//  }).catch(function(err) {
//    return _next(err);
//  });
//};

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

router.get('/account', function(req, res, next) {
  //return tryWithoutFallback(res, next, 'account/index', {}, '/account');
  return tryToRender(res, 'account/index', {}).then(function(html) {
    return res.json({
      hash: '/account',
      html: html
    });
  }).catch(function(err) {
    return next(err);
  });
});

router.get('/account/events', function(req, res, next) {
  var docs = ['1', '2', '3'];
  return tryToRender(res, 'account/events', {events: docs}).then(function(html) {
    return res.json({
      hash: '/account/events',
      html: html
    });
  }).catch(function(err) {
    return next(err);
  });
});

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
  return tryWithFallbackGeneric(res, gameType, 'new', {}, gameType).then(function(result) {
    return res.json(result);
  }).catch(genericFailureFactory(next));
  //var params = {};
  //var tryWithFallbackGeneric = function(_res, root, path, params, objectName) {
  //return tryToRender(res, gameType + '/new', params).catch(function(err) {
  //  // there's no specific page 'new' for type
  //  params = {objectname: gameType};
  //  return tryToRender(res, 'generic/new', params);
  //}).then(function(html) {
  //  return res.json({
  //    hash: gameType + '/new',
  //    html: html,
  //    plain: params
  //  });
  //}).catch(function(err) {
  //  return next(err);
  //});
});

router.post('/:gameType/new', upload.array(), function(req, res, next) {
  var ob = new req.gameType(req.body);
  ob.save().then(function(doc) {
    return res.json({
      doc: doc,
      hash: '/' + req.params.gameType + '/events/' + doc._id
    });
  }).catch(function(err) {
    return next(err);
  });
});

router.get('/:gameType/events', function(req, res, next) {
  return next();
});

router.get('/:gameType/events/:eventId', function(req, res, next) {
  var gameType = req.params.eventId;
  req.gameType.findById(req.params.eventId).then(function(doc) {
    return tryWithFallbackGeneric(res, gameType, 'each', {object: doc}, gameType).then(function(result) {
      // rendered successfully
      console.log(result);
      return res.json(result);

    }).catch(genericFailureFactory(next));

  }).catch(function(err) {
    res.status = 404;
    return res.send();
    //return res.json({
    //  html: 
    //  plain: req.params.eventId + " not found"
    //});
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
