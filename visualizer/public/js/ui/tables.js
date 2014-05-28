(function() {
	hyryx.explorer.Attributes = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	}

	hyryx.explorer.Attributes.prototype = extend(hyryx.screen.AbstractUIPlugin, {
		render : function() {
			this.id = hyryx.utils.getID('Tables');
			return this.createAttributesMarkup();
		},

		init : function() {
			this.load();
		},

		// Add tables area and a form to add new tables, TODO refactor form
		createAttributesMarkup : function() {
			var form = [
				'<div class="tables-add-form form-horizontal">',
					'<input class="form-control" id="table" placeholder="Table name" type="text" />',
					'<input class="form-control" id="file" placeholder="Path to table" type="text" />',
				'</div>'].join('');
			
			var $tables = $('<div class="col-md-2 tables" id="'+this.id+'"><h3>Tables</h3></div>').appendTo(this.targetEl);
			$tables.append('<a href="#" class="" id="show-form-btn">+</a>');
			
			new hyryx.screen.popover({
				title : "Add table",
				content : form,
				container: 'body',
				placement : 'right',
				target : $('#show-form-btn'),
				applyClb : hyryx.explorer.loadTable
			})

			// The list for all tables
			$tables.append('<div class="panel-group list">');
			
			return $tables;
		},

		getAttributeButtonMarkup : function(config) {
			return ['<a class="list-group-item" data-column="'+config.name+'" data-table="'+config.key+'" data-aggregation="none" data-type="'+config.type+'" data-id="'+config.index+'" data-chartType="line">',
						'<button type="button" class="close removeColumn"></button>',
						config.name,
						'<span class="btn btn-default btn-sm popoverToggle" data-type="',config.type,'" data-min="',config.min,'" data-max="',config.max,'"><i class="icon-cog"></i></span>',
					'</a>'].join('');
		},

		load : function() {
			var me = this;

			$.ajax(_BASE_URL + 'tables', {
				success : function(r) {
					$('.tables .list').html('');

					hyryx.tables = r;

					$.each(r, function(key, value) {
						var panel = ['<div class="panel panel-default">',
										'<div class="panel-heading">',
											'<h4 class="panel-title"><a class="accordion-toggle" data-toggle="collapse" data-parent=".tables .list" href="#collapse-',key,'">',
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

						$(panel.join('')).appendTo('.tables .list');
					});

					$('.tables .list .collapse.panel-collapse:first').addClass('in');

					//initilaize the options popover
					

					//make tables draggable and clone them
					$(".tables .list .list-group-item").draggable({ 
						helper: 'clone',
						appendTo : $('#visualizer'),
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
						}
					});
				}
			});
		},

		loadTable : function() {
			var me = this;

			var $form = $('.tables-add-form');
			var table = $form.find('#table').val();
			var file = $form.find('#file').val();

			if (table && file) {
				$.ajax({
					url: _BASE_URL + 'loadTable',
					type: "POST",
					data: {
						table: table,
						file: file
					},
					dataType: "json",
					complete: function() {
						// update list of tables
						me.load();
						// close popover
						// $('.tables #show-form-btn').click();
					}
				});
			}
		}
	});
})();