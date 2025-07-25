/**
 * Copyright (C) 2022 Codeplay Software Limited
 * All Rights Reserved.
 *
 * @author Scott Straughan
 */

(function ($) {
    /**
     * Cookie Policy Manager JQuery Plugin.
     * @returns {$.fn.AlertBanner}
     * @constructor
     */
    $.fn.AlertBanner = function () {
        const fThis = this;
        const fCookieName = 'CDCHIDEALERT'

        /**
         * Set (or create) a cookie with a value.
         * @param key
         * @param value
         */
        function setCookie(key, value) {
            let expires = new Date();
            expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));

            let cookieValue = key + '=' + value + '; expires=' + expires.toUTCString() + '; path=/; SameSite=Strict;';

            if (location.protocol === 'https:') {
                cookieValue += ' Secure;';
            }

            document.cookie = cookieValue;
        }

        /**
         * Get a specific cookies value.
         * @param key
         * @returns {any}
         */
        function getCookie(key) {
            const keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');

            if (!keyValue) {
                return false;
            }

            return keyValue[2] === 'true';
        }

        /**
         * Init on document ready.
         */
        $(function() {
            if (!getCookie(fCookieName)) {
                if (getCookie('CDCCOOKIESACCEPTED') === true) {
                    fThis.find('.close').show().css('display', 'flex');
                    fThis.find('.cookies-disabled').hide();
                }

                fThis.show();
            }

            fThis.find('.close').click(function () {
                setCookie(fCookieName, true);
                fThis.close();
            });
        });

        this.show = function () {
            fThis.slideDown();
        };

        this.close = function () {
            fThis.slideUp();
        };

        return this;
    }
})(jQuery);
