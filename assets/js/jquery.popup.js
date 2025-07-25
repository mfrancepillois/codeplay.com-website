/**
 * Copyright (C) 2020 Codeplay Software Limited
 * All Rights Reserved.
 *
 * Simple popup.
 *
 * @author Scott Straughan
 */

(function ($) {
    $.fn.Popup = function () {
        const $this = this.clone();

        let $element;
        let $windowScrollPosition;
        let $closeCallback;

        function createElement() {
            $element = $('<div />', {
                class: 'popup-container'
            });

            const closeElement = $('<div />', {
                class: 'popup-close'
            });
            closeElement.append('<i class="material-icons">close</i>');

            $this.css('display', 'none');
            $element.prepend(closeElement);
            $element.append($this);
        }

        $this.open = function (openCallback, closeCallback) {
            $closeCallback = closeCallback;

            // Log scroll position
            $windowScrollPosition = $(window).scrollTop();

            $('html').css({
                'overflow': 'hidden'
            });

            createElement();

            $('body').append($element);

            $element.fadeIn(function () {
                $element.find($this).fadeIn();
            });

            $element.click(function () {
                if (!$element.find('.popup').is(':hover')) {
                    $this.close(null);
                }
            });

            openCallback($this);

            return this;
        };

        $this.close = function () {
            $('html').css({
                'overflow': 'auto'
            });

            $element.find($this).fadeOut(function () {
                $element.fadeOut(function () {
                    // Remove element
                    $element.remove();

                    // Restore scroll position
                    $(window).scrollTop($windowScrollPosition);

                    if ($closeCallback) {
                        $closeCallback($this);
                    }
                });
            });

            return this;
        };

        $this.getElement = function () {
            return $element;
        };

        return $this;
    };
})(jQuery);
