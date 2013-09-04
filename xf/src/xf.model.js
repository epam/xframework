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

    /**
     Constructs model instance
     @private
     */
    initialize : function() {
        this._bindListeners();

        if (this.component.options.updateOnShow) {
            $(this.component.selector()).bind('show', _.bind(this.refresh, this));
        }

        this.ajaxSettings = this.ajaxSettings || XF.Settings.getProperty('ajaxSettings');

        if (_.has(this.ajaxSettings, 'success') && _.isFunction(this.ajaxSettings.success)) {
            var onSuccess = this.ajaxSettings.success,
                onDataLoaded = _.bind(this.onDataLoaded, this);
            this.ajaxSettings.success = function () {
                onDataLoaded();
                onSuccess();
            };
        }else{
            this.ajaxSettings = _.bind(this.onDataLoaded, this);
        }
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

    onDataLoaded: function () {
        this.status.loaded = true;
        this.status.loading = false;

        this.trigger('fetched');
    }

});