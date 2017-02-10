/**
 * Created by sparsh on 12/8/16.
 */
var express = require('express');
var passport = require('passport');
var router = express.Router();

router.get('/' , function(request , response){
   response.render('login' , {currentUser  : null});
});

// Handle post request
router.post('/' , passport.authenticate('login' , {
   successRedirect : '/',
   failureRedirect : '/login',
   failureFlash : true
}));

module.exports = router;