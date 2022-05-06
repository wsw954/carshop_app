$(document).ready(function() {

    //Initiate global variables 
    var requestVehicleJSON = {};
    var offerVehicleJSON ={};
    //Get user ID
    var userID = $("input[id='userID']").val();
    //Get the dealer name
    var dealerName = $("#dealerName").text().slice(-10);
    //Get the request ID
    var requestID = $("#requestID").attr("data-value");
    //Initiate requestJSON variable
    var requestJSON = {};
    //Get the offer vehicle ID
    var offerVehicleID = $("#offerVehicle").attr("data-value");
    //Create URL for Offers index json
    var jsonOffersUrl = "/offers/index/json";
    //Create array of vehicles being offered in each competing Offer
    var otherVehiclesInOffers = [];
    //Initiate object which must be passed to offers index query
    var indexObj = {};


    //Retrieve the json files for both the request & the offer vehicle
    $.when(
        //Retrieve the request JSON
        $.getJSON("/requests/json/"+requestID),
        //Retrieve the offer vehicle JSON
        $.getJSON("/vehicles/json/"+offerVehicleID)
            ).done(function(request, offerVehicle) {
                //Assign value to global variable for requestJSON
                requestJSON = request;
                //Assign the value to global variable for the request vehicle
                requestVehicleJSON = request[0].request.vehicle;
                //Assign value to the global varible for the offer vehicle
                offerVehicleJSON = offerVehicle[0].vehicle;
                //Call helper function to load basic & detail data for req vehicle & offer vehicle
                displayVehicleInfo("request", requestVehicleJSON);
                console.log(requestVehicleJSON)
                displayVehicleInfo("offer", offerVehicleJSON);
                //Display Request info
                displayRequestDetails(request[0].request); 
                //Display Offer vehicle base info
                // displayOfferVehicle(offerVehicleJSON);
                //Assign value for data object to retrieve ALL offers for specified Request
                indexObj= {context:'Request', request:requestID};
                //Get all Competing Offers for the Offer being viewed
                $.getJSON(jsonOffersUrl, indexObj, function(allOffers){
                        //Create table for Competing Offers
                        // createCompeteOfferTable(allOffers.offerJSON);
                        //Call function that updates the therVehiclesInOffers array
                        // getOtherVehiclesInOffers(allOffers.offerJSON);
                    }).done(function(data){
                        //Get dealer info & create inventory table
                        // getDealerInfo();
                    })
    });

//Helper function to display vehicle info
function displayVehicleInfo(card, vehicle){
  //Display vehicle Base Info
  $("#"+card+"Make").text("Make: "+vehicle.make);
  $("#"+card+"Model").text("Make: "+vehicle.model);;
  $("#"+card+"Year").text("Make: "+vehicle.year);
  $("#"+card+"MSRP").text("Make: "+vehicle.msrp);
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
    createDetailTemplate(card, modelData);
    //Get trim data
    var trimData = modelData.data.trim.choices.filter(trim =>
                trim.serial === vehicle.details[0]);
    //Add trim name details card
    $("#"+card+"-trim").append(trimData[0].name);
    //Add vehicle details to each card (request & offer vehicle)
    loadVehicleDetails(card,vehicle,modelData);
  })
};

    //Helper function to create template in details card
    function createDetailTemplate(card, modelData){
      var singleElement = '<li class="list-group-item"><strong></strong></li>';
      var multipleElement =  '<li class="list-group-item">'+
                                  '<strong></strong>'+
                              '<ul class="list-group">'+
                                  '</ul>'+
                              '</li>';
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
                              break;
                          case 'Multiple':
                              $("#"+card+"-"+optionValue.name).find('ul').append('<li class="list-group-item">'+choice.name+'</li>');
                      }
                  }                    
              })
            });
          })
        };


  


