
    /**
     Enhances loaders view
     @param loader DOM Object
     @private
     */
    XF.UI.loader = {

        selector : '[data-role=loader]',

        render : function (loader, options) {

            var jqLoader = $(loader),
                _self = this,
                options = options || {};

            if (!loader || !jqLoader instanceof $) {
                var jqLoader = $('<div class="xf-loader"></div>');
            }

            if (jqLoader.attr('data-skip-enhance') == 'true') {
                return;
            }


            var id = jqLoader.attr('id') || 'xf-' + Math.floor(Math.random() * 10000),
                idStack = XF.UI.checkInIsset('loader'),
                newId = false;

            for (var i in idStack) {

                if (newId) {

                    if (!$('#' + idStack[i]).length) {
                        id = idStack[i];
                        newId = true;
                    }
                }
            }

            if (!newId) {
                XF.UI.issetElements.push({type : 'loader', id : id});
            }

            jqLoader.attr('id', id);

            if (!$('#' + id).length) {
                XF.Device.getViewport().append(jqLoader);
            }

            if (!$('#' + id).hasClass('xf-loader')) {
                $('#' + id).addClass('xf-loader');
            }

            return jqLoader;
        },

        show : function (jqLoader) {
            jqLoader.show();
        },

        hide : function (jqLoader) {
            jqLoader.detach();
            XF.UI.removeFromIsset('popup', jqLoader.attr('id'));
        }
    };