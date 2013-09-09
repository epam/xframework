XF.Collection = BB.Collection.extend({

    _initProperties: function () {
        this.status = {
            loaded: false,
            loading: false,
            loadingFailed: false
        };

        this.root = null;
        this.ajaxSettings = {};
        this.component = null;
    },

    _bindListeners: function () {
        //this.on('change reset sync add', this.onDataChanged, this);
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

        this.ajaxSettings = this.ajaxSettings || XF.settings.property('ajaxSettings');

        if (_.has(this.ajaxSettings, 'success') && _.isFunction(this.ajaxSettings.success)) {
            var onSuccess = this.ajaxSettings.success,
                onDataLoaded = _.bind(this._onDataLoaded, this);
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

        this.fetch(this.ajaxSettings);
    },

    _onDataLoaded: function () {
        console.log('data loaded');
        this.status.loaded = true;
        this.status.loading = false;

        this.trigger('fetched');
    }

});