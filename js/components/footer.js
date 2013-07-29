$(function(){

	var extending = {
	
		modelClass : XF.Model.extend({
			isEmptyData : true
		}),
		
		viewClass : XF.View.extend({
		
			preRender: function(){
				var buttonsClass = this.component.options.buttonsClass;
				var buttonsCount = this.component.options.buttons.length;
				
				buttonsClass = buttonsClass || '';
				buttonsClass += ' xf-grid-unit-1of' + buttonsCount + ' ';
				
				var component = this.component;
				
				var buttons = _.map(component.options.buttons, function(button, i, list){
				
					var retBut = {};
					
					retBut.text = button.text;
					
					retBut.buttonClass = buttonsClass + button.buttonClass;					
					retBut.textClass = button.textClass;
					retBut.iconClass = ' xf-icon-' + button.icon + ' ' + button.iconClass + ' ';
					
					retBut.id = component.id +'-item-' + i;
					component.buttonDictionary[retBut.id] = button.params;
					
					retBut.dataHrefString = '';
					
					if(button.href) {
						retBut.dataHrefString = ' data-href="' + button.href + '" ';
						component.buttonHrefIDMap[retBut.id] = button.href;
					}
					
					return retBut;
				});
				
				// Pass variables to the template
				this.component.model.set({
						isFixed: this.component.options.isFixed,
						buttons: buttons
					},{
						silent: true
				});
			},
			
			postRender: function(){
				var component = this.component;

                if (component.options.isFixed) {
                    var parentPage = $(component.selector()).parents('.xf-page');
                    if (parentPage[0]) {
                        parentPage.addClass('xf-page-has-fixed-footer')
                    }
                    else {
                        XF.Device.getViewport().addClass('xf-viewport-has-fixed-footer')
                    }
                }

				$(component.selector() + ' li a').touchable({longTapInterval : 500});
				
				$(component.selector() + ' li a').bind(XF.TouchGesture.TAP_EVENT, function(e, touchGesture) {
					var $but = $(this);
					component.selectButton($but);
					
					component.trigger('buttonClick', component.buttonDictionary[this.id]);
					
					return true;
				});
				
				XF.Router.bindAnyRoute(
					function() {
						component.selectButton(null);
					}
				);
				
				_.each(component.buttonHrefIDMap, function(value, key, list) {
					XF.Router.bindRoute(
						value,
						function() {
							component.selectButton($(component.selector() + ' #' + key));
						}
					);
				});
			}
		}),
		
		selectButton: function(button) {
			$(this.selector()).find('.xf-nav a').removeClass('xf-nav-item-active');
			if(button instanceof jQuery) {
				button.addClass('xf-nav-item-active');
			}
		},
		
		options: {
			buttonsClass : '',
			buttons : [],
			isFixed : true
		},
		
		buttonDictionary: {},
		buttonHrefIDMap: {}
	
	};
	
	XF.defineComponent(
		'footer',
		XF.Component.extend(extending)
	);

});