$(document).ready(function() {

    //Set global variables
    var buyer_id = $('#userID').data("userid");
    var vehicle_id = $('#vehicleID').data("vehicleid");;
    var purchaseType = null;
    var down_payment = null;
    var number_of_months = 0;
    var annual_mileage = 0;
    var dataBoolean = true;
    var requestVehicle = {};

    
    $.when(
        //Retrieve all Requests for the buyer
        $.getJSON("/requests/index/json/"),
        //Retrieve the request vehicle JSON
        $.getJSON("/vehicles/json/"+vehicle_id)
            ).done(function(request, vehicle) {
                var requestArray = request[0].requests;
                requestVehicle = vehicle[0].vehicle;
                //Check if buyer has any Active Request
                if(requestArray.some(i => i.status.includes('Active'))){
                    $("#active-req-note").show();
                    //Set href on anchor tag to view Active Requests
                    $("#req-anchor-tag").attr("href", "/requests/"+requestArray[0]._id);
                    $("#req-anchor-tag").show();
                } else {
                     //Display the make, model & MSRP
                     $('input[name=vehicle_make]').val(requestVehicle.make);  
                     $('input[name=vehicle_model]').val(requestVehicle.model); 
                     $('input[name=vehicle_msrp').val(requestVehicle.msrp);
                    $("#new-request-card").show();
                    $("#save-requests-btn").show();

                };   
    });
   

    
    //Handle logic of purchase type selection
    $('#purchase_type_select').change(function(e) {
        e.preventDefault();
        if(this.selectedIndex != 0){
            //Disable the prompt option
            $("option[value='']").prop('disabled',true);
            purchaseType = $(this).val();
            switch (purchaseType) {
                case 'Cash':
                  //Reset default & hide inputs for down payment & number_of_months
                  $("input[name='down_payment']").val(1000);
                  $("#down_payment").hide();
                  $("input[name='number_of_months']").val(60);
                  $("#number_of_months").hide();
                  $("input[name='annual_mileage']").val(12000);
                  $("#annual_mileage").hide();
                  break;
                case 'Finance':
                  $("input[name='down_payment']").val(1000);  
                  $("#down_payment").show();
                  $("label[for='number_of_months']").text("Number of Months (default=60)");
                  $("input[name='number_of_months']").val(60);
                  $("#number_of_months").show();
                  $("input[name='annual_mileage']").val(12000);
                  $("#annual_mileage").hide();
                  break;
                case 'Lease':
                  $("input[name='down_payment']").val(1000);
                  $("#down_payment").show();
                  $("label[for='number_of_months']").text("Lease Term (Months) (default= 48 months)");
                  $("input[name='number_of_months']").val(48);
                  $("#number_of_months").show();
                  $("input[name='annual_mileage']").val(12000);
                  $("#annual_mileage").show();
                    break;  
              }
        }      
    });
    
    //SAVE request 
    $('#save-requests-btn').on('click', function(){
        //Check if purchase type is selected
        if($("#purchase_type_select option:selected").index() === 0){
            $("#errorMessage").text("You must select a Purchase Type");
            $("#errorModal").modal('show');
        }
         else{
        //Reset boolean
        dataBoolean = true;
        //Validate relevant data entered
            validateData();
            if(dataBoolean){
                displayRequestReviewInfo(purchaseType);     
            }
        }   
    });
    


    //Helper function
    function validateData(){
        var totalPayment = $('input[name=vehicle_msrp').val();
        down_payment = $("input[name='down_payment']").val();
        number_of_months = $("input[name='number_of_months']").val();
        annual_mileage = $("input[name='annual_mileage']").val();
        switch(purchaseType){
            case "Finance":
                if(down_payment < 0 || null){
                    $("#errorMessage").text("Invalid value for Down Payment");
                    $("#errorModal").modal('show');
                    dataBoolean = false;  
                };
                if(number_of_months <=12){
                    $("#errorMessage").text("Invalid value for Number of Months");
                    $("#errorModal").modal('show');
                    dataBoolean = false;
                };
                break;
            case "Lease":
                if(down_payment < 0 || null){
                    $("#errorMessage").text("Invalid value for Down Payment");
                    $("#errorModal").modal('show');
                    dataBoolean = false;
                };
                if(number_of_months <=12){
                    $("#errorMessage").text("Invalid value for Lease Term (Months)");
                    $("#errorModal").modal('show');
                    dataBoolean = false;
                };
                if(annual_mileage <=0){
                    $("#errorMessage").text("Invalid value for Annual Mileage");
                    $("#errorModal").modal('show');
                    dataBoolean = false;
                };
                break;
            case "Cash":
                if(totalPayment <= 0|| null ){
                    $("#errorMessage").text("Invalid Amount  for MSRP");
                    $("#errorModal").modal('show');
                    dataBoolean = false;
                }

        }
    };


    //Helper function to dislay Request Review
    function displayRequestReviewInfo(purchaseType){
        switch(purchaseType){
          case 'Cash':
            var totalPayment = $('input[name=vehicle_msrp').val();
            $('div[id="reviewrModal-body"]').empty();
            $('div[id="reviewModal-body"]').append($('<p>', {'text':"Purchase Type: Cash"}));
            $('div[id="reviewModal-body"]').append($('<p>', {'text':"MSRP: $"+totalPayment}));
            $("#reviewModal").modal('show');
            break;
          case 'Finance':
            down_payment = $("input[name='down_payment']").val();
            number_of_months = $("input[name='number_of_months']").val();;
            $('div[id="reviewModal-body"]').empty();
            $('div[id="reviewModal-body"]').append($('<p>', {'text':"Purchase Type: Finance"}));
            $('div[id="reviewModal-body"]').append($('<p>', {'text':"Down Payment: $"+down_payment}));
            $('div[id="reviewModal-body"]').append($('<p>', {'text':"Number of Months:"+number_of_months}));
            $("#reviewModal").modal('show');
            break;
          case 'Lease':
            down_payment = $("input[name='down_payment']").val();
            number_of_months = $("input[name='number_of_months']").val();
            annual_mileage = $("input[name='annual_mileage']").val();
            $('div[id="reviewModal-body"]').empty();
            $('div[id="reviewModal-body"]').append($('<p>', {'text':"Purchase Type: Lease"}));
            $('div[id="reviewModal-body"]').append($('<p>', {'text':"Down Payment: $"+down_payment}));
            $('div[id="reviewModal-body"]').append($('<p>', {'text':"Lease Term (Months):"+number_of_months}));
            $('div[id="reviewModal-body"]').append($('<p>', {'text':"Annual Mileage: "+annual_mileage}));
            $("#reviewModal").modal('show');        
            break;
        };
    };


    //Helper function to handle save Request
    $("#yes-review-btn").on('click', function(){
        var requestJSON ={};
        switch(purchaseType){
            case 'Cash':
                requestJSON = createCashPaymentRequest();
                $('#new-request-json-input').val(JSON.stringify(requestJSON));
                $('#new-request-form').submit();
                break;
            case 'Finance':
                requestJSON = createFinanceRequest();
                $('#new-request-json-input').val(JSON.stringify(requestJSON));
                $('#new-request-form').submit()
                break;
            case 'Lease':
                requestJSON = createLeaseRequest();
                $('#new-request-json-input').val(JSON.stringify(requestJSON));
                $('#new-request-form').submit()
                break;
        }
    });



    //Helper function
    function createCashPaymentRequest(){
        var totalAmount =  $('input[name=vehicle_msrp').val();
        var request = {
                        buyer:buyer_id,
                        vehicle:vehicle_id,
                        purchaseType:purchaseType,
                        totalAmount:totalAmount
                        };
        return request;
    };

    //Helper function
    function createFinanceRequest(){
        var down_payment = $("input[name='down_payment']").val();
        var number_of_months = $("input[name='number_of_months']").val();
        var request = {
                        buyer:buyer_id,
                        vehicle:vehicle_id,
                        purchaseType:purchaseType,
                        downPayment:down_payment,
                        numberOfMonths:number_of_months
                        };
        return request;
    };

    //Helper function
    function createLeaseRequest(){
        var down_payment = $("input[name='down_payment']").val();
        var lease_term = $("input[name='number_of_months']").val();
        var annual_mileage = $("input[name='annual_mileage']").val();
        var request = {
                        buyer:buyer_id,
                        vehicle:vehicle_id,
                        purchaseType:purchaseType,
                        downPayment:down_payment,
                        leaseTerm:lease_term,
                        annualMileage:annual_mileage
                        };
        return request;
    };

  


    
    });