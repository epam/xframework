define([
    './xf.core',
    'underscore',
    'backbone',
    './app/start',
    './xf.settings'
], function(XF, _, BB, AppStart) {

    XF.App = function(options) {
        var extOptions;

        options = options || {};
        options.device = options.device || {};
        extOptions = _.clone(options);

        // options.settings
        _.extend(XF.settings, options.settings);

        extOptions = _.omit(extOptions, ['settings', 'device', 'animations', 'router', 'debug', 'history']);
        _.extend(this, extOptions);

        this.initialize();

        AppStart(options);
    };


    _.extend(XF.App.prototype, XF.Events);

    _.extend(XF.App.prototype, /** @lends XF.App.prototype */ {
        initialize: function() {


        }
    });

    /**
 This method allows to extend XF.App with saving the whole prototype chain
 @function
 @static
 */
    XF.App.extend = BB.Model.extend;

    return XF;
});