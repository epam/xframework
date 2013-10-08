$(function(){
	XF.defineComponent(
		'favourites',
		XF.Component.extend({

            View : XF.View.extend({
                useCache : false,
                afterLoadTemplateFailed : function() {
                    $('body').html('Something went wrong. Try to reload the page...');
                }
            }),

            Collection: XF.Collection.extend({
                url: 'http://evbyminsd7001.minsk.epam.com:4502/bin/epamsec/favorite.user.json?token=' + XF.storage.get('token'),
                parse: function (data) {

                    if (_.has(data, 'favoriteEvents')) {
                        return data.favoriteEvents;
                    }
                    else return data;
                }
            })

        })
	);

});