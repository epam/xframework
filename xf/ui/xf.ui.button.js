
    /**
     Make the DOM object look like a button
     @param button DOM Object
     @private
     */
    XF.UI.button = {
        selector : 'A[data-role=button], BUTTON, INPUT[type=submit], INPUT[type=reset], INPUT[type=button], [data-appearance=backbtn]',

        render : function(button) {
            var jQButton = $(button);
            if(!button || !jQButton instanceof $) {
                return;
            }

            if(jQButton.attr('data-skip-enhance') == 'true') {
                return;
            }

            var enhancedButton;
            var innerStuff;



            //UNDERSCORE TEMPLATES

    //        var inputTpl = _.template('<div></div>');
            //-- UNDERSCORE TEMPLATES

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
         Generates and enhances button
         @param buttonDescr Object
         @return $
         */
        create : function (buttonDescr)  {
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
            var jQButton = $('<button>/button>');
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

            this.render(jQButton[0]);

            return jQButton;
        }
    };
