var express = require('express');
var Group = require('../models/Group');
var router = express.Router();


router.use(function (request, response, next) {
    response.locals.currentUser = request.user;
    response.locals.errors = request.flash("error");
    response.locals.infos = request.flash("info");
    next();
});

function isAuthenticated(request) {
    return request.isAuthenticated();
}

/* GET home page. */
router.get('/', function (req, res, next) {

    /*
     * If the user is not authenticated we render the index webpage without the groups
     * */
    if (!isAuthenticated(req)) {
        return res.render("index" , {groups: null});
    }
    /*
     * If the user is authenticated we render the index page with the groups data
     * */
    var currentUser = req.user;
    Group.find({_id: {$in: currentUser.groups}}, function (err, groups) {
        if (err) {
            return next(err);
        } else {
            return res.render('index', {groups: groups});
        }
    });
});

module.exports = router;
