
    /**
     Enhances footers view
     @param footer DOM Object
     @private
     */
    XF.UI.tabs = {

        selector : '[data-role=tabs]',

        render : function (tabs, options) {
            var jQTabs = $(tabs),
                _self = this;

            if (!tabs || !jQTabs instanceof $ || jQTabs.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || 'xf-tabs-component-' + Math.floor(Math.random()*10000);
            options.tabsperrow = options.tabsperrow || 4;

            jQTabs.attr({
                'data-id': options.id,
                'id': options.id,
                'data-component' : 'tabs',
                'data-skip-enhance' : 'true'
            });

            options.tabs = options.tabs || [];

            var buttons = jQTabs.find(XF.UI.button.selector);
            options.rowCount = Math.ceil(buttons.length / options.tabsperrow);
            options.tabsClass = options.tabsclass || '';

            var lastRowSize = buttons.length % options.tabsperrow;
            if(!lastRowSize) {
                lastRowSize = options.tabsperrow;
            }

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
                    tabOpts.className += ' xf-tabs-button-active '
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

            var _template = _.template(
                '<ul class="xf-tabs">\
                    <% _.each(tabs, function(tab) { %>\
                    <li class="xf-grid-unit <%= tabsClass %> <%= tab.gridClass %>  ">\
                        <a data-params="<%= tab.params %>" class="xf-tabs-button <%= tab.className %>" id="<%= tab.id %>">\
                        <span class="xf-tabs-button-text"><%= tab.text %></span>\
                        </a>\
                    </li>\
                    <% }); %>\
                </ul>\
        '
            );

            jQTabs.html(_template(options));

            jQTabs.find('a').on('tap', function () {
               XF.UI.tabs.selectTab(jQTabs, $(this));
            });
        },

        selectTab : function (parent, el) {
            parent.find('a').removeClass('xf-tabs-button-active');
            el.addClass('xf-tabs-button-active');
        }
    };