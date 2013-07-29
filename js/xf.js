/**
 TODO:
 - scrollTop for Zepto
 - wrapInner for Zepto
 **/

(function (window, BB) {

    /* $ hooks */

    var _oldhide = $.fn.hide;
    /** @ignore */
    $.fn.hide = function(speed, callback) {
        var res = _oldhide.apply(this,arguments);
        $(this).trigger('hide');
        return res;
    };

    var _oldshow = $.fn.show;
    /** @ignore */
    $.fn.show = function(speed, callback) {
        var res = _oldshow.apply(this,arguments);
        $(this).trigger('show');
        return res;
    };

    var _oldhtml = $.fn.html;
    /** @ignore */
    $.fn.html = function(a) {
        var res = _oldhtml.apply(this,arguments);
        $(this).trigger('show');
        $(this).trigger('html');
        return res;
    };

    var _oldappend = $.fn.append;
    /** @ignore */
    $.fn.append = function() {
        var res = _oldappend.apply(this,arguments);
        $(this).trigger('append');
        return res;
    };

    var _oldprepend = $.fn.prepend;
    /** @ignore */
    $.fn.prepend = function() {
        var res = _oldprepend.apply(this,arguments);
        $(this).trigger('prepend');
        return res;
    };

    if (!_.isFunction($.fn.detach)) {
        $.fn.detach = function(a) {
            return this.remove(a,!0);
        }
    }

    if (!_.isFunction($.fn.wrapInner)) {
        $.fn.wrapInner = function( html ) {
            if ( _.isFunction( html ) ) {
                return this.each(function(i) {
                    $(this).wrapInner( html.call(this, i) );
                });
            }

            return this.each(function() {
                var self = $( this ),
                    contents = self.contents();

                if ( contents.length ) {
                    contents.wrapAll( html );

                } else {
                    self.append( html );
                }
            });
        }
    }

    var _olddetach = $.fn.detach;
    /** @ignore */
    $.fn.detach = function() {
        var parent = $(this).parent();
        var res = _olddetach.apply(this,arguments);
        parent.trigger('detach');
        return res;
    };


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



    /**
     @namespace Holds visible functionality of the framework
     */
    XF = window.XF = window.XF || {};


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     @function
     @public
     @param {Object} options
     @param {Object} options.settings User-defined settings which would override {@link XF.Settings}
     @param {Object} options.router Options required for {@link XF.Router}
     @param {Object} options.router.routes list of routes for {@link XF.Router}
     @param {Object} options.router.handlers list of route handlers for {@link XF.Router}
     @description Launches the app with specified options
     */
    XF.start = function(options) {

        options = options || {};

        // Creating static singletones
        XF.Cache = new XF.CacheClass();
        XF.Controller = new XF.ControllerClass();
        XF.Device = new XF.DeviceClass();
        XF.PageSwitcher = new XF.PageSwitcherClass();

        // options.settings
        XF.Settings.bulkSet(options.settings);

        // initializing XF.Cache
        XF.Cache.init();

        // initializing XF.Device
        options.device = options.device || {};
        XF.Device.init(options.device.types);

        // options.router
        options.router = options.router || {};
        createRouter(options.router);

        placeAnchorHooks();
        bindHideShowListeners();

        // options.root
        rootDOMObject = options.root;
        if(!rootDOMObject) {
            rootDOMObject = $('body');
        }
        loadChildComponents(rootDOMObject);
    };

    /**
     @namespace Holds all the reusable util functions
     */
    XF.Utils = {};

    /**
     @namespace Holds all the reusable util functions related to Adress Bar
     */
    XF.Utils.AddressBar = {};

    _.extend(XF.Utils.AddressBar, /** @lends XF.Utils.AddressBar */{
        isMobile: (/iphone|ipad|ipod|android|blackberry|mini|windows\sce|palm/i.test(navigator.userAgent.toLowerCase())),

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


            if (this.isMobile) {
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
                        XF.Utils.AddressBar.hide();
                    }
                }, 15);

                win.addEventListener( 'load',
                    function() {
                        setTimeout(function() {
                            //at load, if user hasn't scrolled more than 20 or so...
                            if( XF.Utils.AddressBar.getScrollTop() < 20 ) {
                                //reset to hide addr bar at onload
                                XF.Utils.AddressBar.hide();
                            }
                        }, 0);
                    }
                );
            }
        }
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


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
        enhancementList : {
            button : {
                selector : 'A[data-role=button], BUTTON, INPUT[type=submit], INPUT[type=reset], INPUT[type=button] [data-appearance=backbtn]',
                enhanceMethod : 'enhanceButton'
            },
            textinput : {
                selector : 'INPUT[type=text], INPUT[type=search], INPUT[type=tel], ' +
                    'INPUT[type=url], INPUT[type=email], INPUT[type=password], INPUT[type=datetime], ' +
                    'INPUT[type=date], INPUT[type=month], INPUT[type=week], INPUT[type=time], ' +
                    'INPUT[type=datetime-local], INPUT[type=number], INPUT[type=color], TEXTAREA, ' +
                    //
                    'INPUT[type=range], INPUT[type=search]',
                enhanceMethod : 'enhanceTextInput'
            },
            checkboxRadio : {
                selector : 'INPUT[type=checkbox], INPUT[type=radio]',
                enhanceMethod : 'enhanceCheckboxRadio'
            },
            fieldset : {
                selector : 'fieldset[data-role=controlgroup]',
                enhanceMethod : 'enhanceFieldset'
            },
            list : {
                selector : 'UL[data-role=listview], OL[data-role=listview]',
                enhanceMethod : 'enhanceList'
            },
            scrollable : {
                selector : '[data-scrollable=true]',
                enhanceMethod : 'enhanceScrollable'
            }
        },

        /**
         A list of objects already enhanced (used to skip them while iterating through DOM)
         @type Array
         @private
         */
        enhanced : [],

        /**
         Make the DOM object look like a button
         @param button DOM Object
         @private
         */
        enhanceButton : function(button) {

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

        },

        /**
         Enhances text input view
         @param textInput DOM Object
         @private
         */
        enhanceTextInput : function(textInput) {

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
        },

        /**
         Enhances checkbox or radio button input view
         @param textInput DOM Object
         @private
         */
        enhanceCheckboxRadio : function(chbRbInput) {

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
        },

        /**
         Enhances fieldset view
         @param textInput DOM Object
         @private
         */
        enhanceFieldset : function(fieldset) {

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


        },

        /**
         Enhances ul/ol lists view
         @param list DOM Object
         @private
         */
        enhanceList: function(list) {

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
        },

        /**
         Adds scrolling functionality
         @param scrollable DOM Object
         @private
         */
        enhanceScrollable : function(scrollable) {

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
        },

        /**
         Generates and enhances button
         @param buttonDescr Object
         @return $
         */
        createButton: function(buttonDescr)  {
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
        },

        /**
         Generates basic popup container
         @return $
         @private
         */
        createPopup: function() {
            /*
             <div class="xf-dialog "><div class="xf-dialog-content"></div></div>
             */
            var jqPopup =
                $('<div class="xf-dialog "><div class="xf-dialog-content"></div></div>');
            return jqPopup;
        },

        /**
         Shorthand to show dialogs
         @param headerText String to show in dialog header
         @param messageText String to show in dialog body
         @param buttons Array of buttons to show ($ objects or objects with button description for createButton() method)
         */
        showDialog: function (headerText, messageText, buttons) {
            var popup = XF.UIElements.createDialog(headerText, messageText, buttons);
            XF.UIElements.showPopup(popup);
        },

        /**
         Attaches popup (dialog/notification/etc.) to the page
         @param jqPopup $ object representing popup
         */
        showPopup: function(jqPopup) {
            XF.Device.getViewport().append(jqPopup);
        },

        /**
         Detaches popup (dialog/notification/etc.) from the page
         @param jqPopup $ object representing popup
         */
        hidePopup: function(jqPopup) {
            jqPopup.detach();
        },


        /**
         Generates a dialog with header, message and buttons
         @param headerText String to show in dialog header
         @param messageText String to show in dialog body
         @param buttons Array of buttons to show ($ objects or objects with button description for createButton() method)
         @param modal Boolean Flag which indicates whether the dialog is modal
         @return $ Dialog object
         */
        createDialog: function(headerText, messageText, buttons) {

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
        },

        /**
         Generates a notification with text and icon
         @param messageText String to show in dialog body
         @param iconName Icon name (optional)
         @return $ Notification object
         */
        createNotification: function(messageText, iconName) {

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
        },

        /**
         Stores loading notification object
         @type $
         @private
         */
        loadingNotification: null,


        /**
         Stores dialog object
         @type $
         @private
         */
        dialog: null,

        /**
         Saves passed popup as default loading notification
         @param jqPopup $ object representing popup
         */
        setLoadingNotification: function(jqPopup) {
            XF.UIElements.loadingNotification = jqPopup;
        },

        /**
         Shows loading notification (and generates new if params are passed)
         @param messageText String to show in loading notification
         @param icon Icon name (optional)
         */
        showLoading: function (messageText, icon) {
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
        },

        /**
         Hides loading notification
         */
        hideLoading: function () {
            if(XF.UIElements.loadingNotification) {
                XF.UIElements.hidePopup(XF.UIElements.loadingNotification);
            }
        },

        /**
         Hides Dialog
         */
        hideDialog: function () {
            if(XF.UIElements.dialog) {
                XF.UIElements.hidePopup(XF.UIElements.dialog);
            }
        }
    });


    /**
     Creates {@link XF.Router}
     @memberOf XF
     @param {Object} routes list of routes for {@link XF.Router}
     @param {Object} handlers list of route handlers for {@link XF.Router}
     @private
     */
    var createRouter = function(options) {   debugger;
        if(XF.Router) {
            throw 'XF.createRouter can be called only ONCE!';
        } else {
            XF.Router = new (XF.RouterClass.extend(options))();
        }
    };


    /**
     Adds listeners to each 'a' tag with 'data-href' attribute on a page - all the clicks should bw delegated to {@link XF.Router}
     @memberOf XF
     @private
     */
    var placeAnchorHooks = function() {
        $('[data-href]').live('click',function() {
            XF.Router.navigate( $(this).attr('data-href'), {trigger: true} );
            _.delay(function() { window.scrollTo(0,0); }, 250);
        });
    };

    /**
     Loads component definitions for each visible component placeholder found
     @memberOf XF
     @param {Object} DOMObject Base object to look for components
     @private
     */
    var loadChildComponents = function(DOMObject) {
        $(DOMObject).find('[data-component][data-cache=true],[data-component]:visible').each(function(ind, value) {
            var compID = $(value).attr('data-id');
            var compName = $(value).attr('data-component');
            loadChildComponent(compID, compName, true);
        });
    };

    /**
     Loads component definition and creates its instance
     @memberOf XF
     @param {String} compID Data-id property value of a component instance
     @param {String} compName Name of the Component to be loaded
     @private
     */
    var loadChildComponent = function(compID, compName) {
        getComponent(compName, function(compDef) {
            if(!components[compID]) {
                var compInst = new compDef(compName, compID);
                console.log('XF :: loadChildComponent - created : ' + compID);
                components[compID] = compInst;
                compInst.construct();
            }
        });
    };

    /**
     Binds hide/show listners to each component placeholder. This listener should load component definition and create an instance of a component as soon as the placeholder would become visible
     @memberOf XF
     @private
     */
    var bindHideShowListeners = function() {
        $('[data-component]').live('show', function(evt) {
            if(evt.currentTarget == evt.target) {
                var compID = $(this).attr('data-id');
                if(!components[compID]) {
                    var compName = $(this).attr('data-component');
                    loadChildComponent(compID, compName);
                }
                XF.UIElements.enhanceView($(this));
            }
        });
        /*
         var selector = null;
         _.each(XF.UIElements.enhancementList, function(enhancement, index, enhancementList) {
         if(!selector) {
         selector = enhancement.selector;
         } else {
         selector += ', ' + enhancement.selector;
         }
         });
         $(selector).live('show', function() {
         XF.UIElements.enhanceView($(this));
         });
         */
    };

    /**
     Loads script
     @memberOf XF
     @param {String} url Component definition URL
     @param {Function} callback Function to be executed when the component definition would be loaded
     @private
     */
    var loadScript = function(url, callback){

        var script = document.createElement('script');

        if(script.readyState) {  //IE
            /** @ignore */
            script.onreadystatechange = function() {
                if (script.readyState == 'loaded' || script.readyState == 'complete') {
                    script.onreadystatechange = null;
                    if(callback) {
                        callback();
                    }
                }
            };
        } else {  //Others
            /** @ignore */
            script.onload = function() {
                if(callback) {
                    callback();
                }
            };
        }

        script.src = url;
        document.getElementsByTagName('head')[0].appendChild(script);
    };


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Stores instances of {@link XF.Component} and its subclasses
     @memberOf XF
     @private
     */
    var components = {};

    /**
     Stores instances of {@link XF.ComponentStatus} - registered Components
     @memberOf XF
     @private
     */
    var registeredComponents = {};

    /**
     Loads component definition if necessary and passes it to callback function
     @memberOf XF
     @param {String} compName Component definition name
     @param {Function} callback Function to be executed when the component definition would be loaded
     @private
     */
    var getComponent = function(compName, callback) {
        var compStatus = registeredComponents[compName];
        if(!compStatus) {
            compStatus = XF.registerComponent(compName, XF.Settings.property('componentUrlFormatter')(compName));
        }
        if(compStatus.loaded) {
            callback(compStatus.compDef);
            return;
        }

        compStatus.callbacks.push(callback);

        if(!compStatus.loading) {
            compStatus.loading = true;
            loadScript(compStatus.compSrc);
        }
    };

    /**
     Returns component instance by its id
     @param {String} compID Component instance id
     @returns {XF.Component} Appropriate component instance
     @public
     */
    XF.getComponentByID = function(compID) {
        return components[compID];
    };

    /**
     Registers component source
     @param {String} compName Component name
     @param {String} compSrc Component definition source
     @returns {XF.ComponentStatus} Component status descriptor
     @public
     */
    XF.registerComponent = function(compName, compSrc) {
        var compStatus = registeredComponents[compName];
        if(compStatus) {
            return compStatus;
        }
        registeredComponents[compName] = new ComponentStatus(compSrc);
        return registeredComponents[compName];
    };

    /**
     Defines component class and calls registered callbacks if necessary
     @param {String} compName Component name
     @param {Object} compDef Component definition
     @public
     */
    XF.defineComponent = function(compName, compDef) {
        var compStatus = registeredComponents[compName];
        if(!compStatus) {
            compStatus = registeredComponents[compName] = new ComponentStatus(null);
        }

        registeredComponents[compName].loading = false;
        registeredComponents[compName].loaded = true;
        registeredComponents[compName].compDef = compDef;

        while(compStatus.callbacks.length) {
            compStatus.callbacks.pop()(compStatus.compDef);
        }
    };

    /**
     Should invoke component loading & call callback function as soon as component would be available
     @param {String} compName Component name
     @param {Function} callback Callback to execute when component definition is ready
     @public
     */
    XF.requireComponent = function(compName, callback) {
        getComponent(compName, callback);
    };

    /**
     Stores custom options for {@link XF.Component} or its subclasses instances
     @memberOf XF
     @private
     */
    var componentOptions = {};

    /**
     Defines component instance custom options
     @param {String} compID Component instance id
     @param {Object} options Object containing custom options for appropriate component instance
     @public
     */
    XF.setOptionsByID = function(compID, options) {
        componentOptions[compID] = options;
    };

    /**
     Returns custom instance options by component instance ID
     @memberOf XF
     @param {String} compID Component instance id
     @returns {Object} Object containing custom options for appropriate component instance
     @private
     */
    var getOptionsByID = function(compID) {
        return componentOptions[compID] || {};
    };

    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Implements basic Events dispatching logic.
     @class
     */
    XF.Events = BB.Events;


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Instance of {@link XF.HistoryClass}
     @static
     @type {XF.HistoryClass}
     */
    XF.history = BB.history;

    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Instance of {@link XF.SettingsClass}
     @static
     @type {Object}
     */
    XF.Settings = {

    };

    _.extend(XF.Settings, /** @lends XF.SettingsClass.prototype */ {
            /**
             Contains name-value pairs of all application settings
             @name XF.Settings#options
             @type Object
             @private
             */
            options: /** @lends XF.Settings#options */ {

                /**
                 Used for {@link XF.Cache} clearance when new version released
                 @memberOf XF.Settings.prototype
                 @default '1.0.0'
                 @type String
                 */
                applicationVersion: '1.0.0',
                /**
                 Deactivates cache usage for the whole app (usefull for developement)
                 @memberOf XF.Settings.prototype
                 @default false
                 @type String
                 */
                noCache: false,
                /**
                 Used by default Component URL formatter: prefix + component_name + postfix
                 @memberOf XF.Settings.prototype
                 @default ''
                 @type String
                 */
                componentUrlPrefix: '',
                /**
                 Used by default Component URL formatter: prefix + component_name + postfix
                 @memberOf XF.Settings.prototype
                 @default '.js'
                 @type String
                 */
                componentUrlPostfix: '.js',
                /**
                 Default Component URL formatter: prefix + component_name + postfix
                 @param {String} compName Component name
                 @memberOf XF.Settings.prototype
                 @returns {String} Component URL
                 @type Function
                 */
                componentUrlFormatter: function(compName) {
                    return XF.Settings.property('componentUrlPrefix') + compName + XF.Settings.property('componentUrlPostfix');
                },

                /**
                 Used by default Template URL formatter: prefix + component_name + postfix
                 @memberOf XF.Settings.prototype
                 @default ''
                 @type String
                 */
                templateUrlPrefix: '',
                /**
                 Used by default Template URL formatter: prefix + component_name + postfix
                 @memberOf XF.Settings.prototype
                 @default '.tmpl'
                 @type String
                 */
                templateUrlPostfix: '.tmpl',
                /**
                 Default Template URL formatter: prefix + component_name + postfix
                 @param {String} compName Component name
                 @returns {String} Template URL
                 @memberOf XF.Settings.prototype
                 @type Function
                 */
                templateUrlFormatter: function(compName, templatePath) {
                    return XF.Settings.property('templateUrlPrefix') + templatePath + compName + XF.Settings.property('templateUrlPostfix');
                },

                /**
                 Used by default Data URL formatter: prefix + component_name + postfix
                 @memberOf XF.Settings.prototype
                 @default ''
                 @type String
                 */
                dataUrlPrefix: '',
                /**
                 Used by default Data URL formatter: prefix + component_name + postfix
                 @memberOf XF.Settings.prototype
                 @default '.json'
                 @type String
                 */
                dataUrlPostfix: '.json',
                /**
                 Default Data URL formatter: prefix + component_name + postfix
                 @param {String} compName Component name
                 @returns {String} Template URL
                 @memberOf XF.Settings.prototype
                 @type Function
                 */
                dataUrlFormatter: function(compName) {
                    return XF.Settings.property('dataUrlPrefix') + compName + XF.Settings.property('dataUrlPostfix');
                },
                /**
                 Used by {@link XF.Touchable}
                 @memberOf XF.Settings.prototype
                 @default 100
                 @type Number
                 */
                touchableSwipeLength: 100,
                /**
                 Used by {@link XF.Touchable}
                 @memberOf XF.Settings.prototype
                 @default 700
                 @type Number
                 */
                touchableDoubleTapInterval: 700,
                /**
                 Used by {@link XF.Touchable}
                 @memberOf XF.Settings.prototype
                 @default 300
                 @type Number
                 */
                touchableLongTapInterval: 500
            },

            /**
             Gives a way to set a number of options at a time
             @param options an object containing properties which would override original ones
             */
            bulkSet: function(options) {
                _.extend(this.options, options);
            },
            /**
             Gets property value by name
             @param {String} propName
             */
            getProperty: function(propName) {
                return this.options[propName];
            },
            /**
             Sets a new value for one property with
             @param {String} propName
             @param {Object} value new value of the property
             */
            setProperty: function(propName, value) {
                this.options[propName] = value;
            },
            /**
             Gets or sets property value (depending on whether the 'value' parameter was passed or not)
             @param {String} propName
             @param {Object} [value] new value of the property
             */
            property: function(propName, value) {
                if(value === undefined) {
                    return this.getProperty(propName);
                } else {
                    this.setProperty(propName, value);
                }
            }
        }
    );


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Instance of {@link XF.CacheClass}
     @static
     @private
     @type {XF.CacheClass}
     */
    XF.Cache = null;

    /**
     Provides localStorage caching API
     @class
     @static
     */
    XF.CacheClass = function() {

        /**
         Local reference to the localStorage
         @type {Object}
         */
        this.storage = null;

        /**
         Indicates whether accessibility test for localStorage was passed at launch time
         @type {Object}
         */
        this.available = false;
    };

    _.extend(XF.CacheClass.prototype, /** @lends XF.CacheClass.prototype */{

        /**
         Runs accessibility test for localStorage & clears it if the applicationVersion is too old
         */
        init : function() {

            this.storage = window.localStorage;

            // checking availability
            try {
                this.storage.setItem('check', 'check');
                this.storage.removeItem('check');
                this.available = true;
            } catch(e) {
                this.available = false;
            }

            // clearing localStorage if stored version is different from current
            var appVersion = this.get('applicationVersion');
            if(XF.Settings.property('noCache')) {
                // cache is disable for the whole site manualy
                console.log('XF.Cache :: init - cache is disable for the whole app manually - clearing storage');
                this.clear();
                this.set('applicationVersion', XF.Settings.property('applicationVersion'));
            } else if(appVersion && appVersion == XF.Settings.property('applicationVersion')) {
                // same version is cached - useing it as much as possible
                console.log('XF.Cache :: init - same version is cached - useing it as much as possible');
            } else {
                // wrong or no version cached - clearing storage
                console.log('XF.Cache :: init - wrong or no version cached - clearing storage');
                this.clear();
                this.set('applicationVersion', XF.Settings.property('applicationVersion'));
            }
        },

        /**
         Returns a value stored in cache under appropriate key
         @param {String} key
         @return {String}
         */
        get : function(key) {
            var result;
            if(this.available) {
                try {
                    result = this.storage.getItem(key);
                    console.log('XF.Cache :: get - "' + key + '" = "' + result + '"');
                } catch(e) {
                    result = null;
                }
            } else {
                result = null;
            }
            return result;
        },

        /**
         Sets a value stored in cache under appropriate key
         @param {String} key
         @param {String} value
         @return {Boolean} success indicator
         */
        set : function(key, value) {
            var result;
            if(this.available) {
                try {
                    this.storage.setItem(key, value);
                    result = true;
                    console.log('XF.Cache :: set - "' + key + '" = "' + value + '"');
                } catch(e) {
                    result = false;
                }
            } else {
                result = false;
            }
            return result;
        },

        /**
         Clears localStorage
         @return {Boolean} success indicator
         */
        clear : function() {
            var result;
            if(this.available) {
                try {
                    this.storage.clear();
                    result = true;
                    console.log('XF.Cache :: clear');
                } catch(e) {
                    result = false;
                }
            } else {
                result = false;
            }
            return result;
        }

    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Instance of {@link XF.ControllerClass}
     @static
     @type {XF.ControllerClass}
     */
    XF.Controller = null;

    /**
     Represents general Application settings. Extends {@link XF.Events}
     @class
     @static
     @augments XF.Events
     */
    XF.ControllerClass = function() {}

    _.extend(XF.ControllerClass.prototype, XF.Events);


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Instance of {@link XF.RouterClass}
     @static
     @type {XF.Router}
     */
    XF.Router = null;

    /**
     Implements Routing.
     @class
     @static
     @augments XF.Events
     @param {Object} routes routes has map
     @param {Object} handlers handlers has map
     */
    XF.RouterClass = BB.Router;

    _.extend(XF.RouterClass.prototype, /** @lends XF.RouterClass.prototype */{


        /**
         Initiates Rounting & history listening
         @private
         */
        start : function() {
            XF.history.start();
        },


        /**
         Binds a callback to any route
         @param {Function} callback A function to be called when any route is visited
         */
        bindAnyRoute : function(callback) {
            debugger;
            this.on('all', callback);
            debugger;
            if(this.mostRecentCalled) {
                callback(this.mostRecentCalled.name);
            }
        },

        /**
         Returns route string by givven router event name
         @param String eventName
         @return String
         */
        getRouteByEventName : function(eventName) {
            debugger;
            return eventName.replace('route:', '');
        }
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Base Component.
     @class
     @static
     @augments XF.Events
     @see <a href="http://documentcloud.github.com/backbone/#Events">XF.Events Documentation</a>
     @param {String} name Name of the component
     @param {String} id ID of the component instance
     */
    XF.Component = function(name, id) {
        /**
         Would be dispatched once when the Component inited
         @name XF.Component#init
         @event
         */

        /**
         Would be dispatched once when the Component constructed
         @name XF.Component#construct
         @event
         */

        /**
         Would be dispatched after each render
         @name XF.Component#refresh
         @event
         */

        /**
         Name of the component.
         @default 'default_name'
         @type String
         */
        this.name = name || 'default_name';

        /**
         ID of the component.
         @default 'default_id'
         @type String
         */
        this.id = id || 'default_id';

        /**
         Flag which defines whether the component was rendered atleast once
         @type Boolean
         */
        this.rendered = false;

        /** @ignore */
        var firstRender = function() {
            this.unbind('refresh', firstRender);
            this.rendered = true;
        };

        this.bind('refresh', firstRender);

        // merging defaults with custom instance options 
        var defaultOptions = this.options;
        var instanceOptions = getOptionsByID(this.id);
        this.options = _.defaults(instanceOptions, defaultOptions);
    };

    /**
     Component template
     @type String
     @static
     */
    XF.Component.template = null;

    /**
     The URL of template that is currently being loaded
     @type String
     @private
     @static
     */
    XF.Component.templateURL= false;

    /**
     A flag that indiacates whether that template is currently being loaded
     @type Boolean
     @private
     @static
     */
    XF.Component.templateLoaded = false;

    /**
     A flag that indiacates whether that template was successfully loaded
     @type Boolean
     @private
     @static
     */
    XF.Component.templateLoading = false;

    /**
     Compiled component template
     @type Function
     @static
     */
    XF.Component.compiledTemplate = null;

    _.extend(XF.Component.prototype, XF.Events);

    _.extend(XF.Component.prototype, /** @lends XF.Component.prototype */{

        /**
         Object containing has-map of component options that can be different for each instance & should be set with {@link XF.setOptionsByID}
         @type Object
         */
        options : {},

        /**
         Defenition of custom Model class extending {@link XF.Model}
         */
        modelClass : XF.Model,

        /**
         Instance of {@link XF.Model} or its subclass
         @type XF.Model
         */
        model : null,

        /**
         Defenition of custom View class extending {@link XF.View}
         */
        viewClass : XF.View,

        /**
         Instance of {@link XF.View} or its subclass
         @type XF.View
         */
        view : null,

        /**
         Constructs component instance
         @private
         */
        construct : function() {

            /** @ignore */
            var viewConstructed = function() {
                this.view.unbind('construct', viewConstructed);
                this.afterConstructView();

                this.init();
                this.trigger('init');

                this.trigger('construct');
                XF.Controller.trigger(this.id + ':constructed');
            };
            /** @ignore */
            var modelConstructed = function() {
                this.model.unbind('construct', modelConstructed);
                this.afterConstructModel();

                this.beforeConstructView();
                this.constructView();

                this.view.bind('construct', viewConstructed, this);
                this.view.construct();
            };

            this.beforeConstructModel();
            this.constructModel();

            this.model.bind('construct', modelConstructed, this);
            this.model.construct();

            this.childComponent = [];
        },

        /**
         Returns component selector
         @return {String} Selector string that can be used for $.find() for example
         */
        selector : function() {
            return '[data-id=' + this.id + ']';
        },

        /**
         HOOK: override to add logic before view construction
         */
        beforeConstructView : function() {},

        /**
         Constructs {@link XF.View} object
         @private
         */
        constructView : function() {
            if(!this.view || !(this.view instanceof XF.View)) {
                if(this.viewClass) {
                    this.view = new this.viewClass();
                    if(!(this.view instanceof XF.View)) {
                        this.view = new XF.View();
                    }
                } else {
                    this.view = new XF.View();
                }
            }
            this.view.component = this;
        },

        /**
         HOOK: override to add logic after view construction
         */
        afterConstructView : function() {},

        /**
         HOOK: override to add logic before model construction
         */
        beforeConstructModel : function() {},

        /**
         Constructs {@link XF.Model} object
         @private
         */
        constructModel: function() {
            if(!this.model || !(this.model instanceof XF.Model)) {
                if(this.modelClass) {
                    this.model = new this.modelClass();
                    if(!(this.model instanceof XF.Model)) {
                        this.model = new XF.Model();
                    }
                } else {
                    this.model = new XF.Model();
                }
            }
            this.model.component = this;
        },

        /**
         HOOK: override to add logic after model construction
         */
        afterConstructModel : function() {},

        /**
         HOOK: override to add custom logic. Default behavior is to call {@link XF.Component#refresh}
         */
        init : function() {
            this.refresh();
        },

        /**
         Refreshes model data and then rerenders view
         @private
         */
        refresh : function() {
            /** @ignore */
            var onModelRefresh = function() {
                this.model.unbind('refresh', onModelRefresh);
                this.view.refresh();
                this.trigger('refresh');
            };

            this.model.bind('refresh', onModelRefresh, this);

            this.model.refresh();
        },

        /**
         A wrapper that allows to set some callbacks to be called after the component was first rendered
         @param {Function} callback A callback that would be invoked right after component's first render or right after method invocation if the component has already been rendered
         */
        ready: function(callback) {
            if(this.rendered) {
                callback();
            } else {
                /** @ignore */
                var firstRender = function() {
                    this.unbind('refresh', firstRender);

                    callback();
                };

                this.bind('refresh', firstRender, this);
            }
        }

    });

    /**
     This method allows to extend XF.Component with saving the whole prototype chain
     @function
     @static
     */
    XF.Component.extend = BB.Model.extend;


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Describes current component definition status
     @class
     @private
     @memberOf XF
     @param {String} compSrc Component definition source
     */
    var ComponentStatus = function(compSrc) {
        /**
         Component definition source
         @private
         @type String
         */
        this.compSrc = compSrc;
        /**
         Component definition
         @private
         @type XF.Component
         */
        this.compDef = null;
        /**
         Flag that determines whether the component definition is currently being loaded
         @private
         @type Boolean
         */
        this.loading = false;
        /**
         Flag that determines whether the component definition has already been loaded
         @private
         @type Boolean
         */
        this.loaded = false;
        /**
         A list of callbacks to call on component definition loading complete
         @private
         @type String[]
         */
        this.callbacks = [];
    };


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Implements data workaround flow.
     @class
     @static
     @augments XF.Events
     @param {Object} attributes list of predefined attributes
     */
    XF.Model = BB.Model.extend({
        /**
         Would be dispatched once when the Component inited
         @name XF.Model#init
         @event
         */

        /**
         Would be dispatched once when the Component constructed
         @name XF.Model#construct
         @event
         */

        /**
         Would be dispatched after each data update
         @name XF.Model#dataLoaded
         @event
         */

        /**
         Would be dispatched after each update
         @name XF.Model#refresh
         @event
         */

        /**
         Link to the {@link XF.Component} instance
         @type XF.Component
         */
        component: null,

        /**
         Object that contains plan data recieved from server
         @type Object
         */
        rawData: null,

        /**
         Data source URL
         @type String
         */
        dataURL : null,

        /**
         Settings for $ AJAX data request
         @type String
         */
        dataRequestSettings : null,

        /**
         Flag that determines whether the data should not be loaded at all
         @default false
         @type Boolean
         */
        isEmptyData : false,

        /**
         Flag that determines whether the data should be loaded once
         @default false
         @type Boolean
         */
        isStaticData : false,

        /**
         Flag that determines whether the data type is string (otherwise JSON)
         @default false
         @type Boolean
         */
        isStringData : false,

        /**
         Interval in milliseconds defining how often data should be retrived from the server; use '0' to turn autoUpdate off
         @default 0
         @type Number
         */
        autoUpdateInterval: 0,

        /**
         Flag that determines whether the data should be updateing (with autoUpdate) even if the component is currentyl hidden
         @default false
         @type Boolean
         */
        updateInBackground: false,

        /**
         Flag that determines whether the data should be updated each time the component becomes visible
         @default false
         @type Boolean
         */
        updateOnShow: false,

        /**
         Object that contains default values for attributes - should be overriden to be used
         @type Object
         */
        defaults : null,

        /**
         Constructs model instance
         @private
         */
        construct : function() {
            this.initialize();
            this.trigger('init');
            if(this.autoUpdateInterval > 0) {
                var autoUpdateFunc = _.bind(function() {
                    if($(this.component.selector()).is(':visible')) {
                        this.refresh();
                    } else if(this.updateInBackground) {
                        this.refresh();
                    }
                }, this);
                setInterval(autoUpdateFunc, this.autoUpdateInterval);
            }
            if(this.updateOnShow) {
                $(this.component.selector()).bind('show', _.bind(this.refresh, this));
            }
            this.trigger('construct');
        },

        /**
         Refreshes data from backend if necessary
         @private
         */
        refresh : function() {
            /** ignore */
            var dataLoaded = function() {
                this.unbind('dataLoaded', dataLoaded);
                var renderVersion = this.component.view.renderVersion;
                this.afterLoadData();

                //TODO: uncomment this and try to find why 'refresh' not working for menu component
                //if(this.component.view.renderVersion == renderVersion) {
                this.trigger('refresh');
                //}
            };

            this.bind('dataLoaded', dataLoaded);

            this.beforeLoadData();
            this.loadData();
        },

        /**
         Generates data url - override if custom format is required and {@link XF.Settings} has no appropriate way to handle it
         @private
         */
        getDataURL : function() {
            if(!this.dataURL) {
                if(!this.component) {
                    throw 'XF.Model "component" linkage lost';
                }
                this.dataURL = _.bind(XF.Settings.property('dataUrlFormatter'), this)(this.component.name);
            }
            return this.dataURL;
        },

        /**
         Returns settings for AddressBar AJAX data request or empty object is it is not set - override to add extra functionality
         @private
         */
        getDataRequestSettings : function() {
            return this.dataRequestSettings || {};
        },

        /**
         HOOK: override to add logic before data load
         */
        beforeLoadData : function() {},

        /**
         Loads data
         @private
         */
        loadData : function() {

            if(!this.isEmptyData && (!this.rawData || !this.isStaticData || this.autoUpdate > 0)) {

                var $this = this;
                var url = this.getDataURL();

                $.ajax(
                    _.extend(this.getDataRequestSettings(), {
                        url: url,
                        complete : function(jqXHR, textStatus) {
                            if(!$this.component) {
                                throw 'XF.Model "component" linkage lost';
                            }
                            if(textStatus == 'success') {
                                if($this.isStringData) {
                                    $this.rawData = jqXHR.responseText;
                                } else {
                                    $this.rawData = JSON.parse(jqXHR.responseText);
                                }
                            } else {
                                if($this.isStringData) {
                                    $this.rawData = {};
                                } else {
                                    $this.rawData = '';
                                }
                            }
                            $this.trigger('dataLoaded');
                        }
                    })
                );

            } else {
                this.trigger('dataLoaded');
            }
        },

        /**
         HOOK: override to add logic after data load
         */
        afterLoadData : function() {}

    });



    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Implements view workaround flow.
     @class
     @static
     @augments XF.Events
     */

    XF.View = BB.View.extend({

        /**
         Would be dispatched once when the Component inited
         @name XF.View#init
         @event
         */

        /**
         Would be dispatched once when the Component constructed
         @name XF.View#construct
         @event
         */

        /**
         Would be dispatched once, when template is ready for use
         @name XF.View#templateLoaded
         @event
         */

        /**
         Would be dispatched after each render
         @name XF.View#refresh
         @event
         */

        /**
         Link to the {@link XF.Component} instance
         @type XF.Component
         */
        component : null,

        /**
         Template URL
         @type String
         */
        templateURL : null,

        /**
         Flag that determines whether the Model update should be ignored by the View (in this case you may launch {@link XF.View#refresh} manualy)
         @default false
         @type Boolean
         */
        ignoreModelUpdate : false,

        /**
         Flag that determines whether the view should be rerendered each time the component becomes visible
         @default false
         @type Boolean
         */
        updateOnShow: false,

        /**
         Flag that determines whether the template should be stored into {@link XF.Cache}
         @default false
         @type Boolean
         */
        useCache: false,

        /**
         Constructs view instance
         @private
         */
        construct : function() {
            /** ignore */
            var templateLoaded = function() {

                if(this.loadTemplateFailed) {
                    this.unbind('templateLoaded', templateLoaded);
                    this.afterLoadTemplateFailed();
                    return;
                }

                if(!this.component.constructor.templateLoaded) {
                    this.loadTemplate();
                    return;
                }

                this.unbind('templateLoaded', templateLoaded);
                this.afterLoadTemplate();

                this.initialize();
                this.trigger('init');

                if(!this.ignoreModelUpdate) {
                    this.component.model.bind('changed', this.refresh, this);
                }
                if(this.updateOnShow) {
                    $(this.component.selector()).bind('show', _.bind(this.refresh, this));
                }

                this.trigger('construct');
            };

            this.bind('templateLoaded', templateLoaded);

            this.beforeLoadTemplate();
            this.loadTemplate();
        },

        /**
         Stores last device type that was used for template url generation
         @type String
         @private
         */
        lastDeviceType : null,

        /**
         Generates template url - override if custom format is required and {@link XF.Settings} has no appropriate way to handle it
         @private
         */
        getTemplateURL : function() {
            // clearing saved template URL - it was erroneous
            if(this.lastDeviceType) {
                this.templateURL = null;
            }
            if(!this.templateURL) {
                if(!this.component) {
                    throw 'XF.View "component" linkage lost';
                }

                this.lastDeviceType = XF.Device.getNextType(this.lastDeviceType);

                // preventing from infinit cycle
                if(!this.lastDeviceType) {
                    return null;
                }

                var templatePath = '';
                if(this.lastDeviceType && this.lastDeviceType.templatePath) {
                    templatePath = this.lastDeviceType.templatePath;
                }
                this.templateURL = XF.Settings.property('templateUrlFormatter')(this.component.name, templatePath);
            }
            return this.templateURL;
        },

        /**
         Compiles component template if necessary & executes it with current component instance model
         @static
         */
        getMarkup: function() {
            if(!this.component.constructor.compiledTemplate) {
                this.component.constructor.compiledTemplate = _.template(this.component.constructor.template);
            }
            return this.component.constructor.compiledTemplate(this.component.model);
        },

        /**
         HOOK: override to add logic before template load
         */
        beforeLoadTemplate : function() {},

        /**
         A flag that indicates whether the template loading failed
         @type Boolean
         @private
         */
        loadTemplateFailed : false,

        /**
         Loads template
         @private
         */
        loadTemplate : function() {

            var url = this.getTemplateURL();
            if(url == null) {
                this.loadTemplateFailed = true;
                this.trigger('templateLoaded');
                return;
            }

            // trying to get template from cache
            if(this.useCache) {
                var cachedTemplate = XF.Cache.get(url);
                if(cachedTemplate) {
                    this.component.constructor.template = cachedTemplate;
                    this.component.constructor.templateLoaded = true;
                    this.trigger('templateLoaded');
                    return;
                }
            }

            if(!this.component.constructor.templateLoaded && !this.component.constructor.templateLoading) {

                this.component.constructor.templateURL = url;
                this.component.constructor.templateLoading = true;

                var $this = this;

                $.ajax({
                    url: url,
                    complete : function(jqXHR, textStatus) {
                        if(!$this.component) {
                            throw 'XF.View "component" linkage lost';
                        }
                        if(textStatus == 'success') {
                            var template = jqXHR.responseText;

                            // saving template into cache if the option is turned on
                            if($this.useCache) {
                                XF.Cache.set(url, template);
                            }

                            $this.component.constructor.template = jqXHR.responseText;
                            $this.component.constructor.templateLoading = false;
                            $this.component.constructor.templateLoaded = true;
                            $this.trigger('templateLoaded');
                            XF.Controller.trigger('templateLoaded', {url: url, template:template});
                        } else {
                            $this.component.constructor.template = null;
                            $this.component.constructor.templateLoading = false;
                            $this.component.constructor.templateLoaded = false;
                            $this.trigger('templateLoaded');
                            XF.Controller.trigger('templateLoaded', {url: url, template : null});
                        }
                    }
                });

            } else if(this.component.constructor.templateLoading) {

                var $this = this;
                url = this.component.constructor.templateURL;

                /** ignore */
                var templateLoadedAsync = function(params) {
                    if(params.url == url) {
                        XF.Controller.unbind('templateLoaded', templateLoadedAsync);
                        $this.trigger('templateLoaded');
                    }
                };

                XF.Controller.bind('templateLoaded', templateLoadedAsync);

            } else {
                this.trigger('templateLoaded');
            }
        },

        /**
         HOOK: override to add logic after template load
         */
        afterLoadTemplate : function() {},

        /**
         HOOK: override to add logic for the case when it's impossible to load template
         */
        afterLoadTemplateFailed : function() {
            console.log('XF.View :: afterLoadTemplateFailed - could not load template for "' + this.component.id + '"');
            console.log('XF.View :: afterLoadTemplateFailed - @dev: verify XF.Device.types settings & XF.View :: getTemplate URL overrides');
        },

        /**
         Renders component into placeholder + calling all the necessary hooks & events
         */
        refresh : function() {
            this.preRender();
            this.render();
            this.postRender();
            this.trigger('refresh');
        },

        /**
         HOOK: override to add logic before render
         */
        preRender : function() {},


        /**
         Identifies current render vesion
         @private
         */
        renderVersion : 0,

        /**
         Renders component into placeholder
         @private
         */
        render : function() {
            this.renderVersion++;
            var DOMObject = $('[data-id=' + this.component.id + ']');
            DOMObject.html(this.getMarkup());
            loadChildComponents(DOMObject);
        },

        /**
         HOOK: override to add logic after render
         */
        postRender : function() {}

    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


    /**
     Instance of {@link XF.RootComponent}
     @static
     @private
     @type {XF.RootComponent}
     */
    XF.RootComponentInstance = null;

    /**
     Root Component.
     @class
     @static
     @augments XF.Component
     */
    XF.RootComponent = XF.Component.extend(/** @lends XF.RootComponent.prototype */{

        /**
         HOOK: override to add logic before starting routing
         */
        beforeStart : function() {},

        /**
         Launches Routing & automated PageSwitcher
         @private
         */
        start: function() {
            XF.Router.start();
            XF.PageSwitcher.start();
        },

        /**
         HOOK: override to add logic after starting routing
         */
        afterStart : function() {},

        /**
         Overrides {@link XF.Component} constructor in order to add Routing start call
         @param {String} name Name of the component
         @param {String} id ID of the component instance
         @private
         */
        constructor: function(name, id) {
            if(XF.RootComponentInstance) {
                throw 'XF.RootComponent can be only ONE!';
            }
            XF.RootComponentInstance = this;

            this.ready(function() {
                XF.RootComponentInstance.beforeStart();
                XF.RootComponentInstance.start();
                XF.RootComponentInstance.afterStart();
            });

            XF.Component.apply(this, arguments);
        }
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     Instance of {@link XF.PageSwitcherClass}
     @static
     @private
     @type {XF.PageSwitcherClass}
     */
    XF.PageSwitcher = null;

    /**
     Root Component.
     @class
     @static
     */
    XF.PageSwitcherClass = function() {};

    _.extend(XF.PageSwitcherClass.prototype, /** @lends XF.PageSwitcherClass.prototype */{

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
         Animation type for page switching ('fade', 'slide', 'none')
         @type String
         @default 'fade'
         */
        animationType : 'fade',

        /**
         Saves current active page
         @type $
         @private
         */
        activePage : null,

        /**
         Initialises PageSwitcher: get current active page and binds necessary routes handling
         @private
         */
        start : function() {

            $.fn.animationComplete = function( callback ) {
                if( "WebKitTransitionEvent" in window || "transitionEvent" in window ) {
                    return $( this ).one( 'webkitAnimationEnd animationend', callback );
                }
                else{
                    // defer execution for consistency between webkit/non webkit
                    setTimeout( callback, 0 );
                    return $( this );
                }
            };

            var pages = $(XF.RootComponentInstance.selector() + ' .' + this.pageClass);
            if (pages.length) {
                var preselectedAP = pages.filter('.' + this.activePageClass);
                if(preselectedAP.length) {
                    this.activePage = preselectedAP;
                } else {
                    //this.activePage = pages.first();
                    //this.activePage.addClass(this.activePageClass);
                    this.switchToPage(pages.first());
                }
                XF.Router.bindAnyRoute(this.routeHandler);
            }
        },

        /**
         Handles every XF.Router 'route:*' event and invokes page switching if necessary
         @param String eventName
         @private
         */
        routeHandler : function(eventName) {
            debugger;
            var routeName = XF.Router.getRouteByEventName(eventName);
            var jqPage = $('.' + XF.PageSwitcher.pageClass + '#' + routeName);
            if(jqPage.length) {
                XF.PageSwitcher.switchToPage(jqPage);
            }
        },

        /**
         Executes animation sequence for switching
         @param $ jqPage
         */
        switchToPage : function(jqPage){
            debugger;

            // preventing animation when the page is already shown
            if(this.activePage && jqPage.attr('id') == this.activePage.attr('id')) {
                return;
            }

            var viewport = XF.Device.getViewport();
            var screenHeight = XF.Device.getScreenHeight();

            var animationName = this.animationType;
//			var reverseClass = this.animationReverseClass;
            var activePageClass = this.activePageClass;

            var fromPage = this.activePage;
            var toPage = jqPage;

            this.activePage = toPage;

            if(fromPage) {
                // start transition
                viewport.addClass('xf-viewport-transitioning');

                fromPage.height(screenHeight + $(window).scrollTop()).addClass('out '+ animationName /*+ ' ' + reverseClass*/);
                toPage.height(screenHeight + $(window).scrollTop()).addClass('in '+ animationName + ' ' + activePageClass /*+ ' ' + reverseClass*/);
                fromPage.animationComplete(function(e){
                    fromPage.height('').removeClass(animationName + ' out in reverse');
                    if(fromPage.attr('id') != XF.PageSwitcher.activePage.attr('id')) {
                        fromPage.removeClass(activePageClass);
                    }
                });

                toPage.animationComplete(function(e){
                    toPage.height('').removeClass(animationName + ' out in reverse');
                    viewport.removeClass('xf-viewport-transitioning');

                });
            } else {
                // just making it active
                this.activePage.addClass(activePageClass);
            }


            // scroll to top of page ofter page switch
            window.scrollTo( 0, 1 );

            // looking for components inside the page
            loadChildComponents(this.activePage[0]);
        }
    });


    /////////////////////////////////////////////////////////////////////////////////////////////////////////


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


    /////////////////////////////////////////////////////////////////////////////////////////////////////////

    /**
     Instance of {@link XF.DeviceClass}
     @static
     @private
     @type {XF.DeviceClass}
     */
    XF.Device = null;

    /**
     Represents some basic testing/verification api letting you know what device the app is started on.
     @class
     @static
     */
    XF.DeviceClass = function() {

        /**
         Contains device viewport size: {width; height}
         @type Object
         */
        this.size = {
            width: 0,
            height: 0
        };

        /**
         Array of device types to be chosen from (can be set via {@link XF.start} options)
         @type Object
         @private
         */
        this.types = [
            {
                name : 'desktop',
                range : {
                    max : null,
                    min : 1024
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
        ];

        /**
         Default device type that would be used when none other worked (covers all the viewport sizes)
         @type Object
         @private
         */
        this.defaultType = {
            name : 'default',
            range : {
                min : null,
                max : null
            },
            templatePath : '',
            fallBackTo : null
        };

        /**
         Detected device type that would be used to define template path
         @type Object
         @private
         */
        this.type = this.defaultType;

        /**
         A flag indicates whether the device is supporting Touch events or not
         @type Boolean
         */
        this.isTouchable = false;
    };

    _.extend(XF.DeviceClass.prototype, /** @lends XF.DeviceClass.prototype */{

        /**
         Initializes {@link XF.Device} instance (runs detection methods)
         @param {Array} types rray of device types to be choosen from
         */
        init : function(types) {
            this.types = types || this.types;
            this.detectType();
            this.detectTouchable();
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

                $this.isTouchable = ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch || (hashTouch && hashTouch.offsetTop) === 9;

            }, 1, ['touch']);

            console.log('XF.Device :: detectTouchable - device IS ' + (this.isTouchable ? '' : 'NOT ') + 'touchable');

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
    });


    // TBDeleted : temp stuff for testApp.html
    XF.trace = function(message) {
        $('#tracer').html(message + '<br/>' + $('#tracer').html());
    };

    return window.XF = XF;

}).call(this, window, Backbone);