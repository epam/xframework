define([
    'jquery',
    'underscore',
    '../src/xf.core',
    '../src/xf.utils',
    '../ui/xf.ui.core'
], function($, _, XF) {

    /**
     Enhances headers view
     */
    XF.ui.header = {

        // Selectors will be used to detect header's element on the page
        selector : '[data-role=header]',

        render : function (header, options) {
            var jQHeader = $(header);

            if (!header || !(jQHeader instanceof $) || jQHeader.attr('data-skip-enhance') == 'true') {
                return;
            }

            // Detect if we have title
            var headerTitle = jQHeader.find('h1');
            if (headerTitle.length > 0) {
                headerTitle.addClass('xf-header-title');
            }

            // Set up options
            options.id = options.id || XF.utils.uniqueID();
            options.title = options.title || '';
            options.html = jQHeader.html();
            options.isFixed = (options.fixed && options.fixed === true) ? true : false;

            var parentPages = $(this.selector).parents('.xf-page'),
                siblingPages = $(this.selector).siblings('.xf-page');
                
            // Add additional class for parent node
            if (!_.isEmpty(parentPages) && options.isFixed) {
                parentPages.addClass('xf-has-header');
            }
            
            // Add additional class for siblings
            if (!_.isEmpty(siblingPages)) {
                siblingPages.addClass('xf-has-header');
            }

            jQHeader.attr({
                'data-id': options.id,
                'id': options.id,
                'data-skip-enhance' : 'true'
            });

            // Underscore template for header
            var _template = _.template(
                '<header class="xf-header <% if(isFixed) { %> xf-header-fixed <% } %>">' +
                '<%= html %>' +
                '</header>'
            );

            jQHeader.html(_template(options));
        }
    };

});
