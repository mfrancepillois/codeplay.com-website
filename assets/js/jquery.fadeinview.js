(function($) {
    let fadeEventHandlers = [];

    function isElementInViewport (el) {
        if (typeof jQuery === "function" && el instanceof jQuery) {
            el = el[0];
        }
        let rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    function registerFadeWhenInViewEvent (inViewElement, callback) {
        fadeEventHandlers.push({
            element: inViewElement,
            callback: callback
        });
    }

    function fadeInImageLayers(topLevelElement) {
        topLevelElement.show().css('opacity', 1);
        topLevelElement.find('img').each(function(index) {
            fadeInImage($(this), index);
        });
    }

    function fadeInImage(image, offset = 0) {
        image.delay(300 * offset).fadeTo(1000, 1);
    }

    function runFaceCheckAction() {
        $.each(fadeEventHandlers, function(index, value) {
            if(isElementInViewport(value.element)) {
                value.callback(value.element);
            }
        });
    }

    $(document).ready(() => {
        $('.layered-image.fade-in').each(function(index) {
            fadeInImageLayers($(this));
        });

        $(document).scroll(function() {
            runFaceCheckAction();
        });

        $('.in-view-fade-in').each(function(index) {
            let el = $(this);

            if(el.hasClass('layered-image')) {
                registerFadeWhenInViewEvent(el, function(item) {
                    fadeInImageLayers(item);
                });
            } else {
                registerFadeWhenInViewEvent(el, function(item) {
                    fadeInImage(item);
                });
            }
        });

        setTimeout(() => {
            runFaceCheckAction();
        }, 200);
    });
})(jQuery);
