
//All the middleware goes here
var middlewareObj = {};
var {User} = require("../models/user");
var {Vehicle} = require("../models/vehicle");
var {Request} = require("../models/request");
var {Offer} = require("../models/offer");


//Middleware to redirect user if already logged in and trying to access 
//a view that is for logged out users
middlewareObj.ifUserLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        switch(req.user.kind){
            case "Buyer":
                res.redirect("/buyers/dashboard")
                break;
            case "Dealer":
                res.redirect("/dealers/dashboard")
        }
    } 
    else {
        return next();
    }
};


//Middleware to verify the buyer is logged in (Used specifically in the buyer routes)
middlewareObj.isBuyerLoggedIn = function(req, res, next){
    if(req.isAuthenticated() &&
       req.user.kind === "Buyer"){
        return next();
    }
    res.redirect("/buyers/login");
};


//Middleware to verify  the dealer is logged (Used specifically in dealer routes)
middlewareObj.isDealerLoggedIn = function(req, res, next){
    if(req.isAuthenticated() &&
       req.user.kind === "Dealer"){
        return next();
    }
    res.redirect("/dealers/login");
};

//Middleware to check user logged in status (Used specifically in the vehicle routes)
middlewareObj.isUserLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    else {
        res.redirect("/");
    }
};