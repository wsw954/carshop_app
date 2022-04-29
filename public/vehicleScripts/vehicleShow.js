
$(document).ready(function() {
    //Initiate global variables
    var vehicleJSON = {};
    var modelJSON = {};

    //Get vehicle ID
    var vehicleID = $('#vehicleID').attr("data-value");
    var userID = $("#userID").attr("data-value");
    var userKind = $("#userKind").attr("data-value");
    //Append vehicle ID to url
    var jsonUrlVehicle = "/vehicles/json/"+ vehicleID;
    //Get the relevant json file for vehicle in database
    $.getJSON(jsonUrlVehicle, vehicleData => {
        vehicleJSON = vehicleData.vehicle;
        //Create url to retrieve model data from db
        var jsonUrlModelData = "/vehicles/src/json/"+vehicleJSON.make+"/"+vehicleJSON.model+"/"+vehicleJSON.year;
    //Get the relevant data file from src for vehicle make & model    
    $.getJSON(jsonUrlModelData, modelData => {
        modelJSON = modelData;
        displayBaseInfo();  
        displayModelDetails();
            //Verify user authorization
            if(vehicleJSON.creatorID === userID){
                    //Assign href value to EDIT btn-passing make & model as parameters
                    $("#edit-vehicle-btn").attr("href", "/vehicles/"+vehicleJSON._id+"/edit?make="+vehicleJSON.make+"&model="+vehicleJSON.model);
                    //Display Edit Btn
                    $("#editDiv").show();
                        //Verify if user is a Buyer
                        if(userKind === "Buyer"){
                            //Assign href value to new-request-btn
                            $("#new-request-btn").attr("href", "/requests/new?vehicle="+vehicleJSON._id);
                            //Display New Request Div
                            $("#requestDiv").show();
                        }

                  }; 
    });
});

    //Helper function to display vehicle basic data
    function displayBaseInfo(){
        $("#make").append(vehicleJSON.make);
        $("#model").append(vehicleJSON.model);
        $("#year").append(vehicleJSON.year);
        $("#msrp").append(vehicleJSON.msrp);
    };

    //Helper function to display the vehicle model details
    function displayModelDetails(){
        //Create template
        createDetailTemplate();
        //Get trim data
        var trimData = modelJSON.data.trim.choices.filter(trim =>
                trim.serial === vehicleJSON.details[0]);
        //Add trim data
        $("#trim").append(trimData[0].name);
    };
    
    //Helper function to create template in details card
    function createDetailTemplate(){
        var singleElement = '<li class="list-group-item"><strong></strong></li>';
        var multipleElement =  '<li class="list-group-item">'+
                                    '<strong></strong>'+
                                '<ul class="list-group">'+
                                    '</ul>'+
                                '</li>';
        $.each(modelJSON.data.options, function(index, value){
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
              $.each(vehicleJSON.details.slice(1), function(index, value){
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
    

    
      
      });