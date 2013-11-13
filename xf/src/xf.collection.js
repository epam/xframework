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

        if (options.component) {
            this.component = options.component;
        }
        _.omit(options, 'component');

        this.url = this.url || XF.settings.property('dataUrlPrefix').replace(/(\/$)/g, '') + '/' + this.component.name + '/';

        if (this.component.options.updateOnShow) {
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
        }else{
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