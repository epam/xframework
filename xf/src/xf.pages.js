    /**
     XF.Pages
     @static
     @public
     */
    XF.Pages = {

        /**
         CSS class used to identify pages
         @type String
         @default 'xf-page'
         */
        pageClass : 'xf-page',

        /**
         CSS class used to identify active page
         @type String
         @default 'xf-page-active'
         */
        activePageClass : 'xf-page-active',

        /**
         Animation types for page switching ('fade', 'slide', 'none')
         @type String
         @default 'fade'
         */
        animations: {
            default: 'slideleft',
            next: null,

            types : {
                'none': {
                    fallback: function (fromPage, toPage) {}
                },
                'fade': {
                    fallback: function (fromPage, toPage) {}
                },
                'slideleft': {
                    fallback: function (fromPage, toPage) {}
                },
                'slideright': {
                    fallback: function (fromPage, toPage) {}
                }
            }
        },

        /**
         Saves current active page
         @type $
         @private
         */
        activePage : null,

        /**
         Saves current active page name
         @type $
         @private
         */
        activePageName: '',

        /**
         Initialises Pages: get current active page and binds necessary routes handling
         @private
         */
        start : function(animations) {
            XF.on('pages:show', _.bind(XF.Pages.show, XF.Pages));
            XF.on('pages:animation:next', _.bind(XF.Pages.setNextAnimationType, XF.Pages));
            XF.on('pages:animation:default', _.bind(XF.Pages.setDefaultAnimationType, XF.Pages));

            if (_.has(animations, 'types') ) {
                _.extend(this.animations.types, animations.types);
            }

            if (_.has(animations, 'default') ) {
                this.setDefaultAnimationType(animations.default);
            }

            //TODO: move it to Pages.show and make showing first page by triggering empty route (should work withour routes!)
            var pages =  rootDOMObject.find(' .' + this.pageClass);
            if (pages.length) {
                var preselectedAP = pages.filter('.' + this.activePageClass);
                if(preselectedAP.length) {
                    this.activePage = preselectedAP;
                    this.activePageName = preselectedAP.attr('id');
                } else {
                    this.show(pages.first());
                }
            }
        },

        setDefaultAnimationType: function (animationType) {
            if (XF.Pages.animations.types[animationType]) {
                XF.Pages.animations.default = animationType;
            }
        },

        setNextAnimationType: function (animationType) {
            if (XF.Pages.animations.types[animationType]) {
                XF.Pages.animations.next = animationType;
            }
        },

        /**
         Executes animation sequence for switching
         @param $ jqPage
         */
        show : function(page, animationType){
            if (page === this.activePageName) {
                return;
            }

            if (page === '') {
                var pages =  rootDOMObject.find(' .' + this.pageClass);
                if (pages.length) {
                    this.show(pages.first());
                }
                return;
            }

            var jqPage = (page instanceof $) ? page : $('.' + XF.Pages.pageClass + '#' + page);

            // preventing animation when the page is already shown
            if( (this.activePage && jqPage.attr('id') == this.activePage.attr('id')) || !jqPage.length) {
                return;
            }
            console.log('XF.Pages :: showing page', jqPage.attr('id'));

            var viewport = XF.Device.getViewport();
            var screenHeight = XF.Device.getScreenHeight();

            if (this.animations.next) {
                animationType = (this.animations.types[this.animations.next] ? this.animations.next : this.animations.default);
                this.animations.next = null;
            }else {
                animationType = (this.animations.types[animationType] ? animationType : this.animations.default);
            }

            var fromPage = this.activePage;
            var toPage = jqPage;

            this.activePage = toPage;
            this.activePageName = jqPage.attr('id');

            if (!XF.Device.supports.cssAnimations) {
                if (_.isFunction(this.animations.types[animationType]['fallback'])) {
                    toPage.addClass(this.activePageClass);
                    this.animations.types[animationType].fallback(fromPage, toPage);
                    return;
                }
            }

            if (fromPage) {
                viewport.addClass('xf-viewport-transitioning');

                fromPage.height(viewport.height()).addClass('out '+ animationType);
                toPage.height(viewport.height()).addClass('in '+ animationType + ' ' + this.activePageClass);
                fromPage.animationEnd(function(){
                    fromPage.height('').removeClass(animationType + ' out in');
                    fromPage.removeClass(XF.Pages.activePageClass);
                });

                toPage.animationEnd(function(){
                    toPage.height('').removeClass(animationType + ' out in');
                    viewport.removeClass('xf-viewport-transitioning');
                });
            } else {
                // just making it active
                this.activePage.addClass(this.activePageClass);
            }


            // scroll to top of page ofter page switch
            window.scrollTo( 0, 1 );

            // looking for components inside the page
            loadChildComponents(this.activePage[0]);

            // Check if UI
            if (XF.hasOwnProperty('UI')) {
                XF.UI.enhanceView($(this.activePage[0]));
            }
        }
    };