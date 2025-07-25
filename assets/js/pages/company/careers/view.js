$(document).ready(function () {
    if(window.location.hash && window.location.hash === '#form-after-send') {
        $('#form-after-send').show();
        $('#form-before-send').hide();

        gtag('event', 'application', {
            'event_category' : 'Careers',
            'event_label' : $('#career-title h1').text()
        });
    } else {
        gtag('event', 'view', {
            'event_category' : 'Careers',
            'event_label' : $('#career-title h1').text()
        });
    }

    $('#default-position').click(function(event) {
        event.preventDefault();
        event.stopPropagation();
    });

    $('#apply').SimpleFormValidator();

    $('select#referer').change(function() {
        onToggleChooser($(this).val());
    });

    onToggleChooser(null);
});

function checkReferer(form) {
    let value = form.val();

    if (value === 'other') {
        $('input#referer-other').show();
        $('input#referer-other').prop('disabled', false);
        $('label[for="referer-other"]').show();
    } else {
        $('input#referer-other').hide();
        $('input#referer-other').prop('disabled', true);
        $('input#referer-other').val("");
        $('label[for="referer-other"]').hide();
    }
}

function onToggleChooser(selectedValue) {
    $('.chooser').hide();

    if (selectedValue) {
        const selectorContainer = $('.chooser.' + selectedValue);

        if (selectorContainer.length) {
            const selector = selectorContainer.find('input,select');

            selectorContainer.show();

            selector.change(function() {
                onSelectReferer(selector.val());
            });
        } else {
            onSelectReferer(selectedValue);
        }
    }
}

function onSelectReferer(value) {
    if (value.toLowerCase() === 'please select') {
        value = '';
    }

    $('input[name="Where Did You Hear About Us"]').val(value);
}
