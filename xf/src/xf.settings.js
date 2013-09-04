    /**
     Instance of {@link XF.SettingsClass}
     @static
     @type {Object}
     */
    XF.Settings = {
        /**
         Contains name-value pairs of all application settings
         @name XF.Settings#options
         @type Object
         @private
         */
        options: /** @lends XF.Settings#options */ {

            /**
             Used for {@link XF.Cache} clearance when new version released
             @memberOf XF.Settings.prototype
             @default '1.0.0'
             @type String
             */
            applicationVersion: '1.0.0',
            /**
             Deactivates cache usage for the whole app (usefull for developement)
             @memberOf XF.Settings.prototype
             @default false
             @type String
             */
            noCache: false,
            /**
             Used by default Component URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default ''
             @type String
             */
            componentUrlPrefix: '',
            /**
             Used by default Component URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default '.js'
             @type String
             */
            componentUrlPostfix: '.js',
            /**
             Default Component URL formatter: prefix + component_name + postfix
             @param {String} compName Component name
             @memberOf XF.Settings.prototype
             @returns {String} Component URL
             @type Function
             */
            componentUrlFormatter: function(compName) {
                return XF.Settings.property('componentUrlPrefix') + compName + XF.Settings.property('componentUrlPostfix');
            },

            /**
             Used by default Template URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default ''
             @type String
             */
            templateUrlPrefix: 'tmpl/',
            /**
             Used by default Template URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default '.tmpl'
             @type String
             */
            templateUrlPostfix: '.tmpl',


            /**
             Used by default Data URL formatter: prefix + component_name + postfix
             @memberOf XF.Settings.prototype
             @default ''
             @type String
             */
            dataUrlPrefix: '',


            ajaxSettings: {
                      // TODO: fill in ajaxSettings
            }
        },

        /**
         Gets property value by name
         @param {String} propName
         */
        getProperty: function(propName) {
            return this.options[propName];
        },
        /**
         Sets a new value for one property with
         @param {String} propName
         @param {Object} value new value of the property
         */
        setProperty: function(propName, value) {
            this.options[propName] = value;
        },
        /**
         Gets or sets property value (depending on whether the 'value' parameter was passed or not)
         @param {String} propName
         @param {Object} [value] new value of the property
         */
        property: function(propName, value) {
            if(value === undefined) {
                return this.getProperty(propName);
            } else {
                this.setProperty(propName, value);
            }
        }
    };