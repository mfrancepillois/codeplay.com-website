/**
 * Copyright (C) 2025 Codeplay Software Limited
 * All Rights Reserved.
 *
 * @author Scott Straughan
 */

(function ($) {
    /**
     * Timeline scroller for about page.
     * @constructor
     */
    $.fn.TimelineScroller = function (time = 5, delay = 1) {
        const fThis = this;
        const animationTime = time;
        const animationDelay = delay;

        let animationSpeed = undefined;
        let timelineAnimationDistance = undefined;
        let timelineAnimationForwards = true;

        /**
         * Perform the animation.
         * @param distance
         * @param forwards
         */
        function animate(distance = 0, forwards = true) {
            timelineAnimationForwards = forwards;

            const completedTime = distance / animationSpeed;
            const targetTime = animationTime - completedTime;

            $('.timeline')
                .delay(animationDelay * 1000)
                .animate({ scrollLeft: (forwards ? timelineAnimationDistance : 0) }, {
                    duration: (forwards ? targetTime : completedTime) * 1000,
                    easing: 'linear',
                    complete: () => animate((forwards ? timelineAnimationDistance : 0), !forwards)
                });
        }

        /**
         * Init on document ready.
         */
        $(function() {
            timelineAnimationDistance = fThis.prop('scrollWidth') - fThis.width();
            animationSpeed = timelineAnimationDistance / time;

            fThis.hover(function() {
                $(this).clearQueue().stop();
            }, function() {
                animate($(this).scrollLeft(), timelineAnimationForwards);
            });

            animate();
        });

        return this;
    }
})(jQuery);