//Helper function to build the request detail card
function displayRequestDetails(request){
  switch (request.purchaseType) {
    case 'Cash':
        //Select the offerDetails card;
        $('div[id="paymentDetails"]').append($('<ul>', {'class':"list-group"}).append($('<li>', {'class':'list-group-item', 'id':'purchase-type-li', 'text':"Purchase Type:Cash", 'data-type':request.purchaseType})));
        //Show Total Payment div
        $('div[id="total-payment"]').show();
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
        //Show Monthly Payment div
        $('div[id="monthly-payment"]').show();
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
        $('div[id="monthly-payment"]').show();
        break;
      default:
        console.log("default url");
  }
};


    //Helper function to display Offer Vehicle
    function displayOfferVehicle(vehicle){
        $("#offerMake").text("Make: "+vehicle.make);
            $("#offerModel").text("Model: "+vehicle.model);
            $("#offerMSRP").text("MSRP: $"+vehicle.msrp);
                //Check if the offer vehicle is same model as request vehicle
                if(offerVehicleJSON.model != requestVehicleJSON.model){
                    var offerMake = vehicle.make.toLowerCase();
                    var offerModel= vehicle.model.toLowerCase();
                    $("#offerVehicleDetails").empty();
                    //Append the relevant model script file to the html file
                    $("body").append($('<script></script>').attr({"id":vehicle.model,"type": "text/javascript", "src": "/"+offerMake+"/"+offerModel+"Show.js"}));
                    };  
            };

    
    //Helper function to create array of the vehicles in competing Offers
    function getOtherVehiclesInOffers(offers){
        $.each(offers, function(index, value){
            //If this dealer has another Offer in this list of competing Offers ;
            if(value.dealer === userID){
                //Get the vehicle ID
                var vehicleInOffer = value.dealerVehicle._id;
                //Get the offer ID
                var offerID = value._id.slice(value._id.length - 7);
                var offerInfo = {vehicle:vehicleInOffer, offer:offerID}
                //Add this Offer info to the array of otherVehicleOffers
                otherVehiclesInOffers.push(offerInfo);
            }
        })
    };




          //Add table to display matching offers for this request
          function createCompeteOfferTable(data){
            $("#offer-div").show();
            //Get the request ID
            $("#offer_select").on('click', function(){
              //Create url to get all offers for this request
              var jsonUrl = "/offers/index/json";
              //Build table of request offers
              table = $('#offer-table').DataTable({
                    destroy: true,
                    dom: 'Bfrtip', 
                    //Pass array of vehicle objects  
                    data: data,
                  //set up table columns
                  columns: [
                    {"data": null, defaultContent: ""},
                    {"data": "_id", title: "Offer ID"},
                    {"data":"dealer", title:"Dealer",
                    "render":function(data){
                      if(data === userID){
                        return dealerName;
                      } else {
                        return "Other Dealer"
                      }
                    }},
                    {"data": "dealerVehicle.make", title: "Make"},
                    {"data": "dealerVehicle.model", title: "Model"},
                    {"data":"dealerVehicle.msrp", title:"MSRP"},
                    {"data": "monthlyPayment", title: "Monthly Payment"},
                    {"data": "totalPayment", title: "Total Payment"},
                    {"data": "status", title: "Offer Status"}
                    ],
                  createdRow: function(row, data, index){
                      //Add offer ID attr to each row
                      $(row).attr('id', data._id);  
                  },      
                    columnDefs: [ {
                        orderable: false,
                        className: 'select-checkbox',
                        targets:   0, 
                    } ],
                    select: {
                        style:    'os',
                        selector: 'td:first-child'
                    },
                    order: [[ 4, 'asc' ]],
                    oLanguage: {
                      "sEmptyTable": "Sorry,there are no Offers yet for this Request"
                  },
                  buttons: [
                    {
                        text: 'Select',
                        action: function () {
                          //Verify buyer has selected an offer from offer table
                          if(table.rows( { selected: true } ).data().length === 0){
                            $("#errorMessage").text("You must select an Offer");
                            //Show error pop up modal to inform buyer to select an offer
                            $("#errorModal").modal('show');
                          } else {
                            //Get the dealer vehicle ID 
                            var offerID = table.rows( { selected: true } ).data()[0]._id;
                            //Render the offer show view 
                            window.location.href = '/offers/'+offerID
                          }
                        }
                    }
                ], 
              })
            })
          }; 



        //Helper function create dealer table that has matched offers to vehicles
        function getDealerInfo(){
            //Create URL for dealer json of dealer vehicle inventory
            var jsonVehiclesUrl = "/vehicles/index/json/";
            //Create URL for dealer json of offers
            var jsonOffersUrl = "/offers/index/json";
            //Create filter variable for offers/index route
            var filter ={make:'false',
                         model:'false',
                         state:'false',
                         status:[]}
              var dataArray = [];
              $.when(
                  $.getJSON(jsonVehiclesUrl),
                  $.getJSON(jsonOffersUrl, {context:"Dealer", filter:JSON.stringify(filter)})
              ).done(function(vehiclesJSON, offersJSON) {
                //First, filter out from the vehicle inventory, the vehicle currently referenced in Offer being Edited
                var vehiclesFilteredJSON = vehiclesJSON[0].vehicles.filter(function(result){
                  return result._id != offerVehicleJSON._id
                });
                //Iterate through list of vehicles add new field (offers), which is a number of offers the vehicle is enrolled in
                  $.each(vehiclesFilteredJSON, function(index, vehicle){
                      vehicle.offers =[];
                      $.each(offersJSON[0].offerJSON, function(index,offer){
                        //If the vehicle is enrolled in offer, then add id to the vehicle.offers array
                          if(offer.dealerVehicle._id === vehicle._id){
                              vehicle.offers.push(offer._id)
                          }
                      })
                      dataArray.push(vehicle);        
                  });
                  createDealerInvTable(dataArray);
              });    
          };  

          //Helper function to build dealer inventory table
          function createDealerInvTable(dataArray){
            invTable = $('#dealer-inv-table').DataTable({
                  //Pass array of vehicle objects  
                  data: dataArray,
                  autoWidth: false,
                  destroy: true,
                  dom: 'Bfrtip',   
                //set up table columns
                columns: [
                  {"data": null, defaultContent: ""},
                  {"data": "make", title: "Make"},
                  {"data": "model", title: "Model"},
                  {"data": "msrp", title: "MSRP"},
                  {"data":"offers.length", title:"Active Offers Vehicle Enrolled"}
                  ],
                createdRow: function(row, data, index){
                    //Add ID attr to each row
                    $(row).attr('id', data._id);  
                },      
                  columnDefs: [ {
                      orderable: false,
                      className: 'select-checkbox',
                      targets:   0, 
                  } ],
                  select: {
                      style:    'os',
                      selector: 'td:first-child'
                  },
                  order: [[ 3, 'asc' ]],
                  oLanguage: {
                    "sEmptyTable": "You currently don't have any Vehicles saved to your Inventory"
                  },
                  buttons: [
                    {
                        text: 'Change Vehicle in Offer',
                        action: function () {
                           //Verify dealer has selected a vehicle from inventory
                            if(invTable.rows( { selected: true } ).data().length === 0){
                                $("#errorMessage").text("You must select a vehicle"); 
                                //Show error pop up modal to inform dealer to select a vehicle
                                $("#errorModal").modal('show')
                            } else {
                                //Get the dealer vehicle ID 
                                var dealerVehicle = invTable.rows( { selected: true } ).data()[0]._id;
                                //Check vehicle eligibility
                                if(checkEligibility(dealerVehicle)){
                                        //Get vehicle JSON
                                        $.getJSON("/vehicles/json/"+dealerVehicle, function(newVehicle){
                                            //Reassign  new value to the global variable for the offer vehicle
                                            offerVehicleJSON = newVehicle.vehicle;
                                            //Call helper function to display the new vehicle chosen
                                            displayOfferVehicle(newVehicle.vehicle);
                                            //Call function to update the vehicle inventory after vehicle is changed
                                            getDealerInfo();
                                            //Reset the payment variables
                                            switch (requestJSON.purchaseType) {
                                                case 'Cash':
                                                    $('input[id="total-payment-input"]').val(newVehicle.vehicle.msrp);
                                                break;
                                                case 'Finance':
                                                    $('input[id="monthly-payment-input"]').val(0);    
                                                break;  
                                                case'Lease':
                                                    $('input[id="monthly-payment-input"]').val(0);
                                                break;
                                            }
                                        });
                                        //Unselect vehicle checkbox
                                        invTable.rows('.selected').deselect();      
                                        //Close the dealer inv table
                                        $('#dealer-inv').on('.collapse.show').collapse('hide');
                                         

                                }else {
                                    //Unselect vehicle checkbox
                                    invTable.rows('.selected').deselect();      
                            }
                          }
                        }
                    }
                ]    
              }) 
          };

        //Helper function to check if Vehicle from Inventory is eligible to be switched in Offer being edited
        function checkEligibility(newVehicle) {
            var eligibility = true;
           $.each(otherVehiclesInOffers, function(index, value){
               if(value.vehicle === newVehicle){
                   $("#errorMessage").text("This vehicle is already being offered in your Offer ID#"+value.offer); 
                   //Show error pop up modal to inform dealer to select a vehicle
                   $("#errorModal").modal('show');  
                 eligibility = false
               } 
           })
           return eligibility;
         };;





