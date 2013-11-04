
$(function(){

    $( "#settingPopup" ).on({
        popupbeforeposition: function() {
            var h = $( window ).height();
            $("#settingPopup").css( "height", h );
        }
    });
});


