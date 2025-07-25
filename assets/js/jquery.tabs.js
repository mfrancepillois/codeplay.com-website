/**
 * Copyright (C) 2020 Codeplay Software Limited
 * All Rights Reserved.
 *
 * jQuery plugin that creates tabs.
 *
 * @author Scott Straughan
 */

(function ($) {
    $.fn.Tabs = function (callback) {
        $(this).each(function () {
            let $this = this;

            $(document).ready(function () {
                let initiallySelected = $($this).find('.tab-list .selected');

                $this.hideTabs();
                $($this).find('.tab-list a').click(function(e) {
                    e.preventDefault();
                    $this.setTab($(this));
                });

                $this.setTab(initiallySelected);
            });

            this.setTab = function(tabElement) {
                $this.hideTabs();

                $($this).find('.tab-content').each(function(index) {
                    if($(this).data('for') === tabElement.data('name')) {
                        tabElement.addClass('selected');

                        if(callback) {
                            callback($(this));
                        }

                        return $(this).show();
                    }
                });
            };

            this.hideTabs = function() {
                $($this).find('.tab-list > *').removeClass('selected');
                $($this).find('.tab-content').hide();
            };
        });
    };
})(jQuery);

$(document).ready(() => {
    // Initialize the navigation bar
    $('.tabs:not(.noinit)').Tabs();
});
