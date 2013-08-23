
    /**
     Enhances headers view
     @param header DOM Object
     @private
     */
    XF.UI.header = {

        selector : '[data-role=header]',

        render : function (header, options) {
            var jQHeader = $(header);

            if (!header || !jQHeader instanceof $ || jQHeader.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || 'xf-header-component-' + Math.floor(Math.random()*10000);
            options.title = options.title || '';
            options.html = jQHeader.html();
            options.hasTitle = options.title != '' ? true : false;
            options.isFixed = (options.fixed && options.fixed === true) ? true : false;

            jQHeader.attr({
                'data-id': options.id,
                'id': options.id,
                'data-skip-enhance' : 'true'
            });

            var _template = _.template(
                '<header class="xf-header <% if(isFixed) { %> xf-header-fixed <% } %>">'
                + '<%= html %>'
                + '<% if(hasTitle) { %>'
                + '<h1 class="xf-header-title"><%= title %></h1>'
                + '<% } %>'
                + '</header>'
            );

            jQHeader.html(_template(options));
        }
    };