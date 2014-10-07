define([
    'underscore',
    'backbone',
    './dom/dom'
], function(_, BB, Dom) {

    // Namespaceolds visible functionality of the framework
    var XF = window.XF = window.XF || {};

    // Linking Backbone.Events to XF.Events
    // And making XF a global event bus
    XF.Events = BB.Events;
    _.extend(XF, XF.Events);

    // XF.navigate is a syntax sugar for navigating between routes with event dispatching
    // Needed to make pages switching automatically
    XF.navigate = function(fragment) {
        XF.router.navigate(fragment, {
            trigger: true
        });
    };

    // Event bidnings for global XF commands
    XF.on('navigate', XF.navigate);


    // Listening to all global XF events to push them to necessary component if it's constructed
    XF.on('all', function(eventName) {
        var compEventSplitter = /:/,
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

            events.push(arguments);
            XF.on('component:' + compID + ':constructed', function() {
                _.each(events, function(e) {
                    XF.trigger.apply(XF, e);
                });
            });
        }

    });

    // Searching for pages inside every component
    // Pages should be on the one level and can be started only once
    var onComponentRender = function(compID) {
        var compObj = Dom(XF.getComponentByID(compID).selector());

        if (_.has(XF, 'pages')) {
            if (!XF.pages.status.started) {
                XF.trigger('pages:start', compObj);
            }
        }
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    // Loads component definitions for each visible component placeholder found
    // Searches inside DOMObject passed
    // TODO(Jauhen): now DOM Element is passed, need to pass direct jQuery/Dom object.
    XF.loadChildComponents = function(DOMObject) {
        if (Dom(DOMObject).attr('data-component')) {
            if (Dom(DOMObject).is(':visible') && (!Dom(DOMObject).attr('data-device-type') || Dom(DOMObject).attr('data-device-type') == XF.device.type.name)) {
                var compID = Dom(DOMObject).attr('data-id');
                var compName = Dom(DOMObject).attr('data-component');
                loadChildComponent(compID, compName);
            }
        }

        Dom(DOMObject).find('[data-component][data-cache=true],[data-component]:visible').each(function(ind, obj) {
            if (!Dom(obj).attr('data-device-type') || Dom(obj).attr('data-device-type') == XF.device.type.name) {
                var compID = Dom(obj).attr('data-id');
                var compName = Dom(obj).attr('data-component');
                if (compID && compName) {
                    loadChildComponent(compID, compName);
                }
            }
        });
    };


    // Loads component definition and creates its instance
    var loadChildComponent = function(compID, compName) {
        XF.define([XF.settings.property('componentUrl')(compName)], function(compDef) {
            if (!components[compID] && _.isFunction(compDef)) {
                var compInst = new compDef(compName, compID);
                components[compID] = compInst;
                compInst._constructor();
            }
        });
    };

    // Stores instances of XF.Component and its subclasses
    var components = {};

    // Returns component instance by its id
    XF.getComponentByID = function(compID) {
        return components[compID];
    };

    // Removes component instances with ids in array `ids` from `components`
    XF._removeComponents = function(ids) {
        if (!_.isEmpty(ids)) {
            _.each(ids, function(id) {
                components = _.omit(components, id);
            });
        }
    };


    /* DEFINE */


    var registeredModules = {};
    var waitingModules = {};
    var baseElement = document.getElementsByTagName('base')[0];
    var head = document.getElementsByTagName('head')[0];

    var checkModuleLoaded = function() {

        _.each(waitingModules, function(module, ns) {

            var name = module[0],
                dependencies = module[1],
                exec = module[2],
                args = [];

            _.each(dependencies, function(dependency, n) {
                var depName = getModuleNameFromFile(dependency);
                if (registeredModules[depName] !== undefined) {
                    args.push(registeredModules[depName]);
                }
            });

            if (dependencies.length === args.length || dependencies.length === 0) {

                if (name !== null) {
                    XF.log('core: executing module "' + name + '"');
                    delete waitingModules[name];
                    registeredModules[name] = exec.apply(this, args);
                }

            }
        });
    };

    var getModuleNameFromFile = function(file) {
        var moduleName = file.split(/\//);
        return moduleName[moduleName.length - 1].replace('.js', '');
    };

    var parseFiles = function(file) {

        var moduleName = getModuleNameFromFile(file);
        var moduleFile = file.push ? file[1] : file;

        //Don't load module already loaded
        if (registeredModules[moduleName]) {
            checkModuleLoaded();
            return;
        }

        if (!/\.js/.test(moduleFile) && !/^http/.test(moduleFile)) {
            moduleFile = moduleFile.replace('.', '/');
            moduleFile = moduleFile + '.js';
        }

        create(moduleName, moduleFile);
    };

    var onLoad = function(event) {
        var target = (event.currentTarget || event.srcElement),
            name;

        //Check if the script is realy loaded and executed ! (Fuck you IE with your "Loaded but not realy, wait to be completed")
        if (event.type !== "load" && target.readyState != "complete") {
            return;
        }

        name = target.getAttribute('data-module');
        target.setAttribute('data-loaded', true);

        // Old browser need to use the detachEvent method
        if (target.attachEvent) {
            target.detachEvent('onreadystatechange', onLoad);
        } else {
            target.removeEventListener('load', onLoad);
        }

        checkModuleLoaded();
    };

    var attachEvents = function(script) {
        if (script.attachEvent) {
            script.attachEvent('onreadystatechange', onLoad);
        } else {
            script.addEventListener('load', onLoad, false);
        }
    };

    var checkScripts = function(moduleName) {
        var script = false;

        _.each(document.getElementsByTagName('script'), function(elem) {
            if (elem.getAttribute('data-module') && elem.getAttribute('data-module') === moduleName) {
                script = elem;
                return false;
            }
        });

        return script;
    };

    var create = function(moduleName, moduleFile) {
        //SetTimeout prevent the "OMG RUN, CREATE THE SCRIPT ELEMENT, YOU FOOL" browser rush
        setTimeout(function() {
            var script = checkScripts(moduleName);

            if (script) {
                return;
            }

            script = document.createElement('script');

            script.async = true;
            script.type = "text/javascript";
            script.src = moduleFile;
            script.setAttribute('data-module', moduleName);
            script.setAttribute('data-loaded', false);

            if (baseElement) {
                //prevent IE 6-8 bug (script executed before appenchild execution. Yeah, that's realy SUCK)
                baseElement.parentNode.insertBefore(script, baseElement);
            } else {
                head.appendChild(script);
            }

            attachEvents(script);
        }, 0);
    };

    // Defines class and calls registered callbacks if necessary
    XF.define = XF.require = XF.defineComponent = function(ns, deps, def) {

        if (typeof ns !== "string") {
            def = deps;
            deps = ns;
            ns = XF.utils.uniqueID();
        }

        if (typeof deps !== "object") {
            def = deps;
            deps = [];
        }


        if (waitingModules[ns] === undefined) {
            waitingModules[ns] = [ns, deps, def];

            checkModuleLoaded();

            if (deps.length) {
                _.each(deps, parseFiles);
            }
        }
    };

    // Returns all registered components
    XF.getRegisteredModules = function() {
        return registeredModules;
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



    Dom.trackDomChanges('[data-component]',
        function(element) {
            XF.trigger('xf:loadChildComponents', element);
        });

    return XF;
});