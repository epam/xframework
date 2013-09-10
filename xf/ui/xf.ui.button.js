
    /**
     Make the DOM object look like a button
     @param button DOM Object
     @private
     */
    XF.ui.button = {
        selector : 'A[data-role=button], BUTTON, INPUT[type=submit], INPUT[type=reset], INPUT[type=button], [data-appearance=backbtn]',

        render : function (button, options) {
            var jQButton = $(button),
                enhancedButton,
                innerStuff;

            if (!button || !(jQButton instanceof $) || jQButton.attr('data-skip-enhance') == 'true') {
                return;
            }

            if (button.nodeName == 'A' || button.nodeName == 'BUTTON') {
                enhancedButton = jQButton.attr({'data-skip-enhance':true});
                innerStuff = jQButton.html();
                jQButton.html('');

                // If it's INPUT - it's wrapped in a DIV and the necessary classes are added to the DIV.
            } else if (button.nodeName == 'INPUT') {
                // The input is assigned a class xf-input-hidden
                enhancedButton = $('<div></div>').append(jQButton.clone().addClass('xf-input-hidden').attr({'data-skip-enhance':true}));

                if (jQButton.hasOwnProperty('outerHtml')) {
                    jQButton.outerHtml(enhancedButton);
                }
                innerStuff = jQButton.attr('value');
            } else {
                // how did U get there? o_O
                return;
            }

            var isSmall = options.small === true || options.appearance == 'backbtn',
                position = options.position || '',
                id = jQButton.attr('id') || XF.utils.uniqueID();

            if (position !== '') {
                enhancedButton.addClass('xf-button-float-' + position);
            }

            if (jQButton.parents(XF.ui.header.selector).length > 0) {
                var hposition = position || 'right';
                enhancedButton.addClass('xf-button-header-' + hposition);
                enhancedButton.addClass('xf-button-float-' + hposition);
            }

            // The class xf-button is added to the button.
            // If it has data-small="true" attribute, the class should be xf-button-small.
            enhancedButton.addClass(isSmall ? 'xf-button-small' : 'xf-button');

            // If data-appearance="backbtn" attribute is present, xf-button-back class is also added.
            if (options.appearance === 'backbtn') {
                enhancedButton.addClass('xf-button-back');
            }

            var iconName = options.icon;

            if (options.appearance === 'backbtn' /*&& !jQButton.attr('data-icon')*/) {
                iconName = 'left';
            }

            if (iconName) {

                // If data-icon attribute is present, a SPAN.xf-icon is added inside the button.
                var iconSpan = $('<span class=xf-icon></span>');

                // The value of data-icon attribute is used to generate icon class: e.g. xf-icon-dots.
                iconSpan.addClass('xf-icon-' + iconName);

                // If the button had data-small=true or data-appearance="backbtn" attributes,
                // xf-icon-small class is also added to SPAN.xf-icon
                if (isSmall) {
                    iconSpan.addClass('xf-icon-small');
                } else {
                    iconSpan.addClass('xf-icon-big');
                }

                // A class denoting icon position is also added to the button. Default: xf-iconpos-left.
                // The value is taken from data-iconpos attr.
                // Possible values: left, right, top, bottom.
                var iconPos = options.iconpos || 'left';

                if (iconPos != 'left' && iconPos != 'right' && iconPos != 'top' && iconPos != 'bottom') {
                    iconPos = 'left';
                }
                enhancedButton.addClass('xf-iconpos-' + iconPos);
                enhancedButton.append(iconSpan);

            }

            if (innerStuff) {
                var textSpan = $('<span></span>').append(innerStuff);

                // The text of buttons is placed inside span.xf-button-small-text for small buttons
                if (isSmall || options.appearance == 'backbtn') {
                    textSpan.addClass('xf-button-small-text');
                    // and span.xf-button-text for big ones.
                } else {
                    textSpan.addClass('xf-button-text');
                }
                enhancedButton.append(textSpan);
            } else {

                if (isSmall) {
                    enhancedButton.addClass('xf-button-small-icon-only');
                }
            }

            // If data-special="true" attribute is present add xf-button-special class.
            if (options.special == true) {
                enhancedButton.addClass('xf-button-special');
            }

            // If data-alert="true" attribute is present add xf-button-alert class.
            if (options.alert == true) {
                enhancedButton.addClass('xf-button-alert');
            }

            enhancedButton.attr('id', id);
        }
    };
