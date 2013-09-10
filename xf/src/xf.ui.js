

    /**
     @namespace Holds all the logic related to ui elements enhancement
     */
    XF.ui = {};

    _.extend(XF.ui, /** @lends XF.ui */ {

        init: function () {
            XF.on('ui:enhance', _.bind(XF.ui.enhance, XF.ui));
        },

        /**
         Reworks markup of a givven $ object
         @param jqObj $ item
         */

        enhance : function (jqObj) {
            if (!(jqObj instanceof $)) {
                jqObj = $(jqObj);

                if (!jqObj instanceof $) {
                    return;
                }
            }

            _.each(XF.ui, function (enhancement, index) {

                if (typeof enhancement === 'object' && enhancement.hasOwnProperty('selector')) {

                    jqObj.find(enhancement.selector).not('[data-skip-enhance=true]').each(function (){
                        var skip = false;

                        _.each(XF.ui.enhanced.length, function (elem, index) {

                            if (XF.ui.enhanced[i] === this) {
                                skip = true;
                            }
                        });

                        if (!skip & $(this).attr('data-skip-enhance') != 'true') {
                            var options = $(this).data();
                            XF.ui.enhanced.push(this);
                            enhancement.render(this, options);
                        }
                    });
                }
            });

        },

        /**
         A list of objects already enhanced (used to skip them while iterating through DOM)
         @type Array
         @private
         */
        enhanced : [],

        issetElements : [],

        checkInIsset : function (type, id) {
            type = type || '';
            id = id || '';
            var result = [];

            for (var i in this.issetElements) {

                if (id === '') {

                    if (this.issetElements[i].type === type) {
                        result.push(this.issetElements[i].id);
                    }
                } else {

                    if (this.issetElements[i].type === type && this.issetElements[i].id === id) {
                        result.push(this.issetElements[i].id);
                    }
                }
            }

            return result;
        },

        removeFromIsset : function (type, id) {
            type = type || '';
            id = id || '';
            var result = [];

            for (var i in this.issetElements) {

                if (id === '') {

                    if (this.issetElements[i].type !== type) {
                        result.push(this.issetElements[i]);
                    }
                } else {

                    if (this.issetElements[i].type !== type && this.issetElements[i].id !== id) {
                        result.push(this.issetElements[i]);
                    }
                }
            }

            this.issetElements = result;
        }

    });
