$(document).ready(function() {
    
    //Handle Change Password submission
    $("#password_form").on("submit", function (e) {
        console.log("Line 5 in buyerShow.js")
        e.preventDefault();
        $.ajax({
            url: '/password/change',
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
                    window.location = '/buyers/dashboard';
                }
            }, 
            error: function (jqXHR, textStatus, err) {
                alert('text status ' + textStatus + ', Error:' + err)
            }
        });
    });

    //Create alert below the div with the error
    function createErrorModal(errors){
        $('div[class=modal-body]').empty();
        $.each(errors, function(index, value){
            //Customize modal to review errors in change password form
            $('div[class="modal-body"]').append($('<p>', {'text':value.msg}));
            $("#errorModal").modal('show')
        }) 
    };

  



});