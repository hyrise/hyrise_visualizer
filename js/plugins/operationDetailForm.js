var FieldRenderer = {

	getField : function(config, id) {
		config._id = id;
		// simple string property
		if ('string' === typeof config) {
			return this.renderString({
				value: config
			});
		}
		var designatedFn = 'render'+config.type.capitalize()+(config.isList?'List':'');
		if (this[designatedFn]) {
			return this[designatedFn](config);
		}
		console.log('No editor for '+config.type+' found, expected '+designatedFn);
		return this.renderString(config);
	},

	renderString : function(config) {
		var input = this.getBasicInput(config.value, config.defaultValue || '', config._id);
		return input;
	},

	renderNumber : function(config) {
		var input = this.getBasicInput(config.value, config.defaultValue || '');
		input.attr('type', 'number');

		return input;
	},

	renderTable : function(config) {
		var input = this.getBasicInput(config.value, 'Select table...', config._id);

		this.addAutocomplete(config, input, tables, function tableSelectClb(event, ui) {
			var selTable = tables.find(function(table) {return table.name === ui.item.value});
			if (selTable) {
				columns = selTable.columns.flatten().compact();
			}
			var tableName = ui.item.value.split('/').last().split('.tbl').first();
			jQuery('#field-table').val(tableName).trigger('change');

			jQuery(this).val(ui.item.value).trigger('change');

			// data.tables.pluck('columns').flatten().compact();
		});
		return input;
	},

	renderBoolean : function(config) {
		var input = this.getBasicInput(config.value, '');
		input.attr('type', 'checkbox');
		input.addClass('checkbox');
		if (config.value) {
			input.attr('checked', 'checked');
		}

		return input;
	},

	renderColumn : function(config) {
		var input = this.getBasicInput(config.value, 'Select column...');

		this.addAutocomplete(config, input, columns);
		return input; 
	},

	renderFunctionList : function(config) {
		// the column field
		var input = this.getBasicInput('', 'Select field...');

		// the type field
		var list = expressions.map(function(ex) {
			return '<option value="'+ex.value+'">'+ex.name+'</option>';
		}).join('');
		var typefield = jQuery('<select class="narrow" id=types-'+config._id+'>'+list+'</select>');

		var addButton = jQuery('<button>Add</button>');

		addButton.on('click', function() {
			var val = {
				field : input.val(),
				type: +typefield.val()
			};

			ct.value.push(val);
			ct.addRow(val);

			input.val('');
		});

		var ct = jQuery('<ul class="valuelist"></ul>');
		
		config.value = config.value.findAll(function(val) {
			return columns.find(function(col) {
				return col.name === val.field;
			});
		});

		ct.value = config.value||[];

		config.getValue = function() {
			return ct.value.map(function(val) {
				var index = columns.pluck('name').indexOf(val.field);
				return {
					field : index === -1 ? null : index,
					type: expressions.pluck('value').include(val.type) ? val.type : null
				};
			});
		}

		ct.init = function() {
			this.value.each(function(v){
				ct.addRow(v);
			})
		}

		ct.addRow = function(entry) {
			var typename = (expressions.find(function(ex) {return ex.value === entry.type;})||{}).name || 'unknown';
			ct.append('<li>'+entry.field+', '+typename+'</li>');
		};

		// Add listeners to the column field
		this.addAutocomplete(config, input, columns, function columnListSelectClb(event, ui) {
			// do nothing, wait for button press
		});

		this.registerDeleteButton(ct);

		ct.init();

		var spacingContainer = jQuery('<div class="spacing-container"></div>');
		spacingContainer.append([input,typefield,addButton,ct]);

		return [spacingContainer];

	},

	renderColumnList : function(config) {
		var input = this.getBasicInput('', 'Select column...');

		var ct = jQuery('<ul class="valuelist"></ul>');
		
		config.value = config.value.findAll(function(val) {
			return columns.find(function(col) {
				return col.name === val;
			});
		});

		ct.value = config.value||[];

		config.getValue = function() {
			return ct.value.map(function(val) {
				return columns.pluck('name').indexOf(val);
			}).without(-1);
		}

		ct.init = function() {
			this.value.each(function(v){
				ct.addRow(v);
			})
		}

		ct.addRow = function(entry) {
			ct.append('<li>'+entry+'</li>');
		};

		this.registerDeleteButton(ct);

		this.addAutocomplete(config, input, columns, function columnListSelectClb(event, ui) {
			jQuery(this).val('');
			ct.value.push(ui.item.value);
			ct.addRow(ui.item.value);
		});

		ct.init();

		return [input, ct];
	},

	getBasicInput : function(value, placeholder, id) {
		var input = jQuery('<input type="text" ' + (id?'id="field-'+id+'"':'') + ' placeholder="'+placeholder+'"></input>');

		if (value) {
			input.val(value);
		}

		return input;

	},

	addAutocomplete : function(config, input, data, selectClb) {

		input.one('click', function() {
			input.autocomplete({
				source: function(request, response) {
					response(data.map(function(c) {
						if (!config.value.include(c.name) && c.name.toLowerCase().include(request.term.toLowerCase())) {
							return {
								value : c.name,
								label : c.name//+'<span>'+c.type+'</span>'
							}
						}
					}).compact());
				},
				focus: function() {
					return false;
				},
				select: (selectClb instanceof Function && selectClb || function(event, ui) {
					jQuery(this).val(ui.item.value);
					jQuery(this).trigger('change');
					// $(this).data('gtin', ui.item.value);
					// return false;
				})
			});
		})
	},

	registerDeleteButton : function(ct) {

		function showButtonsOnEntry(li) {
			if (!ct.delButton) {
				ct.delButton = jQuery('<div class="del">del</div>');
				ct.delButton.on('click', function() {
					ct.value.splice(ct.value.indexOf(this.previousSibling.textContent.split(', ').first()), 1);
					jQuery(this).parent().detach();
				})
			}
			ct.delButton.appendTo(li);
			ct.delButton.show();
		};

		function hideButtons() {
			if (ct.delButton) {
				ct.delButton.hide();
			}
		};
		
		ct.on('mouseover', 'li', function(e) {
			showButtonsOnEntry(e.target);
		}).on('mouseout', 'li', function() {
			hideButtons(ct);
		});
	}
};

