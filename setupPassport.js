/**
 * Created by sparsh on 12/8/16.
 */
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var User = require('./models/User');

passport.use('login', new LocalStrategy({
    usernameField: 'mobile',
    passwordField: 'password'
}, function (username, password, done) {
    console.log("Authentication Strategy : " , username , " Password : " , password);
    User.findOne({mobile: username}, function (error, user) {
        if (error) {
            return done(error);
        }
        if (!user) {
            return done(null, false, {message: 'Incorrect Mobile Number'});
        }
        user.checkPassword(password, function (err, isMatch) {
            if (err) {
                return done(err);
            }
            if (!isMatch) {
                return done(null, false, {message: 'Incorrect Password'});
            }
            return done(null, user);
        });
    });
}));

module.exports = function () {
    passport.serializeUser(function (user, done) {
        done(null, user._id);
    });

    passport.deserializeUser(function (id, done) {
        User.findById(id, function (error, user) {
            done(error, user);
        });
    });
};