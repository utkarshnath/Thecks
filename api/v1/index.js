//
//  api/v1/index.js
//  Hitick-Server
//
//  Created by Avinav Goel on 13/08/16.
//  Copyright © 2016 Avinav Goel. All rights reserved.
//
var express = require('express');

var api = express.Router();

var login = require('./login');
var signup = require('./signup');
var joinGrp = require('./joinGrp');
var createGrp = require('./createGrp');
var createPoll = require('./createPoll');
var latestPoll = require('./latestPoll');
var pastPoll = require('./pastPoll');
var pollVote = require('./pollVote');

api.get("/login", function(req, res){
	console.log("Got GET Request on login");
	login(req, res);
});
api.get("/signup", function(req, res){
	console.log("Got signup Request");
	signup(req, res);
});

api.get("/join", function(req, res){
	console.log("Got Join Request");
	joinGrp(req, res);
});

api.get('/create', function(req, res){
	console.log("Got group create request");
	createGrp(req, res);
});

api.get('/poll/new', function(req, res){
	console.log("get info on poll");
	createPoll(req, res);
});
api.get('/poll/latest', function(req, res){
	console.log('get all new polls for '+ req.query.userId);
	latestPoll(req, res);
});

api.get('/poll/past', function(req, res){
	console.log('get past polls request from' + req.query.userId);
	pastPoll(req, res);
});

api.post('poll/vote', function(req, res){
	console.log("received post request for poll from " + req.body.userId);
	pollVote(req, res);
})
module.exports = api;