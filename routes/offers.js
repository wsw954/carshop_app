var express = require("express");
var router  = express.Router();
var passport = require("passport");
var {Request}= require("../models/request");
var {User} = require("../models/user");
var {Offer} = require("../models/offer");
var middleware = require("../middleware");
const middlewareObj = require("../middleware");
const { isUserLoggedIn } = require("../middleware");


//Index (RESTful) routes to the offers index view
router.get("/offers", middleware.isDealerLoggedIn, function(req, res){
    res.render("offers/index");
   
});

//New (RESTful) route renders the new Offer form (Called by Make Offer btn, inside dealer Inventory Table from the Request Index view)
router.get("/offers/new", middleware.isDealerLoggedIn, function(req, res){
    //Get the request ID for the new offer
    var request = {};
    request.id= req.query.request_id;
    request.offerVehicle=  req.query.dealer_vehicle;
        res.render("offers/new",{request:request});     
});

//Create (RESTful) route, saves a new offer 
router.post("/offers", middleware.isDealerLoggedIn, function(req, res){  
    User.findById(req.user._id, function(err, user){
    if(err){
        console.log(err);
        res.redirect("/dealers/landings");
    } else{
        //Get the offer JSON
        var offerJSON = JSON.parse(req.body.json);
        //Make status Active, since this is a New Offer
        offerJSON.status = "Active";
        //Create new offer in db
        Offer.create(offerJSON, function(err, offer){
            if(err){
                console.log(err);
            } else{    
                //Find the request this offer is matched to
                Request.findOneAndUpdate({
                    _id: offerJSON.request
                },{
                    //Add the offer ID to the offers array
                    $push : { offers : offer._id }
                }, function(err){
                    if (err) throw err
                    else
                    { 
                        //Redirect to the offers show view
                        res.redirect("/offers"); 
                    }
                });
                  
                }
            });  
        }
    });    
});

//SHOW (RESTFul)route handles the initial 
router.get("/offers/:id", middleware.isUserLoggedIn, function(req, res){  
    var offer = req.params.id;
    res.render("offers/show", {offer:offer});
});

//EDIT (RESTFul) Show edit form for Offer
router.get("/offers/:id/edit", middleware.checkOfferOwnership, function(req, res){  
    var offer = req.params.id;
    res.render("offers/edit", {offer:offer});
});

//Update (RESTFul)  offers  PUT  route
router.put("/offers/:id", middleware.checkOfferOwnership, function(req, res, next){
    var json = JSON.parse(req.body.json);
        switch (json.action) {
            case 'Accept':
                //Change status of all non-accepted Offers to "Close"
                Offer.updateMany({_id: {$ne: req.params.id},request:json.request},{ status: "Closed"}, function(err, offerFound){
                    if(err){
                        console.log(err);            
                    } else {
                //Change status of Accepted Offer
                Offer.findByIdAndUpdate(req.params.id,{ status: "Accepted"}, function(err, offerFound){
                    if(err){
                        console.log(err);            
                    } else {
                        //Change status of Request
                        Request.findByIdAndUpdate({_id:offerFound.request}, {status:"Accepted"}, function(err, requestFound){
                            if(err){
                                console.log(err);            
                            } else {
                                res.redirect("/requests/"+offerFound.request);
                                    }
                                });   
                            }
                         });   
                    }
                });       
            break;
            case 'Edit':
                Offer.findByIdAndUpdate(req.params.id,{ $set: { dealerVehicle: json.offer.dealerVehicle, monthlyPayment:json.offer.monthlyPayment, totalPayment:json.offer.totalPayment }}, function(err, offerFound){
                    if(err){
                        console.log(err);            
                    } else {
                        res.redirect('/offers/'+req.params.id);   
                    }
                }); 
            break;
        }
});

//Destroy (RESTFul) route deletes Offer
router.delete("/offers/:id", middleware.checkOfferOwnership, function(req, res){
    var json = JSON.parse(req.body.json);
            //First, find the request and remove from offers array, this offer
            Request.findByIdAndUpdate(json.requestID, { $pullAll: {offers: [req.params.id]}}, { new: true },function(err, requestFound){
                if(err){
                    console.log(err);            
                } else {
                    //Next, delete the offer
                    Offer.findByIdAndRemove(req.params.id, function(err){
                        if(err){
                            console.log(err);            
                        } else {
                            res.redirect("/offers");
                        }
                    })
                }
            });   
});

//Retrieve json of a single offer doc from db
router.get("/offers/json/:id", middleware.isUserLoggedIn, function(req, res){ 
    if(req.xhr){
        Offer.findById({_id: req.params.id}).
        populate('dealerVehicle').
        populate({ path: 'request', 
                   model: 'Request',
                   populate:[{path:'buyer',
                              model:'Buyer'},
                             {path:'vehicle',
                              model:'Vehicle'}] }).exec(function (err, docs){
                if(err){
                console.log(err);
                res.redirect("/vehicles");
                } else {
                    var offer = docs;
                    res.json({offer:offer});
                }
            }); 
    } else {
        res.redirect("/vehicles");
    }
});



//Retrieve json of index of offers docs, from db using variables and filters
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
                                res.json({offerJSON:filteredArray});
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