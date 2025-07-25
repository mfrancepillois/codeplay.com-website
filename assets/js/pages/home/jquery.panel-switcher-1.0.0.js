/**
 * Copyright (C) 2021 Codeplay Software Limited
 * All Rights Reserved.
 *
 * @author Scott Straughan
 */

let PanelTimer = function(delay) {
    let fTimer = null;
    let fCallback = null;
    let fDelay = delay;
    let fStartTime = null;

    this.start = function(callback) {
        fCallback = callback;

        window.clearTimeout(fTimer);
        fStartTime = Date.now();
        fDelay = delay;
        fTimer = window.setTimeout(fCallback, fDelay);
    };

    this.stop = function() {
        window.clearTimeout(fTimer);
    };

    this.pause = function() {
        fDelay = fDelay - (Date.now() - fStartTime);
        window.clearTimeout(fTimer);
    };

    this.resume = function() {
        window.clearTimeout(fTimer);
        fTimer = window.setTimeout(fCallback, fDelay);
        fStartTime = Date.now();
    };
};

let debounceTimeout = null;
let Debounce = function() {
    this.run = function(callback) {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(function(){
            callback();
        }, 50);
    }
};

(function ($) {
    $.fn.PressReleasePanelSplash = function (panelContainer) {
        const PANEL_DISPLAY_TIME = 12000;
        const PANEL_SYNC_DELAY = 100;

        this.fPanelContainer = panelContainer;
        this.fPanelInnerContainer = panelContainer.find('.panels');

        this.fPanelTimer = new PanelTimer(PANEL_DISPLAY_TIME);
        this.fCurrentPanel = null;

        /**
         * Initialize the PR release panel switcher.
         */
        this.init = function() {
            const context = this;
            const debounce = new Debounce();

            this.fPanelContainer.find('.panel div.wrapper > div > div').on('mouseenter', function() {
                debounce.run(function() {
                    context.pause();
                });
            });

            this.fPanelContainer.find('.panel div.wrapper > div > div').on('mouseleave', function() {
                debounce.run(function() {
                    context.resume();
                });
            });

            this.setCurrentPanel(
                this.getAllPanels().first(), function() {});

            this.schedulePanelSwitch();

            this.fPanelContainer.find('#panel-left').click(function() {
                context.previous();
            });

            this.fPanelContainer.find('#panel-right').click(function() {
                context.next();
            });
        };

        /**
         * Pause any scheduled panel switches.
         */
        this.pause = function() {
            if (this.fPanelTimer) {
                this.fPanelTimer.pause();

                this.getCurrentPanel().find('.splash-zoom-image')
                    .addClass('paused');

                this.fPanelContainer.find('#panel-timer-container #panel-time')
                    .addClass('paused');
            }
        };

        /**
         * Resume any scheduled panel switches.
         */
        this.resume = function() {
            if (this.fPanelTimer) {
                this.fPanelTimer.resume();

                this.getCurrentPanel().find('.splash-zoom-image')
                    .removeClass('paused');

                this.fPanelContainer.find('#panel-timer-container #panel-time')
                    .removeClass('paused');
            }
        };

        this.next = function() {
            this.switchToPanel(
                this.getNextPanel());
        };

        this.previous = function() {
            this.switchToPanel(
                this.getPreviousPanel());
        };

        /**
         * Schedule a panel to be switched.
         */
        this.schedulePanelSwitch = function() {
            const context = this;

            context.resetTimer();

            this.fPanelTimer.start(function() {
                console.log("Switching panel now.");
                context.switchToPanel(
                    context.getNextPanel());
            });
        };

        /**
         * Get the current showing panel.
         * @returns {*|number|bigint}
         */
        this.getCurrentPanel = function() {
            return this.fPanelInnerContainer.find('.panel.visible');
        };

        /**
         * Get all panels.
         * @returns {*|number|bigint}
         */
        this.getAllPanels = function() {
            return this.fPanelInnerContainer.find('.panel');
        };

        /**
         * Get the next panel to show.
         * @returns {*|[*]}
         */
        this.getNextPanel = function () {
            let nextPanelIndex = this.fCurrentPanel.index() + 1;

            if (nextPanelIndex > (this.getAllPanels().length - 1)) {
                nextPanelIndex = 0;
            }

            return this.fPanelInnerContainer.find('.panel').eq(nextPanelIndex);
        };

        /**
         * Get the previous panel to show.
         * @returns {*|[*]}
         */
        this.getPreviousPanel = function () {
            let previousPanelIndex = this.fCurrentPanel.index() - 1;

            if (previousPanelIndex < 0) {
                previousPanelIndex = this.fPanelInnerContainer.find('.panel:last-of-type').index();
            }

            return this.fPanelInnerContainer.find('.panel').eq(previousPanelIndex);
        };

        /**
         * Switch to to the next panel.
         */
        this.switchToPanel = function(targetPanel) {
            const context = this;

            if(context.fPanelTimer) {
                context.fPanelTimer.stop();
            }

            if(targetPanel.index() === 0) {
                changeSplashImage('brain', true);
            }

            setTimeout(function() {
                context.getCurrentPanel().find('.splash-zoom-image')
                    .fadeOut();

                context.getCurrentPanel().fadeOut(function() {
                    $(this).removeClass('visible');

                    context.setCurrentPanel(targetPanel, function() {
                        context.schedulePanelSwitch();
                    });
                });
            }, PANEL_SYNC_DELAY);
        };

        /**
         * Reset the panel switcher timer.
         */
        this.resetTimer = function() {
            this.fPanelContainer.find('#panel-timer-container #panel-time')
                .removeClass('animated')
                .width(0)
                .addClass('animated');
        };

        /**
         * Set the current showing panel.
         * @param panel
         * @param onVisibleCallback
         */
        this.setCurrentPanel = function(panel, onVisibleCallback = null) {
            this.fCurrentPanel = panel;

            const context = this;

            context.fCurrentPanel.find('.splash-zoom-image')
                .removeClass('animate')
                .fadeIn();

            this.fCurrentPanel.addClass('visible').fadeIn(function() {
                if (onVisibleCallback)
                    onVisibleCallback();

                context.fCurrentPanel.find('.splash-zoom-image')
                    .addClass('animate')
            });
        };

        /**
         * Called when the document is ready.
         */
        $(document).ready(() => {
            this.init();
        });

        return this;
    }
})(jQuery);
