$(document).ready(() => {
    if(window.location.hash) {
        const hash = window.location.hash.substring(1);

        gtag('event', 'event_tracking', {
            'event_category': 'HiPEAC 2022 Poster',
            'event_label': hash
        });
    }
});
