//Set global variable, which will be used by the model specific script file
var requestJSON = {};

$(document).ready(function() {

  //Set global variables for this script file
  var offerTable = {};
  var invTable = {};
  var userID = $("#userID").val();
  var userKind = $("#userKind").val(); 
 //Retrieve request ID from html file
  var requestID = $('input[id=requestID]').val();
  //Create URL for json of request
  var jsonRequestUrl = "/requests/json/"+requestID;

//Retrieve request json doc from database
$.getJSON(jsonRequestUrl, function(data){
  //Assign request json value to global variable
  requestJSON = data.request;
  displayRequestBasicInfo();
  //Call helper function to display vehicle details card
  displayVehicleDetails();
  // createOfferTable();
   //Check for type of User
   switch (userKind) {
      case 'Buyer':
        //Display & Add logic to Request Edit btns & forms
          displayRequestEdit();
        break;
      case 'Dealer':
          // displayAdditionalBuyerInfo();
          // getDealerInfo();
          break;  
    };
});

//Helper function
function displayRequestBasicInfo(){
   //Get make & model of request vehicle
   $("#request-div").show();
   //Display request basic info
   $('#requestID').text('Request ID-'+requestJSON._id); 
   $('#buyerID').text('Buyer ID: ' +requestJSON.buyer._id);
   $('#vehicleMake').text('Make: ' +requestJSON.vehicle.make);
   $('#vehicleModel').text('Model: ' +requestJSON.vehicle.model);
   $('#vehicleMSRP').text('MSRP: $' +requestJSON.vehicle.msrp);
     //Display request details
    if(requestJSON.purchaseType === "Cash"){
      $('#purchaseType').text('Purchase Type: Cash Purchase ');
    } 
    else {
      $('#purchaseType').text('Purchase Type: ' +requestJSON.purchaseType);
      $('#downPayment').text('Down Payment: $' +requestJSON.downPayment);
    }
    switch (requestJSON.purchaseType){
      case "Finance":
        $('#numberOfMonths').text('Number Of Months: ' +requestJSON.numberOfMonths);
        break;
      case "Lease":
        $('#leaseTerm').text('Lease Term (months): ' +requestJSON.leaseTerm);
        $('#numberOfMonths').remove();
        $('#annualMileage').text('Annual Mileage (miles): ' +requestJSON.annualMileage);
        break;
    }
      $('#status').text('Status: ' +requestJSON.status);
      $('#offers').text('Number of Offers: ' +requestJSON.offers.length);        
};

//Helper function to display vehicle details
function displayVehicleDetails(){
  var vehicle = requestJSON.vehicle;
  //Create url to retrieve model data from db
  var jsonUrlModelData = "/vehicles/src/json/"+vehicle.make+"/"+vehicle.model+"/"+vehicle.year;
  $.getJSON(jsonUrlModelData, function(modelData){
    createDetailTemplate(modelData);
    //Get trim data
    var trimData = modelData.data.trim.choices.filter(trim =>
                trim.serial === requestJSON.vehicle.details[0]);
    //Add trim name details card
    $("#trim").append(trimData[0].name);
  })
};

    //Helper function to create template in details card
    function createDetailTemplate(modelData){
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
                  $("#details").append($(singleElement).attr({"id":value.name}))
                  $("#"+value.name).find('strong').text(value.label+': ');  
              break;
              case "Multiple":
                  //Add li element w/ nested ul for each individual option for the option group
                  $("#details").append($(multipleElement).attr({"id":value.name}));
                  $("#"+value.name).find('strong').text(value.label+': ')
                  break;
          } 
          loadDetailData(value);
      }); 
  };


      //Helper function to load the details data to the template
        function loadDetailData(optionValue){
            //Iterate through the details array, excluding the first property, since this is always the vehicle 'trim'
              $.each(requestJSON.vehicle.details.slice(1), function(index, value){
                //Iterate through the choices possible for the option group
                $.each(optionValue.choices, function(index, choice){
                    //Check if the choice serial matches the serial from the details array
                    if(choice.serial === value){
                        switch (optionValue.type){
                            case 'Single':
                                $("#"+optionValue.name).append(choice.name);
                                break;
                            case 'Multiple':
                                $("#"+optionValue.name).find('ul').append('<li class="list-group-item">'+choice.name+'</li>');
                        }
                    }                    
                })
              });
        };



