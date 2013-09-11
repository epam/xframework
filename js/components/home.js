$(function(){
	XF.defineComponent(
		'home',
		XF.Component.extend({

            View : XF.View.extend({
                afterLoadTemplateFailed : function() {
                    $('body').html('Something went wrong. Try to reload the page...');
                },
                afterRender : function () {
                    $('#firstTabs a').on('tap', function(){
                        var id = $(this).attr('data-params');
                        $(".tabs-list > li").hide();
                        $('#tab_'+id).show();
                    });
                },
                template : {
                    cache : false
                }
            }),

            Collection: XF.Collection.extend({
                url: 'http://evbyminsd7001.minsk.epam.com:4502/bin/epamsec/tracks.json?token=' + XF.storage.get('token'),
                parse: function (data) {

                    if (_.has(data, 'tracks')) {
                        return data.tracks;
                    }
                    else return data;
                }
            })

        })
	);

});