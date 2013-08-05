;(function($){
    'use strict';
    var touchHandler = {},
        eventsHandler = {
            touchstart : "mousedown",
            touchmove : "mousemove",
            touchend : "mouseup",
            touchcancel : "mouseup",
            istouch : false
        },
        swipeDelta = 30,
        isPointerEvents = window.navigator.msPointerEnabled,
        isTouchEvents = !isPointerEvents && (window.propertyIsEnumerable('ontouchstart') || window.document.hasOwnProperty('ontouchstart'));

    if (isPointerEvents) {
        eventsHandler.touchstart = "MSPointerDown";
        eventsHandler.touchmove = "MSPointerMove";
        eventsHandler.touchend = "MSPointerUp";
        eventsHandler.touchcancel = "MSPointerCancel";
        eventsHandler.istouch = false;
    } else {

        if (isTouchEvents) {
            eventsHandler.touchstart = "touchstart";
            eventsHandler.touchmove = "touchmove";
            eventsHandler.touchend = "touchend";
            eventsHandler.touchcancel = "touchcancel";
            eventsHandler.istouch = true;
        }
    }

    function parentIfText(node) {
        return 'tagName' in node ? node : node.parentNode;
    }

    function swipeDirection(x1, x2, y1, y2) {
        var xDelta = Math.abs(x1 - x2),
            yDelta = Math.abs(y1 - y2);
        return xDelta >= yDelta ? (x1 - x2 > 0 ? 'Left' : 'Right') : (y1 - y2 > 0 ? 'Up' : 'Down');
    }

    function cancelAll() {
        touchHandler = {};
    }

    $(document).ready(function(){
        var now,
            delta;

        $(document.body).bind(eventsHandler.touchstart, function(e){
            now = Date.now();
            delta = now - (touchHandler.last || now);
            touchHandler.el = $(parentIfText(e.target));
            touchHandler.x1 = eventsHandler.istouch ? e.originalEvent.targetTouches[0].pageX : e.pageX;
            touchHandler.y1 = eventsHandler.istouch ? e.originalEvent.targetTouches[0].pageY : e.pageY;
            touchHandler.last = now;
        }).bind(eventsHandler.touchmove, function (e) {
            touchHandler.x2 = eventsHandler.istouch ? e.originalEvent.targetTouches[0].pageX : e.pageX;
            touchHandler.y2 = eventsHandler.istouch ? e.originalEvent.targetTouches[0].pageY : e.pageY;

            if (Math.abs(touchHandler.x1 - touchHandler.x2) > 10) {
                e.preventDefault();
            }
        }).bind(eventsHandler.touchend, function(e){

            if ((touchHandler.x2 && Math.abs(touchHandler.x1 - touchHandler.x2) > swipeDelta)
                || (touchHandler.y2 && Math.abs(touchHandler.y1 - touchHandler.y2) > swipeDelta)) {
                touchHandler.direction = swipeDirection(touchHandler.x1, touchHandler.x2, touchHandler.y1, touchHandler.y2);
                touchHandler.el.trigger('swipe');
                touchHandler.el.trigger('swipe' + touchHandler.direction);
                touchHandler = {};
            } else if ('last' in touchHandler) {
                touchHandler.el.trigger('tap');
                touchHandler.el.unbind('click');
            }
        }).bind(eventsHandler.touchcancel, cancelAll);

        $(window).bind('scroll', cancelAll);
    });

    ['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown', 'tap'].forEach(function(m){
        $.fn[m] = function(callback){ return this.bind(m, callback) }
    });

})(jQuery);