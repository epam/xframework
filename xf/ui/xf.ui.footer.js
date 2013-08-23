
    /**
     Enhances footers view
     @param footer DOM Object
     @private
     */
    XF.UI.footer = {

        selector : 'footer, [data-role=footer]',

        render : function (footer, options) {
            var jQFooter = $(footer),
                _self = this;

            if (!footer || !jQFooter instanceof $ || jQFooter.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || 'xf-footer-component-' + Math.floor(Math.random()*10000);

            jQFooter.attr({
                'data-id': options.id,
                'id': options.id,
                'data-component' : 'footer',
                'data-skip-enhance' : 'true'
            });

            options.fixed = options.fixed === true ? true : false;
            options.buttons = options.buttons || [];

            if (options.fixed) {
                var parentPage = $(this.selector).parents('.xf-page');
                if (parentPage[0]) {
                    parentPage.addClass('xf-page-has-fixed-footer');
                } else {
                    XF.Device.getViewport().addClass('xf-viewport-has-fixed-footer');
                }
            }

            var buttons = jQFooter.find(XF.UI.button.selector);
            options.buttonsClass = 'xf-grid-unit-1of' + buttons.length;

            for (var i = 0; i < buttons.length; ++i) {
                var button = buttons.eq(i);
                var butOpts = {
                    iconClass : button.attr('data-icon') ? 'xf-icon-' + button.attr('data-icon') : '',
                    dataHrefString : button.attr('data-href') ? button.attr('data-href') : '',
                    textClass : button.attr('data-text-class') ? button.attr('data-text-class') : '',
                    id : button.attr('data-id') ? button.attr('data-id') : options.id + '-item' + i,
                    text : button.val() || button.text() || ''
                };
                options.buttons.push(butOpts);
            }

            XF.Router.on('route', function () {
                XF.UI.footer.selectButton(jQFooter);
            });

            var _template = _.template(
                '<div class="xf-footer <% if(fixed) { %> xf-footer-fixed <% } %>">\
                <ul class="xf-nav">\
                    <% _.each(buttons, function(button) { %>\
                    <li class="xf-grid-unit <%= buttonsClass %>">\
                        <a data-href="<%= button.dataHrefString %>" class="xf-nav-item xf-iconpos-top" id="<%= button.id %>">\
                            <div class="xf-icon xf-icon-big <%= button.iconClass %>"></div>\
                            <div class="xf-nav-item-text <%= button.textClass %>"><%= button.text %></div>\
                        </a>\
                    </li>\
                    <% }); %>\
                </ul>\
            </div>\
        '
            );

            jQFooter.html(_template(options));

            XF.UI.footer.selectButton(jQFooter);
        },

        selectButton : function (el) {
            var page = XF.history.fragment;
            el.find('.xf-nav a').removeClass('xf-nav-item-active');
            el.find('.xf-nav a[data-href="#' + page + '"]').addClass('xf-nav-item-active');
        }
    };