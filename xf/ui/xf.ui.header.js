
    /**
     Enhances headers view
     @param header DOM Object
     @private
     */
    XF.ui.header = {

        selector : '[data-role=header]',

        render : function (header, options) {
            var jQHeader = $(header);

            if (!header || !(jQHeader instanceof $) || jQHeader.attr('data-skip-enhance') == 'true') {
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

            var parentPages = $(this.selector).parents('.xf-page'),
                siblingPages = $(this.selector).siblings('.xf-page');
            if (!_.isEmpty(parentPages) && options.isFixed) {
                parentPages.addClass('xf-has-header');
            }
            if (!_.isEmpty(siblingPages)) {
                siblingPages.addClass('xf-has-header');
            }

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