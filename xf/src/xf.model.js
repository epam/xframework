XF.Model = BB.Model.extend({

    component: null,

    root: null,

    status: {
        loaded: false,
        loading: false,
        loadingFailed: false
    },

    /**
     Settings for $ AJAX data request
     @type String
     */
    ajaxSettings : null,

    _bindListeners: function () {

    },

    constructor: function (attributes, options) {

        this.component = options.component;

        this._bindListeners();


        this.urlRoot = this.urlRoot || XF.Settings.getProperty('dataUrlPrefix').replace(/(\/$)/g, '') + '/' + this.component.name + '/';

        if (this.component.options.updateOnShow) {
            $(this.component.selector()).bind('show', _.bind(this.refresh, this));
        }

        this.ajaxSettings = this.ajaxSettings || XF.Settings.getProperty('ajaxSettings');

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