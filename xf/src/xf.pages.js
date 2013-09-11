    /**
     XF.pages
     @static
     @public
     */
    XF.pages = {

        status: {
            started: false
        },

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
            standardAnimation: 'slideleft',
            next: null,

            types : {
                'none': {
                    fallback: function (fromPage, toPage) {
                        fromPage.removeClass(this.activePageClass);
                        toPage.addClass(this.activePageClass);
                    }
                },
                'fade': {
                    fallback: function (fromPage, toPage) {
                        $(fromPage).removeClass(this.activePageClass);
                        $(toPage).addClass(this.activePageClass);
                    }
                },
                'slideleft': {
                    fallback: function (fromPage, toPage) {
                        $(fromPage).removeClass(this.activePageClass);
                        $(toPage).addClass(this.activePageClass);
                    }
                },
                'slideright': {
                    fallback: function (fromPage, toPage) {
                        $(fromPage).removeClass(this.activePageClass);
                        $(toPage).addClass(this.activePageClass);
                    }
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
         Initialises pages: get current active page and binds necessary routes handling
         @private
         */
        init : function(animations) {
            XF.on('pages:show', _.bind(XF.pages.show, XF.pages));
            XF.on('pages:animation:next', _.bind(XF.pages.setNextAnimationType, XF.pages));
            XF.on('pages:animation:default', _.bind(XF.pages.setDefaultAnimationType, XF.pages));
            XF.on('pages:start', _.bind(XF.pages.start, XF.pages));

            if (_.has(animations, 'types') ) {
                _.extend(this.animations.types, animations.types);
            }

            if (_.has(animations, 'standardAnimation') ) {
                this.setDefaultAnimationType(animations.standardAnimation);
            }

            this.start();
        },

        start: function (jqObj) {
            if (this.status.started) {
                return;
            }

            jqObj = jqObj || $('body');
            var pages =  jqObj.find(' .' + this.pageClass);
            if (pages.length) {
                var preselectedAP = pages.filter('.' + this.activePageClass);
                if(preselectedAP.length) {
                    this.activePage = preselectedAP;
                    this.activePageName = preselectedAP.attr('id');
                } else {
                    this.show(pages.first());
                }

                XF.off('pages:start');
                this.status.started = true;
            }
        },

        setDefaultAnimationType: function (animationType) {
            if (XF.pages.animations.types[animationType]) {
                XF.pages.animations.standardAnimation = animationType;
            }
        },

        setNextAnimationType: function (animationType) {
            if (XF.pages.animations.types[animationType]) {
                XF.pages.animations.next = animationType;
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

            var jqPage = (page instanceof $) ? page : $('.' + XF.pages.pageClass + '#' + page);

            // preventing animation when the page is already shown
            if( (this.activePage && jqPage.attr('id') == this.activePage.attr('id')) || !jqPage.length) {
                return;
            }
            console.log('XF.pages :: showing page', jqPage.attr('id'));

            var viewport = XF.device.getViewport();
            var screenHeight = XF.device.getScreenHeight();

            if (this.animations.next) {
                animationType = (this.animations.types[this.animations.next] ? this.animations.next : this.animations.standardAnimation);
                this.animations.next = null;
            }else {
                animationType = (this.animations.types[animationType] ? animationType : this.animations.standardAnimation);
            }

            var fromPage = this.activePage;
            var toPage = jqPage;

            this.activePage = toPage;
            this.activePageName = jqPage.attr('id');

            if (!XF.device.supports.cssAnimations) {
                if (_.isFunction(this.animations.types[animationType]['fallback'])) {
                    _.bind(this.animations.types[animationType].fallback, this)(fromPage, toPage);
                }
            }else{
                if (fromPage) {
                    viewport.addClass('xf-viewport-transitioning');

                    fromPage.height(viewport.height()).addClass('out '+ animationType);
                    toPage.height(viewport.height()).addClass('in '+ animationType + ' ' + this.activePageClass);
                    fromPage.animationEnd(function(){
                        fromPage.height('').removeClass(animationType + ' out in');
                        fromPage.removeClass(XF.pages.activePageClass);
                    });

                    toPage.animationEnd(function(){
                        toPage.height('').removeClass(animationType + ' out in');
                        viewport.removeClass('xf-viewport-transitioning');
                    });
                } else {
                    // just making it active
                    this.activePage.addClass(this.activePageClass);
                }
            }

            XF.trigger('ui:enhance', $(this.activePage));

            // looking for components inside the page
            loadChildComponents(this.activePage[0]);
        }
    };