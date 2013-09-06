$(function () {

    $('body').append('<div><div data-cache="true" data-component="test" data-name="test" data-id="test"></div></div>');

    module("XF.Component", {
        setup: function () {

        }
    });

    test('component', 1, function () {
        equal($('#testcomponent').length, 1, 'Component add: ' + ($('#testcomponent').length === 1 ? true : false));
    });

});