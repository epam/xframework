(function(window, BB) {

    /* adding touchable functionality as $ plugin */

    /** @ignore */
    $.fn.touchable = function(options) {
        return this.each(function() {
            if(!$(this).data('touchable')) {
                $(this).data('touchable', new XF.Touchable(this, options));
            }
            return $(this).data('touchable');
        });
    };

    /**
     Incapsulates one finger workaround logic.
     @class
     @static
     @param {XF.Touchable} touchable Reference to the instance of {@link XF.Touchable} created for target DOM element
     @param {String} fingerID Unique finger indentifier
     @param {Object} startPosition Initial finger position coordinates
     */
    XF.TouchGesture = function(touchable, fingerID, startPosition) {

        /**
         Reference to the instance of {@link XF.Touchable} created for target DOM element
         @type XF.Touchable
         @private
         */
        this.touchable = touchable;
        /**
         Unique finger indentifier
         @type String
         */
        this.fingerID = fingerID;
        /**
         Initial finger position coordinates
         @type Object
         */
        this.startPosition = startPosition;
        /**
         Current finger position coordinates
         @type Object
         */
        this.currentPosition = startPosition;
        /**
         Previous finger position coordinates
         @type Object
         */
        this.previousPosition = startPosition;
        /**
         Delta (x, y) between current and previous finger position
         @type Object
         */
        this.previousDelta = {x:0,y:0};
        /**
         Delta (x, y) between current and initial finger position
         @type Object
         */
        this.startDelta = {x:0,y:0};
        /**
         Angle of a vector represented by delta between current and initial finger position
         @type Number
         */
        this.swipeAngle = 0;
        /**
         Length of a vector represented by delta between current and initial finger position
         @type Number
         */
        this.swipeLength = 0;
        /**
         Calculated direction of swipe gesture (XF.TouchGesture.SWIPE_DIRECTION_*)
         @type String
         */
        this.swipeDirection = XF.TouchGesture.SWIPE_DIRECTION_LEFT;
        /**
         Long touch timeout handler
         @type Function
         @private
         */
        this.longTouchHandler = _.bind(this.longTouchHandlerF, this);
        /**
         Long touch timeout identifier
         @private
         */
        this.longTouchTimeout = setTimeout(this.longTouchHandler, this.touchable.options.longTapInterval);
        /**
         A flag witch defined whether the {@link XF.TouchGesture.TOUCH_START_EVENT} has alreay bee dispatched (used to skip {@link XF.TouchGesture.TAP_EVENT} dispatching if 'true')
         @type Boolean
         @default false
         @private
         */
        this.longTouchDispatched = false;
        /**
         A flag witch defined whether the gesture has already been complete and should not be calculated further
         @type Boolean
         @default false
         @private
         */
        this.gestureComplete = false;

        // dispatching TOUCH_START_EVENT
        this.dispatch(XF.TouchGesture.TOUCH_START_EVENT);
    };

    _.extend(XF.TouchGesture.prototype, /** @lends XF.TouchGesture.prototype */{

        /**
         Calculate everything related to touchmove
         @param {Object} newPosition New finger coordinates
         @private
         */
        move : function(newPosition) {
            this.previousPosition = this.currentPosition;
            this.currentPosition = newPosition;

            this.previousDelta.x = this.currentPosition.x - this.previousPosition.x;
            this.previousDelta.y = this.currentPosition.y - this.previousPosition.y;

            this.startDelta.x = this.currentPosition.x - this.startPosition.x;
            this.startDelta.y = this.currentPosition.y - this.startPosition.y;

            this.checkSwipe();

            this.dispatch(XF.TouchGesture.TOUCH_MOVE_EVENT);
        },

        /**
         Checks whether SWIPE_EVENT should be dispatched
         @param {Object} newPosition New finger coordinates
         @private
         */
        checkSwipe : function() {

            this.swipeLength = Math.round(Math.sqrt(Math.pow(this.startDelta.x, 2) + Math.pow(this.startDelta.y, 2)));

            if(this.swipeLength > this.touchable.options.swipeLength) {

                var radians = Math.atan2(this.startDelta.y, this.startDelta.x);
                this.swipeAngle = Math.round(radians * 180 / Math.PI);

                if(this.swipeAngle < 0) {
                    this.swipeAngle = 360 - Math.abs(this.swipeAngle);
                }

                if ( (this.swipeAngle <= 45) && (this.swipeAngle >= 0) ) {
                    this.swipeDirection = XF.TouchGesture.SWIPE_DIRECTION_RIGHT;
                } else if ( (this.swipeAngle <= 360) && (this.swipeAngle >= 315) ) {
                    this.swipeDirection = XF.TouchGesture.SWIPE_DIRECTION_RIGHT;
                } else if ( (this.swipeAngle >= 135) && (this.swipeAngle <= 225) ) {
                    this.swipeDirection = XF.TouchGesture.SWIPE_DIRECTION_LEFT;
                } else if ( (this.swipeAngle > 45) && (this.swipeAngle < 135) ) {
                    this.swipeDirection = XF.TouchGesture.SWIPE_DIRECTION_DOWN;
                } else {
                    this.swipeDirection = XF.TouchGesture.SWIPE_DIRECTION_UP;
                }

                this.dispatch(XF.TouchGesture.SWIPE_EVENT);
                this.touchable.destroyGesture(this.fingerID);
            }
        },

        /**
         Long tap timeout handler function. Dispatches {@link XF.TouchGesture.LONG_TAP_EVENT}
         @param {Object} newPosition New finger coordinates
         @private
         */
        longTouchHandlerF : function() {
            this.dispatch(XF.TouchGesture.LONG_TAP_EVENT);
            this.longTouchDispatched = true;
        },

        /**
         Calculate everything related to touchend
         @private
         */
        release : function() {
            if(!this.gestureComplete) {
                if(!this.longTouchDispatched) {

                    clearTimeout(this.longTouchTimeout);

                    this.dispatch(XF.TouchGesture.TAP_EVENT);

                    if(this.touchable.lastTapTimestamp + this.touchable.options.doubleTapInterval > XF.TouchGesture.getTimeStamp()) {
                        this.dispatch(XF.TouchGesture.DOUBLE_TAP_EVENT);
                        this.touchable.lastTapTimestamp = 0;
                    } else {
                        this.touchable.lastTapTimestamp = XF.TouchGesture.getTimeStamp();
                    }

                }
            }

            this.gestureComplete = true;

            this.dispatch(XF.TouchGesture.TOUCH_END_EVENT);

            this.touchable.destroyGesture(this.fingerID);
        },

        /**
         Dispatches an event passing this {@link XF.TouchGesture} instance as second parameter
         @param {String} eventName Name of event to be dispatched
         @private
         */
        dispatch : function(eventName) {
            console.log('XF.TouchGesture :: dispatch - ' + eventName + ' (' + this.fingerID + ')');
            $(this.touchable.elem).trigger(eventName, this);
        }
    });

    _.extend(XF.TouchGesture, /** @lends XF.TouchGesture */{

        /**
         Touch Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        TOUCH_START_EVENT : 'TOUCH_START',
        /**
         Touch Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        TOUCH_MOVE_EVENT : 'TOUCH_MOVE',
        /**
         Touch Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        TOUCH_END_EVENT : 'TOUCH_END',
        /**
         Gesture Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        TAP_EVENT : 'TAP',
        /**
         Gesture Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        SWIPE_EVENT : 'SWIPE',
        /**
         Gesture Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        LONG_TAP_EVENT : 'LONG_TAP',
        /**
         Gesture Event name (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        DOUBLE_TAP_EVENT : 'DOUBLE_TAP',
        /**
         Unique indentifier for Swipe direction gesture (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        SWIPE_DIRECTION_LEFT : 'LEFT',
        /**
         Unique indentifier for Swipe direction gesture (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        SWIPE_DIRECTION_RIGHT : 'RIGHT',
        /**
         Unique indentifier for Swipe direction gesture (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        SWIPE_DIRECTION_UP : 'UP',
        /**
         Unique indentifier for Swipe direction gesture (use this static property instead of direct string for better compatibility)
         @type Sting
         @static
         */
        SWIPE_DIRECTION_DOWN : 'DOWN',
        /**
         Returns current timestamp in milliseconds
         @return {Number}
         @static
         */
        getTimeStamp : function() {
            return new Date().getTime();
        }

    });

    /**
     Incapsulates one finger workaround logic.
     @class
     @static
     @param {Object} elem Reference to the target DOM element
     @param {Object} options Hash-map with custom instance options
     */
    XF.Touchable = function(elem, options) {

        /**
         Reference to the target DOM element
         @type Object
         @private
         */
        this.elem=elem;
        /**
         Reference to the $ element
         @type Object
         @private
         */
        this.$elem=$(elem);

        // merging custom options with defauls & global opnes
        if(options) {
            this.options = _.clone(options);
        } else {
            this.options = {};
        }
        _.defaults(this.options, {
            swipeLength : XF.Settings.property('touchableSwipeLength'),
            doubleTapInterval : XF.Settings.property('touchableDoubleTapInterval'),
            longTapInterval : XF.Settings.property('touchableLongTapInterval')
        });

        /**
         Hash-map of all gestures currently being tracked
         @type Object
         @private
         */
        this.gestures = {};

        /**
         Stores last tap timestamp, witch is used to detect {@link XF.TouchGesture.DOUBLE_TAP_EVENT}
         @type Number
         @private
         */
        this.lastTapTimestamp = 0;

        /**
         'touchstart' handler bind to {@link XF.Touchable} context
         @type Function
         @private
         */
        this.touchstart = _.bind(this.touchstartF, this);
        /**
         'touchmove' handler bind to {@link XF.Touchable} context
         @type Function
         @private
         */
        this.touchmove = _.bind(this.touchmoveF, this);
        /**
         'touchend' handler bind to {@link XF.Touchable} context
         @type Function
         @private
         */
        this.touchend = _.bind(this.touchendF, this);

        // ading listeners for 'touchstart' & 'mousedown' events
        if(XF.Device.isTouchable) {
            $(elem).bind('touchstart', this.touchstart);
        } else {
            $(elem).bind('mousedown', this.touchstart);
        }
    };

    _.extend(XF.Touchable.prototype, /** @lends XF.Touchable.prototype */{

        /**
         Returns a {@link XF.TouchGesture} instance by finger indentifier
         @param {String} fingerID Finger unique identifier
         @return {XF.TouchGesture}
         */
        getGestureByID : function(fingerID) {
            return this.gestures[fingerID];
        },

        /**
         Creates new {@link XF.TouchGesture} instance
         @param {String} fingerID Finger unique identifier
         @param {Object} startPosition Initial touch coordinates
         @return {XF.TouchGesture}
         */
        createGesture : function(fingerID, startPosition) {
            return this.gestures[fingerID] = new XF.TouchGesture(this, fingerID, startPosition);
        },

        /**
         Destroys an instance of {@link XF.TouchGesture} by finger indentifier
         @param {String} fingerID Finger unique identifier
         */
        destroyGesture : function(fingerID) {

            delete this.gestures[fingerID];

            if(_.size(this.gestures) == 0) {
                if(XF.Device.isTouchable) {
                    $(document).unbind('touchmove', this.touchmove);
                    $(document).unbind('touchend', this.touchend);
                } else {
                    $(document).unbind('mousemove', this.touchmove);
                    $(document).unbind('mouseup', this.touchend);
                }
            }
        },

        /**
         'touchstart' handler
         @param {Object} e Javascript event object
         @private
         */
        touchstartF : function(e) {

            e = e.originalEvent || e;

            // touch device
            if(e.changedTouches != undefined) {

                var self = this;
                _.each(e.changedTouches, function(changedTouch, index) {
                    self.createGesture(changedTouch.identifier, {x: changedTouch.clientX, y: changedTouch.clientY});
                });

                $(document).bind('touchmove', this.touchmove);
                $(document).bind('touchend', this.touchend);

                // desktop
            }else{

                this.createGesture('mouse', {x: e.pageX, y: e.pageY});

                $(document).bind('mousemove', this.touchmove);
                $(document).bind('mouseup', this.touchend);

            }

            // NOTE: XF.Device.isTouchable should fix double click (real touch+mouse click) problem
            //e.preventDefault();
        },

        /**
         'touchmove' handler
         @param {Object} e Javascript event object
         @private
         */
        touchmoveF : function(e) {

            e = e.originalEvent || e;

            // touch device
            if(e.changedTouches != undefined) {

                var self = this;
                _.each(e.changedTouches, function(changedTouch, index) {
                    var gesture = self.getGestureByID(changedTouch.identifier);
                    if(gesture) {
                        gesture.move({x: changedTouch.clientX, y: changedTouch.clientY});
                    }
                });

                // desktop
            }else{

                var gesture = this.getGestureByID('mouse');
                if(gesture) {
                    gesture.move({x: e.pageX, y: e.pageY});
                }

            }
        },

        /**
         'touchend' handler
         @param {Object} e Javascript event object
         @private
         */
        touchendF : function(e) {

            e = e.originalEvent || e;

            // touch device
            if(typeof e.changedTouches !== 'undefined') {

                var self = this;
                _.each(e.changedTouches, function(changedTouch, index) {
                    var gesture = self.getGestureByID(changedTouch.identifier);
                    if(gesture) {
                        gesture.release();
                    }
                });

                // desktop
            }else{

                var gesture = this.getGestureByID('mouse');
                if(gesture) {
                    gesture.release();
                }

            }
        }
    });
}).call(this, window, Backbone);

