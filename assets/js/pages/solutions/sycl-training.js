---
---

$(document).ready(() => {
    $('section#our-services a.button').click(function () {
        const link = $(this);

        const popup = $('#sycl-package-popup').Popup();
        popup.open((popupElement) => {
            const form = popupElement.find('form');

            // Enable validation
            form.SimpleFormValidator();
            form.data("is-valid", "false");

            popupElement.find('.columns > *:nth-child(1) h1').text(link.data('package'));
            popupElement.find('input[name="package"]').val(link.data('package'));

            grecaptcha.render(popupElement.find('.g-recaptcha').empty()[0], {
                'sitekey': '{{site.recaptcha_site_key}}',
                'callback' : function(response) {
                    form.data("is-valid", "true");
                    // Dispatch change event
                    form.find(':input').trigger("change");
                }
            });
        });
    });

    if(window.location.hash === '#sent') {
        const popup = $('#sycl-package-popup-sent').Popup().open((element) => {
            element.find('button').click(function () {
                popup.close();
            })
        });
    }
});
