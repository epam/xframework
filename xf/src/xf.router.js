define([
    './xf.core',
    'underscore',
    'backbone',
    './dom/dom',
    './xf.pages'
], function(XF, _, BB, Dom) {

    /**
     Instance of {@link XF.RouterClass}
     @static
     @type {XF.router}
     */
    XF.router = null;

    /**
     Implements Routing.
     @class
     @static
     @augments XF.Events
     @param {Object} routes routes has map
     @param {Object} handlers handlers has map
     */
    XF.Router = BB.Router;

    _.extend(XF.Router.prototype, /** @lends XF.Router.prototype */{


        /**
         Initiates Rounting & history listening
         @private
         */
        start : function(options) {
            this.bindAnyRoute();
            XF.history.start(options);
            XF.trigger('ui:enhance', Dom.root);
        },


        /**
         Binds a callback to any route
         @param {Function} callback A function to be called when any route is visited
         */
        bindAnyRoute : function() {
            this.on('route', function (e) {
                console.log('XF.router :: route: ', this.getPageNameFromFragment(XF.history.fragment));
                if (XF.pages) {
                    XF.pages.show(this.getPageNameFromFragment(XF.history.fragment));
                }
            });
        },

        /**
         Returns page name string by fragment
         @param String fragment
         @return String
         */
        getPageNameFromFragment : function(fragment) {
            var parts = fragment.replace(/^\/+/,'').replace(/\/+$/,'').split('/');
            return parts[0];
        }
    });

    return XF;
});
