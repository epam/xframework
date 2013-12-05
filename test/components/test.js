$(function () {
    XF.defineComponent(
		'test',
		XF.Component.extend({

            View : XF.View.extend({
                useCache : false,
                afterRender : function () {
                    $('#testcomponent').on('tap', function () {
                        tap = true;
                    }).on('swipe', function () {
                        swipe = true;
                    }).on('swipeLeft', function () {
                        swipeLeft = true;
                    }).on('swipeRight', function () {
                        swipeRight = true;
                    }).on('swipeUp', function () {
                        swipeUp = true;
                    }).on('swipeDown', function () {
                        swipeDown = true;
                    });

                    $('button').on('tap', function() {
                        alert(49);
                    });
                }
            }),

            Model : null,
            Collection: XF.Collection.extend({
                url : 'test.json'
            })

        })
	);
});