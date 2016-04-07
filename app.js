var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var redis = require('redis');
var mongoose = require('mongoose');
var passport = require('passport');
var passportLocalStrategy = require('passport-local').Strategy;
var expressSession = require('express-session');
var connectRedis = require('connect-redis');
var flash = require('connect-flash');

// routes setup
var routes = require('./routes/index');
var account = require('./routes/account');
var hash = require('./routes/hash');

var config = require('./config'); // root config file
var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser(config.secret));
app.use(express.static(path.join(__dirname, 'public')));

// redis
var RedisStore = connectRedis(expressSession);
var sessionStore = new RedisStore();
app.use(expressSession({
  secret: config.secret,
  resave: true,
  store: sessionStore,
  saveUninitialized: false,
  cookie: {
    expires: true,
    maxAge: 15*60*1000
  }
}));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

var Account = require('./models/account/account.js');
passport.use(new passportLocalStrategy(Account.authenticate())); 
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

// add user to all templating
app.use(function(req, res, next) {
  if(req.user) {
    res.locals.user = req.user;
  }
  return next();
});

mongoose.connect(config.databaseURL, function(err) {
  if(err) {
    console.log("error connecting to " + config.databaseURL);
  } else {
    console.log("connected to mongodb at " + config.databaseURL);
  }
});

// routes implementation
app.use('/', routes);
app.use('/account/', account);
app.use('/hash/', hash);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;
