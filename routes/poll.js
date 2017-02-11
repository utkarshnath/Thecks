/**
 * Created by sparsh on 16/8/16.
 */
var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var schedule = require('node-schedule');

var Poll = require('../models/Poll');
var Group = require('../models/Group');
var User = require('../models/User');

var ResponseEnum = require('../ResponseEnum');

module.exports = function (io, fcm) {
    router.post('/',  function(request , response , next){
      if(request.isAuthenticated()){
        next();
      }
      else{
        return res.send({redirect:'/'});
      }
    },function (req, res, next) {

        var groupId = mongoose.Types.ObjectId(req.session.groupId);
        if (groupId) {

            var pollTopic = req.body.pollTopic;
            var days = Number(req.body.timeDays);
            var hours = Number(req.body.timeHours);

            if (isNaN(days) || isNaN(hours)) {
                return res.send({redirect: '/'});
            }

            Group.findById(groupId, function (error, group) {
                if (error) {
                    return res.send({redirect: '/'});
                }
                if (!group) {
                    return res.send({redirect: '/'});
                }


                var notVoted = group.groupMembers;
                var time = (days * 24 * 60 * 60 * 1000) + (hours * 60 * 60 * 1000);

                var createdAt = new Date();
                var modifiedAt = new Date();

                var endDate = new Date(createdAt.getTime() + time);

                console.log(time);
                console.log(endDate);


                var newPoll = new Poll({
                    groupId: groupId,

                    pollTopic: pollTopic,
                    inFavor: 0,
                    opposed: 0,
                    notVoted: notVoted,
                    ongoing: true,

                    submittedAt: createdAt,
                    modifiedAt: 0,
                    stipulatedTime: time,

                    voters: [],
                    result: "Pending"
                });

                newPoll.save(function (saveError) {
                    if (saveError) {
                        return next(saveError);
                    }

                    /* The poll has been saved successfully
                     * So now we add the timer task for the poll to expire.
                     * */
                    var timerTask = schedule.scheduleJob(endDate, function () {
                        var pollId = newPoll._id;
                        console.log("Poll expired");
                        Poll.update({_id: pollId}, {ongoing: false}, function (updateError) {
                            if (updateError) {
                                return next(updateError);
                            }
                            console.log("Poll updated");
                            return io.to(req.session.groupId)
                                .emit("Update", {redirect: '/group/' + req.session.groupId});
                        });
                    });

                    res.send({redirect: '/group/' + req.session.groupId});

                    // Emit to all connected clients
                    io.to(req.session.groupId).emit("Update", {redirect: '/group/' + req.session.groupId});

                    // Send to all fcm devices
                    User.find({groups: groupId}, function (error, users) {
                        if (error) {
                            return;
                        }
                        users.forEach(function (user) {
                            if (user.gcmRegId) {
                                var message = {
                                    to: user.gcmRegId,
                                    data: {
                                        poll: newPoll
                                    }
                                };
                                fcm.send(message, function (err, response) {
                                    if (err) {
                                        console.log("Something has gone wrong!");
                                  } else {
                                        console.log("Successfully sent with response: ", response);
                                    }
                                });
                            }
                        });
                    });
                });
            });
        }
    });

    router.post('/:pollId', function(request , response , next){
      if(request.isAuthenticated()){
        next();
      }
      else{
          return res.send({redirect:'/'});
      }
    }, function (req, res) {

        var vote = Number(req.body.vote);
        var pollId = mongoose.Types.ObjectId(req.params.pollId);
        var voterId = req.user._id;


        if (isNaN(vote)) {
            return res.send({redirect: '/'});
        }

        // Update the poll data
        Poll.findById(pollId, function (error, poll) {

            if (error) {
                return res.send({redirect: '/'});
            }

            // Check if the user already exists
            var hasVoted = poll.voters.some(function (voter) {
                return voterId.equals(voter.voterId);
            });

            var inFavor = poll.inFavor;
            var opposed = poll.opposed;
            var notVoted = poll.notVoted;

            // If the user hasn't voted, we add him to the voters list
            if (!hasVoted) {

                if (vote == ResponseEnum.YES) {
                    inFavor += 1;
                }
                if (vote == ResponseEnum.NO) {
                    opposed += 1;
                }
                notVoted -= 1;

                // Update the poll value
                Poll.update({_id: poll._id}, {
                    $push: {voters: {voterId: voterId, response: vote}},
                    inFavor: inFavor,
                    opposed: opposed,
                    notVoted: notVoted
                }, null, function (updateErr, numAffected) {
                    if (updateErr) {
                        return res.send({redirect: '/'});
                    }
                    res.send({redirect: '/group/' + req.session.groupId});
                    io.to(req.session.groupId).emit("Update", {redirect: '/group/' + req.session.groupId});
                    // Send to all fcm devices
                    Poll.findById(poll._id, function (pollError, updatedPoll) {
                        User.find({groups: mongoose.Types.ObjectId(req.session.groupId)}, function (error, users) {
                            if (pollError) {
                                return;
                            }
                            users.forEach(function (user) {
                                console.log(user.username);
                                if (user.gcmRegId) {
                                    var message = {
                                        to: user.gcmRegId,
                                        data: {
                                            poll: updatedPoll
                                        }
                                    };
                                    fcm.send(message, function (err, response) {

                                        if (err) {
                                            console.log("Something has gone wrong!");
                                        } else {
                                            console.log("Successfully sent with response: ", response);
                                        }
                                    });
                                }
                            });
                        });
                    });

                });
            }
            // Else we just alter the values of constants and the user response
            else {
                var response = poll.voters.find(function (voter) {
                    return voter.voterId.equals(voterId);
                }).response;

                if (vote == response) {
                    return res.send({redirect: '/group/' + req.session.groupId});
                }

                if (vote == ResponseEnum.YES) {
                    inFavor += 1;
                    opposed -= 1;
                }
                if (vote == ResponseEnum.NO) {
                    opposed += 1;
                    inFavor -= 1;
                }
                Poll.update({_id: pollId, 'voters.voterId': voterId}, {
                    $set: {'voters.$.response': vote},
                    inFavor: inFavor,
                    opposed: opposed
                }, function (updateError, numAffected) {
                    if (updateError) {
                        return res.send({redirect: '/'});
                    }

                    res.send({redirect: '/group/' + req.session.groupId});

                    // Send to all connected clients
                    io.to(req.session.groupId).emit("Update", {redirect: '/group/' + req.session.groupId});

                    // Send to all fcm devices
                    Poll.findById(poll._id, function (pollError, updatedPoll) {
                        User.find({groups: mongoose.Types.ObjectId(req.session.groupId)}, function (error, users) {
                            if (pollError) {
                                return;
                            }
                            users.forEach(function (user) {
                                console.log(user.username);
                                if (user.gcmRegId) {
                                    var message = {
                                        to: user.gcmRegId,
                                        data: {
                                            poll: updatedPoll
                                        }
                                    };
                                    fcm.send(message, function (err, response) {

                                        if (err) {
                                            console.log("Something has gone wrong!");
                                        } else {
                                            console.log("Successfully sent with response: ", response);
                                        }
                                    });
                                }
                            });
                        });
                    });

                });
            }
        });
    });

    return router;
};
