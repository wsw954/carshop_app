var express = require("express");
var router  = express.Router();
var passport = require("passport");
var {Request}= require("../models/request");
var {User} = require("../models/user");
var {Offer} = require("../models/offer");
var middleware = require("../middleware");
const middlewareObj = require("../middleware");
const { isUserLoggedIn } = require("../middleware");










//Get route for index of offers json, using a context variable and filters
router.get("/offers/index/json", middleware.isUserLoggedIn, function(req, res){
    if(req.xhr){
        switch (req.query.context){
            case 'Dealer':
                Offer.find({dealer: req.user._id}).
                populate('dealerVehicle').
                populate({ path: 'request', 
                           model: 'Request',
                           populate:[{path:'buyer',
                                      model:'Buyer'},
                                     {path:'vehicle',
                                      model:'Vehicle'}] }).exec(function (err, docs){
                    if(err){
                        console.log(err);
                        res.redirect("/dealers/landings");
                        } else {
                            var filteredArray =[];
                            var filterVar =JSON.parse(req.query.filter);            
                            switch (true) {
                                //Case (1) All 4 filters used (Make, Model, State & status))
                                case filterVar.make != 'false' &&
                                     filterVar.model != 'false' && 
                                     filterVar.state != 'false' &&
                                     filterVar.status.length > 0:
                                     filteredArray = docs.filter(function(result){
                                                        return (
                                                                result.dealerVehicle.make === filterVar.make && 
                                                                result.dealerVehicle.model === filterVar.model && 
                                                                result.request.buyer.state === filterVar.state &&
                                                                filterVar.status.indexOf(result.status) > -1)                        
                                                                });
                                    res.json({offerJSON:filteredArray});
                                    break;
                                //Case [2], 3 filters used (Make, model & state)     
                                case filterVar.make != 'false' &&
                                     filterVar.model != 'false' && 
                                     filterVar.state != 'false' &&
                                     filterVar.status.length === 0:
                                     filteredArray = docs.filter(function(result){
                                                        return (result.dealerVehicle.make ===filterVar.make &&
                                                                result.dealerVehicle.model === filterVar.model &&
                                                                result.request.buyer.state === filterVar.state) 
                                                });
                                    res.json({offerJSON:filteredArray})
                                    break;
                                //Case [3], 3 Filters used (Make, model & status)    
                                case filterVar.make != 'false' &&
                                     filterVar.model != 'false' && 
                                     filterVar.state === 'false'   &&
                                     filterVar.status.length > 0:
                                     filteredArray = docs.filter(function(result){
                                                        return (
                                                                result.dealerVehicle.make === filterVar.make && 
                                                                result.dealerVehicle.model === filterVar.model &&
                                                                filterVar.status.indexOf(result.status) > -1)                        
                                                                });
                                    res.json({offerJSON:filteredArray});                            
                                    break; 
                                //Case [4], 3 Filters used (Make, State  & status)        
                                case filterVar.make != 'false' &&
                                     filterVar.model === 'false' && 
                                     filterVar.state != 'false' &&
                                     filterVar.status.length > 0:                          
                                    filteredArray = docs.filter(function(result){
                                                        return (
                                                                result.dealerVehicle.make === filterVar.make && 
                                                                result.request.buyer.state === filterVar.state &&
                                                                filterVar.status.indexOf(result.status) > -1)                        
                                                                });
                                    res.json({offerJSON:filteredArray})
                                    break;
                                //Case [5], 2 Filters used (Make & State) 
                                case filterVar.make != 'false' &&
                                     filterVar.model === 'false' && 
                                     filterVar.state != 'false' &&
                                     filterVar.status.length === 0:
                                     filteredArray = docs.filter(function(result){
                                                        return (result.dealerVehicle.make === filterVar.make &&
                                                                result.request.buyer.state === filterVar.state)               
                                                });
                                    res.json({offerJSON:filteredArray})
                                    break;
                                //Case [6], 2 Filters used (Make & Model)    
                                case filterVar.make != 'false' &&
                                     filterVar.model != 'false' && 
                                     filterVar.state === 'false' &&
                                     filterVar.status.length === 0:
                                     filteredArray = docs.filter(function(result){
                                                       return (result.dealerVehicle.make === filterVar.make &&
                                                               result.dealerVehicle.model === filterVar.model) 
                                               });
                                   res.json({offerJSON:filteredArray})
                                   break;
                                //Case [7], 2 Filters used (State & Status)
                                case filterVar.make === 'false' &&
                                     filterVar.model ==='false' && 
                                     filterVar.state != 'false' &&
                                     filterVar.status.length > 0:
                                     filteredArray = docs.filter(function(result){
                                                        return (result.request.buyer.state === filterVar.state &&
                                                                filterVar.status.indexOf(result.status) > -1) 
                                                });
                                    res.json({offerJSON:filteredArray})
                                    break;
                                //Case [8], 2 Filters used (Make & Status)
                                case filterVar.make != 'false' &&
                                     filterVar.model ==='false' && 
                                     filterVar.state === 'false' &&
                                     filterVar.status.length > 0:
                                     filteredArray = docs.filter(function(result){
                                                        return (result.dealerVehicle.make === filterVar.make &&
                                                                filterVar.status.indexOf(result.status) > -1) 
                                                });
                                    res.json({offerJSON:filteredArray})
                                    break;
                                //Case [9], 1 Filter used (Make)                
                                case filterVar.make != 'false' &&
                                     filterVar.model ==='false' && 
                                     filterVar.state === 'false' &&
                                     filterVar.status.length === 0:
                                     filteredArray = docs.filter(function(result){
                                                        return (result.dealerVehicle.make === filterVar.make )
                                                            });
                                res.json({offerJSON:filteredArray})
                                break;
                                //Case [10], 1 Filter used (Status)
                                case filterVar.make === 'false' &&
                                     filterVar.model ==='false' && 
                                     filterVar.state === 'false' &&
                                     filterVar.status.length > 0:
                                     filteredArray = docs.filter(function(result){
                                                        return (
                                                                filterVar.status.indexOf(result.status) > -1)
                                                });
                                    res.json({offerJSON:filteredArray})
                                    break;
                                //Case [11] 1 Filter used (State)
                                case filterVar.make === 'false' &&
                                     filterVar.model ==='false' && 
                                     filterVar.state != 'false' &&
                                     filterVar.status.length === 0:
                                     filteredArray = docs.filter(function(result){
                                                       return (result.request.buyer.state === filterVar.state)
                                                               });
                                    res.json({offerJSON:filteredArray})
                                    break;
                                //Case [12] 0 Filters used 
                                case filterVar.make === 'false' &&
                                     filterVar.model ==='false' && 
                                     filterVar.state === 'false' &&
                                     filterVar.status.length === 0:
                                     filteredArray = docs;
                                   res.json({offerJSON:filteredArray})
                                   break;
                                };
                        }
                    });
                break;
            case 'Request':
                Offer.find({request: req.query.request}).
                populate('dealerVehicle').
                populate({ path: 'request', 
                           model: 'Request',
                           populate:[{path:'buyer',
                                      model:'Buyer'},
                                     {path:'vehicle',
                                      model:'Vehicle'}] }).exec(function (err, docs){
                    if(err){
                        console.log(err);
                        res.redirect("/buyers/landings");
                        } else {
                            var offers = docs;
                            res.json({offerJSON:offers});
                        }
                    });
                break;
            case 'compete_offer':
                Offer.find({request: req.query.request, _id:{$ne: req.query.offer}}).
                populate('dealerVehicle').
                populate({ path: 'request', 
                           model: 'Request',
                           populate:[{path:'buyer',
                                      model:'Buyer'},
                                     {path:'vehicle',
                                      model:'Vehicle'}] }).exec(function (err, docs){
                    if(err){
                        console.log(err);
                        res.redirect("/buyers/landings");
                        } else {
                            var offers = docs;
                            res.json({offerJSON:offers});
                        }
                    });
                break;
        }

    }
});


module.exports = router;