//
//  api/v1/join.js
//  Hitick-Server
//
//  Created by Avinav Goel on 14/08/16.
//  Copyright © 2016 Avinav Goel. All rights reserved.
//

var express = require('express')
var mongoose = require('mongoose')

var Group = require('../../models/Group')
var User = require('../../models/User')

module.exports = function(req, res){
	

	//Check if other grp with same grp name exists
	Group.findOne({groupName: req.query.groupName}, function(err, group){
		if (err) {
			res.json({error:"Internal Serer Error :" + err});
		}
		if(!group){
			res.json({error:"Group Does Not Exist"});
		}
		else{
			//Check for password
			group.checkPassword(req.query.password, function(err, isMatch){
				if (err) {
					res.json({error:"Internal Server Error: "+ err});
				}
				if(!isMatch){
					res.json({error:"Password did not match: "});
				}
				else{

					var userId = mongoose.Types.ObjectId(req.query.userId);
					//Check if the User is Already associated with the group
					User.find({_id : userId, groups : group._id }, function(err, user){
						if(err){
							res.json({error:"Internal Server Error:" + err});
						}
						if(user){
							res.json({error:"User already associated with the Group"});
						}
					})

					// Group.update({_id:group._id} ,{$inc:{groupMembers:1}}, null, function(err){
					// 	if(err){
					// 		res.json("Could not add to grp: "+ err)
					// 	}
					// 	User.update({mobile:req.query.mobile}, {$push:{ groups :group._id}}, null, function(err, numAffected){
					// 		if (err) {
					// 			res.json("Encountered Error while Updating: "+err)
					// 		}
					// 		Group.findOne({groupName:req.query.groupName}, function(err, group){
					// 			if(err){
					// 				res.json({error:err})
					// 			}
					// 			res.json(group)
					// 		})
					// 	})
					// })
						//Add the group id to the currentUser
						User.update({_id : userId}, {$push:{ groups :group._id}}, null, function(err, numAffected){
							if (err) {
								res.json({error:"Encountered Error while Updating: " + err});
							}
							//Increment the group members
							group.groupMembers.$inc()
							group.save(function(err){
								if(err){
									res.json({error:"Error while saving Group"+ err});
								}
								res.json(group)
							});

						});
				}
			});
		}
	});
}