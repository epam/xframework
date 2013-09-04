/*! X-Framework 04-09-2013 */
;(function (window, $, BB) {

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


/**
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

    var compEventSplitter = /\:/;

    XF.on('all', function (eventName) {
        console.log('XF:all - ', eventName);
        console.log(typeof eventName);
        if (!compEventSplitter.test(eventName)) {
            return;
        }

        var parts = eventName.split(compEventSplitter);

        if (parts[0] !== 'component' && parts.length < 3) {
            return;
        }

        var compID = parts[1];

        XF._defferedCompEvents || (XF._defferedCompEvents = {});

        //on component constructed
        if (parts[0] === 'component' && parts[2] === 'constructed') {
            onComponentCostruct(compID);
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

    onComponentCostruct = function (compID) {
        console.log('constructed', compID);
        var compObj = $(XF.getComponentByID(compID).selector());
        XF.trigger('pages:start', compObj);

        loadChildComponents(compObj);
    };


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

        // initializing XF.Touches
        if ('Touches' in XF) {
            XF.Touches.init();
        }

        // options.router
        options.router = options.router || {};
        createRouter(options.router);

        placeAnchorHooks();
        bindHideShowListeners();

        if (_.has(XF, 'UI')) {
            XF.UI.init();
        }

        XF.Router.start();

        options.animations = options.animations || {};
        options.animations.standardAnimation = options.animations.standardAnimation || '';
        if (_.has(XF.Device.type, 'defaultAnimation')) {
            options.animations.standardAnimation = XF.Device.type.defaultAnimation;
            console.log('Options.animations', options.animations);
        }

        XF.Pages.init(options.animations);



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
        console.log('XF :: loadChildComponents', DOMObject);
        $(DOMObject).find('[data-component][data-cache=true],[data-component]:visible').each(function(ind, value) {
            console.log(value)
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
            console.log('SHOWED', evt.target);
            if(evt.currentTarget == evt.target) {
                var compID = $(this).attr('data-id');
                if(!components[compID]) {
                    var compName = $(this).attr('data-component');
                    loadChildComponent(compID, compName);
                }
                XF.trigger('ui:enhance', $(this));
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







    XF.Touches = {

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
            isTouch = (XF.Device.supports.pointerEvents) ? false : (XF.Device.supports.touchEvents ? true : false);
            eventType = (XF.Device.supports.pointerEvents) ? 'pointer' : (XF.Device.supports.touchEvents ? 'touch' : 'mouse');

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

            $(document).ready(function () {
                var now,
                    delta;

                $(document.body).bind(eventsHandler[eventType].start, function(e){
                    now = Date.now();
                    delta = now - (touchHandler.last || now);
                    touchHandler.el = $(parentIfText(isTouch ? e.originalEvent.targetTouches[0].target : e.target));
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
                });

                $(window).bind('scroll', cancelAll);
            });

            // List of new events
            ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'tap'].forEach(function (i){
                $.fn[i] = function (callback) {
                    return this.bind(i, callback)
                };
            });
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
            XF.trigger('ui:enhance', $('body'));
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
            standardAnimation: 'slideleft',
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
        init : function(animations) {
            XF.on('pages:show', _.bind(XF.Pages.show, XF.Pages));
            XF.on('pages:animation:next', _.bind(XF.Pages.setNextAnimationType, XF.Pages));
            XF.on('pages:animation:default', _.bind(XF.Pages.setDefaultAnimationType, XF.Pages));
            XF.on('pages:start', _.bind(XF.Pages.start, XF.Pages));

            if (_.has(animations, 'types') ) {
                _.extend(this.animations.types, animations.types);
            }

            if (_.has(animations, 'standardAnimation') ) {
                this.setDefaultAnimationType(animations.standardAnimation);
            }

            this.start();
        },

        start: function (jqObj) {
            jqObj = jqObj || $('body');
            console.log('pages start', jqObj);
            var pages =  jqObj.find(' .' + this.pageClass);
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
                XF.Pages.animations.standardAnimation = animationType;
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
                animationType = (this.animations.types[this.animations.next] ? this.animations.next : this.animations.standardAnimation);
                this.animations.next = null;
            }else {
                animationType = (this.animations.types[animationType] ? animationType : this.animations.standardAnimation);
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

                fromPage.height(viewport.height()).addClass('out '+ animationType);
                toPage.height(viewport.height()).addClass('in '+ animationType + ' ' + this.activePageClass);
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

            XF.trigger('ui:enhance', $(this.activePage));

            // looking for components inside the page
            loadChildComponents(this.activePage[0]);
        }
    };


    /**
     @namespace Holds all the logic related to UI elements enhancement
     */
    XF.UI = {};

    _.extend(XF.UI, /** @lends XF.UI */ {

        init: function () {
            XF.on('ui:enhance', _.bind(XF.UI.enhance, XF.UI));
        },

        /**
         Reworks markup of a givven $ object
         @param jqObj $ item
         */

        enhance : function (jqObj) {
            if (!jqObj instanceof $) {
                jqObj = $(jqObj);

                if (!jqObj instanceof $) {
                    return;
                }
            }

            _.each(XF.UI, function (enhancement, index) {

                if (typeof enhancement === 'object' && enhancement.hasOwnProperty('selector')) {

                    jqObj.find(enhancement.selector).not('[data-skip-enhance=true]').each(function (){
                        var skip = false;

                        _.each(XF.UI.enhanced.length, function (elem, index) {

                            if (XF.UI.enhanced[i] === this) {
                                skip = true;
                            }
                        });

                        if (!skip & $(this).attr('data-skip-enhance') != 'true') {
                            var options = $(this).data();
                            XF.UI.enhanced.push(this);
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
            templateUrlPrefix: 'tmpl/',
            /**
             Used by default Template URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default '.tmpl'
             @type String
             */
            templateUrlPostfix: '.tmpl',


            /**
             Used by default Data URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default ''
             @type String
             */
            dataUrlPrefix: '',


            ajaxSettings: {
                      // TODO: fill in ajaxSettings
            }
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
            return vp.eq(0);
        }
    };
XF.Collection = BB.Collection.extend({

    component: null,

    root: null,

    status: {
        loaded: false,
        loading: false,
        loadingFailed: false
    },

    /**
     Settings for $ AJAX data request
     @type String
     */
    ajaxSettings : null,

    _bindListeners: function () {
        //this.on('change reset sync add', this.onDataChanged, this);
    },

    /**
     Constructs model instance
     @private
     */
    initialize : function() {
        this._bindListeners();

        if (this.component.options.updateOnShow) {
            $(this.component.selector()).bind('show', _.bind(this.refresh, this));
        }

        this.ajaxSettings = this.ajaxSettings || XF.Settings.getProperty('ajaxSettings');

        if (_.has(this.ajaxSettings, 'success') && _.isFunction(this.ajaxSettings.success)) {
            var onSuccess = this.ajaxSettings.success,
                onDataLoaded = _.bind(this.onDataLoaded, this);
            this.ajaxSettings.success = function () {
                onDataLoaded();
                onSuccess();
            };
        }else{
            this.ajaxSettings = _.bind(this.onDataLoaded, this);
        }
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

    onDataLoaded: function () {
        this.status.loaded = true;
        this.status.loading = false;

        this.trigger('fetched');
    }

});
XF.Model = BB.Model.extend({

    component: null,

    root: null,

    status: {
        loaded: false,
        loading: false,
        loadingFailed: false
    },

    /**
     Settings for $ AJAX data request
     @type String
     */
    ajaxSettings : null,

    _bindListeners: function () {

    },

    /**
     Constructs model instance
     @private
     */
    initialize : function() {
        this._bindListeners();

        if (this.component.options.updateOnShow) {
            $(this.component.selector()).bind('show', _.bind(this.refresh, this));
        }

        this.ajaxSettings = this.ajaxSettings || XF.Settings.getProperty('ajaxSettings');

        if (_.has(this.ajaxSettings, 'success') && _.isFunction(this.ajaxSettings.success)) {
            var onSuccess = this.ajaxSettings.success,
                onDataLoaded = _.bind(this.onDataLoaded, this);
            this.ajaxSettings.success = function () {
                onDataLoaded();
                onSuccess();
            };
        }else{
            this.ajaxSettings = _.bind(this.onDataLoaded, this);
        }
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

    onDataLoaded: function () {
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
         A flag that indiacates whether that template is currently being loaded
         @type Boolean
         @private
         @static
         */
        status: {
            loaded: false,
            loading: false,
            loadingFailed: false
        },

        template: {
            src: null,
            compiled: null,
            cache: true
        },

        url: function () {
            return XF.Settings.getProperty('templateUrlPrefix') + XF.Device.type.templatePath + this.component.name + XF.Settings.getProperty('templateUrlPostfix');
        },

        /**
         Flag that determines whether the Model update should be ignored by the View (in this case you may launch {@link XF.View#refresh} manualy)
         @default false
         @type Boolean
         */

        _bindListeners: function () {
            if(!this.component.options.autorender) {
                if (this.component.collection) {
                    this.listenTo(this.component.collection, 'fetched', this.refresh);
                }else if (this.component.model) {
                    this.listenTo(this.component.model, 'fetched', this.refresh);
                }
            }

            this.on('refresh', this.refresh, this);
        },

        initialize: function () {
            this.setElement('[data-id=' + this.attributes['data-id'] + ']');

            this._bindListeners();

            this.load();
        },

        construct: function () {

        },

        load: function () {
            if (this.template.src) {
                return;
            }

            var url = (_.isFunction(this.url)) ? this.url() : this.url;

            if(!url) {
                this.status.loadingFailed = true;
                this.trigger('loaded');
                return;
            }

            // trying to get template from cache
            if(this.template.cache && _.has(XF, 'Cache')) {
                var cachedTemplate = XF.Cache.get(url);
                if (cachedTemplate) {
                    this.template.src = cachedTemplate;
                    this.status.loaded = true;
                    this.trigger('loaded');
                    return;
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
                            if($this.template.cache && _.has(XF, 'Cache')) {
                                XF.Cache.set(url, template);
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
            if(!this.template.compiled) {
                this.template.compiled = _.template(this.template.src);
            }

            return this.template.compiled();
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
            console.log('XF.View :: afterLoadTemplateFailed - @dev: verify XF.Device.types settings & XF.View :: getTemplate URL overrides');
        },

        /**
         Renders component into placeholder + calling all the necessary hooks & events
         */
        refresh: function() {
            if (this.status.loaded && this.template.src) {
                if ((this.collection && this.collection.loaded) || (this.model && this.model.loaded)) {
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
            this.$el.html(this.getMarkup());
            XF.trigger('ui:enhance', this.$el);
            this.renderVersion++;

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
        this.initialize();
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
        Model: XF.Model,

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
            this.on('component:'+ this.id +':refresh', _.bind(this.refresh, this));
        },

        /**
         Constructs component instance
         @private
         */
        construct : function() {

        },

        
        initialize: function() {
            console.log(this.View);
            if (this.Collection) {
                this.collection = new this.Collection({
                    url: XF.Settings.getProperty('dataUrlPrefix') + '/' + this.name + '/'
                });
                if (this.Model) {
                    this.collection.model = this.Model;
                }
                this.collection.component = this;
                this.collection.construct();
            }else if (this.Model) {
                this.model = new this.Model({
                    urlRoot: XF.Settings.getProperty('dataUrlPrefix') + '/' + this.name + '/'
                });
                this.model.component = this;
                this.model.construct();
            }

            if (this.View) {
                var params = {
                    attributes: {
                        'data-id': this.id
                    }
                };

                if (this.collection) {
                    params.collection = this.collection;
                }
                if (this.model) {
                    params.model = this.model;
                }

                this.view = new this.View(params);

                this.view.component = this;
                this.view.construct();
            }

            this._bindListeners();

            this.construct();

            this.view.listenToOnce(this.view, 'loaded', this.view.refresh);

            if (this.collection && this.options.autoload) {
                this.collection.refresh();
            }else if (this.model && this.options.autoload) {
                this.model.refresh();
            }else if (this.view) {
                this.view.refresh();
            }

            XF.trigger('component:' + this.id + ':constructed');
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
            }

            if (this.view && !this.view.status.loading) {
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
     @param button DOM Object
     @private
     */
    XF.UI.button = {
        selector : 'A[data-role=button], BUTTON, INPUT[type=submit], INPUT[type=reset], INPUT[type=button], [data-appearance=backbtn]',

        render : function (button, options) {
            var jQButton = $(button),
                enhancedButton,
                innerStuff;

            if (!button || !jQButton instanceof $ || jQButton.attr('data-skip-enhance') == 'true') {
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
                jQButton.outerHtml(enhancedButton);
                innerStuff = jQButton.attr('value');
            } else {
                // how did U get there? o_O
                return;
            }

            var isSmall = options.small === true || options.appearance == 'backbtn';
            var position = options.position || '';

            if (position !== '') {
                enhancedButton.addClass('xf-button-float-' + position);
            }

            if (jQButton.parents(XF.UI.header.selector).length > 0) {
                enhancedButton.addClass('xf-button-header-' + position);
            }

            // The class xf-button is added to the button.
            // If it has data-small="true" attribute, the class should be xf-button-small.
            enhancedButton.addClass(isSmall ? 'xf-button-small' : 'xf-button');

            // If data-appearance="backbtn" attribute is present, xf-button-back class is also added.
            if (options.appearance === 'backbtn') {
                enhancedButton.addClass('xf-button-back');
            }

            var iconName = options.icon;

            if (options.appearance === 'backbtn' /*&& !jQButton.attr('data-icon')*/) {
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
                var iconPos = options.iconpos || 'left';

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
            if (options.special == true) {
                enhancedButton.addClass('xf-button-special');
            }

            // If data-alert="true" attribute is present add xf-button-alert class.
            if (options.alert == true) {
                enhancedButton.addClass('xf-button-alert');
            }
        }
    };


    /**
     Enhances checkbox or radio button input view
     @param textInput DOM Object
     @private
     */
    XF.UI.checkboxRadio = {

        selector : 'INPUT[type=checkbox], INPUT[type=radio]',

        render : function(chbRbInput, options) {

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

            if (!chbRbInput || !jQChbRbInput instanceof $ || jQChbRbInput.attr('data-skip-enhance') == 'true') {
                return;
            }

            jQChbRbInput.attr({'data-skip-enhance':true});
            options.id = jQChbRbInput.attr('id') || 'xf-' + Math.floor(Math.random()*10000);
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
            }
        }
    };


    /**
     Enhances fieldset view
     @param textInput DOM Object
     @private
     */
    XF.UI.fieldset =  {

        selector : 'fieldset[data-role=controlgroup]',

        render : function(fieldset, options) {
            var jQFieldset = $(fieldset);

            if (!fieldset || !jQFieldset instanceof $ || jQFieldset.attr('data-skip-enhance') == 'true') {
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

            if (legend.length) {
                var legendDiv = $('<div></div>');
                var newLegendAttrs = {};

                _.each(legend[0].attributes, function (attribute) {
                    newLegendAttrs[attribute.name] = attribute.value;
                });
                legendDiv.attr(newLegendAttrs).addClass('xf-label').html(legend.html());
                legend.outerHtml(legendDiv.outerHtml());
            }
        }
    };


    /**
     Enhances footers view
     @param footer DOM Object
     @private
     */
    XF.UI.footer = {

        selector : 'footer, [data-role=footer]',

        render : function (footer, options) {
            var jQFooter = $(footer),
                _self = this;

            if (!footer || !jQFooter instanceof $ || jQFooter.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || 'xf-footer-component-' + Math.floor(Math.random()*10000);

            jQFooter.attr({
                'data-id': options.id,
                'id': options.id,
                'data-role' : 'footer',
                'data-skip-enhance' : 'true'
            });

            options.fixed = options.fixed === true ? true : false;
            options.buttons = options.buttons || [];

            if (options.fixed) {
                var parentPage = $(this.selector).parents('.xf-page');
                if (parentPage[0]) {
                    parentPage.addClass('xf-page-has-fixed-footer');
                } else {
                    XF.Device.getViewport().addClass('xf-viewport-has-fixed-footer');
                }
            }

            var buttons = jQFooter.find(XF.UI.button.selector);
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

            XF.Router.on('route', function () {
                XF.UI.footer.selectButton(jQFooter);
            });

            var _template = _.template(
                '<div class="xf-footer <% if(fixed) { %> xf-footer-fixed <% } %>">'
                + '<ul class="xf-nav">'
                + '<% _.each(buttons, function(button) { %>'
                + '<li class="xf-grid-unit <%= buttonsClass %>">'
                + '<a data-href="<%= button.dataHrefString %>" class="xf-nav-item xf-iconpos-top" id="<%= button.id %>">'
                + '<div class="xf-icon xf-icon-big <%= button.iconClass %>"></div>'
                + '<div class="xf-nav-item-text <%= button.textClass %>"><%= button.text %></div>'
                + '</a>'
                + '</li>'
                + '<% }); %>'
                + '</ul>'
                + '</div>'
            );

            jQFooter.html(_template(options));

            XF.UI.footer.selectButton(jQFooter);
        },

        selectButton : function (el) {
            var page = XF.history.fragment;
            el.find('.xf-nav a').removeClass('xf-nav-item-active');
            el.find('.xf-nav a[data-href="#' + page + '"]').addClass('xf-nav-item-active');
        }
    };

    /**
     Enhances headers view
     @param header DOM Object
     @private
     */
    XF.UI.header = {

        selector : '[data-role=header]',

        render : function (header, options) {
            var jQHeader = $(header);

            if (!header || !jQHeader instanceof $ || jQHeader.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || 'xf-header-component-' + Math.floor(Math.random()*10000);
            options.title = options.title || '';
            options.html = jQHeader.html();
            options.hasTitle = options.title != '' ? true : false;
            options.isFixed = (options.fixed && options.fixed === true) ? true : false;

            jQHeader.attr({
                'data-id': options.id,
                'id': options.id,
                'data-skip-enhance' : 'true'
            });

            var _template = _.template(
                '<header class="xf-header <% if(isFixed) { %> xf-header-fixed <% } %>">'
                + '<%= html %>'
                + '<% if(hasTitle) { %>'
                + '<h1 class="xf-header-title"><%= title %></h1>'
                + '<% } %>'
                + '</header>'
            );

            jQHeader.html(_template(options));
        }
    };

    /**
     Enhances ul/ol lists view
     @param list DOM Object
     @private
     */
    XF.UI.list = {

        selector : 'UL[data-role=listview], OL[data-role=listview]',

        render : function (list, options) {
            var jQList = $(list);

            if (!list || !jQList instanceof $ || jQList.attr('data-skip-enhance') == 'true') {
                return;
            }
            var listItems = jQList.children('li'),
                linkItems = listItems.children('a'),
                listItemsScope = [],
                fullWidth = options.fullwidth || 'false',
                listId = jQList.attr('id') || 'xf-' + Math.floor(Math.random()*10000);

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

            listItems.find('h1, h2, h3, h4, h5, h6').addClass('xf-li-header');

            listItems.find('p').addClass('xf-li-desc');

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
                listItemsScope.push({'html': html, 'class': class_, 'id': id});
            });

            var _template = _.template(
                '<% _.each(listItemsScope, function(item) { %> '
                    + '<li class="<%= item.class %>" id="<%= item.id %>"><%= item.html %></li>'
                + '<% }); %>'
            );

            jQList.html(_template({listItemsScope : listItemsScope}));
        }
    };


    /**
     Enhances loaders view
     @param loader DOM Object
     @private
     */
    XF.UI.loader = {

        selector : '[data-role=loader]',

        render : function (loader, options) {

            var jqLoader = $(loader),
                _self = this,
                options = options || {};

            if (!loader || !jqLoader instanceof $ || jqLoader.attr('data-skip-enhance') == 'true') {
                return;
            }


            var id = jqLoader.attr('id') || 'xf-' + Math.floor(Math.random() * 10000),
                idStack = XF.UI.checkInIsset('loader'),
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
                XF.UI.issetElements.push({type : 'loader', id : id});
            }

            jqLoader.attr({'id': id, 'data-skip-enhance' : 'true'});

            if (!$('#' + id).hasClass('xf-loader')) {
                $('#' + id).addClass('xf-loader');
            }

            return jqLoader;
        },

        show : function (jqLoader) {
            jqLoader = jqLoader || this.create();
            jqLoader.show();
        },

        hide : function (jqLoader) {
            jqLoader.hide();
        },

        remove : function (jqLoader) {
            jqLoader.detach();
            XF.UI.removeFromIsset('popup', jqLoader.attr('id'));
        },

        create : function () {
            var jqLoader = $('<div class="xf-loader" data-role="loader"></div>');
            XF.Device.getViewport().append(jqLoader);
            return this.render(jqLoader[0]);
        }
    };

    /**
     Generates basic popup container
     @return $
     @private
     */
    XF.UI.popup = {
        render : function () {

            var id = 'xf-' + Math.floor(Math.random() * 10000),
                idStack = XF.UI.checkInIsset('popup'),
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
                XF.UI.issetElements.push({type : 'popup', id : id});
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
        showDialog : function (headerText, messageText, buttons) {
            var popup = this.createDialog(headerText, messageText, buttons);
            this.show(popup);
        },

        /**
         Attaches popup (dialog/notification/etc.) to the page
         @param jqPopup $ object representing popup
         */
        show : function (jqPopup) {
            XF.Device.getViewport().append(jqPopup);
        },

        /**
         Detaches popup (dialog/notification/etc.) from the page
         @param jqPopup $ object representing popup
         */
        hide : function (jqPopup) {
            jqPopup.detach();
            XF.UI.removeFromIsset('popup', jqPopup.attr('id'));
        },


        /**
         Generates a dialog with header, message and buttons
         @param headerText String to show in dialog header
         @param messageText String to show in dialog body
         @param buttons Array of buttons to show ($ objects or objects with button description for createButton() method)
         @param modal Boolean Flag which indicates whether the dialog is modal
         @return $ Dialog object
         */
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
                '<div class="xf-dialog-box"><div class="xf-dialog-box-header"><h3><%= headerText %></h3></div>'
                + '<div class="xf-dialog-box-content"><%= messageText %></div>'
                + '<div class="xf-dialog-box-footer clearfix"></div></div>'
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
                var btnCount = buttons.length,
                    jqBtn;

                _.each(buttons, function (btn, index, buttons){

                    if (btn instanceof $){
                        jqBtn = btn;
                    } else {
                        jqBtn = XF.UI.popup.createButton(btn);
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

        /**
         Generates a notification with text and icon
         @param messageText String to show in dialog body
         @param iconName Icon name (optional)
         @return $ Notification object
         */
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
                    '<div class="xf-notification"><div class="xf-notification-wrap">'
                    + '<div class="xf-notification-text"><%= messageText %></div></div></div>'
            );

            jqNotification.find('.xf-dialog-content').html(_template({messageText : messageText}));

            if (iconName && iconName != '') {
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
         Stores dialog object
         @type $
         @private
         */
        dialog : null,

        /**
         Hides Dialog
         */
        hideDialog : function () {

            if (this.dialog) {
                this.hide(this.dialog);
            }
        },

        hideAll : function () {
            var idStack = XF.UI.checkInIsset('popup');

            for (var i in idStack) {

                if ($('#' + idStack[i]).length) {
                    this.hide($('#' + idStack[i]));
                }
            }
        },

        createButton : function (buttonDescr)  {
            var jQButton = $('<button></button>'),
                attrs = {};

            attrs['id'] = buttonDescr.id || 'xf-' + Math.floor(Math.random() * 10000);
            attrs['class'] = buttonDescr.class || '';
            attrs['name'] = buttonDescr.name || attrs.id;
            buttonDescr.small = buttonDescr.small || '';

            jQButton.html(buttonDescr.text);

            if (buttonDescr.icon && buttonDescr.icon != '') {
                attrs['data-icon'] = buttonDescr.icon;
            };

            if (buttonDescr.iconpos && buttonDescr.iconpos != '') {
                attrs['data-iconpos'] = buttonDescr.iconpos;
            };

            if (buttonDescr.small && buttonDescr.small != '') {
                attrs['data-small'] = buttonDescr.small;
            };

            if (buttonDescr.appearance && buttonDescr.appearance != '') {
                attrs['data-appearance'] = buttonDescr.appearance;
            };

            if (buttonDescr.special && buttonDescr.special != '') {
                attrs['data-special'] = buttonDescr.special;
            };

            if (buttonDescr.alert && buttonDescr.alert != '') {
                attrs['data-alert'] = buttonDescr.alert;
            };

            if (_.isFunction(buttonDescr.handler)) {
                jQButton.click(buttonDescr.handler)
            };
            jQButton.attr(attrs);

            if (_.isFunction(buttonDescr.handler)) {
                jQButton.on('tap', buttonDescr.handler);
            };
            return jQButton;
        }
    };


    /**
     Adds scrolling functionality
     @param scrollable DOM Object
     @private
     */
    XF.UI.scrollable = {

        selector : '[data-scrollable=true]',

        render : function (scrollable) {

            var jQScrollable = $(scrollable);
            if (!scrollable || !jQScrollable instanceof $ || jQScrollable.attr('data-skip-enhance') == 'true') {
                return;
            }

            var id = jQScrollable.attr('id') || 'xf-' + Math.floor(Math.random()*10000);

            jQScrollable.attr({'data-skip-enhance':true, 'id' : id});

            var children = jQScrollable.children();

            // always create wrapper
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

            if (!wrapperId || wrapperId == '') {
                wrapperId = 'xf_scrollable_' + new Date().getTime();
                jQScrollable.attr({'id':wrapperId});
            }

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
    XF.UI.slidemenu = {

        selector : '[data-role=slidemenu]',

        render : function (menu, options) {
            var jQMenu = $(menu);

            if (!menu || !jQMenu instanceof $ || jQMenu.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || 'xf-slidemenu-component-' + Math.floor(Math.random()*10000);
            options.title = options.title || '';
            options.hasTitle = options.title != '' ? true : false;
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

            var buttons = jQMenu.find(XF.UI.button.selector);
            options.buttonsClass = '';

            for (var i = 0; i < buttons.length; ++i) {
                var button = buttons.eq(i);
                var butOpts = {
                    iconClass : button.attr('data-icon') ? 'xf-icon-' + button.attr('data-icon') : '',
                    dataHrefString : button.attr('data-href') ? button.attr('data-href') : '',
                    textClass : button.attr('data-text-class') ? button.attr('data-text-class') : '',
                    id : button.attr('data-id') ? button.attr('data-id') : options.id + '-item' + i,
                    class : button.attr('data-class') || '',
                    text : button.val() || button.text() || ''
                };
                options.buttons.push(butOpts);
            }

            XF.Router.on('route', function () {
                XF.UI.slidemenu.selectButton(jQMenu);

                if ($('.xf-slidemenu-wrapper')) {
                    $('.xf-slidemenu-wrapper').removeClass('xf-slidemenu-show');
                    $('body').removeClass('blur-page');
                }
            });

            var _template = _.template(
                '<div class="xf-slidemenu-scrollable"><div class="xf-slidemenu-header"><%= title %><%= menuButton %></div>'
                + '<%= html %></div>'
            );

            jQMenu.html(_template(options));

            XF.trigger('ui:enhance', jQMenu);

            $('.xf-slidemenu-button').on('tap', function () {
                $('.xf-slidemenu-wrapper').addClass('xf-slidemenu-show xf-slidemenu-animation');
                $('body').addClass('blur-page xf-viewport-transitioning');
                return false;
            });
            $('.xf-slidemenu-close-button').on('tap', function () {
                var delayTime = XF.Device.isIOS ? 300 : 0;
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
     @param footer DOM Object
     @private
     */
    XF.UI.tabs = {

        selector : '[data-role=tabs]',

        render : function (tabs, options) {
            var jQTabs = $(tabs),
                _self = this;

            if (!tabs || !jQTabs instanceof $ || jQTabs.attr('data-skip-enhance') == 'true') {
                return;
            }

            options.id = options.id || 'xf-tabs-component-' + Math.floor(Math.random()*10000);
            options.tabsperrow = options.tabsperrow || 4;

            jQTabs.attr({
                'data-id': options.id,
                'id': options.id,
                'data-skip-enhance' : 'true'
            });

            options.tabs = options.tabs || [];

            var buttons = jQTabs.find(XF.UI.button.selector);
            options.rowCount = Math.ceil(buttons.length / options.tabsperrow);
            options.tabsClass = options.tabsclass || '';

            var lastRowSize = buttons.length % options.tabsperrow;
            if(!lastRowSize) {
                lastRowSize = options.tabsperrow;
            }

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
                    tabOpts.className += ' xf-tabs-button-active '
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

            var _template = _.template(
                '<ul class="xf-tabs">'
                + '<% _.each(tabs, function(tab) { %>'
                + '<li class="xf-grid-unit <%= tabsClass %> <%= tab.gridClass %>  ">'
                + '<a data-params="<%= tab.params %>" class="xf-tabs-button <%= tab.className %>" id="<%= tab.id %>">'
                + '<span class="xf-tabs-button-text"><%= tab.text %></span>'
                + '</a>'
                + '</li>'
                + '<% }); %>'
                + '</ul>'
            );

            jQTabs.html(_template(options));

            jQTabs.find('a').on('tap', function () {
               XF.UI.tabs.selectTab(jQTabs, $(this));
            });
        },

        selectTab : function (parent, el) {
            parent.find('a').removeClass('xf-tabs-button-active');
            el.addClass('xf-tabs-button-active');
        }
    };

    /**
     Enhances text input view
     @param textInput DOM Object
     @private
     */
    XF.UI.input = {
        selector : 'INPUT[type=text], INPUT[type=search], INPUT[type=tel], ' +
                    'INPUT[type=url], INPUT[type=email], INPUT[type=password], INPUT[type=datetime], ' +
                    'INPUT[type=date], INPUT[type=month], INPUT[type=week], INPUT[type=time], ' +
                    'INPUT[type=datetime-local], INPUT[type=number], INPUT[type=color], TEXTAREA, ' +
                    //
                    'INPUT[type=range], INPUT[type=search]',

        render : function (textInput, options) {
            var jQTextInput = $(textInput),
                eventsHandler = {
                    start : 'mousedown touchstart MSPointerDown',
                    move : 'mousemove touchmove MSPointerMove',
                    end : 'mouseup touchend MSPointerUp',
                };

            if (!textInput || !jQTextInput instanceof $ || jQTextInput.attr('data-skip-enhance') == 'true') {
                return;
            }

            jQTextInput.attr({'data-skip-enhance':true});

            // For inputs of types:
            // 	text, search, tel, url, email, password, datetime, date, month,
            // 	week, time, datetime-local, number, color and also for TEXTAREA element
            // 	add class "xf-input-text".
            jQTextInput.addClass('xf-input-text');

            var isInputElement = (textInput.nodeName == 'INPUT'),
                textInputType = jQTextInput.attr('type');

            // For inputs of types "range" and "search" change type to "text".
            if (textInputType == 'search') {
                var newTextInput = $('<input type="text"/>'),
                    newTIAttrs = {};

                _.each(textInput.attributes, function (attribute) {

                    if (attribute.name == 'type') {
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
            } else if (textInputType == 'number' || textInputType == 'range') {

                var minValue = jQTextInput.attr('min'),
                    maxValue = jQTextInput.attr('max'),
                    selValue = parseFloat(jQTextInput.attr('value')),
                    step = parseFloat(jQTextInput.attr('step')) || 1,
                    newTextInput = $('<input type="text"/>'),
                    newTIAttrs = {};

                _.each(textInput.attributes, function (attribute) {

                    if (attribute.name == 'type') {
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
                            $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-circled-minus')
                        )
                );
                numberWrapper.append(newTextInput);
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
                            _template = _.template(
                                 '<div class="xf-input-range">'
                                 + '<div class="xf-range-wrap">'
                                 + '<div class="xf-input-range-min"><%= minValue %></div>'
                                 + '<div class="xf-input-range-slider">'
                                 + '<div class="xf-input-range-track">'
                                 + '<div class="xf-input-range-value" style="width: 0">'
                                 + '<div class="xf-input-range-control" tabindex="0">'
                                 + '<div class="xf-input-range-thumb" style="left:100%" title="<%= selValue %>"></div>'
                                 + '</div>'
                                 + '</div>'
                                 + '</div>'
                                 + '</div>'
                                 + '<div class="xf-input-range-max"><%= maxValue %></div>'
                                 + '</div>'
                                 + '</div>'
                            );
                        rangeWrapper.append(_template({minValue : minValue, maxValue: maxValue, selValue: selValue}));

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
                numberWrapper.find('button.xf-input-number-control-decrease').on('tap', stepDown);
                numberWrapper.find('button.xf-input-number-control-increase').on('tap', stepUp);

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

                    var startThumbDrag = function(event) {
                        mousePrevX = XF.Device.supports.touchEvents ? event.originalEvent.targetTouches[0].pageX : event.pageX || event.clientX || layerX || event.screenX;
                        savedVal = selValue;
                        $(document).bind(eventsHandler.end, stopThumbDrag);
                        $(document).bind(eventsHandler.move, doThumbDrag);
                    };

                    var doThumbDrag = function(event) {
                        mouseNewX = XF.Device.supports.touchEvents ? event.originalEvent.targetTouches[0].pageX : event.pageX || event.clientX || layerX || event.screenX;
                        mouseDiff = mouseNewX - mousePrevX;
                        valueDiff = trackDiffToValueDiff(mouseDiff);
                        mousePrevX = mouseNewX;
                        savedVal += valueDiff;
                        setNewValue(savedVal);
                    };

                    var stopThumbDrag = function() {
                        $(document).bind(eventsHandler.end, stopThumbDrag);
                        $(document).bind(eventsHandler.move, doThumbDrag);
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
                    rangeWrapper.find('div.xf-input-range-thumb').bind('mousedown touchstart', startThumbDrag);

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
            if(options.appearance == 'split' && isInputElement) {

                var applicableTypes = ['text', 'search', 'tel', 'url', 'email',
                    'password', 'datetime', 'date', 'month', 'week', 'time', 'datetime-local', 'color'];

                _.each(applicableTypes, function(applicableType) {
                    if(textInputType == applicableType) {
                        splitAppearance = true;
                    }
                });
            }

            var textInputID = (jQTextInput[0].nodeName === 'INPUT') ? jQTextInput.attr('id') : jQTextInput.find('input').eq(0).attr('id');
            var textInputLabel = (textInputID && textInputID.length) ? $('label[for=' + textInputID + ']') : [];

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

/* License text */