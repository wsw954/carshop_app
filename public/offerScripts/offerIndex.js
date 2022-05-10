$(document).ready(function() {
    //Set global variables 
    var userID = $('#dealerID').text();
    var makeDropdown = $('#make-dropdown');
    var modelDropdown =  $('#model-dropdown');
    var stateDropdown = $('#state-dropdown');
    //Get the Dealer username
    var dealerName = $("#dealerName").text();

    //Add logic to ALL Offers button
    $("#allOffersBtn").on('click', function(){
        //Check if the filter div is open
        if($("#filterBtn").attr("aria-expanded") === 'true'){
            //Collapse the filter div
            $("#filterDiv").collapse('toggle');
        }
        //First, Reset the filters to default
        makeDropdown.prop('selectedIndex', 0);
        modelDropdown.prop('selectedIndex', 0);
        stateDropdown.prop('selectedIndex', 0);
        $('.form-check-input').prop('checked', false);
       //Then create table, with filters set to default
       createTable();
    });

    //Add logic to filter button
    $("#filterBtn").on('click', function(){
        displayFilterForm();

    });

    //Add logic to filter submit button
    $("#filterSubmitBtn").on('click', function(){
        console.log(getFilters())
       createTable();
    });


   
//Helper function to create table
   function createTable(){
    $('#offerTable').show();
    //Call dataTables plugin function on the table element
   $('#offerTable').DataTable({
        destroy: true,  
       //specify AJAX source, params and response source
       ajax: {
           url: "/offers/index/json",
           data: {context:'Dealer',filter:JSON.stringify(getFilters())},
           dataType: 'json',
           dataSrc: 'offerJSON'
        },
        //Set the msrp column to number type
        columnDefs: [
            { type: "full_numbers", "targets": 4 },
            { type: "full_numbers", "targets": 5 },
            { type: "full_numbers", "targets": 6 }
          ],
       //set up table columns
       columns: [
        {"data": "_id", title: "Offer ID",
            "render":function(data){
                return data.slice(data.length - 7)
          }
        },
        {"data":"request._id", title:"Request ID",
            "render":function(data){
                 return data.slice(data.length - 7);
            }},
        {"data": "request.buyer.username", title: "Username"},
        {"data": "request.vehicle.model", title: "Model Requested"},
        {"data": "dealerVehicle.model", title: "Model Offered"},
        {"data": "request.buyer.state", title: "Buyer State"},
        {"data": "request.purchaseType", title: "Purchase Type"},
        {"data": "monthlyPayment", title: "Monthly Payment"},
        {"data": "totalPayment", title: "Total Payment"},
        {"data": "status", title:"Offer Status"},
        {"data": "request.offers", title:"Total Offers","render": function (data) {
            return data.length; }}
        ],
        //Set default order to column 4 (MSRP) and be ascending in value
        order: [[ 4, 'asc' ]],
        createdRow: function(row, data, index){
            //Add underline format to each cell
            $(row).find('td').hover(function (){
                $(this).css("text-decoration", "underline");
            },function(){
                $(this).css("text-decoration", "none");
            }
        );
            //Add href attribute to each row
            $(row).attr('data-href', "/offers/"+data._id)
            //Attach click listener to each row
            $(row).on("click", function() {
                //Route to show view for request chosen
                window.location = jQuery(this).closest('tr').attr('data-href'); 
            }); 
        },        
    });           
};


    //Display the filter form
    function displayFilterForm(){
        //Hide the model dropdown
        $('#model-selection-form').hide();
        //Reset the state dropdown
        $("#state-dropdown").prop('selectedIndex', 0);
        //Reset the pending offer checkbox
        // pendingOffer.prop('checked', false);
        $('#filterDiv').css('border', '1px solid black');
        makeDropdown.empty();
        makeDropdown.append('<option selected="true" value=0 >All Makes</option>');
        makeDropdown.prop('selectedIndex', 0);
        //Populate make dropdown with list of vehicle makes
        $.getJSON('../src/assets/make', function (data) {
            $.each(data, function (key, entry) {
                makeDropdown.append($('<option></option>').attr('value', entry.name).text(entry.name));
            })    
        });


       
    };

     //Handle a Make selected, to display & populate the model dropdown in filter form
     $('#make-selection-form').change(function(e) {
        e.preventDefault();
        var make = $(this).find('option:selected').text();
        if(makeDropdown.val() != 0){
            $('#model-selection-form').show();
            modelDropdown.empty();
            modelDropdown.append('<option selected="true" value=0 >All Models</option>');
            modelDropdown.prop('selectedIndex', 0);
            var jsonUrl = "/vehicles/models/"+make;
            $.getJSON(jsonUrl, function (data) {
                $.each(data, function (key, entry) {
                    modelDropdown.append($('<option></option>').attr('value', entry.name).text(entry.name));
                    })    
                });
        } 
        else {
            modelDropdown.empty();
            modelDropdown.append('<option selected="true" value=0 >All Models</option>');
            modelDropdown.prop('selectedIndex', 0);
            $('#model-selection-form').hide();
        }     
});

 

//Helper function    
function getFilters(){
    //Set default values for filter variables
    var subFilter ={make:'false',
                    model:'false',
                    state:'false',
                    status:[]};
    if(makeDropdown.prop('selectedIndex') != 0){   
        subFilter.make = makeDropdown.val();
    };
    if(modelDropdown.prop('selectedIndex')!= 0){
        subFilter.model = modelDropdown.val();
    };
    if(stateDropdown.prop('selectedIndex') != 0){
        subFilter.state = stateDropdown.val();
    };
    if($('input[name="statusChkBx"]').is(':checked')){
        $.each($('.form-check-input:checked'), function(index, value){
            subFilter.status.push(value.value);
              
        })
     }
    return subFilter;
};  
    

    
         


  });