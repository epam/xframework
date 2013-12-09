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
        init : function() {

            this.storage = window.localStorage;

            // checking availability
            try {
                this.storage.setItem('check', 'check');
                this.storage.removeItem('check');
                this.isAvailable = true;
            } catch(e) {
                this.isAvailable = false;
            }

            // clearing localStorage if stored version is different from current
            var appVersion = this.get('appVersion');
            if(XF.settings.property('noCache')) {
                // cache is disable for the whole site manualy
                console.log('XF.storage :: init - cache is disable for the whole app manually - clearing storage');
                this.set('appVersion', XF.settings.property('appVersion'));
            } else if(appVersion && appVersion == XF.settings.property('appVersion')) {
                // same version is cached - useing it as much as possible
                console.log('XF.storage :: init - same version is cached - using it as much as possible');
            } else {
                // wrong or no version cached - clearing storage
                console.log('XF.storage :: init - wrong or no version cached - clearing storage');
                this.clear();
                this.set('appVersion', XF.settings.property('appVersion'));
            }
        },

        /**
         Returns a value stored in cache under appropriate key
         @param {String} key
         @return {String}
         */
        get : function(key) {
            var result;
            if(this.isAvailable) {
                try {
                    result = this.storage.getItem(key);
                    console.log('XF.storage :: get - "' + key + '" = "' + result + '"');
                } catch(e) {
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
        set : function(key, value) {
            var result;
            if(this.isAvailable) {
                try {
                    this.storage.setItem(key, value);
                    result = true;
                    console.log('XF.storage :: set - "' + key + '" = "' + value + '"');
                } catch(e) {
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
        clear : function() {
            var result;
            if(this.isAvailable) {
                try {
                    this.storage.clear();
                    result = true;
                    console.log('XF.storage :: clear');
                } catch(e) {
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
