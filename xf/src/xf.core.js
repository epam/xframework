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





