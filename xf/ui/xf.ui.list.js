
    XF.UI.enhancementList.list = {
        selector : 'UL[data-role=listview], OL[data-role=listview]',
        enhanceMethod : 'enhanceList'
    };

    /**
     Enhances ul/ol lists view
     @param list DOM Object
     @private
     */
    XF.UI.enhanceList = function(list) {
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
    };
