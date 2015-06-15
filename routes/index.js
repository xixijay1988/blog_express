var express = require('express');
var router = express.Router();
var crypto = require('crypto');
var User = require('../models/user.js');
var Post = require('../models/post.js');


function checkLogin(req, res, next) {
  if (!req.session.user) {
    req.flash('error', 'Please Login!');
    res.redirect('/login');
  }
  next();
}

function checkNotLogin(req, res, next) {
  if (req.session.user) {
    req.flash('error', 'Already Login!');
    res.redirect('back');
  }
  next();
}

/* GET home page. */
router.get('/', function(req, res) {
  Post.get(null, function (err, posts) {
    if (err) {
      posts = [];
    }
    res.render('index', {
      title: 'Home',
      user: req.session.user,
      posts: posts,
      success: req.flash('success').toString(),
      error: req.flash('error').toString()
    });
  });
});

/* Get Login*/
router.get('/login',checkNotLogin);
router.get('/login',function(req, res) {
  res.render('login',{
    title: 'Sign In',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/login',checkNotLogin);
router.post('/login', function (req,res) {
  var username = req.body.username;
  var password = req.body.password;

  var md5 = crypto.createHash('md5');
  var password_md5 = md5.update(password).digest('hex');

  User.get(username, function (err, user) {
    if (!user) {
      req.flash('error', 'User is not existed!');
      return res.redirect('/login');//用户不存在则跳转到登录页
    }
    //检查密码是否一致
    if (user.password != password_md5) {
      req.flash('error', 'Password Error!');
      return res.redirect('/login');//密码错误则跳转到登录页
    }
    //用户名密码都匹配后，将用户信息存入 session
    req.session.user = user;
    req.flash('success', 'Login Successful!');
    res.redirect('/');//登陆成功后跳转到主页
  });
});


//Register
router.get('/register',checkNotLogin);
router.get('/register', function (req, res) {
  res.render('register',{
    title: 'Register',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/register',checkNotLogin);
router.post('/register', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;
  var password_re = req.body['password-repeat'];
  var email = req.body.email;
  if(password != password_re){
    req.flash('error','Password is not the same');
    return res.redirect('/register');
  }

  //create the md5 for password

  var md5 = crypto.createHash('md5');
  var password_md5 = md5.update(password).digest('hex');
  var userbody = new User({
    username: username,
    password: password_md5,
    email: email
  });

  //check the user is existed
  User.get(userbody.username, function(err, user){
    if(err){
      req.flash('error',err);
      return res.redirect('/register');
    }

    if(user){
      req.flash('error','Username is already existed!');
      return res.redirect('/register');
    }
    //create the user
    userbody.save(function (err, user){
      if(err){
        req.flash('error',err);
        return res.redirect('/register');
      }

      req.session.user = user;
      req.flash('success','Register Successful!');
      res.redirect('/');

    });

  });


});

//Logout
router.get('/logout',checkLogin);
router.get('/logout', function(req, res){
    req.session.user = null;
    req.flash('success', 'Logout Successful!');
    res.redirect('/');
});

//Post
router.get('/post',checkLogin);
router.get('/post', function(req, res){
  res.render('post', {
    title: 'Posts',
    user: req.session.user,
    success: req.flash('success').toString(),
    error: req.flash('error').toString()
  });
});

router.post('/post',checkLogin);
router.post('/post', function (req, res) {
  var currentUser = req.session.user,
      post = new Post(currentUser.username, req.body.title, req.body.article);
  post.save(function (err) {
    if (err) {
      req.flash('error', err);
      return res.redirect('/');
    }
    req.flash('success', '发布成功!');
    res.redirect('/');//发表成功跳转到主页
  });
});

module.exports = router;
