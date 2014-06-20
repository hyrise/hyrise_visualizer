(function() {
	hyryx.explorer.Graph = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	};

	var chart;
	var loadedSeries = [];

	// graph.changeChartType
	// graph.collectSeries
	// graph.collectFilters
	// graph.reloadData
	// graph.removeSeriesWithColumn

	hyryx.explorer.Graph.prototype = extend(hyryx.screen.AbstractUIPlugin, {
		render : function() {
			this.id = hyryx.utils.getID('Graph');
			// Add graph options
			var $graphOptions = this.targetEl.append('<div class="area_frame no_padding"><div id="'+this.id+'" class="graph">').find('.graph');

			this.addDescription($graphOptions);
			// createGlobalFilterMarkup($graphOptions);
			// createGraphTypeFilterMarkup($graphOptions);
			// createGraphTitleMarkup($graphOptions);

			// var $graphContainer = $graphOptions.append('<div class="row"><div class="col-md-10 container" id="graph-container">').find('.container');

			this.createGraphMarkup($graphOptions);

			// var $dataContainer = $fluidLayout.append('<div class="row"><div class="col-md-12 container" id="data-container">').find('.row:last');
			// createDataContainerMarkup($dataContainer);
			return $graphOptions;
		},

		init : function() {
			this.createHighChart();
			this.initializeDragDrop();
			this.initializeAxisRemoval();
			this.initializeAxisTypeSelect();

			this.initializeGraphTitle();
			this.initializeGraphTypeSelect();
		},

		handleEvent : function(event) {
			if (helpers[event.type] instanceof Function) {
				helpers[event.type](event.options);
			}
		},

		addDescription : function(parent) {
			var $desc = $('<div class="description">');
			// $desc.text('Create a new graph by dragging columns onto the axis. Click here to add ');

			$desc.appendTo(parent);
		},

		createGraphMarkup : function(parent) {

			// y-axis
			this.createAxisMarkup(parent, {
				configID	: 'ySettings',
				title		: 'y-Axis',
				id			: 'yAxis'
			});

			// Add graph container
			parent.append('<div id="graph"></div>');

			// opposite y-axis
			this.createAxisMarkup(parent, {
				configID	: 'oppositeYSettings',
				title		: 'Opposite y-Axis',
				id			: 'oAxis'
			});

			// x-axis
			this.createAxisMarkup(parent, {
				configID	: 'xSettings',
				title		: 'x-Axis',
				id			: 'xAxis'
			});
		},

		// Create an axis based on the given config object and append it to the given parent object
		createAxisMarkup : function(parent, config) {
			var xAxis = config.configID[0]==='x';
			var $axis = jQuery('<div class="axis axisDroppableContainer '+config.configID+(xAxis ? ' axisX':' axisY')+'" id="'+config.configID+'"></div>');
			var $settings = jQuery('<div class="axisSettings" id="'+config.id+'">').appendTo($axis);

			$axis.append('<p class="drop-hint">'+(xAxis ? 'x-axis' : 'y-axis')+'</p>');
			$axis.append('<p class="drop-hint zone">Drop attribute here</p>');

			// createDropContainerMarkup($settings, config);
			// createAxisTitleMarkup($settings, config);
			this.createAxisTypeSelectMarkup($settings, config);

			$axis.appendTo(parent);

		},

		// Create type selection
		createAxisTypeSelectMarkup : function(parent, config) {
			// var $div = jQuery('<div class="control-group"></div>');

			var oppositeYAxis = config.configID==='oppositeYSettings';
			var $select = jQuery('<select class="selectpicker axisTypeSelect ' + (oppositeYAxis ? 'pull-right':'') + '"></select>').appendTo(parent);
			// Add options
			('linear logarithmic datetime categories'.split(' ')).each(function(type) {
				jQuery('<option value="'+type+'">'+type.capitalize()+'</option>').appendTo($select);
			})

			// $div.appendTo(parent);
		},

		// Add drop area for a global filter attribute
		createGlobalFilterMarkup : function(parent) {
			var $div = jQuery('<div class="control-group"></div>');
			jQuery('<label class="control-label" for="filterDroppableContainer">Drop an attribute to use as global filter:</label>').appendTo($div);
			jQuery('<div id="filterContainer" class="filterDroppableContainer"></div>').appendTo($div);
			$div.appendTo(parent);
		},

		// Add a selection for different graph types
		createGraphTypeFilterMarkup : function(parent) {
			var $div = jQuery('<div class="control-group"></div>');

			jQuery('<label class="control-label" for="graphTypeButton"> Graph Type: </label>').appendTo($div);
			var $select = jQuery('<select class="selectpicker graphTypeButton show-tick"></select>').appendTo($div);
			// Add options
			('line bar spline area areaspline scatter pie'.split(' ')).each(function(type) {
				jQuery('<option value="'+type+'">'+type.capitalize()+'</option>').appendTo($select);
			})
			$div.appendTo(parent);
		},

		// Add an input field for a name
		createGraphTitleMarkup : function(parent) {
			var $div = jQuery('<div class="input-group navbar-form navbar-right"></div>');
			jQuery('<span class="glyphicon glyphicon-pencil"></span>').appendTo($div);
			jQuery('<input type="text" id="graphTitle" class="form-control" placeholder="Graph Title"/>').appendTo($div);
			$div.appendTo('#title .navbar-inner');
		},

		// Create drop container for an attribute
		createDropContainerMarkup : function(parent, config) {
			var $div = jQuery('<div class="control-group"></div>');
			jQuery('<label class="control-label" for="axisDroppableContainer">Drop an attribute here:</label>').appendTo($div);
			jQuery('<div class="axisDroppableContainer '+config.id+'"></div>').appendTo($div);
			$div.appendTo(parent);
		},

		// Create a name field
		createAxisTitleMarkup : function(parent, config) {
			var $div = jQuery('<div class="control-group"></div>');
			jQuery('<label class="control-label" for="axisTitle">Axis Title:</label>').appendTo($div);
			jQuery('<input type="text" class="axisTitle" placeholder="Axis Title"/>').appendTo($div);
			$div.appendTo(parent);
		},

		createHighChart : function() {
			// create initial chart
			chart = new Highcharts.Chart({
				chart: {
					renderTo: 'graph'
				},
				title: {
					text: 'Your Graph'
				},
				xAxis: {
					id : 'xaxis',
					title: {
						text: ''//x axis'
					}
				},
				yAxis: [{
					opposite: false,
					id : 'yaxis',
					title: {
						text: ''//y axis'
					}
				}, {
					opposite: true,
					id : 'yaxis2',
					title: {
						text: ''//y axis'
					},
					showEmpty: false
				}]
			});

			return chart;
		},

		initializeDragDrop : function() {
			var me = this;
			//define dropzone for the attributes
			$(".axisDroppableContainer").droppable({
				over: function(event, ui){
					$(this).find('.drop-hint.zone').addClass("over");
				},
				out: function(event, ui){
					$(this).find('.drop-hint.zone').removeClass("over");
				},
				drop: function(event, ui) {
					// remove existing axis binding
					$(this).find('.list-group-item').remove();
					// add new axis binding
					$(this).append($(ui.draggable).clone());

					$(this).find('.axisTypeSelect button').tipsy({
						gravity : 'w',
						title : function() { return 'Axis type'; }
					});

					$(this).find('.popoverToggle').tipsy({
						gravity: 'w',
						offset:0,
						// fade:true,
						title: function() { return 'Aggregations and filters'; }
					});

					$(this).find('.close').tipsy({
						gravity : 'w',
						title : function() { return 'Remove axis'; }
					});

					var toggle = $(this).find('.popoverToggle'),
						min = toggle.data('min'),
						max = toggle.data('max');


					new hyryx.screen.popover({
						container: $(this),
						placement: 'right',
						title: 'Options',
						target : toggle,
						enableButtons : false,
						content: '', //me.createForm(toggle.data('type'), min, max),

						showClb : function(form) {
							me.createForm($(this), form.contents('.popover-content'), toggle);
						}.bind(this)
					});

					helpers.reloadData();
					$(this).find('.drop-hint.zone').removeClass("over");
				}
			});

			//define filter dropzone
			jQuery('.filterDroppableContainer').droppable({
				over: function(event, ui) {
					jQuery(this).addClass("hoverDroppable");
				},
				out: function(event, ui) {
					jQuery(this).removeClass("hoverDroppable");
				},
				drop: function(event, ui) {
					if (jQuery(this).children('[data-id="' + jQuery(ui.draggable).data("id") + '"]').length <= 0) {
						jQuery(this).append(jQuery(ui.draggable).clone());
						helpers.reloadData();
					}
					jQuery(this).removeClass("hoverDroppable");
				}
			});
		},

		createForm : function(axis, target, toggle) {

			var $form = $('<form class="form">'),
				type = toggle.data('type'),
				min = toggle.data('min'),
				max = toggle.data('max');

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

			// initialize select picker plugin
			// $form.find('.selectpicker').selectpicker();

			target.html($form);

			this.registerFormControls(axis, $form, min, max);

		},

		registerFormControls : function(axis, form, min, max) {

			var $li = axis.find('.list-group-item');

			// add listener for aggregation change
			var aggrSelect = form.find('.aggrSelect').selectpicker();
			aggrSelect.selectpicker('val', $li.attr('data-aggregation'));

			aggrSelect.on("change", function() {
				$li.attr('data-aggregation', $(this).val());
				helpers.reloadData();
			});

			// add listener for diagram type change
			var typeSelect = form.find('.typeSelect').selectpicker();
			typeSelect.selectpicker('val', $li.attr('data-chartType'));

			typeSelect.on('change', function() {
				$li.attr('data-chartType',$(this).val());
				helpers.changeChartType({
					columnId	: $li.data('id'),
					chartType	: $(this).val(),
					axis		: axis.attr('id').substring(0,1)
				});
			});

			// render slider
			var lower = $li.attr('data-lower-value');
			lower = (typeof lower === 'undefined' ? min : lower);

			var higher = $li.attr('data-higher-value');
			higher = (typeof higher === 'undefined' ? max : higher);

			form.find('.valueRangeSlider').slider({
				min		: min,
				max		: max,
				range	: true,
				values	: [lower, higher],
				slide : function(e, ui) {
					$li.attr('data-lower-value', ui.values[0]);
					$li.attr('data-higher-value', ui.values[1]);
					helpers.reloadData();
				}
			});
		},

		initializeAxisRemoval : function() {
			//remove a column when x is clicked from the axis
			$(document).on("click", ".axisDroppableContainer .removeColumn", function() {
				var $axis = $(this).parents('.axis');
				helpers.removeSeriesWithColumn({
					columnId    : $(this).parent().data('id'),
					axis        : $axis.attr('id').substring(0,1)
				});
				$(this).parent().remove();
				$axis.find('.drop-hint:not(.zone)').show();
			});

			//remove a filter when x is clicked and reload
			$(document).on("click", ".filterDroppableContainer .removeColumn", function() {
				$(this).parent().remove();
				helpers.reloadData();
			});

			// mode selest --> soon deprecated (after aggregation select is used)
			$(document).on("click", ".modeSelect", function() {
				$(this).parents('.column').attr('data-mode',$(this).attr('mode'));
				$(this).parent().parent().siblings('.actionSelect').html($(this).text()+'<span class="caret">');
				helpers.reloadData();
			});
		},

		initializeAxisTypeSelect : function() {
			//change the axis types
			$(".axisTypeSelect").change( function() {
				switch($(this).parents('.axisSettings').attr('id')) {
					case 'yAxis':
						chart.yAxis[0].update({type: $(this).val()});
						break;
					case 'oAxis':
						chart.yAxis[1].update({type: $(this).val()});
						break;
					case 'xAxis':
						chart.xAxis[0].update({type: $(this).val()});
						break;
				}
			});


		},

		initializeGraphTitle : function() {
			//change graph title
			$('#graphTitle').bind('input', function() {
				chart.setTitle({text: $(this).val()});
			});
			//initialize graph title
			$('#graphTitle').val(chart.title.text);
		},

		initializeGraphTypeSelect : function() {
			//buttons for the graph type selection
			$(".graphTypeButton").change( function() {
				if (chart.series) {
					for(var i = 0; i < chart.series.length; i++) {
						chart.series[i].update({type: $(this).val()});
					}
				}
				$('.column').attr('data-chartType', $(this).val());
				$('.graphTypeButton').removeClass('active');
				$(this).addClass('active');
			});
		}
	});

	var hasPopover = [];

	var helpers = {
		changeChartType : function(options) {
			for (var i = 0; i < loadedSeries.length; i++) {
				if (loadedSeries[i]['yColumn']['id'] == options.columnId && loadedSeries[i]['axis'] == options.axis) {
					chart.series[i].update({type: options.chartType});
				}
			}
		},

		removeSeriesWithColumn : function(options) {
			if (options.axis == 'x') {
				while (chart.series.length) {
					chart.series[0].remove();
				}
				loadedSeries = [];
			} else {
				var indicesToRemove = [];
				for (var i = 0; i < loadedSeries.length; i++) {
					if (loadedSeries[i]['yColumn']['id'] == options.columnId && loadedSeries[i]['axis'] == options.axis) {
						indicesToRemove.push(i);
					}
				}
				for (var i = 0; i < indicesToRemove.length; i++) {
					chart.series[indicesToRemove[i]].remove();
					loadedSeries.splice(indicesToRemove[i], 1);
				}
			}
		},

		collectSeries : function() {
			var newSeries = [];
			var seriesCount = 0;

			var collectFunction = function(){

				var data = {
					aggregation: $(this).attr("data-aggregation"), // to avoid $ caching
					column: $(this).data("column"),
					type: $(this).data("type"),
					table: $(this).data("table"),
					id: $(this).data("id"),
					min: $(this).attr("data-lower-value"),
					max: $(this).attr("data-higher-value")
				};

				series = {
					'yColumn': data,
					'id': seriesCount,
					'axis': $(this).parents('.axis').attr('id').substring(0,1)
				};
				newSeries.push(series);
				seriesCount++;
			};

			$('.ySettings .list-group-item').each(collectFunction);
			$('.oppositeYSettings .list-group-item').each(collectFunction);

			return newSeries;
		},

		collectFilters : function() {
			var filters = [];

			jQuery('#ySettings .list-group-item, #oppositeYSettings .list-group-item').each( function() {
				var data = {
					column: jQuery(this).data("column"),
					table: jQuery(this).data("table"),
					type: jQuery(this).data("type"),
					id: jQuery(this).data("id"),
					min: jQuery(this).attr("data-lower-value"),
					max: jQuery(this).attr("data-higher-value")
				}

				filters.push(data);
			});

			return filters;
		},

		registerAxisPopover : function(target) {

			if (hasPopover.indexOf(target) !== -1) {
				return;
			}
			hasPopover.push(target);

			target = $(target);

			var form = [
				'<div id="set-'+(/*axis.userOptions.id||*/'axis')+'-name" class="form-horizontal">',
					'<input class="form-control" placeholder="Title" type="text" value="'+/*axis.axisTitle.text+*/'" />',
				'</div>'].join('');

			new hyryx.screen.popover({
				title : 'Rename axis',
				content : form,
				placement : 'bottom',
				container : '#page-explorer',
				target : target,
				modal : true,
				applyClb : function(form, target) {
					var axis = chart.axes.filter(function(ax) {
						return ax.axisTitle && ax.axisTitle.element === target[0];
					});
					if (axis[0]) {
						axis[0].setTitle({ text : form.find('input').val() });
					}
				}
			});
		},

		reloadData : function() {
			if ((jQuery('.ySettings .list-group-item').length > 0 || jQuery('.oppositeYSettings .list-group-item').length > 0) && jQuery('.xSettings .list-group-item').length > 0) {

				var newSeries = this.collectSeries();
				var xAxisColumn = jQuery('.xSettings .list-group-item');
				var xAxis = {
					"mode": xAxisColumn.data("mode"),
					"column": xAxisColumn.data("column"),
					"type": xAxisColumn.data("type"),
					"table": xAxisColumn.data("table")
				};
				var filters = this.collectFilters();

				var content = [];
				var queries = [];
				$.each(newSeries, function (index, serie) {
					var finalResult = {};
					var column = serie.yColumn;

					var query = new hyryx.Database.Query;

					this.composeAggregationQuery(xAxis, column, query,
						this.composeProjectionQuery(xAxis, column, query,
							this.composeLocalFilterQuery(column, query,
								this.composeFilterQuery(filters, query)
							)
						)
					);

					queries.push(hyryx.Database.runQuery(query).then(function(result) {
						if (result.rows) {
							finalResult = {
								axis: serie.axis,
								id: column.id,
								name: result.header[1],
								query: query,
								raw: result
							};

							if (xAxis.type < 2) {
								for (var i = 0; i < result.rows.length; i++) {
									var row = result.rows[i];
									(finalResult.data = finalResult.data || []).push([row[0], row[1]]);
								}
							} else {
								var categories = [];
								for (var i = 0; i < result.rows.length; i++) {
									var row = result.rows[i];
									if (categories.indexOf(row[0]) == -1) {
										categories.push(row[0]);
									}
									(finalResult.data = finalResult.data || []).push(row[1]);
								}
								finalResult.categories = categories;
							}

							// Replace names like COUNT(xaxis) with COUNT(yaxis)
							if (finalResult.name[xAxis.column]) {
								finalResult.name[xAxis.column] = column.column;
							}
							content.push(finalResult);
						}
					}.bind(this)));

				}.bind(this));

				$.when.apply($, queries).done(function() {
					this.displayContent(content);
				}.bind(this));
			}
		},

		composeFilterQuery : function(filters, query, lastOp) {
			if ( ! filters) {
				return lastOp;
			}

			$.each(filters, function(index, filterColumn) {
				lastOp = this.composeLocalFilterQuery(filterColumn, query, lastOp);
			}.bind(this));

			return lastOp;
		},

		composeLocalFilterQuery : function(column, query, lastOp) {
			if (column.min) {
				var minFilter = query.addOperator({
					type: 'SimpleTableScan',
					predicates: [
						{type: 7 /* OR */},
						{type: 2 /* GT */, 'in': 0, f: column.column, vtype: column.type, value: column.min},
						{type: 0 /* EQ */, 'in': 0, f: column.column, vtype: column.type, value: column.min}
					]
				});

				if (lastOp) {
					query.addEdge(lastOp, minFilter);
				} else {
					query.getOperator(minFilter).input = [column.table];
				}

				lastOp = minFilter;
			}

			if (column.max) {
				var maxFilter = query.addOperator({
					type: 'SimpleTableScan',
					predicates: [
						{type: 7 /* OR */},
						{type: 1 /* LT */, 'in': 0, f: column.column, vtype: column.type, value: column.max},
						{type: 0 /* EQ */, 'in': 0, f: column.column, vtype: column.type, value: column.max}
					]
				});

				if (lastOp) {
					query.addEdge(lastOp, maxFilter);
				} else {
					query.getOperator(maxFilter).input = [column.table];
				}

				lastOp = maxFilter;
			}

			return lastOp;
		},

		composeProjectionQuery : function(xaxis, column, query, lastOp) {
			var projection = query.addOperator({
				type: 'ProjectionScan',
				fields: [
					xaxis.column,
					column.column
				]
			});

			if (lastOp) {
				query.addEdge(lastOp, projection);
			} else {
				query.getOperator(projection).input = [column.table];
			}

			return projection;
		},

		composeAggregationQuery : function(xaxis, column, query, lastOp) {
			if (column.aggregation != 'none') {
				var group = query.addOperator({
					type: 'GroupByScan',
					fields: [xaxis.column]
				});

				switch (column.aggregation) {
					case 'count':
						query.getOperator(group).function = {
							type: 1,
							field: xaxis.column
						};
						break;
					case 'count':
						query.getOperator(group).function = {
							type: 2,
							field: column.column
						};
						break;
					case 'count':
						query.getOperator(group).function = {
							type: 0,
							field: column.column
						};
						break;
					default:
						query.getOperator(group).function = {
							type: 1,
							field: xaxis.column
						};
				}

				var hash = query.addOperator({
					type: 'HashBuild',
					fields: [xaxis.column],
					key: 'groupby'
				});

				var sort = query.addOperator({
					type: 'SortScan',
					fields: [0]
				});

				query.addEdge(lastOp, hash);
				query.addEdge(lastOp, group);

				query.addEdge(hash, group);
				query.addEdge(group, sort);

				lastOp = sort;
			}

			return lastOp;
		},

		displayContent : function(content) {
			if (content.hasOwnProperty("error")) {
				alert(content["error"]);
			} else {

				// update x-axis
				if (content[0].hasOwnProperty("categories")) {
					chart.xAxis[0].setCategories(content[0]['categories'], true);
				}
				// chart.xAxis[0].setTitle({text:xAxis['column']}, true);
				// jQuery('.xSettings .axisTitle').val(xAxis['column']);

				//remove old series from chart
				while (chart.series.length) {
					chart.series[0].remove();
				}

				for (var i = 0; i < content.length; i++) {

					var axis = 0;
					if (content[i]['axis'] == 'o') {
						axis = 1;
					}

					// update y-Axis with series
					chart.addSeries({
						name: content[i]['name'],
						data: content[i]['data'],
						yAxis: axis
					}, true);
					//preserve chart type after reload
					chart.series[chart.series.length-1].update({type:  jQuery('.axisDroppableContainer [data-id="'+content[i]['id']+'"]').attr('data-chartType')});

					// add click listener for title field
					if (chart.yAxis[axis].axisTitle) {
						var element = chart.yAxis[axis].axisTitle.element;

						// set initial title of the axis
						$(element).text(content[i]['name']);
						helpers.registerAxisPopover(element);
					}

					// var target = $('#highcharts-0 .highcharts-axis text');

					// add a popover to edit the name of the axis

				}

				if (chart.xAxis[0].axisTitle) {
					helpers.registerAxisPopover(chart.xAxis[0].axisTitle.element);
				}

				hyryx.explorer.dispatch({
					type : 'data.reload',
					options : {
						all : true,
						data : content[0].raw
					}
				});

				// save created series in global variable
				loadedSeries = newSeries;

				try {
					var query = JSON.parse(content[0].query);
					// console.log(query);

					if (!$('.btn-debug')[0]) {
						$('.graph').append('<a class="btn-debug col-md-10"><div>Debug query &raquo;</div></a>');
					}

					$('.btn-debug').click(function() {
						hyryx.debug.dispatch({
							type : 'canvas.loadPlan',
							options : query
						});
						hyryx.utils.showScreen('debug');
					});

				} catch (e) {
					console.log('query could not be parsed', content[0].query);
				}
			}
		}
	}
})();
