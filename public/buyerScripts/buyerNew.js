$(document).ready(function() {
    console.log("test line in buyersNew.js")
    //Handle New Buyer form submission
    $("#register_form").on("submit", function (e) {
        e.preventDefault();
        $.ajax({
            url: '/buyers/new',
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
                    //Render the buyer dashboard view
                    window.location = '/buyers/dashboard';
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
            //Customize modal to review errors in new buyer form
            $('div[class="modal-body"]').append($('<p>', {'text':value.msg}));
            $("#errorModal").modal('show');
        }) 
    };

    //Add logic to modal Close btn
    $('#close-btn').on('click', function(){
        $("#errorModal").modal('hide');
        });



});