
    /**
     Enhances checkbox or radio button input view
     @param textInput DOM Object
     @private
     */
    XF.UI.checkboxRadio = {

        selector : 'INPUT[type=checkbox], INPUT[type=radio]',

        render : function(chbRbInput, options) {

            var jQChbRbInput = $(chbRbInput),
                options = {
                    id : '',
                    input : '',
                    wrapperClass : '',
                    labelClass : '',
                    labelFor : '',
                    isSwitch : false,
                    label : ''
                };

            if (!chbRbInput || !jQChbRbInput instanceof $ || jQChbRbInput.attr('data-skip-enhance') == 'true') {
                return;
            }

            jQChbRbInput.attr({'data-skip-enhance':true});
            options.id = jQChbRbInput.attr('id') || 'xf-' + Math.floor(Math.random()*10000);
            options.input = jQChbRbInput.wrap("<span></span>").parent().html();
            jQChbRbInput.attr('id', options.id);
            var chbRbInputLabel = $('label[for=' + options.id + ']');

            // If the input doesn't have an associated label, quit
            if (chbRbInputLabel.length) {

                var typeValue = jQChbRbInput.attr('type').toLowerCase(),
                    wrapper = $('<div></div>'),
                    isSwitch = options.isSwitch = jQChbRbInput.attr('data-role') == 'switch';

                if (!isSwitch) {
                    options.wrapperClass = 'xf-input-' + typeValue;
                    options.labelClass = 'xf-input-positioner';
                    chbRbInputLabel.addClass('xf-input-label');
                } else {
                    options.wrapperClass = 'xf-switch';
                    options.labelClass = 'xf-switch-control';
                    chbRbInputLabel.addClass('xf-switch-label');
                }
                wrapper.append(chbRbInputLabel);
                options.labelFor = chbRbInputLabel.wrap("<span></span>").parent().html();

                var _template = _.template(
                    '<div class="<%= options.wrapperClass %>"><label for="<%= options.id %>" class="<%= options.labelClass %>">'
                    + '<%= options.input %><% if(options.isSwitch) { %>'
                    + '<span class=xf-switch-track><span class=xf-switch-track-wrap>'
                    + '<span class=xf-switch-thumb></span>'
                    + '</span></span>'
                    + '<% } %>'
                    + '</label><%= options.labelFor %></div>'
                );
                jQChbRbInput.parent().html(_template({options : options}));
            }
        }
    };
