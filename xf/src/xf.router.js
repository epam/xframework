    /**
     Instance of {@link XF.RouterClass}
     @static
     @type {XF.Router}
     */
    XF.Router = null;

    /**
     Implements Routing.
     @class
     @static
     @augments XF.Events
     @param {Object} routes routes has map
     @param {Object} handlers handlers has map
     */
    XF.RouterClass = BB.Router;

    _.extend(XF.RouterClass.prototype, /** @lends XF.RouterClass.prototype */{


        /**
         Initiates Rounting & history listening
         @private
         */
        start : function() {
            this.bindAnyRoute();
            XF.history.start();
            XF.trigger('ui:enhance', $('body'));
        },


        /**
         Binds a callback to any route
         @param {Function} callback A function to be called when any route is visited
         */
        bindAnyRoute : function() {
            this.on('route', function (e) {
                console.log('XF.Router :: route: ', this.getPageNameFromFragment(XF.history.fragment));
                if (XF.Pages) {
                    XF.Pages.show(this.getPageNameFromFragment(XF.history.fragment));
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