
    /**
     Add scrolling functionality
     */
    XF.ui.scrollable = {

        selector : '[data-scrollable=true]',

        render : function (scrollable) {

            var jQScrollable = $(scrollable);
            if (!scrollable || !(jQScrollable instanceof $) || jQScrollable.attr('data-skip-enhance') == 'true') {
                return;
            }

            var id = jQScrollable.attr('id') || XF.utils.uniqueID();

            jQScrollable.attr({'data-skip-enhance':true, 'id' : id});

            var children = jQScrollable.children();

            // Always create wrapper
            if (children.length == 1 && false) {
                children.addClass('xf-scrollable-content');
            } else {
                jQScrollable.append(
                    $('<div></div>')
                        .addClass('xf-scrollable-content')
                        .append(children)
                );
            }

            var wrapperId = jQScrollable.attr('id');

            if (!wrapperId || wrapperId == '') {
                wrapperId = 'xf_scrollable_' + new Date().getTime();
                jQScrollable.attr({'id':wrapperId});
            }

            // Use iScroll
            var ISItem = jQScrollable.data('iscroll', new iScroll(wrapperId));
            var wrapperChanged = false;

            var doRefreshIScroll = function () {

                if (wrapperChanged) {
                    wrapperChanged = false;
                    ISItem.data('iscroll').refresh();
                    bindHanlders();
                }
            };

            var needRefreshIScroll = function (){

                if ($.contains($('#' + wrapperId)[0], this)) {
                    wrapperChanged = true;
                    setTimeout(doRefreshIScroll, 100);
                }
            };

            // Bind hadlers to the scrollable element
            var bindHanlders = function () {
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
