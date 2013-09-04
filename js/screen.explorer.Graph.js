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
			var $graphOptions = this.targetEl.append('<div id="'+this.id+'" class="graph col-md-10">').find('.graph');
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
			this.initializeAxisTitles();
			this.initializeAxisTypeSelect();

			this.initializeGraphTitle();
			this.initializeGraphTypeSelect();
		},

		handleEvent : function(event) {
			if (helpers[event.type] instanceof Function) {
				helpers[event.type](event.options);
			}
		},

		createGraphMarkup : function(parent) {

			// y-axis
			this.createAxisMarkup(parent, {
				configID	: 'ySettings',
				title		: 'y-Axis',
				id			: 'yAxis'
			});

			// Add graph container
			parent.append('<div id="graph" class="col-md-10" style="height:400px;"></div>');

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
			var $axis = jQuery('<div class="axis axisDroppableContainer '+config.configID+(xAxis ? ' col-md-12':' col-md-1')+'" id="'+config.configID+'"></div>');
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
			
			var $select = jQuery('<select class="selectpicker axisTypeSelect"></select>').appendTo(parent);
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
						text: ''
					}
				},
				yAxis: [{
					opposite: false,
					id : 'yaxis',
					title: {
						text: 'Values'
					}
				}, {
					opposite: true,
					id : 'yaxis2',
					title: {
						text: ''
					},
					showEmpty: false
				}]
			});
			$('#highcharts-0').on('click', function(event) {
				if (event.target.nodeName === 'tspan') {
					var axis = chart.axes.filter(function(a) {return a.axisTitle && a.axisTitle.element === event.target.parentNode})[0];
					if (axis) {

						var $textnode = $(event.target.parentNode);

						var form = [
							'<div id="set-'+(axis.userOptions.id||'axis')+'-name" class="form-horizontal">',
								'<input class="form-control" placeholder="Title" type="text" value="'+axis.axisTitle.text+'" />',
								'<a class="btn col-md-6 btn-plain" href="#">cancel</a>',
								'<a class="btn col-md-6 apply" href="#">Set name</a>',
							'</div>'].join('');

						$textnode.popover({
							title: 'Rename axis',
							html : true,
							content : form,
							placement: 'bottom',
							container: 'body',
							trigger: 'manual'
						}).popover('show');

						$('#set-'+(axis.userOptions.id||'axis')+'-name a').click(function() {
							if ($(this).hasClass('apply')) {
								axis.setTitle({text : $('#set-'+(axis.userOptions.id||'axis')+'-name input').val()});
							}
							$textnode.popover('hide');
						});
					}
				}
			});

			// Add click listener to hide popover
			// $(document).on('click', function(e) {
			//     if (!$(e.target).parents('.popover')[0]){
			//         $('.popover').popover().hide();
			//     }
			// });

			// Add mouseup listener for the highcharts graph since click is blocked
			$('#graph').on('mouseup', function(e) {
				if (!$(e.target).parents('.popover')[0]){
					$('.popover').popover().hide();
				}
			});

			return chart;
		},

		initializeDragDrop : function() {
			//define dropzone for the attributes
			$(".axisDroppableContainer").droppable({
				over: function(event, ui){
					$(this).find('.drop-hint.zone').addClass("over");
				},
				out: function(event, ui){
					$(this).find('.drop-hint.zone').removeClass("over");
				},
				drop: function(event, ui) {
					// if no attribute is present
					if (!$(this).find('.list-group-item')[0]) {
						$(this).append($(ui.draggable).clone());
						helpers.reloadData();
					} else {
						$(this).find('.list-group-item').remove();
						$(this).append($(ui.draggable).clone());
						helpers.reloadData();
						// if (jQuery(this).hasClass('xAxis')) {
						//     // WTF -- copied
						//     jQuery(this).children('.column').each( function() {
						//         removeSeriesWithColumn(jQuery(this).data('id'), 'x');
						//         jQuery(this).remove();
						//     });
						// }
						// // check for identical types of columns
						// if ((jQuery(ui.draggable).data("type") < 2 && jQuery(this).children('[data-id="2"]').length == 0) ||
						//     (jQuery(ui.draggable).data("type") == 2 && jQuery(this).children('[data-id="1"]').length == 0 && jQuery(this).children('[data-id="0"]').length == 0)) {  
						//     jQuery(this).append(jQuery(ui.draggable).clone());
						//     reloadData();
						// } else {
						//     alert('You can only add columns of either number or string type at the same time');
						// }
					}
					
					// if (jQuery(this).children('[data-id="' + jQuery(ui.draggable).data("id") + '"]').length <= 0) { //no column twice
					//     if (jQuery(this).hasClass('xAxis')) {
					//         jQuery(this).children('.column').each( function() {
					//             removeSeriesWithColumn(jQuery(this).data('id'), 'x');
					//             jQuery(this).remove();
					//         });
					//     }
					//     if ((jQuery(ui.draggable).data("type") < 2 && jQuery(this).children('[data-id="2"]').length == 0) || (jQuery(ui.draggable).data("type") == 2 && jQuery(this).children('[data-id="1"]').length == 0 && jQuery(this).children('[data-id="0"]').length == 0)) {  
					//         jQuery(this).append(jQuery(ui.draggable).clone());
					//         reloadData();
					//     } else {
					//         alert('You can only add columns of either number or string type at the same time');
					//     }
					// }
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

		initializeAxisTitles : function() {
			//change the axis titles
			$(".axisTitle").bind('input', function() {
				switch($(this).parents('.axisSettings').attr('id')) {
					case 'yAxis':
						chart.yAxis[0].setTitle({text: $(this).val()}); 
						break;
					case 'oAxis':
						chart.yAxis[1].setTitle({text: $(this).val()});
						break;
					case 'xAxis':
						chart.xAxis[0].setTitle({text: $(this).val()});
						break;
				}
			});
			//initialize axis titles
			$('.ySettings .axisTitle').val(chart.options.yAxis[0].title.text);
			$('.oppositeYSettings .axisTitle').val(chart.options.yAxis[1].title.text);
			$('.xSettings .axisTitle').val(chart.options.xAxis[0].title.text);
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

				jQuery.ajax({
					url: 'http://192.168.200.10:3000/getContentForSeries',
					type: "POST",
					data: {series: newSeries, xaxis: xAxis, filters: filters},
					dataType: "json",
					error: function(jqXHR, textStatus, errorThrown) {
						console.log(textStatus);
					},
					complete: function(jqXHR, textStatus ){
						json = jQuery.parseJSON(jqXHR.responseText);
						if (json.hasOwnProperty("error")){
							alert(json["error"]);
						}else{

							// update x-axis
							if (json[0].hasOwnProperty("categories")) {
								chart.xAxis[0].setCategories(json[0]['categories'], true);
							}
							chart.xAxis[0].setTitle({text:xAxis['column']}, true);
							jQuery('.xSettings .axisTitle').val(xAxis['column']);

							//remove old series from chart
							while (chart.series.length) {
								chart.series[0].remove();
							}

							for (var i = 0; i < json.length; i++) {

								var axis = 0;
								if (json[i]['axis'] == 'o') {
									axis = 1;
								}

								// update y-Axis with series
								chart.addSeries({
									name: json[i]['name'],
									data: json[i]['data'],
									yAxis: axis
								}, true);
								//preserve chart type after reload
								chart.series[chart.series.length-1].update({type:  jQuery('.axisDroppableContainer [data-id="'+json[i]['id']+'"]').attr('data-chartType')});
							}                    

							// load the simple data table on bottom of page
							jQuery('.data table').children().each(function(){
								jQuery(this).remove();
							});

							var headers = '<tr>'
							headers += '<th>' + xAxis['column'] + '</th>';
							jQuery.each(json, function(index,val) {
								if(val != 'rows')
									headers = headers + '<th>' + val['name'] + '</th>';
							});
							headers += '</tr>';

							jQuery('.data table').append(headers);

							for(var i = 0; i < json[0]['data'].length; i++) {
								var html = '<tr class="dataTableRow">';

								if (json[0].hasOwnProperty("categories")) {
									html += '<td>' + json[0]['categories'][i] + '</td>'; 

									jQuery.each(json, function(index,val) {
										if(val != 'rows')
											html += '<td>' + val['data'][i] + '</td>';
									});
								} else {
									html += '<td>' + json[0]['data'][i][0] + '</td>';

									jQuery.each(json, function(index,val) {
										if(val != 'rows')
											html += '<td>' + val['data'][i][1] + '</td>';
									});
								}

								html += '</tr>';
								jQuery('.data table').append(html);
							}

							// save created series in global variable
							loadedSeries = newSeries;
						}   
					}
				});
			}
		}
	}
})();
