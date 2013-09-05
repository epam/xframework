
    /**
     Enhances loaders view
     @param loader DOM Object
     @private
     */
    XF.ui.loader = {

        selector : '[data-role=loader]',

        render : function (loader, options) {

            var jqLoader = $(loader),
                _self = this,
                options = options || {};

            if (!loader || !jqLoader instanceof $ || jqLoader.attr('data-skip-enhance') == 'true') {
                return;
            }


            var id = jqLoader.attr('id') || XF.utils.uniqueID(),
                idStack = XF.ui.checkInIsset('loader'),
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
                XF.ui.issetElements.push({type : 'loader', id : id});
            }

            jqLoader.attr({'id': id, 'data-skip-enhance' : 'true'});

            if (!$('#' + id).hasClass('xf-loader')) {
                $('#' + id).addClass('xf-loader');
            }

            return jqLoader;
        },

        show : function (jqLoader) {
            jqLoader = jqLoader || this.create();
            jqLoader.show();
        },

        hide : function (jqLoader) {
            jqLoader.hide();
        },

        remove : function (jqLoader) {
            jqLoader.detach();
            XF.ui.removeFromIsset('popup', jqLoader.attr('id'));
        },

        create : function () {
            var jqLoader = $('<div class="xf-loader" data-role="loader"></div>');
            XF.device.getViewport().append(jqLoader);
            return this.render(jqLoader[0]);
        }
    };