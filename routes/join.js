/**
 * Created by sparsh on 13/8/16.
 */
var express = require('express');
var Group = require('../models/Group');
var User = require('../models/User');
var Poll = require('../models/Poll');

var router = express.Router();

module.exports = function (io , fcm) {
    router.post('/', function(request , response , next){
      if(request.isAuthenticated()){
        next();
      }
      else{
        return response.send({redirect:'/'});
      }
    },function (request, response, next) {
        var groupName = request.body.groupName;
        var groupPassword = request.body.groupPassword;

        Group.findOne({groupName: groupName}, function (error, group) {
            if (error) {
                next(error);
            }
            if (!group) {
                request.flash('error', 'No such group exists');
                return response.send({redirect: '/'});
            }
            var currentUser = request.user;
            group.checkPassword(groupPassword, function (error, isMatch) {

                if (error) {
                    next(error);
                }
                if (!isMatch) {
                    request.flash('error', 'Incorrect Password');
                    response.send({redirect: '/'});
                }
                else {
                    // Increase the members of the group
                    Group.update({_id: group._id}, {$inc: {groupMembers: 1}}, null, function (incrementError) {
                        if (incrementError) {
                            next(incrementError);
                        }
                        // Add the group _id to the currentUser's groups array
                        User.update({_id: currentUser._id}, {$push: {groups: group._id}}, null, function (err) {
                            if (err) {
                                next(err);
                            }
                            Poll.update({
                                groupId: group._id,
                                ongoing: true
                            }, {$inc: {notVoted: 1}}, null, function (pollUpdateError) {
                                if (pollUpdateError) {
                                    return next(pollUpdateError);
                                }
                                io.to(group._id)
                                    .emit("Update", {redirect: '/group/' + group._id});
                                next();
                            });
                        });
                    });


                }
            });
        });
    }, function (request, response) {
        return response.send({redirect: '/'});
    });
    return router;
};
