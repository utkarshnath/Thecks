//
//  Created by Avinav on 18/08/16
//  Copyright © 2016 Avinav. All rights reserved.
//
var express = require('express')
var mongoose = require('mongoose')

var User = require('../../models/User')
var Group  =require('../../models/Group')

//Query Params: groupId, endDate
module.exports = function(req, res){
    var groupId  = mongoose.Types.ObjectId(req.query.groupId);
    var endDate = new Date(Number(req.query.endDate));
    var currentDate = Date.now();

    var timeDiff = endDate - currentDate;
    if(timeDiff<0){
        res.json({error:"This poll is a past"});
    }

    //Find the group being referenced
    Group.findById(groupId, function (err, group) {
        if(err || !group){
            res.json({error:"Could not find the specified Group"});
        }
        var poll = new Poll({
            groupId : groupId,

            pollTopic : req.query.pollTopic,
            inFavor : 0,
            opposed : 0,
            notVoted :group.groupMembers.length,
            ongoing : true,

            submittedAt : currentDate,
            stipulatedTime : timeDiff,
            modifiedAt:currentDate,

            voters : [],
            result : "Pending"
        });

        poll.save(function (err) {
            if(err){
                res.json({error:"Internal Server Error while generating Poll:"+err});
            }
            res.json(poll);
        })
    })
}
