/**
 * Created by sparsh on 14/8/16.
 */
var express = require('express');
var mongoose = require('mongoose');

var Group = require('../models/Group');
var Poll = require('../models/Poll');

var router = express.Router();

router.get('/', function (req, res) {

    // Add the group to the session data and redirect
    req.session.groupId = req.query.groupId;
    res.send({redirect : '/group/' + req.session.groupId });
});

router.get('/:groupId', function (request, response) {
    var groupId = mongoose.Types.ObjectId(request.params.groupId);
    Group.findById(groupId , function (error, group) {
        if (error){
            return response.redirect('/');
        }
        Poll.find({groupId : groupId} , function (err, polls) {
           if (err){
               return response.redirect('/');
           }
            return response.render('group' , {group : group , polls : polls});
        });
    });
});


module.exports = router;