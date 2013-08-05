    /**
     Implements data workaround flow.
     @class
     @static
     @augments XF.Events
     @param {Object} attributes list of predefined attributes
     */
    XF.Model = BB.Model.extend({
        /**
         Would be dispatched once when the Component inited
         @name XF.Model#init
         @event
         */

        /**
         Would be dispatched once when the Component constructed
         @name XF.Model#construct
         @event
         */

        /**
         Would be dispatched after each data update
         @name XF.Model#dataLoaded
         @event
         */

        /**
         Would be dispatched after each update
         @name XF.Model#refresh
         @event
         */

        /**
         Link to the {@link XF.Component} instance
         @type XF.Component
         */
        component: null,

        /**
         Object that contains plan data recieved from server
         @type Object
         */
        rawData: null,

        /**
         Data source URL
         @type String
         */
        dataURL : null,

        /**
         Settings for $ AJAX data request
         @type String
         */
        dataRequestSettings : null,

        /**
         Flag that determines whether the data should not be loaded at all
         @default false
         @type Boolean
         */
        isEmptyData : false,

        /**
         Flag that determines whether the data should be loaded once
         @default false
         @type Boolean
         */
        isStaticData : false,

        /**
         Flag that determines whether the data type is string (otherwise JSON)
         @default false
         @type Boolean
         */
        isStringData : false,

        /**
         Interval in milliseconds defining how often data should be retrived from the server; use '0' to turn autoUpdate off
         @default 0
         @type Number
         */
        autoUpdateInterval: 0,

        /**
         Flag that determines whether the data should be updateing (with autoUpdate) even if the component is currentyl hidden
         @default false
         @type Boolean
         */
        updateInBackground: false,

        /**
         Flag that determines whether the data should be updated each time the component becomes visible
         @default false
         @type Boolean
         */
        updateOnShow: false,

        /**
         Object that contains default values for attributes - should be overriden to be used
         @type Object
         */
        defaults : null,

        /**
         Constructs model instance
         @private
         */
        construct : function() {
            this.initialize();
            this.trigger('init');
            if(this.autoUpdateInterval > 0) {
                var autoUpdateFunc = _.bind(function() {
                    if($(this.component.selector()).is(':visible')) {
                        this.refresh();
                    } else if(this.updateInBackground) {
                        this.refresh();
                    }
                }, this);
                setInterval(autoUpdateFunc, this.autoUpdateInterval);
            }
            if(this.updateOnShow) {
                $(this.component.selector()).bind('show', _.bind(this.refresh, this));
            }
            this.trigger('construct');
        },

        /**
         Refreshes data from backend if necessary
         @private
         */
        refresh : function() {
            /** ignore */
            var dataLoaded = function() {
                this.unbind('dataLoaded', dataLoaded);
                var renderVersion = this.component.view.renderVersion;
                this.afterLoadData();

                //TODO: uncomment this and try to find why 'refresh' not working for menu component
                //if(this.component.view.renderVersion == renderVersion) {
                this.trigger('refresh');
                //}
            };

            this.bind('dataLoaded', dataLoaded);

            this.beforeLoadData();
            this.loadData();
        },

        /**
         Generates data url - override if custom format is required and {@link XF.Settings} has no appropriate way to handle it
         @private
         */
        getDataURL : function() {
            if(!this.dataURL) {
                if(!this.component) {
                    throw 'XF.Model "component" linkage lost';
                }
                this.dataURL = _.bind(XF.Settings.property('dataUrlFormatter'), this)(this.component.name);
            }
            return this.dataURL;
        },

        /**
         Returns settings for AddressBar AJAX data request or empty object is it is not set - override to add extra functionality
         @private
         */
        getDataRequestSettings : function() {
            return this.dataRequestSettings || {};
        },

        /**
         HOOK: override to add logic before data load
         */
        beforeLoadData : function() {},

        /**
         Loads data
         @private
         */
        loadData : function() {

            if(!this.isEmptyData && (!this.rawData || !this.isStaticData || this.autoUpdate > 0)) {

                var $this = this;
                var url = this.getDataURL();

                $.ajax(
                    _.extend(this.getDataRequestSettings(), {
                        url: url,
                        complete : function(jqXHR, textStatus) {
                            if(!$this.component) {
                                throw 'XF.Model "component" linkage lost';
                            }
                            if(textStatus == 'success') {
                                if($this.isStringData) {
                                    $this.rawData = jqXHR.responseText;
                                } else {
                                    $this.rawData = JSON.parse(jqXHR.responseText);
                                }
                            } else {
                                if($this.isStringData) {
                                    $this.rawData = {};
                                } else {
                                    $this.rawData = '';
                                }
                            }
                            $this.trigger('dataLoaded');
                        }
                    })
                );

            } else {
                this.trigger('dataLoaded');
            }
        },

        /**
         HOOK: override to add logic after data load
         */
        afterLoadData : function() {}

    });