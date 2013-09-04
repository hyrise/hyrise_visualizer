(function() {
	hyryx.explorer.Attributes = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	}

	hyryx.explorer.Attributes.prototype = extend(hyryx.screen.AbstractUIPlugin, {
		render : function() {
			this.id = hyryx.utils.getID('Attributes');
			return this.createAttributesMarkup();
		},

		init : function() {
			this.load();
		},

		// Add attributes area and a form to add new tables, TODO refactor form
		createAttributesMarkup : function() {
			var form = [
				'<div class="attributes-add-form form-horizontal">',
					'<input class="form-control" id="table" placeholder="Table name" type="text" />',
					'<input class="form-control" id="file" placeholder="Path to table" type="text" />',
					'<a class="btn col-md-6 btn-plain" href="javascript:$(\'#show-form-btn\').click()">cancel</a>',
					'<a class="btn col-md-6" href="javascript:hyryx.explorer.loadTable()">Load table</a>',
				'</div>'].join('');
			
			var $attributes = $('<div class="col-md-2 attributes" id="'+this.id+'"><h3>Attributes</h3></div>').appendTo(this.targetEl);
			$attributes.append('<a href="#" class="" id="show-form-btn">+</a>');
			var p = $('#show-form-btn').popover({
				title: 'Add table',
				html : true,
				content : form,
				placement: 'right',
				trigger : 'manual'
			}).click(function() {
				var $this = $(this);
				if ($this.toggleClass('active').hasClass('active')) {
					$this.popover('show');

					var form = $this.next('.popover');
					// add close button
					form.find('.popover-title').append('<span class="close">x</span>').find('.close').click(function() {
						$this.click();
					});
				} else {
					$this.popover('hide');
				}
			});
			// The list for all attributes
			$attributes.append('<div class="panel-group list">');
			// $form.appendTo($attributes);

			return $attributes;
		},

		getAttributeButtonSettings : function(type, min, max) {

			var $form = $('<form class="form">');

			$form.append('<div class="control-group aggregationControls">'+
						'<label class="control-label" for="aggregationSelect">Aggregation</label>'+
						
						'<select class="selectpicker aggrSelect show-tick">' +
							('none count average sum'.split(' ')).map(function(type) {
								return '<option value="'+type+'">'+type.capitalize()+'</option>';
							}).join('')+
						'</select>'+					
					'</div>');
					
			$form.append('<div class="control-group typeControls">'+
						'<label class="control-label" for="chartTypeSelect">Type</label>'+
						'<select class="selectpicker typeSelect show-tick">' +
							('line spline bar column area areaspline scatter pie'.split(' ')).map(function(type) {
								return '<option value="'+type+'">'+type.capitalize()+'</option>';
							}).join('')+
						'</select>'+
					'</div>');
					
			if (Number(type) < 2) {
				$form.append('<div class="control-group rangeControls">'+
							'<label class="control-label" for="valueRangeSlider">Value range:</label>'+
							// '<div class="form-group">'+
								'<div class="valueRangeSlider col-md-offset-1 col-md-10"></div>'+
								'<div class="col-md-6 text-left">'+min+'</div>'+
								'<div class="col-md-6 text-right">'+max+'</div>'+
							// '</div>'+
						'</div>');
			} 
			
			// render select picker
			$form.find('.selectpicker').selectpicker();

			// registerFormControls($form, min, max);

			return $form;
		},

		getAttributeButtonMarkup : function(config) {
			return ['<a class="list-group-item" data-column="'+config.name+'" data-table="'+config.key+'" data-aggregation="none" data-type="'+config.type+'" data-id="'+config.index+'" data-chartType="line">',
						'<button type="button" class="close removeColumn">×</button>',
						config.name,
						'<span class="btn btn-default btn-sm popoverToggle" data-type="',config.type,'" data-min="',config.min,'" data-max="',config.max,'"><i class="icon-cog"></i></span>',
					'</a>'].join('');
		},

		registerFormControls : function(axis, form, min, max) {

			var $li = axis.find('.list-group-item');

			// add listener for aggregation change
			form.find('.aggrSelect').on("change", function() {
				$li.attr('data-aggregation', $(this).val());
				hyryx.explorer.dispatch('graph.reloadData');
			});
			// add listener for diagram type change
			form.find('.typeSelect').on('change', function() {
				$li.attr('data-chartType',$(this).val());
				hyryx.explorer.dispatch({
					type	: 'graph.changeChartType',
					options	: {
						columnId	: $li.data('id'),
						chartType	: $(this).val(),
						axis		: axis.attr('id').substring(0,1)
					}
				});
			});

			// render slider
			var lower = $li.attr('data-lower-value'); lower = (typeof lower === 'undefined' ? min : lower);
			var higher = $li.attr('data-higher-value'); higher = (typeof higher === 'undefined' ? max : higher);
			form.find('.valueRangeSlider').slider({
				min		: min,
				max		: max,
				range	: true,
				values	: [lower, higher],
				slide : function(e, ui) {
					$li.attr('data-lower-value', ui.values[0]);
					$li.attr('data-higher-value', ui.values[1]);
					hyryx.explorer.dispatch('graph.reloadData');
				}
			});

			// add close button
			form.parents('.popover').find('.popover-title').append('<span class="close">x</span>').find('.close').click(function() {
				form.parents('.axis').find('.popoverToggle').click();
			});
		},

		load : function() {
			var me = this;

			jQuery.ajax('http://192.168.200.10:3000/tables', {
				success : function(r) {
					$('.attributes .list').html('');

					$.each(r, function(key, value) {
						var panel = ['<div class="panel panel-default">',
										'<div class="panel-heading">',
											'<h4 class="panel-title"><a class="accordion-toggle" data-toggle="collapse" data-parent=".attributes .list" href="#collapse-',key,'">',
											key,
											'</h4>',
										'</div>',
										'<div id="collapse-',key,'" class="panel-collapse collapse list-group">',
											''];

						value.each(function(column, i) {
							column.index = i;
							column.key = key;
							var $buttonMarkup = me.getAttributeButtonMarkup(column);

							panel.push($buttonMarkup);
						});

						panel.push('</div></div>');

						$(panel.join('')).appendTo('.attributes .list');
					});

					$('.attributes .list .collapse.panel-collapse:first').addClass('in');

					//initilaize the options popover
					

					//make attributes draggable and clone them
					jQuery(".attributes .list .list-group-item").draggable({ 
						helper: 'clone',
						start: function(e, ui) {
							$('.axis').each(function() {
								if (!$(this).find('.list-group-item')[0]) {
									$(this).find('.drop-hint:not(.zone)').hide();
									$(this).find('.drop-hint.zone').show();
								}
							});
						},
						stop: function(e, ui) {

							$('.axis').each(function() {
								if ($(this).find('.list-group-item')[0]) {
									$(this).find('.drop-hint').hide();
									$(this).find('.list-group-item').show();
								} else {
									$(this).find('.drop-hint:not(.zone)').show();
									$(this).find('.drop-hint.zone').hide();
								}
							});

							// if dropped onto an axis, hide the axis label and display only the attribute
							var toggle = $(e.toElement).find('.popoverToggle');
							toggle.popover({
								html: true,
								container: $(e.toElement),
								placement: 'right',
								title: 'Options',
								trigger: 'manual',
								content: me.getAttributeButtonSettings(toggle.data('type'), toggle.data('min'), toggle.data('max'))
							}).click(function() {
								var $this = $(this);
								if ($this.toggleClass('active').hasClass('active')) {
									$this.popover('show');
									me.registerFormControls($(e.toElement), $(e.toElement).find('.popover form'), toggle.data('min'), toggle.data('max'));
								} else {
									$this.popover('hide');
								}
							});
						}
					});
				}
			});
		},

		loadTable : function() {
			var me = this;

			var $form = $('.attributes-add-form');
			var table = $form.find('#table').val();
			var file = $form.find('#file').val();

			if (table && file) {
				jQuery.ajax({
					url: 'http://192.168.200.10:3000/loadTable',
					type: "POST",
					data: {
						table: table,
						file: file
					},
					dataType: "json",
					complete: function(res) {
						// update list of attributes
						me.load();
						// close popover
						$('.attributes #show-form-btn').click();
					}
				});
			}
		}
	});
})();