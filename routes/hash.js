var express = require('express');
var router = express.Router();
var util = require('util');

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

router.get('/:gameType/new', function(req, res, next) {
  var gameType = req.params.gameType; // soccer, basketball, etc
  return tryToRender(res, gameType + '/new', {}).catch(function(err) {
    // there's no specific page 'new' for type
    return tryToRender(res, 'generic/new', {});
  }).then(function(html) {
    return res.json({
      hash: gameType + '/new',
      html: html
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
  return res.render('generic/error', {
    message: err.message,
    error: err
  }, function(err, html) {
    return res.json({
      html: html,
      hash: req.hash_id
    });
  });
});

module.exports = router;
