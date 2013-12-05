define([
    './xf.core',
    'jquery',
    './xf.device'
], function(XF, $) {

    // Method announces touchevents for elements
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
            };

            // Detecting swipe direction
            var swipeDirection = function (x1, x2, y1, y2) {
                var xDelta = Math.abs(x1 - x2),
                    yDelta = Math.abs(y1 - y2);
                return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
            };

            // Cancelling all hadlers
            var cancelAll = function () {
                touchHandler = {};
            };

            // Events binding
            $(document).ready(function () {
                var now,
                    delta;

                $(document.body).bind(eventsHandler[eventType].start, function (e) { // Pointer / Touch start event
                    now = Date.now();
                    delta = now - (touchHandler.last || now);
                    touchHandler.el = $(parentIfText(isTouch ? e.originalEvent.targetTouches[0].target : e.originalEvent.target));
                    touchHandler.x1 = isTouch ? e.originalEvent.targetTouches[0].clientX : e.originalEvent.clientX;
                    touchHandler.y1 = isTouch ? e.originalEvent.targetTouches[0].clientY : e.originalEvent.clientY;
                    touchHandler.last = now;
                    
                }).bind(eventsHandler[eventType].move, function (e) { // Pointer / Touch move event
                    touchHandler.x2 = isTouch ? e.originalEvent.targetTouches[0].clientX : e.originalEvent.clientX;
                    touchHandler.y2 = isTouch ? e.originalEvent.targetTouches[0].clientY : e.originalEvent.clientY;

                    if (Math.abs(touchHandler.x1 - touchHandler.x2) > 10) {
                        e.preventDefault();
                    }
                }).bind(eventsHandler[eventType].end, function (e) { // Pointer / Touch end event

                    if ((touchHandler.x2 && Math.abs(touchHandler.x1 - touchHandler.x2) > swipeDelta) ||
                        (touchHandler.y2 && Math.abs(touchHandler.y1 - touchHandler.y2) > swipeDelta)) {
                        touchHandler.direction = swipeDirection(touchHandler.x1, touchHandler.x2, touchHandler.y1, touchHandler.y2);

                        // Trigger swipe event
                        touchHandler.el.trigger('swipe');

                        // Trigger swipe event by it's direction
                        touchHandler.el.trigger('swipe' + touchHandler.direction);
                        touchHandler = {};
                        
                    } else if ('last' in touchHandler) {
                        
                        // Trigger tap event
                        touchHandler.el.trigger('tap');

                        // Unbind click event if tap
                        $(document.body).unbind('click');
                        touchHandler.el.unbind('click');
                        
                    }
                });

                // Cancel all handlers if window scroll
                $(window).bind('scroll', cancelAll);
            });

            // List of new events
            $.each(['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'tap'], function (i, key){
                $.fn[key] = function (callback) {
                    return this.bind(key, callback);
                };
            });
        }

    };

    return XF;
});
