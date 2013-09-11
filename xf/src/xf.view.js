    /**
     Implements view workaround flow.
     @class
     @static
     @augments XF.Events
     */

    XF.View = BB.View.extend({

        url: function () {
            return XF.settings.property('templateUrlPrefix') + XF.device.type.templatePath + this.component.name + XF.settings.property('templateUrlPostfix');
        },

        /**
         Flag that determines whether the Model update should be ignored by the View (in this case you may launch {@link XF.View#refresh} manualy)
         @default false
         @type Boolean
         */

        _bindListeners: function () {
            if(this.component.options.autorender) {
                if (this.component.collection) {
                    this.listenTo(this.component.collection, 'fetched', this.refresh);
                }else if (this.model) {
                    this.listenTo(this.component.model, 'fetched', this.refresh);
                }
            }

            this.on('refresh', this.refresh, this);
        },

        _initProperties: function () {
            this.template = this.template || {};
            this.template = {
                src: this.template.src || null,
                compiled: this.template.compiled || null,
                cache: this.template.cache || true
            };

            this.status = {
                loaded: false,
                loading: false,
                loadingFailed: false
            };

            this.component = null;
        },

        constructor: function (options) {
            // Sorry, BB extend makes all properties static
            this._initProperties();

            this.setElement('[data-id=' + options.attributes['data-id'] + ']');


            if (options.component) {
                this.component = options.component;
            }
            _.omit(options, 'component');

            this._bindListeners();

            this.load();

            BB.View.apply(this, arguments);
        },

        initialize: function () {

        },

        construct: function () {

        },

        load: function () {

            if (this.template.src) {
                this.status.loading = false;
                this.status.loaded = true;
                this.trigger('loaded');
                return;
            }

            var url = (_.isFunction(this.url)) ? this.url() : this.url;

            if(!url) {
                this.status.loadingFailed = true;
                this.trigger('loaded');
                return;
            }

            // trying to get template from cache
            if(this.template.cache && _.has(XF, 'storage')) {
                var cachedTemplate = XF.storage.get(url);
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
                            if($this.template.cache && _.has(XF, 'storage')) {
                                XF.storage.set(url, template);
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
            var data = {};

            if(!this.template.compiled) {
                this.template.compiled = _.template(this.template.src);
            }

            if (this.component.collection) {
                data = this.component.collection.toJSON();
            }else if (this.component.model) {
                data = this.component.model.toJSON();
            }

            return this.template.compiled({data: data});
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
            console.log('XF.View :: afterLoadTemplateFailed - @dev: verify XF.device.types settings & XF.View :: getTemplate URL overrides');
        },

        /**
         Renders component into placeholder + calling all the necessary hooks & events
         */
        refresh: function() {

            console.log(this)
            console.log('REFRESHING VIEW', this.component.id, this.component.collection);
            if (this.status.loaded && this.template.src) {
                if ((!this.component.collection && !this.component.model) || (this.component.collection && this.component.collection.status.loaded) || (this.component.model && this.component.model.status.loaded)) {
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
            console.log('RENDERING VIEW', this.component.id, this.component.collection);
            this.$el.html(this.getMarkup());
            XF.trigger('ui:enhance', this.$el);
            this.renderVersion++;

            console.log('RENDERED', this.component.id);
            this.trigger('rendered');

            return this;
        },


        /**
         HOOK: override to add logic after render
         */
        afterRender : function() {}

    });