$(document).ready(function() {

    //Get the json for buyer to be edited
    $.getJSON("/buyers/json/:id", function(data){
        var buyerID = data.buyer._id
        //Load unedited data to the buyer info form
        loadInfo(data);
        //Add Code for Save Changes btn
        $("#edit_form").on("submit", function (e) {
            e.preventDefault();
            $.ajax({
                url: '/buyers/'+buyerID,
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
                        //Render the buyer dashboard view
                        window.location = '/buyers/'+buyerID;
                    }
                }, 
                error: function (jqXHR, textStatus, err) {
                    alert('text status ' + textStatus + ', err ' + err)
                }
            });
        })  
    });

    //Helper function to load buyer info into edit form
    function loadInfo(data){
        $("#first_name").val(data.buyer.first_name);
        //Make first name readOnly
        $("#first_name").prop("readonly", true);
        $("#last_name").val(data.buyer.last_name);
        //Make last name readOnly
        $("#last_name").prop("readonly", true);
        $("#username").val(data.buyer.username);
        //Make username readOnly
        $("#username").prop("readonly", true);
        $("#street_address_line1").val(data.buyer.street_address_line1);
        $("#street_address_line2").val(data.buyer.street_address_line2);
        $("#city").val(data.buyer.city);
        $(`#state option[value='${data.buyer.state}']`).prop('selected', true);
        $("#zip").val(data.buyer.zip);
        $("#email").val(data.buyer.email);
        //Make email readOnly
        $("#email").prop("readonly", true);
        $("#phone").val(data.buyer.phone);
        $("#credit_score").val(data.buyer.credit_score);
    };


    //Create alert below the div with the error
    function createErrorModal(errors){
        $('div[class=modal-body]').empty();
        $.each(errors, function(index, value){
            //Customize modal to review errors in new buyer form
            $('div[class="modal-body"]').append($('<p>', {'text':value.msg}));
            $("#errorModal").modal('show')
        }) 
    };







});