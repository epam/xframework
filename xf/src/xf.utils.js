define([
    './xf.core',
    'underscore',
    './xf.device'
], function(XF, _) {

    /**
     @namespace Holds all the reusable util functions
     */
    XF.utils = {
        uniqueID: function() {
            return 'xf-' + Math.floor(Math.random() * 100000);
        }
    };

    return XF;
});