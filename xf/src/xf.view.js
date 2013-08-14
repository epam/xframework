    /**
     Implements view workaround flow.
     @class
     @static
     @augments XF.Events
     */

    XF.View = BB.View.extend({

        /**
         Would be dispatched once when the Component inited
         @name XF.View#init
         @event
         */

        /**
         Would be dispatched once when the Component constructed
         @name XF.View#construct
         @event
         */

        /**
         Would be dispatched once, when template is ready for use
         @name XF.View#templateLoaded
         @event
         */

        /**
         Would be dispatched after each render
         @name XF.View#refresh
         @event
         */

        /**
         Link to the {@link XF.Component} instance
         @type XF.Component
         */
        component : null,

        /**
         Template URL
         @type String
         */
        templateURL : null,

        /**
         Flag that determines whether the Model update should be ignored by the View (in this case you may launch {@link XF.View#refresh} manualy)
         @default false
         @type Boolean
         */
        ignoreModelUpdate : false,

        /**
         Flag that determines whether the view should be rerendered each time the component becomes visible
         @default false
         @type Boolean
         */
        updateOnShow: false,

        /**
         Flag that determines whether the template should be stored into {@link XF.Cache}
         @default false
         @type Boolean
         */
        useCache: false,

        /**
         Constructs view instance
         @private
         */
        construct : function() {
            /** ignore */
            var templateLoaded = function() {

                if(this.loadTemplateFailed) {
                    this.unbind('templateLoaded', templateLoaded);
                    this.afterLoadTemplateFailed();
                    return;
                }

                if(!this.component.constructor.templateLoaded) {
                    this.loadTemplate();
                    return;
                }

                this.unbind('templateLoaded', templateLoaded);
                this.afterLoadTemplate();

                this.initialize();
                this.trigger('init');

                if(!this.ignoreModelUpdate) {
                    this.component.model.bind('changed', this.refresh, this);
                }
                if(this.updateOnShow) {
                    $(this.component.selector()).bind('show', _.bind(this.refresh, this));
                }

                this.trigger('construct');
            };

            this.bind('templateLoaded', templateLoaded);

            this.beforeLoadTemplate();
            this.loadTemplate();
        },

        /**
         Stores last device type that was used for template url generation
         @type String
         @private
         */
        lastDeviceType : null,

        /**
         Generates template url - override if custom format is required and {@link XF.Settings} has no appropriate way to handle it
         @private
         */
        getTemplateURL : function() {
            // clearing saved template URL - it was erroneous
            if(this.lastDeviceType) {
                this.templateURL = null;
            }
            if(!this.templateURL) {
                if(!this.component) {
                    throw 'XF.View "component" linkage lost';
                }

                this.lastDeviceType = XF.Device.getNextType(this.lastDeviceType);

                // preventing from infinit cycle
                if(!this.lastDeviceType) {
                    return null;
                }

                var templatePath = '';
                if(this.lastDeviceType && this.lastDeviceType.templatePath) {
                    templatePath = this.lastDeviceType.templatePath;
                }
                this.templateURL = XF.Settings.property('templateUrlFormatter')(this.component.name, templatePath);
            }
            return this.templateURL;
        },

        /**
         Compiles component template if necessary & executes it with current component instance model
         @static
         */
        getMarkup: function() {
            if(!this.component.constructor.compiledTemplate) {
                this.component.constructor.compiledTemplate = _.template(this.component.constructor.template);
            }
            return this.component.constructor.compiledTemplate(this.component.model);
        },

        /**
         HOOK: override to add logic before template load
         */
        beforeLoadTemplate : function() {},

        /**
         A flag that indicates whether the template loading failed
         @type Boolean
         @private
         */
        loadTemplateFailed : false,

        /**
         Loads template
         @private
         */
        loadTemplate : function() {

            var url = this.getTemplateURL();
            if(url == null) {
                this.loadTemplateFailed = true;
                this.trigger('templateLoaded');
                return;
            }

            // trying to get template from cache
            if(this.useCache) {
                var cachedTemplate = XF.Cache.get(url);
                if(cachedTemplate) {
                    this.component.constructor.template = cachedTemplate;
                    this.component.constructor.templateLoaded = true;
                    this.trigger('templateLoaded');
                    return;
                }
            }

            if(!this.component.constructor.templateLoaded && !this.component.constructor.templateLoading) {

                this.component.constructor.templateURL = url;
                this.component.constructor.templateLoading = true;

                var $this = this;

                $.ajax({
                    url: url,
                    complete : function(jqXHR, textStatus) {
                        if(!$this.component) {
                            throw 'XF.View "component" linkage lost';
                        }
                        if(textStatus == 'success') {
                            var template = jqXHR.responseText;

                            // saving template into cache if the option is turned on
                            if($this.useCache) {
                                XF.Cache.set(url, template);
                            }

                            $this.component.constructor.template = jqXHR.responseText;
                            $this.component.constructor.templateLoading = false;
                            $this.component.constructor.templateLoaded = true;
                            $this.trigger('templateLoaded');
                            XF.trigger('templateLoaded', {url: url, template:template});
                        } else {
                            $this.component.constructor.template = null;
                            $this.component.constructor.templateLoading = false;
                            $this.component.constructor.templateLoaded = false;
                            $this.trigger('templateLoaded');
                            XF.trigger('templateLoaded', {url: url, template : null});
                        }
                    }
                });

            } else if(this.component.constructor.templateLoading) {

                var $this = this;
                url = this.component.constructor.templateURL;

                /** ignore */
                var templateLoadedAsync = function(params) {
                    if(params.url == url) {
                        XF.unbind('templateLoaded', templateLoadedAsync);
                        $this.trigger('templateLoaded');
                    }
                };

                XF.bind('templateLoaded', templateLoadedAsync);

            } else {
                this.trigger('templateLoaded');
            }
        },

        /**
         HOOK: override to add logic after template load
         */
        afterLoadTemplate : function() {},

        /**
         HOOK: override to add logic for the case when it's impossible to load template
         */
        afterLoadTemplateFailed : function() {
            console.log('XF.View :: afterLoadTemplateFailed - could not load template for "' + this.component.id + '"');
            console.log('XF.View :: afterLoadTemplateFailed - @dev: verify XF.Device.types settings & XF.View :: getTemplate URL overrides');
        },

        /**
         Renders component into placeholder + calling all the necessary hooks & events
         */
        refresh : function() {
            this.preRender();
            this.render();
            this.postRender();
            this.trigger('refresh');
        },

        /**
         HOOK: override to add logic before render
         */
        preRender : function() {},


        /**
         Identifies current render vesion
         @private
         */
        renderVersion : 0,

        /**
         Renders component into placeholder
         @private
         */
        render : function() {
            this.renderVersion++;
            this.$el.html(this.getMarkup());
            XF.trigger('ui:enhance', this.$el);
        },

        initialize: function () {
            this.setElement('[data-id=' + this.attributes['data-id'] + ']');
        },

        /**
         HOOK: override to add logic after render
         */
        postRender : function() {}

    });