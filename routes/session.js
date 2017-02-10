/**
 * Created by sparsh on 18/8/16.
 */
var express = require('express');

var router = express.Router();

router.get('/', function (req, res) {
    if (req.isAuthenticated()) {
        res.send({user: req.user, groupId: req.session.groupId});
    }
});

module.exports = router;