function updateForm(obj) {

	jQuery('#form-container').html('');

	if (obj && obj.data) {
		
		var $fieldset = jQuery('<fieldset style="text-align:right;"></fieldset>');
		var $legend = jQuery('<legend><b>'+'Attributes'+'</b></legend>');
		$fieldset.append($legend);

		$H(obj.data).each(function(pair) {

			var disabled = (pair.key === 'type');
			
			var $input = FieldRenderer.getField(pair.value, pair.key);
			($input instanceof Array && $input[0] || $input)
				.data('field', pair.key)
				.data('operation', obj.id)
				.attr('disabled', disabled)
				;

			var $row = jQuery('<fieldset></fieldset>');
			$row.append([pair.key, $input].flatten());

			$fieldset.append($row);

		});

		jQuery('#form-container').append($fieldset);
	}
}

function registerFormForCanvas(canvasState) {
	jQuery('#form-container').on('change', 'input', function() {
		if (!canvasState.selection) { return; }

		var $field = jQuery(this);

		var operation = $field.data('operation');
		var field = $field.data('field');
		var isList = canvasState.selection.data[field].isList;

		if (!isList && canvasState.selection.id === operation) {
			var props = canvasState.selection.data[field];

			if ($field.attr('type') === 'number') {
				props.value = +$field.val();
			} else if ($field.attr('type') === 'checkbox') {
				props.value = $field.is(':checked');
			} else {
				props.value = $field.val();
			}
		}
	});
}
