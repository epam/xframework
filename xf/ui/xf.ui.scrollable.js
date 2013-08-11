
    XF.UI.enhancementList.scrollable = {
        selector : '[data-scrollable=true]',
        enhanceElement : 'Scrollable'
    };

    /**
     Adds scrolling functionality
     @param scrollable DOM Object
     @private
     */
    XF.UI.Scrollable = {

        Render : function(scrollable) {

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
        }
    };
