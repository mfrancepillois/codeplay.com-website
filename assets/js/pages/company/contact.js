const getUrlParameter = function getUrlParameter(sParam) {
    let sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};

$(document).ready(() => {
    $('#contact-form').SimpleFormValidator();

    const prefill = getUrlParameter('q');
    if (prefill) {
        $('select[name="_subject"] option').each(function() {
            if ($(this).val() === prefill) {
                $('select[name="_subject"]').val($(this).val()).change();
            }
        });
    }
});
