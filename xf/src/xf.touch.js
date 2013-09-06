
    XF.touch = {

        init : function () {
            // Default values and device events detection
            var touchHandler = {},
                eventsHandler = {

                    // Events for desktop browser, old ios, old android
                    mouse : {
                        start : "mousedown",
                        move : "mousemove",
                        end : "mouseup",
                        cancel : "mouseup"
                    },

                    // Events for modern Windows devices (IE10+)
                    pointer : {
                        start : "MSPointerDown",
                        move : "MSPointerMove",
                        end : "MSPointerUp",
                        cancel : "MSPointerCancel"
                    },

                    // Events for touchable devices
                    touch : {
                        start : "touchstart",
                        move : "touchmove",
                        end : "touchend",
                        cancel : "touchcancel"
                    }
                },
                swipeDelta = 30, // Amount of pixels for swipe event
                isTouch,
                eventType;

            // Changing events depending on detected data
            isTouch = (XF.device.supports.pointerEvents) ? false : (XF.device.supports.touchEvents ? true : false);
            eventType = (XF.device.supports.pointerEvents) ? 'pointer' : (XF.device.supports.touchEvents ? 'touch' : 'mouse');

            // If target is text
            var parentIfText = function (node) {
                return 'tagName' in node ? node : node.parentNode;
            }

            // Detecting swipe direction
            var swipeDirection = function (x1, x2, y1, y2) {
                var xDelta = Math.abs(x1 - x2),
                    yDelta = Math.abs(y1 - y2);
                return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
            }

            var cancelAll = function () {
                touchHandler = {};
            }

            $(document).ready(function () {
                var now,
                    delta;

                $(document.body).bind(eventsHandler[eventType].start, function(e){
                    now = Date.now();
                    delta = now - (touchHandler.last || now);
                    touchHandler.el = $(parentIfText(isTouch ? e.originalEvent.targetTouches[0].target : e.target));
                    touchHandler.x1 = isTouch ? e.originalEvent.targetTouches[0].pageX : e.pageX;
                    touchHandler.y1 = isTouch ? e.originalEvent.targetTouches[0].pageY : e.pageY;
                    touchHandler.last = now;
                }).bind(eventsHandler[eventType].move, function (e) {
                    touchHandler.x2 = isTouch ? e.originalEvent.targetTouches[0].pageX : e.pageX;
                    touchHandler.y2 = isTouch ? e.originalEvent.targetTouches[0].pageY : e.pageY;

                    if (Math.abs(touchHandler.x1 - touchHandler.x2) > 10) {
                        e.preventDefault();
                    }
                }).bind(eventsHandler[eventType].end, function(e){

                    if ((touchHandler.x2 && Math.abs(touchHandler.x1 - touchHandler.x2) > swipeDelta)
                        || (touchHandler.y2 && Math.abs(touchHandler.y1 - touchHandler.y2) > swipeDelta)) {
                        touchHandler.direction = swipeDirection(touchHandler.x1, touchHandler.x2, touchHandler.y1, touchHandler.y2);

                        // Trigger swipe event
                        touchHandler.el.trigger('swipe');

                        // Trigger swipe event by it's direction
                        touchHandler.el.trigger('swipe' + touchHandler.direction);
                        touchHandler = {};
                    } else if ('last' in touchHandler) {
                        touchHandler.el.trigger('tap');

                        // Unbind click event if tap
                        $(document.body).unbind('click');
                        touchHandler.el.unbind('click');
                    }
                });

                $(window).bind('scroll', cancelAll);
            });

            // List of new events
            ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'tap'].forEach(function (i){
                $.fn[i] = function (callback) {
                    return this.bind(i, callback)
                };
            });
        }

    };