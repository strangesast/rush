var express = require('express');
var router = express.Router();
var multer = require('multer');
var upload = multer();
var util = require('util');
var Game = require('../models/games/game');
var Frisbe = require('../models/games/frisbe');
var Swimming = require('../models/games/swimming');
var Track = require('../models/games/track');
var Soccer = require('../models/games/soccer');
var Player = require('../models/player');
var Team = require('../models/team');
var Display = require('../models/display');
var Action = require('../models/action');
var GameState = require('../models/gamestates/gamestate');
var GameStateFrisbe = require('../models/gamestates/gamestatefrisbe');
var GameStateSoccer = require('../models/gamestates/gamestatesoccer');
var GameStateTrack = require('../models/gamestates/gamestatetrack');
var GameStateSwmming = require('../models/gamestates/gamestateswimming');

var gameTypes = {'frisbe': Frisbe, 'swimming': Swimming, 'track': Track, 'soccer': Soccer};
var gameStates = {'frisbe': GameStateFrisbe, 'swimming': GameStateSwimming, 'track': GameStateTrack, 'soccer': GameStateSoccer};

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
      hash: (root ? root : objectName + '/' + path),
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
  return tryToRender(res, 'account/index', {}).then(function(html) {
    return res.json({
      hash: 'account',
      html: html,
      plain: {user: req.user}
    });
  }).catch(function(err) {
    return next(err);
  });
});

router.get('/account/events', function(req, res, next) {
  if(req.user) {
    Game.find({owner: req.user._id}).then(function(docs) {
      return tryToRender(res, 'account/events', {events: docs}).then(function(html) {
        return res.json({
          hash: 'account/events',
          html: html
        });
      }).catch(function(err) {
        return next(err);
      });
    });
  } else {
    var err = new Error('not logged in');
    err.status = 403;
    return next(err);
  }
});

router.param('gameType', function(req, res, next, gameType) {
  if(gameType in gameTypes) {
    req.gameType = gameTypes[gameType];
    return next()
  } else {
    return next(new Error('unrecognized game type'));
  }
});

router.get('/teams', function(req, res, next) {
  return Team.find({}).then(function(team_docs) {
    return tryToRender(res, 'teams', {teams: team_docs}).then(function(html) {
      return res.json({
        hash: 'teams',
        html: html
      });
    }).catch(function(err) {
      return next(err);
    });
  });
});

router.get('/players', function(req, res, next) {
  return Player.find({}).then(function(player_docs) {
    return tryToRender(res, 'players', {teams: player_docs}).then(function(html) {
      return res.json({
        hash: 'players',
        html: html
      });
    }).catch(function(err) {
      return next(err);
    });
  });

});

// plain page with game description, current instances of game, etc
router.get('/:gameType', function(req, res, next) {
  var gameType = req.params.gameType; // soccer, basketball, etc
  return tryWithFallbackGeneric(res, '', 'event', {game: {name: gameType}}, gameType).then(function(result) {
    return res.json(result);
  }).catch(genericFailureFactory(next));
});

