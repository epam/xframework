
    /**
     Enhances ul/ol lists view
     @param list DOM Object
     @private
     */
    XF.ui.list = {

        selector : 'UL[data-role=listview], OL[data-role=listview]',

        render : function (list, options) {
            var jQList = $(list);

            if (!list || !(jQList instanceof $) || jQList.attr('data-skip-enhance') == 'true') {
                return;
            }
            var listItems = jQList.children('li'),
                linkItems = listItems.children('a'),
                listItemsScope = [],
                fullWidth = options.fullwidth || 'false',
                listId = jQList.attr('id') || XF.utils.uniqueID();

            linkItems.addClass('xf-li-btn').children('.xf-count-bubble').parent().addClass('xf-li-has-count');
            listItems.not(linkItems.parent()).not('[data-role=divider]').addClass('xf-li-static');

            jQList.attr({'data-skip-enhance':true, 'id': listId}).addClass('xf-listview')
                .children('li[data-icon]').children('a').each(function () {
                    var anchor = $(this);
                    var icon = anchor.parent().attr('data-icon');
                    anchor.append(
                        $('<span></span>').addClass('xf-icon xf-icon-big xf-icon-' + icon)
                    );
                    var iconPos = anchor.parent().attr('data-iconpos');

                    if (iconPos != 'left' && iconPos != 'right') {
                        iconPos = 'right';
                    }
                    anchor.addClass('xf-li-with-icon-' + iconPos);
                });

            if (fullWidth === 'true') {
                jQList.addClass('xf-listview-fullwidth');
            }

            linkItems.children('img').parent().each(function (){
                var anchor = $(this);
                var thumbPos = anchor.parent().attr('data-thumbpos');

                if (thumbPos != 'right' && thumbPos != 'left') {
                    thumbPos = 'left';
                }
                anchor.addClass('xf-li-with-thumb-' + thumbPos);
                anchor.children('img').addClass('xf-li-thumb xf-li-thumb-' + thumbPos);
            });

            linkItems.each(function () {
                var anchor = $(this);
                anchor.append(
                    $('<div class=xf-btn-text></div>')
                        .append(
                            anchor.children().not('.xf-icon, .xf-count-bubble, .xf-li-thumb')
                        )
                );
            });

            listItems.find('h1, h2, h3, h4, h5, h6').addClass('xf-li-header');

            listItems.find('p').addClass('xf-li-desc');

            listItems.filter('.xf-li-static').each(function (){
                $(this).wrapInner('<div class=xf-li-wrap />');
            });

            $.each(listItems, function (key, value) {
                var html = listItems.eq(key).html(),
                    role = listItems.eq(key).attr('data-role') || '',
                    class_ = (listItems.eq(key).attr('class') || '') + ' xf-li',
                    id = listItems.eq(key).attr('id') || '';

                if (role !== '') {
                    class_ += ' xf-li-' + role;
                }
                listItemsScope.push({'html': html, 'class_': class_, 'id': id});
            });

            var _template = _.template(
                '<% _.each(listItemsScope, function(item) { %> '
                    + '<li class="<%= item.class_ %>" id="<%= item.id %>"><%= item.html %></li>'
                + '<% }); %>'
            );

            jQList.html(_template({listItemsScope : listItemsScope}));
        }
    };
