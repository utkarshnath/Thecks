//
//  Created by Avinav on 18/08/16
//  Copyright © 2016 Avinav. All rights reserved.
//

var express  =require('express')
var mongoose = require('mongoose')

var User = require('../../models/User')
var Group = require('../../models/Group')
var Poll = require('../../models/Poll')


//This module return Polls for a user who has new polls in any of
//  his groups after the last Update Time
//Request Query Params: userId, updateTime

module.exports = function(req, res){

    var userId = mongoose.Types.ObjectId(req.query.userId);
    User.findById(userId, function(err, currentUser){
        if(err || !currentUser){
            res.json({error:"Could not find the registered User"})
        }
        var lastUpdateTime = new Date(Number(req.query.updateTime));

        Poll.find({$and:[ {modifiedAt:{$gt:lastUpdateTime}}, {groupId:{$in:currentUser.groups}}]}, function (error, polls) {
            if(error || !polls){
                res.json({error:"Error Finding Polls"})
            }
            // console.log(polls)
            res.json(polls)
        })

    })
};