//Handle the submit model btn
$("#submit-offer").click(function(e){
    e.preventDefault;
    var purchaseType = $('li[id="purchase-type-li"]').attr('data-type');
    var totalPayment = parseInt($('input[id="total-payment-input"]').val());
    var monthlyPayment = parseInt($('input[id="monthly-payment-input"]').val());
    switch (purchaseType){
        case 'Cash':
            if(totalPayment <= 0 || $('input[id="total-payment-input"]').val().length === 0){
                $("#errorMessage").text("Please enter a valid amount for Total Selling Price");
                $("#errorModal").modal('show');
            } else {
                reviewModalMessage(purchaseType);
            };
            break;
          case 'Finance':
            if(monthlyPayment <= 0 || $('input[id="monthly-payment-input"]').val().length === 0){
                $("#errorMessage").text("Please enter a valid amount for Monthly Payment");
                $("#errorModal").modal('show');
            } else {
              reviewModalMessage(purchaseType);
            }
            break;
          case 'Lease':
            if(monthlyPayment <= 0 || $('input[id="monthly-payment-input"]').val().length === 0){
                $("#errorMessage").text("Amount Monthly Payment is Invalid");
                $("#errorModal").modal('show');
            } else {
              reviewModalMessage(purchaseType);
            }
            break;
      } 
});

