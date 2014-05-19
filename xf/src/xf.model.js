define([
    './xf.core',
    'underscore',
    'backbone',
    './dom/dom',
    './xf.settings'
], function(XF, _, BB, Dom) {

    XF.Model = BB.Model.extend({

        _initProperties: function() {
            this.status = {
                loaded: false,
                loading: false,
                loadingFailed: false
            };

            if (!_.has(this, 'root')) {
                this.root = null;
            }
            if (typeof this['ajaxSettings'] == 'undefined') {
                this.ajaxSettings = null;
            }
            this.component = null;
        },

        _bindListeners: function() {
            this.on('refresh', this.refresh, this);
        },

        constructor: function(attributes, options) {
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
                Dom(this.component.selector()).bind('show', _.bind(this.refresh, this));
            }

            this.ajaxSettings = this.ajaxSettings || XF.settings.property('ajaxSettings');

            if (_.has(this.ajaxSettings, 'success') && _.isFunction(this.ajaxSettings.success)) {
                var onSuccess = this.ajaxSettings.success,
                    onDataLoaded = _.bind(this._onDataLoaded, this);
                this.ajaxSettings.success = function() {
                    onDataLoaded();
                    onSuccess();
                };
            } else {
                this.ajaxSettings.success = _.bind(this._onDataLoaded, this);
            }

            BB.Model.apply(this, arguments);
        },

        /**
     Constructs model instance
     @private
     */
        initialize: function() {

        },

        construct: function() {

        },

        /**
     Refreshes data from backend if necessary
     @private
     */
        refresh: function() {
            this.status.loaded = false;
            this.status.loading = true;

            this.fetch(this.ajaxSettings);
        },

        fetch: function(options) {
            options = _.defaults(options || {}, this.ajaxSettings);

            return Backbone.Collection.prototype.fetch.call(this, options);
        },

        _onDataLoaded: function() {
            this.status.loaded = true;
            this.status.loading = false;

            this.trigger('fetched');
        }

    });

    return XF;
});