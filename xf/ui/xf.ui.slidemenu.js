
    /**
     Enhances headers view
     @param header DOM Object
     @private
     */
    XF.ui.slidemenu = {

        selector : '[data-role=slidemenu]',

        render : function (menu, options) {
            var jQMenu = $(menu);

            if (!menu || !jQMenu instanceof $ || jQMenu.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || XF.utils.uniqueID();
            options.title = options.title || '';
            options.hasTitle = options.title != '' ? true : false;
            options.isFixed = (options.fixed && options.fixed === true) ? true : false;
            options.buttons = options.buttons || [];
            options.html = jQMenu.html();

            jQMenu.attr({
                'data-id': options.id,
                'id': options.id,
                'data-skip-enhance' : 'true'
            }).addClass('xf-slidemenu-wrapper');

            var menuButton = '<button class="xf-slidemenu-button xf-button-float-' +jQMenu.data('button-position')  + ' xf-button-header-' +jQMenu.data('button-position')  + ' xf-button-small-icon-only xf-button-small xf-button" data-position="' +jQMenu.data('button-position')  + '" data-skip-enhance="true"><span class="xf-icon xf-icon-list xf-icon-small"></span></button>',
            menuButtonContainer = $('#' + jQMenu.data('button-container'));
            menuButtonContainer.find('header').append(menuButton);
            options.menuButton = '<button class="xf-slidemenu-close-button xf-button-float-' +jQMenu.data('button-position')  + ' xf-button-header-' +jQMenu.data('button-position')  + ' xf-button-small-icon-only xf-button-small xf-button" data-position="' +jQMenu.data('button-position')  + '" data-skip-enhance="true"><span class="xf-icon xf-icon-cross xf-icon-small"></span</button>';

            var buttons = jQMenu.find(XF.ui.button.selector);
            options.buttonsClass = '';

            for (var i = 0; i < buttons.length; ++i) {
                var button = buttons.eq(i);
                var butOpts = {
                    iconClass : button.attr('data-icon') ? 'xf-icon-' + button.attr('data-icon') : '',
                    dataHrefString : button.attr('data-href') ? button.attr('data-href') : '',
                    textClass : button.attr('data-text-class') ? button.attr('data-text-class') : '',
                    id : button.attr('data-id') ? button.attr('data-id') : options.id + '-item' + i,
                    class : button.attr('data-class') || '',
                    text : button.val() || button.text() || ''
                };
                options.buttons.push(butOpts);
            }

            XF.router.on('route', function () {
                XF.ui.slidemenu.selectButton(jQMenu);

                if ($('.xf-slidemenu-wrapper')) {
                    $('.xf-slidemenu-wrapper').removeClass('xf-slidemenu-show');
                    $('body').removeClass('blur-page');
                }
            });

            var _template = _.template(
                '<div class="xf-slidemenu-scrollable"><div class="xf-slidemenu-header"><%= title %><%= menuButton %></div>'
                + '<%= html %></div>'
            );

            jQMenu.html(_template(options));

            XF.trigger('ui:enhance', jQMenu);

            $('.xf-slidemenu-button').on('tap', function () {
                $('.xf-slidemenu-wrapper').addClass('xf-slidemenu-show xf-slidemenu-animation');
                $('body').addClass('blur-page xf-viewport-transitioning');
                return false;
            });
            $('.xf-slidemenu-close-button').on('tap', function () {
                var delayTime = XF.device.isIOS ? 300 : 0;
                setTimeout(function () {
                    $('.xf-slidemenu-wrapper').removeClass('xf-slidemenu-show');
                    $('body').removeClass('blur-page xf-viewport-transitioning');
                }, delayTime);
                return false;
            });

            this.selectButton(jQMenu);
        },

        selectButton : function (el) {
            var page = XF.history.fragment !== '' ? XF.history.fragment : 'home';
            el.find('a').removeClass('xf-slidemenu-item-active');
            el.find('a[data-href="#' + page + '"], a[href="#' + page + '"]').addClass('xf-slidemenu-item-active');
        }
    };