//Helper function to display Request Edit btns
  function displayRequestEdit(){
      if(requestJSON.buyer._id === userID && requestJSON.status === "Active"){
          //Add form action w/requestID to cancel-request-form
          $("#cancel-request-form").attr('action', '/requests/'+ requestJSON._id+"?_method=PUT");
          //Add form action w/requestID to delete-request-form
          $("#delete-request-form").attr('action', '/requests/'+ requestJSON._id+"?_method=DELETE");
          //Display cancel btn
          $("#cancel_request").show();
      }
          //Add logic to the cancel btn
          $("#cancel_request").click(function(e){
              if(requestJSON.buyer._id === userID){
                if(requestJSON.status === "Active"){
                  $("#cancelModal").modal('show');
                } else{
                    $("#errorMessage").text("Sorry, you can only EDIT an Active REQUEST");
                    $("#errorModal").modal('show');
                }
              } else{
                $("#errorMessage").text("Sorry, you don't have permission to EDIT this REQUEST. You must be the buyer who created this REQUEST");
                $("#errorModal").modal('show');
              }
        });
            //Handle the confirm of CANCEL btn in cancelModal
             $("#confirm-cancel-btn").on('click', function(e){
                  //If Request has matching Offer, cancel the Request
                  if(requestJSON.offers.length >= 1){
                  $("#cancel-request-form").submit();
                  } 
                  //If the Request has no matching Offer, delete the Request
                  if(requestJSON.offers.length === 0){
                  $("#delete-request-form").submit();
                  }
              });    
  };


  //Additional Buyer info, specific for Dealers
  function displayAdditionalBuyerInfo(){
      $("#buyerID").after($('<div></div>').text('State: ' +requestJSON.buyer.state));
      $("#buyerID").after($('<div></div>').text('Zip: ' +requestJSON.buyer.zip_code));
      $("#buyerID").after($('<div></div>').text('City: ' +requestJSON.buyer.city));
      $("#buyerID").after($('<div></div>').text('User Name: ' +requestJSON.buyer.username));
      $("#buyerID").after($('<div></div>').text('Credit Score: ' +requestJSON.buyer.credit_score));

  };

  //Helper function create dealer inventory table
  //Note, this table adds an extra field "offers", which is an array of offers each vehicle is enrolled into
  function getDealerInfo(){
     //Create URL to retrieve index of all dealer Vehicles
     var jsonVehiclesUrl = "/vehicles/index/json/"
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
          //Iterate through list of vehicles add new field (offers), which is a number of offers the vehicle is enrolled in
          $.each(vehiclesJSON[0].vehicles, function(index, vehicle){
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



    //Add table to display matching offers for this request
    function createOfferTable(){
      $("#offer-div").show();
      $("#offer_select").on('click', function(){
        //Build table of request offers
        offerTable = $('#offer-table').DataTable({
              destroy: true,
              dom: 'Bfrtip',    
            //Specify AJAX source, params and response source
            ajax: {
                url: "/offers/index/json",
                dataType: 'json',
                dataSrc: 'offerJSON',
                data:{context:'Request', request:requestJSON._id}
              },
            //set up table columns
            columns: [
              {"data": null, defaultContent: ""},
              {"data": "_id", title: "Offer ID",
              "render":function(data){
                return data.slice(data.length - 7)
              }},
              {"data": "dealerVehicle.make", title: "Make"},
              {"data": "dealerVehicle.model", title: "Model"},
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
                "sEmptyTable": "Sorry, there are no Offers yet for this Request"
            },
            buttons: [
              {
                  text: 'View Details',
                  action: function () {
                    //Verify buyer has selected an offer from offer table
                    if(offerTable.rows( { selected: true } ).data().length === 0){
                      $("#errorMessage").text("Select an Offer to view");
                      //Show error pop up modal to inform buyer to select an offer
                      $("#errorModal").modal('show');
                    } else {
                      //Get the dealer vehicle ID 
                      var offerID = offerTable.rows( { selected: true } ).data()[0]._id;
                      //Render the vehicles compare view 
                      window.location.href = '/offers/'+offerID
                    }
                  }
              }
          ]
        })
      })
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
                          //Get the dealer vehicle ID 
                          var dealerVehicle = invTable.rows( { selected: true } ).data()[0]._id;
                          //Render the offers/new view 
                          // window.location.href = '/offers/new/'+requestJSON._id+'/'+dealerVehicle
                          window.location.href = "/offers/new?request_id="+requestJSON._id+"&dealer_vehicle="+dealerVehicle
                        }
                      }
                  }
              ],    
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
                }
            })
          });
        };  




});