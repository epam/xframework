$(function(){

	var extending = {
	
		modelClass : XF.Model.extend({
			isEmptyData : true
		}),
		
		viewClass : XF.View.extend({
		
			preRender: function(){
			
				var component = this.component;
				var options = component.options;
				
					
				var modelVars = {};
				
				modelVars.hasTitle = (options.title && options.title != '');
				if(modelVars.hasTitle) {
					modelVars.title = '' + options.title;
					modelVars.titleClass = options.titleClass;
					if(!modelVars.titleClass) {
						modelVars.titleClass = '';
					}
				}
				
				modelVars.headerElement = options.headerElement || 'header';
				modelVars.isFixed = options.isFixed;
				
				
				var buttonsClass = options.buttonsClass || '';
				
				var buttons = _.map(options.buttons, function(button, i, list){
				
					var retBut = {};
					
					var align = button.align || 'left';
					if(align !== 'right') {
						align = 'left';
					}
					
					retBut.buttonClass = buttonsClass + ' ';
					if(button.buttonClass && button.buttonClass != '') {
						retBut.buttonClass += button.buttonClass + ' ';
					}
					retBut.buttonClass += 'xf-button-header-' + align + ' ';
					
					if(button.isBackBtn) {
						retBut.buttonClass += 'xf-button-small xf-button-back ';
					}
					
					if(button.isSpecial) {
						retBut.buttonClass += 'xf-button-special ';
					}
					
					retBut.hasText = button.isBackBtn || (button.text && button.text != '');
					if(retBut.hasText) {
						retBut.text = (button.isBackBtn ? 'Back' : '');
						if(button.text && button.text != '') {
							retBut.text = '' + button.text;
						}
						retBut.textClass = button.textClass;
					}
					
					retBut.hasIcon = ((button.icon && button.icon != '') || button.isBackBtn);

					if(retBut.hasIcon) {

                        if ( button.isBackBtn ) {
                            button.icon = "left";
                            retBut.buttonClass += 'xf-iconpos-left ';
                        }
						retBut.icon = 'xf-icon-' + button.icon;
						retBut.iconClass = button.iconClass;
					}
					
					if(retBut.hasIcon && !retBut.hasText) {
						retBut.buttonClass += 'xf-button-small-icon-only ';
					}
					
					retBut.hasTooltip = (button.tooltip && button.tooltip != '');
					if(retBut.hasTooltip) {
						retBut.tooltip = button.tooltip;
					} else if(button.isBackBtn) {
						retBut.hasTooltip = true;
						retBut.tooltip = 'Go to Previous page';
					}
					
					retBut.id = component.id +'-item-' + i;
					component.buttonDictionary[retBut.id] = button.params;
					
					retBut.dataHrefString = '';
					
					if(button.href) {
						retBut.dataHrefString = ' data-href="' + button.href + '" ';
						component.buttonHrefIDMap[retBut.id] = button.href;
					} else if(button.isBackBtn) {
						retBut.dataHrefString = ' href="javascript:XF.history.goBack();" ';
					}
					
					return retBut;
				});
				
				modelVars.buttons = buttons;
				
				// Pass variables to the template
				this.component.model.set(modelVars, {silent: true});
			},
			
			postRender: function(){
				var component = this.component;

                var parentPage = $(component.selector()).parents('.xf-page');
                if (parentPage[0]) {
                    parentPage.addClass('xf-page-has-fixed-header')
                }
                else {
                    XF.Device.getViewport().addClass('xf-viewport-has-fixed-header')
                }

				$(component.selector()).delegate('a', 'click', function(){
				
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
				
				/*_.each(component.buttonHrefIDMap, function(value, key, list) {
					XF.Router.bindRoute(
						value,
						function() {
							component.selectButton($(component.selector() + ' #' + key));
						}
					);
				}); */

				if (XF.history.fragment == "") {
					console.log(component.selector());
					$('.xf-button-back', component.selector()).hide();
				}

			}
		}),
		
		selectButton: function(button) {
			$(this.selector()).find('a').removeClass('xf-button-active');
			if(button instanceof $) {
				button.addClass('xf-button-active');
			}
		},
		
		options: {
			headerElement : null,					// e.g. 'header' (default) | 'h2' | 'div' | etc
			isFixed : true,							// adding 'xf-header-fixed' class
			buttonsClass : null,					// custom CSS class name to be applied on EACH button
			title : 'The title of the first page in the app which gets clipped when it\'s too long to fit on the screen',
			buttons : [{							// list of buttons descriptions
				align : 'left',						// 'left' | 'right'
				buttonClass : null,					// custom CSS class name to be applied on button
				isBackBtn : true,					// true | false
				isSpecial : false,					// true | false - changes the view only
				text : null,						// a text to be displayed
				textClass : null,					// custom CSS class name to be applied on text 
				icon : null,						// name of an icon (refer to the framework UI elements description for more info)
				iconClass : null,					// custom CSS class name to be applied on button
				href : null,						// URL to navigate to when clicked
				tooltip : 'Go to previous page',	// message that should be shown on rollover ('title' attribute value)
				params : {							// params to be passed into dispatched event ('buttonClick')
					data: 'back'
				}
			}]
		},
		
		buttonDictionary: {},
		buttonHrefIDMap: {}
	
	};
	
	XF.defineComponent(
		'header',
		XF.Component.extend(extending, {})
	);

});