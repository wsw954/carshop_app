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
                    getOtherVehiclesInOffers(competeOffers.offerJSON);
                    //Create table for Other Offers (Competing Offers)
                    createCompeteOfferTable(competeOffers.offerJSON);
                    //Check for type of User
                    switch (userKind) {
                        case 'Buyer':
                        buyerView();
                        break;
                        case 'Dealer':
                        dealerView();
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


//Helper function
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


    //Add table to display other (competing)  Offers to the Offer being displayed
    function createCompeteOfferTable(data){
        $("#offer-div").show();
        //Create Offer Table on Competing Offers btn
        $("#offer_competing").on('click', function(){
        //Build table of offers for the request 
        table = $('#offer-table').DataTable({
                    destroy: true,
                    dom: 'Bfrtip',
                    //Pass array of vehicle objects  
                    data: data,
                  //set up table columns
                  columns: [
                    {"data": null, defaultContent: ""},
                    {"data": "_id", title: "Offer ID",
                        "render":function(data){
                          return data.slice(data.length - 7)
                        }},
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
                      "sEmptyTable": "Sorry, there are no Competing Offers for this Request"
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
                            //Render the Offers show view
                            window.location.href = '/offers/'+offerID
                          }
                        }
                    }
                ],
                initComplete: function(){
                  //This function hides the Dealer Column if the user is a Buyer
                  var api = this.api();
                  if (userKind === 'Buyer') {
                    // Hide Office column
                    api.column(2).visible( false );
                  }
                }
              })
            })
          };  


    //Helper function to customize view for buyer
    function buyerView(){
        $('li[id=dealerName').hide();
        $("#edit-offer-btn").hide();
        //Display Accept btn if user is Buyer & Request is Active   
        if(offerJSON.offer.request.status === "Active"){
            $('button[id=offer-accept]').show();
                addLogicAcceptBtn();
            }
        

    }        

    //Helper function to customize view for buyer
    function dealerView(){  
        $('button[id=offer-accept]').hide();
        //Because of clash w/inline style hide the edit offer btn manually here 
        $('button[id=edit-offer-btn]').hide();
        if(offerJSON.offer.status === 'Active'){ 
            $("#inv-div").show();
            getDealerInfo();
            if(offerJSON.offer.dealer === userID){
                    //Add this dealerName to dealer li
                    $('li[id=dealerName').text("Dealer: "+dealerName); 
                    //Display the edit offer btn, since this dealer is the owner of Offer being viewed
                    $('button[id=edit-offer-btn]').show();
                        addLogicEditBtn(); 
                    } 
                }
        };      


   //Helper function to add logic to EDIT btn
   function addLogicEditBtn(){
    $("#edit-offer-btn").click(function(e){
        if(offerJSON.offer.status === "Active" ){
          if(offerJSON.offer.dealer === userID){
              //Route to offer EDIT view
              window.location = '/offers/'+offerJSON.offer._id+'/edit'; 
                } else {
                  $("#errorMessage").text("Sorry, you are not authorized to EDIT this Offer");
                  $("#errorModal").modal('show');
                }
        } else{
            $("#errorMessage").text("Sorry, you can only EDIT an Active Offer");
            $("#errorModal").modal('show');
        }  
     });
   };



     //Helper function create dealer inventory table
    //Note, this table adds an extra field "offers", which is an array of offers each vehicle is enrolled into
    function getDealerInfo(){
        //Create URL to retrieve index of all dealer Vehicles
        var jsonVehiclesUrl = "/vehicles/index/json/";
        //Create URL to retrieve index of all dealer Offers
        var jsonOffersUrl = "/offers/index/json";
        //Set default values for filter variables
        var filter ={make:'false',
                     model:'false',
                     state:'false',
                     status:[]};
         var dataArray = [];
         $.when(
             $.getJSON(jsonVehiclesUrl),
             $.getJSON(jsonOffersUrl,{context:"Dealer",filter:JSON.stringify(filter) })
         ).done(function(vehiclesJSON, offersJSON) {
              //First, filter out from the vehicle inventory, the vehicle currently referenced in Offer being Shown
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

           //Helper function to create table of Dealer's inventory
           function createDealerInvTable(dataArray){
            $("#inv-div").show();
            $("#inv_select").on('click', function(){
            //Build table of dealer inventory
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
                        text: 'Make Offer',
                        action: function () {
                          //Verify dealer has selected a vehicle from inventory
                          if(invTable.rows( { selected: true } ).data().length === 0){
                            $("#errorMessage").text("Select a Vehicle to make an Offer");
                            //Show error pop up modal to inform dealer to select a vehicle
                            $("#errorModal").modal('show')
                          } else {
                                //Get the vehicleID of vehicle selected  
                                var dealerVehicle = invTable.rows( { selected: true } ).data()[0]._id;
                                //Check vehicle eligibility
                                if(checkEligibility(dealerVehicle)){
                                //Get the dealer vehicle ID 
                                var dealerVehicle = invTable.rows( { selected: true } ).data()[0]._id;
                                //Render the offers/new view 
                                window.location.href = "/offers/new?request_id="+offerJSON.offer.request._id+"&dealer_vehicle="+dealerVehicle 
                                }else {
                                    //Unselect the vehicle
                                    invTable.rows('.selected').deselect();      

                            }
                          }
                        }
                    }
                ]
              })
            });
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
         };




});