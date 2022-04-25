$(document).ready(function() {

    //Get the json for dealer to be edited
    $.getJSON("/dealers/json/:id", function(data){
        var dealerID = data.dealer._id
        //Load unedited data to the dealer info form
        loadInfo(data);
        //Add Code for Save Changes btn
        $("#edit_form").on("submit", function (e) {
            e.preventDefault();
            $.ajax({
                url: '/dealers/'+dealerID,
                type: 'PUT',
                cache: false,
                data:  $(this).serialize() ,
                success: function (data) {
                    //Check if the returned json has array which contains errors
                    if(Array.isArray(data.json) && data.json.length > 0){
                        $('div[id=alert_div').attr({
                            class: 'show',
                            text: data.json[0].msg
                        });
                        createErrorModal(data.json);
                    } else {
                        //Render the dealer dashboard view
                        window.location = '/dealers/'+dealerID;
                    }
                }, 
                error: function (jqXHR, textStatus, err) {
                    alert('text status ' + textStatus + ', err ' + err)
                }
            });
        })  
    });

    //Helper function to load dealer info into edit form
    function loadInfo(data){
        $("#first_name").val(data.dealer.first_name);
        //Make first name readOnly
        $("#first_name").prop("readonly", true);
        $("#last_name").val(data.dealer.last_name);
        //Make last name readOnly
        $("#last_name").prop("readonly", true);
        $("#username").val(data.dealer.username);
        //Make username readOnly
        $("#username").prop("readonly", true);
        $("#dealership_name").val(data.dealer.dealership_name);
        $("#main_brand").val(data.dealer.main_brand);
        $("#street_address_line1").val(data.dealer.street_address_line1);
        $("#street_address_line2").val(data.dealer.street_address_line2);
        $("#city").val(data.dealer.city);
        $(`#state option[value='${data.dealer.state}']`).prop('selected', true);
        $("#zip").val(data.dealer.zip);
        $("#email").val(data.dealer.email);
        //Make email readOnly
        $("#email").prop("readonly", true);
        $("#phone").val(data.dealer.phone);
    };


    //Create alert below the div with the error
    function createErrorModal(errors){
        $('div[class=modal-body]').empty();
        $.each(errors, function(index, value){
            //Customize modal to review errors in new dealer form
            $('div[class="modal-body"]').append($('<p>', {'text':value.msg}));
            $("#errorModal").modal('show')
        }) 
    };





});