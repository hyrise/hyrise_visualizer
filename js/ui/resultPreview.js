(function() {
	if ('undefined' === typeof hyryx.screen) {
		hyryx.screen = {};
	}

	hyryx.screen.resultPreview = function(config) {
		this.targetEl = config.target;

		if (($(this.targetEl)[0] instanceof Element)) {
			this.render();
		}

		return this;
	};

	var x, y, width = 337, height = 34, margin = 10;

	hyryx.screen.resultPreview.prototype = {
		render : function() {

			this.svg = d3.select($(this.targetEl)[0]).append('svg:svg').attr({
				width : width,
				height: height
			})
			.append('svg:g').attr({
				transform : 'translate(' + [margin, 0] + ')'
			});

			x = d3.scale.linear().rangeRound([0, width-margin*2]);
			y = d3.scale.linear().range([0, height]);

			// add a color function for easy access			
			z = d3.scale.category20b();

			this.textOverlay = $('<div class="text-overlay">').appendTo(this.targetEl).hide();

		},

		clearSVG : function() {
			// clear the preview
			this.svg.selectAll('g, rect, text, line').remove();
			this.textOverlay.hide();
		},

		update : function(data) {

			if (!data) {
				console.log('no data received');
				return;
			}

			// map the incoming data and create a stacked data structure for all ops
			var ops = d3.layout.stack().out(function(d) {
				d.x0 = d.data.startTime;
				d.x = d.data.endTime - d.data.startTime;
			})(data.sortBy(function(d) {
				return d.startTime;
			}).map(function(d, i) {
				return [{
					id : d.id,
					name : d.name,
					x : i,
					data : d
				}];
			}));

			// set up domain and range for the x axis
			x.domain([0, d3.max(ops[ops.length-1], function(d) {
				return d.data.endTime;
			})]).range([0,width-margin*2]).nice();

			this.clearSVG();

			// Add a group for each worker.
			var op = this.svg.selectAll("g.operation")
			.data(ops)
			.enter().append("svg:g")
				.attr("class", "operation")
				.style("fill", function(d, i) { return d3.rgb(z(i)); })
				.style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });

			// Add a rect for each date.
			var rect = op.selectAll("rect")
				.data(Object)
				.enter().append("svg:rect").attr({
					x : function(d) { return x(d.data.startTime); },
					y : 0,
					width : function(d) { return x(d.data.endTime - d.data.startTime); },
					height : height/2
				});

			rect.each(function(d) {
				// $(this).hover(function(){$($(absatzAxis)[0][0]).css("opacity",1)}, function(){$($(absatzAxis)[0][0]).css("opacity",EDK.AXIS_OPAQUE_VALUE)})
				$(this).tipsy({
					gravity: 's',
					offset:0,
					html:true,
					// fade:true,
					title: function() {
						return '<b>'+d.name + "</b> " + d.data.id + '</br>'+
								'execution time: '+ (d.data.duration ? d.data.duration/1000+'ms' : '-')+'</br>'+
								'duration: ' + d3.round(d.data.endTime - d.data.startTime, 2)+'ms</br>' +
								'method: ' + (d.data.papi_event ? d.data.papi_event : '-');
					}
				})
			});


			// add y-axis scala
			var xAxis = d3.svg.axis().scale(x).orient("bottom").ticks(5).tickFormat(function(d) {
				return d + 'ms';
			});
			
			this.svg.append('g')
			.attr("class", "axis")
			.attr("transform", "translate(" + [0, d3.round(height/2)] +")")
			.call(xAxis);

		},

		showError : function(error) {
			this.textOverlay.text(error).fadeIn();
			// window.setTimeout(function() {
			// 	this.textOverlay.fadeOut();
			// }.bind(this), 5000);
		}
	};
})();