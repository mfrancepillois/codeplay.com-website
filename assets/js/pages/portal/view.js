$(document).ready(function () {
    $('#full-view').click(function() {
        $('section#news .wrapper').toggleClass('full-view');
    });

    hljs.highlightAll();
})
