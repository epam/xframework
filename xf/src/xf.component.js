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
                XF.trigger('component:' + this.id + ':constructed');
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
            var params = {
                attributes: {
                    'data-id': this.id
                }
            };
            if(!this.view || !(this.view instanceof XF.View)) {
                if(this.viewClass) {
                    this.view = new this.viewClass(params);
                    if(!(this.view instanceof XF.View)) {
                        this.view = new XF.View(params);
                    }
                } else {
                    this.view = new XF.View(params);
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