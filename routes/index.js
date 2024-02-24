var express = require('express');
var router = express.Router();
var userModel = require('./users');
var postModel = require('./posts');
const passport = require('passport');
const localstrategy = require('passport-local');
const flash = require('flash');
const upload = require('./multer');


passport.use(new localstrategy(userModel.authenticate()));

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('register');
});

router.get('/feed', function (req, res, next) {
  res.render('feed');
});

router.post('/upload', isLoggedIn, upload.single('file'), async function (req, res, next) {
  if (!req.file) {
    return res.status(404).send('No files were given');
  }
  // You will only come on this code below if the file is uploaded successfully
  const user = await userModel.findOne({ username: req.session.passport.user });
  // Main task ==> The uploaded file should be posted and link the post to user and vice-versa;
  const post = await postModel.create({
    image: req.file.filename,
    imageText: req.body.filecaption,
    user: user._id
  });

  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});


router.get('/login', function (req, res, next) {
  res.render('login', { error: req.flash('error') });    // this will reflect your error on the html page
  // If you will go direct to the login page then there will be no flash messages
  // it is an array if its size > 0 then only we reflect the error on the page
});


router.get('/profile', isLoggedIn, async function (req, res, next) {
  const user = await userModel.findOne({
    username: req.session.passport.user
  })
    .populate('posts');

  // Whenever you login in your data got saved in the session passport so you can get it from there and show on the page
  res.render("profile", { user });
  //res.send("Okay");
});

router.get('/logout', function (req, res, next) {
  req.logout(function (err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/profile',
  failureRedirect: '/login',
  failureFlash: true                 // This means we enabled the access to be able to see flash messages
}), function (req, res, next) {
});

router.post('/register', function (req, res, next) {
  const userData = new userModel({
    username: req.body.username,
    fullname: req.body.fullname,
    email: req.body.email,
  });

  userModel.register(userData, req.body.password).then(
    function () {
      passport.authenticate('local')(req, res, function () {
        res.redirect('/profile');
      })
    }
  )

});

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}


module.exports = router;
