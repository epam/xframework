$(function(){
	XF.start({

		settings: {
			applicationVersion: '1.1'+ Math.random(),
			noCache: true,
			componentUrlPrefix: 'js/components/',
			templateUrlPrefix: 'tmpl/',
			dataUrlPrefix: 'mocks/'

		},

		device: {
			types : [{
					name : 'tablet',
					range : {
						max : null,
						min : 569
					},
					templatePath : 'tablet/',
					fallBackTo : 'default'
				}, {
					name : 'mobile',
					range : {
						max : 568,
						min : null
					},
					templatePath : 'mobile/',
					fallBackTo : 'default'
			}]
		},

		router: {
			routes: {
				'': 			'home',
				'home2': 			'home2',
				'home3': 			'home3',
				'/*action/':	'action'
			},

			handlers: {
				home: function () {
					$('.xf-header > .xf-button-header-left').hide();
					XF.Controller.bind('app-header-component:constructed', function () {
						$('.xf-header > .xf-button-header-left').hide();
					});

					//if (XF.Device.type.name !== 'mobile') XF.Controller.trigger('menu:go', {hash: 'home'});

                    var pages = ['home', 'home2', 'home3'];

					XF.Controller.trigger('menu:go', {hash: pages[[Math.floor(Math.random() * pages.length)]]});

				},

				action : function(hash) {
					if (hash == 'about' && XF.Device.type.name !== 'mobile') $('.xf-header > .xf-button-header-left').hide();
					else $('.xf-header > .xf-button-header-left').show();

                    var pages = ['home', 'home2', 'home3'];

					XF.Controller.trigger('menu:go', {hash: pages[[Math.floor(Math.random() * pages.length)]]});

				}
			}
		}

	});

});