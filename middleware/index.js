
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


//Check user account Ownership
middlewareObj.checkUserAccountOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        User.findById(req.user._id, function(err, foundUser){
            if(err || !foundUser){
                req.flash("error", "User not found");
                    res.redirect("back");
            } else{
                if(foundUser._id.equals(req.user._id)){
                    next(); 
                } else {
                    //If not owner, flash message and redirect
                    req.flash("error", "You don't have permission to EDIT or DELETE this user account");
                    res.redirect("back");

                }
            }
        })
    }
};

//Check Vehicle Ownership
middlewareObj.checkVehicleOwnership = function(req, res, next){
    //Check if user is logged in
        if(req.isAuthenticated()){      
            Vehicle.findById(req.params.id, function(err, foundVehicle){
                if(err || !foundVehicle){
                    req.flash("error", "Vehicle not found");
                    res.redirect("back");
                } else {
                    //Check if user is the creator of the vehicle
                    if(foundVehicle.creatorID.equals(req.user._id)){
                        next();
                    } else {
                        //If not owner, flash message and redirect
                        req.flash("error", "You don't have permission to EDIT or DELETE this vehicle");
                        res.redirect("back");
                    }                
                }
            });
        } else {
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");;
    }
};


//Check Request Ownership
middlewareObj.checkRequestOwnership = function(req, res, next){
    //Check if user is logged in
        if(req.isAuthenticated()){      
            Request.findById(req.params.id, function(err, foundRequest){
                if(err || !foundRequest){
                    req.flash("error", "Request not found");
                    res.redirect("back");
                } else {
                    //Check if user is the creator of the request
                    if(foundRequest.buyer.equals(req.user._id)){
                        next();
                    } else {
                        //If not owner, flash message and redirect
                        req.flash("error", "You don't have permission to EDIT  this request");
                        res.redirect("back");
                    }                
                }
            });
        } else {
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");;
    }
};

//Check Offer Ownership
middlewareObj.checkOfferOwnership = function(req, res, next){
    //Check if user is logged in
        if(req.isAuthenticated()){  
            Offer.findById({_id: req.params.id}).
            populate({ path: 'request', 
                       model: 'Request',
                       populate:[{path:'buyer',
                                  model:'Buyer'},
                                 {path:'vehicle',
                                  model:'Vehicle'}] }).exec(function (err, foundOffer){
                    if(err){
                    // console.log(err);
                    res.redirect("back");
                    } else {
                        switch (req.user.kind) {
                            case 'Dealer':
                              if(foundOffer.dealer.equals(req.user._id)){
                                  next();
                              } else {
                                //If not owner, flash message and redirect
                                req.flash("error", "You don't have permission to EDIT  this Offer");
                                res.redirect("back");
                            } 

                              break;
                            case 'Buyer': 
                              if(foundOffer.request.buyer._id.equals(req.user._id)){
                                    next();
                                } else {
                                    //If not owner, flash message and redirect
                                    req.flash("error", "You don't have permission to ACCEPT this Offer");
                                    res.redirect("back");
                                } 
                                break;
                          }
                    }
                });
        } else {
            req.flash("error", "You need to be logged in to do that");
            res.redirect("back");;
    }
};




//Get the url for JSON files of models for make selected
middlewareObj.modelListJSON = function(make) {  
    return ("../src/assets/"+make+"/"+make+"Models.json")
};

//Get the data JSON file for make & model selected
middlewareObj.modelDataJSON = function(make, model, year){
    return ("../src/assets/"+make+"/"+model+year+".json")
};


module.exports = middlewareObj;