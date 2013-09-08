XFramework
===========

# Getting started

## What is XFramework?

Version 0.9.1

XFramework (next XF) is a small yet powerful Javascript framework for quick development of cross-device web applications. Honestly saying, XF is a high-level framework based on [Backbone.js](http://backbonejs.org) that implements its own architecture paradigm, based on MV* on the component level.

XFramework makes it easy to reuse the application logic and provide various layouts or widgets for different devices based on the criteria that you define.

XFramework is designed to be extremely modular, flexible, fast, and easy to use. To develop an app in X-Framework a developer should be familiar with common web technologies such as HTML/CSS/JS, LESS for editing styles, Handlebars-style templating and have an understanding of how MV* architecture works. Experience using Backbone.js, Angular.js, Ember.js, jQuery Mobile or other framework will be helpful.

*TODO: update!*
XFramework currently features:

* A solid app architecture
* Separation of templates for different devices and/or screens
* Commonly needed reusable UI elements like headers, footers, tabs, lists, dialogs
* Touch-friendly form elements
* A set of vector icons



## Supported Platforms and Browsers

Mobile phones and tablets:

* iOS 5+: Mobile Safari, Chrome for Mobile, UC Browser on iPad 2 (iOS 5.1), iPhone 4S (iOS 5.1), iPhone 5 (iOS 5.1), iPad 3 (iOS 5.1)
* Android 2.3.3+: Android Browser, Opera Mobile, Chrome for Mobile, Firefox Mobile on Motorola Droid 3 (Android 2.3.4), HTC Inspire 4G (Android 2.3.3), ASUS Nexus 7 (Android 4.1), Samsung Nexus S (Android 2.3.4), Sony Ericsson Xperia X10 (Android 2.3.3)
* BlackBerry OS 6+: BlackBerry Browser on BlackBerry Torch 9800 (BlackBerry OS 6.0)

Desktop:

* Internet Explorer 8+
* Firefox 4+
* Safari 5+
* Opera 11+
* Chrome 18+

It doesn't mean that another browsers or platforms are not supported. We just don't have a possibility to test XF across all existing platforms and browsers.

The roadmap for the next versions can be found on [GitHub](https://github.com/epam/x-framework/issues).

## The idea behind

...

## Installing XFramework Generator

You don't need to download the source code from the repo, create  all the necessary files for the web app, writing two thousands line of code just to create a `Hello world!` app. XFramework Generator can make everything for you.

XF Generator has a number of dependencies such as:
* [node.js](http://nodejs.org)
* [NPM](https://npmjs.org)
* [Yeoman] (http://yeoman.io)

To install first two of them on Mac OS X or Windows computers you just need to download a package from [nodejs.org/download/](http://nodejs.org/download/). For other platforms see the [readme](https://npmjs.org/doc/README.html).

After installing node.js and npm go to terminal and install Yeoman writing `npm install -g yo` (with `sudo` if necessary).

Almost there! After these steps you need to install XF Generator with `npm install -g generator-xf`.

## Your first XF web app



[XF Hello World App](http://xframeworkjs.org/helloworld/)

## Building your XF app for testing and production

## Creation of custom XFramework build

## Updating XF and dependencies

# XFramework internals

## XF source modules

XFramework has its own building blocks that drives it on. Some blocks are mandatory to include in the build of XFramework, other ones are not required.

Mandatory XF src modules are:
* `xf.jquery.hooks.js`
* `xf.core.js`
* `xf.settings.js`
* `xf.app.js`
* `xf.router.js`
* `xf.pages.js`
* `xf.model.js`
* `xf.collection.js`
* `xf.view.js`
* `xf.component.js`

Optional XF src modules are:
* `xf.ui.js`
* `xf.ui.*.js`
* `xf.touch.js`
* `xf.utils.js`
* `xf.storage.js`
* `xf.zepto.support.js`


## XF.Router

`XF.Router` is an extended [Backbone.Router]. XF cares about creation of router instance, its starting, binding handlers and so on. Everything you just need to do is to pass your routes and handlers with starting options for the application

```javascript
	// if the app boilerplate was created via XF Generator
	// these lines cab be found in `index.js` file
	var app = new MyApp({
		// …
		// other settings for the application
    router: {
        routes: {
            '': 										'home',
            'search/:q':	  						'searchByQuery',
            'item:id':  							'showItemById',
						'books/:cat(/:subcat)':	'showBooksCategory',
						'news/*any':							'showNews'
        },

        home: function () {

        },

        searchByQuery: function (query) {

        },

        showItemById: function (id) {

        },

				showBooksCategory: function (cat, subcat) {

				},

				showNews: function (param) {

				}
    }
});
```

In the example above the handler `home` for empty route was created. In case you want to define the starting route for the application or turn off HTML5 pushState (using `pushState` support is turned on by default) you should pass the necessary starting parameters to `XF.history` which actually is a link to [Backbone.history](http://backbonejs.org/#History).

```javascript
var app = new MyApp({
		// …
		// other settings for the application
    history: {
				pushState: false,
				root: 'books/fiction'    
    }
});
```

## XF.pages

## XF.App



## XF.device

`XF.device` contains the information about current user device app was launched:
* `XF.device.supports.touchEvents`
* `XF.device.supports.pointerEvents`
* `XF.device.supports.cssAnimations`
* `XF.device.isMobile`. It was a necessary trick to detect mobile OS's using `navigator.userAgent`.
* `XF.device.type` is a selected type of devices from specified in options passed on the start of application. Based on this selected device type the necessary template for the component will be loaded.

```javascript
var app = new MyApp({
		// …
		// other settings for the application
    device: {
				types : [{
            name : 'tablet',
            range : {
                max : 1024,
                min : 569
            },
            templatePath : 'tablet/' // template path for tablet devices (by default it will be tmpl/tablet/componentName.tmpl)
        }, {
            name : 'phone',
            range : {
                max : 568,
                min : null
            },
            templatePath : 'phone/' // path to templates for phones (by default it	 will be tmpl/phone/componentName.tmpl)
        }]
    }
});
```

## XF.settings

This simple object contains the settings for the application, that could be overridden on the start:
* appVersion (default: `1.0.0`)
* noCache (default: `true`)
* componentUrlPrefix (default: `js/components/`)
* componentUrlPostfix (default: `.js`)
* componentUrl (default: `componentUrlPrefix + compName + componentUrlPostfix`)
* templateUrlPrefix (default: `tmpl/`)
* templateUrlPostfix (default: `.tmpl`)
* dataUrlPrefix (default: `''`)
* ajaxSettings (default: `{}`)

```javascript
var app = new MyApp({
		// …
		// other settings for the application
		settings: {
				appVersion: '2.0.1',

        dataUrlPrefix: 'http://api.example.com/',

        ajaxSettings: {
        	// settings that are provided to collections and models to fetch and sync the data
					// see $.ajax options	 
					crossDomain: true        
        }
    }
});	
```

## XF.touch

`XF.touch` makes the life in such a multidevice world easier — it is an adapter for all types of user contexts: touch screens, mouse, pointers.

For now it contains the following user interaction events:
* `tap`: it doesn't matter if it is a click or a touch to the screen. Just bind on tap events for all types of devices and that's it!
*`XF.touch` fixes the 300ms gap between click and touch events as well*
* `swipe`, `swipeUp`, `swipeDown`, `swipeLeft`, `swipeRight`

## XF.storage

`XF.storage` is just a wrapper for localStorage that allows you easily to interact with it: set, get, clear.

```javascript
XF.storage.set('booksCategory', 12);

XF.storage.get('booksCategory');

XF.storage.clear();
```

## XF.utils



## XF.zepto.support.js

**Attention**! Include this module on your own fear and risk. It is in experimental status right away.


# XFramework Components 

## Component
## Collection
## Model
## View
## List of built-in events

# UI Elements




