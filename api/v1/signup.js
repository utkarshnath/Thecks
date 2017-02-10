//
//  api/v1/signup.js
//  Hitick-Server
//
//  Created by Avinav Goel on 14/08/16.
//  Copyright © 2016 Avinav Goel. All rights reserved.
//
var express = require('express')
var mongoose = require('mongoose')

var User = require('../../models/User')
var login = require('./login')

module.exports = function(req, res){
	//Find a matching User and return error if USer already exists
	User.findOne({mobile: req.query.mobile}, function(err, user){
		if(err){
			res.json({error:"Internal Server Error"});
			return
		}
		if(user){
			//User exists in the dataBase
			res.json({error:"User already exists"});
		}
		else{
			//Create New User with params
			var newUser = new User({
				username: req.query.username,
    			password: req.query.password,
    			mobile: req.query.mobile,
    			email: req.query.email,
    			gcmRegId: req.query.gcmRegId,
    			groups: []
			});
			newUser.save(function(err){
				if(err){
					res.json({error:"Could not complete the save request. Pls try after some time"});
				}
				//Authenticating the user again with the login action
				login(req, res);
			})
		}
	})
}