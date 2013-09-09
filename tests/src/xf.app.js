$(function () {

    var tap = false,
        swipeLeft = false,
        swipeRight = false,
        swipeUp = false,
        swipeDown = false,
        swipe = false;

    App = new XF.App({

		settings: {
			applicationVersion: '1.1',
			noCache: true,
			componentUrlPrefix: 'components/',
			templateUrlPrefix: './'

		},

        animations: {
            standardAnimation: 'slideleft',
            types: {

            }
        },

		device: {
			types : [{
					name : 'tablet',
					range : {
						max : null,
						min : 569
					},
					templatePath : '',
					fallBackTo : 'default',
                    defaultAnimation: 'fade'
				}, {
					name : 'mobile',
					range : {
						max : 568,
						min : null
					},
					templatePath : '',
					fallBackTo : 'default'
			}]
		}

	});

    module("XF.App", {
        setup: function () {
            App = _.extend({
                testing : 101,
                initialize : function(options) {
                    this.testing = options.testing;
                }
            });
        }
    });

    test("initialize", 1, function () {
        equal(App.testing, 101);
    });

});