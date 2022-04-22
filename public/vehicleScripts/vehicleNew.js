//Global variable of all model src data
var modelJSON = {};
//Array to keep track of all currently selected options chosen by user
var serialArray = [];
var priceArray = [];

$(document).ready(function() {
    var make = {};
    var model ={};
    var makeDropdown = $("#make");
    var modelDropdown = $("#model");

    //Get list of makes available & load into make dropdown
    loadMakes();

    //Handle a make selected
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
    
    //Handle a model selected
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
            getModelJSON(model);
            //Add relevant model script file
            addModelScript(model);
            //Add trim data to form group
            loadTrim(modelJSON.data.trim.choices);
        }
    });

    //Helper to handle adding of relevant model script file
    function addModelScript(model){
        if($('#'+model+'Script').length === 0){
            //First delete any previous modelScript file
            $(".modelScript" ).remove();
            //Load model specific script file for form validation
            $('body').append($('<script></script>').attr({'type':'text/javascript','src':'/vehicleScripts/modelScripts/'+make.toLowerCase()+'/'+model.toLowerCase()+"Validate.js",'class':'modelScript', 'id':model.toLowerCase()+"Script"}))
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

    //Helper function to load models
    function loadModels(make){
        //Get url for list of models, per make chosen
        var jsonUrl = "/vehicles/models/"+make;
        //Reset the model dropdown
        $("#model_fg").show();
        $(modelDropdown).empty();
        $(modelDropdown).append('<option selected="true" disabled>Choose A Model</option>');
        $(modelDropdown).prop('selectedIndex', 0);
        //Get json of models per make selected
        $.getJSON(jsonUrl, function (data) {
            //Load the models per make selected into model dropdown
            $.each(data, function (key, entry) {
                $(modelDropdown).append($('<option></option>').attr('value', entry.name).text(entry.name));
                });   
            });
    };

    //Helper function to get src data file for model chosen
    function getModelJSON(model){
        var jsonUrl = "/vehicles/src/json/"+make+"/"+model;
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
    $('#save-btn').on('click', function(){
        var vehicleJSON = createVehicleJSON();
        $('#new-vehicle-json-input').val(JSON.stringify(vehicleJSON));
        $('#new-vehicle-form').submit();
        });

    //Helper function
    function createVehicleJSON(){
            var make = $(makeDropdown).val();
            var model =   $(modelDropdown).val();
            var year= modelJSON.data.year;
            var msrp = $('#msrp').val();
            var vehicleJSON = {
                                    make:make,
                                    model:model,
                                    year: year,
                                    msrp:msrp,
                                    details:serialArray};
        return vehicleJSON;  
    }



});
    
    
        