define([
    './xf.core'
], function(XF) {

    /**
     {@link XF.settings}
     @static
     @type {Object}
     */
    XF.settings = {
        /**
         Used for {@link XF.storage} clearance when new version released
         @memberOf XF.settings.prototype
         @default '1.0.0'
         @type String
         */
        appVersion: '1.0.0',
        /**
         Deactivates cache usage for the whole app (usefull for developement)
         @memberOf XF.settings.prototype
         @default false
         @type String
         */
        noCache: false,
        /**
         Used by default Component URL formatter: prefix + component_name + postfix
         @memberOf XF.settings.prototype
         @default ''
         @type String
         */
        componentUrlPrefix: 'js/components/',
        /**
         Used by default Component URL formatter: prefix + component_name + postfix
         @memberOf XF.settings.prototype
         @default '.js'
         @type String
         */
        componentUrlPostfix: '.js',
        /**
         Default Component URL formatter: prefix + component_name + postfix
         @param {String} compName Component name
         @memberOf XF.settings.prototype
         @returns {String} Component URL
         @type Function
         */
        componentUrl: function(compName) {
            return XF.settings.property('componentUrlPrefix') + compName + XF.settings.property('componentUrlPostfix');
        },

        /**
         Used by default Template URL formatter: prefix + component_name + postfix
         @memberOf XF.settings.prototype
         @default ''
         @type String
         */
        templateUrlPrefix: 'tmpl/',
        /**
         Used by default Template URL formatter: prefix + component_name + postfix
         @memberOf XF.settings.prototype
         @default '.tmpl'
         @type String
         */
        templateUrlPostfix: '.tmpl',

        templateCollectionName: 'xf-templates',
        templateCollectionSeparator: ',',

        /**
         Used by default Data URL formatter: prefix + component_name + postfix
         @memberOf XF.settings.prototype
         @default ''
         @type String
         */
        dataUrlPrefix: '',


        ajaxSettings: {

        },

        /**
         Gets or sets property value (depending on whether the 'value' parameter was passed or not)
         @param {String} propName
         @param {Object} [value] new value of the property
         */
        property: function(propName, value) {
            if(value === undefined) {
                return this[propName];
            } else {
                this[propName] = value;
            }
        }
    };

    return XF;
});
