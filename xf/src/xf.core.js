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
     @param {Object} options.settings User-defined settings which would override {@link XF.settings}
     @param {Object} options.router Options required for {@link XF.Router}
     @param {Object} options.router.routes list of routes for {@link XF.Router}
     @param {Object} options.router.handlers list of route handlers for {@link XF.Router}
     @description Launches the app with specified options
     */
    XF.start = function(options) {

        options = options || {};

        // initializing XF.storage
        XF.storage.init();

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
        console.log('XF :: loadChildComponents');
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
                XF.trigger('component:' + compID + ':constructed');
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
        console.log(compName, compDef);
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





