$(function(){
	XF.defineComponent(
		'presentation',
		XF.Component.extend({
//            setEventID: function (id) {
//                this.options.eventID = id;
//                console.log("!!!!" + id);
//            },

            updateData : function () {
                XF.trigger('component:presentation:refresh');
            },

            construct: function () {
                var _self = this;
                XF.bind('component:presentation:fetched', function() {
                    _self.updateData();
                });
                this.updateData();
            },

            View : XF.View.extend({
                afterLoadTemplateFailed : function() {
                    $('body').html('Something went wrong. Try to reload the page...');
                },
                template : {
                    cache : false
                }
            }),
            Collection: XF.Collection.extend({
                url: function() {
                    return 'http://evbyminsd7001.minsk.epam.com:4502/bin/epamsec/event.id.json?token=' + XF.storage.get('token') + '&eventid=' + XF.router.EventID ;
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