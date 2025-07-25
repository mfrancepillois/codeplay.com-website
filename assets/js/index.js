---
---

const config = {
    recaptchaSiteKey: '{{site.recaptcha_site_key}}'
};

// Global
let cookiePolicyManager = null;

// Needs to be outside document ready
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}

// Initialize
$(function() {
    cookiePolicyManager = $('body').CookiePolicyManager(
        '/company/privacy/',
        '/company/cookies/',
        'CDCCOOKIESACCEPTED');

    cookiePolicyManager.setOnCookieAcceptedCallback(() => {
        gtag('event', 'privacy_policy_accepted', {
            'event_category' : 'Privacy',
            'event_label' : 'A user has pressed accept and accepted the website privacy and cookie policy.'
        });
    });

    // Only look google analytics if cookie policy accepted
    if(cookiePolicyManager.isCookiePolicyAccepted()) {
        // Google recaptcha and analytics
        $.getScript('https://www.recaptcha.net/recaptcha/api.js?render=explicit&onload=onCaptchaLoadedCallback');
    }

    $('li.menu li').each(function(){
        let link = $(this).find('> a');
        let linkHref = link.attr('href');

        if(link.data('href')) {
            linkHref = link.data('href');
        }

        link.parent().removeClass('selected');
        if(linkHref === '/') {
            if(window.location.pathname === '' || window.location.pathname === '/'){
                link.parent().addClass('selected');
            }
        } else {
            if(window.location.pathname.includes(linkHref) || window.location.pathname === linkHref) {
                link.parent().addClass('selected');
            }
        }
    });

    $(window).scroll(function() {
        $('body').attr('data-scrollposition', $(document).scrollTop());
    });

    $('body').attr('data-scrollposition', $(document).scrollTop());

    // Copyright
    $('main').CopyrightText($('footer .copyright'));

    // Splash video loader
    $('.splash-bg-loader').each(function() {
        let ele = $(this);
        let fadeTo = 0.02;

        if (ele.data('fade-to')) {
            fadeTo = ele.data('fade-to')
        }

        ele.find(">:first-child").fadeTo(1000, fadeTo);
    });

    // Basic form after send
    if(window.location.hash === '#form-after-send') {
        const el = $('#form-after-send');
        el.parent().show();
        el[0].scrollIntoView(true);
    }

    // If any forms use captcha, set them as invalid until the captcha has been set
    $('form').each(function() {
        const currentForm = $(this);
        if (currentForm.find('.g-recaptcha').length) {
            currentForm.data("is-valid", "false");
        }
    });

    // Show the alert banner
    $('#top-alert').AlertBanner();

    function stopScrolling (e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    // Block scrolling on main menu
    const mql = window.matchMedia("(min-width: 800px)");
    $('.menu li.drop').mouseenter(function() {
        if (mql.matches) {
            window.addEventListener('wheel', stopScrolling, {passive: false} );
        }
    }).mouseleave(function() {
        removeEventListener('wheel', stopScrolling)
    });

    // Main menu drop menu
    let setTimeoutConst;
    $('.drop').hover(function() {
        const element = $(this);
        setTimeoutConst = setTimeout(function() {
            element.addClass('focused');
        }, 200);
    }, function() {
        clearTimeout(setTimeoutConst);
        $(this).removeClass('focused');
    });
});

function onCaptchaLoadedCallback() {
    // Recaptcha setup
    $(document).ready(() => {
        $('form').each(function() {
            const currentForm = $(this);
            const captchaElement = currentForm.find('.g-recaptcha');

            if (captchaElement.length) {
                grecaptcha.render(captchaElement[0], {
                    'sitekey': config.recaptchaSiteKey,
                    'callback': function(response) {
                        currentForm.data("is-valid", "true");
                        // Dispatch change event
                        currentForm.find(':input').trigger("change");
                    }
                });
            }
        });
    });
}
