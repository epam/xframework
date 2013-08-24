
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

            if (!loader || !jqLoader instanceof $ || jqLoader.attr('data-skip-enhance') == 'true') {
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

            jqLoader.attr({'id': id, 'data-skip-enhance' : 'true'});

            if (!$('#' + id).hasClass('xf-loader')) {
                $('#' + id).addClass('xf-loader');
            }

            return jqLoader;
        },

        show : function (jqLoader) {
            jqLoader.show();
        },

        hide : function (jqLoader) {
            jqLoader.hide();
        },

        remove : function (jqLoader) {
            jqLoader.detach();
            XF.UI.removeFromIsset('popup', jqLoader.attr('id'));
        },

        create : function () {
            var jqLoader = $('<div class="xf-loader" data-role="loader"></div>');
            XF.Device.getViewport().append(jqLoader);
            return this.render(jqLoader[0]);
        }
    };