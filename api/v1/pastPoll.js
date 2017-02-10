//
//  Created by Avinav on 18/08/16
//  Copyright © 2016 Avinav. All rights reserved.
//

var express = require('express');
var mongoose = require('mongoose');

var Group = require('../../models/Group');
var Poll = require('../../models/Poll');

//This Module returns the polls of a group with a particular batch size before the last poll date
//Request Params: groupId,lastTime, batchSize
module.exports = function(req, res){
    console.log(req.query.groupId);
    var groupId = mongoose.Types.ObjectId(req.query.groupId);

    Group.findById(groupId, function(err, group){
        if(err || !group){
            res.json({error:"Could Not find User"});
            return;
        }
        var lastPollTime = new Date(Number(req.query.lastTime));
        console.log(lastPollTime)
        //Find the polls for that group before the time createdAt

        console.log(lastPollTime);

        Poll.find({$and:[{groupId:group._id}, {submittedAt:{$lt:lastPollTime}}]}).batchSize(req.query.batchSize).exec(function (err, polls) {
            console.log(polls.length);
            if(err || !polls){
                res.json({error:"Could not fetch Polls"});
                return;
            }

            res.json(polls);
        });
    });
}