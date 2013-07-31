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


