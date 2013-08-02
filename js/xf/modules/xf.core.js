/**
 TODO:
 - scrollTop for Zepto
 - wrapInner for Zepto
 **/

(function (window, BB) {

    var rootDOMObject = null;

    /* $ hooks */

    var _oldhide = $.fn.hide;
    /** @ignore */
    $.fn.hide = function(speed, callback) {
        var res = _oldhide.apply(this,arguments);
        $(this).trigger('hide');
        return res;
    };

    var _oldshow = $.fn.show;
    /** @ignore */
    $.fn.show = function(speed, callback) {
        var res = _oldshow.apply(this,arguments);
        $(this).trigger('show');
        return res;
    };

    var _oldhtml = $.fn.html;
    /** @ignore */
    $.fn.html = function(a) {
        var res = _oldhtml.apply(this,arguments);
        $(this).trigger('show');
        $(this).trigger('html');
        return res;
    };

    var _oldappend = $.fn.append;
    /** @ignore */
    $.fn.append = function() {
        var res = _oldappend.apply(this,arguments);
        $(this).trigger('append');
        return res;
    };

    var _oldprepend = $.fn.prepend;
    /** @ignore */
    $.fn.prepend = function() {
        var res = _oldprepend.apply(this,arguments);
        $(this).trigger('prepend');
        return res;
    };

    $.fn.animationEnd = function (callback) {
        var animationEndEvents = 'webkitAnimationEnd oAnimationEnd msAnimationEnd animationend';

        $(this).one(animationEndEvents, callback);

        return this;
    };

    if (!_.isFunction($.fn.detach)) {
        $.fn.detach = function(a) {
            return this.remove(a,!0);
        }
    }

    if (!_.isFunction($.fn.wrapInner)) {
        $.fn.wrapInner = function( html ) {
            if ( _.isFunction( html ) ) {
                return this.each(function(i) {
                    $(this).wrapInner( html.call(this, i) );
                });
            }

            return this.each(function() {
                var self = $( this ),
                    contents = self.contents();

                if ( contents.length ) {
                    contents.wrapAll( html );

                } else {
                    self.append( html );
                }
            });
        }
    }

    var _olddetach = $.fn.detach;
    /** @ignore */
    $.fn.detach = function() {
        var parent = $(this).parent();
        var res = _olddetach.apply(this,arguments);
        parent.trigger('detach');
        return res;
    };

    /**
     @namespace Holds visible functionality of the framework
     */
    XF = window.XF = window.XF || {};

    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     Implements basic Events dispatching logic.
     @class
     */
    XF.Events = BB.Events;
    _.extend(XF, XF.Events);

    // TODO: comments
    XF.navigate = function (fragment) {
        XF.Router.navigate(fragment, {trigger: true});
    };

    XF.on('navigate', XF.navigate);


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     @function
     @public
     @param {Object} options
     @param {Object} options.settings User-defined settings which would override {@link XF.Settings}
     @param {Object} options.router Options required for {@link XF.Router}
     @param {Object} options.router.routes list of routes for {@link XF.Router}
     @param {Object} options.router.handlers list of route handlers for {@link XF.Router}
     @description Launches the app with specified options
     */
    XF.start = function(options) {

        options = options || {};

        // options.settings
        _.extend(XF.Settings.options, options.settings);

        // initializing XF.Cache
        XF.Cache.init();

        // initializing XF.Device
        options.device = options.device || {};
        XF.Device.init(options.device.types);

        // options.router
        options.router = options.router || {};
        createRouter(options.router);

        placeAnchorHooks();
        bindHideShowListeners();

        XF.Router.start();

        // options.root
        rootDOMObject = options.root;
        if(!rootDOMObject) {
            rootDOMObject = $('body');
        }

        options.animations = options.animations || {};
        options.animations.default = options.animations.default || '';

        XF.Pages.start(options.animations);

        //XF.Pages.start();
        loadChildComponents(rootDOMObject);
    };

    /**
     @namespace Holds all the reusable util functions
     */
    XF.Utils = {};

    /**
     @namespace Holds all the reusable util functions related to Adress Bar
     */
    XF.Utils.AddressBar = {};

    _.extend(XF.Utils.AddressBar, /** @lends XF.Utils.AddressBar */{

        /**
         Saves scroll value in order to not re-calibrate everytime we call the hide url bar
         @type Boolean
         @private
         */
        BODY_SCROLL_TOP : false,

        /**
         Calculates current scroll value
         @return Number
         @private
         */
        getScrollTop : function(){
            var win = window,
                doc = document;

            return win.pageYOffset || doc.compatMode === 'CSS1Compat' && doc.documentElement.scrollTop || doc.body.scrollTop || 0;
        },

        /**
         Hides adress bar
         */
        hide : function(){
            console.log('XF :: Utils :: AddressBar :: hide');
            var win = window;

            // if there is a hash, or XF.Utils.AddressBar.BODY_SCROLL_TOP hasn't been set yet, wait till that happens
            if( !location.hash && XF.Utils.AddressBar.BODY_SCROLL_TOP !== false){
                win.scrollTo( 0, XF.Utils.AddressBar.BODY_SCROLL_TOP === 1 ? 0 : 1 );
            }


            if (XF.Device.isMobile) {
                var css = document.documentElement.style;

                css.height = '200%';
                css.overflow = 'visible';

                window.scrollTo(0, 1);

                css.height = window.innerHeight + 'px';

                return true;
            }
        },

        /**
         Hides adress bar on page load
         */
        hideOnLoad : function () {
            console.log('XF :: Utils :: AddressBar :: hideOnLoad');
            var win = window,
                doc = win.document;

            // If there's a hash, or addEventListener is undefined, stop here
            if( !location.hash && win.addEventListener ) {

                //scroll to 1
                window.scrollTo( 0, 1 );
                XF.Utils.AddressBar.BODY_SCROLL_TOP = 1;

                //reset to 0 on bodyready, if needed
                bodycheck = setInterval(function() {
                    if( doc.body ) {
                        clearInterval( bodycheck );
                        XF.Utils.AddressBar.BODY_SCROLL_TOP = XF.Utils.AddressBar.getScrollTop();
                        //XF.Utils.AddressBar.hide();
                    }
                }, 15);

                win.addEventListener( 'load',
                    function() {
                        setTimeout(function() {
                            //at load, if user hasn't scrolled more than 20 or so...
                            if( XF.Utils.AddressBar.getScrollTop() < 20 ) {
                                //reset to hide addr bar at onload
                                //XF.Utils.AddressBar.hide();
                            }
                        }, 0);
                    }
                );
            }
        }
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Creates {@link XF.Router}
     @memberOf XF
     @param {Object} routes list of routes for {@link XF.Router}
     @param {Object} handlers list of route handlers for {@link XF.Router}
     @private
     */
    var createRouter = function(options) {   debugger;
        if(XF.Router) {
            throw 'XF.createRouter can be called only ONCE!';
        } else {
            XF.Router = new (XF.RouterClass.extend(options))();
        }
    };


    /**
     Adds listeners to each 'a' tag with 'data-href' attribute on a page - all the clicks should bw delegated to {@link XF.Router}
     @memberOf XF
     @private
     */
    var placeAnchorHooks = function() {
        $('body').on('tap click', '[data-href]', function() {
            var animationType = $(this).data('animation') || null;
            if (animationType) {
                XF.trigger('pages:animation:next', animationType);
            }
            XF.Router.navigate( $(this).data('href'), {trigger: true} );
        });
    };

    /**
     Loads component definitions for each visible component placeholder found
     @memberOf XF
     @param {Object} DOMObject Base object to look for components
     @private
     */
    var loadChildComponents = function(DOMObject) {
        $(DOMObject).find('[data-component][data-cache=true],[data-component]:visible').each(function(ind, value) {
            var compID = $(value).attr('data-id');
            var compName = $(value).attr('data-component');
            loadChildComponent(compID, compName, true);
        });
    };

    /**
     Loads component definition and creates its instance
     @memberOf XF
     @param {String} compID Data-id property value of a component instance
     @param {String} compName Name of the Component to be loaded
     @private
     */
    var loadChildComponent = function(compID, compName) {
        getComponent(compName, function(compDef) {
            if(!components[compID]) {
                var compInst = new compDef(compName, compID);
                console.log('XF :: loadChildComponent - created : ' + compID);
                components[compID] = compInst;
                compInst.construct();
            }
        });
    };

    /**
     Binds hide/show listners to each component placeholder. This listener should load component definition and create an instance of a component as soon as the placeholder would become visible
     @memberOf XF
     @private
     */
    var bindHideShowListeners = function() {
        $('[data-component]').on('show', function(evt) {
            if(evt.currentTarget == evt.target) {
                var compID = $(this).attr('data-id');
                if(!components[compID]) {
                    var compName = $(this).attr('data-component');
                    loadChildComponent(compID, compName);
                }
                XF.UIElements.enhanceView($(this));
            }
        });
        /*
         var selector = null;
         _.each(XF.UIElements.enhancementList, function(enhancement, index, enhancementList) {
         if(!selector) {
         selector = enhancement.selector;
         } else {
         selector += ', ' + enhancement.selector;
         }
         });
         $(selector).on('show', function() {
         XF.UIElements.enhanceView($(this));
         });
         */
    };

    /**
     Loads script
     @memberOf XF
     @param {String} url Component definition URL
     @param {Function} callback Function to be executed when the component definition would be loaded
     @private
     */
    var loadScript = function(url, callback){

        var script = document.createElement('script');

        if(script.readyState) {  //IE
            /** @ignore */
            script.onreadystatechange = function() {
                if (script.readyState == 'loaded' || script.readyState == 'complete') {
                    script.onreadystatechange = null;
                    if(callback) {
                        callback();
                    }
                }
            };
        } else {  //Others
            /** @ignore */
            script.onload = function() {
                if(callback) {
                    callback();
                }
            };
        }

        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    };


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Stores instances of {@link XF.Component} and its subclasses
     @memberOf XF
     @private
     */
    var components = {};

    /**
     Stores instances of {@link XF.ComponentStatus} - registered Components
     @memberOf XF
     @private
     */
    var registeredComponents = {};

    /**
     Loads component definition if necessary and passes it to callback function
     @memberOf XF
     @param {String} compName Component definition name
     @param {Function} callback Function to be executed when the component definition would be loaded
     @private
     */
    var getComponent = function(compName, callback) {
        var compStatus = registeredComponents[compName];
        if(!compStatus) {
            compStatus = XF.registerComponent(compName, XF.Settings.property('componentUrlFormatter')(compName));
        }
        if(compStatus.loaded) {
            callback(compStatus.compDef);
            return;
        }

        compStatus.callbacks.push(callback);

        if(!compStatus.loading) {
            compStatus.loading = true;
            loadScript(compStatus.compSrc);
        }
    };

    /**
     Returns component instance by its id
     @param {String} compID Component instance id
     @returns {XF.Component} Appropriate component instance
     @public
     */
    XF.getComponentByID = function(compID) {
        return components[compID];
    };

    /**
     Registers component source
     @param {String} compName Component name
     @param {String} compSrc Component definition source
     @returns {XF.ComponentStatus} Component status descriptor
     @public
     */
    XF.registerComponent = function(compName, compSrc) {
        var compStatus = registeredComponents[compName];
        if(compStatus) {
            return compStatus;
        }
        registeredComponents[compName] = new ComponentStatus(compSrc);
        return registeredComponents[compName];
    };

    /**
     Defines component class and calls registered callbacks if necessary
     @param {String} compName Component name
     @param {Object} compDef Component definition
     @public
     */
    XF.defineComponent = function(compName, compDef) {
        var compStatus = registeredComponents[compName];
        if(!compStatus) {
            compStatus = registeredComponents[compName] = new ComponentStatus(null);
        }

        registeredComponents[compName].loading = false;
        registeredComponents[compName].loaded = true;
        registeredComponents[compName].compDef = compDef;

        while(compStatus.callbacks.length) {
            compStatus.callbacks.pop()(compStatus.compDef);
        }
    };

    /**
     Should invoke component loading & call callback function as soon as component would be available
     @param {String} compName Component name
     @param {Function} callback Callback to execute when component definition is ready
     @public
     */
    XF.requireComponent = function(compName, callback) {
        getComponent(compName, callback);
    };

    /**
     Stores custom options for {@link XF.Component} or its subclasses instances
     @memberOf XF
     @private
     */
    var componentOptions = {};

    /**
     Defines component instance custom options
     @param {String} compID Component instance id
     @param {Object} options Object containing custom options for appropriate component instance
     @public
     */
    XF.setOptionsByID = function(compID, options) {
        componentOptions[compID] = options;
    };

    /**
     Returns custom instance options by component instance ID
     @memberOf XF
     @param {String} compID Component instance id
     @returns {Object} Object containing custom options for appropriate component instance
     @private
     */
    XF.getOptionsByID = function(compID) {
        return componentOptions[compID] || {};
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Instance of {@link XF.HistoryClass}
     @static
     @type {XF.HistoryClass}
     */
    XF.history = BB.history;

    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Instance of {@link XF.SettingsClass}
     @static
     @type {Object}
     */
    XF.Settings = {
       /**
         Contains name-value pairs of all application settings
         @name XF.Settings#options
         @type Object
         @private
         */
        options: /** @lends XF.Settings#options */ {

            /**
             Used for {@link XF.Cache} clearance when new version released
             @memberOf XF.Settings.prototype
             @default '1.0.0'
             @type String
             */
            applicationVersion: '1.0.0',
            /**
             Deactivates cache usage for the whole app (usefull for developement)
             @memberOf XF.Settings.prototype
             @default false
             @type String
             */
            noCache: false,
            /**
             Used by default Component URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default ''
             @type String
             */
            componentUrlPrefix: '',
            /**
             Used by default Component URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default '.js'
             @type String
             */
            componentUrlPostfix: '.js',
            /**
             Default Component URL formatter: prefix + component_name + postfix
             @param {String} compName Component name
             @memberOf XF.Settings.prototype
             @returns {String} Component URL
             @type Function
             */
            componentUrlFormatter: function(compName) {
                return XF.Settings.property('componentUrlPrefix') + compName + XF.Settings.property('componentUrlPostfix');
            },

            /**
             Used by default Template URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default ''
             @type String
             */
            templateUrlPrefix: '',
            /**
             Used by default Template URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default '.tmpl'
             @type String
             */
            templateUrlPostfix: '.tmpl',
            /**
             Default Template URL formatter: prefix + component_name + postfix
             @param {String} compName Component name
             @returns {String} Template URL
             @memberOf XF.Settings.prototype
             @type Function
             */
            templateUrlFormatter: function(compName, templatePath) {
                return XF.Settings.property('templateUrlPrefix') + templatePath + compName + XF.Settings.property('templateUrlPostfix');
            },

            /**
             Used by default Data URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default ''
             @type String
             */
            dataUrlPrefix: '',
            /**
             Used by default Data URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default '.json'
             @type String
             */
            dataUrlPostfix: '.json',
            /**
             Default Data URL formatter: prefix + component_name + postfix
             @param {String} compName Component name
             @returns {String} Template URL
             @memberOf XF.Settings.prototype
             @type Function
             */
            dataUrlFormatter: function(compName) {
                return XF.Settings.property('dataUrlPrefix') + compName + XF.Settings.property('dataUrlPostfix');
            },
            /**
             Used by {@link XF.Touchable}
             @memberOf XF.Settings.prototype
             @default 100
             @type Number
             */
            touchableSwipeLength: 100,
            /**
             Used by {@link XF.Touchable}
             @memberOf XF.Settings.prototype
             @default 700
             @type Number
             */
            touchableDoubleTapInterval: 700,
            /**
             Used by {@link XF.Touchable}
             @memberOf XF.Settings.prototype
             @default 300
             @type Number
             */
            touchableLongTapInterval: 500,



            //TODO merge with animation types
            animations: {}
        },

        /**
         Gets property value by name
         @param {String} propName
         */
        getProperty: function(propName) {
            return this.options[propName];
        },
        /**
         Sets a new value for one property with
         @param {String} propName
         @param {Object} value new value of the property
         */
        setProperty: function(propName, value) {
            this.options[propName] = value;
        },
        /**
         Gets or sets property value (depending on whether the 'value' parameter was passed or not)
         @param {String} propName
         @param {Object} [value] new value of the property
         */
        property: function(propName, value) {
            if(value === undefined) {
                return this.getProperty(propName);
            } else {
                this.setProperty(propName, value);
            }
        }
    };


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Instance of {@link XF.CacheClass}
     @static
     @private
     @type {Object}
     */
    XF.Cache = {

        /**
         Local reference to the localStorage
         @type {Object}
         */
        storage: null,

        /**
         Indicates whether accessibility test for localStorage was passed at launch time
         @type {Object}
         */
        available: false,

        /**
         Runs accessibility test for localStorage & clears it if the applicationVersion is too old
         */
        init : function() {

            this.storage = window.localStorage;

            // checking availability
            try {
                this.storage.setItem('check', 'check');
                this.storage.removeItem('check');
                this.available = true;
            } catch(e) {
                this.available = false;
            }

            // clearing localStorage if stored version is different from current
            var appVersion = this.get('applicationVersion');
            if(XF.Settings.property('noCache')) {
                // cache is disable for the whole site manualy
                console.log('XF.Cache :: init - cache is disable for the whole app manually - clearing storage');
                this.clear();
                this.set('applicationVersion', XF.Settings.property('applicationVersion'));
            } else if(appVersion && appVersion == XF.Settings.property('applicationVersion')) {
                // same version is cached - useing it as much as possible
                console.log('XF.Cache :: init - same version is cached - useing it as much as possible');
            } else {
                // wrong or no version cached - clearing storage
                console.log('XF.Cache :: init - wrong or no version cached - clearing storage');
                this.clear();
                this.set('applicationVersion', XF.Settings.property('applicationVersion'));
            }
        },

        /**
         Returns a value stored in cache under appropriate key
         @param {String} key
         @return {String}
         */
        get : function(key) {
            var result;
            if(this.available) {
                try {
                    result = this.storage.getItem(key);
                    console.log('XF.Cache :: get - "' + key + '" = "' + result + '"');
                } catch(e) {
                    result = null;
                }
            } else {
                result = null;
            }
            return result;
        },

        /**
         Sets a value stored in cache under appropriate key
         @param {String} key
         @param {String} value
         @return {Boolean} success indicator
         */
        set : function(key, value) {
            var result;
            if(this.available) {
                try {
                    this.storage.setItem(key, value);
                    result = true;
                    console.log('XF.Cache :: set - "' + key + '" = "' + value + '"');
                } catch(e) {
                    result = false;
                }
            } else {
                result = false;
            }
            return result;
        },

        /**
         Clears localStorage
         @return {Boolean} success indicator
         */
        clear : function() {
            var result;
            if(this.available) {
                try {
                    this.storage.clear();
                    result = true;
                    console.log('XF.Cache :: clear');
                } catch(e) {
                    result = false;
                }
            } else {
                result = false;
            }
            return result;
        }

    };


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Instance of {@link XF.RouterClass}
     @static
     @type {XF.Router}
     */
    XF.Router = null;

    /**
     Implements Routing.
     @class
     @static
     @augments XF.Events
     @param {Object} routes routes has map
     @param {Object} handlers handlers has map
     */
    XF.RouterClass = BB.Router;

    _.extend(XF.RouterClass.prototype, /** @lends XF.RouterClass.prototype */{


        /**
         Initiates Rounting & history listening
         @private
         */
        start : function() {
            this.bindAnyRoute();
            XF.history.start();
        },


        /**
         Binds a callback to any route
         @param {Function} callback A function to be called when any route is visited
         */
        bindAnyRoute : function() {
            this.on('route', function (e) {
                console.log('XF.Router :: route: ', this.getPageNameFromFragment(XF.history.fragment));
                if (XF.Pages) {
                     XF.Pages.show(this.getPageNameFromFragment(XF.history.fragment));
                }
            });
        },

        /**
         Returns page name string by fragment
         @param String fragment
         @return String
         */
        getPageNameFromFragment : function(fragment) {
            var parts = fragment.replace(/^\/+/,'').replace(/\/+$/,'').split('/');
            return parts[0];
        }
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Base Component.
     @class
     @static
     @augments XF.Events
     @see <a href="http://documentcloud.github.com/backbone/#Events">XF.Events Documentation</a>
     @param {String} name Name of the component
     @param {String} id ID of the component instance
     */
    XF.Component = function(name, id) {
        /**
         Would be dispatched once when the Component inited
         @name XF.Component#init
         @event
         */

        /**
         Would be dispatched once when the Component constructed
         @name XF.Component#construct
         @event
         */

        /**
         Would be dispatched after each render
         @name XF.Component#refresh
         @event
         */

        /**
         Name of the component.
         @default 'default_name'
         @type String
         */
        this.name = name || 'default_name';

        /**
         ID of the component.
         @default 'default_id'
         @type String
         */
        this.id = id || 'default_id';

        /**
         Flag which defines whether the component was rendered atleast once
         @type Boolean
         */
        this.rendered = false;

        /** @ignore */
        var firstRender = function() {
            this.unbind('refresh', firstRender);
            this.rendered = true;
        };

        this.bind('refresh', firstRender);

        // merging defaults with custom instance options
        var defaultOptions = this.options;
        var instanceOptions = XF.getOptionsByID(this.id);
        this.options = _.defaults(instanceOptions, defaultOptions);
    };

    /**
     Component template
     @type String
     @static
     */
    XF.Component.template = null;

    /**
     The URL of template that is currently being loaded
     @type String
     @private
     @static
     */
    XF.Component.templateURL= false;

    /**
     A flag that indiacates whether that template is currently being loaded
     @type Boolean
     @private
     @static
     */
    XF.Component.templateLoaded = false;

    /**
     A flag that indiacates whether that template was successfully loaded
     @type Boolean
     @private
     @static
     */
    XF.Component.templateLoading = false;

    /**
     Compiled component template
     @type Function
     @static
     */
    XF.Component.compiledTemplate = null;

    _.extend(XF.Component.prototype, XF.Events);

    _.extend(XF.Component.prototype, /** @lends XF.Component.prototype */{

        /**
         Object containing has-map of component options that can be different for each instance & should be set with {@link XF.setOptionsByID}
         @type Object
         */
        options : {},

        /**
         Defenition of custom Model class extending {@link XF.Model}
         */
        modelClass : XF.Model,

        /**
         Instance of {@link XF.Model} or its subclass
         @type XF.Model
         */
        model : null,

        /**
         Defenition of custom View class extending {@link XF.View}
         */
        viewClass : XF.View,

        /**
         Instance of {@link XF.View} or its subclass
         @type XF.View
         */
        view : null,

        /**
         Constructs component instance
         @private
         */
        construct : function() {

            /** @ignore */
            var viewConstructed = function() {
                this.view.unbind('construct', viewConstructed);
                this.afterConstructView();

                this.init();
                this.trigger('init');

                this.trigger('construct');
                XF.trigger(this.id + ':constructed');
            };
            /** @ignore */
            var modelConstructed = function() {
                this.model.unbind('construct', modelConstructed);
                this.afterConstructModel();

                this.beforeConstructView();
                this.constructView();

                this.view.bind('construct', viewConstructed, this);
                this.view.construct();
            };

            this.beforeConstructModel();
            this.constructModel();

            this.model.bind('construct', modelConstructed, this);
            this.model.construct();

            this.childComponent = [];
        },

        /**
         Returns component selector
         @return {String} Selector string that can be used for $.find() for example
         */
        selector : function() {
            return '[data-id=' + this.id + ']';
        },

        /**
         HOOK: override to add logic before view construction
         */
        beforeConstructView : function() {},

        /**
         Constructs {@link XF.View} object
         @private
         */
        constructView : function() {
            if(!this.view || !(this.view instanceof XF.View)) {
                if(this.viewClass) {
                    this.view = new this.viewClass();
                    if(!(this.view instanceof XF.View)) {
                        this.view = new XF.View();
                    }
                } else {
                    this.view = new XF.View();
                }
            }
            this.view.component = this;
        },

        /**
         HOOK: override to add logic after view construction
         */
        afterConstructView : function() {},

        /**
         HOOK: override to add logic before model construction
         */
        beforeConstructModel : function() {},

        /**
         Constructs {@link XF.Model} object
         @private
         */
        constructModel: function() {
            if(!this.model || !(this.model instanceof XF.Model)) {
                if(this.modelClass) {
                    this.model = new this.modelClass();
                    if(!(this.model instanceof XF.Model)) {
                        this.model = new XF.Model();
                    }
                } else {
                    this.model = new XF.Model();
                }
            }
            this.model.component = this;
        },

        /**
         HOOK: override to add logic after model construction
         */
        afterConstructModel : function() {},

        /**
         HOOK: override to add custom logic. Default behavior is to call {@link XF.Component#refresh}
         */
        init : function() {
            this.refresh();
        },

        /**
         Refreshes model data and then rerenders view
         @private
         */
        refresh : function() {
            /** @ignore */
            var onModelRefresh = function() {
                this.model.unbind('refresh', onModelRefresh);
                this.view.refresh();
                this.trigger('refresh');
            };

            this.model.bind('refresh', onModelRefresh, this);

            this.model.refresh();
        },

        /**
         A wrapper that allows to set some callbacks to be called after the component was first rendered
         @param {Function} callback A callback that would be invoked right after component's first render or right after method invocation if the component has already been rendered
         */
        ready: function(callback) {
            if(this.rendered) {
                callback();
            } else {
                /** @ignore */
                var firstRender = function() {
                    this.unbind('refresh', firstRender);

                    callback();
                };

                this.bind('refresh', firstRender, this);
            }
        }

    });

    /**
     This method allows to extend XF.Component with saving the whole prototype chain
     @function
     @static
     */
    XF.Component.extend = BB.Model.extend;


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Describes current component definition status
     @class
     @private
     @memberOf XF
     @param {String} compSrc Component definition source
     */
    var ComponentStatus = function(compSrc) {
        /**
         Component definition source
         @private
         @type String
         */
        this.compSrc = compSrc;
        /**
         Component definition
         @private
         @type XF.Component
         */
        this.compDef = null;
        /**
         Flag that determines whether the component definition is currently being loaded
         @private
         @type Boolean
         */
        this.loading = false;
        /**
         Flag that determines whether the component definition has already been loaded
         @private
         @type Boolean
         */
        this.loaded = false;
        /**
         A list of callbacks to call on component definition loading complete
         @private
         @type String[]
         */
        this.callbacks = [];
    };


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Implements data workaround flow.
     @class
     @static
     @augments XF.Events
     @param {Object} attributes list of predefined attributes
     */
    XF.Model = BB.Model.extend({
        /**
         Would be dispatched once when the Component inited
         @name XF.Model#init
         @event
         */

        /**
         Would be dispatched once when the Component constructed
         @name XF.Model#construct
         @event
         */

        /**
         Would be dispatched after each data update
         @name XF.Model#dataLoaded
         @event
         */

        /**
         Would be dispatched after each update
         @name XF.Model#refresh
         @event
         */

        /**
         Link to the {@link XF.Component} instance
         @type XF.Component
         */
        component: null,

        /**
         Object that contains plan data recieved from server
         @type Object
         */
        rawData: null,

        /**
         Data source URL
         @type String
         */
        dataURL : null,

        /**
         Settings for $ AJAX data request
         @type String
         */
        dataRequestSettings : null,

        /**
         Flag that determines whether the data should not be loaded at all
         @default false
         @type Boolean
         */
        isEmptyData : false,

        /**
         Flag that determines whether the data should be loaded once
         @default false
         @type Boolean
         */
        isStaticData : false,

        /**
         Flag that determines whether the data type is string (otherwise JSON)
         @default false
         @type Boolean
         */
        isStringData : false,

        /**
         Interval in milliseconds defining how often data should be retrived from the server; use '0' to turn autoUpdate off
         @default 0
         @type Number
         */
        autoUpdateInterval: 0,

        /**
         Flag that determines whether the data should be updateing (with autoUpdate) even if the component is currentyl hidden
         @default false
         @type Boolean
         */
        updateInBackground: false,

        /**
         Flag that determines whether the data should be updated each time the component becomes visible
         @default false
         @type Boolean
         */
        updateOnShow: false,

        /**
         Object that contains default values for attributes - should be overriden to be used
         @type Object
         */
        defaults : null,

        /**
         Constructs model instance
         @private
         */
        construct : function() {
            this.initialize();
            this.trigger('init');
            if(this.autoUpdateInterval > 0) {
                var autoUpdateFunc = _.bind(function() {
                    if($(this.component.selector()).is(':visible')) {
                        this.refresh();
                    } else if(this.updateInBackground) {
                        this.refresh();
                    }
                }, this);
                setInterval(autoUpdateFunc, this.autoUpdateInterval);
            }
            if(this.updateOnShow) {
                $(this.component.selector()).bind('show', _.bind(this.refresh, this));
            }
            this.trigger('construct');
        },

        /**
         Refreshes data from backend if necessary
         @private
         */
        refresh : function() {
            /** ignore */
            var dataLoaded = function() {
                this.unbind('dataLoaded', dataLoaded);
                var renderVersion = this.component.view.renderVersion;
                this.afterLoadData();

                //TODO: uncomment this and try to find why 'refresh' not working for menu component
                //if(this.component.view.renderVersion == renderVersion) {
                this.trigger('refresh');
                //}
            };

            this.bind('dataLoaded', dataLoaded);

            this.beforeLoadData();
            this.loadData();
        },

        /**
         Generates data url - override if custom format is required and {@link XF.Settings} has no appropriate way to handle it
         @private
         */
        getDataURL : function() {
            if(!this.dataURL) {
                if(!this.component) {
                    throw 'XF.Model "component" linkage lost';
                }
                this.dataURL = _.bind(XF.Settings.property('dataUrlFormatter'), this)(this.component.name);
            }
            return this.dataURL;
        },

        /**
         Returns settings for AddressBar AJAX data request or empty object is it is not set - override to add extra functionality
         @private
         */
        getDataRequestSettings : function() {
            return this.dataRequestSettings || {};
        },

        /**
         HOOK: override to add logic before data load
         */
        beforeLoadData : function() {},

        /**
         Loads data
         @private
         */
        loadData : function() {

            if(!this.isEmptyData && (!this.rawData || !this.isStaticData || this.autoUpdate > 0)) {

                var $this = this;
                var url = this.getDataURL();

                $.ajax(
                    _.extend(this.getDataRequestSettings(), {
                        url: url,
                        complete : function(jqXHR, textStatus) {
                            if(!$this.component) {
                                throw 'XF.Model "component" linkage lost';
                            }
                            if(textStatus == 'success') {
                                if($this.isStringData) {
                                    $this.rawData = jqXHR.responseText;
                                } else {
                                    $this.rawData = JSON.parse(jqXHR.responseText);
                                }
                            } else {
                                if($this.isStringData) {
                                    $this.rawData = {};
                                } else {
                                    $this.rawData = '';
                                }
                            }
                            $this.trigger('dataLoaded');
                        }
                    })
                );

            } else {
                this.trigger('dataLoaded');
            }
        },

        /**
         HOOK: override to add logic after data load
         */
        afterLoadData : function() {}

    });



    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Implements view workaround flow.
     @class
     @static
     @augments XF.Events
     */

    XF.View = BB.View.extend({

        /**
         Would be dispatched once when the Component inited
         @name XF.View#init
         @event
         */

        /**
         Would be dispatched once when the Component constructed
         @name XF.View#construct
         @event
         */

        /**
         Would be dispatched once, when template is ready for use
         @name XF.View#templateLoaded
         @event
         */

        /**
         Would be dispatched after each render
         @name XF.View#refresh
         @event
         */

        /**
         Link to the {@link XF.Component} instance
         @type XF.Component
         */
        component : null,

        /**
         Template URL
         @type String
         */
        templateURL : null,

        /**
         Flag that determines whether the Model update should be ignored by the View (in this case you may launch {@link XF.View#refresh} manualy)
         @default false
         @type Boolean
         */
        ignoreModelUpdate : false,

        /**
         Flag that determines whether the view should be rerendered each time the component becomes visible
         @default false
         @type Boolean
         */
        updateOnShow: false,

        /**
         Flag that determines whether the template should be stored into {@link XF.Cache}
         @default false
         @type Boolean
         */
        useCache: false,

        /**
         Constructs view instance
         @private
         */
        construct : function() {
            /** ignore */
            var templateLoaded = function() {

                if(this.loadTemplateFailed) {
                    this.unbind('templateLoaded', templateLoaded);
                    this.afterLoadTemplateFailed();
                    return;
                }

                if(!this.component.constructor.templateLoaded) {
                    this.loadTemplate();
                    return;
                }

                this.unbind('templateLoaded', templateLoaded);
                this.afterLoadTemplate();

                this.initialize();
                this.trigger('init');

                if(!this.ignoreModelUpdate) {
                    this.component.model.bind('changed', this.refresh, this);
                }
                if(this.updateOnShow) {
                    $(this.component.selector()).bind('show', _.bind(this.refresh, this));
                }

                this.trigger('construct');
            };

            this.bind('templateLoaded', templateLoaded);

            this.beforeLoadTemplate();
            this.loadTemplate();
        },

        /**
         Stores last device type that was used for template url generation
         @type String
         @private
         */
        lastDeviceType : null,

        /**
         Generates template url - override if custom format is required and {@link XF.Settings} has no appropriate way to handle it
         @private
         */
        getTemplateURL : function() {
            // clearing saved template URL - it was erroneous
            if(this.lastDeviceType) {
                this.templateURL = null;
            }
            if(!this.templateURL) {
                if(!this.component) {
                    throw 'XF.View "component" linkage lost';
                }

                this.lastDeviceType = XF.Device.getNextType(this.lastDeviceType);

                // preventing from infinit cycle
                if(!this.lastDeviceType) {
                    return null;
                }

                var templatePath = '';
                if(this.lastDeviceType && this.lastDeviceType.templatePath) {
                    templatePath = this.lastDeviceType.templatePath;
                }
                this.templateURL = XF.Settings.property('templateUrlFormatter')(this.component.name, templatePath);
            }
            return this.templateURL;
        },

        /**
         Compiles component template if necessary & executes it with current component instance model
         @static
         */
        getMarkup: function() {
            if(!this.component.constructor.compiledTemplate) {
                this.component.constructor.compiledTemplate = _.template(this.component.constructor.template);
            }
            return this.component.constructor.compiledTemplate(this.component.model);
        },

        /**
         HOOK: override to add logic before template load
         */
        beforeLoadTemplate : function() {},

        /**
         A flag that indicates whether the template loading failed
         @type Boolean
         @private
         */
        loadTemplateFailed : false,

        /**
         Loads template
         @private
         */
        loadTemplate : function() {

            var url = this.getTemplateURL();
            if(url == null) {
                this.loadTemplateFailed = true;
                this.trigger('templateLoaded');
                return;
            }

            // trying to get template from cache
            if(this.useCache) {
                var cachedTemplate = XF.Cache.get(url);
                if(cachedTemplate) {
                    this.component.constructor.template = cachedTemplate;
                    this.component.constructor.templateLoaded = true;
                    this.trigger('templateLoaded');
                    return;
                }
            }

            if(!this.component.constructor.templateLoaded && !this.component.constructor.templateLoading) {

                this.component.constructor.templateURL = url;
                this.component.constructor.templateLoading = true;

                var $this = this;

                $.ajax({
                    url: url,
                    complete : function(jqXHR, textStatus) {
                        if(!$this.component) {
                            throw 'XF.View "component" linkage lost';
                        }
                        if(textStatus == 'success') {
                            var template = jqXHR.responseText;

                            // saving template into cache if the option is turned on
                            if($this.useCache) {
                                XF.Cache.set(url, template);
                            }

                            $this.component.constructor.template = jqXHR.responseText;
                            $this.component.constructor.templateLoading = false;
                            $this.component.constructor.templateLoaded = true;
                            $this.trigger('templateLoaded');
                            XF.trigger('templateLoaded', {url: url, template:template});
                        } else {
                            $this.component.constructor.template = null;
                            $this.component.constructor.templateLoading = false;
                            $this.component.constructor.templateLoaded = false;
                            $this.trigger('templateLoaded');
                            XF.trigger('templateLoaded', {url: url, template : null});
                        }
                    }
                });

            } else if(this.component.constructor.templateLoading) {

                var $this = this;
                url = this.component.constructor.templateURL;

                /** ignore */
                var templateLoadedAsync = function(params) {
                    if(params.url == url) {
                        XF.unbind('templateLoaded', templateLoadedAsync);
                        $this.trigger('templateLoaded');
                    }
                };

                XF.bind('templateLoaded', templateLoadedAsync);

            } else {
                this.trigger('templateLoaded');
            }
        },

        /**
         HOOK: override to add logic after template load
         */
        afterLoadTemplate : function() {},

        /**
         HOOK: override to add logic for the case when it's impossible to load template
         */
        afterLoadTemplateFailed : function() {
            console.log('XF.View :: afterLoadTemplateFailed - could not load template for "' + this.component.id + '"');
            console.log('XF.View :: afterLoadTemplateFailed - @dev: verify XF.Device.types settings & XF.View :: getTemplate URL overrides');
        },

        /**
         Renders component into placeholder + calling all the necessary hooks & events
         */
        refresh : function() {
            this.preRender();
            this.render();
            this.postRender();
            this.trigger('refresh');
        },

        /**
         HOOK: override to add logic before render
         */
        preRender : function() {},


        /**
         Identifies current render vesion
         @private
         */
        renderVersion : 0,

        /**
         Renders component into placeholder
         @private
         */
        render : function() {
            this.renderVersion++;
            var DOMObject = $('[data-id=' + this.component.id + ']');
            DOMObject.html(this.getMarkup());
            loadChildComponents(DOMObject);
        },

        /**
         HOOK: override to add logic after render
         */
        postRender : function() {}

    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     XF.Pages
     @static
     @public
     */
    XF.Pages = {

        /**
         CSS class used to identify pages
         @type String
         @default 'xf-page'
         */
        pageClass : 'xf-page',

        /**
         CSS class used to identify active page
         @type String
         @default 'xf-page-active'
         */
        activePageClass : 'xf-page-active',

        /**
         Animation types for page switching ('fade', 'slide', 'none')
         @type String
         @default 'fade'
         */
        animations: {
            default: 'slideleft',
            next: null,

            types : {
                'none': {
                    fallback: function (fromPage, toPage) {}
                },
                'fade': {
                    fallback: function (fromPage, toPage) {}
                },
                'slideleft': {
                    fallback: function (fromPage, toPage) {}
                },
                'slideright': {
                    fallback: function (fromPage, toPage) {}
                }
            }
        },

        /**
         Saves current active page
         @type $
         @private
         */
        activePage : null,

        /**
         Saves current active page name
         @type $
         @private
         */
        activePageName: '',

        /**
         Initialises Pages: get current active page and binds necessary routes handling
         @private
         */
        start : function(animations) {
            XF.on('pages:show', _.bind(XF.Pages.show, XF.Pages));
            XF.on('pages:animation:next', _.bind(XF.Pages.setNextAnimationType, XF.Pages));
            XF.on('pages:animation:default', _.bind(XF.Pages.setDefaultAnimationType, XF.Pages));

            if (_.has(animations, 'types') ) {
                _.extend(this.animations.types, animations.types);
            }

            if (_.has(animations, 'default') ) {
                this.setDefaultAnimationType(animations.default);
            }

            var pages =  rootDOMObject.find(' .' + this.pageClass);
            if (pages.length) {
                var preselectedAP = pages.filter('.' + this.activePageClass);
                if(preselectedAP.length) {
                    this.activePage = preselectedAP;
                    this.activePageName = preselectedAP.attr('id');
                } else {
                    this.show(pages.first());
                }
            }
        },

        setDefaultAnimationType: function (animationType) {
            if (XF.Pages.animations.types[animationType]) {
                XF.Pages.animations.default = animationType;
            }
        },

        setNextAnimationType: function (animationType) {
            if (XF.Pages.animations.types[animationType]) {
                XF.Pages.animations.next = animationType;
            }
        },

        /**
         Executes animation sequence for switching
         @param $ jqPage
         */
        show : function(page, animationType){
            if (page === '' || page === this.activePageName) {
                return;
            }

            var jqPage = (page instanceof $) ? page : $('.' + XF.Pages.pageClass + '#' + page);

            // preventing animation when the page is already shown
            if( (this.activePage && jqPage.attr('id') == this.activePage.attr('id')) || !jqPage.length) {
                return;
            }
            console.log('XF.Pages :: showing page', jqPage.attr('id'));

            var viewport = XF.Device.getViewport();
            var screenHeight = XF.Device.getScreenHeight();

            if (this.animations.next) {
                animationType = (this.animations.types[this.animations.next] ? this.animations.next : this.animations.default);
                this.animations.next = null;
            }else {
                animationType = (this.animations.types[animationType] ? animationType : this.animations.default);
            }
                             console.log(animationType);
            var fromPage = this.activePage;
            var toPage = jqPage;

            this.activePage = toPage;
            this.activePageName = jqPage.attr('id');

            if (!XF.Device.hasAnimation) {
                if (_.isFunction(this.animations.types[animationType]['fallback'])) {
                    toPage.addClass(this.activePageClass);
                    this.animations.types[animationType].fallback(fromPage, toPage);
                    return;
                }
            }

            if (fromPage) {
                viewport.addClass('xf-viewport-transitioning');

                fromPage.addClass('out '+ animationType);
                toPage.addClass('in '+ animationType + ' ' + this.activePageClass);
                fromPage.animationEnd(function(){
                    fromPage.height('').removeClass(animationType + ' out in');
                    fromPage.removeClass(XF.Pages.activePageClass);
                });

                toPage.animationEnd(function(){
                    toPage.height('').removeClass(animationType + ' out in');
                    viewport.removeClass('xf-viewport-transitioning');
                });
            } else {
                // just making it active
                this.activePage.addClass(this.activePageClass);
            }


            // scroll to top of page ofter page switch
            window.scrollTo( 0, 1 );

            // looking for components inside the page
            loadChildComponents(this.activePage[0]);
        }
    };



    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Instance of {@link XF.DeviceClass}
     @static
     @private
     @type {Object}
     */
    XF.Device = {

        /**
         Contains device viewport size: {width; height}
         @type Object
         */
        size: {
            width: 0,
            height: 0
        },

        isMobile: ( /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).toLowerCase() ) ),


        /**
         Array of device types to be chosen from (can be set via {@link XF.start} options)
         @type Object
         @private
         */
        types: [
            {
                name : 'desktop',
                range : {
                    max : null,
                    min : 1025
                },
                templatePath : 'desktop/',
                fallBackTo : 'tablet'
            }, {
                name : 'tablet',
                range : {
                    max : 1024,
                    min : 480
                },
                templatePath : 'tablet/',
                fallBackTo : 'mobile'
            }, {
                name : 'mobile',
                range : {
                    max : 480,
                    min : null
                },
                templatePath : 'mobile/',
                fallBackTo : 'default'
            }
        ],

        /**
         Default device type that would be used when none other worked (covers all the viewport sizes)
         @type Object
         @private
         */
        defaultType: {
            name : 'default',
            range : {
                min : null,
                max : null
            },
            templatePath : '',
            fallBackTo : null
        },

        /**
         Detected device type that would be used to define template path
         @type Object
         @private
         */
        type: this.defaultType,

        /**
         A flag indicates whether the device is supporting Touch events or not
         @type Boolean
         */
        isTouchable: false,

        /**
         Initializes {@link XF.Device} instance (runs detection methods)
         @param {Array} types rray of device types to be choosen from
         */
        init : function(types) {
            this.types = types || this.types;
            this.detectType();
            this.detectTouchable();
        },

        /**
         Detectes device type (basicaly, chooses most applicable type from the {@link XF.DeviceClass#types} list)
         @private
         */
        detectType : function() {

            this.size.width = $(window).width();
            this.size.height = $(window).height();

            console.log('XF.DeviceClass :: detectType - width = "' + this.size.width + '"');
            console.log('XF.DeviceClass :: detectType - height = "' + this.size.height + '"');

            var maxSide = Math.max(this.size.width, this.size.height);

            console.log('XF.DeviceClass :: detectType - maxSide = "' + maxSide + '"');

            var res = null;
            _.each(this.types, function(type) {
                try {
                    if(
                        (!type.range.min || (type.range.min && maxSide > type.range.min)) &&
                            (!type.range.max || (type.range.max && maxSide < type.range.max))
                        ) {
                        res = type;
                    }
                } catch (e) {
                    console.log('XF.DeviceClass :: detectType - bad type detected - skipping');
                    console.log('XF.DeviceClass :: detectType - @dev: plz verify types list');
                }
            });

            if(res) {

                this.type = res;

            } else {

                this.type = this.defaultType;

                console.log('XF.DeviceClass :: detectType - could not choose any of device type');
                console.log('XF.DeviceClass :: detectType - drop back to this.defaultType');
                console.log('XF.DeviceClass :: detectType - @dev: plz verify types list');
            }

            console.log('XF.DeviceClass :: detectType - selected type "' + this.type.name + '"');
        },

        /**
         Chooses the next applicable type in case when previous one's templatePath could not be loaded
         @param {Object} fallBackFrom If passed, the return type would be taken as dropDown from it (optional)
         @return {Object} Device type
         */
        getNextType : function(fallBackFrom) {
            var aimType = this.type;
            if(fallBackFrom) {
                if(fallBackFrom.fallBackTo) {
                    aimType = this.getTypeByName(fallBackFrom.fallBackTo);
                } else {
                    aimType = this.defaultType;
                }
            }

            // just checking if type is ok
            if(aimType && aimType.templatePath) {
                // type is ok
            } else {
                aimType = this.defaultType;
            }

            // prevent looping the same type again & again
            if(aimType == fallBackFrom) {
                console.log('XF.DeviceClass :: getNextType - infinit cycle of drop down logic detected');
                console.log('XF.DeviceClass :: getNextType - stop trying, no template is available');
                return null;
            }

            return aimType;
        },

        /**
         Chooses device type by ot's name
         @param {String} typeName Value of 'name' property of the type that should be returnd
         @return {Object} Device type
         */
        getTypeByName : function(typeName) {
            var res = null;
            _.each(this.types, function(type) {
                try {
                    if(type.name == typeName) {
                        res = type;
                    }
                } catch (e) {
                    console.log('XF.DeviceClass :: getTypeByName - bad type name - skipping');
                    console.log('XF.DeviceClass :: getTypeByName - @dev: plz verify types list');
                }
            });

            return res;
        },

        /**
         Detectes whether the device is supporting Touch events or not
         @private
         */
        detectTouchable : function() {

            var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
            var style = ['@media (',prefixes.join('touch-enabled),('),'app_device_test',')', '{#touch{top:9px;position:absolute}}'].join('');

            var $this = this;

            this.injectElementWithStyles(style, function( node, rule ) {
                var style = document.styleSheets[document.styleSheets.length - 1],
                // IE8 will bork if you create a custom build that excludes both fontface and generatedcontent tests.
                // So we check for cssRules and that there is a rule available
                // More here: github.com/Modernizr/Modernizr/issues/288 & github.com/Modernizr/Modernizr/issues/293
                    cssText = style ? (style.cssRules && style.cssRules[0] ? style.cssRules[0].cssText : style.cssText || '') : '',
                    children = node.childNodes,
                    hashTouch = children[0];

                $this.isTouchable = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch || (hashTouch && hashTouch.offsetTop) === 9;

            }, 1, ['touch']);

            console.log('XF.Device :: detectTouchable - device IS ' + (this.isTouchable ? '' : 'NOT ') + 'touchable');

        },

        hasAnimation: (function () {
            var domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
                elm = document.createElement('div');

            if( elm.style.animationName ) {
                return {
                    prefix: ''
                };
            };

            for( var i = 0; i < domPrefixes.length; i++ ) {
                if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
                    return {
                        prefix: '-' + domPrefixes[i].toLowerCase() + '-'
                    };
                }
            }

            return false;

        }()),


        /**
         Inject element with style element and some CSS rules. Used for some detect* methods
         @param String rule Node styles to be applied
         @param Function callback Test validation Function
         @param Number nodes Nodes Number
         @param Array testnames Array with test names
         @private
         */
        injectElementWithStyles : function(rule, callback, nodes, testnames) {

            var style, ret, node,
                div = document.createElement('div'),
            // After page load injecting a fake body doesn't work so check if body exists
                body = document.body,
            // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
                fakeBody = body ? body : document.createElement('body');

            if(parseInt(nodes, 10)) {
                // In order not to give false positives we create a node for each test
                // This also allows the method to scale for unspecified uses
                while (nodes--) {
                    node = document.createElement('div');
                    node.id = testnames ? testnames[nodes] : 'app_device_test' + (nodes + 1);
                    div.appendChild(node);
                }
            }

            // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
            // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
            // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
            // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
            // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
            style = ['&#173;','<style>', rule, '</style>'].join('');
            div.id = 'app_device_test';
            // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
            // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
            fakeBody.innerHTML += style;
            fakeBody.appendChild(div);
            if(!body){
                //avoid crashing IE8, if background image is used
                fakeBody.style.background = '';
                docElement.appendChild(fakeBody);
            }

            ret = callback(div, rule);
            // If this is done after page load we don't want to remove the body so check if body exists
            !body ? fakeBody.parentNode.removeChild(fakeBody) : div.parentNode.removeChild(div);

            return !!ret;
        },

        /**
         Stores identifier for portrait orientation
         @constant
         @type String
         */
        ORIENTATION_PORTRAIT : 'portrait',

        /**
         Stores identifier for landscape orientation
         @constant
         @type String
         */
        ORIENTATION_LANDSCAPE : 'landscape',


        /**
         Returns current orientation of the device (ORIENTATION_PORTRAIT | ORIENTATION_LANDSCAPE)
         @return String
         */
        getOrientation : function() {
            var isPortrait = true, elem = document.documentElement;
            if ( $.support !== undefined ) {
                //TODO: uncomment and solve
                //isPortrait = portrait_map[ window.orientation ];
            } else {
                isPortrait = elem && elem.clientWidth / elem.clientHeight < 1.1;
            }
            return isPortrait ? this.ORIENTATION_PORTRAIT : this.ORIENTATION_LANDSCAPE;
        },

        /**
         Returns current screen height
         @return Number
         */
        getScreenHeight : function() {
            var orientation 	= this.getOrientation();
            var port			= orientation === this.ORIENTATION_PORTRAIT;
            var	winMin			= port ? 480 : 320;
            var	screenHeight	= port ? screen.availHeight : screen.availWidth;
            var	winHeight		= Math.max( winMin, $( window ).height() );
            var	pageMin			= Math.min( screenHeight, winHeight );

            return pageMin;
        },

        /**
         Returns viewport $ object
         @return $
         */
        getViewport : function() {
            // if there's no explicit viewport make body the viewport
            //var vp = $('.xf-viewport, .viewport') ;
            var vp = $('body').addClass('xf-viewport');
            if (!vp[0]) {
                vp = $('.xf-page').eq(0);
                if (!vp.length) {
                    vp = $('body');
                } else {
                    vp = vp.parent();
                }
                vp.addClass('xf-viewport');
            }
            return vp.eq(0)
        }
    };


    // TBDeleted : temp stuff for testApp.html
    XF.trace = function(message) {
        $('#tracer').html(message + '<br/>' + $('#tracer').html());
    };

    return window.XF = XF;

}).call(this, window, Backbone);