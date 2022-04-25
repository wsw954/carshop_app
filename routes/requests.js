var express = require("express");
var router  = express.Router();
var passport = require("passport");
var {Vehicle} = require("../models/vehicle");
var {User} = require("../models/user");
var {Request}= require("../models/request");
var {Offer}= require("../models/offer");
var middleware = require("../middleware");


//New (RESTful) route to render new Request form
router.get("/requests/new", middleware.isBuyerLoggedIn, function(req, res){
    var vehicle_id = req.query.vehicle;
    res.render("requests/new", {vehicle_id:vehicle_id});
});


//Create (RESTful) route, saves a new request 
router.post("/requests", middleware.isUserLoggedIn, function(req, res){ 
    User.findById(req.user._id, function(err, user){
    if(err){
        console.log(err);
        res.redirect("/buyers/landings");
    } else{
        //Get the request JSON
        var requestJSON = JSON.parse(req.body.json);
        //Make status Active, since this is a new request
        requestJSON.status = "Active";
        //Store the vehicle to database
        Request.create(requestJSON, function(err, request){
            if(err){
                console.log(err);
            } else{
                res.redirect("/requests");   
                }
            });       
        }
    });     
});

//SHOW (RESTful) route to render the request show view
router.get("/requests/:id", middleware.isUserLoggedIn, function(req, res){
    var request = req.params.id;
    res.render("requests/show",{request:request});
});


