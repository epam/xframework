$(function(){

	var extending = {
		modelClass : XF.Model.extend({
			isEmptyData : true
		}),
        viewClass : XF.View.extend({
            preRender: function(){
                var tPerRow = this.component.options.tabsPerRow;
                var total = this.component.options.tabsData.length;
                var rowCount = Math.ceil(total / tPerRow);

                var lastRowSize = total % tPerRow;
                if(!lastRowSize) {
                    lastRowSize = tPerRow;
                }
                var component = this.component;
                var tabs = _.map(component.options.tabsData, function(tab, i, list){
                    i++;
                    if (i === 1) {tab.className += ' xf-corner-tl '}
                    if (i === tPerRow || (rowCount == 1 && i == total)) {tab.className += ' xf-corner-tr '}
                    if (i == total + 1 - lastRowSize) {tab.className += ' xf-corner-bl '}
                    if (i === total) {tab.className += ' xf-corner-br '}
                    if (tab.active) {tab.className += ' xf-tabs-button-active '}

                    if (i > total - lastRowSize) {
                        tab.gridClass = 'xf-grid-unit-1of' + lastRowSize;
                    } else {
                        tab.gridClass = 'xf-grid-unit-1of' + tPerRow;
                    }
                    tab.id = component.id +'-item-' + i;
                    component.tabDictionary[tab.id] = tab.params;
                    return tab
                });

                // Pass variables to the template
                this.component.model.set({
                     tabsClass: '',
                     tabs: tabs
                },{
                    silent: true
                })
            },
            postRender: function(){
                var component = this.component;
				
				$(component.selector() + ' li a').touchable({
					longTapInterval : 500
				});
				
				$(component.selector() + ' li a').bind(XF.TouchGesture.TAP_EVENT, function(e, touchGesture) {
                    var $t = $(this);
                    $t.closest('.xf-tabs').find('a.xf-tabs-button-active').removeClass('xf-tabs-button-active');
                    $t.addClass('xf-tabs-button-active');
                    component.trigger('tabSwitch', component.tabDictionary[this.id]);
                    return false;
				});
				
            }
        }),

        options: {
            tabsPerRow : 4,
            tabsClass : '',
            tabsData : [{
                    text : 'Tab 1',
                    params : 'btn1',
                    className : 'asd',
                    active: true
                }, {
                    text : 'Tab 2',
                    params : {1:0,2:3},
                    className : ''
                }, {
                    text : 'Tab 3',
                    params : null,
                    className : ''
                }, {
                    text : 'Tab 4',
                    className : ''
                }, {
                    text : 'Tab 5',
                    params : [],
                    className : ''
                }, {
                    text : 'Tab 6',
                    params : 0,
                    className : ''
                }, {
                    text : 'Tab 7',
                    params : 'pam-pam',
                    className : ''
                }]
        },
        tabDictionary: {}

	};



	XF.defineComponent(
		'tabs',
		 XF.Component.extend(extending, {})
	);
	
});