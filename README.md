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

XFramework has its own building blocks that drive it on. Some blocks are mandatory to include in the build of XFramework, other ones are not required.

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


## XF.App

`XF.App` is a 'class' that you able to extend with your own methods and properties needed in the application. In this case an instance of this class is something like a main controller of the whole app. 

```javascript
// if the app boilerplate was created via XF Generator
// these lines can be found in `app.js` file
var MyApp = XF.App.extend({
    initialize: function () {
    	// this code will be executed before XF will be started 
			// but you can put the preparation code here
			// …			
			this.myAwesomeMethod();
    },
		myAwesomeMethod: function () {

		}
});
```

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

To force navigation to another url fragment a number of ways is available:
* `XF.router.navigate('books/fiction', {trigger: true})`
* `XF.navigate('books/fiction')` is the syntax sugar for the first  approach. `{trigger: true}` set by default
* `XF.trigger('navigate', 'books/fiction')` is much more preferable for consistency and integrity of the application

All elements with the attribute `data-href` or `href` will work on changing url fragment.
```html
<a data-href="books/fiction">Books</a>
```

## XF.pages

`XF.pages` drives the appearance of the pages sticking together with the router. It has some basic animations for switching pages such like `slideleft`, `slideright`, `fade` and `none`. Not so much for now but keep in mind that it is possible to define your own animation to use it together with `XF.pages`.

To create a page you just need to make a `<div>` with necessary classes):

```html
<div class="xf-page" id="books"></div>
```

`id` is used to make page switching work together with the router. It should be equal to first url fragment of the route (e.g. `books/:cat(/:subcat)`) or the name of the handler (e.g. `showBooksCategory`). In this case the page with such id attribute will be shown automatically when the route (e.g. `books/fiction`) will be triggered.

To show the page without changing the url or using route binding:
```javascript
XF.trigger('pages:show', 'books', 'fade');

// …directly 
XF.pages.show('books', 'fade');
```

To define the default animation type for all device types it's needed to set up the necessary properties on the start of app:
```javascript
var app = new MyApp({
		// …
		// other settings for the application
		animations: {
			standardAnimation: 'slideleft' // 'slideleft' is default
		}
});
```

If you want to create your own animation type and use it for page switching you (please care about necessary CSS animations in `xf.animations.less` file):
```javascript
var app = new MyApp({
		// …
		// other settings for the application
		animations: {
			types: {
				'myOwnAnimation': {
					fallback: function (fromPage, toPage) {
						// fallback to JS animation for old legacy browsers
						/// …
					}
				}
			}
		}
});
```

To define the default animation for each of device types it's needed to pass such parameters together with device options on the start of application or set it in the runtime:
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
            templatePath : 'tablet/',
						defaultAnimation: 'fade' // 'fade' for tablet devices
        }, {
            name : 'phone',
            range : {
                max : 568,
                min : null
            },
            templatePath : 'phone/' 
						// 'slide left' will be used for device type 'phone'
        }]
    }
});

XF.trigger('pages:animation:default', 'fade');

// …or not so elegant way
XF.setDefaultAnimationType('fade');

```

The situations if changing of the next animation type for the page is needed are not so uncommon, e.g. back button tap should force `slide right` animation instead of `slideleft`. In such cases there are some ways to do it:
* Define `data-animation` attribute on the element with `data-href`:
```html
<a data-href="books/" data-animations="slideright">Back</a>
```
* Set the next animation type programmatically:
```javascript
XF.trigger('pages:animation:next', 'slideright');

// …or not so elegant way
XF.setNextAnimationType('slideright');
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

This source module will contain all the helpers will needed to make the work with XF much more easier. Right now it contains only address bar hiding helper for iOS and Android mobile phones.


## XF.zepto.support.js

