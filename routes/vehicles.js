var express = require("express");
var router  = express.Router();
var {Vehicle} = require("../models/vehicle");
var {User} = require("../models/user");
var middleware = require("../middleware");


//New (RESTful) vehicle Route -to display new vehicle form (Caller: the buyerDashboard.ejs file)
router.get("/vehicles/new", middleware.isUserLoggedIn, function(req, res){
    res.render("vehicles/new");               
});

//GET request to populate Make dropdown menu (Called  in vehicleNew.js script file)
router.get("/src/assets/make", middleware.isUserLoggedIn, function(req, res){
    var data = require("../src/assets/make");
    if(req.xhr){
        res.json(data);
    } else {        
        res.render("vehicles/new");
    }        
});

//GET request used to populate Model dropdown menus. (Called in vehicleNew.js script file)
router.get("/vehicles/models/:make/", middleware.isUserLoggedIn, function(req, res){
    var make = req.params.make;       
    var jsonUrl = middleware.modelListJSON(make);        
    var dataJSON = require(jsonUrl);                      
            if(req.xhr){                    
                res.json(dataJSON);
            } else {        
                res.render("vehicles/new");
            }        
        });

//Get request used to retrieve the model specific data from src file, needed to build new vehicle of specified model
// (Called by the model specific script file)        
router.get("/vehicles/src/json/:make/:model", middleware.isUserLoggedIn, function(req, res){ 
    var make = req.params.make;
    var model = req.params.model;
    var modelDataJSON = require(middleware.modelDataJSON(make, model));
    if(req.xhr){
        res.json(modelDataJSON);   
    } 
    else {        
        res.render("vehicles/make");
    }        
});



module.exports = router;