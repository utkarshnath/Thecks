
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");

// SALT Factor for hashing passwords
var SALT_FACTOR = 10;

// Create a User Schema
var userSchema = mongoose.Schema({
    username: {type: String, required: true},
    password: {type: String, required: true},
    mobile: {type: String, required: true, unique: true},
    email: String,
    gcmRegId: String,
    groups: Array
});

userSchema.methods.name = function () {
    return this.username;
};

// No Operation Function to use with bcrypt
var noop = function () {
};

// Hash the password before saving
userSchema.pre("save", function (done) {
    var user = this;
    if (!user.isModified("password")) {
        return done();
    }
    bcrypt.genSalt(SALT_FACTOR, function (error, salt) {
        if (error) {
            return done(error);
        }
        bcrypt.hash(user.password, salt, noop, function (error, hashedPassword) {
            if (error) {
                return done(error);
            }
            user.password = hashedPassword;
            done();
        });
    });
});

userSchema.methods.checkPassword = function (guess, done) {
    bcrypt.compare(guess, this.password, function (error, isMatch) {
        done(error, isMatch);
    });
};

var User = mongoose.model("User", userSchema);
module.exports = User;