
    /**
     Generates basic popup container
     */
    XF.ui.popup = {
        render : function () {

            var id = XF.utils.uniqueID(),
                idStack = XF.ui.checkInIsset('popup'),
                newId = false;

            for (var i in idStack) {

                if (newId) {

                    if (!$('#' + idStack[i]).length) {
                        id = idStack[i];
                        newId = true;
                    }
                }
            }

            if (!newId) {
                XF.ui.issetElements.push({type : 'popup', id : id});
            }
            var jqPopup = $('<div class="xf-dialog " id="' + id + '"><div class="xf-dialog-content"></div></div>');

            return jqPopup;
        },

        // Shorthand to show dialogs
        showDialog : function (headerText, messageText, buttons) {
            var popup = this.createDialog(headerText, messageText, buttons);
            this.show(popup);
        },

        // Attaches popup (dialog/notification/etc.) to the page
        show : function (jqPopup) {
            XF.device.getViewport().append(jqPopup);
        },

        // Detaches popup (dialog/notification/etc.) from the page
        hide : function (jqPopup) {
            jqPopup.detach();
            XF.ui.removeFromIsset('popup', jqPopup.attr('id'));
        },


        // Generates a dialog with header, message and buttons
        createDialog : function (headerText, messageText, buttons) {
            buttons = buttons || [];

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

            var jqDialog = this.render(),
                _template = _.template(
                '<div class="xf-dialog-box"><div class="xf-dialog-box-header"><h3><%= headerText %></h3></div>' +
                '<div class="xf-dialog-box-content"><%= messageText %></div>' +
                '<div class="xf-dialog-box-footer clearfix"></div></div>'
            );

            jqDialog.find('.xf-dialog-content').html(_template({headerText : headerText, messageText : messageText}));
            var jqBtnContainer = jqDialog.find('.xf-dialog-box-footer');

            if (buttons.length < 1) {
                buttons.push({
                    text: 'OK',
                    handler: function (){
                        XF.UI.popup.hide(jqDialog);
                    }
                });
            }
            if (buttons.length > 0) {
                var jqBtn;

                _.each(buttons, function (btn, index, buttons){

                    if (btn instanceof $){
                        jqBtn = btn;
                    } else {
                        console.log('BUTTON');
                        console.log(btn);
                        jqBtn = XF.ui.popup.createButton(btn);
                    }

                    jqBtnContainer.append(
                        $('<div></div>')
                            .addClass('xf-grid-unit xf-grid-unit-1of' + btnCount)
                            .append(jqBtn)
                    );
                });
            }
            this.dialog = jqDialog;
            XF.trigger('ui:enhance', jqDialog);
            return jqDialog;
        },

        // Generates a notification with text and icon
        createNotification : function (messageText, iconName) {

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

            var jqNotification = this.render().addClass('xf-dialog-notification'),
                _template = _.template(
                    '<div class="xf-notification"><div class="xf-notification-wrap">' +
                    '<div class="xf-notification-text"><%= messageText %></div></div></div>'
            );

            jqNotification.find('.xf-dialog-content').html(_template({messageText : messageText}));

            if (iconName && iconName !== '') {
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

        // Stores dialog object
        dialog : null,

        // Hides Dialog
        hideDialog : function () {

            if (this.dialog) {
                this.hide(this.dialog);
            }
        },

        hideAll : function () {
            var idStack = XF.ui.checkInIsset('popup');

            for (var i in idStack) {

                if ($('#' + idStack[i]).length) {
                    this.hide($('#' + idStack[i]));
                }
            }
        },

        // Creates button within the dialog with parameters
        createButton : function (buttonDescr)  {
            var jQButton = $('<button></button>'),
                attrs = {};

            attrs['id'] = buttonDescr.id || XF.utils.uniqueID();
            attrs['class'] = buttonDescr['class'] || '';
            attrs['name'] = buttonDescr.name || attrs.id;
            buttonDescr.small = buttonDescr.small || '';

            jQButton.html(buttonDescr.text);

            //Set button's attributes
            // Icon
            if (buttonDescr.icon && buttonDescr.icon !== '') {
                attrs['data-icon'] = buttonDescr.icon;
            }

            // Icon position
            if (buttonDescr.iconpos && buttonDescr.iconpos !== '') {
                attrs['data-iconpos'] = buttonDescr.iconpos;
            }

            // Button size
            if (buttonDescr.small && buttonDescr.small !== '') {
                attrs['data-small'] = buttonDescr.small;
            }

            // Button appearance 
            if (buttonDescr.appearance && buttonDescr.appearance !== '') {
                attrs['data-appearance'] = buttonDescr.appearance;
            }

            // Button is special or not
            if (buttonDescr.special && buttonDescr.special !== '') {
                attrs['data-special'] = buttonDescr.special;
            }

            // Button is 'alert' or not
            if (buttonDescr.alert && buttonDescr.alert !== '') {
                attrs['data-alert'] = buttonDescr.alert;
            }

            jQButton.attr(attrs);

            // Set function for button pressed
            if (_.isFunction(buttonDescr.handler)) {
                jQButton.on('tap', buttonDescr.handler);
            }

            XF.ui.button.render(jQButton[0]);

            return jQButton;
        }
    };
