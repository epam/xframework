/*! X-Framework 13-08-2013 */
;(function (window, $, BB) {/**
 TODO:
 - scrollTop for Zepto
 - wrapInner for Zepto
 **/

    var rootDOMObject = $('body');

    /**
     @namespace Holds visible functionality of the framework
     */
    var XF = window.XF = window.XF || {};

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

        options.animations = options.animations || {};
        options.animations.default = options.animations.default || '';

        XF.Pages.start(options.animations);

        //XF.Pages.start();
        loadChildComponents(rootDOMObject);
    };

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
        $('body').on('click tap', '[data-href]', function() {
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
                XF.UI.enhanceView($(this));
            }
        });

//         var selector = null;
//         _.each(XF.UI.enhancementList, function(enhancement, index, enhancementList) {
//         if(!selector) {
//         selector = enhancement.selector;
//         } else {
//         selector += ', ' + enhancement.selector;
//         }
//         });
//         $(selector).on('show', function() {
//         XF.UI.enhanceView($(this));
//         });

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
         Initializes {@link XF.Device} instance (runs detection methods)
         @param {Array} types rray of device types to be choosen from
         */
        init : function(types) {
            this.types = types || this.types;
            this.detectType();
            this.detectTouchable();
        },

        supports: {
            /**
             A flag indicates whether the device is supporting Touch events or not
             @type Boolean
             */
            touchEvents: false,

            /**
             A flag indicates whether the device is supporting pointer events or not
             @type Boolean
             */
            pointerEvents: window.navigator.msPointerEnabled,

            /**
             A flag indicates whether the device is supporting CSS3 animations or not
             @type Boolean
             */
            cssAnimations: (function () {
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

            }())
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

                $this.supports.touchEvents = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch || (hashTouch && hashTouch.offsetTop) === 9;

            }, 1, ['touch']);

            console.log('XF.Device :: detectTouchable - device IS ' + (this.supports.touchEvents ? '' : 'NOT ') + 'touchable');

        },



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

            //TODO: move it to Pages.show and make showing first page by triggering empty route (should work withour routes!)
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
            if (page === this.activePageName) {
                return;
            }

            if (page === '') {
                var pages =  rootDOMObject.find(' .' + this.pageClass);
                if (pages.length) {
                    this.show(pages.first());
                }
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

            var fromPage = this.activePage;
            var toPage = jqPage;

            this.activePage = toPage;
            this.activePageName = jqPage.attr('id');

            if (!XF.Device.supports.cssAnimations) {
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

            // Check if UI
            if (XF.hasOwnProperty('UI')) {
                XF.UI.enhanceView($(this.activePage[0]));
            }
        }
    };
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

    // Default values and device events detection
    var touchHandler = {},
        eventsHandler = {

            // Events for desktop browser, old ios, old android
            mouse : {
                start : "mousedown",
                move : "mousemove",
                end : "mouseup",
                cancel : "mouseup"
            },

            // Events for modern Windows devices (IE10+)
            pointer : {
                start : "MSPointerDown",
                move : "MSPointerMove",
                end : "MSPointerUp",
                cancel : "MSPointerCancel"
            },

            // Events for touchable devices
            touch : {
                start : "touchstart",
                move : "touchmove",
                end : "touchend",
                cancel : "touchcancel"
            }
        },
        swipeDelta = 30, // Amount of pixels for swipe event
        isTouch,
        eventType;

    // Changing events depending on detected data
    isTouch = (XF.Device.pointerEvents) ? false : (XF.Device.touchEvents ? true : false);
    eventType = (XF.Device.pointerEvents) ? 'pointer' : (XF.Device.touchEvents ? 'touch' : 'mouse');

    // If target is text
    var parentIfText = function (node) {
        return 'tagName' in node ? node : node.parentNode;
    }

    // Detecting swipe direction
    var swipeDirection = function (x1, x2, y1, y2) {
        var xDelta = Math.abs(x1 - x2),
            yDelta = Math.abs(y1 - y2);
        return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
    }

    var cancelAll = function () {
        touchHandler = {};
    }

    $(document).ready(function(){
        var now,
            delta;

        $(document.body).bind(eventsHandler[eventType].start, function(e){
            now = Date.now();
            delta = now - (touchHandler.last || now);
            touchHandler.el = $(parentIfText(e.target));
            touchHandler.x1 = isTouch ? e.originalEvent.targetTouches[0].pageX : e.pageX;
            touchHandler.y1 = isTouch ? e.originalEvent.targetTouches[0].pageY : e.pageY;
            touchHandler.last = now;
        }).bind(eventsHandler[eventType].move, function (e) {
            touchHandler.x2 = isTouch ? e.originalEvent.targetTouches[0].pageX : e.pageX;
            touchHandler.y2 = isTouch ? e.originalEvent.targetTouches[0].pageY : e.pageY;

            if (Math.abs(touchHandler.x1 - touchHandler.x2) > 10) {
                e.preventDefault();
            }
        }).bind(eventsHandler[eventType].end, function(e){

            if ((touchHandler.x2 && Math.abs(touchHandler.x1 - touchHandler.x2) > swipeDelta)
                || (touchHandler.y2 && Math.abs(touchHandler.y1 - touchHandler.y2) > swipeDelta)) {
                touchHandler.direction = swipeDirection(touchHandler.x1, touchHandler.x2, touchHandler.y1, touchHandler.y2);

                // Trigger swipe event
                touchHandler.el.trigger('swipe');

                // Trigger swipe event by it's direction
                touchHandler.el.trigger('swipe' + touchHandler.direction);
                touchHandler = {};
            } else if ('last' in touchHandler) {
                touchHandler.el.trigger('tap');

                // Unbind click event if tap
                $(document.body).unbind('click');
                touchHandler.el.unbind('click');
            }
        }).bind(eventsHandler[eventType].cancel, cancelAll);

        $(window).bind('scroll', cancelAll);
    });

    // List of new events
    ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'tap'].forEach(function (i){
        $.fn[i] = function (callback) {
            return this.bind(i, callback)
        };
    });




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

    /** @ignore */
    /** Cannot use $.fn.extend because of Zepto support **/
    $.fn.outerHtml = function(replacement) {

        if(replacement) {
            return this.each(function(){
                $(this).replaceWith(replacement);
            });
        }

        var tmp_node = $('<div></div>').append( $(this).clone() );
        var markup = tmp_node.html();

        tmp_node.remove();
        return markup;
    };



    /**
     @namespace Holds all the logic related to UI elements enhancement
     */
    XF.UI = {};

    _.extend(XF.UI, /** @lends XF.UI */ {

        /**
         Reworks markup of a givven $ object
         @param jqObj $ item
         */
        enhanceView : function(jqObj) {

            if(!jqObj instanceof $) {
                jqObj = $(jqObj);
                if(!jqObj instanceof $) {
                    return;
                }
            }

            _.each(XF.UI.enhancementList, function(enhancement, index, enhancementList) {
                jqObj.find(enhancement.selector).not('[data-skip-enhance=true]').each( function(){
                    var skip = false;
                    _.each(XF.UI.enhanced.length, function(elem, index, enhancementList) {
                        if(XF.UI.enhanced[i] === this) {
                            skip = true;
                        }
                    });
                    if(!skip & $(this).attr('data-skip-enhance') != 'true') {
                        XF.UI.enhanced.push(this);
                        XF.UI[enhancement.enhanceElement].Render(this);
                    }
                });
            });

        },

        /**
         A list of all the enhancements that whould be done of every $ object givven
         @type Object
         @private
         */
        enhancementList : {},

        /**
         A list of objects already enhanced (used to skip them while iterating through DOM)
         @type Array
         @private
         */
        enhanced : [],

        issetElements : [],

        checkInIsset : function (type, id) {
            var type = type || '',
                id = id || '',
                result = [];

            for (var i in this.issetElements) {

                if (id === '') {

                    if (this.issetElements[i].type === type) {
                        result.push(this.issetElements[i].id);
                    }
                } else {

                    if (this.issetElements[i].type === type && this.issetElements[i].id === id) {
                        result.push(this.issetElements[i].id);
                    }
                }
            }

            return result;
        }

    });


    XF.UI.enhancementList.button = {
            selector : 'A[data-role=button], BUTTON, INPUT[type=submit], INPUT[type=reset], INPUT[type=button], [data-appearance=backbtn]',
            enhanceElement : 'Button'
    };
    /**
     Make the DOM object look like a button
     @param button DOM Object
     @private
     */
    XF.UI.Button = {
        Render : function(button) {
            var jQButton = $(button);
            if(!button || !jQButton instanceof $) {
                return;
            }

            if(jQButton.attr('data-skip-enhance') == 'true') {
                return;
            }

            var enhancedButton;
            var innerStuff;



            //UNDERSCORE TEMPLATES

    //        var inputTpl = _.template('<div></div>');
            //-- UNDERSCORE TEMPLATES

            // If it's A or BUTTON, the necessary classes are added to the element itself
            if(button.nodeName == 'A' || button.nodeName == 'BUTTON') {
                enhancedButton = jQButton.attr({'data-skip-enhance':true});
                innerStuff = jQButton.html();
                jQButton.html('');
                // If it's INPUT - it's wrapped in a DIV and the necessary classes are added to the DIV.
            } else if(button.nodeName == 'INPUT') {
                // The input is assigned a class xf-input-hidden
                enhancedButton = $('<div></div>').append(jQButton.clone().addClass('xf-input-hidden').attr({'data-skip-enhance':true}));
                jQButton.outerHtml(enhancedButton);
                innerStuff = jQButton.attr('value');
            } else {
                // how did U get there? o_O
                return;
            }

            var isSmall = jQButton.attr('data-small') == 'true' || jQButton.attr('data-appearance') == 'backbtn';

            // The class xf-button is added to the button.
            // If it has data-small="true" attribute, the class should be xf-button-small.
            enhancedButton.addClass(isSmall ? 'xf-button-small' : 'xf-button');

            // If data-appearance="backbtn" attribute is present, xf-button-back class is also added.
            if(jQButton.attr('data-appearance') == 'backbtn') {
                enhancedButton.addClass('xf-button-back');
            }

            var iconName = jQButton.attr('data-icon');

            if(jQButton.attr('data-appearance') == 'backbtn' /*&& !jQButton.attr('data-icon')*/) {
                iconName = 'left';
            }

            if(iconName) {

                // If data-icon attribute is present, a SPAN.xf-icon is added inside the button.
                var iconSpan = $('<span class=xf-icon></span>');

                // The value of data-icon attribute is used to generate icon class: e.g. xf-icon-dots.
                iconSpan.addClass('xf-icon-' + iconName);

                // If the button had data-small=true or data-appearance="backbtn" attributes,
                // xf-icon-small class is also added to SPAN.xf-icon
                if(isSmall) {
                    iconSpan.addClass('xf-icon-small');
                } else {
                    iconSpan.addClass('xf-icon-big');
                }

                // A class denoting icon position is also added to the button. Default: xf-iconpos-left.
                // The value is taken from data-iconpos attr.
                // Possible values: left, right, top, bottom.
                var iconPos = jQButton.attr('data-iconpos') || 'left';
                if(iconPos != 'left' && iconPos != 'right' && iconPos != 'top' && iconPos != 'bottom') {
                    iconPos = 'left';
                }
                enhancedButton.addClass('xf-iconpos-' + iconPos);
                enhancedButton.append(iconSpan);

            }

            if(innerStuff) {
                var textSpan = $('<span></span>').append(innerStuff);
                // The text of buttons is placed inside span.xf-button-small-text for small buttons
                if(isSmall || jQButton.attr('data-appearance') == 'backbtn') {
                    textSpan.addClass('xf-button-small-text');
                    // and span.xf-button-text for big ones.
                } else {
                    textSpan.addClass('xf-button-text');
                }
                enhancedButton.append(textSpan);
            }

            // If data-special="true" attribute is present add xf-button-special class.
            if(jQButton.attr('data-special') == 'true') {
                enhancedButton.addClass('xf-button-special');
            }
            if(jQButton.attr('data-alert') == 'true') {
                enhancedButton.addClass('xf-button-alert');
            }

            // If data-alert="true" attribute is present add xf-button-alert class.
            if(jQButton.attr('data-alert') == 'true') {
                enhancedButton.addClass('xf-button-alert');
            }
        },

        /**
         Generates and enhances button
         @param buttonDescr Object
         @return $
         */
        Create : function (buttonDescr)  {
            /*
             buttonDescr = {
             text,
             icon,
             iconpos,
             small,
             appearance,
             special,
             alert,
             handler
             }
             */
            var jQButton = $('<button>/button>');
            jQButton.html(buttonDescr.text);
            var attrs = {};
            if(buttonDescr.icon && buttonDescr.icon != '') {
                attrs['data-icon'] = buttonDescr.icon;
            };
            if(buttonDescr.iconpos && buttonDescr.iconpos != '') {
                attrs['data-iconpos'] = buttonDescr.iconpos;
            };
            if(buttonDescr.small && buttonDescr.small != '') {
                attrs['data-small'] = buttonDescr.small;
            };
            if(buttonDescr.appearance && buttonDescr.appearance != '') {
                attrs['data-appearance'] = buttonDescr.appearance;
            };
            if(buttonDescr.special && buttonDescr.special != '') {
                attrs['data-special'] = buttonDescr.special;
            };
            if(buttonDescr.alert && buttonDescr.alert != '') {
                attrs['data-alert'] = buttonDescr.alert;
            };
            if(_.isFunction(buttonDescr.handler)) {
                jQButton.click(buttonDescr.handler)
            };


            jQButton.attr(attrs);

            XF.UI.Button.Render(jQButton[0]);

            return jQButton;
        }
    };


    XF.UI.enhancementList.checkboxRadio = {
        selector : 'INPUT[type=checkbox], INPUT[type=radio]',
        enhanceElement : 'CheckboxRadio'
    };

    /**
     Enhances checkbox or radio button input view
     @param textInput DOM Object
     @private
     */
    XF.UI.CheckboxRadio = {

        Render : function(chbRbInput) {

            var jQChbRbInput = $(chbRbInput),
                options = {
                    id : '',
                    input : '',
                    wrapperClass : '',
                    labelClass : '',
                    labelFor : '',
                    isSwitch : false,
                    label : ''
                };
            if(!chbRbInput || !jQChbRbInput instanceof $ || jQChbRbInput.attr('data-skip-enhance') == 'true') {
                return;
            }

            jQChbRbInput.attr({'data-skip-enhance':true});
            options.id = jQChbRbInput.attr('id') || 'xf-' + Math.floor(Math.random()*10000);
            options.input = jQChbRbInput.wrap("<span></span>").parent().html();
            jQChbRbInput.attr('id', options.id);
            var chbRbInputLabel = $('label[for=' + options.id + ']');

            // If the input doesn't have an associated label, quit
            if(chbRbInputLabel.length) {

                var typeValue = jQChbRbInput.attr('type').toLowerCase(),
                    wrapper = $('<div></div>'),
                    isSwitch = options.isSwitch = jQChbRbInput.attr('data-role') == 'switch';

                if (!isSwitch) {
                    options.wrapperClass = 'xf-input-' + typeValue;
                    options.labelClass = 'xf-input-positioner';
                    chbRbInputLabel.addClass('xf-input-label');
                } else {
                    options.wrapperClass = 'xf-switch';
                    options.labelClass = 'xf-switch-control';
                    chbRbInputLabel.addClass('xf-switch-label');
                }
                wrapper.append(chbRbInputLabel);
                options.labelFor = chbRbInputLabel.wrap("<span></span>").parent().html();

                var _template = _.template(
                    '<div class="<%= options.wrapperClass %>"><label for="<%= options.id %>" class="<%= options.labelClass %>">'
                    + '<%= options.input %><% if(options.isSwitch) { %>'
                    + '<span class=xf-switch-track><span class=xf-switch-track-wrap>'
                    + '<span class=xf-switch-thumb></span>'
                    + '</span></span>'
                    + '<% } %>'
                    + '</label><%= options.labelFor %></div>'
                );
                jQChbRbInput.parent().html(_template({options : options}));

                // fix iOS bug when labels don't check radios and checkboxes
                /*
                 wrapper.on('click', 'label[for="'+ chbRbInputID +'"]', function(){
                 if (!$(this).data('bound')) {
                 var $input = $('#'+ chbRbInputID);
                 alert($input[0].checked);
                 $input.attr({checked: !$input[0].checked});
                 !$(this).data('bound', true)
                 }
                 })*/
            }
        }
    };


    XF.UI.enhancementList.fieldset = {
        selector : 'fieldset[data-role=controlgroup]',
        enhanceElement : 'Fieldset'
    };

    /**
     Enhances fieldset view
     @param textInput DOM Object
     @private
     */
    XF.UI.Fieldset =  {

        Render : function(fieldset) {
            var jQFieldset = $(fieldset);
            if(!fieldset || !jQFieldset instanceof $ || jQFieldset.attr('data-skip-enhance') == 'true') {
                return;
            }

            var id = jQFieldset.attr('id') || 'xf-' + Math.floor(Math.random()*10000);

            jQFieldset.attr({'data-skip-enhance':  true, 'id' : id});

            // If the inputs have a parent fieldset[data-role=controlgroup], the fieldset
            // is assigned a class xf-controlgroup,

            jQFieldset.addClass('xf-controlgroup');

            // If there's a legend element inside the fieldset, it becomes div.xf-label
            var legend = jQFieldset.children('legend').detach();

            // the inputs are also wrapped in a div.xf-controlgroup-controls
            jQFieldset.wrapInner('<div class="xf-controlgroup-controls">');
            jQFieldset.prepend(legend);

            if(legend.length) {
                var legendDiv = $('<div></div>');
                var newLegendAttrs = {};
                _.each(legend[0].attributes, function(attribute) {
                    newLegendAttrs[attribute.name] = attribute.value;
                });
                legendDiv.attr(newLegendAttrs).addClass('xf-label').html(legend.html());
                legend.outerHtml(legendDiv.outerHtml());
            }
        }
    };


    XF.UI.enhancementList.list = {
        selector : 'UL[data-role=listview], OL[data-role=listview]',
        enhanceElement : 'List'
    };

    /**
     Enhances ul/ol lists view
     @param list DOM Object
     @private
     */
    XF.UI.List = {

        Render : function (list) {
            var jQList = $(list);

            if(!list || !jQList instanceof $ || jQList.attr('data-skip-enhance') == 'true') {
                return;
            }

            var listItems = jQList.children('li'),
                linkItems = listItems.children('a'),
                listItemsScope = [],
                fullWidth = jQList.attr('data-fullwidth') || 'false',
                listId = jQList.attr('id') || 'xf-' + Math.floor(Math.random()*10000);

            linkItems.addClass('xf-li-btn').children('.xf-count-bubble').parent().addClass('xf-li-has-count');
            listItems.not(linkItems.parent()).not('[data-role=divider]').addClass('xf-li-static');

            jQList.attr({'data-skip-enhance':true, 'id': listId}).addClass('xf-listview')
                .children('li[data-icon]').children('a').each(function() {
                    var anchor = $(this);
                    var icon = anchor.parent().attr('data-icon');
                    anchor.append(
                        $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-' + icon)
                    );
                    var iconPos = anchor.parent().attr('data-iconpos');
                    if(iconPos != 'left' && iconPos != 'right') {
                        iconPos = 'right';
                    }
                    anchor.addClass('xf-li-with-icon-' + iconPos);
                });

            if (fullWidth === 'true') {
                jQList.addClass('xf-listview-fullwidth');
            }

            linkItems.children('img').parent().each(function(){
                var anchor = $(this);
                var thumbPos = anchor.parent().attr('data-thumbpos');
                if(thumbPos != 'right' && thumbPos != 'left') {
                    thumbPos = 'left';
                }
                anchor.addClass('xf-li-with-thumb-' + thumbPos);
                anchor.children('img').addClass('xf-li-thumb xf-li-thumb-' + thumbPos);
            });
            linkItems.each(function() {
                var anchor = $(this);
                anchor.append(
                    $('<div class=xf-btn-text></div>')
                        .append(
                            anchor.children().not('.xf-icon, .xf-count-bubble, .xf-li-thumb')
                        )
                );
            });

            listItems.find('h1, h2, h3, h4, h5, h6').addClass('xf-li-header');

            listItems.find('p').addClass('xf-li-desc');

            listItems.filter('.xf-li-static').each(function(){
                $(this).wrapInner('<div class=xf-li-wrap />');
            });

            $.each(listItems, function(key, value) {
                var html = listItems.eq(key).html(),
                    role = listItems.eq(key).attr('data-role') || '',
                    class_ = (listItems.eq(key).attr('class') || '') + ' xf-li',
                    id = listItems.eq(key).attr('id') || '';

                if (role !== '') {
                    class_ += ' xf-li-' + role;
                }
                listItemsScope.push({'html': html, 'class': class_, 'id': id});
            });

            var _template = _.template(
                '<% _.each(listItemsScope, function(item) { %> '
                    + '<li class="<%= item.class %>" id="<%= item.id %>"><%= item.html %></li>'
                + '<% }); %>'
            );

            jQList.html( _template({listItemsScope : listItemsScope}) );
        }
    };


    /**
     Generates basic popup container
     @return $
     @private
     */
    XF.UI.Popup = {
        Create : function () {
            /*
             <div class="xf-dialog "><div class="xf-dialog-content"></div></div>
             */
            var id = 'xf-' + Math.floor(Math.random() * 10000),
                idStack = XF.UI.checkInIsset('Popup'),
                newId = false;

            for (var i in idStack) {

                if (newId) {

                    if (!$('#' + idStack[i]).length) {
                        id = idStack[i];
                        newId = true;
                    }
                }
            }

            if (!newId) {
                XF.UI.issetElements.push({type : 'Popup', id : id});
            }
            var jqPopup = $('<div class="xf-dialog " id="' + id + '"><div class="xf-dialog-content"></div></div>');

            return jqPopup;
        },

        /**
         Shorthand to show dialogs
         @param headerText String to show in dialog header
         @param messageText String to show in dialog body
         @param buttons Array of buttons to show ($ objects or objects with button description for createButton() method)
         */
        ShowDialog : function (headerText, messageText, buttons) {
            var popup = this.CreateDialog(headerText, messageText, buttons);
            this.Show(popup);
        },

        /**
         Attaches popup (dialog/notification/etc.) to the page
         @param jqPopup $ object representing popup
         */
        Show : function(jqPopup) {
            XF.Device.getViewport().append(jqPopup);
        },

        /**
         Detaches popup (dialog/notification/etc.) from the page
         @param jqPopup $ object representing popup
         */
        Hide : function(jqPopup) {
            jqPopup.detach();
        },


        /**
         Generates a dialog with header, message and buttons
         @param headerText String to show in dialog header
         @param messageText String to show in dialog body
         @param buttons Array of buttons to show ($ objects or objects with button description for createButton() method)
         @param modal Boolean Flag which indicates whether the dialog is modal
         @return $ Dialog object
         */
        CreateDialog : function(headerText, messageText, buttons) {

            /*
             <div class="xf-dialog-box">
             <div class="xf-dialog-box-header">
             <h3>Impossible! <!-- Header text here --> </h3>
             </div>
             <div class="xf-dialog-box-content">
             <!-- Message text here -->
             You’re the smartest guy I've ever known.
             </div>
             <div class="xf-dialog-box-footer clearfix">
             <!-- Buttons here -->
             <div class="xf-grid-unit xf-grid-unit-1of2">
             <button class="xf-button xf-button-small">
             <span class="xf-button-text">Cancel</span>
             </button>
             </div>
             <div class="xf-grid-unit xf-grid-unit-1of2">
             <button class="xf-button xf-button-small xf-button-special">
             <span class="xf-button-text">OK</span>
             </button>
             </div>
             </div>
             </div>
             */

            var jqDialog = this.Create();
            jqDialog.find('.xf-dialog-content')
                .append(
                    $('<div></div>')
                        .addClass('xf-dialog-box')
                        .append(
                            $('<div></div>')
                                .addClass('xf-dialog-box-header')
                                .append(
                                    $('<h3></h3>')
                                        .html(headerText)
                                )
                        )
                        .append(
                            $('<div></div>')
                                .addClass('xf-dialog-box-content')
                                .html(messageText)
                        )
                        .append(
                            $('<div></div>')
                                .addClass('xf-dialog-box-footer clearfix')
                        )
                );

            var jqBtnContainer = jqDialog.find('.xf-dialog-box-footer');

            if (!buttons) {
                buttons = [{
                    text: 'OK',
                    handler: function (){
                        this.Hide(jqDialog);
                    }
                }]
            }

            if(buttons) {
                var btnCount = buttons.length;

                var jqBtn;
                _.each(buttons, function(btn, index, buttons){
                    if(btn instanceof $){
                        jqBtn = btn;
                    } else {
                        jqBtn = XF.UI.Button.Create(btn);
                    }

                    jqBtnContainer.append(
                        $('<div></div>')
                            .addClass('xf-grid-unit xf-grid-unit-1of' + btnCount)
                            .append(jqBtn)
                    );
                });
            }
            this.Dialog = jqDialog;
            return jqDialog;
        },

        /**
         Generates a notification with text and icon
         @param messageText String to show in dialog body
         @param iconName Icon name (optional)
         @return $ Notification object
         */
        CreateNotification : function(messageText, iconName) {

            /*
             <div class="xf-notification">
             <div class="xf-notification-wrap">
             <div class="xf-notification-icon">
             <span class="xf-icon xf-icon-xl xf-icon-dots"></span>
             </div>
             <div class="xf-notification-text">
             Loading...
             </div>
             </div>
             </div>
             */

            var jqNotification = this.Create().addClass('xf-dialog-notification');
            jqNotification.find('.xf-dialog-content')
                .append(
                    $('<div></div>')
                        .addClass('xf-notification')
                        .append(
                            $('<div></div>')
                                .addClass('xf-notification-wrap')
                                .append(
                                    $('<div></div>')
                                        .addClass('xf-notification-text')
                                        .html(messageText)
                                )
                        )
                );

            if(iconName && iconName != '') {
                jqNotification.find('.xf-notification-wrap')
                    .prepend(
                        $('<div></div>')
                            .addClass('xf-notification-icon')
                            .append(
                                $('<span></span>')
                                    .addClass('xf-icon xf-icon-xl xf-icon-' + iconName)
                            )
                    );
            }

            return jqNotification;
        },

        /**
         Stores loading notification object
         @type $
         @private
         */
        LoadingNotification : null,


        /**
         Stores dialog object
         @type $
         @private
         */
        Dialog : null,

        /**
         Saves passed popup as default loading notification
         @param jqPopup $ object representing popup
         */
        SetLoadingNotification : function(jqPopup) {
            this.LoadingNotification = jqPopup;
        },

        /**
         Shows loading notification (and generates new if params are passed)
         @param messageText String to show in loading notification
         @param icon Icon name (optional)
         */
        ShowLoading : function (messageText, icon) {
            if(messageText || icon) {
                if(this.LoadingNotification) {
                    this.HideLoading();
                }
                this.SetLoadingNotification(
                    this.CreateNotification(messageText, icon)
                );
            }
            if(!!this.LoadingNotification) {
                this.SetLoadingNotification(
                    this.CreateNotification('Loading...')
                );
            }
            this.Show(this.LoadingNotification);
        },

        /**
         Hides loading notification
         */
        HideLoading : function () {
            if(this.LoadingNotification) {
                this.HidePopup(this.LoadingNotification);
            }
        },

        /**
         Hides Dialog
         */
        HideDialog : function () {
            if(this.Dialog) {
                this.HidePopup(this.Dialog);
            }
        }
    };


    XF.UI.enhancementList.scrollable = {
        selector : '[data-scrollable=true]',
        enhanceElement : 'Scrollable'
    };

    /**
     Adds scrolling functionality
     @param scrollable DOM Object
     @private
     */
    XF.UI.Scrollable = {

        Render : function(scrollable) {

            var jQScrollable = $(scrollable);
            if(!scrollable || !jQScrollable instanceof $ || jQScrollable.attr('data-skip-enhance') == 'true') {
                return;
            }

            var id = jQScrollable.attr('id') || 'xf-' + Math.floor(Math.random()*10000);

            jQScrollable.attr({'data-skip-enhance':true, 'id' : id});

            var children = jQScrollable.children();
            // always create wrapper
            if(children.length == 1 && false) {
                children.addClass('xf-scrollable-content');
            } else {
                jQScrollable.append(
                    $('<div></div>')
                        .addClass('xf-scrollable-content')
                        .append(children)
                );
            }

            var wrapperId = jQScrollable.attr('id');
            if(!wrapperId || wrapperId == '') {
                wrapperId = 'xf_scrollable_' + new Date().getTime();
                jQScrollable.attr({'id':wrapperId});
            }

            var ISItem = jQScrollable.data('iscroll', new iScroll(wrapperId));
            var wrapperChanged = false;
            var doRefreshIScroll = function() {
                if(wrapperChanged) {
                    wrapperChanged = false;
                    ISItem.data('iscroll').refresh();
                    bindHanlders();
                }
            };
            var needRefreshIScroll = function(){
                if($.contains($('#' + wrapperId)[0], this)) {
                    wrapperChanged = true;
                    setTimeout(doRefreshIScroll, 100);
                }
            };

            var bindHanlders = function() {
                $('#' + wrapperId + ' *')
                    .bind('detach', needRefreshIScroll)
                    .bind('hide', needRefreshIScroll)
                    .bind('show', needRefreshIScroll)
                    .bind('append', needRefreshIScroll)
                    .bind('prepend', needRefreshIScroll)
                    .bind('html', needRefreshIScroll)
                    .bind('resize', needRefreshIScroll);
            };

            bindHanlders();
        }
    };


    XF.UI.enhancementList.textinput = {
        selector : 'INPUT[type=text], INPUT[type=search], INPUT[type=tel], ' +
                    'INPUT[type=url], INPUT[type=email], INPUT[type=password], INPUT[type=datetime], ' +
                    'INPUT[type=date], INPUT[type=month], INPUT[type=week], INPUT[type=time], ' +
                    'INPUT[type=datetime-local], INPUT[type=number], INPUT[type=color], TEXTAREA, ' +
                    //
                    'INPUT[type=range], INPUT[type=search]',
        enhanceElement : 'Input'
    };
    /**
     Enhances text input view
     @param textInput DOM Object
     @private
     */
    XF.UI.Input = {
        Render : function (textInput) {

            var jQTextInput = $(textInput);
            if(!textInput || !jQTextInput instanceof $ || jQTextInput.attr('data-skip-enhance') == 'true') {
                return;
            }

            jQTextInput.attr({'data-skip-enhance':true});

            // For inputs of types:
            // 	text, search, tel, url, email, password, datetime, date, month,
            // 	week, time, datetime-local, number, color and also for TEXTAREA element
            // 	add class "xf-input-text".
            jQTextInput.addClass('xf-input-text');

            var isInputElement = (textInput.nodeName == 'INPUT');
            var textInputType = jQTextInput.attr('type');

            // For inputs of types "range" and "search" change type to "text".
            if(textInputType == 'search') {
                var newTextInput = $('<input type="text"/>');
                var newTIAttrs = {};
                _.each(textInput.attributes, function(attribute) {
                    if(attribute.name == 'type') {
                        return;
                    }
                    newTIAttrs[attribute.name] = attribute.value;
                });
                newTextInput.attr(newTIAttrs);
                jQTextInput.outerHtml(newTextInput);
                jQTextInput = newTextInput;
                textInput = newTextInput[0];

                /*
                 <div class="xf-input-number">
                 <button class="xf-input-number-control xf-input-number-control-decrease "
                 type="button">
                 <span class="xf-icon xf-icon-big xf-icon-minus-circled"></span>
                 </button>
                 <input type="text" class="xf-input-text" min="0" max="1200" value="400">
                 <button class="xf-input-number-control xf-input-number-control-increase"
                 type="button">
                 <span class="xf-icon xf-icon-big xf-icon-plus-circled"></span>
                 </button>
                 </div>
                 */
            } else if(textInputType == 'number' || textInputType == 'range') {

                var minValue = jQTextInput.attr('min');
                var maxValue = jQTextInput.attr('max');
                var selValue = parseFloat(jQTextInput.attr('value'));
                var step = parseFloat(jQTextInput.attr('step')) || 1;

                // For inputs of types "range" and "search" change type to "text".
                var newTextInput = $('<input type="text"/>');
                var newTIAttrs = {};
                _.each(textInput.attributes, function(attribute) {
                    if(attribute.name == 'type') {
                        return;
                    }
                    newTIAttrs[attribute.name] = attribute.value;
                });
                newTextInput.attr(newTIAttrs);
                newTextInput.attr({'data-skip-enhance':true})

                var numberWrapper = $('<div></div>').addClass('xf-input-number');
                numberWrapper.append(
                    $('<button type="button"></button>')
                        .addClass('xf-input-number-control xf-input-number-control-decrease')
                        .attr({'data-skip-enhance':true})
                        .append(
                            $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-minus-circled')
                        )
                );
                numberWrapper.append(newTextInput);
                numberWrapper.append(
                    $('<button type="button"></button>')
                        .addClass('xf-input-number-control xf-input-number-control-increase')
                        .attr({'data-skip-enhance':true})
                        .append(
                            $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-plus-circled')
                        )
                );

                var rangeWrapper = null;

                if(textInputType == 'number') {

                    jQTextInput.outerHtml(numberWrapper);
                    jQTextInput = numberWrapper;
                    textInput = numberWrapper[0];

                } else if(textInputType == 'range') {

                    /*
                     <div class="xf-input-range">
                     <div class="xf-range-wrap">
                     <div class="xf-input-range-min">0</div>
                     <div class="xf-input-range-slider">
                     <div class="xf-input-range-track">
                     <div class="xf-input-range-value" style="width: 30%">
                     <div class="xf-input-range-control" tabindex="0">
                     <div class="xf-input-range-thumb" title="400"></div>
                     </div>
                     </div>
                     </div>
                     </div>
                     <div class="xf-input-range-max">1200</div>
                     </div>
                     </div>
                     */

                    rangeWrapper = $('<div></div>').addClass('xf-range');
                    rangeWrapper.append(numberWrapper);

                    // If there is no either min or max attribute -- don't render the slider.
                    if((minValue || minValue === 0) && (maxValue || maxValue === 0)) {

                        minValue = parseFloat(minValue);
                        maxValue = parseFloat(maxValue);

                        var percValue = (selValue - minValue) * 100 / (maxValue - minValue);
                        rangeWrapper.append(
                                $('<div></div>')
                                    .addClass('xf-input-range')
                                    .append(
                                        $('<div></div>')
                                            .addClass('xf-range-wrap')
                                            .append(
                                                $('<div></div>')
                                                    .addClass('xf-input-range-min')
                                                    .html(minValue)
                                            )
                                            .append(
                                                $('<div></div>')
                                                    .addClass('xf-input-range-slider')
                                                    .append(
                                                        $('<div></div>')
                                                            .addClass('xf-input-range-track')
                                                            .append(
                                                                $('<div></div>')
                                                                    .addClass('xf-input-range-value')
                                                                    .css({'width':'' + percValue + '%'})
                                                                    .append(
                                                                        $('<div></div>')
                                                                            .addClass('xf-input-range-control')
                                                                            .attr({'tabindex':'0'})
                                                                            .append(
                                                                                $('<div></div>')
                                                                                    .addClass('xf-input-range-thumb')
                                                                                    .attr({'title':'' + selValue})
                                                                                    .css({'left':'' + 100 + '%'})
                                                                            )
                                                                    )
                                                            )
                                                    )
                                            )
                                            .append(
                                                $('<div></div>')
                                                    .addClass('xf-input-range-max')
                                                    .html(maxValue)
                                            )
                                    )
                            )
                            .append($('<div></div>').addClass('xf-slider'));

                        jQTextInput.outerHtml(rangeWrapper);
                        jQTextInput = rangeWrapper;
                        textInput = rangeWrapper[0];
                    }

                }

                var setNewValue = function(newValue) {

                    var modulo = newValue % step;
                    var steppedVal = newValue - modulo;
                    if(modulo > step/2) {
                        steppedVal += step;
                    }
                    newValue = steppedVal;

                    if((maxValue || maxValue === 0) && newValue > maxValue) {
                        newValue = maxValue;
                    }

                    if((minValue || minValue === 0) && newValue < minValue) {
                        newValue = minValue;
                    }

                    selValue = newValue;

                    newTextInput.attr({'value':newValue});

                    if(rangeWrapper) {
                        rangeWrapper.find('div.xf-input-range-thumb').attr({'title':newValue});

                        var percValue = (newValue - minValue) * 100 / (maxValue - minValue);
                        rangeWrapper.find('div.xf-input-range-value').css({'width':'' + percValue + '%'});
                    }

                };

                var stepUp = function() {
                    var newValue = parseFloat(newTextInput.attr('value'));
                    newValue += step;
                    setNewValue(newValue);
                };

                var stepDown = function() {
                    var newValue = parseFloat(newTextInput.attr('value'));
                    newValue -= step;
                    setNewValue(newValue);
                };

                // initialing number stepper buttons (-) & (+) click handlers
                numberWrapper.find('button.xf-input-number-control-decrease').click(stepDown);
                numberWrapper.find('button.xf-input-number-control-increase').click(stepUp);

                var savedInputText = newTextInput.attr('value');
                var newInputText;
                var inputTextChange = function(event) {
                    newInputText = newTextInput.attr('value');
                    // prevent multiple recalculations in case when several events where triggered
                    if(savedInputText == newInputText) {
                        return;
                    }

                    newInputText = parseFloat(newInputText);
                    if(isNaN(newInputText)) {
                        newInputText = minValue;
                    }
                    savedInputText = newInputText;
                    setNewValue(newInputText);
                };

                newTextInput
                    .change(inputTextChange)
                    //.keyup(inputTextChange)
                    //.keydown(inputTextChange)
                    .focus(inputTextChange)
                    .focusout(inputTextChange);

                if(rangeWrapper) {

                    var trackW = undefined;
                    var savedVal;
                    var valueDiff;
                    var mousePrevX;
                    var mouseNewX;
                    var mouseDiff;

                    var trackDiffToValueDiff = function(trackDiff) {
                        if(!trackW) {
                            trackW = rangeWrapper.find('div.xf-input-range-track')[0].clientWidth;
                        }
                        return (trackDiff / trackW * (maxValue - minValue));
                    };

                    var trackPointToValuePoint = function(trackPoint) {
                        return (trackDiffToValueDiff(trackPoint) + minValue);
                    };

                    var startThumbDrag = function() {
                        mousePrevX = event.pageX || event.clientX || layerX || event.screenX;
                        savedVal = selValue;
                        $(document).bind('mouseup', stopThumbDrag);
                        $(document).bind('mousemove', doThumbDrag);
                    };

                    var doThumbDrag = function() {
                        mouseNewX = event.pageX || event.clientX || layerX || event.screenX;
                        mouseDiff = mouseNewX - mousePrevX;
                        valueDiff = trackDiffToValueDiff(mouseDiff);
                        mousePrevX = mouseNewX;
                        savedVal += valueDiff;
                        setNewValue(savedVal);
                    };

                    var stopThumbDrag = function() {
                        $(document).unbind('mouseup', stopThumbDrag);
                        $(document).unbind('mousemove', doThumbDrag);
                    };

                    var startThumbPress = function() {
                        $(document).bind('keydown', doThumbPress);
                    };

                    var doThumbPress = function(event) {
                        switch(event.keyCode) {
                            // PG Up
                            case 33:
                                setNewValue(selValue + 3*step);
                                break;
                            // PG Down
                            case 34:
                                setNewValue(selValue - 3*step);
                                break;
                            // End
                            case 35:
                                setNewValue(maxValue);
                                break;
                            // Home
                            case 36:
                                setNewValue(minValue);
                                break;
                            // arrow up
                            case 38:
                            // arrow right
                            case 39:
                                setNewValue(selValue + step);
                                break;
                            // arrow left
                            case 37:
                            // arrow down
                            case 40:
                                setNewValue(selValue - step);
                                break;
                        }
                    };

                    var stopThumbPress = function() {
                        $(document).unbind('keydown', doThumbPress);
                    };

                    // initialing slider thumb dragging handler
                    rangeWrapper.find('div.xf-input-range-thumb').bind('mousedown', startThumbDrag);

                    // initialing arrow keys press handling
                    rangeWrapper.find('div.xf-input-range-control')
                        .bind('focus', startThumbPress)
                        .bind('focusout', stopThumbPress);

                    var trackClick = function(event) {
                        // skipping events fired by thumb dragging
                        if(event.target == rangeWrapper.find('div.xf-input-range-thumb')[0]) {
                            return;
                        }
                        setNewValue(trackPointToValuePoint(event.offsetX));
                    };

                    // initialing track click handler
                    rangeWrapper.find('div.xf-input-range-track').bind('click', trackClick);
                }
            }

            // Some Text-based inputs (text, search, tel, url, email, password, datetime, date, month,
            // week, time, datetime-local, color) with data-appearance="split" attribute
            // are parsed specifically:
            var splitAppearance = false;
            if(jQTextInput.attr('data-appearance') == 'split' && isInputElement) {

                var applicableTypes = ['text', 'search', 'tel', 'url', 'email',
                    'password', 'datetime', 'date', 'month', 'week', 'time', 'datetime-local', 'color'];

                _.each(applicableTypes, function(applicableType) {
                    if(textInputType == applicableType) {
                        splitAppearance = true;
                    }
                });
            }

            var textInputID = jQTextInput.attr('id');
            var textInputLabel = (textInputID.length) ? $('label[for=' + textInputID + ']') : [];

            // If the input doesn't have an associated label, quit
            if(textInputLabel.length) {

                if(splitAppearance) {

                    // Add class xf-input-split-input to the input
                    jQTextInput.removeClass('xf-input-text').addClass('xf-input-split-input');

                    // Add class xf-input-split-label to the label
                    textInputLabel.addClass('xf-input-split-label');

                    // Wrap both in div.xf-input-split
                    var splitDiv = $('<div></div>').addClass('xf-input-split');

                    // Wrap the label in div.xf-grid-unit.xf-input-split-part1
                    splitDiv.append($('<div></div>').addClass('xf-grid-unit xf-input-split-part1').append(textInputLabel));

                    // Wrap the input in div.xf-grid-unit.xf-input-split-part2
                    splitDiv.append($('<div></div>').addClass('xf-grid-unit xf-input-split-part2').append(jQTextInput.clone()));

                    jQTextInput.outerHtml(splitDiv);
                    jQTextInput = splitDiv;
                    textInput = splitDiv[0];

                } else {

                    // If inputs of the named types and textarea have a label associated to them (with "for" attribute
                    // with a value equal to input "id" attribute), the label is assigned a class name of "xf-label"
                    textInputLabel.addClass('xf-label');

                }
            }
        }
    };
}).call(this, window, $, Backbone);