//New file

(function(window, BB) {

    /** @ignore */
    /** Cannot use $.fn.extend because of Zepto support **/
    $.fn.outerHtml = function(replacement) {

        if(replacement) {
            return this.each(function(){
                $(this).replaceWith(replacement);
            });
        }

        var tmp_node = $('<div></div>').append( $(this).clone() );
        var markup = tmp_node.html();

        tmp_node.remove();
        return markup;
    };
}).call(this, window, Backbone);

//New file

(function(window, BB) {

    /**
     @namespace Holds all the logic related to UI elements enhancement
     */
    XF.UIElements = {};

    _.extend(XF.UIElements, /** @lends XF.UIElements */ {

        /**
         Reworks markup of a givven $ object
         @param jqObj $ item
         */
        enhanceView : function(jqObj) {

            if(!jqObj instanceof $) {
                jqObj = $(jqObj);
                if(!jqObj instanceof $) {
                    return;
                }
            }

            _.each(XF.UIElements.enhancementList, function(enhancement, index, enhancementList) {
                jqObj.find(enhancement.selector).not('[data-skip-enhance=true]').each( function(){
                    var skip = false;
                    _.each(XF.UIElements.enhanced.length, function(elem, index, enhancementList) {
                        if(XF.UIElements.enhanced[i] === this) {
                            skip = true;
                        }
                    });
                    if(!skip & $(this).attr('data-skip-enhance') != 'true') {

                        XF.UIElements.enhanced.push(this);
                        XF.UIElements[enhancement.enhanceMethod](this);
                    }
                });
            });

        },

        /**
         A list of all the enhancements that whould be done of every $ object givven
         @type Object
         @private
         */
        enhancementList : {},

        /**
         A list of objects already enhanced (used to skip them while iterating through DOM)
         @type Array
         @private
         */
        enhanced : []

    });
}).call(this, window, Backbone);