//Index (RESTful) route that handles click on Requests link in dealerDashboard 
router.get("/requests", middleware.isUserLoggedIn, function(req, res){
    res.render("requests/index"); 
});




 //Route to retrieve json index of Requests, depending on kind of user & filters
 router.get("/requests/index/json", middleware.isUserLoggedIn, function(req, res){
    if(req.xhr){
       switch (req.user.kind) {
           case 'Buyer':
               Request.find({buyer:req.user._id,status: {$ne:"Cancelled"}}).
               populate('vehicle').
               populate('buyer').
               populate('offers').
               exec(function (err, docs){
                   if(err){
                       console.log(err);
                       res.redirect("buyers/landings");  
                   } else {
                       res.json({requests:docs});
                   }
               });
             break;
           case 'Dealer':
               //Find all Active requests
               Request.find({status:"Active"}).
               populate('vehicle').
               populate('buyer').
               populate('offers').
               exec(function (err, docs) {
                   if(err){
                       console.log(err);
                       res.redirect("/dealers/landings");
                   } else{ 
                       var filteredArray =[];
                       var filterVar ={make:req.query.make,
                                       model:req.query.model,
                                       state:req.query.state,
                                       noPendingOffer:req.query.noPendingOffer};
                       switch (true) {
                           //Case (1) All 4 filters used (Make, Model, State & noPendingOffer))
                           case filterVar.make != 'false' &&
                               filterVar.model != 'false' && 
                               filterVar.state != 'false' &&
                               filterVar.noPendingOffer != 'false':
                               filteredArray = docs.filter(function(result){
                                                   return (
                                                           result.vehicle.make === filterVar.make && 
                                                           result.vehicle.model === filterVar.model && 
                                                           result.buyer.state === filterVar.state &&
                                                           result.offers.length === 0);                        
                                                           });
                               res.json({requests:filteredArray});
                               break;
                           //Case [2], 3 filters used (Make, model & state)     
                           case filterVar.make != 'false' &&
                               filterVar.model != 'false' && 
                               filterVar.state != 'false' &&
                               filterVar.noPendingOffer === 'false':
                               filteredArray = docs.filter(function(result){
                                                   return (result.vehicle.make ===filterVar.make &&
                                                           result.vehicle.model === filterVar.model &&
                                                           result.buyer.state === filterVar.state &&
                                                           result.offers.length === 0) 
                                                           ||
                                                           (result.vehicle.make === filterVar.make &&
                                                           result.vehicle.model === filterVar.model &&
                                                           result.buyer.state === filterVar.state &&
                                                           result.offers.length > 0 &&
                                                           result.offers.filter(e => JSON.stringify(e.dealer) === JSON.stringify(req.user._id)).length === 0)
                                           });
                               res.json({requests:filteredArray})
                               break;
                           //Case [3], 3 Filters used (Make, model & noPendingOffer)    
                           case filterVar.make != 'false' &&
                               filterVar.model != 'false' && 
                               filterVar.state === 'false' &&
                               filterVar.noPendingOffer === 'true':
                               filteredArray = docs.filter(function(result){
                                                   return (
                                                           result.vehicle.make === filterVar.make && 
                                                           result.vehicle.model === filterVar.model &&
                                                           result.offers.length === 0);                        
                                                           });
                               res.json({requests:filteredArray})                            
                               break; 
                           //Case [4], 3 Filters used (Make, State  & noPendingOffer)        
                           case filterVar.make != 'false' &&
                               filterVar.model === 'false' && 
                               filterVar.state != 'false' &&
                               filterVar.noPendingOffer === 'true':                           
                               filteredArray = docs.filter(function(result){
                                                   return (
                                                           result.vehicle.make === filterVar.make && 
                                                           result.buyer.state === filterVar.state &&
                                                           result.offers.length === 0);                        
                                                           });
                               res.json({requests:filteredArray})
                               break;
                           //Case [5], 2 Filters used (Make & State) 
                           case filterVar.make != 'false' &&
                               filterVar.model === 'false' && 
                               filterVar.state != 'false' &&
                               filterVar.noPendingOffer === 'false':
                               filteredArray = docs.filter(function(result){
                                                   return (result.vehicle.make === filterVar.make &&
                                                           result.buyer.state === filterVar.state &&
                                                           result.offers.length === 0) 
                                                           ||
                                                           (result.vehicle.make === filterVar.make &&
                                                           result.buyer.state === filterVar.state &&
                                                           result.offers.length > 0 &&
                                                           result.offers.filter(e => JSON.stringify(e.dealer) === JSON.stringify(req.user._id)).length === 0)
                                           });
                               res.json({requests:filteredArray})
                               break;
                           //Case [6], 2 Filters used (Make & Model)    
                           case filterVar.make != 'false' &&
                               filterVar.model != 'false' && 
                               filterVar.state === 'false' &&
                               filterVar.noPendingOffer === 'false':
                               filteredArray = docs.filter(function(result){
                                               return (result.vehicle.make === filterVar.make &&
                                                       result.vehicle.model === filterVar.model &&
                                                       result.offers.length === 0) 
                                                       ||
                                                       (result.vehicle.make === filterVar.make &&
                                                           result.vehicle.model === filterVar.model &&
                                                           result.offers.length > 0 &&
                                                           result.offers.filter(e => JSON.stringify(e.dealer) === JSON.stringify(req.user._id)).length === 0)
                                       });
                           res.json({requests:filteredArray})
                           break;
                           //Case [7], 2 Filters used (State & noPendingOffer)
                           case filterVar.make === 'false' &&
                               filterVar.model ==='false' && 
                               filterVar.state != 'false' &&
                               filterVar.noPendingOffer === 'true':
                               filteredArray = docs.filter(function(result){
                                                   return (result.buyer.state === filterVar.state &&
                                                           result.offers.length === 0) 
                                           });
                               res.json({requests:filteredArray})
                               break;
                           //Case [8], 2 Filters used (Make & noPendingOffer)
                           case filterVar.make != 'false' &&
                               filterVar.model ==='false' && 
                               filterVar.state === 'false' &&
                               filterVar.noPendingOffer === 'true':
                               filteredArray = docs.filter(function(result){
                                                   return (result.vehicle.make === filterVar.make &&
                                                           result.offers.length === 0) 
                                           });
                               res.json({requests:filteredArray})
                               break;
                           //Case [9], 1 Filter used (Make)                
                           case filterVar.make != 'false' &&
                               filterVar.model ==='false' && 
                               filterVar.state === 'false' &&
                               filterVar.noPendingOffer === 'false':
                               filteredArray = docs.filter(function(result){
                                                   return (result.vehicle.make === filterVar.make &&
                                                           result.offers.length === 0)
                                                           ||
                                                           (result.vehicle.make === filterVar.make &&
                                                           result.offers.length > 0 &&
                                                           result.offers.filter(e => JSON.stringify(e.dealer) === JSON.stringify(req.user._id)).length === 0)
                                           });
                           res.json({requests:filteredArray})
                           break;
                           //Case [10], 1 Filter used (noPendingOffer)
                           case filterVar.make === 'false' &&
                               filterVar.model ==='false' && 
                               filterVar.state === 'false' &&
                               filterVar.noPendingOffer === 'true':
                               filteredArray = docs.filter(function(result){
                                                   return (
                                                           result.offers.length === 0)
                                           });
                               res.json({requests:filteredArray})
                               break;
                           //Case [11] 1 Filter used (State)
                           case filterVar.make === 'false' &&
                               filterVar.model ==='false' && 
                               filterVar.state != 'false' &&
                               filterVar.noPendingOffer === 'false':
                               filteredArray = docs.filter(function(result){
                                               return (result.buyer.state === filterVar.state&&
                                                       result.offers.length === 0)
                                                       ||
                                                       (result.buyer.state === filterVar.state &&
                                                       result.offers.length > 0 &&
                                                       result.offers.filter(e => JSON.stringify(e.dealer) === JSON.stringify(req.user._id)).length === 0)
                                       });
                               res.json({requests:filteredArray})
                               break;
                           //Case [12] 0 Filters used 
                           case filterVar.make === 'false' &&
                               filterVar.model ==='false' && 
                               filterVar.state === 'false' &&
                               filterVar.noPendingOffer === 'false':
                               filteredArray = docs.filter(function(result){
                                               return (result.offers.length === 0)
                                                       ||
                                                       (result.offers.length > 0 &&
                                                       result.offers.filter(e => JSON.stringify(e.dealer) === JSON.stringify(req.user._id)).length === 0)
                                       });
                           res.json({requests:filteredArray})
                           break;
                                       }
                           }
                   });
                       break;            
               }
    }
  
});


module.exports = router;