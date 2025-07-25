/**
 * @preserve Copyright (C) 2016 Codeplay Software Limited
 * All Rights Reserved.
 *
 * jQuery plugin that enable a navigation bar to respond to scroll events.
 *
 * @author Scott Straughan
 */

(function ($) {
    $.fn.PopupDialog = function (title, functionToUse, closeCallback) {
        var $this = this.clone();
        var $element;
        var $functionToUse = functionToUse;
        var $windowScrollPosition;
        var $closeCallback = closeCallback;

        function createElement() {
            $element = $('<div />', {
                'id': 'dialogContainer'
            });

            $this.css('display', 'none');
            $element.append($this);
        }

        $this.show = function () {
            // Log scroll position
            $windowScrollPosition = $(window).scrollTop();

            $('html').css({
                'overflow': 'hidden'
            });

            createElement();

            $('main').append($element);

            $element.css('display', 'flex').hide().fadeIn(200, function () {
                const escHanlde = function(e) {
                    if (e.key === 'Escape') {
                        $(document).unbind('keyup', escHanlde);
                        $this.close(null);
                    }
                };

                $(document).bind('keyup', escHanlde);

                $element.find($this).fadeIn(200);

                const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

                if (isSafari) {
                    $this.addClass('no-blur');
                }

                $element.find('.close').click(function() {
                    $this.close(null);
                });

                $element.find('header a').click(function (e) {
                    e.preventDefault();
                    $this.close(null);
                });

                $element.click(function (e) {
                    if(!$.contains($element.get(0), e.target)) {
                        $this.close(null);
                    }
                });

                $functionToUse($this);
            });

            return this;
        };

        $this.close = function (time = null) {
            if (time) {
                setTimeout(function () {
                    actuallyClose();
                }, time);
                return;
            }

            actuallyClose();
            return this;
        };

        function actuallyClose() {
            $('html').css({
                'overflow': 'auto'
            });

            $element.find($this).fadeOut(200, function () {
                // Remove element
                $element.remove();

                // Restore scroll position
                $(window).scrollTop($windowScrollPosition);

                if ($closeCallback) {
                    $closeCallback($this);
                }
            });
        }

        $this.disableDialog = function () {
            $this.find('input').attr('disabled', "disabled");
            $this.find('button').attr('disabled', "disabled");
            $this.find('select').attr('disabled', "disabled");
            return this;
        };

        $this.enableDialog = function () {
            $this.find('input').attr('disabled', false);
            $this.find('button').attr('disabled', false);
            $this.find('select').attr('disabled', false);
            return this;
        };

        $this.setStatus = function (classToSet, text) {
            $element.find('div#result').removeClass();
            $element.find('div#result').addClass(classToSet);
            $element.find('div#result').text(text);
            $element.animate({scrollTop: 0});
        };

        $this.getElement = function () {
            return $element;
        };

        return $this;
    };
})(jQuery);
