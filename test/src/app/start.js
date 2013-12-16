define([
    '../../../xf/src/app/start',
    '../../../xf/src/xf.core',
    'sinon'
], function(AppStart, XF, sinon) {

    var storageMock;
    var deviceMock;
    var touchMock;
    var uiMock;
    var routerExtend;
    var routerStartSpy;
    var pagesMock;
    var xfMock;

    module('AppStart', {
        setup: function() {
            delete XF.device.type.defaultAnimation;

            storageMock = sinon.mock(XF.storage);
            deviceMock = sinon.mock(XF.device);
            touchMock = sinon.mock(XF.touch);
            uiMock = sinon.mock(XF.ui);
            pagesMock = sinon.mock(XF.pages);
            xfMock = sinon.mock(XF);

            // Common expectations.
            storageMock.expects('init').withExactArgs().once();
            touchMock.expects('init').withExactArgs().once();
            uiMock.expects('init').withExactArgs().once();
            xfMock.expects('loadChildComponents').once();
            xfMock.expects('on').withArgs('xf:loadChildComponents');
            xfMock.expects('trigger').withExactArgs('app:started').once();

            // Mocks constructor of XF.router.
            XF.router = undefined;
            routerStartSpy = sinon.spy();
            routerExtend = XF.Router.extends;
            XF.Router.extend = function() {
                return function() {
                    // We need go deeper!
                    return {start: routerStartSpy}
                }
            };
        },
        teardown: function() {
            storageMock.verify();
            deviceMock.verify();
            pagesMock.verify();
            touchMock.verify();
            uiMock.verify();
            xfMock.verify();

            storageMock.restore();
            deviceMock.restore();
            pagesMock.restore();
            touchMock.restore();
            uiMock.restore();
            xfMock.restore();
            XF.Router.extend = routerExtend;
        }
    });


    test('With default values if empty object passed.', function() {
        deviceMock.expects('init').withExactArgs(undefined).once();
        pagesMock.expects('init').withExactArgs({standardAnimation: ''}).once();


        AppStart({});


        ok(routerStartSpy.calledOnce, 'XF.router.start has been called.');
        ok(routerStartSpy.calledWith({pushState: false}),
                'XF.router.start has been called with right param.');
    });


    test('Default values do not clean out passed options.', function() {
        deviceMock.expects('init').withExactArgs([{name : 'tablet'}]).once();
        pagesMock.expects('init').withExactArgs({
            standardAnimation: 'slideleft',
            types: {}}).once();


        AppStart({
            animations: {standardAnimation: 'slideleft', types: {}},
            device: {types : [{
                name : 'tablet'
            }]},
            history: {pushState: true},
            router: {'/': 'start'}
        });


        ok(routerStartSpy.calledOnce, 'XF.router.start has been called.');
        ok(routerStartSpy.calledWith({pushState: true}),
                'XF.router.start has been called with right param.');
    });

});
