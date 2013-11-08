$(function () {

    XF.on('component:test:constructed', function () {

        module("XF.touches", {
            setup: function () {

            }
        });

        test("tap", 1, function () {
            $('body').prepend($('#testcomponent').data('events'));
            $('#testcomponent').trigger('tap');
            equal(tap, true);
        });

        test("swipe", 1, function () {
            $('#testcomponent').trigger('swipe');
            equal(swipe, true);
        });

        test("swipeLeft", 1, function () {
            $('#testcomponent').trigger('swipeLeft');
            equal(swipeLeft, true);
        });

        test("swipeRight", 1, function () {
            $('#testcomponent').trigger('swipeRight');
            equal(swipeRight, true);
        });

        test("swipeUp", 1, function () {
            $('#testcomponent').trigger('swipeUp');
            equal(swipeUp, true);
        });

        test("swipeDown", 1, function () {
            $('#testcomponent').trigger('swipeDown');
            equal(swipeDown, true);
        });
    });

});