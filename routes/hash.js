var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer();
var util = require('util');
var Game = require('../models/game');
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
      html: html,
      plain: {user: req.user}
    });
  }).catch(function(err) {
    return next(err);
  });
});

router.get('/account/events', function(req, res, next) {
  Game.find({owner: req.user._id}).then(function(docs) {
    return tryToRender(res, 'account/events', {events: docs}).then(function(html) {
      return res.json({
        hash: '/account/events',
        html: html
      });
    }).catch(function(err) {
      return next(err);
    });
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

// plain page with game description, current instances of game, etc
router.get('/:gameType', function(req, res, next) {
  var gameType = req.params.gameType; // soccer, basketball, etc
  return tryWithFallbackGeneric(res, gameType, 'event', {game: {name: gameType}}, gameType).then(function(result) {
    return res.json(result);
  }).catch(genericFailureFactory(next));
});

router.get('/:gameType/new', function(req, res, next) {
  var gameType = req.params.gameType; // soccer, basketball, etc
  if(req.user) {
    return tryWithFallbackGeneric(res, gameType, 'new', {}, gameType).then(function(result) {
      return res.json(result);
    }).catch(genericFailureFactory(next));
  } else {
    return res.json({
      redirect: '/account/login'
    });
  }
});

router.post('/:gameType/new', upload.array(), function(req, res, next) {
  var body = req.body;
  body.owner = req.user._id;
  if(req.user) {
    var ob = new req.gameType(body);
    return ob.save().then(function(doc) {
      return res.json({
        doc: doc,
        hash: '/' + req.params.gameType + '/events/' + doc._id
      });
    }).catch(function(err) {
      return next(err);
    });
  } else {
    return res.json({
      redirect: '/account/login'
    });
  }
});

router.get('/:gameType/events', function(req, res, next) {
  return next();
});

router.get('/:gameType/events/:eventId', function(req, res, next) {
  var gameType = req.params.eventId;
  req.gameType.findById(req.params.eventId).populate('owner').then(function(doc) {
    if(doc) {
      // doc found!
      return tryWithFallbackGeneric(res, gameType, 'each', {object: doc}, gameType).then(function(result) {
        // rendered successfully
        return res.json(result);
      }).catch(genericFailureFactory(next));
    } else {
      // not found
      return next();
    }

  }).catch(genericFailureFactory(next));
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
