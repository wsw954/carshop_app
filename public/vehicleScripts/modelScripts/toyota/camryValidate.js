//Global functions used in the vehicleNew.js script file

    //Helper function to create option form group
    function createOptionsFormGroups(){
        //Reset the options form groups
        $(".options" ).remove();
        $.each(modelJSON.data.options, function(index, value){
                switch (value.type) {
                    case "Single":
                        //Clone form group w/ dropdown
                        $("#dropdown_fg_template").clone().attr({"id":value.name+"_fg", "class":"form-group options single"})
                        .insertBefore("#save-btn-div")
                        .find('label').text(value.label)
                        //Change id & name for select element
                        $("#"+value.name+"_fg").find('select').attr({"id":value.name, "name":value.name});    
                        break;
                    case "Multiple":
                        //Clone form groups w/ checkboxes
                        $("#checkbox_template").clone().attr({"id":value.name+"_fg", "class":"form-group options multiple"})
                        .insertBefore("#save-btn-div")
                        .find('.control-label').text(value.label);
                        break;
                }
            
        }) 
    };

        //Helper function to load option choices for trim selected
        function loadOptions(){
            $.each(modelJSON.data.options, function(index, optionGroup){  
                switch (optionGroup.type){
                    case "Single":; 
                            loadDropdown(optionGroup.name)        
                            break;
                    case "Multiple":
                            loadCheckBoxFormGroups(optionGroup);
                            break;
                            }
                        })
                    };

        //Helper function to load data to dropdown               
        function loadDropdown(groupName){
            //Get data for this option group
            var groupData = modelJSON.data.options.filter(obj => {
                return obj.name === groupName
                });
            //Clear the dropdown
            $("#"+groupName).empty();
            //Add disabled option element
            $("#"+groupName).append('<option selected="true" disabled>--Select--</option>');
            //Iterate through the choices available for the optionGroup
            $.each(groupData[0].choices, function(index, value){
                    //Check if the choice meets the precursor check
                    if(checkPrecursor(value)){
                        $("#"+groupName).append($('<option></option>').attr({
                                        'id':value.serial,value:value.name, 
                                        'data-price':value.price, 
                                        'data-serial':value.serial,
                                        'data-packinc':false})
                                        .text(value.name+"-$"+value.price));
                                    }
                                });
                        //Set default selectedIndex if only one choice available
                        if($("#"+groupName).find("option").length === 2 ){
                                $("#"+groupName).prop('selectedIndex', 1);
                                //Add this default selection the serialArray
                                serialArray.push($("#"+groupName).find('option:selected').attr('data-serial'))
                                };    
                    };  
                    
        //Helper function to load data for form groups w/ checkboxes
        function loadCheckBoxFormGroups(group){
            $.each(group.choices, function(index,value){
                if(checkPrecursor(value)){
                    //Add div w/class form-check
                    $("#"+group.name+"_fg").append($('<div></div>').attr({class:"form-check", id:group.name+"-"+index}));
                    //Add checkbox
                    $('div[id='+group.name+"-"+index+']').append($('<input></input>').attr(
                            {class:group.name,
                                type:'checkbox',
                                'value':value.name,
                                'name':value.name,
                                'id':value.serial, 
                                'data-serial':value.serial, 
                                'data-price':value.price,
                                'data-packinc':false}));
                        //Add label to each checkbox
                    $('div[id='+group.name+"-"+index+']').append($('<label></label>').attr({class:'form-check-label',for:value.name}).text(value.name+"-$"+value.price)); 
                            }
                        });
            };


            //Helper function to process the 3 possible alterations per choice selected
            function selectItem(choice){
                for (const key in choice) {
                    switch (key) {
                        case 'reset':
                        $.each(choice.reset, function(index, resetOption){
                            var group = modelJSON.data.options.filter(obj => {
                                return obj.name === resetOption
                            });
                            loadDropdown(group[0].name); 
                        });
                        break;
                        case 'unselect':
                            $.each(choice.unselect, function(index, value){
                                unSelectItem(value);
                            })
                            break;
                        case 'components':
                                selectComponents(choice.serial);
                            break;
                    }
                }
            };


        //Helper function to check precursor are present for an option selected
        function checkPrecursor(option){
            var verified = false;
            updateSerialArray();
            //Check if the option chosen has a precursor property
            if(option.hasOwnProperty('precursor')){
                var count = 0;
                $.each(option.precursor, function(index, value){
                    //Check if the serialArray includes any of the precursor serials
                    if(value.some(r=> serialArray.includes(r))){
                        count++;
                        }
                        //Ensure the count is length of the array of precursors
                        //This ensures all the precursors are included in the serialArray
                        if(count === option.precursor.length){
                            verified = true;
                    }
                    })             
                } else {
                    //If there are no precursors return true
                    verified = true;
                }
                return verified;
            };

    
            //Helper function to handle selection of components for a selected package
            function selectComponents(packageSerial){ 
                var packData = getChoiceData(packageSerial);
                $.each(packData.components, function(index, value){
                    var compData = getChoiceData(value);
                        $("#"+compData.serial).attr({"data-price":0,"data-packinc":true,"data-packid":packageSerial});
                        if($("#"+compData.serial).is('input')){
                            $("#"+compData.serial).prop("checked", true)
                                $('label[for="'+compData.name+'"]').text(compData.name + "-Included in Package")
                            }
                            if($("#"+compData.serial).is('option')){
                                $("#"+compData.serial).prop({"text": compData.name + "-Included in Package", "selected":true});
                            }
                    if(compData.hasOwnProperty('unselect')){
                        $.each(compData.unselect, function(index, value){
                                unSelectItem(value);
                        }); 
                    }
                });
        };

            //Helper function to handle unselection of components for an unselected package
            function unSelectComponents(choice){
                //Get the data for the package 
                var package = getChoiceData(choice);
                //Iterate through the components
                $.each(package.components, function(index, component){
                var compData =  getChoiceData(component)
                //Select the elements for each component
                    $("#"+compData.serial).each(function(key,element) {
                        $(element).attr({"data-price":compData.price,"data-packinc":false, "data-packid":null });
                            //Reset if element is input
                            if($(element).is('input')){
                                $(element).prop("checked", false)
                                $('label[for="'+compData.name+'"]').text(compData.name+"-$"+compData.price)
                            }
                            if($(this).is('option')){
                                //Reset if element in dropdown
                                $(this).prop({"text": compData.name+"-$"+compData.price});
                                //Reset the dropdown to original state, prior to the package unselection
                                loadDropdown($(this).parent().prop('id'));
                            }
                });
                });
            };


        //Helper function to handle a single unselection of an item
        function unSelectItem(choice){  
            var choiceData =  getChoiceData(choice);
            $("#"+choiceData.serial).each(function(key,element) {
                //If the unselected item is part of a package 
                if (element.dataset.packinc === 'true'){
                    //First unselect the parent package
                    $("#"+element.dataset.packid).prop("checked", false);
                        unSelectComponents(element.dataset.packid)
                }   
                //If the unselected item has components (ie is a package)
                else if (choiceData.hasOwnProperty('components')){
                    //First unselect the actual package 
                    $("#"+element.dataset.serial).prop("checked", false);
                        unSelectComponents(element.dataset.serial);
                }   
                //If neither a package nor a component, just unselect only the actual item
                else {
                    $("#"+element.dataset.serial).prop("checked", false);
                }
            });
    };

            //Helper function to get data for option from modelJSON file
            function getChoiceData(serial){
                var data= {};
                $.each(modelJSON.data.options, function(index, optionGrp){
                    $.each(optionGrp.choices, function(index, choice){
                        if(choice.serial === serial){
                            data = choice;
                        }
                    });         
                });
                return data;
            };


        //Helper function to update arrays for all options chosen, & msrp displayed
        function updateSerialArray(){
            //Reset serialArray to empty
            serialArray = [];
            //Add trim selected
            serialArray.push($("#trim").find('option:selected').attr('data-serial'));
            //Reset priceArray to empty
            priceArray = [];
            var basePrice = $("#trim").find('option:selected').attr('data-price');
            //Add basePrice for trim selected
            priceArray.push(parseInt(basePrice)); 
                $.each($('.form-group.options.single option:selected'), function(index, value){
                    if($(this).index() > 0){
                        serialArray.push(value.dataset.serial);
                        priceArray.push(parseInt(value.dataset.price));
                        }          
                    }); 
                $.each($('.form-group.options.multiple input:checked'), function(index, value){
                    serialArray.push(value.dataset.serial);
                    priceArray.push(parseInt(value.dataset.price));                
                    }); 
            const totalPrice = priceArray.reduce((partialSum, a) => partialSum + a, 0)
            $('#msrp').val(parseInt(totalPrice))
    };     


