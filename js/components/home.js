$(function(){
	XF.defineComponent(
		'home',
		XF.RootComponent.extend({

            viewClass : XF.View.extend({
                useCache : false,
                afterLoadTemplateFailed : function() {
                    $('body').html('Something went wrong. Try to reload the page...');
                },
                postRender : function() { 
                    SyntaxHighlighter.defaults['gutter'] = true;
                    SyntaxHighlighter.defaults['pad-line-numbers'] = true;
                    SyntaxHighlighter.highlight();
                }
            }),

            modelClass : XF.Model.extend({
                isEmptyData : true
            })

        })
	);

});