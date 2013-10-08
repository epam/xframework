$(function(){
	XF.defineComponent(
		'presentation',
		XF.Component.extend({
            View : XF.View.extend({
                afterRender : function () {
                    XF.trigger('component:favevent:refresh');
                },
                afterLoadTemplateFailed : function() {
                    $('body').html('Something went wrong. Try to reload the page...');
                },
                template : {
                    cache : false
                }
            }),
            Collection: XF.Collection.extend({
                url: function() {
                    return 'http://evbyminsd7001.minsk.epam.com:4502/bin/epamsec/event.id.json?token=' + XF.storage.get('token') + '&eventid=' + XF.storage.get('id') ;
                },
                parse: function (data) {
                    if (_.has(data, 'event')) {
                        return data.event;
                    }
                    else return data;
                }
            })

        })
	);

});