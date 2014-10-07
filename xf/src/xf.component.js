define([
    './xf.core',
    'underscore',
    'backbone'
], function(XF, _, BB) {

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

    _.extend(XF.Component.prototype, /** @lends XF.Component.prototype */ {

        /**
         Object containing has-map of component options that can be different for each instance & should be set with {@link XF.setOptionsByID}
         @type Object
         */
        defaults: {
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
        selector: function() {
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
        view: null,

        _bindListeners: function() {
            XF.on('component:' + this.id + ':refresh', this.refresh, this);
            this.listenTo(this, 'refresh', this.refresh);
        },

        /**
         Constructs component instance
         @private
         */

        initialize: function() {

        },

        construct: function() {

        },

        _constructor: function() {

            if (this.Collection) {
                this.collection = new this.Collection({}, {
                    component: this
                });
                this.collection.construct();
            } else if (this.Model) {
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
                } else if (this.model) {
                    params.model = this.model;
                }

                this.view = new this.View(params);
                this.view.construct();
            }

            this._bindListeners();

            this.construct();
            XF.trigger('component:' + this.id + ':constructed');

            // TODO: decide where to place it
            this.initialize();

            if (this.view) {
                this.view.listenToOnce(this.view, 'loaded', this.view.refresh);
                this.view.on('rendered', _.bind(function() {
                    XF.trigger('component:' + this.id + ':rendered');
                }, this));
            }

            if (this.collection && this.options.autoload) {
                this.collection.refresh();
            } else if (this.model && this.options.autoload) {
                this.model.refresh();
            } else if (this.view) {
                this.view.refresh();
            }
        },

        _removeChildComponents: function() {
            if (this.view) {
                var ids = [];
                this.view.$el.find('[data-component]').each(function() {
                    ids.push($(this).data('id'));
                });
                XF._removeComponents(ids);
            }
        },


        /**
         Refreshes data and then rerenders view
         @private
         */
        refresh: function() {
            if (this.collection && !this.collection.status.loading) {
                this.collection.refresh();
            } else if (this.model && !this.model.status.loading) {
                this.model.refresh();
            } else if (this.view && !this.view.status.loading) {
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

    return XF;
});