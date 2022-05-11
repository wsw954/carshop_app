$(document).ready(function() {
//Initiate global variables 
var offerJSON = {};
var requestVehicleJSON ={};
var offerVehicleJSON = {};
//Get the offer ID
var offerID = $("h4[id='offerID']").attr("data-value");
//Get user ID
var userID = $("input[id='userID']").val();
//Get the username of dealer
var dealerName = $("#userName").text().slice(-9);
//Get user kind
var userKind = $("#userKind").val();
//Create URL for json of Offer to be shown 
var jsonOffersUrl = "/offers/json/"+ offerID;
//Create URL for competing Offers
var jsonCompeteOffersUrl = "/offers/index/json";
//Initiate object which must be passed to offers index query
var indexObj = {};
//Create array of vehicles being offered in each competing Offer
var otherVehiclesInOffers = [];

    //Get the json for the Offer on view
    $.getJSON(jsonOffersUrl, function(data){
        //Assign value to global variables
        offerJSON = data;
        //Assign value to the request vehicle
        requestVehicleJSON = offerJSON.offer.request.vehicle;
        //Assign value to the offer vehicle
        offerVehicleJSON = offerJSON.offer.dealerVehicle;
        //Call helper function to load basic & detail data for req vehicle & offer vehicle
        displayVehicleInfo("request", requestVehicleJSON);
        displayVehicleInfo("offer", offerVehicleJSON);
        displayOfferDetails(offerJSON.offer.request);
        //Assign value for data object passed to the offers index route
        indexObj= {context:'compete_offer', request:offerJSON.offer.request._id, offer:offerJSON.offer._id};
            }).done(function(data){
                //Get all Competing Offers for the Offer being viewed
                $.getJSON(jsonCompeteOffersUrl, indexObj, function(competeOffers){
                    //Call function that updates the vehiclesInOffers
                    // getOtherVehiclesInOffers(competeOffers.offerJSON);
                    //Create table for Other Offers (Competing Offers)
                    // createCompeteOfferTable(competeOffers.offerJSON);
                    //Check for type of User
                    switch (userKind) {
                        case 'Buyer':
                    //Hide the dealerName li from Buyer
                    $('li[id=dealerName').hide();
                    //Call function to allow buyer to Accept Offer  
                        // displayAcceptOffer();
                        break;
                        case 'Dealer':
                        if(offerJSON.offer.status === 'Active'){
                            $("#inv-div").show();
                            // getDealerInfo();
                            if(offerJSON.offer.dealer === userID){
                                // displayEditOffer();
                                    } 
                                }
                        break;  
                    };
                })
            });


//Helper function to display vehicle  basic info
function displayVehicleInfo(card, vehicle){
    //Display vehicle Base Info
    $("#"+card+"Make").text("Make: "+vehicle.make);
    $("#"+card+"Model").text("Model: "+vehicle.model);;
    $("#"+card+"Year").text("Year: "+vehicle.year);
    $("#"+card+"MSRP").text("MSRP: "+vehicle.msrp);
    getModelData(card,vehicle);
  }; 

//Helper function to display vehicle details
function getModelData(card, vehicle){
    //Create url to retrieve model data from db
    var jsonUrlModelData = "/vehicles/src/json/"+vehicle.make+"/"+vehicle.model+"/"+vehicle.year;
    var modelData = {};
   //Retrieve from src folder, the model data
    $.getJSON(jsonUrlModelData, function(data){
      modelData = data;
      //Display the vehicle trim
      displayModelTrim(card, modelData, vehicle);
      //Create a detail template
      createDetailTemplate(card, modelData);
      //Add vehicle details info to the specified card (request & offer vehicle)
      loadVehicleDetails(card,vehicle,modelData);
    });
  };


     //Helper function to display model trim inside the specified card
     function displayModelTrim(card, modelData, vehicle){
        var trimData = modelData.data.trim.choices.filter(trim =>
                    trim.serial === vehicle.details[0]);
        var trimLi = '<li class="list-group-item" id="'+card+'-trim"><strong>Trim: </strong>'+trimData[0].name+'</li>';
        //Replace trim li with 
        $("#"+card+"-trim").replaceWith(trimLi).text(trimData[0].name);
       };


    //Helper function to create template in details card
    function createDetailTemplate(card, modelData){
        var singleElement = '<li class="list-group-item"><strong></strong></li>';
        var multipleElement =  '<li class="list-group-item">'+
                                    '<strong></strong>'+
                                '<ul class="list-group">'+
                                    '</ul>'+
                                '</li>';
                            
        //Reset template
        $("#"+card+"-ul").children().not(':first').remove(); 
        //Iterate through the model data group of options                       
        $.each(modelData.data.options, function(index, value){
            switch (value.type) {
                case "Single":
                    //Add a <li> for each option for this vehicle model
                    $("#"+card+"-ul").append($(singleElement).attr({"id":card+"-"+value.name}));
                    $("#"+card+"-"+value.name).find('strong').text(value.label+': ');  
                break;
                case "Multiple":
                    //Add li element w/ nested ul for each individual option for the option group
                    $("#"+card+"-ul").append($(multipleElement).attr({"id":card+"-"+value.name}));
                    $("#"+card+"-"+value.name).find('strong').text(value.label+': ')
                    break;
            } 
        }); 
    };

    //Helper function to load vehicle details data into template
    function loadVehicleDetails(card, vehicle, modelData){
            $.each(modelData.data.options, function(index, optionValue){
            //Iterate through the details array, excluding the first property, since this is always the vehicle 'trim'
                $.each(vehicle.details.slice(1), function(index, value){
                //Iterate through the choices possible for the option group
                    $.each(optionValue.choices, function(index, choice){
                        //Check if the choice serial matches the serial from the details array
                        if(choice.serial === value){
                            switch (optionValue.type){
                                case 'Single':
                                    $("#"+card+"-"+optionValue.name).append(choice.name);
                                    // $("#"+card+"-"+optionValue.name).text(choice.name);
                                    break;
                                case 'Multiple':
                                    $("#"+card+"-"+optionValue.name).find('ul').append('<li class="list-group-item">'+choice.name+'</li>');
                            }
                        }                    
                    })
                  });
                })
              };


    //Helper function to display the Offer details card
    function displayOfferDetails(request){
        //Display the request ID for which this Offer is matched
        $("#requestID").text("Request ID- "+offerJSON.offer.request._id);
        //Display offer Status
        $("#status").text(" Offer Status: "+offerJSON.offer.status); 
        //Display Matching Offers
        $("#matchingOffers").text("Total Matching Offers: "+offerJSON.offer.request.offers.length);
      //Display Purchase Type details
      switch (request.purchaseType) {
        case 'Cash':
            //Add List item for Purchase Type
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item', 'id':'purchase-type-li', 'text':"Purchase Type:Cash", 'data-type':request.purchaseType})));
            //Add List item for Total Payment
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item', 'id':'total-payment-li', 'text':"Total Payment $"+offerJSON.offer.totalPayment, 'data-type':offerJSON.offer.totalPayment})));
            break;
          case 'Finance':
            //Add List item for Purchase Type
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item','id':'purchase-type-li','text':"Purchase Type: Finance", 'data-type':request.purchaseType})));
            //Add list item for Down Payment
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item',
            'id':'down-pymt-li','data-value':request.downPayment,'text':"Down Payment: $"+request.downPayment})));
            //Add list item for Number of Months
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item',
            'id':'no-mths-li','data-value':request.numberOfMonths,'text':"Number of Months: "+request.numberOfMonths})));
            //Add list item for Monthly Payment
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item',
            'id':'monthly-payment-li','data-value':offerJSON.offer.monthlyPayment,'text':"Monthly Payment: $"+offerJSON.offer.monthlyPayment})));
            //Add List item for Total Payment (Hidden)
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item hidden', 'id':'total-payment-li', 'text':"Total Payment $"+offerJSON.offer.totalPayment, 'data-type':offerJSON.offer.totalPayment})));
            break;
          case 'Lease':
            //Add List item for Purchase Type
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item','id':'purchase-type-li','text':"Purchase Type: Lease", 'data-type':request.purchaseType})));
            //Add list item for Down Payment
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item','id':'down-pymt-li','data-value':request.downPayment,'text':"Down Payment: $"+request.downPayment})));
            //Add list item for Lease Term
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item','id':'lease-term-li','data-value':request.leaseTerm,'text':"Lease Term (Months): "+request.leaseTerm})));
            //Add list item for Annual Mileage
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item','id':'annual-mileage-li','data-value':request.annualMileage,'text':"Annual Mileage: "+request.annualMileage})));
            //Show Monthly Payment div
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item',
            'id':'monthly-payment-li','data-value':offerJSON.offer.monthlyPayment,'text':"Monthly Payment: $"+offerJSON.offer.monthlyPayment})));
            //Add List item for Total Payment (Hidden)
            $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item hidden', 'id':'total-payment-li', 'text':"Total Payment $"+offerJSON.offer.totalPayment, 'data-type':offerJSON.offer.totalPayment})));
            break;
      }
    };








});