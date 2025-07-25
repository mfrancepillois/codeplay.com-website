$(document).ready(() => {
    $('#management-team .avatar').click(function(e) {
        $('#user-popup img').attr("src", $(this).find('img').attr("src"));
        $('#user-popup h2').text($(this).parent().find('h2').text());
        $('#user-popup h3').text($(this).parent().find('h3').text());
        $('#user-popup .bio').text($(this).parent().find('.bio').text());

        const popup = $('#user-popup').Popup();
        popup.open(()=>{});
    });
});
