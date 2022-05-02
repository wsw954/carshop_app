$(document).ready(function() {
    //Get the user ID 
    var id = $('#userID').text();
    //Get user type
    var userType = $('#userType').text();
    //Create url to retrieve all vehicles for user
    var jsonVehiclesUrl = "/vehicles/index/json/"; 
    //Create url to use in ajax GET request 
    var jsonOffersUrl = "/offers/index/json";
    //Call functions based on type of user
    switch(userType){
        case "Buyer":
            //Create table for buyers
            getBuyerInfo();
            break;
        case "Dealer":
            //Function to get Dealer info & subsequently create dealer table
            getDealerInfo();
            break;   
    }; 

 


    //Helper function to retrieve buyer info
    function getBuyerInfo(){
            var dataArray = [];
            $.when(
                $.getJSON(jsonVehiclesUrl),
                $.getJSON("/requests/index/json")
            ).done(function(vehiclesJSON, requestJSON) {
                //Iterate through list of vehicles add new field (offers), which is a number of requests the vehicle is enrolled in
                $.each(vehiclesJSON[0].vehicles, function(index, vehicle){
                    vehicle.requests =[];
                    $.each(requestJSON[0].requests, function(index,request){
                        //If the vehicle is enrolled in a request, then add id to the vehicle.requests array
                        if(request.vehicle._id === vehicle._id){
                            vehicle.requests.push(request._id)
                        }
                    })
                    dataArray.push(vehicle);        
                });
                createBuyerTable(dataArray);
            });
        };

    //Helper function to retrieve Dealer info 
    function getDealerInfo(){
        var filter ={make:'false',
                     model:'false',
                     state:'false',
                     status:[]};
        var dataArray = [];
        $.when(
            $.getJSON(jsonVehiclesUrl),
            $.getJSON(jsonOffersUrl,{context:"Dealer", filter:JSON.stringify(filter)})
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
            createDealerTable(dataArray);
        });
    };





  //Helper function create dealer inventory table
  //Note, this table adds an extra field offers, which is an array of offers this vehicle is enrolled into
  function createBuyerTable(data){
     $('.table').DataTable({ 
       //Pass array of vehicle objects  
       data: data,
       //set up table columns
       columns: [
        {"data": "_id", title: "ID",
        fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
         //Add underline to cell ID
            $(nTd).hover(function(){
             $(this).css("text-decoration", "underline")
            }, function(){
             $(this).css("text-decoration", "none");
         })
         //Add data-href to the ID cell, for vehicle/show url   
         $(nTd).attr('data-href', "/vehicles/"+oData._id+"?make="+oData.make+"&model="+oData.model);
         //Attach click listener to each
         $(nTd).on("click", function() {
             //Route to show view for vehicle chosen
            window.location = $(this).attr('data-href'); 
         })
     } 
             },
        {"data": "make", title: "Make"},
        {"data": "model", title: "Model"},
        {"data": "msrp", title: "MSRP"},
        {"data":"requests.length", title:"Requests Vehicle Enrolled"},
        {
         "data": null,
         "className": "dt-center editor-edit",
         "defaultContent": '<i class="fa fa-pencil-alt"></i>',
         "orderable": false,
         fnCreatedCell:function (nTd, sData, oData, iRow, iCol){
                $(nTd).on("click", function() {
                            //Verify if the selected vehicle is currently listed in any Offers 
                                if(oData.requests.length > 0){
                                    $("#errorMessage").text("Sorry, You cannot EDIT a vehicle which is currently listed in a Request")
                                    $("#errorModal").modal('show'); 
                                }
                                 else {
                                    //Route to show view for vehicle chosen
                                    window.location = "/vehicles/"+oData._id+"/edit?make="+oData.make+"&model="+oData.model;
                                }
                        
                        });
                        }
        },
        {
            "data": null,
            "className": "dt-center editor-delete",
            "defaultContent": '<i class="fa fa-trash"/>',
            "orderable": false,
            fnCreatedCell:function (nTd, sData, oData, iRow, iCol){
                $(nTd).on("click", function() {
                        //Verify if the selected vehicle is currently listed in any Requests 
                        if(oData.requests.length > 0){
                            $("#errorMessage").text("You cannot delete a vehicle which is currently listed in a Request")
                            $("#errorModal").modal('show'); 
                        }
                         else {
                            //Add delete form action
                            $("#delete-vehicle-form").attr('action', '/vehicles/'+ oData._id+"?_method=DELETE");
                            //Display the confirm delete modal
                            $("#deleteModal").modal('show');
                                };
                            });
                        }
                    }
        ],

    });                   
};

//Helper function the create table of inventory vehicles for Dealer
function createDealerTable(data){
    $('.table').DataTable({ 
      //Pass array of vehicle objects  
      data: data,
      //set up table columns
      columns: [
       {"data": "_id", title: "ID",
       fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
        //Add underline to cell ID
           $(nTd).hover(function(){
            $(this).css("text-decoration", "underline")
           }, function(){
            $(this).css("text-decoration", "none");
        })
        //Add data-href to the ID cell   
        $(nTd).attr('data-href', "/vehicles/"+oData._id+"?make="+oData.make+"&model="+oData.model);
        //Attach click listener to each row
        $(nTd).on("click", function() {
            //Route to show view for vehicle chosen
           window.location = $(this).attr('data-href'); 
        })
    } 
            },
       {"data": "make", title: "Make"},
       {"data": "model", title: "Model"},
       {"data": "msrp", title: "MSRP"},
       {"data":"offers.length", title:"Active Offers Vehicle Enrolled"},
       {
        "data": null,
        "className": "dt-center editor-edit",
        "defaultContent": '<i class="fas fa-pencil-alt"/>',
        "orderable": false,
        fnCreatedCell:function (nTd, sData, oData, iRow, iCol){
            $(nTd).on("click", function() {
                    //Route to show view for vehicle chosen
                    window.location = "/vehicles/"+oData._id+"/edit?make="+oData.make+"&model="+oData.model; 
                    });
                    }
    },
    {
        "data": null,
        "className": "dt-center editor-delete",
        "defaultContent": '<i class="fa fa-trash"/>',
        "orderable": false,
        fnCreatedCell:function (nTd, sData, oData, iRow, iCol){
            $(nTd).on("click", function() {
                    //Verify if the selected vehicle is currently listed in any Offers 
                    if(oData.offers.length > 0){
                        $("#errorMessage").text("You cannot delete a vehicle which is currently listed in an Offer")
                        $("#errorModal").modal('show'); 
                    }
                    else {
                        //Add delete form action
                        $("#delete-vehicle-form").attr('action', '/vehicles/'+ oData._id+"?_method=DELETE");
                        //Display the confirm delete modal
                        $("#deleteModal").modal('show');
                            }; 
                        });
                    }
                }
            ],
  
        });                   
};

//Helper function add logic to the confirm delete vehicle btn
$("#confirm-delete-btn").on("click", function(){
    //Submit delete form
    $("#delete-vehicle-form").submit();
});





});