// Code block to handle user making selections in vehicle form

$(document).ready(function() {
    //Handle trim selected
    $("#trim").change(function(e) {
       e.preventDefault();
       $(".options" ).remove();
       $("#save-btn-div").show();
       $("#undo-edit-btn").show();
       if($(this).prop('selectedIndex') != 0){
           //Clear serial array of all prior selections
           serialArray = [];
           //Add the trim selected to the serial array
           serialArray.push($("#trim").find('option:selected').attr('data-serial'));
           //Update msrp
           var basePrice = $("#trim").find('option:selected').attr('data-price');
           $('#msrp').val(parseInt(basePrice));
           $('#msrp_fg').show();
           //Create html form groups for model selected
           createOptionsFormGroups();
           //Load data for this trim into the form groups
           loadOptions();
       }          
   });
   
   //Add event handlers to form-groups w/ dropdowns
   $("body").on('change','.form-group.options.single',function(e){
       //Get the selected option
       $(this).find('option:selected').each(function(index,element) {
           //Call function to process all properties of choice selected
           selectItem(getChoiceData(element.dataset.serial));
       });
       //Check all the unselected option for this dropdown
       $(this).find('option:not(:selected)').each(function(index,element) {
        
           //Check if unselected option was actively part of a package selected
           if($(element).index() > 0 && (element.dataset.packinc === "true")){
               //Must unselect the package for which this option is a component;
               unSelectItem(element.dataset.packid);
               } 
           });
               //Update serialArray
                updateSerialArray();
                console.log(serialArray);
       });
   
   //Add event handlers to form-groups w/ checkboxes
   $("body").on('change','.form-group.options.multiple',function(e){
       //Get the selected choice
       if(e.target.checked){
           //Call function to process all properties of choice selected
           selectItem(getChoiceData(e.target.dataset.serial));
       } 
       //Check the unselected choice
       if(!e.target.checked){ 
           //Check if the unselected choice is a component of a package 
           if(e.target.dataset.packinc === "true"){    
               unSelectItem(e.target.dataset.packid);
               };
           //Check if the unselected choice is of class "packages" 
           if($(e.target).attr("class") === "packages"){
               //Must unselect the components of this package
                unSelectItem(e.target.dataset.serial);
               };
           };
           //Update serialArray
           updateSerialArray();
           console.log(serialArray);
       });
            
     
  

   
   });