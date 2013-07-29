(function(window, BB) {

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
}).call(this, window, Backbone);