//New file

(function(window, BB) {
    XF.UIElements.enhancementList.button = {
            selector : 'A[data-role=button], BUTTON, INPUT[type=submit], INPUT[type=reset], INPUT[type=button] [data-appearance=backbtn]',
            enhanceMethod : 'enhanceButton'
    };
    /**
     Make the DOM object look like a button
     @param button DOM Object
     @private
     */
    XF.UIElements.enhanceButton = function(button) {

        var jQButton = $(button);
        if(!button || !jQButton instanceof $) {
            return;
        }

        if(jQButton.attr('data-skip-enhance') == 'true') {
            return;
        }

        var enhancedButton;
        var innerStuff;

        // If it's A or BUTTON, the necessary classes are added to the element itself
        if(button.nodeName == 'A' || button.nodeName == 'BUTTON') {
            enhancedButton = jQButton.attr({'data-skip-enhance':true});
            innerStuff = jQButton.html();
            jQButton.html('');
            // If it's INPUT - it's wrapped in a DIV and the necessary classes are added to the DIV.
        } else if(button.nodeName == 'INPUT') {
            // The input is assigned a class xf-input-hidden
            enhancedButton = $('<div></div>').append(jQButton.clone().addClass('xf-input-hidden').attr({'data-skip-enhance':true}));
            jQButton.outerHtml(enhancedButton);
            innerStuff = jQButton.attr('value');
        } else {
            // how did U get there? o_O
            return;
        }

        var isSmall = jQButton.attr('data-small') == 'true' || jQButton.attr('data-appearance') == 'backbtn';

        // The class xf-button is added to the button.
        // If it has data-small="true" attribute, the class should be xf-button-small.
        enhancedButton.addClass(isSmall ? 'xf-button-small' : 'xf-button');

        // If data-appearance="backbtn" attribute is present, xf-button-back class is also added.
        if(jQButton.attr('data-appearance') == 'backbtn') {
            enhancedButton.addClass('xf-button-back');
        }

        var iconName = jQButton.attr('data-icon');

        if(jQButton.attr('data-appearance') == 'backbtn' /*&& !jQButton.attr('data-icon')*/) {
            iconName = 'left';
        }

        if(iconName) {

            // If data-icon attribute is present, a SPAN.xf-icon is added inside the button.
            var iconSpan = $('<span class=xf-icon></span>');

            // The value of data-icon attribute is used to generate icon class: e.g. xf-icon-dots.
            iconSpan.addClass('xf-icon-' + iconName);

            // If the button had data-small=true or data-appearance="backbtn" attributes,
            // xf-icon-small class is also added to SPAN.xf-icon
            if(isSmall) {
                iconSpan.addClass('xf-icon-small');
            } else {
                iconSpan.addClass('xf-icon-big');
            }

            // A class denoting icon position is also added to the button. Default: xf-iconpos-left.
            // The value is taken from data-iconpos attr.
            // Possible values: left, right, top, bottom.
            var iconPos = jQButton.attr('data-iconpos') || 'left';
            if(iconPos != 'left' && iconPos != 'right' && iconPos != 'top' && iconPos != 'bottom') {
                iconPos = 'left';
            }
            enhancedButton.addClass('xf-iconpos-' + iconPos);
            enhancedButton.append(iconSpan);

        }

        if(innerStuff) {
            var textSpan = $('<span></span>').append(innerStuff);
            // The text of buttons is placed inside span.xf-button-small-text for small buttons
            if(isSmall || jQButton.attr('data-appearance') == 'backbtn') {
                textSpan.addClass('xf-button-small-text');
                // and span.xf-button-text for big ones.
            } else {
                textSpan.addClass('xf-button-text');
            }
            enhancedButton.append(textSpan);
        }

        // If data-special="true" attribute is present add xf-button-special class.
        if(jQButton.attr('data-special') == 'true') {
            enhancedButton.addClass('xf-button-special');
        }
        if(jQButton.attr('data-alert') == 'true') {
            enhancedButton.addClass('xf-button-alert');
        }

        // If data-alert="true" attribute is present add xf-button-alert class.
        if(jQButton.attr('data-alert') == 'true') {
            enhancedButton.addClass('xf-button-alert');
        }

    };

    /**
     Generates and enhances button
     @param buttonDescr Object
     @return $
     */
    XF.UIElements.createButton = function(buttonDescr)  {
        /*
         buttonDescr = {
         text,
         icon,
         iconpos,
         small,
         appearance,
         special,
         alert,
         handler
         }
         */
        var jQButton = $('<button></button>');
        jQButton.html(buttonDescr.text);
        var attrs = {};
        if(buttonDescr.icon && buttonDescr.icon != '') {
            attrs['data-icon'] = buttonDescr.icon;
        };
        if(buttonDescr.iconpos && buttonDescr.iconpos != '') {
            attrs['data-iconpos'] = buttonDescr.iconpos;
        };
        if(buttonDescr.small && buttonDescr.small != '') {
            attrs['data-small'] = buttonDescr.small;
        };
        if(buttonDescr.appearance && buttonDescr.appearance != '') {
            attrs['data-appearance'] = buttonDescr.appearance;
        };
        if(buttonDescr.special && buttonDescr.special != '') {
            attrs['data-special'] = buttonDescr.special;
        };
        if(buttonDescr.alert && buttonDescr.alert != '') {
            attrs['data-alert'] = buttonDescr.alert;
        };
        if(_.isFunction(buttonDescr.handler)) {
            jQButton.click(buttonDescr.handler)
        };


        jQButton.attr(attrs);

        XF.UIElements.enhanceButton(jQButton[0]);

        return jQButton;
    };
}).call(this, window, Backbone);

