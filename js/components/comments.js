$(function(){
	XF.defineComponent(
		'comments',
		XF.Component.extend({

            View : XF.View.extend({
                useCache : false,
                afterLoadTemplateFailed : function() {
                    $('body').html('Something went wrong. Try to reload the page...');
                }
            }),


//            Collection:null
            Collection: XF.Collection.extend({
                url: function() {
                    return 'http://evbyminsd7001.minsk.epam.com:4502/bin/epamsec/comment.json?token=' + XF.storage.get('token') + '&eventid=' + XF.router.EventID ;
                },
                parse: function (data) {
                    if (_.has(data, 'comments')) {
                        data.comments = data.comments.reverse();
                        return data.comments;
                    }
                    else return data;
                }
            })

        })
	);

});