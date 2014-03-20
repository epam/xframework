require("./main.js", function () {
    require.config({
        urlArgs: 'now=' + Date.now(),
        paths: {
            jquery: './../bower_modules/jquery/jquery',
            underscore: './../bower_modules/underscore/underscore',
            backbone: './../bower_modules/backbone/backbone',
            sinon: './../bower_modules/sinonjs/sinon'
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
            },
            'sinon': {
                exports: 'sinon'
            }
        }
    });

    requirejs([
        'src/app/start'
    ], function(/* remember: the test modules don't export anything */) {

        // All the test files have been loaded, and all the tests have been
        // defined--we're ready to start testing!
        QUnit.start();
    });
});
