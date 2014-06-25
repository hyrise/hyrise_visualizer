(function() {
	hyryx.debug.Attributes = function() {
		this.markups = {};
		this.currentMarkup = null;
		this.container = null;
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	};

	hyryx.debug.Attributes.prototype = extend(hyryx.screen.AbstractUIPlugin, {

		render : function() {
			this.container = this.createAttributesContainer();

			return this.container.el;
		},

		init : function() {},

		/** Make certain functions accessible for other plugins */
		handleEvent : function() {},

		getCurrentMarkup : function() {
			return this.currentMarkup || {
				type : undefined,
				hide : function(){}
			};
		},

		setCurrentMarkup : function(to) {
			this.currentMarkup = this.markups[to];
		},

		hide : function() {
			this.targetEl.parent().addClass('hideSidebar');
		},

		show : function(node) {
			var id = node.type;

			if (this.getCurrentMarkup().type !== node.type) {

				// if no markup exists for the given type of node, create a new one
				if (!this.markups[id]) {
					console.log('create new markup for ' + node.type);
					this.markups[id] = new Markup(node, this.el);
				}

				// hide existing forms
				this.getCurrentMarkup().hide();
				this.setCurrentMarkup(id);
			}

			// reference to selected node
			this.selection = node;

			// show the form for the given node data
			this.getCurrentMarkup().show(node);
			this.targetEl.parent().removeClass('hideSidebar');
		},

		createAttributesContainer : function() {
			// create container for stencils
			this.id = hyryx.utils.getID('Attributes');
			var frame = $('<div></div>').appendTo(this.targetEl);
			var $attributes = $('<div class="attributes" id="'+this.id+'"><h3>Attributes</h3></div>').appendTo(frame);
			$attributes.append('<div class="form">');

			$attributes.on('change', 'input', this.handleInputChange.bind(this));

			this.el = $attributes;

			return this;
		},

		handleInputChange : function(event) {
			// TODO rework
			if (!this.selection) { return; }

			var $field = $(event.target);
			var id = $field.attr('id').split('field-')[1];

			var field = this.currentMarkup.formElements[id];

			if (!field) { return; }

			var newValue = field.input.val();

			// only set if new value
			if (newValue.trim() && (field.isList || newValue !== field.getValue())) {
				var oldValue = field.getValue();

				// append if list field
				if (field.isList) {
					newValue = oldValue.concat(newValue);
				}

				var command = new hyryx.command.changeValueCommand(oldValue, newValue, field, this.selection, id);
				hyryx.command.do(command);
			}
		}
	});

	var Markup = function(data, targetEl) {
		this.targetEl = targetEl;
		this.data = data;
		this.type = data.type;

		this.el = this.render();
	};

	Markup.prototype = {
		render : function() {
			var $container = $('<div class="form"></div>');
			$container.appendTo(this.targetEl);

			var formElements = {};

			// create an input group for each attribute of the given op
			$.each(this.data, function(key, value) {
				var config = hyryx.utils.getConfigForProperty(this.type, key);

				if (config) {
					config.value = value;
					config.valueConfig = hyryx.utils.getConfigForValue(this.type, key);

					// TODO: ugly
					if (config.type === 'predicate') {
						config.listFieldRenderer = function(v) {
							return [v.type, v.f, v.value].join(' ');
						};
						config.placeholder = 'add predicate';
						config.complex = true;
					} else if (config.type === 'function') {
						config.listFieldRenderer = function(v) {
							return [v.type, v.field].join(' ');
						};
						config.complex = true;
						config.placeholder = 'add function';
					} else if (config.type === 'custom') {
						config.listFieldRenderer = function(v) {
							return 'custom function';
						};
						config.placeholder = 'Set custom function';
						config.complex = true;
					}
					formElements[key] = new Input(config, key);
				}
			}.bind(this));

			this.formElements = formElements;

			return $container;
		},

		hide : function() {
			this.el.hide();
		},

		show : function(data) {
			this.updateForm(data);
			this.el.show();
		},

		updateForm : function(obj) {

			this.el.html('');

			if (obj) {

				// update the form with the given data
				$.each(obj, function(key, value) {
					if (this.formElements[key]) {
						// get the input field
						var $input = this.formElements[key];
						// set the value and render it
						this.el.append($input.update(obj[key], obj));
					}
				}.bind(this));

			}
		}
	};

	var Input = function(config, id) {

		this.value = (config.isList ? [].concat(config.value||[]) : config.value);
		this.valueConfig = config.valueConfig;
		this.disabled = config.disabled;

		this.type = config.type || 'text';
		this.id = config.id || id;

		this.placeholder = config.placeholder || '';
		this.isList = config.isList || false;
		this.complex = config.complex || false;

		this.listFieldRenderer = config.listFieldRenderer || function(v) { return v; };

		// this.el = this.render();

		// the title element
		this.title = null;
		// the input field
		this.input = null;
		// the list element
		this.list = null;
		// the CodeMirror instance
		this.codeMirror = null;
	};

	Input.prototype = {
		getValue : function() {
			return this.value;
		},

		setValue : function(value) {
			this.value = value;
			this.initList();
		},

		addValue : function(value) {
			if (this.isList) {
				this.value.push(value);
			}
			this.initList();
		},

		removeValue : function(value) {
			if (this.isList) {
				var pos = this.value.indexOf(value);
				this.value.slice(pos, 1);
			}
		},

		/**
		 * If the attribute for which the input is created has a list, update the element with the current values
		 */
		initList : function() {
			if (this.isList) {
				this.input.val('');

				var list = this.list;
				list.html('');
				this.value.each(function(v, i) {
					list.append('<li class="entry-'+i+'">'+this.listFieldRenderer(v, i)+'</li>');
				}.bind(this));

				this.registerDeleteButton();
			}
		},

		/**
		 * Renders the input field
		 * @return {HTMLElement} The fieldset containing the title of the field, the field and a list representing all values
		 */
		render : function() {
			this.fieldset = $('<div class="form-group"></div>');

			this.title = $('<label for="field-' + this.id + '">' + this.id + '</label>').appendTo(this.fieldset);


			if (this.complex) {
				this.input = $('<div ' + (this.id?'id="field-'+this.id+'"':'') + ' class="form-control form-complex">'+this.placeholder+'</div>').appendTo(this.fieldset);

				var me = this;
				var applyClb = function(form) {

					var oldValue = me.getValue();
					var newValue = {};

					form.find('input').each(function(i, input) {
						var key = $(input).attr('id').split('complex-')[1];
						var value = $(input).val();
						newValue[key] = value;
					});

					// Since the code mirror is no simple input field, handle it differently
					if (me.codeMirror) {
						var wrapper = $(me.codeMirror.getWrapperElement()).parent();
						var key = wrapper.attr('id').split('complex-')[1];
						var value = me.codeMirror.getValue();
						newValue[key] = value;
					}

					// append if list field
					if (me.isList) {
						newValue = oldValue.concat(newValue);
					}

					var command = new hyryx.command.changeValueCommand(oldValue, newValue, me, me.selection, me.id);
					hyryx.command.do(command);
				};

				// create a form for the attribute
				this.createForm(applyClb);
			} else {
				// add input field for simple fields
				this.input = $('<input type="'+this.type+'" ' + (this.id?'id="field-'+this.id+'"':'') + ' placeholder="'+this.placeholder+'" class="form-control"></input>').appendTo(this.fieldset);

			}

			// if the attribute is a list element, create a html list for it
			if (this.isList) {
				this.list = $('<ul class="valuelist"></ul>').appendTo(this.fieldset);

				this.initList();

			}
			// set a start value
			else if (!this.complex && this.value) {
				this.input.val(this.value);
			}

			// if type boolean
			if (this.type === 'boolean') {
				this.input.attr('type', 'checkbox');
				this.input.addClass('checkbox');
				if (this.value) {
					this.input.attr('checked', 'checked');
				}
			}

			return this.fieldset;
		},

		update : function(value, selection) {

			this.value = (this.isList ? [].concat(value||[]) : value);
			this.selection = selection;
			return this.render();
		},

		createForm : function(applyClb) {

			var input = this.input;
			var hasCustomAttribute = false;
			var customValue;

			var form = ['<div class="complex-add-form form-horizontal">'];

			$.each(this.valueConfig, function(k, v) {
				// CodeMirror Javascript editor
				if (v.type === 'custom') {
					hasCustomAttribute = true;
					form.push('<span>'+k+'</span><div class="form-control codemirror" id="complex-'+k+'"></div>');
				}
				// regular input
				else {
					form.push('<span>'+k+'</span><input type="'+v.type+'" class="form-control" id="complex-'+k+'" placeholder="'+v.value+'" type="text" />');
				}

			}.bind(this));
			form.push('</div>');

			form = form.join('');

			new hyryx.screen.popover({
				title : this.placeholder,
				content : form,
				target : input,
				applyClb : applyClb,
				showClb : function(form) {
					if (hasCustomAttribute) {
						var renderTarget = form.find('.codemirror');

						var id = renderTarget.attr('id').split('complex-')[1];

						// parse the initial value, which might be an object or the plain value
						var initialValue = this.getValue()||"";
						initialValue = initialValue[id] || initialValue;

						this.codeMirror = CodeMirror(renderTarget[0], {
							value : initialValue,
							mode : {
								name : 'javascript'
							},
							lint : true,
							gutters : ['CodeMirror-lint-markers'],
							// theme : 'custom',
							lineNumbers : true
						});

					}
				}.bind(this)
			});
		},

		registerDeleteButton : function() {

			var me = this;
			var list = this.list;

			function clickClb() {

				var index = +$(this.parentNode).attr('class').split('entry-')[1];

				var oldValue = me.getValue();
				var newValue = oldValue.findAll(function(entry, i) {
					return i !== index;
				});

				$(this).parent().detach();

				var command = new hyryx.command.changeValueCommand(oldValue, newValue, me, me.selection, me.id);
				hyryx.command.do(command);
			}

			function showButtonsOnEntry(li) {
				if (!list.delButton) {
					list.delButton = $('<div class="del">del</div>');
				}
				list.delButton.appendTo(li);
				list.delButton.show();

			}

			function hideButtons() {
				if (list.delButton) {
					list.delButton.hide();
				}
			}

			list.on('mouseover', 'li', function(e) {
				showButtonsOnEntry(e.target, list.children().index(e.target));
			}).on('mouseout', 'li', function() {
				hideButtons(list);
			}).on('click', '.del', clickClb);
		}
	};
})();
