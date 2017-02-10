//
//  Created by Avinav on 28/08/16
//  Copyright © 2016 Avinav. All rights reserved.
//

var express = require('express')

var Poll = require('../../models/Poll')

//body items:   pollId, userId, response
//response->1:Yes   response->0:No
module.exports = function(req, res){
    var pollId = mongoose.Types.objectId(req.body.pollId)
    var userId = mongoose.Types.objectId(req.body.userId)
    var response = Number(req.body.response);
    POll.findById(pollId, function(err, currentPoll){
        if(err || !currentPoll){
            res.json({"error":"No matching poll to this Poll Id"});
            return;
        }

        var hasVoted = currentPoll.voters.some(function(voter){
            userId.equals(voter.voterId);
        });

        var inFavor = currentPoll.inFavor;
        var opposed = currentPoll.opposed;
        var notVoted = currentPoll.notVoted;

        //The user hasn't voted yet
        if(!hasVoted){
            if(response==1){
                inFavor++;
            }
            else{
                opposed++;
            }
            notVoted--;

            Poll.findOneAndUpdate({_id:pollId}, {
                $push:{voters:{voterId:userId, response:response}},
                $set:{inFavor:inFavor,
                opposed:opposed,
                notVoted:notVoted,
                modifiedAt:Date.now()
                }
            }, {new : true}, function(err, updatedPoll){

                if(err || !updatedPoll){
                    res.json({"error":"Could not update Poll"});
                    return;
                }

                res.json(updatedPoll);
                io.to(updatedPoll.groupId).emit("Update", {});
            });
        }

        //Now if the control reaches here that means the user has voted earlier
        //So considered as voted

        else{
            var prevResponse = poll.voters.find(function(voter){
                userId.equals(voter.voterId)
            }).response;

            if(prevResponse==response){
                res.json({"error":"No change in response"})
                return;
            }
            //For prevResponse->1 and response(current)->0
            if(prevResponse==1){
                inFavor--;
                opposed++;
            }
            //For prevResponse->0 and response(current)->1
            else{
                inFavor++;
                opposed--;
            }

            Poll.findOneAndUpdate({_id:pollId}, {
                $set:{
                    inFavor:inFavor,
                    opposed:opposed,
                    notVoted:notVoted,
                    modifiedAt:Date.now()
                }},{new:true}, function(err, updatedPoll){

                    if(err || !updatedPoll){
                        res.json({"error":"Poll did not update"});
                        return;
                    }

                res.json(updatedPoll);
                io.to(updatedPoll.groupId).emit("Update", {});
            });
        }


    });

}