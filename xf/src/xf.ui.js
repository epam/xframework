

    /**
     @namespace Holds all the logic related to UI elements enhancement
     */
    XF.UI = {};

    _.extend(XF.UI, /** @lends XF.UI */ {

        /**
         Reworks markup of a givven $ object
         @param jqObj $ item
         */
        enhanceView : function(jqObj) {

            if(!jqObj instanceof $) {
                jqObj = $(jqObj);
                if(!jqObj instanceof $) {
                    return;
                }
            }

            _.each(XF.UI.enhancementList, function(enhancement, index, enhancementList) {
                jqObj.find(enhancement.selector).not('[data-skip-enhance=true]').each( function(){
                    var skip = false;
                    _.each(XF.UI.enhanced.length, function(elem, index, enhancementList) {
                        if(XF.UI.enhanced[i] === this) {
                            skip = true;
                        }
                    });
                    if(!skip & $(this).attr('data-skip-enhance') != 'true') {
                        XF.UI.enhanced.push(this);
                        XF.UI[enhancement.enhanceElement].render(this);
                    }
                });
            });

        },

        /**
         A list of all the enhancements that whould be done of every $ object givven
         @type Object
         @private
         */
        enhancementList : {},

        /**
         A list of objects already enhanced (used to skip them while iterating through DOM)
         @type Array
         @private
         */
        enhanced : [],

        issetElements : [],

        checkInIsset : function (type, id) {
            var type = type || '',
                id = id || '',
                result = [];

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
            var type = type || '',
                id = id || '',
                result = [];

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
