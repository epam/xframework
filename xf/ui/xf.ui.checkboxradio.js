
    XF.UI.enhancementList.checkboxRadio = {
        selector : 'INPUT[type=checkbox], INPUT[type=radio]',
        enhanceMethod : 'enhanceCheckboxRadio'
    };

    /**
     Enhances checkbox or radio button input view
     @param textInput DOM Object
     @private
     */
    XF.UI.enhanceCheckboxRadio = function(chbRbInput) {
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
    };
