
    /**
     Generates basic popup container
     @return $
     @private
     */
    XF.UI.createPopup = function() {
        /*
         <div class="xf-dialog "><div class="xf-dialog-content"></div></div>
         */
        var jqPopup =
            $('<div class="xf-dialog " id="xf-' + Math.floor(Math.random() * 10000) + '"><div class="xf-dialog-content"></div></div>');
        return jqPopup;
    };

    /**
     Shorthand to show dialogs
     @param headerText String to show in dialog header
     @param messageText String to show in dialog body
     @param buttons Array of buttons to show ($ objects or objects with button description for createButton() method)
     */
    XF.UI.showDialog = function (headerText, messageText, buttons) {
        var popup = XF.UI.createDialog(headerText, messageText, buttons);
        XF.UI.showPopup(popup);
    };

    /**
     Attaches popup (dialog/notification/etc.) to the page
     @param jqPopup $ object representing popup
     */
    XF.UI.showPopup = function(jqPopup) {
        XF.Device.getViewport().append(jqPopup);
    };

    /**
     Detaches popup (dialog/notification/etc.) from the page
     @param jqPopup $ object representing popup
     */
    XF.UI.hidePopup = function(jqPopup) {
        jqPopup.detach();
    };


    /**
     Generates a dialog with header, message and buttons
     @param headerText String to show in dialog header
     @param messageText String to show in dialog body
     @param buttons Array of buttons to show ($ objects or objects with button description for createButton() method)
     @param modal Boolean Flag which indicates whether the dialog is modal
     @return $ Dialog object
     */
    XF.UI.createDialog = function(headerText, messageText, buttons) {

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

        var jqDialog = XF.UI.createPopup();
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
                    XF.UI.hidePopup(jqDialog);
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
                    jqBtn = XF.UI.Button.Create(btn);
                }

                jqBtnContainer.append(
                    $('<div></div>')
                        .addClass('xf-grid-unit xf-grid-unit-1of' + btnCount)
                        .append(jqBtn)
                );
            });
        }
        XF.UI.dialog = jqDialog;
        return jqDialog;
    };

    /**
     Generates a notification with text and icon
     @param messageText String to show in dialog body
     @param iconName Icon name (optional)
     @return $ Notification object
     */
    XF.UI.createNotification = function(messageText, iconName) {

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

        var jqNotification = XF.UI.createPopup().addClass('xf-dialog-notification');
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
    };

    /**
     Stores loading notification object
     @type $
     @private
     */
    XF.UI.loadingNotification = null;


    /**
     Stores dialog object
     @type $
     @private
     */
    XF.UI.dialog = null;

    /**
     Saves passed popup as default loading notification
     @param jqPopup $ object representing popup
     */
    XF.UI.setLoadingNotification = function(jqPopup) {
        XF.UI.loadingNotification = jqPopup;
    };

    /**
     Shows loading notification (and generates new if params are passed)
     @param messageText String to show in loading notification
     @param icon Icon name (optional)
     */
    XF.UI.showLoading = function (messageText, icon) {
        if(messageText || icon) {
            if(XF.UI.loadingNotification) {
                XF.UI.hideLoading();
            }
            XF.UI.setLoadingNotification(
                XF.UI.createNotification(messageText, icon)
            );
        }
        if(!XF.UI.loadingNotification) {
            XF.UI.setLoadingNotification(
                XF.UI.createNotification('Loading...')
            );
        }
        XF.UI.showPopup(XF.UI.loadingNotification);
    };

    /**
     Hides loading notification
     */
    XF.UI.hideLoading = function () {
        if(XF.UI.loadingNotification) {
            XF.UI.hidePopup(XF.UI.loadingNotification);
        }
    };

    /**
     Hides Dialog
     */
    XF.UI.hideDialog = function () {
        if(XF.UI.dialog) {
            XF.UI.hidePopup(XF.UI.dialog);
        }
    };
