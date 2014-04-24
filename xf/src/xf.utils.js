define([
    './xf.core',
    'underscore',
    './xf.device'
], function(XF, _) {

    /**
     @namespace Holds all the reusable util functions
     */
    XF.utils = {};

    /**
     @namespace Holds all the reusable util functions related to Adress Bar
     */
    XF.utils.addressBar = {};

    XF.utils.uniqueID = function() {
        return 'xf-' + Math.floor(Math.random() * 100000);
    };

    return XF;
});