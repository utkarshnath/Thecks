
var express = require('express');
var passport = require('passport');
var User = require('../models/User');

var router = express.Router();
router.get('/', function (request, response) {
    response.render('signup');
});

router.post('/', function (request, response, next) {
    var username = request.body.username;
    var password = request.body.password;
    var mobile = request.body.mobile;
    var email = request.body.email;

    User.findOne({mobile: mobile}, function (error, user) {
        if (error) {
            next(error);
        }
        if (user) {
            request.flash("error","User already exists");
            return response.redirect('/signup');
        }
        var newUser = new User({
            username: username,
            password: password,
            mobile: mobile,
            email: email,
            gcmRegId: null,
            groups: []
        });
        newUser.save(next);
    });
}, passport.authenticate('login', {
    successRedirect: '/',
    failureRedirect: '/',
    failureFlash: true
}));

module.exports = router;