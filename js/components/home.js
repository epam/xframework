$(function(){
	XF.defineComponent(
		'home',
		XF.Component.extend({

            View : XF.View.extend({
                useCache : false,
                afterLoadTemplateFailed : function() {
                    $('body').html('Something went wrong. Try to reload the page...');
                },
                afterRender : function () {
                    $('#firstTabs a').on('tap', function(){
                        var id = $(this).attr('data-params');
                        $(".tabs-list > li").hide();
                        $('#tab_'+id).show();
                    });
                }
            }),

            Model : null,
            Collection: null

        })
	);

});