//New file

(function(window, BB) {
    XF.UIElements.enhancementList.checkboxRadio = {
        selector : 'INPUT[type=checkbox], INPUT[type=radio]',
        enhanceMethod : 'enhanceCheckboxRadio'
    };

    /**
     Enhances checkbox or radio button input view
     @param textInput DOM Object
     @private
     */
    XF.UIElements.enhanceCheckboxRadio = function(chbRbInput) {
        var jQChbRbInput = $(chbRbInput);
        if(!chbRbInput || !jQChbRbInput instanceof $) {
            return;
        }

        if(jQChbRbInput.attr('data-skip-enhance') == 'true') {
            return;
        }

        jQChbRbInput.attr({'data-skip-enhance':true});

        var chbRbInputID = jQChbRbInput.attr('id');
        var chbRbInputLabel = $('label[for=' + chbRbInputID + ']');

        // If the input doesn't have an associated label, quit
        if(chbRbInputLabel.length) {

            var typeValue = jQChbRbInput.attr('type').toLowerCase();
            var isSwitch = jQChbRbInput.attr('data-role') == 'switch';

            /*
             <div class="xf-switch">

             <label class="xf-switch-control" for="wifi-switch22">
             <input class="" type="radio" name="rr" id="wifi-switch22" data-role="switch" data-skip-enhance="true">
             <span class="xf-switch-track">
             <span class="xf-switch-track-wrap"><span class="xf-switch-thumb"></span></span>
             </span>
             </label>

             <label class="xf-switch-label" for="wifi-switch22">On/Off Switch</label>
             </div>
             */

            var wrapper = $('<div></div>');
            if(!isSwitch) {
                // An input-label pair is wrapped in a div.xf-input-radio or div.xf-input-checkbox
                wrapper.addClass('xf-input-' + typeValue);

                // The input is wrapped in a new label.xf-input-positioner[for=INPUT-ID]
                wrapper.append($('<label class="xf-input-positioner"></label>').attr({'for' : chbRbInputID}).append(jQChbRbInput.clone()));
                // The old label is assigned a class xf-input-label
                wrapper.append(chbRbInputLabel.addClass('xf-input-label'));
            } else {
                wrapper.addClass('xf-switch');
                wrapper.append(
                    $('<label class="xf-switch-control"></label>').attr({'for' : chbRbInputID})
                        .append(jQChbRbInput.clone())
                        .append(
                            $('<span class=xf-switch-track><span class=xf-switch-track-wrap><span class=xf-switch-thumb></span></span></span>')
                        )
                );
                wrapper.append(chbRbInputLabel.addClass('xf-switch-label'));
            }


            jQChbRbInput.outerHtml(wrapper);

            // fix iOS bug when labels don't check radios and checkboxes
            /*
             wrapper.on('click', 'label[for="'+ chbRbInputID +'"]', function(){
             if (!$(this).data('bound')) {
             var $input = $('#'+ chbRbInputID);
             alert($input[0].checked);
             $input.attr({checked: !$input[0].checked});
             !$(this).data('bound', true)
             }
             })*/
        }
    };
}).call(this, window, Backbone);

//New file

(function(window, BB) {
    XF.UIElements.enhancementList.fieldset = {
        selector : 'fieldset[data-role=controlgroup]',
        enhanceMethod : 'enhanceFieldset'
    };

    /**
     Enhances fieldset view
     @param textInput DOM Object
     @private
     */
    XF.UIElements.enhanceFieldset = function(fieldset) {
        var jQFieldset = $(fieldset);
        if(!fieldset || !jQFieldset instanceof $) {
            return;
        }

        if(jQFieldset.attr('data-skip-enhance') == 'true') {
            return;
        }

        jQFieldset.attr({'data-skip-enhance':true});

        // If the inputs have a parent fieldset[data-role=controlgroup], the fieldset
        // is assigned a class xf-controlgroup,

        jQFieldset.addClass('xf-controlgroup');

        // If there's a legend element inside the fieldset, it becomes div.xf-label
        var legend = jQFieldset.children('legend').detach();

        // the inputs are also wrapped in a div.xf-controlgroup-controls
        jQFieldset.wrapInner('<div class=xf-controlgroup-controls>');
        jQFieldset.prepend(legend);

        if(legend.length) {
            var legendDiv = $('<div></div>');
            var newLegendAttrs = {};
            _.each(legend[0].attributes, function(attribute) {
                newLegendAttrs[attribute.name] = attribute.value;
            });
            legendDiv.attr(newLegendAttrs);
            legendDiv.addClass('xf-label');
            legendDiv.html(legend.html());
            legend.outerHtml(legendDiv.outerHtml());
        }
    };
}).call(this, window, Backbone);

//New file

