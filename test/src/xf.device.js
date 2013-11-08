$(function() {

    module("XF.device", {});

    test('window size', 2, function () {
        var size = {
            width: window.outerWidth,
            height: $(window).height()
        };
        equal(XF.device.size.width, size.width, 'Width passed');
        equal(XF.device.size.height, size.height, 'Height passed');
    });

    test('device mobile', 1, function () {
        var mobile = true;
        ok(XF.device.isMobile !== mobile, 'Mobile: ' + XF.device.isMobile);
    });

    test('device iOS', 1, function () {
        var ios = true;
        ok(XF.device.isIOS !== ios, 'iOS: ' + XF.device.isIOS);
    });

    test('supports', 2, function () {
        var touches = true,
            pointer = true,
            cssAnims = true;
        ok(XF.device.supports.touchEvents !== touches, 'TouchEvents: ' + XF.device.supports.touchEvents);
        ok(XF.device.supports.pointerEvents !== pointer, 'PointerEvents: ' + (XF.device.supports.pointerEvents ? true : false));
    });
});