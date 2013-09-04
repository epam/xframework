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
         A flag that indiacates whether that template is currently being loaded
         @type Boolean
         @private
         @static
         */
        status: {
            loaded: false,
            loading: false,
            loadingFailed: false
        },

        template: {
            src: null,
            compiled: null,
            cache: true
        },

        url: function () {
            return XF.Settings.getProperty('templateUrlPrefix') + XF.Device.type.templatePath + this.component.name + XF.Settings.getProperty('templateUrlPostfix');
        },

        /**
         Flag that determines whether the Model update should be ignored by the View (in this case you may launch {@link XF.View#refresh} manualy)
         @default false
         @type Boolean
         */

        _bindListeners: function () {
            if(!this.component.options.autorender) {
                if (this.component.collection) {
                    this.listenTo(this.component.collection, 'fetched', this.refresh);
                }else if (this.component.model) {
                    this.listenTo(this.component.model, 'fetched', this.refresh);
                }
            }

            this.on('refresh', this.refresh, this);
        },

        initialize: function () {
            this.setElement('[data-id=' + this.attributes['data-id'] + ']');

            this._bindListeners();

            this.load();
        },

        construct: function () {

        },

        load: function () {
            if (this.template.src) {
                return;
            }

            var url = (_.isFunction(this.url)) ? this.url() : this.url;

            if(!url) {
                this.status.loadingFailed = true;
                this.trigger('loaded');
                return;
            }

            // trying to get template from cache
            if(this.template.cache && _.has(XF, 'Cache')) {
                var cachedTemplate = XF.Cache.get(url);
                if (cachedTemplate) {
                    this.template.src = cachedTemplate;
                    this.status.loaded = true;
                    this.trigger('loaded');
                    return;
                }
            }

            if(!this.status.loaded && !this.status.loading) {

                this.status.loading = true;

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
                            if($this.template.cache && _.has(XF, 'Cache')) {
                                XF.Cache.set(url, template);
                            }

                            $this.template.src = jqXHR.responseText;
                            $this.status.loading = false;
                            $this.status.loaded = true;
                            $this.afterLoadTemplate();
                            $this.trigger('loaded');
                        } else {
                            $this.template.src = null;
                            $this.status.loading = false;
                            $this.status.loaded = false;
                            $this.status.loadingFailed = true;
                            $this.afterLoadTemplateFailed();
                            $this.trigger('loaded');
                        }
                    }
                });
            }
        },

        /**
         Compiles component template if necessary & executes it with current component instance model
         @static
         */
        getMarkup: function() {
            if(!this.template.compiled) {
                this.template.compiled = _.template(this.template.src);
            }

            return this.template.compiled();
        },

        /**
         HOOK: override to add logic before template load
         */
        beforeLoadTemplate : function() {},


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
        refresh: function() {
            if (this.status.loaded && this.template.src) {
                if ((this.collection && this.collection.loaded) || (this.model && this.model.loaded)) {
                    this.beforeRender();
                    this.render();
                    this.afterRender();
                }
            }
        },

        /**
         HOOK: override to add logic before render
         */
        beforeRender : function() {},


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
            this.$el.html(this.getMarkup());
            XF.trigger('ui:enhance', this.$el);
            this.renderVersion++;

            this.trigger('rendered');

            return this;
        },


        /**
         HOOK: override to add logic after render
         */
        afterRender : function() {}

    });