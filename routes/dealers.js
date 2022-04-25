var express = require("express");
var router  = express.Router();
var passport = require("passport");
LocalStrategy = require("passport-local");
var {Dealer, User} = require("../models/user");
var middleware = require("../middleware");
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { check, validationResult } = require('express-validator');

//Show Login Form
router.get("/dealers/login", middleware.ifUserLoggedIn, function(req, res){
    res.render("dealers/login");
});


//Show dealer/register form (RESTful route NEW, http GET)
router.get("/dealers/new",middleware.ifUserLoggedIn, function(req, res){
      res.render("dealers/new");
    
});


//Create Dealer (RESTful) route, (uses express-validator to validate new Dealer info)
router.post("/dealers/new", urlencodedParser,  [
    check('first_name', 'You must enter a first name')
        .exists()
        .isLength({ min: 1 }),
    check('last_name', 'You must enter a last name')
        .exists()
        .isLength({ min: 1}), 
    check('username', 'You must enter a username')
        .exists()
        .isLength({ min: 3 })
        .custom(value => {
            return User.exists({username:value}).then(user => {
              if (user) {
                return Promise.reject('Username already in use');
              }
            });
          }),
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
    check('dealership_name', 'You must enter a dealership name')
        .exists()
        .isLength({ min: 3 }),
    check('main_brand', 'You must enter a main brand sold at the dealership')
        .exists()
        .isLength({ min: 2 }),
    check('street_address_line1', 'You must enter a street address')
        .exists()
        .isLength({ min: 3 }),
    check('city', 'You must enter a city')
        .exists()
        .isLength({ min: 2 }), 
    check('state', 'You must enter a state')
        .exists()
        .isLength({ min: 2 }),
    check('zip')
        .exists()
        .isLength({ min: 5 })
        .withMessage('Zip Code is not valid')
        .trim()
        .escape(),
    check('email', 'Email is not valid')
        .isEmail()
        .trim()
        .escape()
        .normalizeEmail()
        .custom(value => {
            return Dealer.exists({email:value}).then(user => {
              if (user) {
                return Promise.reject('E-mail already in use');
              }
            });
          }),
    check('phone')
        .exists()
        .isLength({ min: 12 })
        .withMessage('Enter a valid phone number')
        .trim()
        .escape(),         
],function(req, res){
    const errors = validationResult(req)
    var errorsArray = errors.errors;
    if(errorsArray.length > 0) {
        res.json({json:errorsArray});
    } if(errors.isEmpty()) {
        var newDealer = new Dealer({
            kind:"Dealer", 
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username,
            dealership_name:req.body.dealership_name,
            main_brand:req.body.main_brand, 
            street_address_line1: req.body.street_address_line1,
            street_address_line2: req.body.street_address_line2,
            city:req.body.city,
            state:req.body.state,
            zip: req.body.zip, 
            email:req.body.email,
            phone:req.body.phone});
            //Use passport method register() to both register the passport credentials AND save the dealer mongoose document.
            Dealer.register(newDealer, req.body.password, function(err, user){
                if(err){
                    return res.redirect("/dealers/new");
                }        
                passport.authenticate("local")(req, res, function(){
                    res.json({json:newDealer});
            });        
        });
    }

});

//Handle the Login logic. (Is called when the login form is submitted)
router.post("/dealers/login", function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
                if (err) { return next(err); }
                if (!user) { return res.send({ success : false, message : 'authentication failed' });}
                req.logIn(user, function (err) {
                    if (err) { return next(err); }
                    
                    if(user.kind === "Buyer"){
                        res.redirect("/buyers/dashboard");
                        }
                    if(user.kind === "Dealer"){
                            res.redirect("/dealers/dashboard");
                        }
                });
    })(req, res, next);
}); 



//Dealer Dashboard-shown after the dealer successfully signs in
router.get("/dealers/dashboard", middleware.isDealerLoggedIn, function(req, res){
    res.render("dealers/dashboard");
});  



module.exports = router;