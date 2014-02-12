$(function() {

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

    module("XF.settings", {});

    test('applicationVersion', 1, function () {
        equal(XF.settings.applicationVersion, '1.1');
    });

    test('noCache', 1, function () {
        ok(XF.settings.noCache, true);
    });

    test('componentUrlPrefix', 1, function () {
        ok(XF.settings.componentUrlPrefix, 'components/');
    });

    test('templateUrlPrefix', 1, function () {
        ok(XF.settings.templateUrlPrefix, "./");
    });
});