(function(window, BB) {
    XF.UIElements.enhancementList.list = {
        selector : 'UL[data-role=listview], OL[data-role=listview]',
        enhanceMethod : 'enhanceList'
    };

    /**
     Enhances ul/ol lists view
     @param list DOM Object
     @private
     */
    XF.UIElements.enhanceList = function(list) {
        var jQList = $(list);
        if(!list || !jQList instanceof $) {
            return;
        }

        if(jQList.attr('data-skip-enhance') == 'true') {
            return;
        }

        jQList.attr({'data-skip-enhance':true});

        jQList.addClass('xf-listview');

        // If the list has data-fullwidth="true" attribute add xf-listview-fullwidth class to it
        if(jQList.attr('data-fullwidth') == 'true') {
            jQList.addClass('xf-listview-fullwidth');
        }

        // Add xf-li class to all LIs inside
        jQList.children('li').addClass('xf-li');
        // If a LI has data-role="divider" attribute add xf-li-divider class to the LI
        jQList.children('li[data-role=divider]').addClass('xf-li-divider');

        var lis = jQList.children('li');

        // If there's an A element directly inside the LI, add xf-li-btn class to the A
        var anchors = lis.children('a');

        anchors.addClass('xf-li-btn');
        // If there's _no_ A element directly inside the LI, add xf-li-static class to it.
        // Don't add xf-li-static class to LIs with data-role="divider"
        lis.not(anchors.parent()).not('[data-role=divider]').addClass('xf-li-static');

        // If there's a data-icon attribute on LI:
        // Append SPAN.xf-icon.xf-icon-big.xf-icon-ICONNAME inside the A
        // If parent LI had no data-iconpos attribute or had data-iconpos="right" attr,
        // add xf-li-with-icon-right class to the A, otherwise add class xf-li-with-icon-left
        jQList.children('li[data-icon]').children('a').each(function(){
            var jqAnchor = $(this);
            var icon = jqAnchor.parent().attr('data-icon');
            jqAnchor.append(
                $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-' + icon)
            );
            var iconPos = jqAnchor.parent().attr('data-iconpos');
            if(iconPos != 'left' && iconPos != 'right') {
                iconPos = 'right';
            }
            jqAnchor.addClass('xf-li-with-icon-' + iconPos);
        });

        // If there's an element with class xf-count-bubble inside the A, add xf-li-has-count to the A
        anchors.children('.xf-count-bubble').parent().addClass('xf-li-has-count');

        // If there's an IMG directly inside the A, add xf-li-with-thumb-left class to the A,
        // and xf-li-thumb & xf-li-thumb-left classes to the IMG.
        // If there was data-thumbpos="right" attr, the classes must be
        // xf-li-with-thumb-right & xf-li-thumb-right
        anchors.children('img').parent().each(function(){
            var jqAnchor = $(this);
            var thumbPos = jqAnchor.parent().attr('data-thumbpos');
            if(thumbPos != 'right' && thumbPos != 'left') {
                thumbPos = 'left';
            }
            jqAnchor.addClass('xf-li-with-thumb-' + thumbPos);
            jqAnchor.children('img').addClass('xf-li-thumb xf-li-thumb-' + thumbPos);
        });

        // Inside the A, wrap all contents except the icon, count-bubble and the thumbnail
        // in one .xf-btn-text div.
        anchors.each(function() {
            var jqAnchor = $(this);
            jqAnchor.append(
                $('<div class=xf-btn-text></div>')
                    .append(
                        jqAnchor.children().not('.xf-icon, .xf-count-bubble, .xf-li-thumb')
                    )
            );
        });

        // To all H1-h6 elements inside the A add xf-li-header class
        lis.find('h1, h2, h3, h4, h5, h6').addClass('xf-li-header');
        // To all P elements inside the A add xf-li-desc class
        lis.find('p').addClass('xf-li-desc');

        // Wrap LI.xf-li-static inside with DIV.xf-li-wrap
        lis.filter('.xf-li-static').each(function(){
            $(this).wrapInner('<div class=xf-li-wrap />');
        });
    };
}).call(this, window, Backbone);

//New file

