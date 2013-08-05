

    /**
     @namespace Holds all the logic related to UI elements enhancement
     */
    XF.UIElements = {};

    _.extend(XF.UIElements, /** @lends XF.UIElements */ {

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

            _.each(XF.UIElements.enhancementList, function(enhancement, index, enhancementList) {
                jqObj.find(enhancement.selector).not('[data-skip-enhance=true]').each( function(){
                    var skip = false;
                    _.each(XF.UIElements.enhanced.length, function(elem, index, enhancementList) {
                        if(XF.UIElements.enhanced[i] === this) {
                            skip = true;
                        }
                    });
                    if(!skip & $(this).attr('data-skip-enhance') != 'true') {

                        XF.UIElements.enhanced.push(this);
                        XF.UIElements[enhancement.enhanceMethod](this);
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
        enhanced : []

    });
