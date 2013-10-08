$(function(){
	XF.defineComponent(
		'speaker',
		XF.Component.extend({

            View : XF.View.extend({
                useCache : false,
                afterLoadTemplateFailed : function() {
                    $('body').html('Something went wrong. Try to reload the page...');
                }
            }),

            Model : null,
            Collection: null

        })
	);

});