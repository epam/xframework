
    /**
     Enhances footers view
     @param footer DOM Object
     @private
     */
    XF.ui.footer = {

        selector : 'footer, [data-role=footer]',

        render : function (footer, options) {
            var jQFooter = $(footer),
                _self = this;

            if (!footer || !(jQFooter instanceof $) || jQFooter.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || XF.utils.uniqueID();

            jQFooter.attr({
                'data-id': options.id,
                'id': options.id,
                'data-role' : 'footer',
                'data-skip-enhance' : 'true'
            });

            options.fixed = options.fixed === true ? true : false;
            options.buttons = options.buttons || [];


            var parentPages = $(this.selector).parents('.xf-page'),
                siblingPages = $(this.selector).siblings('.xf-page');
            if (!_.isEmpty(parentPages) && options.isFixed) {
                parentPages.addClass('xf-has-footer');
            }
            if (!_.isEmpty(siblingPages)) {
                siblingPages.addClass('xf-has-footer');
            }

            var buttons = jQFooter.find(XF.ui.button.selector);
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

            XF.router.on('route', function () {
                XF.ui.footer.selectButton(jQFooter);
            });

            var _template = _.template(
                '<div class="xf-footer <% if(fixed) { %> xf-footer-fixed <% } %>">'
                + '<ul class="xf-nav">'
                + '<% _.each(buttons, function(button) { %>'
                + '<li class="xf-grid-unit <%= buttonsClass %>">'
                + '<a data-href="<%= button.dataHrefString %>" class="xf-nav-item xf-iconpos-top" id="<%= button.id %>">'
                + '<div class="xf-icon xf-icon-big <%= button.iconClass %>"></div>'
                + '<div class="xf-nav-item-text <%= button.textClass %>"><%= button.text %></div>'
                + '</a>'
                + '</li>'
                + '<% }); %>'
                + '</ul>'
                + '</div>'
            );

            jQFooter.html(_template(options));

            XF.ui.footer.selectButton(jQFooter);
        },

        selectButton : function (el) {
            var page = XF.history.fragment;
            el.find('.xf-nav a').removeClass('xf-nav-item-active');
            el.find('.xf-nav a[data-href="#' + page + '"]').addClass('xf-nav-item-active');
        }
    };