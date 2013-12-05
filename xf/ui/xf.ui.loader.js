define([
    'jquery',
    '../src/xf.core',
    '../src/xf.utils',
    '../ui/xf.ui.core'
], function($, XF) {

/**
Enhances loaders view
*/
XF.ui.loader = {

    // Selectors will be used to detect loader's element on the page
    selector : '[data-role=loader]',

    render : function (loader, options) {

        var jqLoader = $(loader),
        _self = this;

        if (!options) {
            options = {};
        }
            
        if (!loader || !(jqLoader instanceof $) || jqLoader.attr('data-skip-enhance') == 'true') {
            return;
        }


        var id = jqLoader.attr('id') || XF.utils.uniqueID(),
        idStack = XF.ui.checkInIsset('loader'),
        newId = false;

        // Check if locader with the same ID was created before
        for (var i in idStack) {

            if (newId) {

                if (!$('#' + idStack[i]).length) {
                    id = idStack[i];
                    newId = true;
                }
            }
        }

        // If 'no', add new ID to the stack
        if (!newId) {
            XF.ui.issetElements.push({type : 'loader', id : id});
        }

        jqLoader.attr({'id': id, 'data-skip-enhance' : 'true'});

        if (!$('#' + id).hasClass('xf-loader')) {
            $('#' + id).addClass('xf-loader');
        }

        return jqLoader;
    },

    // Show loader or create newone and show it
    show : function (jqLoader) {
        jqLoader = jqLoader || this.create();
        jqLoader.show();
    },

    // Hide loader or hide all
    hide : function (jqLoader) {
        jqLoader = jqLoader || null;
        if (jqLoader === null) {
            $('.xf-loader').hide();
        } else {
            jqLoader.hide();
        }
    },

    // Remove loader's dom-element
    remove : function (jqLoader) {
        jqLoader.detach();
        XF.ui.removeFromIsset('popup', jqLoader.attr('id'));
    },

    // Add new loader to the page
    create : function () {
        var jqLoader = $('<div class="xf-loader" data-role="loader"><div class="xf-loader-content"><div class="loading"></div></div></div>');
        XF.device.getViewport().append(jqLoader);
        return this.render(jqLoader[0]);
    }
};

});
