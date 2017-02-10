/**
 * Created by sparsh on 10/8/16.
 */
var mongoose = require("mongoose");
var bcrypt = require("bcrypt-nodejs");
var Schema = require("mongoose/lib/schema.js");


var SALT_FACTOR = 10;

// Create a group schema
var groupSchema = mongoose.Schema({
    groupName: {type: String, required: true, unique: true},
    groupPassword: {type: String, required: true},
    groupMembers: Number,
    adminId: Schema.Types.ObjectId
});

groupSchema.methods.name = function () {
    return this.groupName;
};

groupSchema.methods.members = function () {
    return this.groupMembers;
};

var noop = function () {};


// Hash the password before saving
groupSchema.pre("save", function (done) {
    var group = this;
    bcrypt.genSalt(SALT_FACTOR, function (error, salt) {
        if (error) {
            return done(error);
        }
        bcrypt.hash(group.groupPassword , salt , noop , function(error , hashedPassword){
            if(error){
                done(error);
            }
            group.groupPassword = hashedPassword;
            done();
        });
    });
});

groupSchema.methods.name = function () {
    return this.groupName;
};

groupSchema.methods.checkPassword = function (guess , done) {
  bcrypt.compare(guess , this.groupPassword , function(error , isMatch){
     done(error , isMatch);
  });
};

var Group = mongoose.model("Group" , groupSchema);
module.exports = Group;