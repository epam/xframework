define([
    'jquery',
    'underscore',
    '../src/xf.core',
    '../src/xf.utils',
    '../ui/xf.ui.core'
], function($, _, XF) {

/**
Enhances text input view
*/
XF.ui.input = {
        
    // Selectors will be used to detect text inputs on the page
    selector : 'INPUT[type=text], INPUT[type=search], INPUT[type=tel], ' +
    'INPUT[type=url], INPUT[type=email], INPUT[type=password], INPUT[type=datetime], ' +
    'INPUT[type=date], INPUT[type=month], INPUT[type=week], INPUT[type=time], ' +
    'INPUT[type=datetime-local], INPUT[type=number], INPUT[type=color], TEXTAREA, ' +
    //
    'INPUT[type=range], INPUT[type=search]',

    render : function (textInput, options) {
        var jQTextInput = $(textInput),
            
        // Events for pointer/touchs
        eventsHandler = {
            start : 'mousedown touchstart MSPointerDown',
            move : 'mousemove touchmove MSPointerMove',
            end : 'mouseup touchend MSPointerUp'
        };

        if (!textInput || !(jQTextInput instanceof $) || jQTextInput.attr('data-skip-enhance') == 'true') {
            return;
        }

        jQTextInput.attr({'data-skip-enhance':true});

        // For inputs of types:
        // text, search, tel, url, email, password, datetime, date, month,
        // week, time, datetime-local, number, color and also for TEXTAREA element
        // add class "xf-input-text".
        jQTextInput.addClass('xf-input-text');

        var isInputElement = (textInput.nodeName == 'INPUT'),
        textInputType = jQTextInput.attr('type'),
        newTextInput;

        // For inputs of types "range" and "search" change type to "text".
        if (textInputType == 'search') {
            newTextInput = $('<input type="text"/>');
            newTIAttrs = {};

            _.each(textInput.attributes, function (attribute) {

                if (attribute.name == 'type') {
                    return;
                }
                newTIAttrs[attribute.name] = attribute.value;
            });
            newTextInput.attr(newTIAttrs);

            if (jQTextInput.hasOwnProperty('outerHTML')) {
                jQTextInput.outerHtml(newTextInput);
            }
            jQTextInput = newTextInput;
            textInput = newTextInput[0];
                
        } else if (textInputType == 'number' || textInputType == 'range') {

            var minValue = jQTextInput.attr('min'),
            maxValue = jQTextInput.attr('max'),
            selValue = parseFloat(jQTextInput.attr('value')),
            step = parseFloat(jQTextInput.attr('step')) || 1;
            
            var newTIAttrs = {};
            
            newTextInput = $('<input type="text"/>');

            _.each(textInput.attributes, function (attribute) {

                if (attribute.name == 'type') {
                    return;
                }
                newTIAttrs[attribute.name] = attribute.value;
            });
            newTextInput.attr(newTIAttrs);
            newTextInput.attr({'data-skip-enhance':true});

            var numberWrapper = $('<div></div>').addClass('xf-input-number');
                
            // Add buttons to decrease number
            numberWrapper.append(
                $('<button type="button"></button>')
                .addClass('xf-input-number-control xf-input-number-control-decrease')
                .attr({'data-skip-enhance':true})
                .append(
                    $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-circled-minus')
                )
            );
            numberWrapper.append(newTextInput);
                
            // Add buttons to increase number
            numberWrapper.append(
                $('<button type="button"></button>')
                .addClass('xf-input-number-control xf-input-number-control-increase')
                .attr({'data-skip-enhance':true})
                .append(
                    $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-circled-plus')
                )
            );

            var rangeWrapper = null;

            if (textInputType == 'number') {

                jQTextInput.outerHtml(numberWrapper);
                jQTextInput = numberWrapper;
                textInput = numberWrapper[0];

            } else if (textInputType == 'range') {

                rangeWrapper = $('<div></div>').addClass('xf-range');
                rangeWrapper.append(numberWrapper);

                // If there is no either min or max attribute -- don't render the slider.
                if ((minValue || minValue === 0) && (maxValue || maxValue === 0)) {

                    minValue = parseFloat(minValue);
                    maxValue = parseFloat(maxValue);

                    var percValue = (selValue - minValue) * 100 / (maxValue - minValue),
                        
                    // Underscore template for slider
                    _template = _.template(
                        '<div class="xf-input-range">' +
                        '<div class="xf-range-wrap">' +
                        '<div class="xf-input-range-min"><%= minValue %></div>' +
                        '<div class="xf-input-range-slider">' +
                        '<div class="xf-input-range-track">' +
                        '<div class="xf-input-range-value" style="width: 0">' +
                        '<div class="xf-input-range-control" tabindex="0">' +
                        '<div class="xf-input-range-thumb" style="left:100%" title="<%= selValue %>"></div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '</div>' +
                        '<div class="xf-input-range-max"><%= maxValue %></div>' +
                        '</div>' +
                        '</div>'
                    );
                    rangeWrapper.append(_template({minValue : minValue, maxValue: maxValue, selValue: selValue}));

                    jQTextInput.outerHtml(rangeWrapper);
                    jQTextInput = rangeWrapper;
                    textInput = rangeWrapper[0];
                }

            }

            // Function to set new value for input
            var setNewValue = function (newValue) {

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

                if (rangeWrapper) {
                    rangeWrapper.find('div.xf-input-range-thumb').attr({'title':newValue});

                    var percValue = (newValue - minValue) * 100 / (maxValue - minValue);
                    rangeWrapper.find('div.xf-input-range-value').css({'width':'' + percValue + '%'});
                }

            };

            // Function to increase value for input
            var stepUp = function () {
                var newValue = parseFloat(newTextInput.attr('value'));
                newValue += step;
                setNewValue(newValue);
            };

            // Function to decrease value for input
            var stepDown = function () {
                var newValue = parseFloat(newTextInput.attr('value'));
                newValue -= step;
                setNewValue(newValue);
            };

            // Initialing number stepper buttons (-) & (+) click handlers
            numberWrapper.find('button.xf-input-number-control-decrease').on('tap', stepDown);
            numberWrapper.find('button.xf-input-number-control-increase').on('tap', stepUp);

            var savedInputText = newTextInput.attr('value');
            var newInputText;
            var inputTextChange = function (event) {
                newInputText = newTextInput.attr('value');
                    
                // Prevent multiple recalculations in case when several events where triggered
                if (savedInputText == newInputText) {
                    return;
                }

                newInputText = parseFloat(newInputText);
                    
                if (isNaN(newInputText)) {
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

            if (rangeWrapper) {

                var trackW;
                var savedVal;
                var valueDiff;
                var mousePrevX;
                var mouseNewX;
                var mouseDiff;

                var trackDiffToValueDiff = function (trackDiff) {
                        
                    if (!trackW) {
                        trackW = rangeWrapper.find('div.xf-input-range-track')[0].clientWidth;
                    }
                    return (trackDiff / trackW * (maxValue - minValue));
                };

                var trackPointToValuePoint = function (trackPoint) {
                    return (trackDiffToValueDiff(trackPoint) + minValue);
                };

                var startThumbDrag = function (event) {
                    mousePrevX = XF.device.supports.touchEvents ? event.originalEvent.targetTouches[0].pageX : event.pageX || event.clientX || layerX || event.screenX;
                    savedVal = selValue;
                    $(document).bind(eventsHandler.end, stopThumbDrag);
                    $(document).bind(eventsHandler.move, doThumbDrag);
                };

                var doThumbDrag = function (event) {
                    mouseNewX = XF.device.supports.touchEvents ? event.originalEvent.targetTouches[0].pageX : event.pageX || event.clientX || layerX || event.screenX;
                    mouseDiff = mouseNewX - mousePrevX;
                    valueDiff = trackDiffToValueDiff(mouseDiff);
                    mousePrevX = mouseNewX;
                    savedVal += valueDiff;
                    setNewValue(savedVal);
                };

                var stopThumbDrag = function () {
                    $(document).bind(eventsHandler.end, stopThumbDrag);
                    $(document).bind(eventsHandler.move, doThumbDrag);
                };

                var startThumbPress = function () {
                    $(document).bind('keydown', doThumbPress);
                };

                var doThumbPress = function (event) {
                        
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

                var stopThumbPress = function () {
                    $(document).unbind('keydown', doThumbPress);
                };

                // initialing slider thumb dragging handler
                rangeWrapper.find('div.xf-input-range-thumb').bind('mousedown touchstart', startThumbDrag);

                // initialing arrow keys press handling
                rangeWrapper.find('div.xf-input-range-control')
                .bind('focus', startThumbPress)
                .bind('focusout', stopThumbPress);

                var trackClick = function( event) {
                        
                    // skipping events fired by thumb dragging
                    if (event.target == rangeWrapper.find('div.xf-input-range-thumb')[0]) {
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
            if (options.appearance == 'split' && isInputElement) {

                var applicableTypes = ['text', 'search', 'tel', 'url', 'email',
                'password', 'datetime', 'date', 'month', 'week', 'time', 'datetime-local', 'color'];

                _.each(applicableTypes, function (applicableType) {
                    
                    if (textInputType == applicableType) {
                        splitAppearance = true;
                    }
                });
            }

            var textInputID = (jQTextInput[0].nodeName === 'INPUT') ? jQTextInput.attr('id') : jQTextInput.find('input').eq(0).attr('id');
            var textInputLabel = (textInputID && textInputID.length) ? $('label[for=' + textInputID + ']') : [];

            // If the input doesn't have an associated label, quit
            if (textInputLabel.length) {

                if (splitAppearance) {

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
        }
    };

});

