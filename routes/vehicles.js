var express = require("express");
var router  = express.Router();
var {Vehicle} = require("../models/vehicle");
var {User} = require("../models/user");
var middleware = require("../middleware");


//New (RESTful) vehicle Route -to display new vehicle form (Caller: the buyerDashboard.ejs file)
router.get("/vehicles/new", middleware.isUserLoggedIn, function(req, res){
    res.render("vehicles/new");               
});


//Create (RESTful) route, uses POST request that saves the vehicle built (RESTful route CREATE)
router.post("/vehicles", middleware.isUserLoggedIn, function(req, res){ 
    User.findById(req.user._id, function(err, user){
    if(err){
        console.log(err);
        res.redirect("/buyers/landings");
    } else{
        //Get the vehicle JSON
        var vehicleJSON = JSON.parse(req.body.json);
        //Add the creator ID
        vehicleJSON.creatorID = req.user._id;
        //Add the creator type
        vehicleJSON.creatorType = req.user.kind;
        //Store the vehicle to database
        Vehicle.create(vehicleJSON, function(err, vehicle){
            if(err){
                console.log(err);
            } else{
                res.redirect("/vehicles");   
                    }
                });       
            }
        });     
    });


//Index (RESTful)Route used in the user dashboard to render vehicles index form view
router.get("/vehicles", middleware.isUserLoggedIn, function(req, res){
    res.render("vehicles/index");
});

//GET request to populate table with list of saved vehicles (Called by Ajax getJson  inside the vehicleIndex.js script file)
router.get("/vehicles/index/json/", middleware.isUserLoggedIn, function(req, res){
    if(req.xhr){
        //Get all vehicles saved by user
        Vehicle.find({ creatorID: req.user._id}, function (err, docs) {
        var vehicles = docs; 
        res.json({vehicles:docs});
        });
        } 
        else {        
            res.render("vehicles/new");
    };        
});

//Show route, (RESTful) from the public/vehicleIndex.js file
router.get("/vehicles/:id", middleware.isUserLoggedIn, function(req, res){
    var vehicle = {};
    vehicle.id = req.params.id;
    //Add make & model to object to allow vehicleShow script file to retrieve the relevant modelJSON file 
    vehicle.make = req.query.make.toLowerCase();
    vehicle.model = req.query.model.toLowerCase();
        res.render("vehicles/show", {vehicle:vehicle});
});


//Edit (RESTful) route called by the EDIT button in vehicles/show.ejs,renders the edit form
router.get("/vehicles/:id/edit", middleware.checkVehicleOwnership, function(req, res){
    var vehicle = {};
    vehicle.id = req.params.id;
    vehicle.make = req.query.make;
    vehicle.model = req.query.model;
        res.render("vehicles/edit", {vehicle:vehicle});

});

//Update (RESTful) POST request, replaces an existing vehicle from database after editing
router.put("/vehicles/:id", middleware.isUserLoggedIn, function(req, res){ 
    var vehicleJSON = JSON.parse(req.body.json);
    //Add vehicle ID to json
    vehicleJSON._id = req.params.id;
    //Add the creator ID
    vehicleJSON.creatorID = req.user.id;
    //Add the creator type
    vehicleJSON.creatorType = req.user.userType;
    //Find & Update the correct vehicle
    Vehicle.findByIdAndUpdate(req.params.id, vehicleJSON,{
        overwrite : true,
        new       : true
      }, function(err, updatedVehicle){
        if(err){
            console.log(err);
            } else {
            res.redirect("/vehicles");
            };
    });  
});


//Destroy (RESTFul) POST request that deletes vehicle
router.delete("/vehicles/:id", middleware.checkVehicleOwnership, function(req, res){
    //Use FindByIdAndRemove
    Vehicle.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err);            
        } else {
            res.redirect("/vehicles");
        }
    });
});



//GET request to retrieve specified vehicle document JSON from database, (This route is called multiple times from different views)
router.get("/vehicles/json/:id", middleware.isUserLoggedIn, function(req, res){
    if(req.xhr){
        //Get the vehicle selected by user
        Vehicle.findById({ _id: req.params.id}, function (err, docs) {
            var vehicle = docs;
        res.json({vehicle:vehicle});
            });
        } 
        else {        
            res.render("vehicles/index");
    };        
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