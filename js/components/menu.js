$(function(){

	var extending = {
        getMenuItem: function (item) {
            var component = this,
                $component = component.selector(),
                $a = $('li > a', $component);

            XF.UIElements.showLoading();

            $a.removeClass('xf-li-btn-active');
            $('[data-url=' + item + ']', $component).addClass('xf-li-btn-active');



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
            var html  = '<div id="' + item + '" class="xf-page"><div class="xf-page-content xf-indented">' + data + '</div></div>'; 
            if (this.options.contentSelector.length) $(this.options.contentSelector).append(html);
            else $(XF.RootComponentInstance.selector()).append(html);
            XF.UIElements.enhanceView($('#' + item));
            this.showMenuItem(item);
        },

        getItemURL: function (item) {
            return this.options.itemURL + item + this.options.itemURLPostfix;
        },

        showMenuItem: function (item) {
            XF.PageSwitcher.switchToPage($('#' + item));
            SyntaxHighlighter.highlight();
            XF.UIElements.hideLoading();
        },

		modelClass : XF.Model.extend({
            afterLoadData : function() {
                this.set({'menu': this.rawData});

            }
        }),
        viewClass : XF.View.extend({
            postRender: function(){
                var component = this.component,
                    $component = component.selector();
            }
        }),

        options: {
            itemURL: 'data/',
            itemURLPostfix: '.html',
            contentSelector: '#content',
            defaultItem: 'about'
        },

        init: function () {
            var component = this,
                fragment = (XF.history.fragment !== '' && XF.history.fragment !== '/') ?
                            XF.history.fragment :
                            ((component.options.showFirstItem) ? XF.history.fragment : component.options.defaultItem);

            XF.Controller.bind('menu:go', _.bind(component.go, this));
            component.ready(function () {
                component.go({hash: fragment});
            });

            component.refresh();
        },

        go: function (data) { 
            var hash = data.hash.replace(/^\/|\/$/g, ''),
                menu = this.model.get('menu');
                
            if (menu !== undefined) {
                if (menu[hash] !== undefined) {
                    this.getMenuItem(hash);
                } else if (menu[this.options.defaultItem] !== undefined) {
                    this.getMenuItem(this.options.defaultItem);
                }
            }
        }

	};



	XF.defineComponent(
		'menu',
		 XF.Component.extend(extending, {})
	);
	
});