router.get('/:gameType/new', function(req, res, next) {
  var gameType = req.params.gameType; // soccer, basketball, etc
  if(req.user) {
    return tryWithFallbackGeneric(res, '', 'new', {}, gameType).then(function(result) {
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
        hash: req.params.gameType + '/events/' + doc._id
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
  var eventId = req.params.eventId;
  var gameType = req.params.gameType;
  req.gameType.findById(req.params.eventId).populate('owner teams state').then(function(game_doc) {
    if(game_doc) {
      var team_ids = game_doc.teams.map(function(team) {return team._id});
      //Player.find({
      // doc found!
      //tryWithFallbackGeneric = function(_res, root, path, params, objectName) {
      return tryWithFallbackGeneric(res, gameType + '/events/' + game_doc._id, 'each', {object: game_doc}, gameType).then(function(result) {
        // rendered successfully
        console.log(result);
        return res.json(result);
      }).catch(genericFailureFactory(next));
    } else {
      // not found
      return next();
    }

  }).catch(genericFailureFactory(next));
});

// this needs to be replaced
router.get('/:gameType/events/:eventId/players', function(req, res, next) {
  var eventId = req.params.eventId;
  var gameType = req.params.gameType;
  return req.gameType.findById(eventId).then(function(game_doc) {
    return Team.find({_id: { $in: game_doc.teams }}).then(function(team_docs) {
      return Player.find({team: { $in : team_docs.map(function(e) {return e._id}) }}).populate('team').then(function(player_docs) {
        // doc found!
        return tryWithFallbackGeneric(res, gameType + '/events/' + game_doc._id + '/players', 'players', {game: game_doc, players: player_docs, teams: team_docs}, gameType).then(function(result) {
          // rendered successfully
          return res.json(result);
        });
      });
    });
  }).catch(genericFailureFactory(next));
});

// this needs to be replaced
router.get('/:gameType/events/:eventId/teams', function(req, res, next) {
  var eventId = req.params.eventId;
  var gameType = req.params.gameType;
  return req.gameType.findById(eventId).then(function(game_doc) {
    return Team.find({_id: { $in: game_doc.teams }}).then(function(team_docs) {
      // doc found!
      return tryWithFallbackGeneric(res, gameType + '/events/' + eventId + '/teams', 'teams', {teams: team_docs, game: game_doc}, gameType).then(function(result) {
        // rendered successfully
        return res.json(result);
      });
    });
  }).catch(genericFailureFactory(next));
});

// this needs to be replaced
router.get('/:gameType/events/:eventId/displays', function(req, res, next) {
  var eventId = req.params.eventId;
  var gameType = req.params.gameType;
  return Display.find({event: eventId}).then(function(display_docs) {
    // doc found!
    return tryWithFallbackGeneric(res, gameType + '/events/' + eventId + '/displays', 'displays', {teams: display_docs}, gameType).then(function(result) {
      // rendered successfully
      return res.json(result);
    });
  }).catch(genericFailureFactory(next));
});

// gamestate
router.get('/:gameType/events/:eventId/admin', function(req, res, next) {
  var eventId = req.params.eventId;
  var gameType = req.params.gameType;
  return req.gameType.findById(req.params.eventId).populate('owner teams state').then(function(game_doc) {
    return tryWithFallbackGeneric(res, gameType + '/events/' + game_doc._id + '/admin', 'admin', {game: game_doc}, gameType).then(function(result) {
      return res.json(result);
    });
  }).catch(genericFailureFactory(next));
});

router.get('/:gameType/events/:eventId/admin/init', function(req, res, next) {
  //create gamestate
  return req.gameType.findById(req.params.eventId).populate('owner state').then(function(game_doc) {
    if(game_doc.teams.length !== 2) {
      var err = new Error('you need exactly 2 teams');
      res.status(400);
      return res.json({'error': err, 'message' : err.message});
    }
    var gamestate = new gameStates[req.params.gameType.toLowerCase()]({
      team0: game_doc.teams[0],
      team1: game_doc.teams[1]
    });
    return gamestate.save().then(function(gamestate_doc) {
      game_doc.state = gamestate_doc._id;
      game_doc.save().then(function(doc) {
        return res.json({game: doc});
      });
    });
  }).catch(genericFailureFactory(next));
});

router.post('/teams', upload.array(), function(req, res, next) {
  if(req.user) {
    var body = req.body;
    body.owner = req.user._id;
    var team = new Team(body);
    return team.save().then(function(team_doc) {
      return res.json({
        doc: team_doc,
        hash: null
      });
    }).catch(genericFailureFactory(next));
  } else {
    var err = new Error('must be logged in');
    err.status = 401;
    return next(err);
  }
});

// basically the same as above, but with adding to game participants
router.post('/:gameType/events/:eventId/teams', upload.array(), function(req, res, next) {
  if(req.user) {
    var body = req.body;
    body.owner = req.user._id;
    var team = new Team(body);
    return team.save().then(function(team_doc) {
      return req.gameType.findById(req.params.eventId).then(function(game_doc) {
        game_doc.teams.push(team_doc._id);
        game_doc.save().then(function() {
          return res.json({
            doc: team_doc,
            hash: null
          });
        })
      });
    }).catch(genericFailureFactory(next));
  } else {
    var err = new Error('must be logged in');
    err.status = 401;
    return next(err);
  }
});

router.post('/players', upload.array(), function(req, res, next) {
  var player = new Player(req.body);
  return player.save().then(function(player_doc) {
    console.log(player_doc);
    return res.json({
      doc: player_doc,
      hash: null
    });
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
