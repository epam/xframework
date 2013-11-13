$(function () {

    $('body').append('<div data-component="test" id="test" data-name="test" data-id="test"></div>');


    // XF.on('component:test:constructed', function () {
    //     module("XF.Component", {
    //         setup: function () {
    // 
    //         }
    //     });
    //     test('load', 1, function () {
    //         equal($('#testcomponent').length, 1, 'Component add: ' + ($('#testcomponent').length === 1 ? true : false));
    //     });
    // 
    //     test('ajax', 1, function () {
    //         equal(XF.getComponentByID('test').collection.models[0].attributes.status, "success");
    //     });
    // });
});