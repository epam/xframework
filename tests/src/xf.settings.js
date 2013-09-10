$(function() {

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