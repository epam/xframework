
    /**
     Enhances headers view
     @param header DOM Object
     @private
     */
    XF.ui.header = {

        selector : '[data-role=header]',

        render : function (header, options) {
            var jQHeader = $(header);

            if (!header || !jQHeader instanceof $ || jQHeader.attr('data-skip-enhance') == 'true') {
                return;
            }

            var headerTitle = jQHeader.find('h1');
            if (headerTitle.length > 0) {
                headerTitle.addClass('xf-header-title');
            }

            options.id = options.id || XF.utils.uniqueID();
            options.title = options.title || '';
            options.html = jQHeader.html();
            options.isFixed = (options.fixed && options.fixed === true) ? true : false;

            jQHeader.attr({
                'data-id': options.id,
                'id': options.id,
                'data-skip-enhance' : 'true'
            });

            var _template = _.template(
                '<header class="xf-header <% if(isFixed) { %> xf-header-fixed <% } %>">'
                + '<%= html %>'
                + '</header>'
            );

            jQHeader.html(_template(options));
        }
    };