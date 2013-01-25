$(function(){
	XF.defineComponent(
		'home-pageswitch',
		XF.RootComponent.extend({

            viewClass : XF.View.extend({
                useCache : false,
                afterLoadTemplateFailed : function() {
                    $('body').html('Something went wrong. Try to reload the page...');
                },
                postRender : function() { 
                }
            }),

            modelClass : XF.Model.extend({
                isEmptyData : true
            })

        })
	);

});