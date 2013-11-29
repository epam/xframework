define(['../xf/src/xf.framework'], function (XF) {

    return XF.App.extend({
        initialize: function () {
            XF.ui.loader.show();
            XF.once('component:menu:constructed', XF.ui.loader.hide);
        }
    });
});
