/**
 * Created by sparsh on 12/8/16.
 */
var express = require('express');

var router = express.Router();

router.get('/' , function (request , response) {
    request.logout();
    response.redirect('/');
});

module.exports = router;