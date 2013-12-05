$(function () {

    $('body').append('<div data-component="test" id="test" data-name="test" data-id="test"></div>');


    XF.on('component:test:constructed', function () {
        
        module("XF.Component", {
            setup: function () {
    
            }
        });
        
        test('defaults', 5, function () {
            equal(XF.getComponentByID('test').id, 'test');
            equal('test' in XF.getRegisteredComponents(), true);
            equal(XF.getComponentByID('test').defaults.autoload, true);
            equal(XF.getComponentByID('test').defaults.autorender, true);
            equal(XF.getComponentByID('test').defaults.updateOnShow, false);
        });
        
        test('model', 2, function () {
            equal(XF.getComponentByID('test').model, null);
            equal(XF.getComponentByID('test').Model, null);
        });
        
        test('collection', 2, function () {
            equal(XF.getComponentByID('test').Collection.isPrototypeOf(XF.Collection), false);
            equal(XF.getComponentByID('test').collection.url, 'test.json');
        });
        
        test('view', 2, function () {
            equal(XF.getComponentByID('test').View.isPrototypeOf(XF.View), false);
            equal(XF.getComponentByID('test').view.useCache, false);
        });
        
        test('load', 1, function () {
            equal($('#testcomponent').length, 1, 'Component add: ' + ($('#testcomponent').length === 1 ? true : false));
        });
    
        test('ajax', 1, function () {
            equal(XF.getComponentByID('test').collection.models[0].attributes.status, "success");
        });
    });
});