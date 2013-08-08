
    XF.UI.enhancementList.textinput = {
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
    XF.UI.enhanceTextInput = function(textInput) {

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
