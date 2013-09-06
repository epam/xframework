$(function () {
    XF.defineComponent(
		'test',
		XF.Component.extend({

            View : XF.View.extend({
                useCache : false
            }),

            Model : null,
            Collection: null

        })
	);
});