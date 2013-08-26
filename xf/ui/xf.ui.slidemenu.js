
    /**
     Enhances headers view
     @param header DOM Object
     @private
     */
    XF.UI.slidemenu = {

        selector : '[data-role=slidemenu]',

        render : function (menu, options) {
            var jQMenu = $(menu);

            if (!menu || !jQMenu instanceof $ || jQMenu.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || 'xf-header-component-' + Math.floor(Math.random()*10000);
            options.title = options.title || '';
            options.hasTitle = options.title != '' ? true : false;
            options.isFixed = (options.fixed && options.fixed === true) ? true : false;

            jQMenu.attr({
                'data-id': options.id,
                'id': options.id,
                'data-skip-enhance' : 'true'
            });

            var buttons = jQMenu.find(XF.UI.button.selector);
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
                '<header class="xf-header <% if(isFixed) { %> xf-header-fixed <% } %>">'
                + '<%= html %>'
                + '<% if(hasTitle) { %>'
                + '<h1 class="xf-header-title"><%= title %></h1>'
                + '<% } %>'
                + '</header>'
            );

            jQMenu.html(_template(options));
        },

        selectButton : function (el) {
            var page = XF.history.fragment;
            el.find('.xf-slidemenu a').removeClass('xf-slidemenu-item-active');
            el.find('.xf-slidemenu a[data-href="#' + page + '"]').addClass('xf-slidemenu-item-active');
        }
    };