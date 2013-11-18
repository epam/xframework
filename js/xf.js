/*! XFramework 18-11-2013 */
;(function (window, $, BB) {

    /* $ hooks */

    var _oldhide = $.fn.hide;
    /** @ignore */
    $.fn.hide = function(speed, callback) {
        var res = _oldhide.apply(this,arguments);
        //$(this).trigger('hide');
        return res;
    };

    var _oldshow = $.fn.show;
    /** @ignore */
    $.fn.show = function(speed, callback) {
        var res = _oldshow.apply(this, arguments);
        if ($(this).find('[data-component]').length) XF.trigger('xf:loadChildComponents', this);
        return res;
    };

    var _oldhtml = $.fn.html;
    /** @ignore */
    $.fn.html = function(a) {
        var res = _oldhtml.apply(this, arguments);
        if ($(this).find('[data-component]').length) XF.trigger('xf:loadChildComponents', this);
        return res;
    };

    var _oldappend = $.fn.append;
    /** @ignore */
    $.fn.append = function() {
        var res = _oldappend.apply(this, arguments);
        if ($(this).find('[data-component]').length) XF.trigger('xf:loadChildComponents', this);
        return res;
    };

    var _oldprepend = $.fn.prepend;
    /** @ignore */
    $.fn.prepend = function() {
        var res = _oldprepend.apply(this, arguments);
        if ($(this).find('[data-component]').length) XF.trigger('xf:loadChildComponents', this);
        return res;
    };

    $.fn.animationEnd = function (callback) {
        var animationEndEvents = 'webkitAnimationEnd oAnimationEnd msAnimationEnd animationend';

        $(this).one(animationEndEvents, callback);

        return this;
    };


    // Root DOM Object for starting the application
    // TODO: should be moved to app settings
    var rootDOMObject = $('body');

    // Namespaceolds visible functionality of the framework
    var XF = window.XF = window.XF || {};

    // Linking Backbone.Events to XF.Events
    // And making XF a global event bus
    XF.Events = BB.Events;
    _.extend(XF, XF.Events);

    // XF.navigate is a syntax sugar for navigating between routes with event dispatching
    // Needed to make pages switching automatically
    XF.navigate = function (fragment) {
        XF.router.navigate(fragment, {trigger: true});
    };

    // Event bidnings for global XF commands
    XF.on('navigate', XF.navigate);


    // Listening to all global XF events to push them to necessary component if it's constructed
    XF.on('all', function (eventName) {
        var compEventSplitter = /\:/,
            parts;

        if (!compEventSplitter.test(eventName)) {
            return;
        }

        parts = eventName.split(compEventSplitter);

        if (parts[0] !== 'component' && parts.length < 3) {
            return;
        }

        var compID = parts[1];

        if (!XF._defferedCompEvents) {
            XF._defferedCompEvents = {};
        }

        if (parts[0] === 'component' && parts[2] === 'rendered') {
            onComponentRender(compID);
        }

        if (!XF.getComponentByID(compID)) {
            var events = XF._defferedCompEvents[compID] || (XF._defferedCompEvents[compID] = []);
            events.push(eventName);
            XF.on('component:' + compID + ':constructed', function () {
                _.each(events, function (e) {
                    XF.trigger(e);
                });
            });
        }

    });

    // Searching for pages inside every component
    // Pages should be on the one level and can be started only once
    onComponentRender = function (compID) {
        var compObj = $(XF.getComponentByID(compID).selector());

        if (_.has(XF, 'pages')) {
            if (!XF.pages.status.started) {
                XF.trigger('pages:start', compObj);
            }
        }
    };

    //
    XF.start = function(options) {

        options = options || {};
        options.history = options.history || {
            'pushState': false
        };

        // initializing XF.storage
        XF.storage.init();

        // initializing XF.device
        options.device = options.device || {};
        XF.device.init(options.device.types);

        // initializing XF.touch
        if ('touch' in XF) {
            XF.touch.init();
        }

        // options.router
        options.router = options.router || {};
        createRouter(options.router);

        placeAnchorHooks();

        if (_.has(XF, 'ui')) {
            XF.ui.init();
        }

        XF.router.start(options.history);

        options.animations = options.animations || {};
        options.animations.standardAnimation = options.animations.standardAnimation || '';

        if (_.has(XF.device.type, 'defaultAnimation')) {
            options.animations.standardAnimation = XF.device.type.defaultAnimation;
            console.log('Options.animations', options.animations);
        }

        XF.pages.init(options.animations);



        //XF.pages.start();
        loadChildComponents(rootDOMObject);

        XF.trigger('app:started');
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    // Router creation from XF.Router
    // Passing parameters with routes to constructor
    var createRouter = function(options) {
        if(XF.router) {
            throw 'XF.createRouter can be called only ONCE!';
        } else {
            XF.router = new (XF.Router.extend(options))();
        }
    };


    // Making each element with `data-href` attribute tappable (touchable, clickable)
    // It will work with application routes and pages
    // `data-animation` on such element will set the next animation type for the page
    var placeAnchorHooks = function() {
        $('body').on('tap click', '[data-href]', function() {
            var animationType = $(this).data('animation') || null;
            if (animationType) {
                XF.trigger('pages:animation:next', animationType);
            }
            XF.router.navigate( $(this).data('href'), {trigger: true} );
        });
    };

    // Loads component definitions for each visible component placeholder found
    // Searches inside DOMObject passed
    var loadChildComponents = XF.loadChildComponents = function(DOMObject) {
        if ($(DOMObject).attr('[data-component]')) {
            if ($(DOMObject).is(':visible')) {
                var compID = $(value).attr('data-id');
                var compName = $(value).attr('data-component');
                loadChildComponent(compID, compName);
            }
        }

        $(DOMObject).find('[data-component][data-cache=true],[data-component]:visible').each(function(ind, value) {
            var compID = $(value).attr('data-id');
            var compName = $(value).attr('data-component');
            if (compID && compName) {
                loadChildComponent(compID, compName);
            }
        });
    };

    XF.on('xf:loadChildComponents', XF.loadChildComponents);

    // Loads component definition and creates its instance
    var loadChildComponent = function(compID, compName) {
        getComponent(compName, function(compDef) {
            if(!components[compID] && _.isFunction(compDef)) {
                var compInst = new compDef(compName, compID);
                components[compID] = compInst;
                compInst._constructor();
            }
        });
    };

    /**
     Binds hide/show listners to each component placeholder. This listener should load component definition and create an instance of a component as soon as the placeholder would become visible
     @memberOf XF
     @private
     */
    /*var bindHideShowListeners = function() {
        $('body').on('show html append prepend', function(evt) {
            if (evt.currentTarget === evt.target) {
                var compID = $(this).attr('data-id');
                if(!components[compID]) {
                    var compName = $(this).attr('data-component');
                    loadChildComponent(compID, compName);
                }
                XF.trigger('ui:enhance', $(this));
            }
        });
    };   */

    // Loads script from passed url and after it calls the function in callback
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
                console.log('script loaded');
                if(callback) {
                    callback();
                }
            };
        }

        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    };

    // Stores instances of XF.Component and its subclasses
    var components = {};

    // Stores instances of XF.ComponentStatus — registered Components
    var registeredComponents = {};

    // Loads component definition if necessary and passes it to callback function
    var getComponent = function(compName, callback) {
        var compStatus = registeredComponents[compName];
        if(!compStatus) {
            compStatus = XF.registerComponent(compName, XF.settings.property('componentUrl')(compName));
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

    // Returns component instance by its id
    XF.getComponentByID = function(compID) {
        return components[compID];
    };

    // Removes component instances with ids in array `ids` from `components`
    XF._removeComponents = function (ids) {
        if (!_.isEmpty(ids)) {
            _.each(ids, function (id) {
                components = _.omit(components, id);
            });
        }
    };

    // Registers component source
    XF.registerComponent = function(compName, compSrc) {
        var compStatus = registeredComponents[compName];
        if(compStatus) {
            return compStatus;
        }
        registeredComponents[compName] = new ComponentStatus(compSrc);
        return registeredComponents[compName];
    };

    // Creates namespace from passing string and sets the data if it's passed
    var createNamespace = function ( namespace, data ) {
        if (typeof namespace !== 'string') {
            throw ('Namespace should be a string');
        }

        if (!/^[a-z0-9_\.]+$/i.test(namespace)) {
            throw ('Namespace string "'+ namespace + '" is wrong. It can contain only numbers, letters and dot char');
        }

        var parts = namespace.split('.'),
            parent = window,
            plen, i;

        plen = parts.length;
        for (i = 0; i < plen; i++) {
            if (typeof parent[parts[i]] === 'undefined') {
                parent[parts[i]] = {};
                if (data && plen === (i + 1)) {
                    parent[parts[i]] = data;
                }
            }
            parent = parent[parts[i]];
        }

        return parent;
    };


    // Returns the last part of namespace string
    var getLastNamespacePart = function (ns) {
        return ns.substr(ns.lastIndexOf(".") + 1);
    };

    // Defines class and calls registered callbacks if necessary
    XF.define = XF.defineComponent = function(ns, def) {
        var namespace,
            shortNs;

        var compStatus = registeredComponents[ns];
        if(!compStatus) {
            compStatus = registeredComponents[ns] = new ComponentStatus(null);
        }

        registeredComponents[ns].loading = false;
        registeredComponents[ns].loaded = true;
        registeredComponents[ns].compDef = def;

        namespace = createNamespace(ns, registeredComponents[ns].compDef);

        while(compStatus.callbacks.length) {
            compStatus.callbacks.pop()(compStatus.compDef);
        }

        // TODO: uncomment and solve the problem with window.DOMobject
        //shortNs = getLastNamespacePart(ns);
        //console.log('SHORT', shortNs);
        //if (shortNs !== ns) {
            //XF.define(shortNs, registeredComponents[ns].compDef);
        //}
    };

    // Returns all registered components
    XF.getRegisteredComponents = function () {
        return registeredComponents;
    };

    // Should invoke component loading & call callback function as soon as component would be available
    XF.requireComponent = function(compName, callback) {
        getComponent(compName, callback);
    };

    // Stores custom options for XF.Component or its subclasses instances
    var componentOptions = {};

    // Defines component instance custom options
    XF.setOptionsByID = function(compID, options) {
        componentOptions[compID] = options;
    };

    // Returns custom instance options by component instance ID
    XF.getOptionsByID = function(compID) {
        return componentOptions[compID] || {};
    };

    // Linking Backbone.history to XF.history
    XF.history = BB.history;






XF.App = function(options) {
    options = options || {};
    options.device = options.device || {};

    // options.settings
    _.extend(XF.settings, options.settings);

    this.initialize();

    XF.start(options);
};


_.extend(XF.App.prototype, XF.Events);

_.extend(XF.App.prototype, /** @lends XF.App.prototype */{
    initialize: function () {


    }
});

/**
 This method allows to extend XF.App with saving the whole prototype chain
 @function
 @static
 */
XF.App.extend = BB.Model.extend;

    // Method announces touchevents for elements
    XF.touch = {

        init : function () {
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
            isTouch = (XF.device.supports.pointerEvents) ? false : (XF.device.supports.touchEvents ? true : false);
            eventType = (XF.device.supports.pointerEvents) ? 'pointer' : (XF.device.supports.touchEvents ? 'touch' : 'mouse');

            // If target is text
            var parentIfText = function (node) {
                return 'tagName' in node ? node : node.parentNode;
            };

            // Detecting swipe direction
            var swipeDirection = function (x1, x2, y1, y2) {
                var xDelta = Math.abs(x1 - x2),
                    yDelta = Math.abs(y1 - y2);
                return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
            };

            // Cancelling all hadlers
            var cancelAll = function () {
                touchHandler = {};
            };

            // Events binding
            $(document).ready(function () {
                var now,
                    delta;

                $(document.body).bind(eventsHandler[eventType].start, function (e) { // Pointer / Touch start event
                    now = Date.now();
                    delta = now - (touchHandler.last || now);
                    touchHandler.el = $(parentIfText(isTouch ? e.originalEvent.targetTouches[0].target : e.originalEvent.target));
                    touchHandler.x1 = isTouch ? e.originalEvent.targetTouches[0].clientX : e.originalEvent.clientX;
                    touchHandler.y1 = isTouch ? e.originalEvent.targetTouches[0].clientY : e.originalEvent.clientY;
                    touchHandler.last = now;
                    
                }).bind(eventsHandler[eventType].move, function (e) { // Pointer / Touch move event
                    touchHandler.x2 = isTouch ? e.originalEvent.targetTouches[0].clientX : e.originalEvent.clientX;
                    touchHandler.y2 = isTouch ? e.originalEvent.targetTouches[0].clientY : e.originalEvent.clientY;

                    if (Math.abs(touchHandler.x1 - touchHandler.x2) > 10) {
                        e.preventDefault();
                    }
                }).bind(eventsHandler[eventType].end, function (e) { // Pointer / Touch end event

                    if ((touchHandler.x2 && Math.abs(touchHandler.x1 - touchHandler.x2) > swipeDelta) ||
                        (touchHandler.y2 && Math.abs(touchHandler.y1 - touchHandler.y2) > swipeDelta)) {
                        touchHandler.direction = swipeDirection(touchHandler.x1, touchHandler.x2, touchHandler.y1, touchHandler.y2);

                        // Trigger swipe event
                        touchHandler.el.trigger('swipe');

                        // Trigger swipe event by it's direction
                        touchHandler.el.trigger('swipe' + touchHandler.direction);
                        touchHandler = {};
                        
                    } else if ('last' in touchHandler) {
                        
                        // Trigger tap event
                        touchHandler.el.trigger('tap');

                        // Unbind click event if tap
                        $(document.body).unbind('click');
                        touchHandler.el.unbind('click');
                        
                    }
                });

                // Cancel all handlers if window scroll
                $(window).bind('scroll', cancelAll);
            });

            // List of new events
            $.each(['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'tap'], function (i, key){
                $.fn[key] = function (callback) {
                    return this.bind(key, callback);
                };
            });
        }

    };
    /**
     Instance of {@link XF.RouterClass}
     @static
     @type {XF.router}
     */
    XF.router = null;

    /**
     Implements Routing.
     @class
     @static
     @augments XF.Events
     @param {Object} routes routes has map
     @param {Object} handlers handlers has map
     */
    XF.Router = BB.Router;

    _.extend(XF.Router.prototype, /** @lends XF.Router.prototype */{


        /**
         Initiates Rounting & history listening
         @private
         */
        start : function(options) {
            this.bindAnyRoute();
            XF.history.start(options);
            XF.trigger('ui:enhance', $('body'));
        },


        /**
         Binds a callback to any route
         @param {Function} callback A function to be called when any route is visited
         */
        bindAnyRoute : function() {
            this.on('route', function (e) {
                console.log('XF.router :: route: ', this.getPageNameFromFragment(XF.history.fragment));
                if (XF.pages) {
                    XF.pages.show(this.getPageNameFromFragment(XF.history.fragment));
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
    XF.utils = {};

    /**
     @namespace Holds all the reusable util functions related to Adress Bar
     */
    XF.utils.addressBar = {};

    XF.utils.uniqueID = function () {
        return 'xf-' + Math.floor(Math.random()*100000);
    };

    _.extend(XF.utils.addressBar, /** @lends XF.utils.addressBar */{

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
            console.log('XF :: utils :: addressBar :: hide');
            var win = window;

            // if there is a hash, or XF.utils.addressBar.BODY_SCROLL_TOP hasn't been set yet, wait till that happens
            if( !location.hash && XF.utils.addressBar.BODY_SCROLL_TOP !== false){
                win.scrollTo( 0, XF.utils.addressBar.BODY_SCROLL_TOP === 1 ? 0 : 1 );
            }


            if (XF.device.isMobile) {
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
            console.log('XF :: utils :: addressBar :: hideOnLoad');
            var win = window,
                doc = win.document;

            // If there's a hash, or addEventListener is undefined, stop here
            if( !location.hash && win.addEventListener ) {

                //scroll to 1
                window.scrollTo( 0, 1 );
                XF.utils.addressBar.BODY_SCROLL_TOP = 1;

                //reset to 0 on bodyready, if needed
                bodycheck = setInterval(function() {
                    if( doc.body ) {
                        clearInterval( bodycheck );
                        XF.utils.addressBar.BODY_SCROLL_TOP = XF.utils.addressBar.getScrollTop();
                        //XF.utils.addressBar.hide();
                    }
                }, 15);

                win.addEventListener( 'load',
                    function() {
                        setTimeout(function() {
                            //at load, if user hasn't scrolled more than 20 or so...
                            if( XF.utils.addressBar.getScrollTop() < 20 ) {
                                //reset to hide addr bar at onload
                                //XF.utils.addressBar.hide();
                            }
                        }, 0);
                    }
                );
            }
        }
    });
    /**
     XF.pages
     @static
     @public
     */
    XF.pages = {

        status: {
            started: false
        },

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
            standardAnimation: 'slideleft',
            next: null,

            types : {
                'none': {
                    fallback: function (fromPage, toPage) {
                        fromPage.removeClass(this.activePageClass);
                        toPage.addClass(this.activePageClass);
                    }
                },
                'fade': {
                    fallback: function (fromPage, toPage) {
                        $(fromPage).removeClass(this.activePageClass);
                        $(toPage).addClass(this.activePageClass);
                    }
                },
                'slideleft': {
                    fallback: function (fromPage, toPage) {
                        $(fromPage).removeClass(this.activePageClass);
                        $(toPage).addClass(this.activePageClass);
                    }
                },
                'slideright': {
                    fallback: function (fromPage, toPage) {
                        $(fromPage).removeClass(this.activePageClass);
                        $(toPage).addClass(this.activePageClass);
                    }
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
         Initialises pages: get current active page and binds necessary routes handling
         @private
         */
        init : function(animations) {
            XF.on('pages:show', _.bind(XF.pages.show, XF.pages));
            XF.on('pages:animation:next', _.bind(XF.pages.setNextAnimationType, XF.pages));
            XF.on('pages:animation:default', _.bind(XF.pages.setDefaultAnimationType, XF.pages));
            XF.on('pages:start', _.bind(XF.pages.start, XF.pages));

            if (_.has(animations, 'types') ) {
                _.extend(this.animations.types, animations.types);
            }

            if (_.has(animations, 'standardAnimation') ) {
                this.setDefaultAnimationType(animations.standardAnimation);
            }

            this.start();
        },

        start: function (jqObj) {
            if (this.status.started) {
                return;
            }

            jqObj = jqObj || $('body');
            var pages =  jqObj.find(' .' + this.pageClass);
            if (pages.length) {
                var preselectedAP = pages.filter('.' + this.activePageClass);
                if(preselectedAP.length) {
                    this.activePage = preselectedAP;
                    this.activePageName = preselectedAP.attr('id');
                } else {
                    this.show(pages.first());
                }

                XF.off('pages:start');
                this.status.started = true;
            }
        },

        setDefaultAnimationType: function (animationType) {
            if (XF.pages.animations.types[animationType]) {
                XF.pages.animations.standardAnimation = animationType;
            }
        },

        setNextAnimationType: function (animationType) {
            if (XF.pages.animations.types[animationType]) {
                XF.pages.animations.next = animationType;
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

            var jqPage = (page instanceof $) ? page : $('.' + XF.pages.pageClass + '#' + page);

            // preventing animation when the page is already shown
            if( (this.activePage && jqPage.attr('id') == this.activePage.attr('id')) || !jqPage.length) {
                return;
            }
            console.log('XF.pages :: showing page', jqPage.attr('id'));

            var viewport = XF.device.getViewport();
            var screenHeight = XF.device.getScreenHeight();

            if (this.animations.next) {
                animationType = (this.animations.types[this.animations.next] ? this.animations.next : this.animations.standardAnimation);
                this.animations.next = null;
            }else {
                animationType = (this.animations.types[animationType] ? animationType : this.animations.standardAnimation);
            }

            var fromPage = this.activePage;
            var toPage = jqPage;

            this.activePage = toPage;
            this.activePageName = jqPage.attr('id');

            if (!XF.device.supports.cssAnimations) {
                if (_.isFunction(this.animations.types[animationType]['fallback'])) {
                    _.bind(this.animations.types[animationType].fallback, this)(fromPage, toPage);
                }
            }else{
                if (fromPage) {
                    viewport.addClass('xf-viewport-transitioning');

                    fromPage.height(viewport.height()).addClass('out '+ animationType);
                    toPage.height(viewport.height()).addClass('in '+ animationType + ' ' + this.activePageClass);
                    fromPage.animationEnd(function(){
                        fromPage.height('').removeClass(animationType + ' out in');
                        fromPage.removeClass(XF.pages.activePageClass);
                    });

                    toPage.animationEnd(function(){
                        toPage.height('').removeClass(animationType + ' out in');
                        viewport.removeClass('xf-viewport-transitioning');
                    });
                } else {
                    // just making it active
                    this.activePage.addClass(this.activePageClass);
                }
            }

            XF.trigger('ui:enhance', $(this.activePage));

            // looking for components inside the page
            loadChildComponents(this.activePage[0]);
        }
    };


    /**
     @namespace Holds all the logic related to ui elements enhancement
     */
    XF.ui = {};

    _.extend(XF.ui, /** @lends XF.ui */ {

        init: function () {
            XF.on('ui:enhance', _.bind(XF.ui.enhance, XF.ui));
        },

        /**
         Reworks markup of a givven $ object
         @param jqObj $ item
         */

        enhance : function (jqObj) {
            if (!(jqObj instanceof $)) {
                jqObj = $(jqObj);

                if (!jqObj instanceof $) {
                    return;
                }
            }

            _.each(XF.ui, function (enhancement, index) {

                if (typeof enhancement === 'object' && enhancement.hasOwnProperty('selector')) {

                    jqObj.find(enhancement.selector).not('[data-skip-enhance=true]').each(function (){
                        var skip = false;

                        _.each(XF.ui.enhanced.length, function (elem, index) {

                            if (XF.ui.enhanced[i] === this) {
                                skip = true;
                            }
                        });

                        if (!skip & $(this).attr('data-skip-enhance') != 'true') {
                            var options = $(this).data();
                            XF.ui.enhanced.push(this);
                            enhancement.render(this, options);
                        }
                    });
                }
            });

        },

        /**
         A list of objects already enhanced (used to skip them while iterating through DOM)
         @type Array
         @private
         */
        enhanced : [],

        issetElements : [],

        checkInIsset : function (type, id) {
            type = type || '';
            id = id || '';
            var result = [];

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
        },

        removeFromIsset : function (type, id) {
            type = type || '';
            id = id || '';
            var result = [];

            for (var i in this.issetElements) {

                if (id === '') {

                    if (this.issetElements[i].type !== type) {
                        result.push(this.issetElements[i]);
                    }
                } else {

                    if (this.issetElements[i].type !== type && this.issetElements[i].id !== id) {
                        result.push(this.issetElements[i]);
                    }
                }
            }

            this.issetElements = result;
        }

    });

    /**
     {@link XF.settings}
     @static
     @type {Object}
     */
    XF.settings = {
        /**
         Used for {@link XF.storage} clearance when new version released
         @memberOf XF.settings.prototype
         @default '1.0.0'
         @type String
         */
        appVersion: '1.0.0',
        /**
         Deactivates cache usage for the whole app (usefull for developement)
         @memberOf XF.settings.prototype
         @default false
         @type String
         */
        noCache: false,
        /**
         Used by default Component URL formatter: prefix + component_name + postfix
         @memberOf XF.settings.prototype
         @default ''
         @type String
         */
        componentUrlPrefix: 'js/components/',
        /**
         Used by default Component URL formatter: prefix + component_name + postfix
         @memberOf XF.settings.prototype
         @default '.js'
         @type String
         */
        componentUrlPostfix: '.js',
        /**
         Default Component URL formatter: prefix + component_name + postfix
         @param {String} compName Component name
         @memberOf XF.settings.prototype
         @returns {String} Component URL
         @type Function
         */
        componentUrl: function(compName) {
            return XF.settings.property('componentUrlPrefix') + compName + XF.settings.property('componentUrlPostfix');
        },

        /**
         Used by default Template URL formatter: prefix + component_name + postfix
         @memberOf XF.settings.prototype
         @default ''
         @type String
         */
        templateUrlPrefix: 'tmpl/',
        /**
         Used by default Template URL formatter: prefix + component_name + postfix
         @memberOf XF.settings.prototype
         @default '.tmpl'
         @type String
         */
        templateUrlPostfix: '.tmpl',


        /**
         Used by default Data URL formatter: prefix + component_name + postfix
         @memberOf XF.settings.prototype
         @default ''
         @type String
         */
        dataUrlPrefix: '',


        ajaxSettings: {

        },

        /**
         Gets or sets property value (depending on whether the 'value' parameter was passed or not)
         @param {String} propName
         @param {Object} [value] new value of the property
         */
        property: function(propName, value) {
            if(value === undefined) {
                return this[propName];
            } else {
                this[propName] = value;
            }
        }
    };
    /**
     Instance of {@link XF.CacheClass}
     @static
     @private
     @type {Object}
     */
    XF.storage = {

        /**
         Local reference to the localStorage
         @type {Object}
         */
        storage: null,

        /**
         Indicates whether accessibility test for localStorage was passed at launch time
         @type {Object}
         */
        isAvailable: false,

        /**
         Runs accessibility test for localStorage & clears it if the applicationVersion is too old
         */
        init : function() {

            this.storage = window.localStorage;

            // checking availability
            try {
                this.storage.setItem('check', 'check');
                this.storage.removeItem('check');
                this.isAvailable = true;
            } catch(e) {
                this.isAvailable = false;
            }

            // clearing localStorage if stored version is different from current
            var appVersion = this.get('appVersion');
            if(XF.settings.property('noCache')) {
                // cache is disable for the whole site manualy
                console.log('XF.storage :: init - cache is disable for the whole app manually - clearing storage');
                this.set('appVersion', XF.settings.property('appVersion'));
            } else if(appVersion && appVersion == XF.settings.property('appVersion')) {
                // same version is cached - useing it as much as possible
                console.log('XF.storage :: init - same version is cached - using it as much as possible');
            } else {
                // wrong or no version cached - clearing storage
                console.log('XF.storage :: init - wrong or no version cached - clearing storage');
                this.clear();
                this.set('appVersion', XF.settings.property('appVersion'));
            }
        },

        /**
         Returns a value stored in cache under appropriate key
         @param {String} key
         @return {String}
         */
        get : function(key) {
            var result;
            if(this.isAvailable) {
                try {
                    result = this.storage.getItem(key);
                    console.log('XF.storage :: get - "' + key + '" = "' + result + '"');
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
            if(this.isAvailable) {
                try {
                    this.storage.setItem(key, value);
                    result = true;
                    console.log('XF.storage :: set - "' + key + '" = "' + value + '"');
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
            if(this.isAvailable) {
                try {
                    this.storage.clear();
                    result = true;
                    console.log('XF.storage :: clear');
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
XF.device = {

    /**
    Contains device viewport size: {width; height}
    @type Object
    */
    size: {
        width: 0,
        height: 0
    },

    isMobile: ( /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).toLowerCase() ) ),

    isIOS: (
        /iphone|ipod|ipad/i.test((navigator.userAgent||navigator.vendor||window.opera).toLowerCase() )
    ),


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
Initializes {@link XF.device} instance (runs detection methods)
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

        if (elm.style.animationName) {
            return {
                prefix: ''
            };
        }

        for (var i = 0; i < domPrefixes.length; i++) {
            if (elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined) {
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
Chooses device type by ot's name
@param {String} typeName Value of 'name' property of the type that should be returnd
@return {Object} device type
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

    console.log('XF.device :: detectTouchable - device IS ' + (this.supports.touchEvents ? '' : 'NOT ') + 'touchable');

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

    if (parseInt(nodes, 10)) {
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
    
    if (!body){
        //avoid crashing IE8, if background image is used
        fakeBody.style.background = '';
        docElement.appendChild(fakeBody);
    }

    ret = callback(div, rule);
    
    // If this is done after page load we don't want to remove the body so check if body exists
    if (!body) {
        fakeBody.parentNode.removeChild(fakeBody);
    } else {
        div.parentNode.removeChild(div);
    }

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
    var orientation     = this.getOrientation();
    var port            = orientation === this.ORIENTATION_PORTRAIT;
    var	winMin          = port ? 480 : 320;
    var	screenHeight    = port ? screen.availHeight : screen.availWidth;
    var	winHeight       = Math.max( winMin, $( window ).height() );
    var	pageMin         = Math.min( screenHeight, winHeight );

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
    return vp.eq(0);
}
};
XF.Collection = BB.Collection.extend({

    _initProperties: function () {
        this.status = {
            loaded: false,
            loading: false,
            loadingFailed: false
        };

        if (!_.has(this, 'root')) {
            this.root = null;
        }
        if (!_.has(this, 'ajaxSettings')) {
            this.ajaxSettings = null;
        }
        this.component = null;
    },

    _bindListeners: function () {
        //this.on('change reset sync add', this.onDataChanged, this);
        this.on('refresh', this.refresh, this);
    },

    constructor: function (models, options) {
        this._initProperties();
        this._bindListeners();
        
        if (!options) {
            options = {};
        }

        if (options.component) {
            this.component = options.component;
        }
        _.omit(options, 'component');
        
        this.url = this.url || XF.settings.property('dataUrlPrefix').replace(/(\/$)/g, '') + '/' + (_.has(this, 'component') && this.component !== null && _.has(this.component, 'name') ? this.component.name + '/' : '');

        if (_.has(this, 'component') && this.component !== null && this.component.options.updateOnShow) {
            $(this.component.selector()).bind('show', _.bind(this.refresh, this));
        }

        this.ajaxSettings = this.ajaxSettings || _.defaults({}, XF.settings.property('ajaxSettings'));

        if (_.has(this.ajaxSettings, 'success') && _.isFunction(this.ajaxSettings.success)) {
            var onDataLoaded = _.bind(this._onDataLoaded, this),
                onSuccess = this.ajaxSettings.success;

            this.ajaxSettings.success = function () {
                onDataLoaded();
                onSuccess();
            };
        } else {
            this.ajaxSettings.success = _.bind(this._onDataLoaded, this);
        }

        BB.Collection.apply(this, arguments);
    },

    /**
     Constructs model instance
     @private
     */
    initialize : function() {

    },

    construct: function () {

    },

    /**
     Refreshes data from backend if necessary
     @private
     */
    refresh : function () {
        this.status.loaded = false;
        this.status.loading = true;

        this.reset();
        this.ajaxSettings.silent = false;
        this.fetch(this.ajaxSettings);
    },

    fetch: function (options) {
        options = _.defaults(options || {}, this.ajaxSettings);

        return Backbone.Collection.prototype.fetch.call(this, options);
    },

    _onDataLoaded: function () {
        console.log('data loaded', this);
        this.status.loaded = true;
        this.status.loading = false;

        this.trigger('fetched');
    }

});
XF.Model = BB.Model.extend({

    _initProperties: function () {
        this.status = {
            loaded: false,
            loading: false,
            loadingFailed: false
        };

        if (!_.has(this, 'root')) {
            this.root = null;
        }
        if (!_.has(this, 'ajaxSettings')) {
            this.ajaxSettings = null;
        }
        this.component = null;
    },

    _bindListeners: function () {
        this.on('refresh', this.refresh, this);
    },

    constructor: function (attributes, options) {
        this._initProperties();
        this._bindListeners();
        
        if (!options) {
            options = {};
        }

        if (options.component) {
            this.component = options.component;
        }
        _.omit(options, 'component');

        this.urlRoot = this.urlRoot || XF.settings.property('dataUrlPrefix').replace(/(\/$)/g, '') + '/' + (_.has(this, 'component') && this.component !== null && _.has(this.component, 'name') ? this.component.name + '/' : '');

        if (_.has(this, 'component') && this.component !== null && this.component.options.updateOnShow) {
            $(this.component.selector()).bind('show', _.bind(this.refresh, this));
        }

        this.ajaxSettings = this.ajaxSettings || XF.settings.property('ajaxSettings');

        if (_.has(this.ajaxSettings, 'success') && _.isFunction(this.ajaxSettings.success)) {
            var onSuccess = this.ajaxSettings.success,
                onDataLoaded = _.bind(this._onDataLoaded, this);
            this.ajaxSettings.success = function () {
                onDataLoaded();
                onSuccess();
            };
        }else{
            this.ajaxSettings.success = _.bind(this._onDataLoaded, this);
        }

        BB.Model.apply(this, arguments);
    },

    /**
     Constructs model instance
     @private
     */
    initialize : function() {

    },

    construct: function () {

    },

    /**
     Refreshes data from backend if necessary
     @private
     */
    refresh : function () {
        this.status.loaded = false;
        this.status.loading = true;

        this.fetch(this.ajaxSettings);
    },

    fetch: function (options) {
        options = _.defaults(options || {}, this.ajaxSettings);

        return Backbone.Collection.prototype.fetch.call(this, options);
    },

    _onDataLoaded: function () {
        this.status.loaded = true;
        this.status.loading = false;

        this.trigger('fetched');
    }

});
    /**
     Implements view workaround flow.
     @class
     @static
     @augments XF.Events
     */

    XF.View = BB.View.extend({

        url: function () {
            return XF.settings.property('templateUrlPrefix') + XF.device.type.templatePath + this.component.name + XF.settings.property('templateUrlPostfix');
        },

        /**
         Flag that determines whether the Model update should be ignored by the View (in this case you may launch {@link XF.View#refresh} manualy)
         @default false
         @type Boolean
         */

        _bindListeners: function () {
            if(this.component.options.autorender) {
                if (this.component.collection) {
                    this.listenTo(this.component.collection, 'fetched', this.refresh);
                }else if (this.model) {
                    this.listenTo(this.component.model, 'fetched', this.refresh);
                }
            }

            this.on('refresh', this.refresh, this);
        },

        _initProperties: function () {
            var template = {
                src: null,
                compiled: null,
                cache: true
            };

            this.template = this.template || {};
            console.log('VIEW OPTIONS', this.template);
            this.template = _.defaults(this.template, template);
            console.log('VIEW OPTIONS', this.template);

            this.status = {
                loaded: false,
                loading: false,
                loadingFailed: false
            };

            this.component = null;
        },

        constructor: function (options) {
            // Sorry, BB extend makes all properties static
            this._initProperties();

            this.setElement('[data-id=' + options.attributes['data-id'] + ']');


            if (options.component) {
                this.component = options.component;
            }
            _.omit(options, 'component');

            this._bindListeners();

            this.load();

            BB.View.apply(this, arguments);
        },

        initialize: function () {

        },

        construct: function () {

        },

        load: function () {

            if (this.template.src) {
                this.status.loading = false;
                this.status.loaded = true;
                this.trigger('loaded');
                return;
            }

            var url = (_.isFunction(this.url)) ? this.url() : this.url;

            if(!url) {
                this.status.loadingFailed = true;
                this.trigger('loaded');
                return;
            }

            // trying to get template from cache
            if (!XF.settings.noCache) {
                if(this.template.cache && _.has(XF, 'storage')) {
                    var cachedTemplate = XF.storage.get(url);
                    if (cachedTemplate) {
                        this.template.src = cachedTemplate;
                        this.status.loaded = true;
                        this.trigger('loaded');
                        return;
                    }
                }
            }

            if(!this.status.loaded && !this.status.loading) {

                this.status.loading = true;

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
                            if (!XF.settings.noCache) {
                                if($this.template.cache && _.has(XF, 'storage')) {
                                    XF.storage.set(url, template);
                                }
                            }

                            $this.template.src = jqXHR.responseText;
                            $this.status.loading = false;
                            $this.status.loaded = true;
                            $this.afterLoadTemplate();
                            $this.trigger('loaded');
                        } else {
                            $this.template.src = null;
                            $this.status.loading = false;
                            $this.status.loaded = false;
                            $this.status.loadingFailed = true;
                            $this.afterLoadTemplateFailed();
                            $this.trigger('loaded');
                        }
                    }
                });
            }
        },

        /**
         Compiles component template if necessary & executes it with current component instance model
         @static
         */
        getMarkup: function() {
            var data = {};

            if(!this.template.compiled) {
                this.template.compiled = _.template(this.template.src);
            }

            if (this.component.collection) {
                data = this.component.collection.toJSON();
            }else if (this.component.model) {
                data = this.component.model.toJSON();
            }

            return this.template.compiled({data: data});
        },

        /**
         HOOK: override to add logic before template load
         */
        beforeLoadTemplate : function() {},


        /**
         HOOK: override to add logic after template load
         */
        afterLoadTemplate : function() {},

        /**
         HOOK: override to add logic for the case when it's impossible to load template
         */
        afterLoadTemplateFailed : function() {
            console.log('XF.View :: afterLoadTemplateFailed - could not load template for "' + this.component.id + '"');
            console.log('XF.View :: afterLoadTemplateFailed - @dev: verify XF.device.types settings & XF.View :: getTemplate URL overrides');
        },

        /**
         Renders component into placeholder + calling all the necessary hooks & events
         */
        refresh: function() {
            console.log(this.component.id, 'REFRESHED VIEW');
            if (this.status.loaded && this.template.src) {
                if ((!this.component.collection && !this.component.model) || (this.component.collection && this.component.collection.status.loaded) || (this.component.model && this.component.model.status.loaded)) {
                    console.log(this.component.id, 'RENDERED VIEW', this.component.collection);
                    this.beforeRender();
                    this.render();
                    this.afterRender();
                }
            }
        },

        /**
         HOOK: override to add logic before render
         */
        beforeRender : function() {},


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
            if (this.component) {
                this.component._removeChildComponents();
            }

            this.$el.html(this.getMarkup());
            XF.trigger('ui:enhance', this.$el);
            this.renderVersion++;

            console.log('RENDERED', this.component.id);
            this.trigger('rendered');

            return this;
        },


        /**
         HOOK: override to add logic after render
         */
        afterRender : function() {}

    });
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

        // merging defaults with custom instance options and class options
        this.options = _.defaults(XF.getOptionsByID(this.id), this.options, this.defaults);
    };



    _.extend(XF.Component.prototype, XF.Events);

    _.extend(XF.Component.prototype, /** @lends XF.Component.prototype */{

        /**
         Object containing has-map of component options that can be different for each instance & should be set with {@link XF.setOptionsByID}
         @type Object
         */
        defaults : {
            autoload: true,
            autorender: true,
            updateOnShow: false
        },

        options: {

        },

        /**
         Returns component selector
         @return {String} Selector string that can be used for $.find() for example
         */
        selector : function() {
            return '[data-id=' + this.id + ']';
        },

        /**
         Defenition of custom Model class extending {@link XF.Model}
         */
        Model: null,

        /**
         Instance of {@link XF.Model} or its subclass
         @type XF.Model
         */
        model: null,

        /**
         Defenition of custom Collection class extending {@link XF.Collection}
         */
        Collection: XF.Collection,

        /**
         Instance of {@link XF.Collection} or its subclass
         @type XF.Collection
         */
        collection: null,

        /**
         Defenition of custom View class extending {@link XF.View}
         */
        View: XF.View,

        /**
         Instance of {@link XF.View} or its subclass
         @type XF.View
         */
        view : null,

        _bindListeners: function () {
            XF.on('component:' + this.id + ':refresh', this.refresh, this);
            this.listenTo(this, 'refresh', this.refresh);
        },

        /**
         Constructs component instance
         @private
         */

        initialize: function () {

        },

        construct: function () {

        },

        _constructor: function () {
            this.construct();
            XF.trigger('component:' + this.id + ':constructed');
            if (this.Collection) {
                this.collection = new this.Collection({}, {
                    component: this
                });
                this.collection.construct();
            }else if (this.Model) {
                this.model = new this.Model({}, {
                    component: this
                });
                this.model.construct();
            }

            if (this.View) {
                var params = {
                    attributes: {
                        'data-id': this.id
                    },
                    component: this
                };

                if (this.collection) {
                    params.collection = this.collection;
                }else if (this.model) {
                    params.model = this.model;
                }

                this.view = new this.View(params);
                this.view.construct();
            }

            this._bindListeners();

            this.initialize();

            if (this.view) {
                this.view.listenToOnce(this.view, 'loaded', this.view.refresh);
                this.view.on('rendered', _.bind(function () { XF.trigger('component:' + this.id + ':rendered'); }, this));
            }

            if (this.collection && this.options.autoload) {
                this.collection.refresh();
            }else if (this.model && this.options.autoload) {
                this.model.refresh();
            }else if (this.view) {
                this.view.refresh();
            }
        },

        _removeChildComponents: function () {
            if (this.view) {
                var ids = [];
                this.view.$el.find('[data-component]').each(function () {
                    ids.push($(this).data('id'));
                });
                XF._removeComponents(ids);
            }
        },


        /**
         Refreshes data and then rerenders view
         @private
         */
        refresh : function() {
            if (this.collection && !this.collection.status.loading) {
                this.collection.refresh();
            }else if (this.model && !this.model.status.loading) {
                this.model.refresh();
            }else if (this.view && !this.view.status.loading) {
                this.view.refresh();
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
     Make the DOM object look like a button
     */
    XF.ui.button = {
        
        // Selectors will be used to detect button's elements on the page
        selector : 'A[data-role=button], BUTTON, INPUT[type=submit], INPUT[type=reset], INPUT[type=button], [data-appearance=backbtn]',

        render : function (button, options) {
            var jQButton = $(button),
                enhancedButton,
                innerStuff;

            if (!options) {
                options = {};
            }
            
            if (!button || !(jQButton instanceof $) || jQButton.attr('data-skip-enhance') == 'true') {
                return;
            }

            if (button.nodeName == 'A' || button.nodeName == 'BUTTON') {
                enhancedButton = jQButton.attr({'data-skip-enhance':true});
                innerStuff = jQButton.html();
                jQButton.html('');

                // If it's INPUT - it's wrapped in a DIV and the necessary classes are added to the DIV.
            } else if (button.nodeName == 'INPUT') {
                // The input is assigned a class xf-input-hidden
                enhancedButton = $('<div></div>').append(jQButton.clone().addClass('xf-input-hidden').attr({'data-skip-enhance':true}));

                if (jQButton.hasOwnProperty('outerHtml')) {
                    jQButton.outerHtml(enhancedButton);
                }
                innerStuff = jQButton.attr('value');
            } else {
                // how did U get there? o_O
                return;
            }

            var isSmall = ((typeof options == 'object' && options.small === true) ? true : (typeof options == 'object' && options.appearance == 'backbtn') ? true : false),
                position = (typeof options == 'object' && 'position' in options) ? options.position : '',
                id = jQButton.attr('id') || XF.utils.uniqueID();

            if (position !== '') {
                enhancedButton.addClass('xf-button-float-' + position);
            }

            if (jQButton.parents(XF.ui.header.selector).length > 0) {
                var hposition = position || 'right';
                enhancedButton.addClass('xf-button-header-' + hposition);
                enhancedButton.addClass('xf-button-float-' + hposition);
            }

            // The class xf-button is added to the button.
            // If it has data-small="true" attribute, the class should be xf-button-small.
            enhancedButton.addClass(isSmall ? 'xf-button-small' : 'xf-button');

            // If data-appearance="backbtn" attribute is present, xf-button-back class is also added.
            if (typeof options == 'object' && options.appearance === 'backbtn') {
                enhancedButton.addClass('xf-button-back');
            }

            var iconName = (typeof options == 'object' && options.icon) ? options.icon : false;

            if (typeof options == 'object' && options.appearance === 'backbtn' /*&& !jQButton.attr('data-icon')*/) {
                iconName = 'left';
            }

            if (iconName) {

                // If data-icon attribute is present, a SPAN.xf-icon is added inside the button.
                var iconSpan = $('<span class=xf-icon></span>');

                // The value of data-icon attribute is used to generate icon class: e.g. xf-icon-dots.
                iconSpan.addClass('xf-icon-' + iconName);

                // If the button had data-small=true or data-appearance="backbtn" attributes,
                // xf-icon-small class is also added to SPAN.xf-icon
                if (isSmall) {
                    iconSpan.addClass('xf-icon-small');
                } else {
                    iconSpan.addClass('xf-icon-big');
                }

                // A class denoting icon position is also added to the button. Default: xf-iconpos-left.
                // The value is taken from data-iconpos attr.
                // Possible values: left, right, top, bottom.
                var iconPos = (typeof options == 'object' && options.iconpos) ? options.iconpos : 'left';

                if (iconPos != 'left' && iconPos != 'right' && iconPos != 'top' && iconPos != 'bottom') {
                    iconPos = 'left';
                }
                enhancedButton.addClass('xf-iconpos-' + iconPos);
                enhancedButton.append(iconSpan);

            }

            if (innerStuff) {
                var textSpan = $('<span></span>').append(innerStuff);

                // The text of buttons is placed inside span.xf-button-small-text for small buttons
                if (isSmall || options.appearance == 'backbtn') {
                    textSpan.addClass('xf-button-small-text');
                    // and span.xf-button-text for big ones.
                } else {
                    textSpan.addClass('xf-button-text');
                }
                enhancedButton.append(textSpan);
            } else {

                if (isSmall) {
                    enhancedButton.addClass('xf-button-small-icon-only');
                }
            }

            // If data-special="true" attribute is present add xf-button-special class.
            if (options.special === true) {
                enhancedButton.addClass('xf-button-special');
            }

            // If data-alert="true" attribute is present add xf-button-alert class.
            if (options.alert === true) {
                enhancedButton.addClass('xf-button-alert');
            }

            enhancedButton.attr('id', id);
        }
    };


    /**
     Enhances checkbox or radio button input view
     */
    XF.ui.checkboxRadio = {

        // Selectors will be used to detect checkboxes' and radios' on the page
        selector : 'INPUT[type=checkbox], INPUT[type=radio]',

        render : function(chbRbInput) {

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

            if (!chbRbInput || !(jQChbRbInput instanceof $) || jQChbRbInput.attr('data-skip-enhance') == 'true') {
                return;
            }

            jQChbRbInput.attr({'data-skip-enhance':true});
            options.id = jQChbRbInput.attr('id') || XF.utils.uniqueID();
            options.input = jQChbRbInput.wrap("<span></span>").parent().html();
            jQChbRbInput.attr('id', options.id);
            var chbRbInputLabel = $('label[for=' + options.id + ']');

            // If the input doesn't have an associated label, quit
            if (chbRbInputLabel.length) {

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

                // Underscore template for label and element
                var _template = _.template(
                    '<div class="<%= options.wrapperClass %>"><label for="<%= options.id %>" class="<%= options.labelClass %>">' +
                    '<%= options.input %><% if(options.isSwitch) { %>' +
                    '<span class=xf-switch-track><span class=xf-switch-track-wrap>' +
                    '<span class=xf-switch-thumb></span>' +
                    '</span></span>' +
                    '<% } %>' +
                    '</label><%= options.labelFor %></div>'
                );
                jQChbRbInput.parent().html(_template({options : options}));
            }
        }
    };


    /**
     Enhances fieldset view
     */
    XF.ui.fieldset =  {

        // Selectors will be used to detect filedsets on the page
        selector : 'fieldset[data-role=controlgroup]',

        render : function(fieldset, options) {
            var jQFieldset = $(fieldset);

            if (!fieldset || !(jQFieldset instanceof $) || jQFieldset.attr('data-skip-enhance') == 'true') {
                return;
            }

            var id = jQFieldset.attr('id') || XF.utils.uniqueID();

            jQFieldset.attr({'data-skip-enhance':  true, 'id' : id});

            // If the inputs have a parent fieldset[data-role=controlgroup], the fieldset
            // is assigned a class xf-controlgroup,

            jQFieldset.addClass('xf-controlgroup');

            // If there's a legend element inside the fieldset, it becomes div.xf-label
            var legend = jQFieldset.children('legend').detach();

            // the inputs are also wrapped in a div.xf-controlgroup-controls
            jQFieldset.wrapInner('<div class="xf-controlgroup-controls">');
            jQFieldset.prepend(legend);

            if (legend.length) {
                var legendDiv = $('<div></div>');
                var newLegendAttrs = {};

                _.each(legend[0].attributes, function (attribute) {
                    newLegendAttrs[attribute.name] = attribute.value;
                });
                legendDiv.attr(newLegendAttrs).addClass('xf-label').html(legend.html());
                if (legend.hasOwnProperty('outerHTML')) {
                    legend.outerHtml(legendDiv.outerHtml());
                }
            }
        }
    };


    /**
     Enhances footers view
     */
    XF.ui.footer = {

        // Selectors will be used to detect footer's element on the page
        selector : 'footer, [data-role=footer]',

        render : function (footer, options) {
            var jQFooter = $(footer),
                _self = this;

            if (!footer || !(jQFooter instanceof $) || jQFooter.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || XF.utils.uniqueID();

            jQFooter.attr({
                'data-id': options.id,
                'id': options.id,
                'data-role' : 'footer',
                'data-skip-enhance' : 'true'
            });

            // detect if data-fixed is true
            options.fixed = options.fixed === true ? true : false;
            options.buttons = options.buttons || [];

            var parentPages = $(this.selector).parents('.xf-page'),
                siblingPages = $(this.selector).siblings('.xf-page');
                
            if (!_.isEmpty(parentPages) && options.isFixed) {
                parentPages.addClass('xf-has-footer');
            }
            
            if (!_.isEmpty(siblingPages)) {
                siblingPages.addClass('xf-has-footer');
            }

            // selects buttons inside of footer
            var buttons = jQFooter.find(XF.ui.button.selector);
            options.buttonsClass = 'xf-grid-unit-1of' + buttons.length;

            for (var i = 0; i < buttons.length; ++i) {
                var button = buttons.eq(i);
                var butOpts = {
                    iconClass : button.attr('data-icon') ? 'xf-icon-' + button.attr('data-icon') : '',
                    dataHrefString : button.attr('data-href') ? button.attr('data-href') : '',
                    textClass : button.attr('data-text-class') ? button.attr('data-text-class') : '',
                    id : button.attr('data-id') ? button.attr('data-id') : options.id + '-item' + i,
                    text : button.val() || button.text() || ''
                };
                options.buttons.push(butOpts);
            }

            XF.router.on('route', function () {
                XF.ui.footer.selectButton(jQFooter);
            });

            // Underscore template for footer
            var _template = _.template(
                '<div class="xf-footer <% if(fixed) { %> xf-footer-fixed <% } %>">' +
                '<ul class="xf-nav">' +
                '<% _.each(buttons, function(button) { %>' +
                '<li class="xf-grid-unit <%= buttonsClass %>">' +
                '<a data-href="<%= button.dataHrefString %>" class="xf-nav-item xf-iconpos-top" id="<%= button.id %>">' +
                '<div class="xf-icon xf-icon-big <%= button.iconClass %>"></div>' +
                '<div class="xf-nav-item-text <%= button.textClass %>"><%= button.text %></div>' +
                '</a>' +
                '</li>' +
                '<% }); %>' +
                '</ul>' +
                '</div>'
            );

            jQFooter.html(_template(options));

            XF.ui.footer.selectButton(jQFooter);
        },

        // detect if button is active
        selectButton : function (el) {
            var page = XF.history.fragment;
            el.find('.xf-nav a').removeClass('xf-nav-item-active');
            el.find('.xf-nav a[data-href="#' + page + '"]').addClass('xf-nav-item-active');
        }
    };

    /**
     Enhances headers view
     */
    XF.ui.header = {

        // Selectors will be used to detect header's element on the page
        selector : '[data-role=header]',

        render : function (header, options) {
            var jQHeader = $(header);

            if (!header || !(jQHeader instanceof $) || jQHeader.attr('data-skip-enhance') == 'true') {
                return;
            }

            // Detect if we have title
            var headerTitle = jQHeader.find('h1');
            if (headerTitle.length > 0) {
                headerTitle.addClass('xf-header-title');
            }

            // Set up options
            options.id = options.id || XF.utils.uniqueID();
            options.title = options.title || '';
            options.html = jQHeader.html();
            options.isFixed = (options.fixed && options.fixed === true) ? true : false;

            var parentPages = $(this.selector).parents('.xf-page'),
                siblingPages = $(this.selector).siblings('.xf-page');
                
            // Add additional class for parent node
            if (!_.isEmpty(parentPages) && options.isFixed) {
                parentPages.addClass('xf-has-header');
            }
            
            // Add additional class for siblings
            if (!_.isEmpty(siblingPages)) {
                siblingPages.addClass('xf-has-header');
            }

            jQHeader.attr({
                'data-id': options.id,
                'id': options.id,
                'data-skip-enhance' : 'true'
            });

            // Underscore template for header
            var _template = _.template(
                '<header class="xf-header <% if(isFixed) { %> xf-header-fixed <% } %>">' +
                '<%= html %>' +
                '</header>'
            );

            jQHeader.html(_template(options));
        }
    };

    /**
     Enhances ul/ol lists view
     */
    XF.ui.list = {

        selector : 'UL[data-role=listview], OL[data-role=listview]',

        render : function (list, options) {
            var jQList = $(list);

            if (!list || !(jQList instanceof $) || jQList.attr('data-skip-enhance') == 'true') {
                return;
            }
            var listItems = jQList.children('li'),
                linkItems = listItems.children('a'),
                listItemsScope = [],
                fullWidth = options.fullwidth || 'false',
                listId = jQList.attr('id') || XF.utils.uniqueID();

            linkItems.addClass('xf-li-btn').children('.xf-count-bubble').parent().addClass('xf-li-has-count');
            listItems.not(linkItems.parent()).not('[data-role=divider]').addClass('xf-li-static');

            jQList.attr({'data-skip-enhance':true, 'id': listId}).addClass('xf-listview')
                .children('li[data-icon]').children('a').each(function () {
                    var anchor = $(this);
                    var icon = anchor.parent().attr('data-icon');
                    anchor.append(
                        $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-' + icon)
                    );
                    var iconPos = anchor.parent().attr('data-iconpos');

                    if (iconPos != 'left' && iconPos != 'right') {
                        iconPos = 'right';
                    }
                    anchor.addClass('xf-li-with-icon-' + iconPos);
                });

            if (fullWidth === 'true') {
                jQList.addClass('xf-listview-fullwidth');
            }

            linkItems.children('img').parent().each(function (){
                var anchor = $(this);
                var thumbPos = anchor.parent().attr('data-thumbpos');

                if (thumbPos != 'right' && thumbPos != 'left') {
                    thumbPos = 'left';
                }
                anchor.addClass('xf-li-with-thumb-' + thumbPos);
                anchor.children('img').addClass('xf-li-thumb xf-li-thumb-' + thumbPos);
            });

            linkItems.each(function () {
                var anchor = $(this);
                anchor.append(
                    $('<div class=xf-btn-text></div>')
                        .append(
                            anchor.children().not('.xf-icon, .xf-count-bubble, .xf-li-thumb')
                        )
                );
            });
            
            // Detect headers inside of list and add class
            listItems.find('h1, h2, h3, h4, h5, h6').addClass('xf-li-header');

            // Detect paragraphs inside of list and add class
            listItems.find('p').addClass('xf-li-desc');

            // Detect if list item is static
            listItems.filter('.xf-li-static').each(function (){
                $(this).wrapInner('<div class=xf-li-wrap />');
            });

            $.each(listItems, function (key, value) {
                var html = listItems.eq(key).html(),
                    role = listItems.eq(key).attr('data-role') || '',
                    class_ = (listItems.eq(key).attr('class') || '') + ' xf-li',
                    id = listItems.eq(key).attr('id') || '';

                if (role !== '') {
                    class_ += ' xf-li-' + role;
                }
                
                // Use `class_` instead of `class` beacuse of IE <=8 has problems
                listItemsScope.push({'html': html, 'class_': class_, 'id': id});
            });

            // Underscore template for list
            var _template = _.template(
                '<% _.each(listItemsScope, function(item) { %> ' +
                '<li class="<%= item.class_ %>" id="<%= item.id %>"><%= item.html %></li>' +
                '<% }); %>'
            );

            jQList.html(_template({listItemsScope : listItemsScope}));
        }
    };


/**
Enhances loaders view
*/
XF.ui.loader = {

    // Selectors will be used to detect loader's element on the page
    selector : '[data-role=loader]',

    render : function (loader, options) {

        var jqLoader = $(loader),
        _self = this;

        if (!options) {
            options = {};
        }
            
        if (!loader || !(jqLoader instanceof $) || jqLoader.attr('data-skip-enhance') == 'true') {
            return;
        }


        var id = jqLoader.attr('id') || XF.utils.uniqueID(),
        idStack = XF.ui.checkInIsset('loader'),
        newId = false;

        // Check if locader with the same ID was created before
        for (var i in idStack) {

            if (newId) {

                if (!$('#' + idStack[i]).length) {
                    id = idStack[i];
                    newId = true;
                }
            }
        }

        // If 'no', add new ID to the stack
        if (!newId) {
            XF.ui.issetElements.push({type : 'loader', id : id});
        }

        jqLoader.attr({'id': id, 'data-skip-enhance' : 'true'});

        if (!$('#' + id).hasClass('xf-loader')) {
            $('#' + id).addClass('xf-loader');
        }

        return jqLoader;
    },

    // Show loader or create newone and show it
    show : function (jqLoader) {
        jqLoader = jqLoader || this.create();
        jqLoader.show();
    },

    // Hide loader or hide all
    hide : function (jqLoader) {
        jqLoader = jqLoader || null;
        if (jqLoader === null) {
            $('.xf-loader').hide();
        } else {
            jqLoader.hide();
        }
    },

    // Remove loader's dom-element
    remove : function (jqLoader) {
        jqLoader.detach();
        XF.ui.removeFromIsset('popup', jqLoader.attr('id'));
    },

    // Add new loader to the page
    create : function () {
        var jqLoader = $('<div class="xf-loader" data-role="loader"><div class="xf-loader-content"><div class="loading"></div></div></div>');
        XF.device.getViewport().append(jqLoader);
        return this.render(jqLoader[0]);
    }
};

    /**
     Generates basic popup container
     */
    XF.ui.popup = {
        render : function () {

            var id = XF.utils.uniqueID(),
                idStack = XF.ui.checkInIsset('popup'),
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
                XF.ui.issetElements.push({type : 'popup', id : id});
            }
            var jqPopup = $('<div class="xf-dialog " id="' + id + '"><div class="xf-dialog-content"></div></div>');

            return jqPopup;
        },

        // Shorthand to show dialogs
        showDialog : function (headerText, messageText, buttons) {
            var popup = this.createDialog(headerText, messageText, buttons);
            this.show(popup);
        },

        // Attaches popup (dialog/notification/etc.) to the page
        show : function (jqPopup) {
            XF.device.getViewport().append(jqPopup);
        },

        // Detaches popup (dialog/notification/etc.) from the page
        hide : function (jqPopup) {
            jqPopup.detach();
            XF.ui.removeFromIsset('popup', jqPopup.attr('id'));
        },


        // Generates a dialog with header, message and buttons
        createDialog : function (headerText, messageText, buttons) {
            buttons = buttons || [];

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

            var jqDialog = this.render(),
                _template = _.template(
                '<div class="xf-dialog-box"><div class="xf-dialog-box-header"><h3><%= headerText %></h3></div>' +
                '<div class="xf-dialog-box-content"><%= messageText %></div>' +
                '<div class="xf-dialog-box-footer clearfix"></div></div>'
            );

            jqDialog.find('.xf-dialog-content').html(_template({headerText : headerText, messageText : messageText}));
            var jqBtnContainer = jqDialog.find('.xf-dialog-box-footer');

            if (buttons.length < 1) {
                buttons.push({
                    text: 'OK',
                    handler: function (){
                        XF.UI.popup.hide(jqDialog);
                    }
                });
            }
            if (buttons.length > 0) {
                var jqBtn,
                    btnCount = buttons.length;

                _.each(buttons, function (btn, index, buttons){

                    if (btn instanceof $){
                        jqBtn = btn;
                    } else {
                        console.log('BUTTON');
                        console.log(btn);
                        jqBtn = XF.ui.popup.createButton(btn);
                    }

                    jqBtnContainer.append(
                        $('<div></div>')
                            .addClass('xf-grid-unit xf-grid-unit-1of' + btnCount)
                            .append(jqBtn)
                    );
                });
            }
            this.dialog = jqDialog;
            XF.trigger('ui:enhance', jqDialog);
            return jqDialog;
        },

        // Generates a notification with text and icon
        createNotification : function (messageText, iconName) {

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

            var jqNotification = this.render().addClass('xf-dialog-notification'),
                _template = _.template(
                    '<div class="xf-notification"><div class="xf-notification-wrap">' +
                    '<div class="xf-notification-text"><%= messageText %></div></div></div>'
            );

            jqNotification.find('.xf-dialog-content').html(_template({messageText : messageText}));

            if (iconName && iconName !== '') {
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

        // Stores dialog object
        dialog : null,

        // Hides Dialog
        hideDialog : function () {

            if (this.dialog) {
                this.hide(this.dialog);
            }
        },

        hideAll : function () {
            var idStack = XF.ui.checkInIsset('popup');

            for (var i in idStack) {

                if ($('#' + idStack[i]).length) {
                    this.hide($('#' + idStack[i]));
                }
            }
        },

        // Creates button within the dialog with parameters
        createButton : function (buttonDescr)  {
            var jQButton = $('<button></button>'),
                attrs = {};

            attrs['id'] = buttonDescr.id || XF.utils.uniqueID();
            attrs['class'] = buttonDescr['class'] || '';
            attrs['name'] = buttonDescr.name || attrs.id;
            buttonDescr.small = buttonDescr.small || '';

            jQButton.html(buttonDescr.text);

            //Set button's attributes
            // Icon
            if (buttonDescr.icon && buttonDescr.icon !== '') {
                attrs['data-icon'] = buttonDescr.icon;
            }

            // Icon position
            if (buttonDescr.iconpos && buttonDescr.iconpos !== '') {
                attrs['data-iconpos'] = buttonDescr.iconpos;
            }

            // Button size
            if (buttonDescr.small && buttonDescr.small !== '') {
                attrs['data-small'] = buttonDescr.small;
            }

            // Button appearance 
            if (buttonDescr.appearance && buttonDescr.appearance !== '') {
                attrs['data-appearance'] = buttonDescr.appearance;
            }

            // Button is special or not
            if (buttonDescr.special && buttonDescr.special !== '') {
                attrs['data-special'] = buttonDescr.special;
            }

            // Button is 'alert' or not
            if (buttonDescr.alert && buttonDescr.alert !== '') {
                attrs['data-alert'] = buttonDescr.alert;
            }

            jQButton.attr(attrs);

            // Set function for button pressed
            if (_.isFunction(buttonDescr.handler)) {
                jQButton.on('tap', buttonDescr.handler);
            }

            XF.ui.button.render(jQButton[0]);

            return jQButton;
        }
    };


    /**
     Add scrolling functionality
     */
    XF.ui.scrollable = {

        selector : '[data-scrollable=true]',

        render : function (scrollable) {

            var jQScrollable = $(scrollable);
            if (!scrollable || !(jQScrollable instanceof $) || jQScrollable.attr('data-skip-enhance') == 'true') {
                return;
            }

            var id = jQScrollable.attr('id') || XF.utils.uniqueID();

            jQScrollable.attr({'data-skip-enhance':true, 'id' : id});

            var children = jQScrollable.children();

            // Always create wrapper
            if (children.length == 1 && false) {
                children.addClass('xf-scrollable-content');
            } else {
                jQScrollable.append(
                    $('<div></div>')
                        .addClass('xf-scrollable-content')
                        .append(children)
                );
            }

            var wrapperId = jQScrollable.attr('id');

            if (!wrapperId || wrapperId === '') {
                wrapperId = 'xf_scrollable_' + new Date().getTime();
                jQScrollable.attr({'id':wrapperId});
            }

            // Use iScroll
            var ISItem = jQScrollable.data('iscroll', new iScroll(wrapperId));
            var wrapperChanged = false;

            var doRefreshIScroll = function () {

                if (wrapperChanged) {
                    wrapperChanged = false;
                    ISItem.data('iscroll').refresh();
                    bindHanlders();
                }
            };

            var needRefreshIScroll = function (){

                if ($.contains($('#' + wrapperId)[0], this)) {
                    wrapperChanged = true;
                    setTimeout(doRefreshIScroll, 100);
                }
            };

            // Bind hadlers to the scrollable element
            var bindHanlders = function () {
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


    /**
     Enhances headers view
     @param header DOM Object
     @private
     */
    XF.ui.slidemenu = {
        selector : '[data-role=slidemenu]',

        render : function (menu, options) {

            var jQMenu = $(menu);

            if (!menu || !(jQMenu instanceof $) || jQMenu.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || XF.utils.uniqueID();
            options.title = options.title || '';
            options.hasTitle = options.title !== '' ? true : false;
            options.isFixed = (options.fixed && options.fixed === true) ? true : false;
            options.buttons = options.buttons || [];
            options.html = jQMenu.html();

            jQMenu.attr({
                'data-id': options.id,
                'id': options.id,
                'data-skip-enhance' : 'true'
            }).addClass('xf-slidemenu-wrapper');

            var menuButton = '<button class="xf-slidemenu-button xf-button-float-' +jQMenu.data('button-position')  + ' xf-button-header-' +jQMenu.data('button-position')  + ' xf-button-small-icon-only xf-button-small xf-button" data-position="' +jQMenu.data('button-position')  + '" data-skip-enhance="true"><span class="xf-icon xf-icon-list xf-icon-small"></span></button>',
            menuButtonContainer = $('#' + jQMenu.data('button-container'));
            menuButtonContainer.find('header').append(menuButton);
            options.menuButton = '<button class="xf-slidemenu-close-button xf-button-float-' +jQMenu.data('button-position')  + ' xf-button-header-' +jQMenu.data('button-position')  + ' xf-button-small-icon-only xf-button-small xf-button" data-position="' +jQMenu.data('button-position')  + '" data-skip-enhance="true"><span class="xf-icon xf-icon-cross xf-icon-small"></span</button>';

            var buttons = jQMenu.find(XF.ui.button.selector);
            options.buttonsClass = '';

            for (var i = 0; i < buttons.length; ++i) {
                var button = buttons.eq(i);
                var butOpts = {
                    'iconClass' : button.attr('data-icon') ? 'xf-icon-' + button.attr('data-icon') : '',
                    'dataHrefString' : button.attr('data-href') ? button.attr('data-href') : '',
                    'textClass' : button.attr('data-text-class') ? button.attr('data-text-class') : '',
                    'id' : button.attr('data-id') ? button.attr('data-id') : options.id + '-item' + i,
                    'class' : button.attr('data-class') || '',
                    'text' : button.val() || button.text() || ''
                };
                options.buttons.push(butOpts);
            }

            XF.router.on('route', function () {
                XF.ui.slidemenu.selectButton(jQMenu);

                if ($('.xf-slidemenu-wrapper')) {
                    $('.xf-slidemenu-wrapper').removeClass('xf-slidemenu-show');
                    $('body').removeClass('blur-page');
                }
            });

            var _template = _.template(
                '<div class="xf-slidemenu-scrollable"><div class="xf-slidemenu-header"><%= title %><%= menuButton %></div>' +
                '<%= html %></div>'
            );

            jQMenu.html(_template(options));

            XF.trigger('ui:enhance', jQMenu);

            $('.xf-slidemenu-button').on('tap', function () {
                $('.xf-slidemenu-wrapper').addClass('xf-slidemenu-show xf-slidemenu-animation');
                $('body').addClass('blur-page xf-viewport-transitioning');
                return false;
            });
            $('.xf-slidemenu-close-button').on('tap', function () {
                var delayTime = XF.device.isIOS ? 300 : 0;
                setTimeout(function () {
                    $('.xf-slidemenu-wrapper').removeClass('xf-slidemenu-show');
                    $('body').removeClass('blur-page xf-viewport-transitioning');
                }, delayTime);
                return false;
            });

            this.selectButton(jQMenu);
        },

        selectButton : function (el) {
            var page = XF.history.fragment !== '' ? XF.history.fragment : 'home';
            el.find('a').removeClass('xf-slidemenu-item-active');
            el.find('a[data-href="#' + page + '"], a[href="#' + page + '"]').addClass('xf-slidemenu-item-active');
        }
    };

    /**
     Enhances footers view
     */
    XF.ui.tabs = {

        // Selectors will be used to detect tabs' element on the page
        selector : '[data-role=tabs]',

        render : function (tabs, options) {
            var jQTabs = $(tabs),
                _self = this;

            if (!tabs || !(jQTabs instanceof $) || jQTabs.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || XF.utils.uniqueID();
            options.tabsperrow = options.tabsperrow || 4;

            jQTabs.attr({
                'data-id': options.id,
                'id': options.id,
                'data-skip-enhance' : 'true'
            });

            options.tabs = options.tabs || [];
            
            // Detect buttons and count rows
            var buttons = jQTabs.find(XF.ui.button.selector);
            options.rowCount = Math.ceil(buttons.length / options.tabsperrow);
            options.tabsClass = options.tabsclass || '';

            var lastRowSize = buttons.length % options.tabsperrow;
            if(!lastRowSize) {
                lastRowSize = options.tabsperrow;
            }

            // Position buttons in rows
            for (var i = 0; i < buttons.length; ++i){
                var tab = buttons.eq(i),
                    x = i + 1,
                    tabOpts = {
                        className : ''
                    };

                if (x === 1) {
                    tabOpts.className += ' xf-corner-tl ';
                }

                if (x === options.tabsperrow || (options.rowCount == 1 && i == buttons.length)) {
                    tabOpts.className += ' xf-corner-tr ';
                }

                if (x == buttons.length + 1 - lastRowSize) {
                    tabOpts.className += ' xf-corner-bl ';
                }

                if (x === buttons.length) {
                    tabOpts.className += ' xf-corner-br ';
                }

                if (tab.attr('data-active')) {
                    tabOpts.className += ' xf-tabs-button-active ';
                }

                if (x > buttons.length - lastRowSize) {
                    tabOpts.gridClass = 'xf-grid-unit-1of' + lastRowSize;
                } else {
                    tabOpts.gridClass = 'xf-grid-unit-1of' + options.tabsperrow;
                }

                tabOpts.id = tab.attr('id') || options.id +'-item-' + i;
                tabOpts.text = tab.val() || tab.text() || '';
                tabOpts.params = tab.attr('data-params') || "{}";

                options.tabs.push(tabOpts);
            }

            // Underscore template for tabs
            var _template = _.template(
                '<ul class="xf-tabs">' +
                '<% _.each(tabs, function(tab) { %>' +
                '<li class="xf-grid-unit <%= tabsClass %> <%= tab.gridClass %>  ">' +
                '<a data-params="<%= tab.params %>" class="xf-tabs-button <%= tab.className %>" id="<%= tab.id %>">' +
                '<span class="xf-tabs-button-text"><%= tab.text %></span>' +
                '</a>' +
                '</li>' +
                '<% }); %>' +
                '</ul>'
            );

            jQTabs.html(_template(options));

            // Add tab selection' handler to buttons
            jQTabs.find('a').on('tap', function () {
               XF.ui.tabs.selectTab(jQTabs, $(this));
            });
        },

        // Method to show appropriate tab
        selectTab : function (parent, el) {
            parent.find('a').removeClass('xf-tabs-button-active');
            el.addClass('xf-tabs-button-active');
        }
    };

/**
Enhances text input view
*/
XF.ui.input = {
        
    // Selectors will be used to detect text inputs on the page
    selector : 'INPUT[type=text], INPUT[type=search], INPUT[type=tel], ' +
    'INPUT[type=url], INPUT[type=email], INPUT[type=password], INPUT[type=datetime], ' +
    'INPUT[type=date], INPUT[type=month], INPUT[type=week], INPUT[type=time], ' +
    'INPUT[type=datetime-local], INPUT[type=number], INPUT[type=color], TEXTAREA, ' +
    //
    'INPUT[type=range], INPUT[type=search]',

    render : function (textInput, options) {
        var jQTextInput = $(textInput),
            
        // Events for pointer/touchs
        eventsHandler = {
            start : 'mousedown touchstart MSPointerDown',
            move : 'mousemove touchmove MSPointerMove',
            end : 'mouseup touchend MSPointerUp'
        };

        if (!textInput || !(jQTextInput instanceof $) || jQTextInput.attr('data-skip-enhance') == 'true') {
            return;
        }

        jQTextInput.attr({'data-skip-enhance':true});

        // For inputs of types:
        // text, search, tel, url, email, password, datetime, date, month,
        // week, time, datetime-local, number, color and also for TEXTAREA element
        // add class "xf-input-text".
        jQTextInput.addClass('xf-input-text');

        var isInputElement = (textInput.nodeName == 'INPUT'),
        textInputType = jQTextInput.attr('type'),
        newTextInput;

        // For inputs of types "range" and "search" change type to "text".
        if (textInputType == 'search') {
            newTextInput = $('<input type="text"/>');
            newTIAttrs = {};

            _.each(textInput.attributes, function (attribute) {

                if (attribute.name == 'type') {
                    return;
                }
                newTIAttrs[attribute.name] = attribute.value;
            });
            newTextInput.attr(newTIAttrs);

            if (jQTextInput.hasOwnProperty('outerHTML')) {
                jQTextInput.outerHtml(newTextInput);
            }
            jQTextInput = newTextInput;
            textInput = newTextInput[0];
                
        } else if (textInputType == 'number' || textInputType == 'range') {

            var minValue = jQTextInput.attr('min'),
            maxValue = jQTextInput.attr('max'),
            selValue = parseFloat(jQTextInput.attr('value')),
            step = parseFloat(jQTextInput.attr('step')) || 1;
            
            var newTIAttrs = {};
            
            newTextInput = $('<input type="text"/>');

            _.each(textInput.attributes, function (attribute) {

                if (attribute.name == 'type') {
                    return;
                }
                newTIAttrs[attribute.name] = attribute.value;
            });
            newTextInput.attr(newTIAttrs);
            newTextInput.attr({'data-skip-enhance':true});

            var numberWrapper = $('<div></div>').addClass('xf-input-number');
                
            // Add buttons to decrease number
            numberWrapper.append(
                $('<button type="button"></button>')
                .addClass('xf-input-number-control xf-input-number-control-decrease')
                .attr({'data-skip-enhance':true})
                .append(
                    $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-circled-minus')
                )
            );
            numberWrapper.append(newTextInput);
                
            // Add buttons to increase number
            numberWrapper.append(
                $('<button type="button"></button>')
                .addClass('xf-input-number-control xf-input-number-control-increase')
                .attr({'data-skip-enhance':true})
                .append(
                    $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-circled-plus')
                )
            );

            var rangeWrapper = null;

            if (textInputType == 'number') {

                jQTextInput.outerHtml(numberWrapper);
                jQTextInput = numberWrapper;
                textInput = numberWrapper[0];

            } else if (textInputType == 'range') {

                rangeWrapper = $('<div></div>').addClass('xf-range');
                rangeWrapper.append(numberWrapper);

                // If there is no either min or max attribute -- don't render the slider.
                if ((minValue || minValue === 0) && (maxValue || maxValue === 0)) {

                    minValue = parseFloat(minValue);
                    maxValue = parseFloat(maxValue);

                    var percValue = (selValue - minValue) * 100 / (maxValue - minValue),
                        
                    // Underscore template for slider
                    _template = _.template(
                        '<div class="xf-input-range">' +
                        '<div class="xf-range-wrap">' +
                        '<div class="xf-input-range-min"><%= minValue %></div>' +
                        '<div class="xf-input-range-slider">' +
                        '<div class="xf-input-range-track">' +
                        '<div class="xf-input-range-value" style="width: 0">' +
                        '<div class="xf-input-range-control" tabindex="0">' +
                        '<div class="xf-input-range-thumb" style="left:100%" title="<%= selValue %>"></div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="xf-input-range-max"><%= maxValue %></div>' +
                        '</div>' +
                        '</div>'
                    );
                    rangeWrapper.append(_template({minValue : minValue, maxValue: maxValue, selValue: selValue}));

                    jQTextInput.outerHtml(rangeWrapper);
                    jQTextInput = rangeWrapper;
                    textInput = rangeWrapper[0];
                }

            }

            // Function to set new value for input
            var setNewValue = function (newValue) {

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

                if (rangeWrapper) {
                    rangeWrapper.find('div.xf-input-range-thumb').attr({'title':newValue});

                    var percValue = (newValue - minValue) * 100 / (maxValue - minValue);
                    rangeWrapper.find('div.xf-input-range-value').css({'width':'' + percValue + '%'});
                }

            };

            // Function to increase value for input
            var stepUp = function () {
                var newValue = parseFloat(newTextInput.attr('value'));
                newValue += step;
                setNewValue(newValue);
            };

            // Function to decrease value for input
            var stepDown = function () {
                var newValue = parseFloat(newTextInput.attr('value'));
                newValue -= step;
                setNewValue(newValue);
            };

            // Initialing number stepper buttons (-) & (+) click handlers
            numberWrapper.find('button.xf-input-number-control-decrease').on('tap', stepDown);
            numberWrapper.find('button.xf-input-number-control-increase').on('tap', stepUp);

            var savedInputText = newTextInput.attr('value');
            var newInputText;
            var inputTextChange = function (event) {
                newInputText = newTextInput.attr('value');
                    
                // Prevent multiple recalculations in case when several events where triggered
                if (savedInputText == newInputText) {
                    return;
                }

                newInputText = parseFloat(newInputText);
                    
                if (isNaN(newInputText)) {
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

            if (rangeWrapper) {

                var trackW;
                var savedVal;
                var valueDiff;
                var mousePrevX;
                var mouseNewX;
                var mouseDiff;

                var trackDiffToValueDiff = function (trackDiff) {
                        
                    if (!trackW) {
                        trackW = rangeWrapper.find('div.xf-input-range-track')[0].clientWidth;
                    }
                    return (trackDiff / trackW * (maxValue - minValue));
                };

                var trackPointToValuePoint = function (trackPoint) {
                    return (trackDiffToValueDiff(trackPoint) + minValue);
                };

                var startThumbDrag = function (event) {
                    mousePrevX = XF.device.supports.touchEvents ? event.originalEvent.targetTouches[0].pageX : event.pageX || event.clientX || layerX || event.screenX;
                    savedVal = selValue;
                    $(document).bind(eventsHandler.end, stopThumbDrag);
                    $(document).bind(eventsHandler.move, doThumbDrag);
                };

                var doThumbDrag = function (event) {
                    mouseNewX = XF.device.supports.touchEvents ? event.originalEvent.targetTouches[0].pageX : event.pageX || event.clientX || layerX || event.screenX;
                    mouseDiff = mouseNewX - mousePrevX;
                    valueDiff = trackDiffToValueDiff(mouseDiff);
                    mousePrevX = mouseNewX;
                    savedVal += valueDiff;
                    setNewValue(savedVal);
                };

                var stopThumbDrag = function () {
                    $(document).bind(eventsHandler.end, stopThumbDrag);
                    $(document).bind(eventsHandler.move, doThumbDrag);
                };

                var startThumbPress = function () {
                    $(document).bind('keydown', doThumbPress);
                };

                var doThumbPress = function (event) {
                        
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

                var stopThumbPress = function () {
                    $(document).unbind('keydown', doThumbPress);
                };

                // initialing slider thumb dragging handler
                rangeWrapper.find('div.xf-input-range-thumb').bind('mousedown touchstart', startThumbDrag);

                // initialing arrow keys press handling
                rangeWrapper.find('div.xf-input-range-control')
                .bind('focus', startThumbPress)
                .bind('focusout', stopThumbPress);

                var trackClick = function( event) {
                        
                    // skipping events fired by thumb dragging
                    if (event.target == rangeWrapper.find('div.xf-input-range-thumb')[0]) {
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
            if (options.appearance == 'split' && isInputElement) {

                var applicableTypes = ['text', 'search', 'tel', 'url', 'email',
                'password', 'datetime', 'date', 'month', 'week', 'time', 'datetime-local', 'color'];

                _.each(applicableTypes, function (applicableType) {
                    
                    if (textInputType == applicableType) {
                        splitAppearance = true;
                    }
                });
            }

            var textInputID = (jQTextInput[0].nodeName === 'INPUT') ? jQTextInput.attr('id') : jQTextInput.find('input').eq(0).attr('id');
            var textInputLabel = (textInputID && textInputID.length) ? $('label[for=' + textInputID + ']') : [];

            // If the input doesn't have an associated label, quit
            if (textInputLabel.length) {

                if (splitAppearance) {

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

