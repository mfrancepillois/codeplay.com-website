$(document).ready(() => {
    setTimeout(() => { switchImage(); }, 2000);

    function switchImage() {
        $('#what-is-compute-aorta #timed-image img:nth-of-type(1)').fadeToggle();
        $('#what-is-compute-aorta #timed-image img:nth-of-type(2)').fadeToggle();

        setTimeout(() => {
            switchImage();
        }, 2000);
    }

    $('#contact').SimpleFormValidator();
});
