$(document).ready(function() {
    
    //Handle New Dealer form submission
    $("#register_form").on("submit", function (e) {
        e.preventDefault();
        $.ajax({
            url: '/dealers/new',
            type: 'POST',
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
                    window.location = '/dealers/dashboard';
                }
            }, 
            error: function (jqXHR, textStatus, err) {
                alert('text status ' + textStatus + ', err ' + err)
            }
        });
    });

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