This piece enables the support of [zepto.js](http://zeptojs.com)  instead of jQuery extending it with all missing methods and properties.

**Attention**! Include this module on your own fear and risk. It is in experimental status right away.


# XFramework Components 

## Component

Components are the building blocks of XFramework. A component is a part of an application that can be abstracted as an independent unit and can be reused throughout the application. Components can be nested in one another, can have customized presentations depending on the device it is used on. You can create as many device profiles as you need and customize whole application in any way for each of them.

A component separates logic from presentation, which are stored as separate files and are loaded only when the component needs to be rendered, which helps to save on load times and device resources. Though component caching mechanism allows to prefetch component parts when developer deems it necessary.

To use a component a developer places a marker where the component will be rendered. The marker is a <div> with special attributes which denote the component's name and instance id.

See an example of two nested components declared in the page markup:

```html
		<div data-component="categoryList" data-id="categoryListBooks">
			This content will be shown while component is loading...
		</div>
```
	
Such an approach lets a developer build asynchronuous UIs and avoid loading extraneous resources.

## Component creation

There are two ways to create a component:

* Using XF Generator `yo xf …` that will scaffold a javascript file together with templates for all device types
* Manually 

Every component should extend `XF.Component` that allows general functionality, loading and rendering processes work without your input.

```javascript
XF.defineComponent(
	'categoryList',
	XF.Component.extend({
		construct

		View: XF.View.extend({
			initialize: function () {
				// 
			}
		}),
	})
);
```

Letâ€™s get back to our RootComponent subclass example named HomeComponent. First of all, you will need a JS file (its content is shown above) which defines componentâ€™s logic and may override some XF.Component (or XF.RootComponent) properties to achieve specific behavior.

XF.defineComponent(
	'HomeComponent',
	XF.RootComponent.extend(extending, {})
);
This call defines a new component via two arguments: component name and component class.

Component name: used to setup a placeholder (-s) for instance (-s) of the component and should be unique within the application.

Component class: definition is created via XF.[some_base_component].extend() call. Here you should pass two objects with properties and methods you want to add to the base class functionality as non-static and static part of a class respectively.

Letâ€™s take a look at what we are passing for the HomeComponent as extension to XF.RootComponent:

{
	modelClass: XF.Model.extend({
		isEmptyData: true
	}),
	viewClass: XF.View.extend({
		afterLoadTemplateFailed: function() {
			$('body').html('<h1>ERROR</h1>');
		}
	})
}
There are only two properties that would override existing XF.Component functionality: modelClass and viewClass. They are also inherited from built-in classes: XF.Model and XF.View in the same manner as the whole component does.

You may add/override properties of the component model and view. Basically you are able to modify everything you see.

In the example you can see that we are overriding isEmptyData property value with true , this would prevent component model from data retrieval. To be clear that thereâ€™s no necessity to get data for the RootComponent instead of getting specific piece of data from some smaller parts (component). This would shorten traffic capacity and prevent possible bandwidth problems; also it may decrease latency and improve user experience, because you donâ€™t need to wait for data that is currently useless.

XF.Model properties

isEmptyData
Flag that determines whether there is necessity to get data for the RootComponent
isStaticData
Flag that determines whether the data should be loaded once
isStringData
Flag that determines whether the data type is string (otherwise JSON)
autoUpdateInterval
Interval in milliseconds defining how often data should be retrieved from the server; use '0' to turn autoUpdate off
dataURL
Data source URL
updateInBackground
Flag that determines whether the data should be updating (with autoUpdate) even if the component is currently hidden
updateOnShow
Flag that determines whether the data should be updated each time the component becomes visible
XF.View properties

XF.View has several customization variables:

ignoreModelUpdate
Flag that determines whether the Model update should be ignored by the View (in this case you may launch XF.View.refresh() manually)
templateURL
Template URL
updateOnShow
Flag that determines whether the view should be rerendered each time the component becomes visible
useCache
Flag that determines whether the template should be stored into XF.Cache
As for the viewClass property, new XF.View subclass overrides a single method of the basic class.

XF.Component hooks

afterConstructModel()
HOOK: override to add logic after model construction
afterConstructView()
HOOK: override to add logic after view construction
beforeConstructModel()
HOOK: override to add logic before model construction
beforeConstructView()
HOOK: override to add logic before view construction
There are a number of entry points for modification of default behavior: these hooks are called at a specific time of execution to let you add some custom code at the moment it is required. So the inside implementation looks like the following abstract algorithm:

call "beforeConstructModelâ€;
create Model;
call "afterConstructModelâ€;
call "beforeConstructViewâ€;
create View;
call "afterConstructViewâ€;
The same logic is used for the rest of the hooks which are called if youâ€™ve overridden them or not.

Hooks for XF.Model

afterLoadData()
HOOK: override to add logic after data load
beforeLoadData()
HOOK: override to add logic before data load
init()
HOOK: override to add logic.
Hooks for XF.View

afterLoadTemplate()
HOOK: override to add logic after template load
afterLoadTemplateFailed()
HOOK: override to add logic for the case when it's impossible to load template
beforeLoadTemplate()
HOOK: override to add logic before template load
init()
HOOK: override to add custom logic on init
postRender()
HOOK: override to add logic after render
preRender()
HOOK: override to add logic before render
In summary, you are able to override existing properties, hook (and functions) and add your own properties and methods for any subclass of XF.Component, XF.Model or XF.View.

## Collection

## Model

## View

## List of built-in events
### XF level
### Component level
### Model level
### Collection level
### View level

# UI Elements

## Basics
## Buttons
## Lists
## Form elements
## Your own XF UI Element

# Contributing to XF

## Workflow

## Roadmap

## Information channels




