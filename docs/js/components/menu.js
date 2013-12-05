$(function(){

	var extending = {
        getMenuItem: function (item) {
            var component = this,
                $component = component.selector(),
                $a = $('li > a', $component);

            XF.ui.loader.hide();
            XF.ui.loader.show();

            $a.removeClass('xf-li-btn-active');
            $($component).find('[data-url=' + item + ']').addClass('xf-li-btn-active');
            



            if (!$('#' + item).length) {
                $.get(
                    this.getItemURL(item),
                    function (data, status) {
                        component.constructMenuItem(item, data);
                    }
                );
            }else{
                this.showMenuItem(item);
            }


        },

        constructMenuItem: function (item, data) {
            var html  = '<div id="' + item + '" class="xf-page xf-has-header"><div class="xf-page-content xf-indented">' + data + '</div></div>';
            if (this.options.contentSelector.length) $(this.options.contentSelector).append(html);
            else $('body').append(html);

            

            XF.ui.enhance($('#' + item));
            this.showMenuItem(item);
        },

        getItemURL: function (item) {
            return this.options.itemURL + item + this.options.itemURLPostfix;
        },

        showMenuItem: function (item) {
            XF.trigger('pages:show', item);
            XF.ui.loader.hide();
        },

		Collection : XF.Collection.extend({
            url: 'mocks/menu.json'

        }),

        options: {
            itemURL: 'data/',
            itemURLPostfix: '.html',
            contentSelector: '#content',
            defaultItem: 'what_is_xframework_',
            autorender: true,
            autoload: true,
            showFirstItem: true
        },

        View: XF.View.extend({}),

        initialize: function () {
            var component = this,
                fragment = (XF.history.fragment !== '' && XF.history.fragment !== '/') ?
                            XF.history.fragment :
                            ((component.options.showFirstItem) ? component.options.defaultItem : XF.history.fragment );
                            
            XF.on('menu:go', _.bind(component.go, this));
            XF.on('component:menu:rendered', function () {component.go({hash: fragment}); });

        },

        go: function (data) {
            if (_.isEmpty(data)) return;
            if (_.isEmpty(data.hash)) return;

            var hash = data.hash.replace(/^\/|\/$/g, '');

            if (this.collection.where({url: hash})) {
                this.getMenuItem(hash);
            } else if (menu[this.options.defaultItem] !== undefined) {
                this.getMenuItem(this.options.defaultItem);
            }
        }

	};



	XF.define(
		'menu',
		 XF.Component.extend(extending, {})
	);

});