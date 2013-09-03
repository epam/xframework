    /**
     Instance of {@link XF.DeviceClass}
     @static
     @private
     @type {Object}
     */
    XF.Device = {

        /**
         Contains device viewport size: {width; height}
         @type Object
         */
        size: {
            width: 0,
            height: 0
        },

        isMobile: ( /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test((navigator.userAgent||navigator.vendor||window.opera).toLowerCase() ) ),

        isIOS: (
/iphone|ipod|ipad/i.test((navigator.userAgent||navigator.vendor||window.opera).toLowerCase() )
        ),


        /**
         Array of device types to be chosen from (can be set via {@link XF.start} options)
         @type Object
         @private
         */
        types: [
            {
                name : 'desktop',
                range : {
                    max : null,
                    min : 1025
                },
                templatePath : 'desktop/',
                fallBackTo : 'tablet'
            }, {
                name : 'tablet',
                range : {
                    max : 1024,
                    min : 480
                },
                templatePath : 'tablet/',
                fallBackTo : 'mobile'
            }, {
                name : 'mobile',
                range : {
                    max : 480,
                    min : null
                },
                templatePath : 'mobile/',
                fallBackTo : 'default'
            }
        ],

        /**
         Default device type that would be used when none other worked (covers all the viewport sizes)
         @type Object
         @private
         */
        defaultType: {
            name : 'default',
            range : {
                min : null,
                max : null
            },
            templatePath : '',
            fallBackTo : null
        },

        /**
         Detected device type that would be used to define template path
         @type Object
         @private
         */
        type: this.defaultType,



        /**
         Initializes {@link XF.Device} instance (runs detection methods)
         @param {Array} types rray of device types to be choosen from
         */
        init : function(types) {
            this.types = types || this.types;
            this.detectType();
            this.detectTouchable();
        },

        supports: {
            /**
             A flag indicates whether the device is supporting Touch events or not
             @type Boolean
             */
            touchEvents: false,

            /**
             A flag indicates whether the device is supporting pointer events or not
             @type Boolean
             */
            pointerEvents: window.navigator.msPointerEnabled,

            /**
             A flag indicates whether the device is supporting CSS3 animations or not
             @type Boolean
             */
            cssAnimations: (function () {
                var domPrefixes = 'Webkit Moz O ms Khtml'.split(' '),
                    elm = document.createElement('div');

                if( elm.style.animationName ) {
                    return {
                        prefix: ''
                    };
                };

                for( var i = 0; i < domPrefixes.length; i++ ) {
                    if( elm.style[ domPrefixes[i] + 'AnimationName' ] !== undefined ) {
                        return {
                            prefix: '-' + domPrefixes[i].toLowerCase() + '-'
                        };
                    }
                }

                return false;

            }())
        },

        /**
         Detectes device type (basicaly, chooses most applicable type from the {@link XF.DeviceClass#types} list)
         @private
         */
        detectType : function() {

            this.size.width = $(window).width();
            this.size.height = $(window).height();

            console.log('XF.DeviceClass :: detectType - width = "' + this.size.width + '"');
            console.log('XF.DeviceClass :: detectType - height = "' + this.size.height + '"');

            var maxSide = Math.max(this.size.width, this.size.height);

            console.log('XF.DeviceClass :: detectType - maxSide = "' + maxSide + '"');

            var res = null;
            _.each(this.types, function(type) {
                try {
                    if(
                        (!type.range.min || (type.range.min && maxSide > type.range.min)) &&
                            (!type.range.max || (type.range.max && maxSide < type.range.max))
                        ) {
                        res = type;
                    }
                } catch (e) {
                    console.log('XF.DeviceClass :: detectType - bad type detected - skipping');
                    console.log('XF.DeviceClass :: detectType - @dev: plz verify types list');
                }
            });

            if(res) {

                this.type = res;

            } else {

                this.type = this.defaultType;

                console.log('XF.DeviceClass :: detectType - could not choose any of device type');
                console.log('XF.DeviceClass :: detectType - drop back to this.defaultType');
                console.log('XF.DeviceClass :: detectType - @dev: plz verify types list');
            }

            console.log('XF.DeviceClass :: detectType - selected type "' + this.type.name + '"');
        },

        /**
         Chooses the next applicable type in case when previous one's templatePath could not be loaded
         @param {Object} fallBackFrom If passed, the return type would be taken as dropDown from it (optional)
         @return {Object} Device type
         */
        getNextType : function(fallBackFrom) {
            var aimType = this.type;
            if(fallBackFrom) {
                if(fallBackFrom.fallBackTo) {
                    aimType = this.getTypeByName(fallBackFrom.fallBackTo);
                } else {
                    aimType = this.defaultType;
                }
            }

            // just checking if type is ok
            if(aimType && aimType.templatePath) {
                // type is ok
            } else {
                aimType = this.defaultType;
            }

            // prevent looping the same type again & again
            if(aimType == fallBackFrom) {
                console.log('XF.DeviceClass :: getNextType - infinit cycle of drop down logic detected');
                console.log('XF.DeviceClass :: getNextType - stop trying, no template is available');
                return null;
            }

            return aimType;
        },

        /**
         Chooses device type by ot's name
         @param {String} typeName Value of 'name' property of the type that should be returnd
         @return {Object} Device type
         */
        getTypeByName : function(typeName) {
            var res = null;
            _.each(this.types, function(type) {
                try {
                    if(type.name == typeName) {
                        res = type;
                    }
                } catch (e) {
                    console.log('XF.DeviceClass :: getTypeByName - bad type name - skipping');
                    console.log('XF.DeviceClass :: getTypeByName - @dev: plz verify types list');
                }
            });

            return res;
        },

        /**
         Detectes whether the device is supporting Touch events or not
         @private
         */
        detectTouchable : function() {

            var prefixes = ' -webkit- -moz- -o- -ms- '.split(' ');
            var style = ['@media (',prefixes.join('touch-enabled),('),'app_device_test',')', '{#touch{top:9px;position:absolute}}'].join('');

            var $this = this;

            this.injectElementWithStyles(style, function( node, rule ) {
                var style = document.styleSheets[document.styleSheets.length - 1],
                // IE8 will bork if you create a custom build that excludes both fontface and generatedcontent tests.
                // So we check for cssRules and that there is a rule available
                // More here: github.com/Modernizr/Modernizr/issues/288 & github.com/Modernizr/Modernizr/issues/293
                    cssText = style ? (style.cssRules && style.cssRules[0] ? style.cssRules[0].cssText : style.cssText || '') : '',
                    children = node.childNodes,
                    hashTouch = children[0];

                $this.supports.touchEvents = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch || (hashTouch && hashTouch.offsetTop) === 9;

            }, 1, ['touch']);

            console.log('XF.Device :: detectTouchable - device IS ' + (this.supports.touchEvents ? '' : 'NOT ') + 'touchable');

        },



        /**
         Inject element with style element and some CSS rules. Used for some detect* methods
         @param String rule Node styles to be applied
         @param Function callback Test validation Function
         @param Number nodes Nodes Number
         @param Array testnames Array with test names
         @private
         */
        injectElementWithStyles : function(rule, callback, nodes, testnames) {

            var style, ret, node,
                div = document.createElement('div'),
            // After page load injecting a fake body doesn't work so check if body exists
                body = document.body,
            // IE6 and 7 won't return offsetWidth or offsetHeight unless it's in the body element, so we fake it.
                fakeBody = body ? body : document.createElement('body');

            if(parseInt(nodes, 10)) {
                // In order not to give false positives we create a node for each test
                // This also allows the method to scale for unspecified uses
                while (nodes--) {
                    node = document.createElement('div');
                    node.id = testnames ? testnames[nodes] : 'app_device_test' + (nodes + 1);
                    div.appendChild(node);
                }
            }

            // <style> elements in IE6-9 are considered 'NoScope' elements and therefore will be removed
            // when injected with innerHTML. To get around this you need to prepend the 'NoScope' element
            // with a 'scoped' element, in our case the soft-hyphen entity as it won't mess with our measurements.
            // msdn.microsoft.com/en-us/library/ms533897%28VS.85%29.aspx
            // Documents served as xml will throw if using &shy; so use xml friendly encoded version. See issue #277
            style = ['&#173;','<style>', rule, '</style>'].join('');
            div.id = 'app_device_test';
            // IE6 will false positive on some tests due to the style element inside the test div somehow interfering offsetHeight, so insert it into body or fakebody.
            // Opera will act all quirky when injecting elements in documentElement when page is served as xml, needs fakebody too. #270
            fakeBody.innerHTML += style;
            fakeBody.appendChild(div);
            if(!body){
                //avoid crashing IE8, if background image is used
                fakeBody.style.background = '';
                docElement.appendChild(fakeBody);
            }

            ret = callback(div, rule);
            // If this is done after page load we don't want to remove the body so check if body exists
            !body ? fakeBody.parentNode.removeChild(fakeBody) : div.parentNode.removeChild(div);

            return !!ret;
        },

        /**
         Stores identifier for portrait orientation
         @constant
         @type String
         */
        ORIENTATION_PORTRAIT : 'portrait',

        /**
         Stores identifier for landscape orientation
         @constant
         @type String
         */
        ORIENTATION_LANDSCAPE : 'landscape',


        /**
         Returns current orientation of the device (ORIENTATION_PORTRAIT | ORIENTATION_LANDSCAPE)
         @return String
         */
        getOrientation : function() {
            var isPortrait = true, elem = document.documentElement;
            if ( $.support !== undefined ) {
                //TODO: uncomment and solve
                //isPortrait = portrait_map[ window.orientation ];
            } else {
                isPortrait = elem && elem.clientWidth / elem.clientHeight < 1.1;
            }
            return isPortrait ? this.ORIENTATION_PORTRAIT : this.ORIENTATION_LANDSCAPE;
        },

        /**
         Returns current screen height
         @return Number
         */
        getScreenHeight : function() {
            var orientation 	= this.getOrientation();
            var port			= orientation === this.ORIENTATION_PORTRAIT;
            var	winMin			= port ? 480 : 320;
            var	screenHeight	= port ? screen.availHeight : screen.availWidth;
            var	winHeight		= Math.max( winMin, $( window ).height() );
            var	pageMin			= Math.min( screenHeight, winHeight );

            return pageMin;
        },

        /**
         Returns viewport $ object
         @return $
         */
        getViewport : function() {
            // if there's no explicit viewport make body the viewport
            //var vp = $('.xf-viewport, .viewport') ;
            var vp = $('body').addClass('xf-viewport');
            if (!vp[0]) {
                vp = $('.xf-page').eq(0);
                if (!vp.length) {
                    vp = $('body');
                } else {
                    vp = vp.parent();
                }
                vp.addClass('xf-viewport');
            }
            return vp.eq(0)
        }
    };