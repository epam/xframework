$(function () {

    XF.router = null;
    Backbone.History.started = false;

    var App = new XF.App({
        settings: {
            applicationVersion: '1.1',
            noCache: true,
            componentUrlPrefix: './components/',
            templateUrlPrefix: './'

        },
        animations: {
            standardAnimation: 'slideleft',
            types: {

            }
        },
        device: {
            types : [{
                name : 'tablet',
                range : {
                    max : null,
                    min : 569
                },
                templatePath : '',
                fallBackTo : 'default',
                defaultAnimation: 'fade'
            },
                {
                    name : 'mobile',
                    range : {
                        max : 568,
                        min : null
                    },
                    templatePath : '',
                    fallBackTo : 'default'
                }]
        }
    });

    module("XF.Core", {
        setup: function () {
            required = false;
        }
    });
    
    test("common", 1, function() {

        equal('XF' in window, true);
    });
    
    test("history", 2, function() {
        
        equal(XF.history.options.pushState, false);
        equal(XF.history.root, "/");
    });
    
    test("required component", 1, function() {
        
        XF.require('test', function () {
            required = true;
        });
        
        equal(required, true);
    });
});