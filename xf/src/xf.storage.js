define([
    './xf.core',
    './xf.settings'
], function(XF) {

    /**
     Instance of {@link XF.CacheClass}
     @static
     @private
     @type {Object}
     */
    XF.storage = {

        /**
         Local reference to the localStorage
         @type {Object}
         */
        storage: null,

        /**
         Indicates whether accessibility test for localStorage was passed at launch time
         @type {Object}
         */
        isAvailable: false,

        /**
         Runs accessibility test for localStorage & clears it if the applicationVersion is too old
         */
        init: function() {

            this.storage = window.localStorage;

            // checking availability
            try {
                this.storage.setItem('check', 'check');
                this.storage.removeItem('check');
                this.isAvailable = true;
            } catch (e) {
                this.isAvailable = false;
            }

            // clearing localStorage if stored version is different from current
            var appVersion = this.get('appVersion');
            if (XF.settings.property('noCache')) {
                // cache is disable for the whole site manualy
                XF.log('storage: cache is disabled for the whole app manually — clearing storage');
                this.set('appVersion', XF.settings.property('appVersion'));

                this._clearTemplateCache();
            } else if (appVersion && appVersion == XF.settings.property('appVersion')) {
                // same version is cached - useing it as much as possible
                XF.log('storage: same app version is cached');
            } else {
                // wrong or no version cached - clearing storage
                XF.log('storage: no version cached — clearing stored templates');

                this._clearTemplateCache();

                this.set('appVersion', XF.settings.property('appVersion'));
            }
        },

        _clearTemplateCache: function() {
            var cName = XF.settings.property('templateCollectionName'),
                cSeparator = XF.settings.property('templateCollectionSeparator'),
                collection = XF.storage.get() || '';

            collection = (!_.isEmpty(collection)) ? collection.split(cSeparator) : [];

            _.each(collection, _.bind(function(i) {
                this.remove(i);
            }, this));

            this.set(cName, '');
        },

        /**
         Returns a value stored in cache under appropriate key
         @param {String} key
         @return {String}
         */
        get: function(key) {
            var result;
            if (this.isAvailable) {
                try {
                    result = this.storage.getItem(key);
                } catch (e) {
                    result = null;
                }
            } else {
                result = null;
            }
            return result;
        },

        /**
         Sets a value stored in cache under appropriate key
         @param {String} key
         @param {String} value
         @return {Boolean} success indicator
         */
        set: function(key, value) {
            var result;
            if (this.isAvailable) {
                try {
                    this.storage.setItem(key, value);
                    result = true;
                } catch (e) {
                    result = false;
                }
            } else {
                result = false;
            }
            return result;
        },

        /**
         Removes the value stored in cache under appropriate key
         @param {String} key
         @return {Boolean}
         */
        remove: function(key) {
            var result = true;
            if (this.isAvailable) {
                try {
                    result = this.storage.removeItem(key);
                } catch (e) {
                    result = false;
                }
            } else {
                result = false;
            }
            return result;
        },

        /**
         Clears localStorage
         @return {Boolean} success indicator
         */
        clear: function() {
            var result;
            if (this.isAvailable) {
                try {
                    this.storage.clear();
                    result = true;
                } catch (e) {
                    result = false;
                }
            } else {
                result = false;
            }
            return result;
        }

    };

    return XF;
});