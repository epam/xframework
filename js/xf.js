/*!     X-Framework     2013-07-29     */
/**
 TODO:
 - scrollTop for Zepto
 - wrapInner for Zepto
 **/
(function(a, b) {
    /* $ hooks */
    var c = $.fn.hide;
    /** @ignore */
    $.fn.hide = function() {
        var a = c.apply(this, arguments);
        return $(this).trigger("hide"), a;
    };
    var d = $.fn.show;
    /** @ignore */
    $.fn.show = function() {
        var a = d.apply(this, arguments);
        return $(this).trigger("show"), a;
    };
    var e = $.fn.html;
    /** @ignore */
    $.fn.html = function() {
        var a = e.apply(this, arguments);
        return $(this).trigger("show"), $(this).trigger("html"), a;
    };
    var f = $.fn.append;
    /** @ignore */
    $.fn.append = function() {
        var a = f.apply(this, arguments);
        return $(this).trigger("append"), a;
    };
    var g = $.fn.prepend;
    /** @ignore */
    $.fn.prepend = function() {
        var a = g.apply(this, arguments);
        return $(this).trigger("prepend"), a;
    }, _.isFunction($.fn.detach) || ($.fn.detach = function(a) {
        return this.remove(a, !0);
    }), _.isFunction($.fn.wrapInner) || ($.fn.wrapInner = function(a) {
        return _.isFunction(a) ? this.each(function(b) {
            $(this).wrapInner(a.call(this, b));
        }) : this.each(function() {
            var b = $(this), c = b.contents();
            c.length ? c.wrapAll(a) : b.append(a);
        });
    });
    var h = $.fn.detach;
    /** @ignore */
    $.fn.detach = function() {
        var a = $(this).parent(), b = h.apply(this, arguments);
        return a.trigger("detach"), b;
    }, /**
     @namespace Holds visible functionality of the framework
     */
    XF = a.XF = a.XF || {}, /////////////////////////////////////////////////////////////////////////////////////////////////////////
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
    XF.start = function(a) {
        a = a || {}, // Creating static singletones
        XF.Settings = new XF.SettingsClass(), XF.Cache = new XF.CacheClass(), XF.Controller = new XF.ControllerClass(), 
        XF.Device = new XF.DeviceClass(), XF.PageSwitcher = new XF.PageSwitcherClass(), 
        // options.settings
        XF.Settings.bulkSet(a.settings), // initializing XF.Cache
        XF.Cache.init(), // initializing XF.Device
        a.device = a.device || {}, XF.Device.init(a.device.types), // options.router
        a.router = a.router || {}, l(a.router), m(), p(), // options.root
        rootDOMObject = a.root, rootDOMObject || (rootDOMObject = $("body")), n(rootDOMObject);
    };
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     The self-propagating extend function that XF classes use.
     @memberOf XF
     @private
     @param {Object} protoProps Prototype extending properties
     @param {Object} staticProps Static extending properties
     */
    var i = function(a, b) {
        var c = k(this, a, b);
        return c.extend = this.extend, c;
    }, j = function() {}, k = function(a, b, c) {
        var d;
        return d = b && b.hasOwnProperty("constructor") ? b.constructor : function() {
            return a.apply(this, arguments);
        }, _.extend(d, a), j.prototype = a.prototype, d.prototype = new j(), b && _.extend(d.prototype, b), 
        c && _.extend(d, c), d.prototype.constructor = d, d.__super__ = a.prototype, d;
    };
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     @namespace Holds all the reusable util functions
     */
    XF.Utils = {}, /**
     @namespace Holds all the reusable util functions related to Adress Bar
     */
    XF.Utils.AddressBar = {}, _.extend(XF.Utils.AddressBar, /** @lends XF.Utils.AddressBar */ {
        isMobile: /iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase()),
        /**
         Saves scroll value in order to not re-calibrate everytime we call the hide url bar
         @type Boolean
         @private
         */
        BODY_SCROLL_TOP: !1,
        /**
         Calculates current scroll value
         @return Number
         @private
         */
        getScrollTop: function() {
            var b = a, c = document;
            return b.pageYOffset || "CSS1Compat" === c.compatMode && c.documentElement.scrollTop || c.body.scrollTop || 0;
        },
        /**
         Hides adress bar
         */
        hide: function() {
            console.log("XF :: Utils :: AddressBar :: hide");
            var b = a;
            if (// if there is a hash, or XF.Utils.AddressBar.BODY_SCROLL_TOP hasn't been set yet, wait till that happens
            location.hash || XF.Utils.AddressBar.BODY_SCROLL_TOP === !1 || b.scrollTo(0, 1 === XF.Utils.AddressBar.BODY_SCROLL_TOP ? 0 : 1), 
            this.isMobile) {
                var c = document.documentElement.style;
                return c.height = "200%", c.overflow = "visible", a.scrollTo(0, 1), c.height = a.innerHeight + "px", 
                !0;
            }
        },
        /**
         Hides adress bar on page load
         */
        hideOnLoad: function() {
            console.log("XF :: Utils :: AddressBar :: hideOnLoad");
            var b = a, c = b.document;
            // If there's a hash, or addEventListener is undefined, stop here
            !location.hash && b.addEventListener && (//scroll to 1
            a.scrollTo(0, 1), XF.Utils.AddressBar.BODY_SCROLL_TOP = 1, //reset to 0 on bodyready, if needed
            bodycheck = setInterval(function() {
                c.body && (clearInterval(bodycheck), XF.Utils.AddressBar.BODY_SCROLL_TOP = XF.Utils.AddressBar.getScrollTop(), 
                XF.Utils.AddressBar.hide());
            }, 15), b.addEventListener("load", function() {
                setTimeout(function() {
                    //at load, if user hasn't scrolled more than 20 or so...
                    XF.Utils.AddressBar.getScrollTop() < 20 && //reset to hide addr bar at onload
                    XF.Utils.AddressBar.hide();
                }, 0);
            }));
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
    var l = function(a) {
        if (XF.Router) throw "XF.createRouter can be called only ONCE!";
        XF.Router = new (b.Router.extend(a))();
    }, m = function() {
        $("[data-href]").live("click", function() {
            XF.Router.navigate($(this).attr("data-href"), {
                trigger: !0
            }), _.delay(function() {
                a.scrollTo(0, 0);
            }, 250);
        });
    }, n = function(a) {
        $(a).find("[data-component][data-cache=true],[data-component]:visible").each(function(a, b) {
            var c = $(b).attr("data-id"), d = $(b).attr("data-component");
            o(c, d, !0);
        });
    }, o = function(a, b) {
        t(b, function(c) {
            if (!r[a]) {
                var d = new c(b, a);
                console.log("XF :: loadChildComponent - created : " + a), r[a] = d, d.construct();
            }
        });
    }, p = function() {
        $("[data-component]").live("show", function(a) {
            if (a.currentTarget == a.target) {
                var b = $(this).attr("data-id");
                if (!r[b]) {
                    var c = $(this).attr("data-component");
                    o(b, c);
                }
                XF.UIElements.enhanceView($(this));
            }
        });
    }, q = function(a, b) {
        var c = document.createElement("script");
        c.readyState ? //IE
        /** @ignore */
        c.onreadystatechange = function() {
            ("loaded" == c.readyState || "complete" == c.readyState) && (c.onreadystatechange = null, 
            b && b());
        } : //Others
        /** @ignore */
        c.onload = function() {
            b && b();
        }, c.src = a, document.getElementsByTagName("head")[0].appendChild(c);
    }, r = {}, s = {}, t = function(a, b) {
        var c = s[a];
        return c || (c = XF.registerComponent(a, XF.Settings.property("componentUrlFormatter")(a))), 
        c.loaded ? (b(c.compDef), void 0) : (c.callbacks.push(b), c.loading || (c.loading = !0, 
        q(c.compSrc)), void 0);
    };
    /**
     Returns component instance by its id
     @param {String} compID Component instance id
     @returns {XF.Component} Appropriate component instance
     @public
     */
    XF.getComponentByID = function(a) {
        return r[a];
    }, /**
     Registers component source
     @param {String} compName Component name
     @param {String} compSrc Component definition source
     @returns {XF.ComponentStatus} Component status descriptor
     @public
     */
    XF.registerComponent = function(a, b) {
        var c = s[a];
        return c ? c : (s[a] = new w(b), s[a]);
    }, /**
     Defines component class and calls registered callbacks if necessary
     @param {String} compName Component name
     @param {Object} compDef Component definition
     @public
     */
    XF.defineComponent = function(a, b) {
        var c = s[a];
        for (c || (c = s[a] = new w(null)), s[a].loading = !1, s[a].loaded = !0, s[a].compDef = b; c.callbacks.length; ) c.callbacks.pop()(c.compDef);
    }, /**
     Should invoke component loading & call callback function as soon as component would be available
     @param {String} compName Component name
     @param {Function} callback Callback to execute when component definition is ready
     @public
     */
    XF.requireComponent = function(a, b) {
        t(a, b);
    };
    /**
     Stores custom options for {@link XF.Component} or its subclasses instances
     @memberOf XF
     @private
     */
    var u = {};
    /**
     Defines component instance custom options
     @param {String} compID Component instance id
     @param {Object} options Object containing custom options for appropriate component instance
     @public
     */
    XF.setOptionsByID = function(a, b) {
        u[a] = b;
    };
    /**
     Returns custom instance options by component instance ID
     @memberOf XF
     @param {String} compID Component instance id
     @returns {Object} Object containing custom options for appropriate component instance
     @private
     */
    var v = function(a) {
        return u[a] || {};
    };
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Implements basic Events dispatching logic.
     @class
     */
    XF.Events = {}, _.extend(XF.Events, /** @lends XF.Events# */ {
        /**
         Bind an event, specified by a string name, 'ev', to a 'callback' function. Passing 'all' will bind the callback to all events fired.
         @param {String} ev event name
         @param {Function} callback function to be called on event trigger
         @param {Object} context context for function call
         @return {XF.Events}
         */
        bind: function(a, b, c) {
            var d = this._callbacks || (this._callbacks = {}), e = d[a] || (d[a] = []);
            return e.push([ b, c ]), this;
        },
        /**
         Remove one or many callbacks. If 'callback' is null, removes all callbacks for the event. If 'ev' is null, removes all bound callbacks for all events.
         @param {String} ev event name
         @param {Function} callback function to be called on event trigger
         @return {XF.Events}
         */
        unbind: function(a, b) {
            var c;
            if (a) {
                if (c = this._callbacks) if (b) {
                    var d = c[a];
                    if (!d) return this;
                    for (var e = 0, f = d.length; f > e; e++) if (d[e] && b === d[e][0]) {
                        d[e] = null;
                        break;
                    }
                } else c[a] = [];
            } else this._callbacks = {};
            return this;
        },
        /**
         Trigger an event, firing all bound callbacks. Callbacks are passed the same arguments as 'trigger' is, apart from the event name. Listening for 'all' passes the true event name as the first argument.
         @param {String} eventName event name
         @return {XF.Events}
         */
        trigger: function(a) {
            var b, c, d, e, f, g = 2;
            if (!(c = this._callbacks)) return this;
            for (;g--; ) if (d = g ? "all" : a, b = c[d]) for (var h = 0, i = b.length; i > h; h++) (e = b[h]) ? (f = g ? arguments : Array.prototype.slice.call(arguments, 1), 
            e[0].apply(e[1] || this, f)) : (b.splice(h, 1), h--, i--);
            return this;
        }
    }), /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Instance of {@link XF.DeviceClass}
     @static
     @private
     @type {XF.DeviceClass}
     */
    XF.Device = null, /**
     Represents some basic testing/verification api letting you know what device the app is started on.
     @class
     @static
     */
    XF.DeviceClass = function() {
        /**
         Contains device viewport size: {width; height}
         @type Object
         */
        this.size = {
            width: 0,
            height: 0
        }, /**
         Array of device types to be chosen from (can be set via {@link XF.start} options)
         @type Object
         @private
         */
        this.types = [ {
            name: "desktop",
            range: {
                max: null,
                min: 1024
            },
            templatePath: "desktop/",
            fallBackTo: "tablet"
        }, {
            name: "tablet",
            range: {
                max: 1024,
                min: 480
            },
            templatePath: "tablet/",
            fallBackTo: "mobile"
        }, {
            name: "mobile",
            range: {
                max: 480,
                min: null
            },
            templatePath: "mobile/",
            fallBackTo: "default"
        } ], /**
         Default device type that would be used when none other worked (covers all the viewport sizes)
         @type Object
         @private
         */
        this.defaultType = {
            name: "default",
            range: {
                min: null,
                max: null
            },
            templatePath: "",
            fallBackTo: null
        }, /**
         Detected device type that would be used to define template path
         @type Object
         @private
         */
        this.type = this.defaultType, /**
         A flag indicates whether the device is supporting Touch events or not
         @type Boolean
         */
        this.isTouchable = !1;
    }, _.extend(XF.DeviceClass.prototype, /** @lends XF.DeviceClass.prototype */ {
        /**
         Initializes {@link XF.Device} instance (runs detection methods)
         @param {Array} types rray of device types to be choosen from
         */
        init: function(a) {
            this.types = a || this.types, this.detectType(), this.detectTouchable();
        },
        /**
         Detectes device type (basicaly, chooses most applicable type from the {@link XF.DeviceClass#types} list)
         @private
         */
        detectType: function() {
            this.size.width = $(a).width(), this.size.height = $(a).height(), console.log('XF.DeviceClass :: detectType - width = "' + this.size.width + '"'), 
            console.log('XF.DeviceClass :: detectType - height = "' + this.size.height + '"');
            var b = Math.max(this.size.width, this.size.height);
            console.log('XF.DeviceClass :: detectType - maxSide = "' + b + '"');
            var c = null;
            _.each(this.types, function(a) {
                try {
                    (!a.range.min || a.range.min && b > a.range.min) && (!a.range.max || a.range.max && b < a.range.max) && (c = a);
                } catch (d) {
                    console.log("XF.DeviceClass :: detectType - bad type detected - skipping"), console.log("XF.DeviceClass :: detectType - @dev: plz verify types list");
                }
            }), c ? this.type = c : (this.type = this.defaultType, console.log("XF.DeviceClass :: detectType - could not choose any of device type"), 
            console.log("XF.DeviceClass :: detectType - drop back to this.defaultType"), console.log("XF.DeviceClass :: detectType - @dev: plz verify types list")), 
            console.log('XF.DeviceClass :: detectType - selected type "' + this.type.name + '"');
        },
        /**
         Chooses the next applicable type in case when previous one's templatePath could not be loaded
         @param {Object} fallBackFrom If passed, the return type would be taken as dropDown from it (optional)
         @return {Object} Device type
         */
        getNextType: function(a) {
            var b = this.type;
            // prevent looping the same type again & again
            return a && (b = a.fallBackTo ? this.getTypeByName(a.fallBackTo) : this.defaultType), 
            // just checking if type is ok
            b && b.templatePath || (b = this.defaultType), b == a ? (console.log("XF.DeviceClass :: getNextType - infinit cycle of drop down logic detected"), 
            console.log("XF.DeviceClass :: getNextType - stop trying, no template is available"), 
            null) : b;
        },
        /**
         Chooses device type by ot's name
         @param {String} typeName Value of 'name' property of the type that should be returnd
         @return {Object} Device type
         */
        getTypeByName: function(a) {
            var b = null;
            return _.each(this.types, function(c) {
                try {
                    c.name == a && (b = c);
                } catch (d) {
                    console.log("XF.DeviceClass :: getTypeByName - bad type name - skipping"), console.log("XF.DeviceClass :: getTypeByName - @dev: plz verify types list");
                }
            }), b;
        },
        /**
         Detectes whether the device is supporting Touch events or not
         @private
         */
        detectTouchable: function() {
            var b = " -webkit- -moz- -o- -ms- ".split(" "), c = [ "@media (", b.join("touch-enabled),("), "app_device_test", ")", "{#touch{top:9px;position:absolute}}" ].join(""), d = this;
            this.injectElementWithStyles(c, function(b) {
                var c = document.styleSheets[document.styleSheets.length - 1], e = (c ? c.cssRules && c.cssRules[0] ? c.cssRules[0].cssText : c.cssText || "" : "", 
                b.childNodes), f = e[0];
                d.isTouchable = "ontouchstart" in a || a.DocumentTouch && document instanceof DocumentTouch || 9 === (f && f.offsetTop);
            }, 1, [ "touch" ]), console.log("XF.Device :: detectTouchable - device IS " + (this.isTouchable ? "" : "NOT ") + "touchable");
        },
        /**
         Inject element with style element and some CSS rules. Used for some detect* methods
         @param String rule Node styles to be applied
         @param Function callback Test validation Function
         @param Number nodes Nodes Number
         @param Array testnames Array with test names
         @private
         */
        injectElementWithStyles: function(a, b, c, d) {
            var e, f, g, h = document.createElement("div"), // After page load injecting a fake body doesn't work so check if body exists
            i = document.body, // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
            j = i ? i : document.createElement("body");
            if (parseInt(c, 10)) // In order not to give false positives we create a node for each test
            // This also allows the method to scale for unspecified uses
            for (;c--; ) g = document.createElement("div"), g.id = d ? d[c] : "app_device_test" + (c + 1), 
            h.appendChild(g);
            // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
            // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
            // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
            // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
            // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
            return e = [ "&#173;", "<style>", a, "</style>" ].join(""), h.id = "app_device_test", 
            // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
            // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
            j.innerHTML += e, j.appendChild(h), i || (//avoid crashing IE8, if background image is used
            j.style.background = "", docElement.appendChild(j)), f = b(h, a), // If this is done after page load we don't want to remove the body so check if body exists
            i ? h.parentNode.removeChild(h) : j.parentNode.removeChild(j), !!f;
        },
        /**
         Stores identifier for portrait orientation
         @constant
         @type String
         */
        ORIENTATION_PORTRAIT: "portrait",
        /**
         Stores identifier for landscape orientation
         @constant
         @type String
         */
        ORIENTATION_LANDSCAPE: "landscape",
        /**
         Returns current orientation of the device (ORIENTATION_PORTRAIT | ORIENTATION_LANDSCAPE)
         @return String
         */
        getOrientation: function() {
            var a = !0, b = document.documentElement;
            return void 0 !== $.support || (a = b && b.clientWidth / b.clientHeight < 1.1), 
            a ? this.ORIENTATION_PORTRAIT : this.ORIENTATION_LANDSCAPE;
        },
        /**
         Returns current screen height
         @return Number
         */
        getScreenHeight: function() {
            var b = this.getOrientation(), c = b === this.ORIENTATION_PORTRAIT, d = c ? 480 : 320, e = c ? screen.availHeight : screen.availWidth, f = Math.max(d, $(a).height()), g = Math.min(e, f);
            return g;
        },
        /**
         Returns viewport $ object
         @return $
         */
        getViewport: function() {
            // if there's no explicit viewport make body the viewport
            //var vp = $('.xf-viewport, .viewport') ;
            var a = $("body").addClass("xf-viewport");
            return a[0] || (a = $(".xf-page").eq(0), a = a.length ? a.parent() : $("body"), 
            a.addClass("xf-viewport")), a.eq(0);
        }
    }), /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Instance of {@link XF.HistoryClass}
     @static
     @type {XF.HistoryClass}
     */
    XF.history = b.history, /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Instance of {@link XF.SettingsClass}
     @static
     @type {XF.SettingsClass}
     */
    XF.Settings = null, /**
     Takes care of all global application settings
     @class
     @private
     @param {Object} settings Custom settings hash
     */
    XF.SettingsClass = function() {
        /**
         Contains name-value pairs of all application settings
         @name XF.Settings#options
         @type Object
         @private
         */
        this.options = /** @lends XF.Settings#options */ {
            /**
             Used for {@link XF.Cache} clearance when new version released
             @memberOf XF.Settings.prototype
             @default '1.0.0'
             @type String
             */
            applicationVersion: "1.0.0",
            /**
             Deactivates cache usage for the whole app (usefull for developement)
             @memberOf XF.Settings.prototype
             @default false
             @type String
             */
            noCache: !1,
            /**
             Used by default Component URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default ''
             @type String
             */
            componentUrlPrefix: "",
            /**
             Used by default Component URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default '.js'
             @type String
             */
            componentUrlPostfix: ".js",
            /**
             Default Component URL formatter: prefix + component_name + postfix
             @param {String} compName Component name
             @memberOf XF.Settings.prototype
             @returns {String} Component URL
             @type Function
             */
            componentUrlFormatter: function(a) {
                return XF.Settings.property("componentUrlPrefix") + a + XF.Settings.property("componentUrlPostfix");
            },
            /**
             Used by default Template URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default ''
             @type String
             */
            templateUrlPrefix: "",
            /**
             Used by default Template URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default '.tmpl'
             @type String
             */
            templateUrlPostfix: ".tmpl",
            /**
             Default Template URL formatter: prefix + component_name + postfix
             @param {String} compName Component name
             @returns {String} Template URL
             @memberOf XF.Settings.prototype
             @type Function
             */
            templateUrlFormatter: function(a, b) {
                return XF.Settings.property("templateUrlPrefix") + b + a + XF.Settings.property("templateUrlPostfix");
            },
            /**
             Used by default Data URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default ''
             @type String
             */
            dataUrlPrefix: "",
            /**
             Used by default Data URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default '.json'
             @type String
             */
            dataUrlPostfix: ".json",
            /**
             Default Data URL formatter: prefix + component_name + postfix
             @param {String} compName Component name
             @returns {String} Template URL
             @memberOf XF.Settings.prototype
             @type Function
             */
            dataUrlFormatter: function(a) {
                return XF.Settings.property("dataUrlPrefix") + a + XF.Settings.property("dataUrlPostfix");
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
            touchableLongTapInterval: 500
        };
    }, _.extend(XF.SettingsClass.prototype, /** @lends XF.SettingsClass.prototype */ {
        /**
             Gives a way to set a number of options at a time
             @param options an object containing properties which would override original ones
             */
        bulkSet: function(a) {
            _.extend(this.options, a);
        },
        /**
             Gets property value by name
             @param {String} propName
             */
        getProperty: function(a) {
            return this.options[a];
        },
        /**
             Sets a new value for one property with
             @param {String} propName
             @param {Object} value new value of the property
             */
        setProperty: function(a, b) {
            this.options[a] = b;
        },
        /**
             Gets or sets property value (depending on whether the 'value' parameter was passed or not)
             @param {String} propName
             @param {Object} [value] new value of the property
             */
        property: function(a, b) {
            return void 0 === b ? this.getProperty(a) : (this.setProperty(a, b), void 0);
        }
    }), /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Instance of {@link XF.CacheClass}
     @static
     @private
     @type {XF.CacheClass}
     */
    XF.Cache = null, /**
     Provides localStorage caching API
     @class
     @static
     */
    XF.CacheClass = function() {
        /**
         Local reference to the localStorage
         @type {Object}
         */
        this.storage = null, /**
         Indicates whether accessibility test for localStorage was passed at launch time
         @type {Object}
         */
        this.available = !1;
    }, _.extend(XF.CacheClass.prototype, /** @lends XF.CacheClass.prototype */ {
        /**
         Runs accessibility test for localStorage & clears it if the applicationVersion is too old
         */
        init: function() {
            this.storage = a.localStorage;
            // checking availability
            try {
                this.storage.setItem("check", "check"), this.storage.removeItem("check"), this.available = !0;
            } catch (b) {
                this.available = !1;
            }
            // clearing localStorage if stored version is different from current
            var c = this.get("applicationVersion");
            XF.Settings.property("noCache") ? (// cache is disable for the whole site manualy
            console.log("XF.Cache :: init - cache is disable for the whole app manually - clearing storage"), 
            this.clear(), this.set("applicationVersion", XF.Settings.property("applicationVersion"))) : c && c == XF.Settings.property("applicationVersion") ? // same version is cached - useing it as much as possible
            console.log("XF.Cache :: init - same version is cached - useing it as much as possible") : (// wrong or no version cached - clearing storage
            console.log("XF.Cache :: init - wrong or no version cached - clearing storage"), 
            this.clear(), this.set("applicationVersion", XF.Settings.property("applicationVersion")));
        },
        /**
         Returns a value stored in cache under appropriate key
         @param {String} key
         @return {String}
         */
        get: function(a) {
            var b;
            if (this.available) try {
                b = this.storage.getItem(a), console.log('XF.Cache :: get - "' + a + '" = "' + b + '"');
            } catch (c) {
                b = null;
            } else b = null;
            return b;
        },
        /**
         Sets a value stored in cache under appropriate key
         @param {String} key
         @param {String} value
         @return {Boolean} success indicator
         */
        set: function(a, b) {
            var c;
            if (this.available) try {
                this.storage.setItem(a, b), c = !0, console.log('XF.Cache :: set - "' + a + '" = "' + b + '"');
            } catch (d) {
                c = !1;
            } else c = !1;
            return c;
        },
        /**
         Clears localStorage
         @return {Boolean} success indicator
         */
        clear: function() {
            var a;
            if (this.available) try {
                this.storage.clear(), a = !0, console.log("XF.Cache :: clear");
            } catch (b) {
                a = !1;
            } else a = !1;
            return a;
        }
    }), /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Instance of {@link XF.ControllerClass}
     @static
     @type {XF.ControllerClass}
     */
    XF.Controller = null, /**
     Represents general Application settings. Extends {@link XF.Events}
     @class
     @static
     @augments XF.Events
     */
    XF.ControllerClass = function() {}, _.extend(XF.ControllerClass.prototype, XF.Events), 
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Instance of {@link XF.RouterClass}
     @static
     @type {XF.Router}
     */
    XF.Router = null, /**
     Implements Routing.
     @class
     @static
     @augments XF.Events
     @param {Object} routes routes has map
     @param {Object} handlers handlers has map
     */
    XF.RouterClass = b.Router, _.extend(b.Router.prototype, /** @lends XF.RouterClass.prototype */ {
        /**
         Initiates Rounting & history listening
         @private
         */
        start: function() {
            XF.history.start();
        },
        /**
         Binds a callback to any route
         @param {Function} callback A function to be called when any route is visited
         */
        bindAnyRoute: function(a) {
            this.on("all", a), this.mostRecentCalled && a(this.mostRecentCalled.name);
        },
        /**
         Returns route string by givven router event name
         @param String eventName
         @return String
         */
        getRouteByEventName: function(a) {
            return a.replace("route:", "");
        }
    }), /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Base Component.
     @class
     @static
     @augments XF.Events
     @see <a href="http://documentcloud.github.com/backbone/#Events">XF.Events Documentation</a>
     @param {String} name Name of the component
     @param {String} id ID of the component instance
     */
    XF.Component = function(a, b) {
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
        this.name = a || "default_name", /**
         ID of the component.
         @default 'default_id'
         @type String
         */
        this.id = b || "default_id", /**
         Flag which defines whether the component was rendered atleast once
         @type Boolean
         */
        this.rendered = !1;
        /** @ignore */
        var c = function() {
            this.unbind("refresh", c), this.rendered = !0;
        };
        this.bind("refresh", c);
        // merging defaults with custom instance options
        var d = this.options, e = v(this.id);
        this.options = _.defaults(e, d);
    }, /**
     Component template
     @type String
     @static
     */
    XF.Component.template = null, /**
     The URL of template that is currently being loaded
     @type String
     @private
     @static
     */
    XF.Component.templateURL = !1, /**
     A flag that indiacates whether that template is currently being loaded
     @type Boolean
     @private
     @static
     */
    XF.Component.templateLoaded = !1, /**
     A flag that indiacates whether that template was successfully loaded
     @type Boolean
     @private
     @static
     */
    XF.Component.templateLoading = !1, /**
     Compiled component template
     @type Function
     @static
     */
    XF.Component.compiledTemplate = null, _.extend(XF.Component.prototype, XF.Events), 
    _.extend(XF.Component.prototype, /** @lends XF.Component.prototype */ {
        /**
         Object containing has-map of component options that can be different for each instance & should be set with {@link XF.setOptionsByID}
         @type Object
         */
        options: {},
        /**
         Defenition of custom Model class extending {@link XF.Model}
         */
        modelClass: XF.Model,
        /**
         Instance of {@link XF.Model} or its subclass
         @type XF.Model
         */
        model: null,
        /**
         Defenition of custom View class extending {@link XF.View}
         */
        viewClass: XF.View,
        /**
         Instance of {@link XF.View} or its subclass
         @type XF.View
         */
        view: null,
        /**
         Constructs component instance
         @private
         */
        construct: function() {
            /** @ignore */
            var a = function() {
                this.view.unbind("construct", a), this.afterConstructView(), this.init(), this.trigger("init"), 
                this.trigger("construct"), XF.Controller.trigger(this.id + ":constructed");
            }, b = function() {
                this.model.unbind("construct", b), this.afterConstructModel(), this.beforeConstructView(), 
                this.constructView(), this.view.bind("construct", a, this), this.view.construct();
            };
            this.beforeConstructModel(), this.constructModel(), this.model.bind("construct", b, this), 
            this.model.construct(), this.childComponent = [];
        },
        /**
         Returns component selector
         @return {String} Selector string that can be used for $.find() for example
         */
        selector: function() {
            return "[data-id=" + this.id + "]";
        },
        /**
         HOOK: override to add logic before view construction
         */
        beforeConstructView: function() {},
        /**
         Constructs {@link XF.View} object
         @private
         */
        constructView: function() {
            this.view && this.view instanceof XF.View || (this.viewClass ? (this.view = new this.viewClass(), 
            this.view instanceof XF.View || (this.view = new XF.View())) : this.view = new XF.View()), 
            this.view.component = this;
        },
        /**
         HOOK: override to add logic after view construction
         */
        afterConstructView: function() {},
        /**
         HOOK: override to add logic before model construction
         */
        beforeConstructModel: function() {},
        /**
         Constructs {@link XF.Model} object
         @private
         */
        constructModel: function() {
            this.model && this.model instanceof XF.Model || (this.modelClass ? (this.model = new this.modelClass(), 
            this.model instanceof XF.Model || (this.model = new XF.Model())) : this.model = new XF.Model()), 
            this.model.component = this;
        },
        /**
         HOOK: override to add logic after model construction
         */
        afterConstructModel: function() {},
        /**
         HOOK: override to add custom logic. Default behavior is to call {@link XF.Component#refresh}
         */
        init: function() {
            this.refresh();
        },
        /**
         Refreshes model data and then rerenders view
         @private
         */
        refresh: function() {
            /** @ignore */
            var a = function() {
                this.model.unbind("refresh", a), this.view.refresh(), this.trigger("refresh");
            };
            this.model.bind("refresh", a, this), this.model.refresh();
        },
        /**
         A wrapper that allows to set some callbacks to be called after the component was first rendered
         @param {Function} callback A callback that would be invoked right after component's first render or right after method invocation if the component has already been rendered
         */
        ready: function(a) {
            if (this.rendered) a(); else {
                /** @ignore */
                var b = function() {
                    this.unbind("refresh", b), a();
                };
                this.bind("refresh", b, this);
            }
        }
    }), /**
     This method allows to extend XF.Component with saving the whole prototype chain
     @function
     @static
     */
    XF.Component.extend = i;
    /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Describes current component definition status
     @class
     @private
     @memberOf XF
     @param {String} compSrc Component definition source
     */
    var w = function(a) {
        /**
         Component definition source
         @private
         @type String
         */
        this.compSrc = a, /**
         Component definition
         @private
         @type XF.Component
         */
        this.compDef = null, /**
         Flag that determines whether the component definition is currently being loaded
         @private
         @type Boolean
         */
        this.loading = !1, /**
         Flag that determines whether the component definition has already been loaded
         @private
         @type Boolean
         */
        this.loaded = !1, /**
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
    return XF.Model = function(a) {
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
        this.component = null, /**
         Object that contains plan data recieved from server
         @type Object
         */
        this.rawData = null, /**
         Object that contains all nema-value pairs for properties created via {@link XF.Model#set} or passed to constructor
         @type Object
         */
        this.attributes = {}, /**
         Object that contains a snapshot of {@link XF.Model#attributes} created before some attribute was changed
         @type Object
         */
        this._previousAttributes = {}, /**
         A flag that indicates whether any of attributes has been changed
         @type Boolean
         @default false
         @private
         */
        this._changed = !1, // getting initial attrbute values
        a || (a = {});
        var b = this.defaults;
        b && (_.isFunction(b) && (b = b.call(this)), a = _.extend({}, b, a)), this.set(a, {
            silent: !0
        }), this._changed = !1, this._previousAttributes = _.clone(this.attributes);
    }, _.extend(XF.Model.prototype, XF.Events), _.extend(XF.Model.prototype, /** @lends XF.Model.prototype */ {
        /**
         Data source URL
         @type String
         */
        dataURL: null,
        /**
         Settings for $ AJAX data request
         @type String
         */
        dataRequestSettings: null,
        /**
         Flag that determines whether the data should not be loaded at all
         @default false
         @type Boolean
         */
        isEmptyData: !1,
        /**
         Flag that determines whether the data should be loaded once
         @default false
         @type Boolean
         */
        isStaticData: !1,
        /**
         Flag that determines whether the data type is string (otherwise JSON)
         @default false
         @type Boolean
         */
        isStringData: !1,
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
        updateInBackground: !1,
        /**
         Flag that determines whether the data should be updated each time the component becomes visible
         @default false
         @type Boolean
         */
        updateOnShow: !1,
        /**
         Object that contains default values for attributes - should be overriden to be used
         @type Object
         */
        defaults: null,
        /**
         Get the value of an attribute.
         @param {String} attribute name
         @return {Object} attribute value
         */
        get: function(a) {
            return this.attributes[a];
        },
        /**
         Returns 'true' if the attribute contains a value that is not null or undefined.
         @param {String} attribute name
         @return {Boolean} existance identifier
         */
        has: function(a) {
            return null != this.attributes[a];
        },
        /**
         Set a hash of model attributes on the object, firing 'change' unless you choose to silence it.
         @param {Object} attributes hash (name-value pairs)
         @param {Object} options hash (name-value pairs)
         @return {XF.Model} object instance
         */
        set: function(a, b) {
            if (// Extract attributes and options.
            b || (b = {}), !a) return this;
            a.attributes && (a = a.attributes);
            var c = this.attributes;
            this._escapedAttributes, // Check for changes of 'id'.
            this.idAttribute in a && (this.id = a[this.idAttribute]);
            // We're about to start triggering change events.
            var d = this._changing;
            this._changing = !0;
            // Update attributes.
            for (var e in a) {
                var f = a[e];
                _.isEqual(c[e], f) || (c[e] = f, this._changed = !0, b.silent || this.trigger("change:" + e, this, f, b));
            }
            return this._changed && !b.silent && this.trigger("changed"), // Fire the 'change' event, if the model has been changed.
            d || b.silent || !this._changed || this.change(b), this._changing = !1, this;
        },
        /**
         Remove an attribute from the model, firing 'change' unless you choose to silence it. 'unset' is a noop if the attribute doesn't exist.
         @param {String} attribute name
         @param {Object} options hash (name-value pairs)
         @return {XF.Model} object instance

         */
        unset: function(a, b) {
            return a in this.attributes ? (b || (b = {}), this.attributes[a], // Remove the attribute.
            delete this.attributes[a], a == this.idAttribute && delete this.id, this._changed = !0, 
            b.silent || (this.trigger("change:" + a, this, void 0, b), this.change(b)), this) : this;
        },
        /**
         Clear all attributes on the model, firing 'change' unless you choose to silence it.
         @param {Object} options hash (name-value pairs)
         @return {XF.Model} object instance
         */
        clear: function(a) {
            a || (a = {});
            var b, c = this.attributes;
            if (this.attributes = {}, this._changed = !0, !a.silent) {
                for (b in c) this.trigger("change:" + b, this, void 0, a);
                this.change(a);
            }
            return this;
        },
        /**
         Call this method to manually fire a 'change' event for this model. Calling this will cause all objects observing the model to update.
         @param {Object} options hash (name-value pairs)
         */
        change: function(a) {
            this.trigger("change", this, a), this._previousAttributes = _.clone(this.attributes), 
            this._changed = !1;
        },
        /**
         Determine if the model has changed since the last 'change' event. If you specify an attribute name, determine if that attribute has changed.
         @param {String} attribute name
         @return {Boolean} change identifier
         */
        hasChanged: function(a) {
            return a ? this._previousAttributes[a] != this.attributes[a] : this._changed;
        },
        /**
         Return an object containing all the attributes that have changed, or false if there are no changed attributes. Useful for determining what parts of a view need to be updated and/or what attributes need to be persisted to the server.
         @param {Object} new attribute values hash
         @return {Object} list of changed attributes;

         */
        changedAttributes: function(a) {
            a || (a = this.attributes);
            var b = this._previousAttributes, c = !1;
            for (var d in a) _.isEqual(b[d], a[d]) || (c = c || {}, c[d] = a[d]);
            return c;
        },
        /**
         Get the previous value of an attribute, recorded at the time the last 'change' event was fired.
         @param {String} attribute name
         @return {Object} previous attribute value
         */
        previous: function(a) {
            return a && this._previousAttributes ? this._previousAttributes[a] : null;
        },
        /**
         Get all of the attributes of the model at the time of the previous 'change' event.
         @return {Object} previous attributes hash copy
         */
        previousAttributes: function() {
            return _.clone(this._previousAttributes);
        },
        /**
         Constructs model instance
         @private
         */
        construct: function() {
            if (this.init(), this.trigger("init"), this.autoUpdateInterval > 0) {
                var a = _.bind(function() {
                    $(this.component.selector()).is(":visible") ? this.refresh() : this.updateInBackground && this.refresh();
                }, this);
                setInterval(a, this.autoUpdateInterval);
            }
            this.updateOnShow && $(this.component.selector()).bind("show", _.bind(this.refresh, this)), 
            this.trigger("construct");
        },
        /**
         HOOK: override to add logic. Default behavior is noop
         */
        init: function() {},
        /**
         Refreshes data from backend if necessary
         @private
         */
        refresh: function() {
            /** ignore */
            var a = function() {
                this.unbind("dataLoaded", a), this.component.view.renderVersion, this.afterLoadData(), 
                //TODO: uncomment this and try to find why 'refresh' not working for menu component
                //if(this.component.view.renderVersion == renderVersion) {
                this.trigger("refresh");
            };
            this.bind("dataLoaded", a), this.beforeLoadData(), this.loadData();
        },
        /**
         Generates data url - override if custom format is required and {@link XF.Settings} has no appropriate way to handle it
         @private
         */
        getDataURL: function() {
            if (!this.dataURL) {
                if (!this.component) throw 'XF.Model "component" linkage lost';
                this.dataURL = _.bind(XF.Settings.property("dataUrlFormatter"), this)(this.component.name);
            }
            return this.dataURL;
        },
        /**
         Returns settings for AddressBar AJAX data request or empty object is it is not set - override to add extra functionality
         @private
         */
        getDataRequestSettings: function() {
            return this.dataRequestSettings || {};
        },
        /**
         HOOK: override to add logic before data load
         */
        beforeLoadData: function() {},
        /**
         Loads data
         @private
         */
        loadData: function() {
            if (this.isEmptyData || this.rawData && this.isStaticData && !(this.autoUpdate > 0)) this.trigger("dataLoaded"); else {
                var a = this, b = this.getDataURL();
                $.ajax(_.extend(this.getDataRequestSettings(), {
                    url: b,
                    complete: function(b, c) {
                        if (!a.component) throw 'XF.Model "component" linkage lost';
                        a.rawData = "success" == c ? a.isStringData ? b.responseText : JSON.parse(b.responseText) : a.isStringData ? {} : "", 
                        a.trigger("dataLoaded");
                    }
                }));
            }
        },
        /**
         HOOK: override to add logic after data load
         */
        afterLoadData: function() {}
    }, {}), /**
     This method allows to extend XF.Model with saving the whole prototype chain
     @function
     @static
     */
    XF.Model.extend = i, /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Implements view workaround flow.
     @class
     @static
     @augments XF.Events
     */
    XF.View = function() {}, /**
     Compiles component template if necessary & executes it with current component instance model
     @static
     */
    XF.View.getMarkup = function() {
        return this.component.constructor.compiledTemplate || (this.component.constructor.compiledTemplate = _.template(this.component.constructor.template)), 
        this.component.constructor.compiledTemplate(this.component.model);
    }, _.extend(XF.View.prototype, XF.Events), _.extend(XF.View.prototype, /** @lends XF.View.prototype */ {
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
        component: null,
        /**
         Template URL
         @type String
         */
        templateURL: null,
        /**
         Flag that determines whether the Model update should be ignored by the View (in this case you may launch {@link XF.View#refresh} manualy)
         @default false
         @type Boolean
         */
        ignoreModelUpdate: !1,
        /**
         Flag that determines whether the view should be rerendered each time the component becomes visible
         @default false
         @type Boolean
         */
        updateOnShow: !1,
        /**
         Flag that determines whether the template should be stored into {@link XF.Cache}
         @default false
         @type Boolean
         */
        useCache: !1,
        /**
         Constructs view instance
         @private
         */
        construct: function() {
            /** ignore */
            var a = function() {
                return this.loadTemplateFailed ? (this.unbind("templateLoaded", a), this.afterLoadTemplateFailed(), 
                void 0) : this.component.constructor.templateLoaded ? (this.unbind("templateLoaded", a), 
                this.afterLoadTemplate(), this.getMarkup = _.bind(XF.View.getMarkup, this), this.init(), 
                this.trigger("init"), this.ignoreModelUpdate || this.component.model.bind("changed", this.refresh, this), 
                this.updateOnShow && $(this.component.selector()).bind("show", _.bind(this.refresh, this)), 
                this.trigger("construct"), void 0) : (this.loadTemplate(), void 0);
            };
            this.bind("templateLoaded", a), this.beforeLoadTemplate(), this.loadTemplate();
        },
        /**
         Stores last device type that was used for template url generation
         @type String
         @private
         */
        lastDeviceType: null,
        /**
         Generates template url - override if custom format is required and {@link XF.Settings} has no appropriate way to handle it
         @private
         */
        getTemplateURL: function() {
            if (// clearing saved template URL - it was erroneous
            this.lastDeviceType && (this.templateURL = null), !this.templateURL) {
                if (!this.component) throw 'XF.View "component" linkage lost';
                // preventing from infinit cycle
                if (this.lastDeviceType = XF.Device.getNextType(this.lastDeviceType), !this.lastDeviceType) return null;
                var a = "";
                this.lastDeviceType && this.lastDeviceType.templatePath && (a = this.lastDeviceType.templatePath), 
                this.templateURL = XF.Settings.property("templateUrlFormatter")(this.component.name, a);
            }
            return this.templateURL;
        },
        /**
         HOOK: override to add logic before template load
         */
        beforeLoadTemplate: function() {},
        /**
         A flag that indicates whether the template loading failed
         @type Boolean
         @private
         */
        loadTemplateFailed: !1,
        /**
         Loads template
         @private
         */
        loadTemplate: function() {
            var a = this.getTemplateURL();
            if (null == a) return this.loadTemplateFailed = !0, this.trigger("templateLoaded"), 
            void 0;
            // trying to get template from cache
            if (this.useCache) {
                var b = XF.Cache.get(a);
                if (b) return this.component.constructor.template = b, this.component.constructor.templateLoaded = !0, 
                this.trigger("templateLoaded"), void 0;
            }
            if (this.component.constructor.templateLoaded || this.component.constructor.templateLoading) if (this.component.constructor.templateLoading) {
                var c = this;
                a = this.component.constructor.templateURL;
                /** ignore */
                var d = function(b) {
                    b.url == a && (XF.Controller.unbind("templateLoaded", d), c.trigger("templateLoaded"));
                };
                XF.Controller.bind("templateLoaded", d);
            } else this.trigger("templateLoaded"); else {
                this.component.constructor.templateURL = a, this.component.constructor.templateLoading = !0;
                var c = this;
                $.ajax({
                    url: a,
                    complete: function(b, d) {
                        if (!c.component) throw 'XF.View "component" linkage lost';
                        if ("success" == d) {
                            var e = b.responseText;
                            // saving template into cache if the option is turned on
                            c.useCache && XF.Cache.set(a, e), c.component.constructor.template = b.responseText, 
                            c.component.constructor.templateLoading = !1, c.component.constructor.templateLoaded = !0, 
                            c.trigger("templateLoaded"), XF.Controller.trigger("templateLoaded", {
                                url: a,
                                template: e
                            });
                        } else c.component.constructor.template = null, c.component.constructor.templateLoading = !1, 
                        c.component.constructor.templateLoaded = !1, c.trigger("templateLoaded"), XF.Controller.trigger("templateLoaded", {
                            url: a,
                            template: null
                        });
                    }
                });
            }
        },
        /**
         HOOK: override to add logic after template load
         */
        afterLoadTemplate: function() {},
        /**
         HOOK: override to add logic for the case when it's impossible to load template
         */
        afterLoadTemplateFailed: function() {
            console.log('XF.View :: afterLoadTemplateFailed - could not load template for "' + this.component.id + '"'), 
            console.log("XF.View :: afterLoadTemplateFailed - @dev: verify XF.Device.types settings & XF.View :: getTemplate URL overrides");
        },
        /**
         HOOK: override to add custom logic on init
         */
        init: function() {},
        /**
         Renders component into placeholder + calling all the necessary hooks & events
         */
        refresh: function() {
            this.preRender(), this.render(), this.postRender(), this.trigger("refresh");
        },
        /**
         HOOK: override to add logic before render
         */
        preRender: function() {},
        /**
         Identifies current render vesion
         @private
         */
        renderVersion: 0,
        /**
         Renders component into placeholder
         @private
         */
        render: function() {
            this.renderVersion++;
            var a = $("[data-id=" + this.component.id + "]");
            a.html(this.getMarkup()), n(a);
        },
        /**
         HOOK: override to add logic after render
         */
        postRender: function() {}
    }), /**
     This method allows to extend XF.View with saving the whole prototype chain
     @function
     @static
     */
    XF.View.extend = i, /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Instance of {@link XF.RootComponent}
     @static
     @private
     @type {XF.RootComponent}
     */
    XF.RootComponentInstance = null, /**
     Root Component.
     @class
     @static
     @augments XF.Component
     */
    XF.RootComponent = XF.Component.extend(/** @lends XF.RootComponent.prototype */ {
        /**
         HOOK: override to add logic before starting routing
         */
        beforeStart: function() {},
        /**
         Launches Routing & automated PageSwitcher
         @private
         */
        start: function() {
            XF.Router.start(), XF.PageSwitcher.start();
        },
        /**
         HOOK: override to add logic after starting routing
         */
        afterStart: function() {},
        /**
         Overrides {@link XF.Component} constructor in order to add Routing start call
         @param {String} name Name of the component
         @param {String} id ID of the component instance
         @private
         */
        constructor: function() {
            if (XF.RootComponentInstance) throw "XF.RootComponent can be only ONE!";
            XF.RootComponentInstance = this, this.ready(function() {
                XF.RootComponentInstance.beforeStart(), XF.RootComponentInstance.start(), XF.RootComponentInstance.afterStart();
            }), XF.Component.apply(this, arguments);
        }
    }), /////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     Instance of {@link XF.PageSwitcherClass}
     @static
     @private
     @type {XF.PageSwitcherClass}
     */
    XF.PageSwitcher = null, /**
     Root Component.
     @class
     @static
     */
    XF.PageSwitcherClass = function() {}, _.extend(XF.PageSwitcherClass.prototype, /** @lends XF.PageSwitcherClass.prototype */ {
        /**
         CSS class used to identify pages
         @type String
         @default 'xf-page'
         */
        pageClass: "xf-page",
        /**
         CSS class used to identify active page
         @type String
         @default 'xf-page-active'
         */
        activePageClass: "xf-page-active",
        /**
         Animation type for page switching ('fade', 'slide', 'none')
         @type String
         @default 'fade'
         */
        animationType: "fade",
        /**
         Saves current active page
         @type $
         @private
         */
        activePage: null,
        /**
         Initialises PageSwitcher: get current active page and binds necessary routes handling
         @private
         */
        start: function() {
            $.fn.animationComplete = function(b) {
                return "WebKitTransitionEvent" in a || "transitionEvent" in a ? $(this).one("webkitAnimationEnd animationend", b) : (// defer execution for consistency between webkit/non webkit
                setTimeout(b, 0), $(this));
            };
            var b = $(XF.RootComponentInstance.selector() + " ." + this.pageClass);
            if (b.length) {
                var c = b.filter("." + this.activePageClass);
                c.length ? this.activePage = c : //this.activePage = pages.first();
                //this.activePage.addClass(this.activePageClass);
                this.switchToPage(b.first()), XF.Router.bindAnyRoute(this.routeHandler);
            }
        },
        /**
         Handles every XF.Router 'route:*' event and invokes page switching if necessary
         @param String eventName
         @private
         */
        routeHandler: function(a) {
            var b = XF.Router.getRouteByEventName(a), c = $("." + XF.PageSwitcher.pageClass + "#" + b);
            c.length && XF.PageSwitcher.switchToPage(c);
        },
        /**
         Executes animation sequence for switching
         @param $ jqPage
         */
        switchToPage: function(b) {
            // preventing animation when the page is already shown
            if (!this.activePage || b.attr("id") != this.activePage.attr("id")) {
                var c = XF.Device.getViewport(), d = XF.Device.getScreenHeight(), e = this.animationType, f = this.activePageClass, g = this.activePage, h = b;
                this.activePage = h, g ? (// start transition
                c.addClass("xf-viewport-transitioning"), g.height(d + $(a).scrollTop()).addClass("out " + e), 
                h.height(d + $(a).scrollTop()).addClass("in " + e + " " + f), g.animationComplete(function() {
                    g.height("").removeClass(e + " out in reverse"), g.attr("id") != XF.PageSwitcher.activePage.attr("id") && g.removeClass(f);
                }), h.animationComplete(function() {
                    h.height("").removeClass(e + " out in reverse"), c.removeClass("xf-viewport-transitioning");
                })) : // just making it active
                this.activePage.addClass(f), // scroll to top of page ofter page switch
                a.scrollTo(0, 1), // looking for components inside the page
                n(this.activePage[0]);
            }
        }
    }), // TBDeleted : temp stuff for testApp.html
    XF.trace = function(a) {
        $("#tracer").html(a + "<br/>" + $("#tracer").html());
    }, a.XF = XF;
}).call(this, window, Backbone), function() {
    /* adding touchable functionality as $ plugin */
    /** @ignore */
    $.fn.touchable = function(a) {
        return this.each(function() {
            return $(this).data("touchable") || $(this).data("touchable", new XF.Touchable(this, a)), 
            $(this).data("touchable");
        });
    }, /**
     Incapsulates one finger workaround logic.
     @class
     @static
     @param {XF.Touchable} touchable Reference to the instance of {@link XF.Touchable} created for target DOM element
     @param {String} fingerID Unique finger indentifier
     @param {Object} startPosition Initial finger position coordinates
     */
    XF.TouchGesture = function(a, b, c) {
        /**
         Reference to the instance of {@link XF.Touchable} created for target DOM element
         @type XF.Touchable
         @private
         */
        this.touchable = a, /**
         Unique finger indentifier
         @type String
         */
        this.fingerID = b, /**
         Initial finger position coordinates
         @type Object
         */
        this.startPosition = c, /**
         Current finger position coordinates
         @type Object
         */
        this.currentPosition = c, /**
         Previous finger position coordinates
         @type Object
         */
        this.previousPosition = c, /**
         Delta (x, y) between current and previous finger position
         @type Object
         */
        this.previousDelta = {
            x: 0,
            y: 0
        }, /**
         Delta (x, y) between current and initial finger position
         @type Object
         */
        this.startDelta = {
            x: 0,
            y: 0
        }, /**
         Angle of a vector represented by delta between current and initial finger position
         @type Number
         */
        this.swipeAngle = 0, /**
         Length of a vector represented by delta between current and initial finger position
         @type Number
         */
        this.swipeLength = 0, /**
         Calculated direction of swipe gesture (XF.TouchGesture.SWIPE_DIRECTION_*)
         @type String
         */
        this.swipeDirection = XF.TouchGesture.SWIPE_DIRECTION_LEFT, /**
         Long touch timeout handler
         @type Function
         @private
         */
        this.longTouchHandler = _.bind(this.longTouchHandlerF, this), /**
         Long touch timeout identifier
         @private
         */
        this.longTouchTimeout = setTimeout(this.longTouchHandler, this.touchable.options.longTapInterval), 
        /**
         A flag witch defined whether the {@link XF.TouchGesture.TOUCH_START_EVENT} has alreay bee dispatched (used to skip {@link XF.TouchGesture.TAP_EVENT} dispatching if 'true')
         @type Boolean
         @default false
         @private
         */
        this.longTouchDispatched = !1, /**
         A flag witch defined whether the gesture has already been complete and should not be calculated further
         @type Boolean
         @default false
         @private
         */
        this.gestureComplete = !1, // dispatching TOUCH_START_EVENT
        this.dispatch(XF.TouchGesture.TOUCH_START_EVENT);
    }, _.extend(XF.TouchGesture.prototype, /** @lends XF.TouchGesture.prototype */ {
        /**
         Calculate everything related to touchmove
         @param {Object} newPosition New finger coordinates
         @private
         */
        move: function(a) {
            this.previousPosition = this.currentPosition, this.currentPosition = a, this.previousDelta.x = this.currentPosition.x - this.previousPosition.x, 
            this.previousDelta.y = this.currentPosition.y - this.previousPosition.y, this.startDelta.x = this.currentPosition.x - this.startPosition.x, 
            this.startDelta.y = this.currentPosition.y - this.startPosition.y, this.checkSwipe(), 
            this.dispatch(XF.TouchGesture.TOUCH_MOVE_EVENT);
        },
        /**
         Checks whether SWIPE_EVENT should be dispatched
         @param {Object} newPosition New finger coordinates
         @private
         */
        checkSwipe: function() {
            if (this.swipeLength = Math.round(Math.sqrt(Math.pow(this.startDelta.x, 2) + Math.pow(this.startDelta.y, 2))), 
            this.swipeLength > this.touchable.options.swipeLength) {
                var a = Math.atan2(this.startDelta.y, this.startDelta.x);
                this.swipeAngle = Math.round(180 * a / Math.PI), this.swipeAngle < 0 && (this.swipeAngle = 360 - Math.abs(this.swipeAngle)), 
                this.swipeDirection = this.swipeAngle <= 45 && this.swipeAngle >= 0 ? XF.TouchGesture.SWIPE_DIRECTION_RIGHT : this.swipeAngle <= 360 && this.swipeAngle >= 315 ? XF.TouchGesture.SWIPE_DIRECTION_RIGHT : this.swipeAngle >= 135 && this.swipeAngle <= 225 ? XF.TouchGesture.SWIPE_DIRECTION_LEFT : this.swipeAngle > 45 && this.swipeAngle < 135 ? XF.TouchGesture.SWIPE_DIRECTION_DOWN : XF.TouchGesture.SWIPE_DIRECTION_UP, 
                this.dispatch(XF.TouchGesture.SWIPE_EVENT), this.touchable.destroyGesture(this.fingerID);
            }
        },
        /**
         Long tap timeout handler function. Dispatches {@link XF.TouchGesture.LONG_TAP_EVENT}
         @param {Object} newPosition New finger coordinates
         @private
         */
        longTouchHandlerF: function() {
            this.dispatch(XF.TouchGesture.LONG_TAP_EVENT), this.longTouchDispatched = !0;
        },
        /**
         Calculate everything related to touchend
         @private
         */
        release: function() {
            this.gestureComplete || this.longTouchDispatched || (clearTimeout(this.longTouchTimeout), 
            this.dispatch(XF.TouchGesture.TAP_EVENT), this.touchable.lastTapTimestamp + this.touchable.options.doubleTapInterval > XF.TouchGesture.getTimeStamp() ? (this.dispatch(XF.TouchGesture.DOUBLE_TAP_EVENT), 
            this.touchable.lastTapTimestamp = 0) : this.touchable.lastTapTimestamp = XF.TouchGesture.getTimeStamp()), 
            this.gestureComplete = !0, this.dispatch(XF.TouchGesture.TOUCH_END_EVENT), this.touchable.destroyGesture(this.fingerID);
        },
        /**
         Dispatches an event passing this {@link XF.TouchGesture} instance as second parameter
         @param {String} eventName Name of event to be dispatched
         @private
         */
        dispatch: function(a) {
            console.log("XF.TouchGesture :: dispatch - " + a + " (" + this.fingerID + ")"), 
            $(this.touchable.elem).trigger(a, this);
        }
    }), _.extend(XF.TouchGesture, /** @lends XF.TouchGesture */ {
        /**
         Touch Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        TOUCH_START_EVENT: "TOUCH_START",
        /**
         Touch Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        TOUCH_MOVE_EVENT: "TOUCH_MOVE",
        /**
         Touch Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        TOUCH_END_EVENT: "TOUCH_END",
        /**
         Gesture Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        TAP_EVENT: "TAP",
        /**
         Gesture Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        SWIPE_EVENT: "SWIPE",
        /**
         Gesture Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        LONG_TAP_EVENT: "LONG_TAP",
        /**
         Gesture Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        DOUBLE_TAP_EVENT: "DOUBLE_TAP",
        /**
         Unique indentifier for Swipe direction gesture (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        SWIPE_DIRECTION_LEFT: "LEFT",
        /**
         Unique indentifier for Swipe direction gesture (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        SWIPE_DIRECTION_RIGHT: "RIGHT",
        /**
         Unique indentifier for Swipe direction gesture (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        SWIPE_DIRECTION_UP: "UP",
        /**
         Unique indentifier for Swipe direction gesture (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        SWIPE_DIRECTION_DOWN: "DOWN",
        /**
         Returns current timestamp in milliseconds
         @return {Number}
         @static
         */
        getTimeStamp: function() {
            return new Date().getTime();
        }
    }), /**
     Incapsulates one finger workaround logic.
     @class
     @static
     @param {Object} elem Reference to the target DOM element
     @param {Object} options Hash-map with custom instance options
     */
    XF.Touchable = function(a, b) {
        /**
         Reference to the target DOM element
         @type Object
         @private
         */
        this.elem = a, /**
         Reference to the $ element
         @type Object
         @private
         */
        this.$elem = $(a), // merging custom options with defauls & global opnes
        this.options = b ? _.clone(b) : {}, _.defaults(this.options, {
            swipeLength: XF.Settings.property("touchableSwipeLength"),
            doubleTapInterval: XF.Settings.property("touchableDoubleTapInterval"),
            longTapInterval: XF.Settings.property("touchableLongTapInterval")
        }), /**
         Hash-map of all gestures currently being tracked
         @type Object
         @private
         */
        this.gestures = {}, /**
         Stores last tap timestamp, witch is used to detect {@link XF.TouchGesture.DOUBLE_TAP_EVENT}
         @type Number
         @private
         */
        this.lastTapTimestamp = 0, /**
         'touchstart' handler bind to {@link XF.Touchable} context
         @type Function
         @private
         */
        this.touchstart = _.bind(this.touchstartF, this), /**
         'touchmove' handler bind to {@link XF.Touchable} context
         @type Function
         @private
         */
        this.touchmove = _.bind(this.touchmoveF, this), /**
         'touchend' handler bind to {@link XF.Touchable} context
         @type Function
         @private
         */
        this.touchend = _.bind(this.touchendF, this), // ading listeners for 'touchstart' & 'mousedown' events
        XF.Device.isTouchable ? $(a).bind("touchstart", this.touchstart) : $(a).bind("mousedown", this.touchstart);
    }, _.extend(XF.Touchable.prototype, /** @lends XF.Touchable.prototype */ {
        /**
         Returns a {@link XF.TouchGesture} instance by finger indentifier
         @param {String} fingerID Finger unique identifier
         @return {XF.TouchGesture}
         */
        getGestureByID: function(a) {
            return this.gestures[a];
        },
        /**
         Creates new {@link XF.TouchGesture} instance
         @param {String} fingerID Finger unique identifier
         @param {Object} startPosition Initial touch coordinates
         @return {XF.TouchGesture}
         */
        createGesture: function(a, b) {
            return this.gestures[a] = new XF.TouchGesture(this, a, b);
        },
        /**
         Destroys an instance of {@link XF.TouchGesture} by finger indentifier
         @param {String} fingerID Finger unique identifier
         */
        destroyGesture: function(a) {
            delete this.gestures[a], 0 == _.size(this.gestures) && (XF.Device.isTouchable ? ($(document).unbind("touchmove", this.touchmove), 
            $(document).unbind("touchend", this.touchend)) : ($(document).unbind("mousemove", this.touchmove), 
            $(document).unbind("mouseup", this.touchend)));
        },
        /**
         'touchstart' handler
         @param {Object} e Javascript event object
         @private
         */
        touchstartF: function(a) {
            // touch device
            if (a = a.originalEvent || a, void 0 != a.changedTouches) {
                var b = this;
                _.each(a.changedTouches, function(a) {
                    b.createGesture(a.identifier, {
                        x: a.clientX,
                        y: a.clientY
                    });
                }), $(document).bind("touchmove", this.touchmove), $(document).bind("touchend", this.touchend);
            } else this.createGesture("mouse", {
                x: a.pageX,
                y: a.pageY
            }), $(document).bind("mousemove", this.touchmove), $(document).bind("mouseup", this.touchend);
        },
        /**
         'touchmove' handler
         @param {Object} e Javascript event object
         @private
         */
        touchmoveF: function(a) {
            // touch device
            if (a = a.originalEvent || a, void 0 != a.changedTouches) {
                var b = this;
                _.each(a.changedTouches, function(a) {
                    var c = b.getGestureByID(a.identifier);
                    c && c.move({
                        x: a.clientX,
                        y: a.clientY
                    });
                });
            } else {
                var c = this.getGestureByID("mouse");
                c && c.move({
                    x: a.pageX,
                    y: a.pageY
                });
            }
        },
        /**
         'touchend' handler
         @param {Object} e Javascript event object
         @private
         */
        touchendF: function(a) {
            // touch device
            if (a = a.originalEvent || a, "undefined" != typeof a.changedTouches) {
                var b = this;
                _.each(a.changedTouches, function(a) {
                    var c = b.getGestureByID(a.identifier);
                    c && c.release();
                });
            } else {
                var c = this.getGestureByID("mouse");
                c && c.release();
            }
        }
    });
}.call(this, window, Backbone), function() {
    /** @ignore */
    /** Cannot use $.fn.extend because of Zepto support **/
    $.fn.outerHtml = function(a) {
        if (a) return this.each(function() {
            $(this).replaceWith(a);
        });
        var b = $("<div></div>").append($(this).clone()), c = b.html();
        return b.remove(), c;
    };
}.call(this, window, Backbone), function() {
    /**
     @namespace Holds all the logic related to UI elements enhancement
     */
    XF.UIElements = {}, _.extend(XF.UIElements, /** @lends XF.UIElements */ {
        /**
         Reworks markup of a givven $ object
         @param jqObj $ item
         */
        enhanceView: function(a) {
            !a instanceof $ && (a = $(a), !a instanceof $) || _.each(XF.UIElements.enhancementList, function(b) {
                a.find(b.selector).not("[data-skip-enhance=true]").each(function() {
                    var a = !1;
                    _.each(XF.UIElements.enhanced.length, function() {
                        XF.UIElements.enhanced[i] === this && (a = !0);
                    }), !a & "true" != $(this).attr("data-skip-enhance") && (XF.UIElements.enhanced.push(this), 
                    XF.UIElements[b.enhanceMethod](this));
                });
            });
        },
        /**
         A list of all the enhancements that whould be done of every $ object givven
         @type Object
         @private
         */
        enhancementList: {},
        /**
         A list of objects already enhanced (used to skip them while iterating through DOM)
         @type Array
         @private
         */
        enhanced: []
    });
}.call(this, window, Backbone), function() {
    XF.UIElements.enhancementList.button = {
        selector: "A[data-role=button], BUTTON, INPUT[type=submit], INPUT[type=reset], INPUT[type=button] [data-appearance=backbtn]",
        enhanceMethod: "enhanceButton"
    }, /**
     Make the DOM object look like a button
     @param button DOM Object
     @private
     */
    XF.UIElements.enhanceButton = function(a) {
        var b = $(a);
        if (a && !(!b instanceof $) && "true" != b.attr("data-skip-enhance")) {
            var c, d;
            // If it's A or BUTTON, the necessary classes are added to the element itself
            if ("A" == a.nodeName || "BUTTON" == a.nodeName) c = b.attr({
                "data-skip-enhance": !0
            }), d = b.html(), b.html(""); else {
                if ("INPUT" != a.nodeName) // how did U get there? o_O
                return;
                // The input is assigned a class xf-input-hidden
                c = $("<div></div>").append(b.clone().addClass("xf-input-hidden").attr({
                    "data-skip-enhance": !0
                })), b.outerHtml(c), d = b.attr("value");
            }
            var e = "true" == b.attr("data-small") || "backbtn" == b.attr("data-appearance");
            // The class xf-button is added to the button.
            // If it has data-small="true" attribute, the class should be xf-button-small.
            c.addClass(e ? "xf-button-small" : "xf-button"), // If data-appearance="backbtn" attribute is present, xf-button-back class is also added.
            "backbtn" == b.attr("data-appearance") && c.addClass("xf-button-back");
            var f = b.attr("data-icon");
            if ("backbtn" == b.attr("data-appearance") && (f = "left"), f) {
                // If data-icon attribute is present, a SPAN.xf-icon is added inside the button.
                var g = $("<span class=xf-icon></span>");
                // The value of data-icon attribute is used to generate icon class: e.g. xf-icon-dots.
                g.addClass("xf-icon-" + f), // If the button had data-small=true or data-appearance="backbtn" attributes,
                // xf-icon-small class is also added to SPAN.xf-icon
                e ? g.addClass("xf-icon-small") : g.addClass("xf-icon-big");
                // A class denoting icon position is also added to the button. Default: xf-iconpos-left.
                // The value is taken from data-iconpos attr.
                // Possible values: left, right, top, bottom.
                var h = b.attr("data-iconpos") || "left";
                "left" != h && "right" != h && "top" != h && "bottom" != h && (h = "left"), c.addClass("xf-iconpos-" + h), 
                c.append(g);
            }
            if (d) {
                var i = $("<span></span>").append(d);
                // The text of buttons is placed inside span.xf-button-small-text for small buttons
                e || "backbtn" == b.attr("data-appearance") ? i.addClass("xf-button-small-text") : i.addClass("xf-button-text"), 
                c.append(i);
            }
            // If data-special="true" attribute is present add xf-button-special class.
            "true" == b.attr("data-special") && c.addClass("xf-button-special"), "true" == b.attr("data-alert") && c.addClass("xf-button-alert"), 
            // If data-alert="true" attribute is present add xf-button-alert class.
            "true" == b.attr("data-alert") && c.addClass("xf-button-alert");
        }
    }, /**
     Generates and enhances button
     @param buttonDescr Object
     @return $
     */
    XF.UIElements.createButton = function(a) {
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
        var b = $("<button></button>");
        b.html(a.text);
        var c = {};
        return a.icon && "" != a.icon && (c["data-icon"] = a.icon), a.iconpos && "" != a.iconpos && (c["data-iconpos"] = a.iconpos), 
        a.small && "" != a.small && (c["data-small"] = a.small), a.appearance && "" != a.appearance && (c["data-appearance"] = a.appearance), 
        a.special && "" != a.special && (c["data-special"] = a.special), a.alert && "" != a.alert && (c["data-alert"] = a.alert), 
        _.isFunction(a.handler) && b.click(a.handler), b.attr(c), XF.UIElements.enhanceButton(b[0]), 
        b;
    };
}.call(this, window, Backbone), function() {
    XF.UIElements.enhancementList.checkboxRadio = {
        selector: "INPUT[type=checkbox], INPUT[type=radio]",
        enhanceMethod: "enhanceCheckboxRadio"
    }, /**
     Enhances checkbox or radio button input view
     @param textInput DOM Object
     @private
     */
    XF.UIElements.enhanceCheckboxRadio = function(a) {
        var b = $(a);
        if (a && !(!b instanceof $) && "true" != b.attr("data-skip-enhance")) {
            b.attr({
                "data-skip-enhance": !0
            });
            var c = b.attr("id"), d = $("label[for=" + c + "]");
            // If the input doesn't have an associated label, quit
            if (d.length) {
                var e = b.attr("type").toLowerCase(), f = "switch" == b.attr("data-role"), g = $("<div></div>");
                f ? (g.addClass("xf-switch"), g.append($('<label class="xf-switch-control"></label>').attr({
                    "for": c
                }).append(b.clone()).append($("<span class=xf-switch-track><span class=xf-switch-track-wrap><span class=xf-switch-thumb></span></span></span>"))), 
                g.append(d.addClass("xf-switch-label"))) : (// An input-label pair is wrapped in a div.xf-input-radio or div.xf-input-checkbox
                g.addClass("xf-input-" + e), // The input is wrapped in a new label.xf-input-positioner[for=INPUT-ID]
                g.append($('<label class="xf-input-positioner"></label>').attr({
                    "for": c
                }).append(b.clone())), // The old label is assigned a class xf-input-label
                g.append(d.addClass("xf-input-label"))), b.outerHtml(g);
            }
        }
    };
}.call(this, window, Backbone), function() {
    XF.UIElements.enhancementList.fieldset = {
        selector: "fieldset[data-role=controlgroup]",
        enhanceMethod: "enhanceFieldset"
    }, /**
     Enhances fieldset view
     @param textInput DOM Object
     @private
     */
    XF.UIElements.enhanceFieldset = function(a) {
        var b = $(a);
        if (a && !(!b instanceof $) && "true" != b.attr("data-skip-enhance")) {
            b.attr({
                "data-skip-enhance": !0
            }), // If the inputs have a parent fieldset[data-role=controlgroup], the fieldset
            // is assigned a class xf-controlgroup,
            b.addClass("xf-controlgroup");
            // If there's a legend element inside the fieldset, it becomes div.xf-label
            var c = b.children("legend").detach();
            if (// the inputs are also wrapped in a div.xf-controlgroup-controls
            b.wrapInner("<div class=xf-controlgroup-controls>"), b.prepend(c), c.length) {
                var d = $("<div></div>"), e = {};
                _.each(c[0].attributes, function(a) {
                    e[a.name] = a.value;
                }), d.attr(e), d.addClass("xf-label"), d.html(c.html()), c.outerHtml(d.outerHtml());
            }
        }
    };
}.call(this, window, Backbone), function() {
    XF.UIElements.enhancementList.list = {
        selector: "UL[data-role=listview], OL[data-role=listview]",
        enhanceMethod: "enhanceList"
    }, /**
     Enhances ul/ol lists view
     @param list DOM Object
     @private
     */
    XF.UIElements.enhanceList = function(a) {
        var b = $(a);
        if (a && !(!b instanceof $) && "true" != b.attr("data-skip-enhance")) {
            b.attr({
                "data-skip-enhance": !0
            }), b.addClass("xf-listview"), // If the list has data-fullwidth="true" attribute add xf-listview-fullwidth class to it
            "true" == b.attr("data-fullwidth") && b.addClass("xf-listview-fullwidth"), // Add xf-li class to all LIs inside
            b.children("li").addClass("xf-li"), // If a LI has data-role="divider" attribute add xf-li-divider class to the LI
            b.children("li[data-role=divider]").addClass("xf-li-divider");
            var c = b.children("li"), d = c.children("a");
            d.addClass("xf-li-btn"), // If there's _no_ A element directly inside the LI, add xf-li-static class to it.
            // Don't add xf-li-static class to LIs with data-role="divider"
            c.not(d.parent()).not("[data-role=divider]").addClass("xf-li-static"), // If there's a data-icon attribute on LI:
            // Append SPAN.xf-icon.xf-icon-big.xf-icon-ICONNAME inside the A
            // If parent LI had no data-iconpos attribute or had data-iconpos="right" attr,
            // add xf-li-with-icon-right class to the A, otherwise add class xf-li-with-icon-left
            b.children("li[data-icon]").children("a").each(function() {
                var a = $(this), b = a.parent().attr("data-icon");
                a.append($("<span></span>").addClass("xf-icon xf-icon-big xf-icon-" + b));
                var c = a.parent().attr("data-iconpos");
                "left" != c && "right" != c && (c = "right"), a.addClass("xf-li-with-icon-" + c);
            }), // If there's an element with class xf-count-bubble inside the A, add xf-li-has-count to the A
            d.children(".xf-count-bubble").parent().addClass("xf-li-has-count"), // If there's an IMG directly inside the A, add xf-li-with-thumb-left class to the A,
            // and xf-li-thumb & xf-li-thumb-left classes to the IMG.
            // If there was data-thumbpos="right" attr, the classes must be
            // xf-li-with-thumb-right & xf-li-thumb-right
            d.children("img").parent().each(function() {
                var a = $(this), b = a.parent().attr("data-thumbpos");
                "right" != b && "left" != b && (b = "left"), a.addClass("xf-li-with-thumb-" + b), 
                a.children("img").addClass("xf-li-thumb xf-li-thumb-" + b);
            }), // Inside the A, wrap all contents except the icon, count-bubble and the thumbnail
            // in one .xf-btn-text div.
            d.each(function() {
                var a = $(this);
                a.append($("<div class=xf-btn-text></div>").append(a.children().not(".xf-icon, .xf-count-bubble, .xf-li-thumb")));
            }), // To all H1-h6 elements inside the A add xf-li-header class
            c.find("h1, h2, h3, h4, h5, h6").addClass("xf-li-header"), // To all P elements inside the A add xf-li-desc class
            c.find("p").addClass("xf-li-desc"), // Wrap LI.xf-li-static inside with DIV.xf-li-wrap
            c.filter(".xf-li-static").each(function() {
                $(this).wrapInner("<div class=xf-li-wrap />");
            });
        }
    };
}.call(this, window, Backbone), function() {
    /**
     Generates basic popup container
     @return $
     @private
     */
    XF.UIElements.createPopup = function() {
        /*
         <div class="xf-dialog "><div class="xf-dialog-content"></div></div>
         */
        var a = $('<div class="xf-dialog "><div class="xf-dialog-content"></div></div>');
        return a;
    }, /**
     Shorthand to show dialogs
     @param headerText String to show in dialog header
     @param messageText String to show in dialog body
     @param buttons Array of buttons to show ($ objects or objects with button description for createButton() method)
     */
    XF.UIElements.showDialog = function(a, b, c) {
        var d = XF.UIElements.createDialog(a, b, c);
        XF.UIElements.showPopup(d);
    }, /**
     Attaches popup (dialog/notification/etc.) to the page
     @param jqPopup $ object representing popup
     */
    XF.UIElements.showPopup = function(a) {
        XF.Device.getViewport().append(a);
    }, /**
     Detaches popup (dialog/notification/etc.) from the page
     @param jqPopup $ object representing popup
     */
    XF.UIElements.hidePopup = function(a) {
        a.detach();
    }, /**
     Generates a dialog with header, message and buttons
     @param headerText String to show in dialog header
     @param messageText String to show in dialog body
     @param buttons Array of buttons to show ($ objects or objects with button description for createButton() method)
     @param modal Boolean Flag which indicates whether the dialog is modal
     @return $ Dialog object
     */
    XF.UIElements.createDialog = function(a, b, c) {
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
        var d = XF.UIElements.createPopup();
        d.find(".xf-dialog-content").append($("<div></div>").addClass("xf-dialog-box").append($("<div></div>").addClass("xf-dialog-box-header").append($("<h3></h3>").html(a))).append($("<div></div>").addClass("xf-dialog-box-content").html(b)).append($("<div></div>").addClass("xf-dialog-box-footer clearfix")));
        var e = d.find(".xf-dialog-box-footer");
        if (c || (c = [ {
            text: "OK",
            handler: function() {
                XF.UIElements.hidePopup(d);
            }
        } ]), c) {
            var f, g = c.length;
            _.each(c, function(a) {
                f = a instanceof $ ? a : XF.UIElements.createButton(a), e.append($("<div></div>").addClass("xf-grid-unit xf-grid-unit-1of" + g).append(f));
            });
        }
        return XF.UIElements.dialog = d, d;
    }, /**
     Generates a notification with text and icon
     @param messageText String to show in dialog body
     @param iconName Icon name (optional)
     @return $ Notification object
     */
    XF.UIElements.createNotification = function(a, b) {
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
        var c = XF.UIElements.createPopup().addClass("xf-dialog-notification");
        return c.find(".xf-dialog-content").append($("<div></div>").addClass("xf-notification").append($("<div></div>").addClass("xf-notification-wrap").append($("<div></div>").addClass("xf-notification-text").html(a)))), 
        b && "" != b && c.find(".xf-notification-wrap").prepend($("<div></div>").addClass("xf-notification-icon").append($("<span></span>").addClass("xf-icon xf-icon-xl xf-icon-" + b))), 
        c;
    }, /**
     Stores loading notification object
     @type $
     @private
     */
    XF.UIElements.loadingNotification = null, /**
     Stores dialog object
     @type $
     @private
     */
    XF.UIElements.dialog = null, /**
     Saves passed popup as default loading notification
     @param jqPopup $ object representing popup
     */
    XF.UIElements.setLoadingNotification = function(a) {
        XF.UIElements.loadingNotification = a;
    }, /**
     Shows loading notification (and generates new if params are passed)
     @param messageText String to show in loading notification
     @param icon Icon name (optional)
     */
    XF.UIElements.showLoading = function(a, b) {
        (a || b) && (XF.UIElements.loadingNotification && XF.UIElements.hideLoading(), XF.UIElements.setLoadingNotification(XF.UIElements.createNotification(a, b))), 
        XF.UIElements.loadingNotification || XF.UIElements.setLoadingNotification(XF.UIElements.createNotification("Loading...")), 
        XF.UIElements.showPopup(XF.UIElements.loadingNotification);
    }, /**
     Hides loading notification
     */
    XF.UIElements.hideLoading = function() {
        XF.UIElements.loadingNotification && XF.UIElements.hidePopup(XF.UIElements.loadingNotification);
    }, /**
     Hides Dialog
     */
    XF.UIElements.hideDialog = function() {
        XF.UIElements.dialog && XF.UIElements.hidePopup(XF.UIElements.dialog);
    };
}.call(this, window, Backbone), function() {
    XF.UIElements.enhancementList.scrollable = {
        selector: "[data-scrollable=true]",
        enhanceMethod: "enhanceScrollable"
    }, /**
     Adds scrolling functionality
     @param scrollable DOM Object
     @private
     */
    XF.UIElements.enhanceScrollable = function(a) {
        var b = $(a);
        if (a && !(!b instanceof $) && "true" != b.attr("data-skip-enhance")) {
            b.attr({
                "data-skip-enhance": !0
            });
            var c = b.children();
            b.append($("<div></div>").addClass("xf-scrollable-content").append(c));
            var d = b.attr("id");
            d && "" != d || (d = "xf_scrollable_" + new Date().getTime(), b.attr({
                id: d
            }));
            var e = b.data("iscroll", new iScroll(d)), f = !1, g = function() {
                f && (f = !1, e.data("iscroll").refresh(), i());
            }, h = function() {
                $.contains($("#" + d)[0], this) && (f = !0, setTimeout(g, 100));
            }, i = function() {
                $("#" + d + " *").bind("detach", h).bind("hide", h).bind("show", h).bind("append", h).bind("prepend", h).bind("html", h).bind("resize", h);
            };
            i();
        }
    };
}.call(this, window, Backbone), function() {
    XF.UIElements.enhancementList.textinput = {
        selector: "INPUT[type=text], INPUT[type=search], INPUT[type=tel], INPUT[type=url], INPUT[type=email], INPUT[type=password], INPUT[type=datetime], INPUT[type=date], INPUT[type=month], INPUT[type=week], INPUT[type=time], INPUT[type=datetime-local], INPUT[type=number], INPUT[type=color], TEXTAREA, INPUT[type=range], INPUT[type=search]",
        enhanceMethod: "enhanceTextInput"
    }, /**
     Enhances text input view
     @param textInput DOM Object
     @private
     */
    XF.UIElements.enhanceTextInput = function(a) {
        var b = $(a);
        if (a && !(!b instanceof $) && "true" != b.attr("data-skip-enhance")) {
            b.attr({
                "data-skip-enhance": !0
            }), // For inputs of types:
            // 	text, search, tel, url, email, password, datetime, date, month,
            // 	week, time, datetime-local, number, color and also for TEXTAREA element
            // 	add class "xf-input-text".
            b.addClass("xf-input-text");
            var c = "INPUT" == a.nodeName, d = b.attr("type");
            // For inputs of types "range" and "search" change type to "text".
            if ("search" == d) {
                var e = $('<input type="text"/>'), f = {};
                _.each(a.attributes, function(a) {
                    "type" != a.name && (f[a.name] = a.value);
                }), e.attr(f), b.outerHtml(e), b = e, a = e[0];
            } else if ("number" == d || "range" == d) {
                var g = b.attr("min"), h = b.attr("max"), i = parseFloat(b.attr("value")), j = parseFloat(b.attr("step")) || 1, e = $('<input type="text"/>'), f = {};
                _.each(a.attributes, function(a) {
                    "type" != a.name && (f[a.name] = a.value);
                }), e.attr(f), e.attr({
                    "data-skip-enhance": !0
                });
                var k = $("<div></div>").addClass("xf-input-number");
                k.append($('<button type="button"></button>').addClass("xf-input-number-control xf-input-number-control-decrease").attr({
                    "data-skip-enhance": !0
                }).append($("<span></span>").addClass("xf-icon xf-icon-big xf-icon-minus-circled"))), 
                k.append(e), k.append($('<button type="button"></button>').addClass("xf-input-number-control xf-input-number-control-increase").attr({
                    "data-skip-enhance": !0
                }).append($("<span></span>").addClass("xf-icon xf-icon-big xf-icon-plus-circled")));
                var l = null;
                if ("number" == d) b.outerHtml(k), b = k, a = k[0]; else if ("range" == d && (/*
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
                l = $("<div></div>").addClass("xf-range"), l.append(k), (g || 0 === g) && (h || 0 === h))) {
                    g = parseFloat(g), h = parseFloat(h);
                    var m = 100 * (i - g) / (h - g);
                    l.append($("<div></div>").addClass("xf-input-range").append($("<div></div>").addClass("xf-range-wrap").append($("<div></div>").addClass("xf-input-range-min").html(g)).append($("<div></div>").addClass("xf-input-range-slider").append($("<div></div>").addClass("xf-input-range-track").append($("<div></div>").addClass("xf-input-range-value").css({
                        width: "" + m + "%"
                    }).append($("<div></div>").addClass("xf-input-range-control").attr({
                        tabindex: "0"
                    }).append($("<div></div>").addClass("xf-input-range-thumb").attr({
                        title: "" + i
                    }).css({
                        left: "100%"
                    })))))).append($("<div></div>").addClass("xf-input-range-max").html(h)))).append($("<div></div>").addClass("xf-slider")), 
                    b.outerHtml(l), b = l, a = l[0];
                }
                var n = function(a) {
                    var b = a % j, c = a - b;
                    if (b > j / 2 && (c += j), a = c, (h || 0 === h) && a > h && (a = h), (g || 0 === g) && g > a && (a = g), 
                    i = a, e.attr({
                        value: a
                    }), l) {
                        l.find("div.xf-input-range-thumb").attr({
                            title: a
                        });
                        var d = 100 * (a - g) / (h - g);
                        l.find("div.xf-input-range-value").css({
                            width: "" + d + "%"
                        });
                    }
                }, o = function() {
                    var a = parseFloat(e.attr("value"));
                    a += j, n(a);
                }, p = function() {
                    var a = parseFloat(e.attr("value"));
                    a -= j, n(a);
                };
                // initialing number stepper buttons (-) & (+) click handlers
                k.find("button.xf-input-number-control-decrease").click(p), k.find("button.xf-input-number-control-increase").click(o);
                var q, r = e.attr("value"), s = function() {
                    q = e.attr("value"), // prevent multiple recalculations in case when several events where triggered
                    r != q && (q = parseFloat(q), isNaN(q) && (q = g), r = q, n(q));
                };
                if (e.change(s).focus(s).focusout(s), l) {
                    var t, u, v, w, x, y = void 0, z = function(a) {
                        return y || (y = l.find("div.xf-input-range-track")[0].clientWidth), a / y * (h - g);
                    }, A = function(a) {
                        return z(a) + g;
                    }, B = function() {
                        v = event.pageX || event.clientX || layerX || event.screenX, t = i, $(document).bind("mouseup", D), 
                        $(document).bind("mousemove", C);
                    }, C = function() {
                        w = event.pageX || event.clientX || layerX || event.screenX, x = w - v, u = z(x), 
                        v = w, t += u, n(t);
                    }, D = function() {
                        $(document).unbind("mouseup", D), $(document).unbind("mousemove", C);
                    }, E = function() {
                        $(document).bind("keydown", F);
                    }, F = function(a) {
                        switch (a.keyCode) {
                          // PG Up
                            case 33:
                            n(i + 3 * j);
                            break;

                          // PG Down
                            case 34:
                            n(i - 3 * j);
                            break;

                          // End
                            case 35:
                            n(h);
                            break;

                          // Home
                            case 36:
                            n(g);
                            break;

                          // arrow up
                            case 38:
                          // arrow right
                            case 39:
                            n(i + j);
                            break;

                          // arrow left
                            case 37:
                          // arrow down
                            case 40:
                            n(i - j);
                        }
                    }, G = function() {
                        $(document).unbind("keydown", F);
                    };
                    // initialing slider thumb dragging handler
                    l.find("div.xf-input-range-thumb").bind("mousedown", B), // initialing arrow keys press handling
                    l.find("div.xf-input-range-control").bind("focus", E).bind("focusout", G);
                    var H = function(a) {
                        // skipping events fired by thumb dragging
                        a.target != l.find("div.xf-input-range-thumb")[0] && n(A(a.offsetX));
                    };
                    // initialing track click handler
                    l.find("div.xf-input-range-track").bind("click", H);
                }
            }
            // Some Text-based inputs (text, search, tel, url, email, password, datetime, date, month,
            // week, time, datetime-local, color) with data-appearance="split" attribute
            // are parsed specifically:
            var I = !1;
            if ("split" == b.attr("data-appearance") && c) {
                var J = [ "text", "search", "tel", "url", "email", "password", "datetime", "date", "month", "week", "time", "datetime-local", "color" ];
                _.each(J, function(a) {
                    d == a && (I = !0);
                });
            }
            var K = b.attr("id"), L = K.length ? $("label[for=" + K + "]") : [];
            // If the input doesn't have an associated label, quit
            if (L.length) if (I) {
                // Add class xf-input-split-input to the input
                b.removeClass("xf-input-text").addClass("xf-input-split-input"), // Add class xf-input-split-label to the label
                L.addClass("xf-input-split-label");
                // Wrap both in div.xf-input-split
                var M = $("<div></div>").addClass("xf-input-split");
                // Wrap the label in div.xf-grid-unit.xf-input-split-part1
                M.append($("<div></div>").addClass("xf-grid-unit xf-input-split-part1").append(L)), 
                // Wrap the input in div.xf-grid-unit.xf-input-split-part2
                M.append($("<div></div>").addClass("xf-grid-unit xf-input-split-part2").append(b.clone())), 
                b.outerHtml(M), b = M, a = M[0];
            } else // If inputs of the named types and textarea have a label associated to them (with "for" attribute
            // with a value equal to input "id" attribute), the label is assigned a class name of "xf-label"
            L.addClass("xf-label");
        }
    };
}.call(this, window, Backbone);