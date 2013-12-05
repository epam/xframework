define([
    'jquery',
    'underscore',
    '../src/xf.core',
    '../src/xf.utils',
    '../ui/xf.ui.core'
], function($, _, XF) {

    /**
     Enhances footers view
     */
    XF.ui.tabs = {

        // Selectors will be used to detect tabs' element on the page
        selector : '[data-role=tabs]',

        render : function (tabs, options) {
            var jQTabs = $(tabs),
                _self = this;

            if (!tabs || !(jQTabs instanceof $) || jQTabs.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || XF.utils.uniqueID();
            options.tabsperrow = options.tabsperrow || 4;

            jQTabs.attr({
                'data-id': options.id,
                'id': options.id,
                'data-skip-enhance' : 'true'
            });

            options.tabs = options.tabs || [];
            
            // Detect buttons and count rows
            var buttons = jQTabs.find(XF.ui.button.selector);
            options.rowCount = Math.ceil(buttons.length / options.tabsperrow);
            options.tabsClass = options.tabsclass || '';

            var lastRowSize = buttons.length % options.tabsperrow;
            if(!lastRowSize) {
                lastRowSize = options.tabsperrow;
            }

            // Position buttons in rows
            for (var i = 0; i < buttons.length; ++i){
                var tab = buttons.eq(i),
                    x = i + 1,
                    tabOpts = {
                        className : ''
                    };

                if (x === 1) {
                    tabOpts.className += ' xf-corner-tl ';
                }

                if (x === options.tabsperrow || (options.rowCount == 1 && i == buttons.length)) {
                    tabOpts.className += ' xf-corner-tr ';
                }

                if (x == buttons.length + 1 - lastRowSize) {
                    tabOpts.className += ' xf-corner-bl ';
                }

                if (x === buttons.length) {
                    tabOpts.className += ' xf-corner-br ';
                }

                if (tab.attr('data-active')) {
                    tabOpts.className += ' xf-tabs-button-active ';
                }

                if (x > buttons.length - lastRowSize) {
                    tabOpts.gridClass = 'xf-grid-unit-1of' + lastRowSize;
                } else {
                    tabOpts.gridClass = 'xf-grid-unit-1of' + options.tabsperrow;
                }

                tabOpts.id = tab.attr('id') || options.id +'-item-' + i;
                tabOpts.text = tab.val() || tab.text() || '';
                tabOpts.params = tab.attr('data-params') || "{}";

                options.tabs.push(tabOpts);
            }

            // Underscore template for tabs
            var _template = _.template(
                '<ul class="xf-tabs">' +
                '<% _.each(tabs, function(tab) { %>' +
                '<li class="xf-grid-unit <%= tabsClass %> <%= tab.gridClass %>  ">' +
                '<a data-params="<%= tab.params %>" class="xf-tabs-button <%= tab.className %>" id="<%= tab.id %>">' +
                '<span class="xf-tabs-button-text"><%= tab.text %></span>' +
                '</a>' +
                '</li>' +
                '<% }); %>' +
                '</ul>'
            );

            jQTabs.html(_template(options));

            // Add tab selection' handler to buttons
            jQTabs.find('a').on('tap', function () {
               XF.ui.tabs.selectTab(jQTabs, $(this));
            });
        },

        // Method to show appropriate tab
        selectTab : function (parent, el) {
            parent.find('a').removeClass('xf-tabs-button-active');
            el.addClass('xf-tabs-button-active');
        }
    };

});
