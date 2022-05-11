//Global variable of all model src dataloadTrim
var modelJSON = {};
var vehicleJSON = {};
//Array to keep track of all currently selected options chosen by user
var serialArray = [];
var priceArray = [];

$(document).ready(function() {
  
    var make = $("#vehicleMake").val();
    var model = $("#vehicleModel").val();
    var vehicleID = $("#vehicleID").val();
    var makeDropdown = $("#make");
    var modelDropdown = $("#model");
    var trimDropdown = $("#trim");

    //Get list of makes available & load into make dropdown
    loadMakes();

    //Retrieve vehicle doc from db
    getVehicleJSON();

  
  
    //Helper function to retrieve the original vehicle doc from database for editing
    function getVehicleJSON(){
        //Get the url for vehicle
        var jsonUrlVehicleDoc = "/vehicles/json/"+vehicleID;
        //Retrieve the vehicle doc from db & set to global variable
        $.getJSON(jsonUrlVehicleDoc, function(data){
            //Assign value to global variable for vehicle to being edited
            vehicleJSON = data.vehicle;
                //Begin building form & loading data into form
                loadUneditedVehicle();
            
        });
    };

    

    //Test function to be called on page load and UNDO EDIT btn clicked
    function loadUneditedVehicle(){
        //Set makeDropdown to make of unedited vehicle
        $(makeDropdown).val(vehicleJSON.make);
        //Retrieve  the relevant model JSON file from src folder
        getModelData(vehicleJSON.make,vehicleJSON.model, vehicleJSON.year);
        //Load the models for make into model dropdown
        loadModels(vehicleJSON.make);
        //Set model dropdown to match model of unedited vehicle
        $(modelDropdown).val(vehicleJSON.model);
        //Load trim dropdown for trim choices for model of unedited vehicle
        loadTrim(modelJSON.data.trim.choices);
        //Set the trim dropdown to match the unedited vehicle
        $(trimDropdown).find("[data-serial="+vehicleJSON.details[0]+"]").prop("selected", true);
        //Display MSRP element
        $('#msrp_fg').show();
        //Create the options form groups for model
        createOptionsFormGroups();
        //Load default data into the option form groups
        loadOptions();
        //Load the details for vehicle doc
        loadVehicleDetails();
        updateSerialArray();
        //Display the save-btn-div
        $("#save-btn-div").show();
    };

    //Helper function to load vehicle details as default data into vehicle edit form
    function loadVehicleDetails(){
        $.each(modelJSON.data.options, function(index, optionValue){
            $.each(vehicleJSON.details.slice(1), function(index, value){
                //Iterate through the choices possible for the option group
                $.each(optionValue.choices, function(index, choice){
                    //Check if the choice serial matches the serial from the details array
                    if(choice.serial === value){
                        switch (optionValue.type){
                            case 'Single':
                                //Select the dropdown option element
                                $("#"+value).prop("selected", true);
                                selectItem(getChoiceData(choice.serial));
                                
                                break;
                            case 'Multiple':
                                //Mark checkbox checked
                                $("#"+value).prop("checked", true);
                                selectItem(getChoiceData(choice.serial));
                                
                        }
                    }                    
                })
              })
        })
    };


    
    //Handle user change make of vehicle
    $(makeDropdown).change(function(e) {
        e.preventDefault();
        //Reset all subsequent form groups for details
        $("#model_fg").hide();
        $(modelDropdown).empty();
        $("#trim_fg").hide();
        $("#trim").empty();
        $(".options" ).remove();
        $("#msrp_fg").hide();
        $("#save-btn-div").hide();
        if($(this).prop('selectedIndex') != 0){
            //Assign value of make selected to global variable
            make = $(this).val();
            loadModels(make);
        } 
    });
    
    //Handle user change model of vehicle
    $(modelDropdown).change(function(e) {
        e.preventDefault();
        //Reset all subsequent form groups 
        $("#trim_fg").hide();
        $("#trim").empty();
        $(".options" ).remove();
        $("#msrp_fg").hide();
        $("#save-btn-div").hide();
        if($(this).prop('selectedIndex') != 0){
            //Assign value to global variable for model selected
            model = $(this).val();
            //Retrieve the src file for model chosen
            getModelData(make,model,2022);
            //Add relevant model script file
            changeModelScript(model);
            //Add trim data to form group
            loadTrim(modelJSON.data.trim.choices);
        }
    });

    //Helper to handle adding of relevant model script file
    function changeModelScript(model){
        //Check if current model script file matches the model selected
            if($('#'+model+'Script').length === 0){
                //Change modelScript file to match the model selected
                $(".modelScript" ).attr({'type':'text/javascript','src':'/'+make.toLowerCase()+'/'+model.toLowerCase()+"Validate.js",'class':'modelScript', 'id':model.toLowerCase()+"Script"});
            } 
        };


    //Helper function to load make dropdown w/ list of makes available
    function loadMakes(){
        var jsonUrlMakes= "/src/assets/make";
        $.getJSON(jsonUrlMakes, function(data){
            $(makeDropdown).append('<option selected="true" disabled>--Select A Make--</option>');
            //Load the makes available into make dropdown
            $.each(data, function (key, entry) {
                $(makeDropdown).append($('<option></option>').attr('value', entry.name).text(entry.name));
                });
        });
    };

   

    //Helper function to load modelsDropdown as per make selected
    function loadModels(make){
        //Get url for list of models, per make chosen
        var jsonUrl = "/vehicles/models/"+make;
        //Reset the model dropdown
        $("#model_fg").show();
        $(modelDropdown).empty();
        $(modelDropdown).append('<option selected="true" disabled>Choose A Model</option>');
        $(modelDropdown).prop('selectedIndex', 0);
        //Get json of models per make selected
        $.ajax({
            url: jsonUrl,
            async: false, //Set to false to avoid async error
            dataType: 'json',
            success: function(data) {
              //Load the models per make selected into model dropdown
              $.each(data, function (key, entry) {
                    $(modelDropdown).append($('<option></option>').attr('value', entry.name).text(entry.name));
                    });
                }
            })
    };

    //Helper function to get src data file for model chosen
    function getModelData(make, model, year){
        var jsonUrl = "/vehicles/src/json/"+make+"/"+model+"/"+year;
        //Get the model data json
            $.ajax({
                    url: jsonUrl,
                    async: false, //Set to false to avoid async error
                    dataType: 'json',
                    success: function(data) {
                        //Assign value to global variable for the model data JSON
                        modelJSON = data;
                        }
                    });
    };



    //Helper function to load trim form group
    function loadTrim(trim){
        //Reset the trim dropdown
        $("#trim").empty();
        $("#trim").append('<option selected="true" disabled>--Select--</option>'); 
        //Assign label to trim form group
        $("#trim_fg").find("label").text(modelJSON.data.trim.label);
        $.each(trim, function(index, value){
            $("#trim").append($('<option></option>').attr({'value':value.name, 'data-price':value.price, 'data-serial':value.serial}).text(value.name+"- base MSRP-$"+value.price))
        }); 
        //Show trim form group
        $("#trim_fg").show();   
    };

    //Helper function to save vehicle
    $('#save-changes-btn').on('click', function(){
        var vehicleEditJSON = createVehicleJSON();
        $('#edit-vehicle-json-input').val(JSON.stringify(vehicleEditJSON));
        $('#edit-vehicle-form').submit();
        });

    //Helper function to undo edits to vehicle
    $('#undo-edit-btn').on('click', function(){
            loadUneditedVehicle();
            });    

    //Helper function
    function createVehicleJSON(){
            var make = $(makeDropdown).val();
            var model =   $(modelDropdown).val();
            var year= modelJSON.data.year;
            var msrp = $('#msrp').val();
            var vehicleJSONEdit = {
                                    make:make,
                                    model:model,
                                    year: year,
                                    msrp:msrp,
                                    details:serialArray};
        return vehicleJSONEdit;  
    }


    
});
    
        