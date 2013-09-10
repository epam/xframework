$(function () {

    var lastUrl = null,
        lastRoute = null,
        bar = null;

    var onRoute = function (router, route, args) {
        lastRoute = route;
        lastArgs = args;
        alert(router)
    };

    var Location = function(href) {
        this.replace(href);
    };

    module("XF.router", {
        setup: function () {
            XF.router.on('route', onRoute);
        }
    });

    test('getPageNameFromFragment', 1, function () {
        location.replace('#test/2');
        XF.history.checkUrl();
        equal(XF.router.getPageNameFromFragment(XF.history.fragment), 'test');
    });

    test('bindAnyRoute', 1, function () {
        bar = XF.router.bindAnyRoute;
        XF.router.bindAnyRoute = function () {
            location.replace('#bind');
        }();
        XF.history.checkUrl();
        equal(XF.router.getPageNameFromFragment(XF.history.fragment), 'bind');
        XF.router.bindAnyRoute = bar;
    });

});