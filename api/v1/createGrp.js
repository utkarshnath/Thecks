//
//  api/v1/createGrp.js
//  Hitick-Server
//
//  Created by Avinav Goel on 14/08/16.
//  Copyright © 2016 Avinav Goel. All rights reserved.
//
var express = require('express');
var mongoose  =require('mongoose');

var Group = require('../../models/Group');
var User = require('../../models/User');

module.exports = function(req, res){
	//Find if the current group already exists
	Group.findOne({groupName:req.query.groupName}, function(err, group){
		if (err) {
			res.json({error: "Internal Server Error: "+err});
		}
		if (group) {
			res.json({error:"Group already exists"});
		}
		//Find the user for the group details to be appended
		User.findOne({mobile : req.query.mobile}, function(err, currentUser){
			if(err){
				res.json({error:"Internal Server Error"+ err});
			}
			var newGrp = new Group({
					groupName: req.query.groupName,
    				groupPassword: req.query.groupPassword,
    				groupMembers: 1,
    				adminId: currentUser._id
				});
			newGrp.save(function(err){
				if(err){
					res.json({"error" : "Error during Save" + err});
				}
				// User.update({_id:currentUser._id}, {$push:{groups:newGrp._id}}, null, function(err, updatedGrp))
				//New method
				//Do not need to use update stmt rather just update the current params and save the model doc
				currentUser.groups.$push(newGrp._id);
				currentUser.save();
				res.json(newGrp);
			})
		})
	})
};