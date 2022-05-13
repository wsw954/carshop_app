$(document).ready(function() {

    //Get the type of user
    var userKind = $("#userKind").val();
    //Global variables (Used by Request filters)
    var makeDropdown = $('#make-dropdown');
    var modelDropdown =  $('#model-dropdown');
    var stateDropdown = $('#state-dropdown');
    var pendingOffer = $('#noPendingOffer')

    //Check for type of User
    switch (userKind) {
        case 'Buyer':
          //Display Buyer's Request Table  
          createBuyerTable();
          break;
        case 'Dealer':
            //Display the Dealer filter btns
            $("#filter-card").show();
            break;  
      };


        //Add logic for Dealer to see ALL requests button
        $("#allRequestsBtn").on('click', function(){
            //Check if the filter div is open
            if($("#filterBtn").attr("aria-expanded") === 'true'){
                //Collapse the filter div
                $("#filterDiv").collapse('toggle');
            }
            //Reset the filters to default
            makeDropdown.prop('selectedIndex', 0);
            modelDropdown.prop('selectedIndex', 0);
            stateDropdown.prop('selectedIndex', 0);
            pendingOffer.prop('checked', false);  
           createDealerTable(getFilters());
        });
    
        //Add logic to filter button
        $("#filterBtn").on('click', function(){
            displayFilterForm();
        });
    
        //Add logic to filter submit button
        $("#filterSubmitBtn").on('click', function(){
           createDealerTable(getFilters());
        });  

 //Helper function to create table
 function createBuyerTable(filter){
    $('#requestTable').show();
    //Call dataTables plugin function on the table element
    $('#requestTable').DataTable({
        destroy: true,  
    //specify AJAX source, params and response source
    ajax: {
        url: '/requests/index/json',
        dataType: 'json',
        dataSrc: 'requests'
        },
        //Set the msrp column to number type
        columnDefs: [
            { type: "full_numbers", "targets": 4 }
        ],
    //set up table columns
    columns: [
        {"data": "_id", title: "Request ID",
        fnCreatedCell: function (nTd, sData, oData, iRow, iCol) {
            //Add underline to cell ID
               $(nTd).hover(function(){
                $(this).css("text-decoration", "underline")
               }, function(){
                $(this).css("text-decoration", "none");
            })
            //Add data-href to the ID cell, for requests/show url   
            $(nTd).attr('data-href', "/requests/"+oData._id);
            //Attach click listener to each
            $(nTd).on("click", function() {
                //Route to show view for vehicle chosen
               window.location = $(this).attr('data-href'); 
            })
        } 
    },
        {"data": "vehicle.make", title: "Make"},
        {"data": "vehicle.model", title: "Model"},
        {"data": "vehicle.msrp", title: "MSRP"},
        {"data": "purchaseType", title: "Purchase Type"},
        {"data": "status", title: "Status"},
        {"data":"offers.length",title:"Offers"},
        {
            "data": null,
            "className": "dt-center editor-edit",
            "defaultContent": '<i class="fas fa-pencil-alt"/>',
            "orderable": false,
            fnCreatedCell:function (nTd, sData, oData, iRow, iCol){
                $(nTd).on("click", function() {
                        //Route to show view for vehicle chosen
                        window.location = "/requests/"+oData._id; 
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
                    console.log(oData.offers.length)
                        //Verify if the selected Requests has a pending Active Offer 
                        if(oData.offers.length > 0){
                            console.log("Line 112")
                            $("#errorMessage").text("You cannot delete a requests which is currently has a pending Active Offer")
                            $("#errorModal").modal('show'); 
                        }
                         else {
                             console.log("line 117")
                            //Add delete form action
                            $("#delete-request-form").attr('action', '/requests/'+ oData._id+"?_method=DELETE");
                            //Display the confirm delete modal
                            $("#deleteModal").modal('show');

                                };
                            });
                        }
                    }
        ],
        //Set default order to column 4 (MSRP) and be ascending in value
        order: [[ 4, 'asc' ]],
        oLanguage: {
            "sEmptyTable":     "You currently have no Requests"
        }      
    });           
};    

    //Handle the confirm YES btn in the deleteModal
    $("#confirm-delete-btn").on('click', function(e){
        e.preventDefault;
            $("#delete-request-form").submit(); 
        });      
          


//Helper function to create table
   function createDealerTable(filter){
        $('#requestTable').show();
        //Call dataTables plugin function on the table element
        $('#requestTable').DataTable({
            destroy: true,  
        //specify AJAX source, params and response source
        ajax: {
            url: '/requests/index/json',
            data: filter,
            dataType: 'json',
            dataSrc: 'requests'
            },
            //Set the msrp column to number type
            columnDefs: [
                { type: "full_numbers", "targets": 4 }
            ],
        //set up table columns
        columns: [
            {"data": "_id", title: "ID"},
            {"data": "buyer.username", title: "Username"},
            {"data": "vehicle.make", title: "Make"},
            {"data": "vehicle.model", title: "Model"},
            {"data": "vehicle.msrp", title: "MSRP"},
            {"data": "buyer.state", title: "State"},
            {"data": "purchaseType", title: "Purchase Type"},
            {"data": "status", title: "Status"},
            {"data":"offers.length",title:"Offers"}
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
                $(row).attr('data-href', "/requests/"+data._id);
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
        pendingOffer.prop('checked', false);
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
            var jsonUrl = "/vehicles/models/"+ make;
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

 

    //Helper function, to get filter variables
    function getFilters(){
        //Set default values for filter variables
        var filter ={make:false,
                    model:false,
                    state:false,
                    noPendingOffer:false};
        if(makeDropdown.prop('selectedIndex') != 0){   
        filter.make = makeDropdown.val();
        };
        if(modelDropdown.prop('selectedIndex')!= 0){
        filter.model = modelDropdown.val();
        };
        if(stateDropdown.prop('selectedIndex') != 0){
        filter.state = stateDropdown.val();
        };
        if(pendingOffer.is(':checked')){
            filter.noPendingOffer = true;
        }
        return filter;
    };  
    




});