(function(window, BB) {

    /**
     Generates basic popup container
     @return $
     @private
     */
    XF.UIElements.createPopup = function() {
        /*
         <div class="xf-dialog "><div class="xf-dialog-content"></div></div>
         */
        var jqPopup =
            $('<div class="xf-dialog "><div class="xf-dialog-content"></div></div>');
        return jqPopup;
    };

    /**
     Shorthand to show dialogs
     @param headerText String to show in dialog header
     @param messageText String to show in dialog body
     @param buttons Array of buttons to show ($ objects or objects with button description for createButton() method)
     */
    XF.UIElements.showDialog = function (headerText, messageText, buttons) {
        var popup = XF.UIElements.createDialog(headerText, messageText, buttons);
        XF.UIElements.showPopup(popup);
    };

    /**
     Attaches popup (dialog/notification/etc.) to the page
     @param jqPopup $ object representing popup
     */
    XF.UIElements.showPopup = function(jqPopup) {
        XF.Device.getViewport().append(jqPopup);
    };

    /**
     Detaches popup (dialog/notification/etc.) from the page
     @param jqPopup $ object representing popup
     */
    XF.UIElements.hidePopup = function(jqPopup) {
        jqPopup.detach();
    };


    /**
     Generates a dialog with header, message and buttons
     @param headerText String to show in dialog header
     @param messageText String to show in dialog body
     @param buttons Array of buttons to show ($ objects or objects with button description for createButton() method)
     @param modal Boolean Flag which indicates whether the dialog is modal
     @return $ Dialog object
     */
    XF.UIElements.createDialog = function(headerText, messageText, buttons) {

        /*
         <div class="xf-dialog-box">
         <div class="xf-dialog-box-header">
         <h3>Impossible! <!-- Header text here --> </h3>
         </div>
         <div class="xf-dialog-box-content">
         <!-- Message text here -->
         You’re the smartest guy I've ever known.
         </div>
         <div class="xf-dialog-box-footer clearfix">
         <!-- Buttons here -->
         <div class="xf-grid-unit xf-grid-unit-1of2">
         <button class="xf-button xf-button-small">
         <span class="xf-button-text">Cancel</span>
         </button>
         </div>
         <div class="xf-grid-unit xf-grid-unit-1of2">
         <button class="xf-button xf-button-small xf-button-special">
         <span class="xf-button-text">OK</span>
         </button>
         </div>
         </div>
         </div>
         */

        var jqDialog = XF.UIElements.createPopup();
        jqDialog.find('.xf-dialog-content')
            .append(
                $('<div></div>')
                    .addClass('xf-dialog-box')
                    .append(
                        $('<div></div>')
                            .addClass('xf-dialog-box-header')
                            .append(
                                $('<h3></h3>')
                                    .html(headerText)
                            )
                    )
                    .append(
                        $('<div></div>')
                            .addClass('xf-dialog-box-content')
                            .html(messageText)
                    )
                    .append(
                        $('<div></div>')
                            .addClass('xf-dialog-box-footer clearfix')
                    )
            );

        var jqBtnContainer = jqDialog.find('.xf-dialog-box-footer');

        if (!buttons) {
            buttons = [{
                text: 'OK',
                handler: function (){
                    XF.UIElements.hidePopup(jqDialog);
                }
            }]
        }

        if(buttons) {
            var btnCount = buttons.length;

            var jqBtn;
            _.each(buttons, function(btn, index, buttons){
                if(btn instanceof $){
                    jqBtn = btn;
                } else {
                    jqBtn = XF.UIElements.createButton(btn);
                }

                jqBtnContainer.append(
                    $('<div></div>')
                        .addClass('xf-grid-unit xf-grid-unit-1of' + btnCount)
                        .append(jqBtn)
                );
            });
        }
        XF.UIElements.dialog = jqDialog;
        return jqDialog;
    };

    /**
     Generates a notification with text and icon
     @param messageText String to show in dialog body
     @param iconName Icon name (optional)
     @return $ Notification object
     */
    XF.UIElements.createNotification = function(messageText, iconName) {

        /*
         <div class="xf-notification">
         <div class="xf-notification-wrap">
         <div class="xf-notification-icon">
         <span class="xf-icon xf-icon-xl xf-icon-dots"></span>
         </div>
         <div class="xf-notification-text">
         Loading...
         </div>
         </div>
         </div>
         */

        var jqNotification = XF.UIElements.createPopup().addClass('xf-dialog-notification');
        jqNotification.find('.xf-dialog-content')
            .append(
                $('<div></div>')
                    .addClass('xf-notification')
                    .append(
                        $('<div></div>')
                            .addClass('xf-notification-wrap')
                            .append(
                                $('<div></div>')
                                    .addClass('xf-notification-text')
                                    .html(messageText)
                            )
                    )
            );

        if(iconName && iconName != '') {
            jqNotification.find('.xf-notification-wrap')
                .prepend(
                    $('<div></div>')
                        .addClass('xf-notification-icon')
                        .append(
                            $('<span></span>')
                                .addClass('xf-icon xf-icon-xl xf-icon-' + iconName)
                        )
                );
        }

        return jqNotification;
    };

    /**
     Stores loading notification object
     @type $
     @private
     */
    XF.UIElements.loadingNotification = null;


    /**
     Stores dialog object
     @type $
     @private
     */
    XF.UIElements.dialog = null;

    /**
     Saves passed popup as default loading notification
     @param jqPopup $ object representing popup
     */
    XF.UIElements.setLoadingNotification = function(jqPopup) {
        XF.UIElements.loadingNotification = jqPopup;
    };

    /**
     Shows loading notification (and generates new if params are passed)
     @param messageText String to show in loading notification
     @param icon Icon name (optional)
     */
    XF.UIElements.showLoading = function (messageText, icon) {
        if(messageText || icon) {
            if(XF.UIElements.loadingNotification) {
                XF.UIElements.hideLoading();
            }
            XF.UIElements.setLoadingNotification(
                XF.UIElements.createNotification(messageText, icon)
            );
        }
        if(!XF.UIElements.loadingNotification) {
            XF.UIElements.setLoadingNotification(
                XF.UIElements.createNotification('Loading...')
            );
        }
        XF.UIElements.showPopup(XF.UIElements.loadingNotification);
    };

    /**
     Hides loading notification
     */
    XF.UIElements.hideLoading = function () {
        if(XF.UIElements.loadingNotification) {
            XF.UIElements.hidePopup(XF.UIElements.loadingNotification);
        }
    };

    /**
     Hides Dialog
     */
    XF.UIElements.hideDialog = function () {
        if(XF.UIElements.dialog) {
            XF.UIElements.hidePopup(XF.UIElements.dialog);
        }
    };
}).call(this, window, Backbone);

//New file

(function(window, BB) {
    XF.UIElements.enhancementList.scrollable = {
        selector : '[data-scrollable=true]',
        enhanceMethod : 'enhanceScrollable'
    };

    /**
     Adds scrolling functionality
     @param scrollable DOM Object
     @private
     */
    XF.UIElements.enhanceScrollable = function(scrollable) {

        var jQScrollable = $(scrollable);
        if(!scrollable || !jQScrollable instanceof $) {
            return;
        }

        if(jQScrollable.attr('data-skip-enhance') == 'true') {
            return;
        }

        jQScrollable.attr({'data-skip-enhance':true});

        var children = jQScrollable.children();
        // always create wrapper
        if(children.length == 1 && false) {
            children.addClass('xf-scrollable-content');
        } else {
            jQScrollable.append(
                $('<div></div>')
                    .addClass('xf-scrollable-content')
                    .append(children)
            );
        }

        var wrapperId = jQScrollable.attr('id');
        if(!wrapperId || wrapperId == '') {
            wrapperId = 'xf_scrollable_' + new Date().getTime();
            jQScrollable.attr({'id':wrapperId});
        }

        var ISItem = jQScrollable.data('iscroll', new iScroll(wrapperId));
        var wrapperChanged = false;
        var doRefreshIScroll = function() {
            if(wrapperChanged) {
                wrapperChanged = false;
                ISItem.data('iscroll').refresh();
                bindHanlders();
            }
        };
        var needRefreshIScroll = function(){
            if($.contains($('#' + wrapperId)[0], this)) {
                wrapperChanged = true;
                setTimeout(doRefreshIScroll, 100);
            }
        };

        var bindHanlders = function() {
            $('#' + wrapperId + ' *')
                .bind('detach', needRefreshIScroll)
                .bind('hide', needRefreshIScroll)
                .bind('show', needRefreshIScroll)
                .bind('append', needRefreshIScroll)
                .bind('prepend', needRefreshIScroll)
                .bind('html', needRefreshIScroll)
                .bind('resize', needRefreshIScroll);
        };

        bindHanlders();
    };
}).call(this, window, Backbone);

//New file

