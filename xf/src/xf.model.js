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
        ajaxSettings : null,

        /**
         Flag that determines whether the data should not be loaded at all
         @default false
         @type Boolean
         */
        autoload : true,

        /**
         Flag that determines whether the data should be updated each time the component becomes visible
         @default false
         @type Boolean
         */
        updateOnShow: false,

        /**
         Constructs model instance
         @private
         */
        construct : function() {
            this.initialize();
            this.trigger('init');
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
                this.afterLoadData();


                this.trigger('refresh');
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

            if(!this.isEmptyData && !this.isStaticData) {

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