define([
    'jquery'
], function($) {

    /**
     * Adapter to wrap jQuery or jQuery like libraries.
     * @exports Dom
     */

    var Dom = (function() {

        /**
         * jQueryWrapper is an object with private field _element which store
         * actual jQuery object. This constructor is supposed to be used as
         * function like: var domElement = Dom('.class').
         *
         * @param {jQueryWrapper|Element|$|string|undefined} element Object to
         *      be wrapped, can be any of type.
         * @returns {jQueryWrapper}
         * @constructor
         */
        var jQueryWrapper = function(element) {
            if (element !== undefined) {
                if (element instanceof jQueryWrapper) {
                    return element;
                }
                var result = new jQueryWrapper();
                result._element = $(element);
                return result;
            }
        };

        /**
         * Methods of Dom object that applied to element.
         */
        jQueryWrapper.prototype = {
            /** Wrapper around jQuery.fn.attr. */
            attr: function(attributeName) {
                return this._element.attr(attributeName);
            },
            /** Wrapper around jQuery.fn.data. */
            data: function(key, value) {
                if (value !== undefined) {
                    this._element.data(key, value);
                    return this;
                }
                return this._element.data(key);
            },
            /** Wrapper around jQuery.fn.is. */
            is: function(selector) {
                return this._element.is(selector);
            },
            /** Wrapper around jQuery.fn.find. */
            find: function(selector) {
                return jQueryWrapper(this._element.find(selector));
            },
            /** Wrapper around jQuery.fn.eq. */
            eq: function(number) {
                return jQueryWrapper(this._element.eq(number));
            },
            /** Wrapper around jQuery.fn.parent. */
            parent: function() {
                return jQueryWrapper(this._element.parent());
            },
            /** Wrapper around jQuery.fn.filter. */
            filter: function(selector) {
                return jQueryWrapper(this._element.filter(selector));
            },
            /** Wrapper around jQuery.fn.first. */
            first: function() {
                return jQueryWrapper(this._element.first());
            },
            /** Wrapper around jQuery.fn.append. */
            append: function(content) {
                this._element.append(content);
                return this;
            },
            /** Wrapper around jQuery.fn.get. */
            get: function(number) {
                return this._element.get(number);
            },
            /** Wrapper around jQuery.fn.size. */
            size: function() {
                return this._element.size();
            },
            /** Wrapper around jQuery.fn.each. */
            each: function(callback) {
                this._element.each(callback);
            },



            /** Wrapper around jQuery.fn.on. */
            on: function(events, selector, data, handler) {
                this._element.on(events, selector, data, handler);
                return this;
            },
            /** Wrapper around jQuery.fn.bind. */
            bind: function(eventType, eventData, handler) {
                this._element.bind(eventType, eventData, handler);
                return this;
            },
            /** Wrapper around jQuery.fn.unbind. */
            unbind: function(eventType, handler) {
                this._element.unbind(eventType, handler);
                return this;
            },
            /** Wrapper around jQuery.fn.trigger. */
            trigger: function(eventType) {
                this._element.trigger(eventType);
                return this;
            },
            /** Creates listener for animation end event. */
            animationEnd: function (callback) {
                var animationEndEvents = 'webkitAnimationEnd oAnimationEnd ' +
                        'msAnimationEnd animationend';

                this._element.one(animationEndEvents, callback);

                return this;
            },



            /** Wrapper around jQuery.fn.addClass. */
            addClass: function(className) {
                this._element.addClass(className);
                return this;
            },
            /** Wrapper around jQuery.fn.removeClass. */
            removeClass: function(className) {
                this._element.removeClass(className);
                return this;
            },
            /** Wrapper around jQuery.fn.height. */
            height: function(height) {
                if (height !== undefined) {
                    this._element.height(height);
                    return this;
                }
                return this._element.height();
            },
            /** Wrapper around jQuery.fn.width. */
            width: function(width) {
                if (width !== undefined) {
                    this._element.width(width);
                    return this;
                }
                return this._element.width();
            }
        };

        /**
         * Static method of wrapper object.
         */

        /**
         * @type {jQueryWrapper} Root DOM Object for starting the application.
         * @private
         */
        jQueryWrapper.root = jQueryWrapper('body');

        /**
         * Wraps jQuery.ajax routine.
         * @param {Object} params Object to be passed into jQuery.ajax.
         */
        jQueryWrapper.ajax = function(params) {
            $.ajax(params);
        };

        /**
         * Delays a function to execute when the DOM is fully loaded.
         * @param {Function} callback Function to be executed.
         */
        jQueryWrapper.ready = function(callback) {
            $(callback);
        };

        jQueryWrapper.viewport = {
            /** @returns {number} Height of viewport. */
            height: function() {
                return $(window).height();
            },
            /** @returns {number} Width of viewport. */
            width: function() {
                return $(window).width();
            }
        };

        /**
         * Binds a function to execute on window scroll.
         * @param {Function} callback Function to be executed.
         */
        jQueryWrapper.onscroll = function(callback) {
            $(window).bind('scroll', callback);
        };

        /** Creates method in $.fn for different animation events. */
        jQueryWrapper.bindAnimations = function() {
            $.each(['swipe', 'swipeLeft', 'swipeRight', 'swipeUp', 'swipeDown',
                'tap'],
                    function(index, key){
                        $.fn[key] = function(callback) {
                            return this.bind(key, callback);
                        };
                    });
        };

        /**
         * Enchants jQuery DOM manipulations method to fire XF event listener.
         *
         * @param {string} selector Selector for child elements, whose presents
         *      in changed DOM element should fire a callback.
         * @param {Function} callback Function to be called.
         */
        jQueryWrapper.trackDomChanges = function(selector, callback) {
            $.each(['show', 'html', 'append', 'prepend'], function(index, key) {
                var oldHandler = $.fn[key];
                $.fn[key] = function() {
                    var res = oldHandler.apply(this, arguments);
                    if ($(this).find(selector).length) {
                        callback(this);
                    }
                    return res;
                };
            });
        };

        return jQueryWrapper;
    })();

    return Dom;
});
