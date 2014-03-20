define([
    '../xf.core',
    'underscore',
    '../dom/dom',
    '../xf.device',
    '../xf.storage',
    '../xf.touch',
    '../xf.ui',
    '../xf.router',
    '../xf.pages'
], function(XF, _, Dom) {

    // TODO(Jauhen): Consider this function as part of XF.App.
    /**
     * A module create AppStart function that would be ran during XF.App call.
     * @exports AppStart
     */

    var AppStart = (function() {
        /**
         * Creates router and pass parameters to Backbone.Router.
         * @param {Object} options Router settings.
         * @private
         */
        var _createRouter = function(options) {
            if (XF.router) {
                throw 'XF.createRouter can be called only once.';
            } else {
                XF.router = new(XF.Router.extend(options))();
            }
        };

        /**
         * Makes each element with `data-href` attribute tappable (touchable,
         * clickable). It will work with application routes and pages.
         * `data-animation` on such element will set the next animation type for
         * the page.
         * @private
         */
        var _placeAnchorHooks = function() {
            Dom.root.on('tap click', '[data-href]', function() {
                var element = Dom(this);
                var animationType = element.data('animation') || null;

                if (animationType) {
                    XF.trigger('pages:animation:next', animationType);
                }

                XF.router.navigate(element.data('href'), {
                    trigger: true
                });
            });
        };


        // TODO(Jauhen): replace Object in param with more specific type.
        // See http://usejsdoc.org/tags-typedef.html for details.
        /**
         * Initialises all necessary objects and runs initial page.
         * This function is called from XF.App.
         *
         * @param {Object=} options Setting of application.
         * @param {Object=} options.animations Page transitions settings,
         *          see XF.pages for details.
         * @param {Object=} options.device Tweaks for different device types,
         *          see XF.devices for details.
         * @param {Object=} options.history Object to be passed into
         *          Backbone.history.start.
         * @param {Object=} options.router Object to be passed into Backbone.Router.
         *          from XF.settings.
         */
        return function(options) {
            // Fills missing options with default settings.
            _.defaults(options, {
                animations: {},
                device: {},
                history: {
                    pushState: false
                },
                router: {}
            });
            _.defaults(options.animations, {
                standardAnimation: ''
            });

            // Initializes XF objects.
            XF.device.init(options.device.types);
            XF.storage.init();
            if (_.has(XF, 'touch')) {
                XF.touch.init();
            }
            if (_.has(XF, 'ui')) {
                XF.ui.init();
            }

            // Rewrites animations settings with specific animation for current
            // device.
            if (XF.device.type && _.has(XF.device.type, 'defaultAnimation')) {
                options.animations.standardAnimation =
                    XF.device.type.defaultAnimation;
            }

            // Creates router and initializes it.
            _createRouter(options.router);

            _placeAnchorHooks();

            XF.router.start(options.history);
            XF.pages.init(options.animations);

            // Initializes all components.
            XF.loadChildComponents(Dom.root);
            XF.on('xf:loadChildComponents', XF.loadChildComponents);

            // Fires events binded on application start.
            XF.trigger('app:started');
        };
    })();

    return AppStart;
});