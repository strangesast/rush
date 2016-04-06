var express = require('express');
var passport = require('passport');
var multer = require('multer');
var upload = multer();
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('account', { title: 'your account' });
});

router.route('/register')
.get(function(req, res, next) {
  return res.render('account/register');
});

router.post('/register', upload.array('profileImage', 'profileImageFile'), function(req, res, next) {
  var admin = req.body.username === 'admin' ? true : false;
  var buffer;

  return Account.register(new Account({
    username: req.body.username,
    admin: admin,
  }), req.body.password, function(err, account) {
    if (err) {
      req.flash('error', 'There was an error creating an account with that username / password');
      return res.render('account/register', {
        errors: req.flash('error')
      });
    }
    return passport.authenticate('local')(req, res, function() {
      return res.redirect('/account/');
    });
  });
});

router.route('/login')
.get(function(req, res) {
  return res.render('account/login');
})
.post(passport.authenticate('local', {
  failureFlash: true,
  failureRedirect: '/account/login'
}), function(req, res) {
  var defaultRedirect = '/account/';
  return res.redirect(req.query.ref || defaultRedirect);
});

router.get('/logout', function(req, res) {
  req.logout();
  return res.redirect('/account/');
});

module.exports = router;
