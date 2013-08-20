//
//    /**
//     Enhances footers view
//     @param footer DOM Object
//     @private
//     */
//    XF.UI.footer = {
//
//        selector : '[data-component=footer]',
//
//        render : function (header, options) {
//            var jQHeader = $(header);
//
//            if (!header || !jQHeader instanceof $ || jQHeader.attr('data-skip-enhance') == 'true') {
//                return;
//            }
//
//            var dataid = jQHeader.attr('data-id') || 'xf-footer-component-' + Math.floor(Math.random()*10000);
//            options = options || {};
//
//            jQHeader.attr({'data-id': dataid, 'id': dataid, 'data-component' : 'footer', 'data-skip-enhance' : 'true'});
//
//            options.hasTitle = (options.title && options.title != '');
//            options.buttons = options.buttons || [];
//            options.headerElement = options.headerElement || 'header';
//            options.isFixed = options.isFixed || false;
//            options.buttonsClass = options.buttonsClass || '';
//            options.titleClass = options.titleClass || '';
//
//            for (var i in options.buttons) {
//                var button = options.buttons[i];
//                button.align = button.align || 'left';
//                button.data = button.data || {};
//                button.buttonClass = button.buttonClass || '';
//                button.buttonClass += 'xf-button-header-' + button.align + ' ';
//
//                if (button.isBackBtn) {
//                    button.buttonClass += 'xf-button-small xf-button-back ';
//                }
//
//                if (button.isSpecial) {
//                    button.buttonClass += 'xf-button-special ';
//                }
//
//                button.hasText = button.isBackBtn || (button.text && button.text != '');
//
//                if (button.hasText) {
//                    button.text = (button.isBackBtn ? 'Back' : '');
//                    if(button.text && button.text != '') {
//                        button.text = '' + button.text;
//                    }
//                    button.textClass = button.textClass;
//                }
//
//                button.hasIcon = ((button.icon && button.icon != '') || button.isBackBtn);
//
//                if (button.hasIcon) {
//
//                    if (button.isBackBtn) {
//                        button.icon = "left";
//                        button.buttonClass += 'xf-iconpos-left ';
//                    }
//                    button.icon = 'xf-icon-' + button.icon;
//                    button.iconClass = button.iconClass;
//                }
//
//                if (button.hasIcon && !button.hasText) {
//                    button.buttonClass += 'xf-button-small-icon-only ';
//                }
//
//                button.hasTooltip = (button.tooltip && button.tooltip != '');
//
//                if (button.hasTooltip) {
//                    button.tooltip = button.tooltip;
//
//                } else if (button.isBackBtn) {
//                    button.hasTooltip = true;
//                    button.tooltip = 'Go to Previous page';
//                }
//
//                button.id = dataid +'-item-' + i;
//
//                button.dataHrefString = '';
//
//                if (button.href) {
//                    button.dataHrefString = ' data-href="' + button.href + '" ';
//                } else if (button.isBackBtn) {
//                    button.dataHrefString = ' href="javascript:XF.history.goBack();" ';
//                }
//
//                options.buttons[i] = button;
//            }
//
//            var _template = _.template(
//                '<header class="xf-header <% if(isFixed) { %> xf-header-fixed <% } %>">\
//                <% _.each(buttons, function(button) { %>\
//                <a class="xf-button <%= button.buttonClass %>" <% _.each(button["data"], function(value, prop) { %> data-<%=prop%>="<%=value%>" <% }); %> <%= button.dataHrefString %> <% if(button.hasTooltip) { %> title="<%= button.tooltip %>" <% } %> id="<%= button.id %>">\
//                    <% if(button.hasText) { %>\
//                    <span class="xf-button-small-text <%= button.textClass %>"><%= button.text %></span>\
//                    <% } %>\
//                    <% if(button.hasIcon) { %>\
//                    <span class="xf-icon xf-icon-small <%= button.icon %> <%= button.iconClass %>"></span>\
//                    <% } %>\
//                </a>\
//                <% }); %>\
//                <% if(hasTitle) { %>\
//                <<%= headerElement %> class="xf-header-title <%= titleClass %>"><%= title %></<%= headerElement %>>\
//                <% } %>\
//               </header>'
//            );
//
//            jQHeader.html(_template(options));
//        }
//    };