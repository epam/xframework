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

* TOTALLY CROSS-PLATFORM. XF supports all the popular devices and platroms. It is built in the way that allows you easily to change templates for each of the platforms without huge effort.
* SCALABLE ARCHITECTURE. Component-based modular event-driven architecture provides a possibility to build scalable and maintainable web apps with high-reusability of components.
* CUTE & CUSTOMIZABLE. XF uses LESS as preprocessor for CSS. It goes with a default theme that could be easily customized changing some lines of CSS code.
* LIBRARY OF COMPONENTS. Reusability is a king! XF is flexible and extandable to the roots: it goes with a library of predefined components but feel free to write your own components and submit it to us!
* POWERFUL RICH UI-ELEMENTS. Set of powerful rich UI-elements (e.g. form elements, buttons, lists) for different platforms gives a ability to provide the best user experience for each device type. And the number of UI-elements s growing!
* FLEXIBILITY TO FEEL THE FREEDOM. Build process allows you to create a custom build of XFramework and use it together with your favorite UI-library like [jQuery Mobile](http://jquerymobile.com) or [Ratchet](http://maker.github.io/ratchet/).


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

There are some rules behind the XFramework:

* Component-based event-driven architecture
* Components easily customizable with options
* Lazy loading of components
* Different templates for each of device types

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

To create the first XF application the simplest way is to use XF Generator through `yo xf:application init [appName]`.

For now it scaffolds an app in the way you can see by example: [XF Hello World App](http://xframeworkjs.org/helloworld/).

## Building your XF app for testing and production

`yo xf:application build [appName]`

## Creation of custom XFramework build

Custom xf.js and xf.min js build:

* `yo xf:build` — create build with all UI elements and source modules
* `yo xf:build [srcModule1:srcModule2]` — create build with all UI elements and source modules

Full list of available elements can be found at `xf/ui` and `xf/src` directory of XFramework repository.

## Updating XF and dependencies

XF Generator allows you to update sources and dependencies:

* `yo xf:update [all]` — update less and js files of XFramework, check latest versions of jQuery, Backbone, Underscore
* `yo xf:update scripts` — update js files (inluding thirdparty libraries) of XFramework, check latest versions of jQuery, Backbone, Underscore
* `yo xf:update styles` — update less files of XFramework

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

`XF.Router` is an extended [Backbone.Router]. XF cares about creation of router instance, its starting, binding handlers and so on. Everything you just need to do is to pass your routes and handlers with starting options for the application:

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

* `tap`: it doesn't matter if it is a click or a touch to the screen. Just bind on tap events for all types of devices and that's it! `XF.touch` fixes the 300ms gap between click and touch events as well
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

There's a way to customize the component with the starting options from outside:

```html
	<div data-component="categoryList" data-id="categoryListBooks">
			This content will be shown while component is loading...
			<script>
				XF.setOptionsByID('categoryListBooks',
					{
						currentPage: 2
					}
				);
			</script>
		</div>
```

You can use `XF.setOptionsByID` method in the place you decided but before component instance was created.

## Component creation

There are two ways to create a component:

* Using XF Generator `yo xf:component [name]` that will scaffold a javascript file together with templates for all device types
* Manually

Every component should extend `XF.Component` that allows general functionality, loading and rendering processes work without your input.

First of all, you will need a JavaScript file which defines component's logic and may override some XF.Component properties to achieve specific behavior.

```javascript
XF.define(
	'MyApp.components.categoryList', // just 'categoryList' is fine as well
	XF.Component.extend({
		construct: function () {
			// will be called on the start of construction
		},

		initialize: function () {
			// this method will be called after component construction
		},

		// for more flexibility you can define Views in separate files
		View: XF.View.extend({
			initialize: function () {

			}
		}),

		// for more flexibility you can define Collections in separate files
		Collection: XF.Collection.extend({
			url: 'books.json',
			initialize: function () {

			}
		})
	})
);
```

This call defines a new component via two arguments: component name and component class.

**Component name**: used to setup a placeholder (-s) for instance (-s) of the component and should be unique within the application.

**Component class**: definition is created via XF.[some_base_component].extend() call. Here you should pass properties and methods you want to add to the base class functionality as non-static and static part of a class respectively.

You may add/override properties of the component model, collection and view. Basically you are able to modify everything you see.

Be aware of proper usage Collections and Models. By default `XF.Component` has `XF.View` and `XF.Collection` classes (`XF.Component.Model` is not defined). If the component has linkage to Collection and Model classes the collection will be created.

`XF.Component` properties:

* `id`: component id
* `name`: component name
* `options`: component options (defaults merged with passed options for component). Default: `{autoload: true, autorender: true, updateOnShow: false}`. `autoload` and `autorender` will load the data for collection or model with creation of component and then render the template with fetched data.
* `selector`: component selector, e.g. `[data-id="componentId"]`
* `Model`: model class for this component. Default: `null`.
* `model`: instance of `Model` that will be created on the constructing of the component.
* `Collection`: collection class for this component. Default: `XF.Collection`.
* `collection`: instance of `Model` that will be created on the constructing of the component.
* `View`: view class for this component. Default: `XF.View`.
* `view`: instance of `View` that will be created on the constructing of the component.

`XF.Component` methods:

* `refresh`: refreshes the data (model or collection) and then refreshes the view. Triggers `refresh` method for view and collection/model.

`XF.Component` hooks:

* `construct`: overwrite it for your own needs. Called on the construction of component.
* `initialize`: overwrite it for your own needs. Called on the initialization of component.

## Collection

`XF.Collection` is an extended version of [Backbone.Collection](http://backbonejs.org/#Collection) to make it perfectly fit XF Component based architecture.

To create a standalone view XF Generator can be used with `yo xf:collection [name]`.

`XF.Collection` properties:

* `status`: status of the data in the collection. Default: `{ loaded: false, loading: false, loadingFailed: false }`.
* `component`: a link to the component for this collection.
* `ajaxSettings`: settings for ajax requests to the server for this collection. If not set global `ajaxSettings` will be used. The format is the same as for `$.ajax` method.

`XF.Collection` methods:

* `url`: the url to the data. Could be a function or a property.
* `refresh`: refreshes the data and triggers the view refreshing.

`XF.Collection` hooks:

* `construct`: overwrite it for your own needs. Called on the construction of collection.
* `initialize`: overwrite it for your own needs. Called on the initialization of collection.

For other methods, properties and hooks available see [Backbone.Collection](http://backbonejs.org/#Collection).

## Model

`XF.Model` is an extended version of [Backbone.Model](http://backbonejs.org/#Model) to make it perfectly fit XF Component based architecture.

To create a standalone view XF Generator can be used with `yo xf:model [name]`.

`XF.Model` properties:

* `status`: status of the data in the model. Default: `{ loaded: false, loading: false, loadingFailed: false }`.
* `component`: a link to the component for this model.
* `ajaxSettings`: settings for ajax requests to the server for this model. If not set global `ajaxSettings` will be used. The format is the same as for `$.ajax` method.

`XF.Model` methods:

* `url`: the url to the data. Could be a function or a property.
* `refresh`: refreshes the data and triggers the view refreshing.

`XF.Model` hooks:

* `construct`: overwrite it for your own needs. Called on the construction of model.
* `initialize`: overwrite it for your own needs. Called on the initialization of model.

For other methods, properties and hooks available see [Backbone.Model](http://backbonejs.org/#Model).

## View

`XF.View` is an extended version of [Backbone.View](http://backbonejs.org/#View) to make it perfectly fit XF Component based architecture.

To create a standalone view XF Generator can be used with `yo xf:view [name]`.

`XF.View` properties:

* `template`: contains source of the loaded template and the compiled version of it. Default: `{src: null, compiled: null, cache: true }`.
* `status`: status of the data in the view. Default: `{ loaded: false, loading: false, loadingFailed: false }`.
* `component`: a link to the component for this view.

`XF.View` methods:

* `load`: loads the template from the cache or remotely.
* `render`: renders the view. Please use `refresh` instead to use it together with hooks available.
* `refresh`: refreshes the view.
* `getMarkup`: returns the markup using the current data.

`XF.View` hooks:

* `url`: the url to the template file. Could be a function or a property.
* `construct`: overwrite it for your own needs. Called on the construction of view.
* `initialize`: overwrite it for your own needs. Called on the initialization of view.
* `beforeLoadTemplate`: called before loading of the template started.
* `afterLoadTemplate`: called after loading of the template completed.
* `afterLoadTemplateFailed`: called after loading of the template completed and failed.
* `beforeRender`: called before rendering of the template.
* `afterRender`: called after rendering of the template.

*Note that data from `collection` or `model` of the component is available in the template via localized variable `data`*.

For other methods, properties and hooks available see [Backbone.View](http://backbonejs.org/#View).


## List of built-in events

### XF level (`XF.on`, `XF.off`, `XF.trigger`, etc.)

* `app:started`: when the app has started
* `component:componentID:constructed`: when the component with id `componentID` has been constructed
* `component:componentID:rendered`: when the component with id `componentID` has been rendered

* `pages:show`: command to switch the page to another one. `XF.trigger('pages:show', 'books')`
* `pages:animation:next`: command to set the type of the next animation. `XF.trigger('pages:animation:next', 'fade')`
* `pages:animation:default`: command to set the default type of the animations. `XF.trigger('pages:animation:default', 'fade')`
* `ui:enhance`: command to enhance all inside the DOM element. Selector or jQuery object can be passed. `XF.trigger('ui:enhance', '.cart')`
* `navigate`: command to change the url, triggers the router that could trigger page switching. `XF.trigger('navigate', 'books/fiction')`
* `component:componentID:refresh`: command to refresh the component with id `componentID`

You can fire any event to the desired component in format `component:componentID:eventName`. Even if there is no component with such id these events will be delayed until it will be rendered.

### Component level

* `refresh`: command to refresh the component

### Model level

* `fetched`: when the data has been loaded from the backend
* `refresh`: command to refresh the data of model

Keep in mind that all [Backbone.js built-in events](http://backbonejs.org/#Events-catalog) are available.

### Collection level

* `fetched`: when the data has been loaded from the backend
* `refresh`: command to refresh the data of collection

Keep in mind that all [Backbone.js built-in events](http://backbonejs.org/#Events-catalog) are available.

### View level

* `rendered`: when the view has been rendered
* `loaded`: when the template has been loaded
* `refresh`: command to rerender the view


Keep in mind that all [Backbone.js built-in events](http://backbonejs.org/#Events-catalog) are available.

# UI Elements

## Basics

XFramework UI element is 'an extended version of Document Object' or the another parallel could be done with jQuery Plugin. It fills the gap with Rich UI Elements for all the browsers. It means that XFramework will parse your HTML and add some markup to make UI controls user- and developer-friendly.

Each UI element has a simple markup that will be enhanced into the rich element.

```html
<ul data-role="listview">
	<li data-role="divider">A</li>
	<li>
		<h2>Header</h2>
		<p>No link</p>
	</li>
	<li><a href="#">Simple link</a></li>
	<li data-role="divider">Divider</li>
	<li><a href="#">
		<h2>Header</h2>
		<p>Header and description</p>
	</a></li>
</ul>
```

Will be converted to:

```html
<ul data-role="listview" data-skip-enhance="true" id="xf-8293" class="xf-listview">
	<li class=" xf-li xf-li-divider">A</li>
	<li class="xf-li-static xf-li">
		<div class="xf-li-wrap">
			<h2 class="xf-li-header">Header</h2>
			<p class="xf-li-desc">No link</p>
		</div>
	</li>
	<li class=" xf-li">
		<a href="#" class="xf-li-btn">
			Simple link
			<div class="xf-btn-text"></div>
		</a>
	</li>
	<li class=" xf-li xf-li-divider">Divider</li>
	<li class=" xf-li">
		<a href="#" class="xf-li-btn">
			<div class="xf-btn-text">
				<h2 class="xf-li-header">Header</h2>
				<p class="xf-li-desc">Header and description</p>
			</div>
		</a>
	</li>
</ul>
```

The look of form inputs, buttons will be enhanced automatically, but you can use certain attributes to customize some of them. See full list of the data- attributes below.

## Buttons

Inputs of types submit, reset, button, `<button>`s, and links with attribute `[data-role=button]` will be styled as buttons. For example a usual `input[type=submit]` will look like this:

```html
<a data-role="button">A button</a>
```

<a data-role="button">A button</a>

Buttons can be of several types: normal, special and alert. They differ only in appearance.

A special button is displayed in an accented color, blue by default, generally needed to highlight the most important button among several. To make a button special add data-special=true attribute to it.

The following code:

```html
<a data-special="true"
   data-appearance="button" href="#">
   A special button
</a>
```

Will produce the following button:

<a data-special="true"
   data-appearance="button" href="#">
   A special button
</a>

An alert button is red by default and is recommended to be used for actions that may cause data loss, e.g. for a delete button. Add data-alert=true attribute to get such a button:

```html
<button data-alert="true">An alert button</button>
```

Will produce the following button:

<button data-alert="true">An alert button</button>

You may need to use smaller buttons in your app. To make them, add a [data-small=true] attribute to the necessary controls.

To make a common back button use a [data-back=true] attribute. It will go back in browser history by default.

```html
<a data-appearance="button" data-small="true" href="#">A small button</a>
<a data-appearance="backbtn" href="#"> Back button</a>
```

<a data-appearance="button" data-small="true" href="#">A small button</a>
<a data-appearance="backbtn" href="#"> Back button</a>

## Listview

To make a data list add a `[data-role="listview"]` attribute to a UL or OL element.

If list elements must be clickable wrap all the contents of the list items in A elements: `UL[data-role=listview] > LI > A > whatever`.

To make a divider between list items make another LI with a `data-role="divider"` attribute.

See code and result lower in this section.

### List items with icons

Just like with buttons icons can be added to list items using `data-icon` and `data-iconpos` attributes. Note that `[data-iconpos=top]` and `[data-iconpos=bottom]` values are not supported on list items.

List elements can have a count bubble. Just add a `SPAN.xf-count-bubble` inside them

### Lists with thumbnails

If you need to have thumbnails inside list items, you don't need to do anything special, just put the image inside the list item, and it will be displayed on the left hand side. The image can be moved to the right side by adding `[data-thumbpos="right"]` attribute to the corresponding `LI` element.

Sample listview markup:

```html
<ul data-role="listview">
	<li data-role="divider">A</li>
	<li>
		<h2>Header</h2>
		<p>No link</p>
	</li>
	<li><a href="#">Simple link</a></li>
	<li data-role="divider">Divider</li>
	<li><a href="#">
		<h2>Header</h2>
		<p>Header and description</p>
	</a></li>
	<li data-icon="chevron-thin-right" data-iconpos="right"><a href="#">
		<h2>With Icon</h2>
		<p>List item  with icon on the right</p>
	</a></li>
	<li data-icon="chevron-thin-right" data-iconpos="right"><a href="#">
		<h2>With Icon and Count</h2>
		<p>List item  with icon on the right and count</p>
		<span class="xf-count-bubble">32</span>
	</a></li>
	<li data-thumbpos="right"><a href="#">
		<img src="../img/_thumb1.jpg" alt="">
		<h2>With Thumbnail on the right</h2>
		<p>List item  with a thumbnail on the right</p>
	</a></li>
</ul>
```

The above code will result in:

<ul data-role="listview">
	<li data-role="divider">A</li>
	<li>
		<h2>Header</h2>
		<p>No link</p>
	</li>
	<li><a href="#">Simple link</a></li>
	<li data-role="divider">Divider</li>
	<li><a href="#">
		<h2>Header</h2>
		<p>Header and description</p>
	</a></li>
	<li data-icon="chevron-thin-right" data-iconpos="right"><a href="#">
		<h2>With Icon</h2>
		<p>List item  with icon on the right</p>
	</a></li>
	<li data-icon="chevron-thin-right" data-iconpos="right"><a href="#">
		<h2>With Icon and Count</h2>
		<p>List item  with icon on the right and count</p>
		<span class="xf-count-bubble">32</span>
	</a></li>
	<li data-thumbpos="right"><a href="#">
		<img src="../img/_thumb1.jpg" alt="">
		<h2>With Thumbnail on the right</h2>
		<p>List item  with a thumbnail on the right</p>
	</a></li>
</ul>

## Form elements

Most form elements will be enhanced automatically, namely all kinds of text inputs, checkboxes and radiobuttons, and select menus. But	there are some things to keep in mind while developing. All inputs must have an associated `label` element, i.e. the label must have a `for` attribute with a value equal to input `id`.

### Text Inputs

<div class="xf-form-unit">
	<label for="input-1">This is a <code>label</code> for the 'input' below:</label>
	<input type="text" placeholder="Input[type=text]" id="input-1" />
</div>

X-Framework provides iOS-style split inputs. Add `[data-appearance=split]` attribute to the necessary `input` to get the following control:

			<div class="xf-form-unit">
				<label for="input-split-1">Here's an input `[data-appearance=split]`:</label>
				<input type="text" placeholder="placeholder value" id="input-split-1" data-appearance="split"/>
			</div>


			<div class="xf-form-unit">
				<label>This is a `textarea`, nothing special:</label>
				<textarea placeholder="Textarea"></textarea>
			</div>


### Radiobuttons

To create a set of options wrap the `input`-`label` pairs in a `fieldset[data-role=controlgroup]`. Note that the `for` attribute is mandatory for `label`.

```html
<fieldset data-role="controlgroup">
	<legend>Legend for radio buttons</legend>
	<input type="radio" name="radiogroup1" id="radio7" value="1">
	<label for="radio7">Milk</label>
	<input type="radio" name="radiogroup1" id="radio8" value="2">
	<label for="radio8">Toast</label>
</fieldset>
```

The code above produces the following output:

<fieldset data-role="controlgroup">
					<legend>Legend for radio buttons</legend>

					<input type="radio" name="radiogroup1" id="radio7" value="1">
					<label for="radio7">Milk</label>

					<input type="radio" name="radiogroup1" id="radio8" value="2">
					<label for="radio8">Toast</label>
</fieldset>

### Checkboxes

Follow tha same rules as for radiobuttons to make checkboxes.

			<div class="xf-form-unit">

				<fieldset data-role="controlgroup">
					<legend>Fieldset with checkboxes:</legend>
					<label for="check1">Milk</label>
					<input type="checkbox" name="check1" id="check1" value="1">
					<label for="check2">Toast</label>
					<input type="checkbox" name="check2" id="check2" value="2">
					<label for="check3">Honey</label>
					<input type="checkbox" name="check3" id="check3" value="3">
				</fieldset>

			</div>

### Single checkbox

			<div class="xf-form-unit">

				<label for="check4">Single checkbox</label>
				<input type="checkbox" name="check4" id="check4" value="4">

			</div>


### Switch

`Input[type=checkbox][data-role=switch]` is converted into a switch. An associated `label` element is mandatory, the same as for split text input.

			<div class="example">
				<label for="wifi-switch">Wi-Fi Switch</label>
				<input type="checkbox" id="wifi-switch" data-role="switch" checked>
			</div>


### Slider/Spinner

Inputs of type `number`, `range` will automatically be converted to rich widgets:

			<div class="example">

				<label class="xf-label"><code>input[type=number]</code></label>
				<input type="number" min="0" max="1200" value="400">

			</div>


			<div class="example">
				<label class="xf-label"><code>input[type=range]</code></label>
				<input type="range" min="0" max="1200" value="400">
			</div>

### Switch

			<div class="xf-form-unit">
				<p class="xf-label">Simple on/off switch. Checkbox with <code>data-role="switch"</code>:</p>

				<label for="check5">On/Off Switch (checkbox)</label>
				<input type="checkbox" id="check5" data-role="switch">

			</div>


### Select

			<div class="xf-form-unit">
				<label class="xf-label">Simple select:</label>
				<div class="xf-input-select">

					<select id="select-1">
						<option value="">Option 1</option>
						<option value="">Option 2</option>
						<option value="">Option 3</option>
					</select>
				</div>
			</div>


## Tabs

Below you can find an example of tabs UI element:

```html
<div data-role="tabs">
	<button data-active="true">Link 1</button>
	<button>Link 2</button>
	<button>Link 3</button>
	<button>Link 4</button>
</div>
```

Such code will be transformed into:

```html
<div data-role="tabs" data-id="xf-37715" id="xf-37715" data-skip-enhance="true">
	<ul class="xf-tabs">
		<li class="xf-grid-unit  xf-grid-unit-1of4">
			<a class="xf-tabs-button  xf-corner-tl  xf-corner-bl" id="xf-71177">
				<span class="xf-tabs-button-text">Link 1</span>
			</a>
		</li>
		<li class="xf-grid-unit  xf-grid-unit-1of4">
			<a class="xf-tabs-button" id="xf-7896">
				<span class="xf-tabs-button-text">Link 2</span>
			</a>
		</li>
		<li class="xf-grid-unit  xf-grid-unit-1of4">
			<a class="xf-tabs-button" id="xf-62398">
				<span class="xf-tabs-button-text">Link 3</span>
			</a>
		</li>
		<li class="xf-grid-unit  xf-grid-unit-1of4">
			<a class="xf-tabs-button  xf-corner-tr  xf-corner-br xf-tabs-button-active" id="xf-83850">
				<span class="xf-tabs-button-text">Link 4</span>
			</a>
		</li>
	</ul>
</div>
```

## Header

Below you can find an example of header UI element:

```html
<div data-role="header" data-fixed="true">
	<button data-small="true" data-icon="backbtn" data-position="left"></button>
	<h1>Title</h1>
</div>
```

Such code will be transformed into:

```html
<div data-role="header" data-id="xf-18586" id="xf-18586" data-skip-enhance="true">
	<header class="xf-header ">
		<button data-small="true" data-icon="backbtn" id="backbtn" data-position="left" data-animation="slideright"  data-skip-enhance="true" class="xf-button-float-left xf-button-header-left xf-button-small xf-iconpos-left xf-button-small-icon-only">
			<span class="xf-icon xf-icon-backbtn xf-icon-small"></span>
		</button>
		<h1 class="xf-header-title">Title</h1>
	</header>
</div>
```


## Footer

Below you can find an example of footer UI element:

```html
<div data-role="footer" data-fixed="true">
	<button data-icon="star">Link 1</button>
	<button data-icon="help">Link 2</button>
	<button data-icon="heart">Link 3</button>
	<button data-icon="print">Link 4</button>
</div>
```

Such code will be transformed into:

```html
<div data-role="footer" data-fixed="true" data-id="xf-29339" id="xf-29339" data-skip-enhance="true">
	<div class="xf-footer  xf-footer-fixed ">
		<ul class="xf-nav">
			<li class="xf-grid-unit xf-grid-unit-1of4">
				<a data-href="" class="xf-nav-item xf-iconpos-top" id="xf-29339-item0">
					<div class="xf-icon xf-icon-big xf-icon-star"></div>
					<div class="xf-nav-item-text ">Link 1</div>
				</a>
			</li>
			<li class="xf-grid-unit xf-grid-unit-1of4">
				<a data-href="" class="xf-nav-item xf-iconpos-top" id="xf-29339-item1">
					<div class="xf-icon xf-icon-big xf-icon-help"></div>
					<div class="xf-nav-item-text ">Link 2</div>
				</a>
			</li>
			<li class="xf-grid-unit xf-grid-unit-1of4">
				<a data-href="" class="xf-nav-item xf-iconpos-top" id="xf-29339-item2">
					<div class="xf-icon xf-icon-big xf-icon-heart"></div>
					<div class="xf-nav-item-text ">Link 3</div>
				</a>
			</li>
			<li class="xf-grid-unit xf-grid-unit-1of4">
				<a data-href="" class="xf-nav-item xf-iconpos-top" id="xf-29339-item3">
					<div class="xf-icon xf-icon-big xf-icon-print"></div>
					<div class="xf-nav-item-text ">Link 4</div>
				</a>
			</li>
		</ul>
	</div>
</div>
```






[![Bitdeli Badge](https://d2weczhvl823v0.cloudfront.net/epam/x-framework/trend.png)](https://bitdeli.com/free "Bitdeli Badge")

