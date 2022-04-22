var express = require("express");
var router  = express.Router();
var passport = require("passport");
const bodyParser = require('body-parser');
var middleware = require("../middleware");
const urlencodedParser = bodyParser.urlencoded({ extended: false })
const { check, validationResult } = require('express-validator');


//Root route
  router.get("/",middleware.ifUserLoggedIn, function(req, res){
        res.render("landings");
    });


  //Route to change user password
router.put("/password/change", urlencodedParser,  [
  check('password')
      .isLength({ min: 8})
      .withMessage('Password must be at least 8 Characters')
      .trim()
      .escape(),
  check('confirm_password')
      .custom(async (confirmPassword, {req}) => {
          const password = req.body.password
          if(password !== confirmPassword){
          throw new Error('Passwords must be same')
          }
      }),          
  ],middleware.checkUserAccountOwnership, function(req, res){
      const errors = validationResult(req)
      var errorsArray = errors.errors;
      if(errorsArray.length > 0) {
          res.json({json:errorsArray});
      } if(errorsArray.length === 0) {
              //Use mongoose method findById() to first get the Buyer doc.
              User.findById(req.user._id, function(err, userFound){
                  if(err){
                      return res.redirect("/buyers/dashboard");
                  }
                  //Then use passport method setPassword to change the password     
                  userFound.setPassword(req.body.password, function(err, user){
                      userFound.save();
                      res.json({json:{}});
              });        
          });

  }
});  


//Logout user Route
router.get("/users/logout", function(req, res){
  req.logout();
  res.redirect("/");
});




  module.exports = router;