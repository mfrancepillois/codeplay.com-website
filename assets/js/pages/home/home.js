let firstLoad = true;
let ecoChart, siliconChart;

$(document).ready(() => {
    // Initialize the navigation bar
    $('#our-solutions .tabs').Tabs(function(element) {
        $('.tab-selection-contents > div').hide();
        $('.tab-selection-contents div[data-for="' + element.data('for') + '"]').show();

        switch (element.data('for')) {
            case 'silicon-enablement': {
                reloadSiliconChart();
                break;
            }
            case 'ecosystem': {
                reloadEcoChart();
                break;
            }
            case 'automotive': {
                $('#automotive-image').removeClass('pop-in').addClass('pop-in');
                break;
            }
        }
    });

    $('#oneapi .tabs').Tabs(function(element) {
        $('.diagram img').removeClass('focused');

        switch (element.data('for')) {
            case 'plugins': {
                $('.diagram img:nth-of-type(4)').addClass('focused');
                break;
            }
            case 'construction-kit': {
                $('.diagram img:nth-of-type(5)').addClass('focused');
                break;
            }
        }
    });

    $('.diagram img:nth-of-type(4)').click(function() {
        $('#oneapi .tabs a[data-name="plugins"]').trigger('click');
    });

    $('.diagram img:nth-of-type(5)').click(function() {
        $('#oneapi .tabs a[data-name="construction-kit"]').trigger('click');
    });


    function callbackFunc(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                $('section#oneapi .diagram img:nth-of-type(7)').addClass('slide-down');
                $('section#oneapi .diagram img:nth-of-type(3)').addClass('slide-in');
                $('section#oneapi .diagram img:nth-of-type(4)').addClass('slide-in');
                $('section#oneapi .diagram img:nth-of-type(5)').addClass('slide-in');
                $('section#oneapi .diagram img:nth-of-type(6)').addClass('slide-in');
            }
        });
    }

    const observer = new IntersectionObserver(callbackFunc, {
        root: null,
        rootMargin: '0px',
        threshold: 0.3
    });

    observer.observe(document.getElementById('oneapi'));
});
