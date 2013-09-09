XF.Model = BB.Model.extend({

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

    },

    constructor: function (attributes, options) {
        this._initProperties();
        this._bindListeners();

        if (options.component) {
            this.component = options.component;
        }
        _.omit(options, 'component');

        this.urlRoot = this.urlRoot || XF.settings.property('dataUrlPrefix').replace(/(\/$)/g, '') + '/' + this.component.name + '/';

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

        BB.Model.apply(this, arguments);
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
        this.status.loaded = true;
        this.status.loading = false;

        this.trigger('fetched');
    }

});