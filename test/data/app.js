var App, something;

XF.define('App', function () {
    return new XF.App({

        settings: {
            applicationVersion: '1.1'+ Math.random(),
            noCache: true,
            componentUrlPrefix: 'js/components/',
            templateUrlPrefix: 'tmpl/',
            dataUrlPrefix: 'mocks/'

        },

        animations: {
            default: 'slideleft'
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
            '/': 			'home',
            'page1':	    'home',
            'page2':        'home'
        },

        home: function () {
        },

        page1: function () {
            "use strict";
        },

        page2: function () {
            "use strict";
        }
        }

    });
});

something = function(x) {
  if (x < 10) {
    return console.log("Less");
  } else if (x === 10) {
    return console.log("Equal");
  } else {
    return console.log("Greater");
  }
};