(function(window, BB) {
    XF.UIElements.enhancementList.textinput = {
        selector : 'INPUT[type=text], INPUT[type=search], INPUT[type=tel], ' +
                    'INPUT[type=url], INPUT[type=email], INPUT[type=password], INPUT[type=datetime], ' +
                    'INPUT[type=date], INPUT[type=month], INPUT[type=week], INPUT[type=time], ' +
                    'INPUT[type=datetime-local], INPUT[type=number], INPUT[type=color], TEXTAREA, ' +
                    //
                    'INPUT[type=range], INPUT[type=search]',
        enhanceMethod : 'enhanceTextInput'
    };
    /**
     Enhances text input view
     @param textInput DOM Object
     @private
     */
    XF.UIElements.enhanceTextInput = function(textInput) {

        var jQTextInput = $(textInput);
        if(!textInput || !jQTextInput instanceof $) {
            return;
        }

        if(jQTextInput.attr('data-skip-enhance') == 'true') {
            return;
        }

        jQTextInput.attr({'data-skip-enhance':true});

        // For inputs of types:
        // 	text, search, tel, url, email, password, datetime, date, month,
        // 	week, time, datetime-local, number, color and also for TEXTAREA element
        // 	add class "xf-input-text".
        jQTextInput.addClass('xf-input-text');

        var isInputElement = (textInput.nodeName == 'INPUT');
        var textInputType = jQTextInput.attr('type');

        // For inputs of types "range" and "search" change type to "text".
        if(textInputType == 'search') {
            var newTextInput = $('<input type="text"/>');
            var newTIAttrs = {};
            _.each(textInput.attributes, function(attribute) {
                if(attribute.name == 'type') {
                    return;
                }
                newTIAttrs[attribute.name] = attribute.value;
            });
            newTextInput.attr(newTIAttrs);
            jQTextInput.outerHtml(newTextInput);
            jQTextInput = newTextInput;
            textInput = newTextInput[0];

            /*
             <div class="xf-input-number">
             <button class="xf-input-number-control xf-input-number-control-decrease "
             type="button">
             <span class="xf-icon xf-icon-big xf-icon-minus-circled"></span>
             </button>
             <input type="text" class="xf-input-text" min="0" max="1200" value="400">
             <button class="xf-input-number-control xf-input-number-control-increase"
             type="button">
             <span class="xf-icon xf-icon-big xf-icon-plus-circled"></span>
             </button>
             </div>
             */
        } else if(textInputType == 'number' || textInputType == 'range') {

            var minValue = jQTextInput.attr('min');
            var maxValue = jQTextInput.attr('max');
            var selValue = parseFloat(jQTextInput.attr('value'));
            var step = parseFloat(jQTextInput.attr('step')) || 1;

            // For inputs of types "range" and "search" change type to "text".
            var newTextInput = $('<input type="text"/>');
            var newTIAttrs = {};
            _.each(textInput.attributes, function(attribute) {
                if(attribute.name == 'type') {
                    return;
                }
                newTIAttrs[attribute.name] = attribute.value;
            });
            newTextInput.attr(newTIAttrs);
            newTextInput.attr({'data-skip-enhance':true})

            var numberWrapper = $('<div></div>').addClass('xf-input-number');
            numberWrapper.append(
                $('<button type="button"></button>')
                    .addClass('xf-input-number-control xf-input-number-control-decrease')
                    .attr({'data-skip-enhance':true})
                    .append(
                        $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-minus-circled')
                    )
            );
            numberWrapper.append(newTextInput);
            numberWrapper.append(
                $('<button type="button"></button>')
                    .addClass('xf-input-number-control xf-input-number-control-increase')
                    .attr({'data-skip-enhance':true})
                    .append(
                        $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-plus-circled')
                    )
            );

            var rangeWrapper = null;

            if(textInputType == 'number') {

                jQTextInput.outerHtml(numberWrapper);
                jQTextInput = numberWrapper;
                textInput = numberWrapper[0];

            } else if(textInputType == 'range') {

                /*
                 <div class="xf-input-range">
                 <div class="xf-range-wrap">
                 <div class="xf-input-range-min">0</div>
                 <div class="xf-input-range-slider">
                 <div class="xf-input-range-track">
                 <div class="xf-input-range-value" style="width: 30%">
                 <div class="xf-input-range-control" tabindex="0">
                 <div class="xf-input-range-thumb" title="400"></div>
                 </div>
                 </div>
                 </div>
                 </div>
                 <div class="xf-input-range-max">1200</div>
                 </div>
                 </div>
                 */

                rangeWrapper = $('<div></div>').addClass('xf-range');
                rangeWrapper.append(numberWrapper);

                // If there is no either min or max attribute -- don't render the slider.
                if((minValue || minValue === 0) && (maxValue || maxValue === 0)) {

                    minValue = parseFloat(minValue);
                    maxValue = parseFloat(maxValue);

                    var percValue = (selValue - minValue) * 100 / (maxValue - minValue);
                    rangeWrapper.append(
                            $('<div></div>')
                                .addClass('xf-input-range')
                                .append(
                                    $('<div></div>')
                                        .addClass('xf-range-wrap')
                                        .append(
                                            $('<div></div>')
                                                .addClass('xf-input-range-min')
                                                .html(minValue)
                                        )
                                        .append(
                                            $('<div></div>')
                                                .addClass('xf-input-range-slider')
                                                .append(
                                                    $('<div></div>')
                                                        .addClass('xf-input-range-track')
                                                        .append(
                                                            $('<div></div>')
                                                                .addClass('xf-input-range-value')
                                                                .css({'width':'' + percValue + '%'})
                                                                .append(
                                                                    $('<div></div>')
                                                                        .addClass('xf-input-range-control')
                                                                        .attr({'tabindex':'0'})
                                                                        .append(
                                                                            $('<div></div>')
                                                                                .addClass('xf-input-range-thumb')
                                                                                .attr({'title':'' + selValue})
                                                                                .css({'left':'' + 100 + '%'})
                                                                        )
                                                                )
                                                        )
                                                )
                                        )
                                        .append(
                                            $('<div></div>')
                                                .addClass('xf-input-range-max')
                                                .html(maxValue)
                                        )
                                )
                        )
                        .append($('<div></div>').addClass('xf-slider'));

                    jQTextInput.outerHtml(rangeWrapper);
                    jQTextInput = rangeWrapper;
                    textInput = rangeWrapper[0];
                }

            }

            var setNewValue = function(newValue) {

                var modulo = newValue % step;
                var steppedVal = newValue - modulo;
                if(modulo > step/2) {
                    steppedVal += step;
                }
                newValue = steppedVal;

                if((maxValue || maxValue === 0) && newValue > maxValue) {
                    newValue = maxValue;
                }

                if((minValue || minValue === 0) && newValue < minValue) {
                    newValue = minValue;
                }

                selValue = newValue;

                newTextInput.attr({'value':newValue});

                if(rangeWrapper) {
                    rangeWrapper.find('div.xf-input-range-thumb').attr({'title':newValue});

                    var percValue = (newValue - minValue) * 100 / (maxValue - minValue);
                    rangeWrapper.find('div.xf-input-range-value').css({'width':'' + percValue + '%'});
                }

            };

            var stepUp = function() {
                var newValue = parseFloat(newTextInput.attr('value'));
                newValue += step;
                setNewValue(newValue);
            };

            var stepDown = function() {
                var newValue = parseFloat(newTextInput.attr('value'));
                newValue -= step;
                setNewValue(newValue);
            };

            // initialing number stepper buttons (-) & (+) click handlers
            numberWrapper.find('button.xf-input-number-control-decrease').click(stepDown);
            numberWrapper.find('button.xf-input-number-control-increase').click(stepUp);

            var savedInputText = newTextInput.attr('value');
            var newInputText;
            var inputTextChange = function(event) {
                newInputText = newTextInput.attr('value');
                // prevent multiple recalculations in case when several events where triggered
                if(savedInputText == newInputText) {
                    return;
                }

                newInputText = parseFloat(newInputText);
                if(isNaN(newInputText)) {
                    newInputText = minValue;
                }
                savedInputText = newInputText;
                setNewValue(newInputText);
            };

            newTextInput
                .change(inputTextChange)
                //.keyup(inputTextChange)
                //.keydown(inputTextChange)
                .focus(inputTextChange)
                .focusout(inputTextChange);

            if(rangeWrapper) {

                var trackW = undefined;
                var savedVal;
                var valueDiff;
                var mousePrevX;
                var mouseNewX;
                var mouseDiff;

                var trackDiffToValueDiff = function(trackDiff) {
                    if(!trackW) {
                        trackW = rangeWrapper.find('div.xf-input-range-track')[0].clientWidth;
                    }
                    return (trackDiff / trackW * (maxValue - minValue));
                };

                var trackPointToValuePoint = function(trackPoint) {
                    return (trackDiffToValueDiff(trackPoint) + minValue);
                };

                var startThumbDrag = function() {
                    mousePrevX = event.pageX || event.clientX || layerX || event.screenX;
                    savedVal = selValue;
                    $(document).bind('mouseup', stopThumbDrag);
                    $(document).bind('mousemove', doThumbDrag);
                };

                var doThumbDrag = function() {
                    mouseNewX = event.pageX || event.clientX || layerX || event.screenX;
                    mouseDiff = mouseNewX - mousePrevX;
                    valueDiff = trackDiffToValueDiff(mouseDiff);
                    mousePrevX = mouseNewX;
                    savedVal += valueDiff;
                    setNewValue(savedVal);
                };

                var stopThumbDrag = function() {
                    $(document).unbind('mouseup', stopThumbDrag);
                    $(document).unbind('mousemove', doThumbDrag);
                };

                var startThumbPress = function() {
                    $(document).bind('keydown', doThumbPress);
                };

                var doThumbPress = function(event) {
                    switch(event.keyCode) {
                        // PG Up
                        case 33:
                            setNewValue(selValue + 3*step);
                            break;
                        // PG Down
                        case 34:
                            setNewValue(selValue - 3*step);
                            break;
                        // End
                        case 35:
                            setNewValue(maxValue);
                            break;
                        // Home
                        case 36:
                            setNewValue(minValue);
                            break;
                        // arrow up
                        case 38:
                        // arrow right
                        case 39:
                            setNewValue(selValue + step);
                            break;
                        // arrow left
                        case 37:
                        // arrow down
                        case 40:
                            setNewValue(selValue - step);
                            break;
                    }
                };

                var stopThumbPress = function() {
                    $(document).unbind('keydown', doThumbPress);
                };

                // initialing slider thumb dragging handler
                rangeWrapper.find('div.xf-input-range-thumb').bind('mousedown', startThumbDrag);

                // initialing arrow keys press handling
                rangeWrapper.find('div.xf-input-range-control')
                    .bind('focus', startThumbPress)
                    .bind('focusout', stopThumbPress);

                var trackClick = function(event) {
                    // skipping events fired by thumb dragging
                    if(event.target == rangeWrapper.find('div.xf-input-range-thumb')[0]) {
                        return;
                    }
                    setNewValue(trackPointToValuePoint(event.offsetX));
                };

                // initialing track click handler
                rangeWrapper.find('div.xf-input-range-track').bind('click', trackClick);
            }
        }

        // Some Text-based inputs (text, search, tel, url, email, password, datetime, date, month,
        // week, time, datetime-local, color) with data-appearance="split" attribute
        // are parsed specifically:
        var splitAppearance = false;
        if(jQTextInput.attr('data-appearance') == 'split' && isInputElement) {

            var applicableTypes = ['text', 'search', 'tel', 'url', 'email',
                'password', 'datetime', 'date', 'month', 'week', 'time', 'datetime-local', 'color'];

            _.each(applicableTypes, function(applicableType) {
                if(textInputType == applicableType) {
                    splitAppearance = true;
                }
            });
        }

        var textInputID = jQTextInput.attr('id');
        var textInputLabel = (textInputID.length) ? $('label[for=' + textInputID + ']') : [];

        // If the input doesn't have an associated label, quit
        if(textInputLabel.length) {

            if(splitAppearance) {

                // Add class xf-input-split-input to the input
                jQTextInput.removeClass('xf-input-text').addClass('xf-input-split-input');

                // Add class xf-input-split-label to the label
                textInputLabel.addClass('xf-input-split-label');

                // Wrap both in div.xf-input-split
                var splitDiv = $('<div></div>').addClass('xf-input-split');

                // Wrap the label in div.xf-grid-unit.xf-input-split-part1
                splitDiv.append($('<div></div>').addClass('xf-grid-unit xf-input-split-part1').append(textInputLabel));

                // Wrap the input in div.xf-grid-unit.xf-input-split-part2
                splitDiv.append($('<div></div>').addClass('xf-grid-unit xf-input-split-part2').append(jQTextInput.clone()));

                jQTextInput.outerHtml(splitDiv);
                jQTextInput = splitDiv;
                textInput = splitDiv[0];

            } else {

                // If inputs of the named types and textarea have a label associated to them (with "for" attribute
                // with a value equal to input "id" attribute), the label is assigned a class name of "xf-label"
                textInputLabel.addClass('xf-label');

            }
        }
    };
}).call(this, window, Backbone);
