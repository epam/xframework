

    if (!_.isFunction($.fn.detach)) {
        $.fn.detach = function(a) {
            return this.remove(a,!0);
        };
    }

    if (!_.isFunction($.fn.wrapInner)) {
        $.fn.wrapInner = function( html ) {
            if ( _.isFunction( html ) ) {
                return this.each(function(i) {
                    $(this).wrapInner( html.call(this, i) );
                });
            }

            return this.each(function() {
                var self = $( this ),
                    contents = self.contents();

                if ( contents.length ) {
                    contents.wrapAll( html );

                } else {
                    self.append( html );
                }
            });
        };
    }

    var _olddetach = $.fn.detach;
    /** @ignore */
    $.fn.detach = function() {
        var parent = $(this).parent();
        var res = _olddetach.apply(this,arguments);
        parent.trigger('detach');
        return res;
    };

    /** @ignore */
    /** Cannot use $.fn.extend because of Zepto support **/
    $.fn.outerHtml = function(replacement) {

        if(replacement) {
            return this.each(function(){
                $(this).replaceWith(replacement);
            });
        }

        var tmp_node = $('<div></div>').append( $(this).clone() );
        var markup = tmp_node.html();

        tmp_node.remove();
        return markup;
    };
