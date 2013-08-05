    /**
     @namespace Holds all the reusable util functions
     */
    XF.Utils = {};

    /**
     @namespace Holds all the reusable util functions related to Adress Bar
     */
    XF.Utils.AddressBar = {};

    _.extend(XF.Utils.AddressBar, /** @lends XF.Utils.AddressBar */{

        /**
         Saves scroll value in order to not re-calibrate everytime we call the hide url bar
         @type Boolean
         @private
         */
        BODY_SCROLL_TOP : false,

        /**
         Calculates current scroll value
         @return Number
         @private
         */
        getScrollTop : function(){
            var win = window,
                doc = document;

            return win.pageYOffset || doc.compatMode === 'CSS1Compat' && doc.documentElement.scrollTop || doc.body.scrollTop || 0;
        },

        /**
         Hides adress bar
         */
        hide : function(){
            console.log('XF :: Utils :: AddressBar :: hide');
            var win = window;

            // if there is a hash, or XF.Utils.AddressBar.BODY_SCROLL_TOP hasn't been set yet, wait till that happens
            if( !location.hash && XF.Utils.AddressBar.BODY_SCROLL_TOP !== false){
                win.scrollTo( 0, XF.Utils.AddressBar.BODY_SCROLL_TOP === 1 ? 0 : 1 );
            }


            if (XF.Device.isMobile) {
                var css = document.documentElement.style;

                css.height = '200%';
                css.overflow = 'visible';

                window.scrollTo(0, 1);

                css.height = window.innerHeight + 'px';

                return true;
            }
        },

        /**
         Hides adress bar on page load
         */
        hideOnLoad : function () {
            console.log('XF :: Utils :: AddressBar :: hideOnLoad');
            var win = window,
                doc = win.document;

            // If there's a hash, or addEventListener is undefined, stop here
            if( !location.hash && win.addEventListener ) {

                //scroll to 1
                window.scrollTo( 0, 1 );
                XF.Utils.AddressBar.BODY_SCROLL_TOP = 1;

                //reset to 0 on bodyready, if needed
                bodycheck = setInterval(function() {
                    if( doc.body ) {
                        clearInterval( bodycheck );
                        XF.Utils.AddressBar.BODY_SCROLL_TOP = XF.Utils.AddressBar.getScrollTop();
                        //XF.Utils.AddressBar.hide();
                    }
                }, 15);

                win.addEventListener( 'load',
                    function() {
                        setTimeout(function() {
                            //at load, if user hasn't scrolled more than 20 or so...
                            if( XF.Utils.AddressBar.getScrollTop() < 20 ) {
                                //reset to hide addr bar at onload
                                //XF.Utils.AddressBar.hide();
                            }
                        }, 0);
                    }
                );
            }
        }
    });