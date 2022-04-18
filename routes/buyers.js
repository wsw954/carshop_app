var express = require("express");
var router  = express.Router();
var passport = require("passport");
LocalStrategy = require("passport-local");
var {Buyer, User} = require("../models/user");
var middleware = require("../middleware");
const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false });
const { check, validationResult } = require('express-validator');



//1 Login Form
router.get("/buyers/login", function(req, res){
    res.render("buyers/login"); 
});

//2 New Buyer (RESTFul) render new buyer form
router.get("/buyers/new", function(req, res){
    res.render("buyers/new"); 

});


//3 Create Buyer (RESTful) route, (uses express-validator to validate new Buyer info)
router.post("/buyers/new", urlencodedParser,  [
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
            return Buyer.exists({email:value}).then(user => {
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
    check('credit_score')
        .exists()
        .isLength({ min: 3 })
        .withMessage('Enter a valid credit score')
        .trim()
        .escape(),         

],function(req, res){
    const errors = validationResult(req)
    var errorsArray = errors.errors;
    if(errorsArray.length > 0) {
        res.json({json:errorsArray});
    } if(errors.isEmpty()) {
        var newBuyer = new Buyer ({
            kind:"Buyer", 
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            username: req.body.username, 
            street_address_line1: req.body.street_address_line1,
            street_address_line2: req.body.street_address_line2,
            city:req.body.city,
            state:req.body.state,
            zip: req.body.zip, 
            email:req.body.email,
            phone:req.body.phone, 
            credit_score:req.body.credit_score});
            //Use passport method register() to both register the passport credentials AND save the buyer mongoose document.
            Buyer.register(newBuyer, req.body.password, function(err, user){
                if(err){
                    return res.redirect("/buyers/new");
                }        
                passport.authenticate("local")(req, res, function(){
                    res.json({json:newBuyer});
            });        
        });
    }

});

//4 Handle the Login logic. (Is called when the login form is submitted)
router.post("/buyers/login", function (req, res, next) {
    passport.authenticate('local', function (err, user, info) {
                if (err) { return next(err); }
                if (!user) { return res.send({ success : false, message : 'authentication failed' });}
                req.logIn(user, function (err) {
                    if (err) { return next(err) }
                    if(user.kind === "Buyer"){
                        res.redirect("/buyers/dashboard");
                        }
                    if(user.kind === "Dealer"){
                            res.redirect("/dealers/dashboard");
                        }
                });
    })(req, res, next);
}); 


//5 Buyer Dashboard-shown after the buyer successfully signs in
router.get("/buyers/dashboard", middleware.isBuyerLoggedIn, function(req, res){
    res.render("buyers/dashboard");
}); 

//7 Show (RESTful) buyer info
router.get("/buyers/:id", middleware.checkUserAccountOwnership, function(req, res){
    res.render("buyers/show");

});

//8 Edit (RESTful) show buyer edit form
router.get("/buyers/:id/edit", middleware.checkUserAccountOwnership, function(req, res){
    res.render("buyers/edit");
});

//6 Logout Route
router.get("/buyers/logout", function(req, res){
    req.logout();
    res.redirect("/buyers/login");
});







module.exports = router;