//Helper function to create modal body with info for review
function reviewModalMessage(purchaseType){
    switch(purchaseType){
      case 'Cash':
        var dealerMSRP = $('li[id="dealerMSRP"]').attr('data-msrp');
        var totaSellingPrice = $('input[id="total-payment-input"]').val();
        $('div[id="offerModal-body"]').empty();
        $('div[id="offerModal-body"]').append($('<p>', {'text':"Dealer MSRP: $"+dealerMSRP}));
        $('div[id="offerModal-body"]').append($('<p>', {'text':"Dealer Total Selling Price: $"+totaSellingPrice}));
        $("#reviewModal").modal('show');
        break;
      case 'Finance':
        var downPayment = $('li[id="down-pymt-li"]').attr('data-value');
        var numberOfMonths =  $('li[id="no-mths-li"]').attr('data-value');
        var monthlyPayment = $('input[id="monthly-payment-input"]').val();
        $('div[id="offerModal-body"]').empty();
        $('div[id="offerModal-body"]').append($('<p>', {'text':"Down Payment: $"+downPayment}));
        $('div[id="offerModal-body"]').append($('<p>', {'text':"Number of Months:"+numberOfMonths}));
        $('div[id="offerModal-body"]').append($('<p>', {'text':"Monthly Payment: $"+monthlyPayment}));
        $("#reviewModal").modal('show');
        break;
      case 'Lease':
        var downPayment = $('li[id="down-pymt-li"]').attr('data-value');
        var leaseTerm =  $('li[id="lease-term-li"]').attr('data-value');
        var annualMileage =  $('li[id="annual-mileage-li"]').attr('data-value');
        var monthlyPayment = $('input[id="monthly-payment-input"]').val();
        $('div[id="offerModal-body"]').empty();
        $('div[id="offerModal-body"]').append($('<p>', {'text':"Down Payment: $"+downPayment}));
        $('div[id="offerModal-body"]').append($('<p>', {'text':"Lease Term (Months):"+leaseTerm}));
        $('div[id="offerModal-body"]').append($('<p>', {'text':"Annual Mileage: "+annualMileage}));
        $('div[id="offerModal-body"]').append($('<p>', {'text':"Monthly Payment: $"+monthlyPayment}));
        $("#reviewModal").modal('show');        
        break;
    };
};

//Handle the SEND offer command
$("#send-offer-btn").on('click', function(e){
  e.preventDefault;
      saveOffer();   
});

//Helper function to SAVE offer
function saveOffer(){
  var offerObject =  getOfferDetails();
  $('#new-offer-json-input').val(JSON.stringify(offerObject));
  $('#new-offer-form').submit();
};

//Helper function
function getOfferDetails(){
  var dealer = $("#dealerID").attr('data-value');
  var dealerVehicle = offerVehicleJSON._id;
  var request = $("#requestID").attr('data-value');
  var monthlyPayment = parseInt($('input[id="monthly-payment-input"]').val());
  var totalPayment = getTotalPymt();
  var offerObject = {
                      dealer:dealer,
                      dealerVehicle:dealerVehicle,
                      request:request,
                      monthlyPayment:monthlyPayment,
                      totalPayment:totalPayment};
return offerObject;
};





//Helper function
function getTotalPymt(){
  var purchaseType = $('li[id="purchase-type-li"]').attr('data-type');
  var totalPayment = 0;
  switch(purchaseType){
    case 'Cash':
    totalPayment =  $('input[id="total-payment-input"]').val();
      return totalPayment;
    case 'Finance':
      var months = parseInt($('li[id="no-mths-li"]').attr('data-value'))
      var monthlyPayment = parseInt($('input[id="monthly-payment-input"]').val());
      var downPayment = parseInt($('li[id="down-pymt-li"]').attr('data-value'));
      totalPayment =months*monthlyPayment+(downPayment);
      return totalPayment;
    case 'Lease':
      var leaseTerm = parseInt($('li[id="lease-term-li"]').attr('data-value'))
      var monthlyPayment = parseInt($('input[id="monthly-payment-input"]').val());
      var downPayment = parseInt($('li[id="down-pymt-li"]').attr('data-value'));
      totalPayment = leaseTerm*monthlyPayment+(downPayment);
      return totalPayment;
      break;
  } 
}

});