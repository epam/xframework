/* ExcludeStart */
require.config({
    paths: {
        jquery: './../bower_modules/jquery/jquery',
        underscore: './../bower_modules/underscore/underscore',
        backbone: './../bower_modules/backbone/backbone'
    },
    shim: {
        'jquery': {
            exports: 'jQuery'
        },
        'backbone': {
            //These script dependencies should be loaded before loading
            //backbone.js
            deps: ['underscore', 'jquery'],
            //Once loaded, use the global 'BB' as the
            //module value.
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        }
    }
});
/* ExcludeEnd */

define([
    './xf.core',
    './xf.app',
    './xf.touch',
    './xf.router',
    './xf.utils',
    './xf.pages',
    './xf.settings',
    './xf.storage',
    './xf.device',
    './xf.collection',
    './xf.model',
    './xf.view',
    './xf.component',
    './xf.ui',
    'underscore'
], function(XF) {

    return XF;
});
