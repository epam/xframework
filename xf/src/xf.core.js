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
        XF.router.navigate(fragment, {trigger: true});
    };

    XF.on('navigate', XF.navigate);

    var compEventSplitter = /\:/;

    XF.on('all', function (eventName) {
        console.log('XF:all - ', eventName);

        if (!compEventSplitter.test(eventName)) {
            return;
        }

        var parts = eventName.split(compEventSplitter);

        if (parts[0] !== 'component' && parts.length < 3) {
            return;
        }

        var compID = parts[1];

        XF._defferedCompEvents || (XF._defferedCompEvents = {});

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

    onComponentRender = function (compID) {
        var compObj = $(XF.getComponentByID(compID).selector());

        if (_.has(XF, 'pages')) {
            if (!XF.pages.status.started) {
                XF.trigger('pages:start', compObj);
            }
        }
    };


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     @function
     @public
     @param {Object} options
     @param {Object} options.settings User-defined settings which would override {@link XF.settings}
     @param {Object} options.router Options required for {@link XF.router}
     @param {Object} options.router.routes list of routes for {@link XF.router}
     @param {Object} options.router.handlers list of route handlers for {@link XF.router}
     @description Launches the app with specified options
     */
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
        bindHideShowListeners();

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


    /**
     Creates {@link XF.router}
     @memberOf XF
     @param {Object} routes list of routes for {@link XF.router}
     @param {Object} handlers list of route handlers for {@link XF.router}
     @private
     */

    var createRouter = function(options) {
        if(XF.router) {
            throw 'XF.createRouter can be called only ONCE!';
        } else {
            XF.router = new (XF.Router.extend(options))();
        }
    };


    /**
     Adds listeners to each 'a' tag with 'data-href' attribute on a page - all the clicks should bw delegated to {@link XF.router}
     @memberOf XF
     @private
     */
    var placeAnchorHooks = function() {
        $('body').on('tap click', '[data-href]', function() {
            var animationType = $(this).data('animation') || null;
            if (animationType) {
                XF.trigger('pages:animation:next', animationType);
            }
            XF.router.navigate( $(this).data('href'), {trigger: true} );
        });
    };

    /**
     Loads component definitions for each visible component placeholder found
     @memberOf XF
     @param {Object} DOMObject Base object to look for components
     @private
     */
    var loadChildComponents = XF.loadChildComponents = function(DOMObject) {
        console.log('XF :: loadChildComponents', DOMObject);

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

    /**
     Loads component definition and creates its instance
     @memberOf XF
     @param {String} compID Data-id property value of a component instance
     @param {String} compName Name of the Component to be loaded
     @private
     */
    var loadChildComponent = function(compID, compName) {
        getComponent(compName, function(compDef) {
            console.log('ADDING', compID);
            console.log(components);
            console.log(components[compID]);
            if(!components[compID] && _.isFunction(compDef)) {
                console.log(compDef);
                var compInst = new compDef(compName, compID);
                console.log('CREATED', compInst);
                console.log('XF :: loadChildComponent - created : ' + compID);
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
    var bindHideShowListeners = function() {
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
                console.log('script loaded');
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
            console.log('REGISTERING', compName);
            compStatus = XF.registerComponent(compName, XF.settings.property('componentUrl')(compName));
        }
        if(compStatus.loaded) {
            console.log('STATUS LOADED', compName);
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
        console.log(compName, compStatus);
        if(compStatus) {
            return compStatus;
        }
        registeredComponents[compName] = new ComponentStatus(compSrc);
        return registeredComponents[compName];
    };

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
            console.log(parts[i]);
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


    var getLastNamespacePart = function (ns) {
        return ns.substr(ns.lastIndexOf(".") + 1);
    };

    /**
     Defines component class and calls registered callbacks if necessary
     @param {String} compName Component name
     @param {Object} compDef Component definition
     @public
     */

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

    XF.getRegisteredComponents = function () {
        return registeredComponents;
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





