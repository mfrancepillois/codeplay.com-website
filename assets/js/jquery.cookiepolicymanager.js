/**
 * Copyright (C) 2022 Codeplay Software Limited
 * All Rights Reserved.
 *
 * @author Scott Straughan
 */

(function ($) {
    /**
     * Constructor.
     * @param privacyPolicyUrl
     * @param cookiePolicyUrl
     * @param cookieName
     * @returns {jQuery.CookiePolicyManager}
     * @constructor
     */
    $.fn.CookiePolicyManager = function (privacyPolicyUrl, cookiePolicyUrl, cookieName) {
        let fThis = this;
        this.fBlockBeforeAccepted = true;
        this.fPrivacyPolicyUrl = privacyPolicyUrl;
        this.fCookiePolicyUrl = cookiePolicyUrl;
        this.fCookieName = cookieName;
        this.fPopupElement = null;
        this.onAcceptedCallback = null;

        this.fPolicyPopupText = '' +
            '<p>Please note that we use cookies on this website to enhance your experience, provide ' +
            'features and to track how the website is used.</p>' +
            '<p>Please click <b>accept</b> to accept our privacy &amp; cookie polices or click <b>decline</b> to ' +
            'disable cookies and related features.';

        /**
         * Set the cookie on accepted callback function.
         * @param function
         */
        this.setOnCookieAcceptedCallback = function(callbackFn) {
            this.onAcceptedCallback = callbackFn;
        };

        /**
         * Sets the cookie policy acceptance.
         * @param value
         */
        this.setCookiePolicyAccepted = function(value) {
            setCookie(this.fCookieName, value);
        };

        /**
         * Check is cookies are allowed.
         * @returns {boolean}
         */
        this.isCookiePolicyAccepted = function() {
            if (getCookie(this.fCookieName)) {
                let cookie = getCookie(this.fCookieName);
                return cookie === true || cookie === 'true';
            }

            return false;
        };

        /**
         * Check is cookies are disallowed.
         * @returns {boolean}
         */
        this.isCookiePolicyRejected = function() {
            if (getCookie(this.fCookieName)) {
                let cookie = getCookie(this.fCookieName);
                return (cookie === false || cookie === 'false');
            }

            return false;
        };

        /**
         * Clear all cookies for this domain.
         */
        this.clearAllDomainCookies = function() {
            const cookies = document.cookie.split('; ');

            for (let c = 0; c < cookies.length; c++) {
                const domain = window.location.hostname.split('.');
                const cookieName = cookies[c].split('=')[0];

                // Skip the enabled/disable cookie
                if (cookieName === this.fCookieName) {
                    break ;
                }

                const cookieBase = encodeURIComponent(cookieName) + '=; expires=Thu, 01-Jan-1970 00:00:01 GMT'
                const cookieVariantsToDelete = [cookieBase];

                // Go through each domain possibility
                for (let currentCookie of cookieVariantsToDelete.slice(0)) {
                    while (domain.length > 0) {
                        cookieVariantsToDelete.push(currentCookie + '; domain=' + domain.join('.'));
                        domain.shift();
                    }
                }

                // Go through each cookie in the cookie variant array and add different path variants
                for (let currentCookie of cookieVariantsToDelete.slice(0)) {
                    const path = location.pathname.split('/');
                    while (path.length > 0) {
                        cookieVariantsToDelete.push(currentCookie + '; path=' + path.join('/'));
                        path.pop();
                    }

                    cookieVariantsToDelete.push(currentCookie + '; path=/;')
                }

                // Delete all the cookie variants
                for (let currentCookie of cookieVariantsToDelete) {
                    document.cookie = currentCookie;
                }
            }
        };

        /**
         * Checks if the policy has been set or not.
         * @returns {boolean}
         */
        this.isCookiePolicySet = function() {
            return !!getCookie(this.fCookieName);
        };

        /**
         * Show the popup.
         */
        this.showPopup = function() {
            if (this.fPopupElement) {
                this.fPopupElement.remove();
            }

            this.fPopupElement = $(createPopupElement());
            fThis.prepend(this.fPopupElement);
            this.fPopupElement.hide().fadeIn();

            this.fPopupElement.find('button.accept').click(() => {
                this.setCookiePolicyAccepted(true);

                if(this.onAcceptedCallback) {
                    this.onAcceptedCallback();
                }

                location.reload();
            });

            this.fPopupElement.find('button.reject').click(() => {
                this.clearAllDomainCookies();
                this.setCookiePolicyAccepted(false);

                location.reload();
            });

            return this.fPopupElement;
        };

        /**
         * Create a popup element.
         * @returns {*|jQuery|HTMLElement}
         */
        function createPopupElement() {
            let privacyPolicyTarget = '_self';
            let cookiePolicyTarget = '_self';

            // If urls starts with http, most likely external links in which we should open in separate tab
            if (fThis.fPrivacyPolicyUrl.startsWith('http')) {
                privacyPolicyTarget = '_blank';
            }

            if (fThis.fCookiePolicyUrl.startsWith('http')) {
                cookiePolicyTarget = '_blank';
            }

            return '<section id="cookie-policy-container" aria-label="Cookie Policy Popup">\n' +
                '    <div>\n' +
                '        <h1>Cookie Policy</h1>\n' +
                fThis.fPolicyPopupText +
                '        <ul>\n' +
                '            <li><a href="' + fThis.fPrivacyPolicyUrl + '" target="' + privacyPolicyTarget + '">' +
                'Privacy Policy</a></li>\n' +
                '            <li><a href="' + fThis.fCookiePolicyUrl + '" target="' + cookiePolicyTarget + '">' +
                'Cookie Policy</a></li>\n' +
                '        </ul>\n\n' +
                '        <button class="accept">Accept</button> <button class="reject">Decline</button>\n' +
                '    </div>\n' +
                '</section>';
        }

        /**
         * Create a placeholder element.
         * @returns {*|jQuery|HTMLElement}
         */
        this.createPolicyNotAcceptedPlaceholderElement = function(type) {
            let element = $('<div class="cookie-policy-not-accepted-placeholder">' +
                'This ' + type + ' is <b>disabled</b> as it requires cookies to be both accepted and enabled to ' +
                'function correctly. To enable this ' + type + ', please ' +
                '<a id="cookie-policy-change-settings"><b>click here to change your cookie policy settings</b></a>. '+
                '</div>');

            element.find('#cookie-policy-change-settings').click(() => {
                this.showPopup();
            });

            return element;
        };

        /**
         * Set (or create) a cookie with a value.
         * @param key
         * @param value
         */
        function setCookie(key, value) {
            let expires = new Date();
            expires.setTime(expires.getTime() + (365 * 24 * 60 * 60 * 1000));

            let cookieValue = key + '=' + value + ';expires=' + expires.toUTCString() + ';path=/;SameSite=Strict;';

            if (location.protocol === 'https:') {
                cookieValue += 'Secure;';
            }

            document.cookie = cookieValue;
        }

        /**
         * Get a specific cookies value.
         * @param key
         * @returns {any}
         */
        function getCookie(key) {
            let keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
            return keyValue ? keyValue[2] : null;
        }

        /**
         * Init on document ready.
         */
        $(function() {
            // Show the cookie policy
            if (!fThis.isCookiePolicySet()) {
                fThis.showPopup();
            }

            if (fThis.fBlockBeforeAccepted && !fThis.isCookiePolicyAccepted()) {
                fThis.clearAllDomainCookies();
            }

            if((fThis.fBlockBeforeAccepted && !fThis.isCookiePolicyAccepted()) || fThis.isCookiePolicyRejected()) {
                $('*').find('[data-requiresCookieAcceptance]').each(function() {
                    let type = 'feature';

                    if ($(this).prop('tagName').toLowerCase() === 'form') {
                        type = 'form'
                    }

                    $(this).replaceWith(
                        fThis.createPolicyNotAcceptedPlaceholderElement(type));
                });
            } else {
                $('*').find('[data-requiresCookieAcceptanceSwap]').each(function() {
                    const hotswap = $(this).attr('data-requiresCookieAcceptanceSwap').split(',');

                    if (hotswap.length !== 2) {
                        console.error('The element attribute requiresCookieAcceptanceSwap was used but the ' +
                            'value is in an incorrect format, should be TARGET,VALUE e.g. src,https://codeplay.com');
                    } else {
                        $(this).attr(hotswap[0], hotswap[1]);
                    }
                });
            }
        });

        return this;
    }
})(jQuery);
