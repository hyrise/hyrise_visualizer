(function() {

	var gNodes, gEdges, radius, me, svg, width, height, startNode, endNode, drag_line;

	hyryx.screen.CanvasScreen = function(config) {
		this.width = config.width || 12;
		this.targetEl = config.targetEl;
		this.cls = config.cls || 'canvas';

		this.isActiveScreen = false;
		this.id = hyryx.utils.getID('Canvas');
		
		this.el = this.render();
		this.init();
		return this;
	}

	height = 400;

	hyryx.screen.CanvasScreen.prototype = {

		nodes : [],

		show : function(data) {
			this.isActiveScreen = true;
			this.setValue(data);
			this.update();
			$(this.el).find('.canvas-scroll').show();
		},

		hide : function() {
			this.isActiveScreen = false;
			$(this.el).find('.canvas-scroll').hide();
		},

		render : function() {
			var markup = $('<div class="col-md-'+this.width+' '+this.cls+'" id="'+this.id+'">');

			this.targetEl.append(markup);

			return markup;
		},

		setHeight : function(newHeight) {
			svg.style('height', Math.max(height, newHeight) + 'px');
		},

		init : function() {

			me = this;

			radius = 40;
			outerHeight = 400;

			var container = d3.select(this.el[0]).append('div')
				.attr({
					'class' : 'canvas-scroll col-md-10',
				})
				.style({
					height	: outerHeight + 'px',
					overflow: 'auto',
					padding : 0,
					display : 'block'
				});

			svg = container.append('svg')
				.attr('class', 'screen stencilgraph col-md-12')
				.style('height', height+'px')
				.style('display', 'block')
				// .attr('width', width)
				;

			width = $('svg.stencilgraph').width();

			// line displayed when dragging new nodes
			drag_line = svg.append('svg:path')
			    .attr({
			        'class' : 'dragline hidden',
			        'd'     : 'M0,0L0,0'
			    })
			;

			svg.append('text').attr({
				'class' : 'emptytext visible',
				x : width/2,
				y : height /3,
				dy : '.35em',
				'text-anchor' : 'middle'
			}).text('Create a new plan by dragging operations onto the canvas...');
			
			svg.append('text').attr({
				'class' : 'emptytext visible',
				x : width/2,
				y : height /3*2,
				dy : '.35em',
				'text-anchor' : 'middle'
			}).text('... or drag an existing plan to continue.');
			

			this.createDefs(svg);

			gEdges = svg.append('g').selectAll('path.edge');
			gNodes = svg.append('g').selectAll('g.node');

			svg.on({
				mousedown : function() {
					if (d3.event.target.tagName == 'svg') {
						if (!d3.event.shiftKey) {
							d3.selectAll('g.selected').classed('selected', false);
							me.handleNodeSelectionChange(false);
						}
					}
				},
				mousemove : function() {
					var p = d3.mouse(this);

					if(startNode) {
						drag_line.attr('d', 'M' + startNode.getPosition() + 'L' + p);

						var node = d3.select('g.node .inner.hover');
						endNode = (!node.empty() && node.data()[0]) || undefined;
					}
				},

				mouseup : function() {
					d3.selectAll('g.node.selection').classed('selection', false);

					if (startNode) {

						me.createConnection(startNode, endNode);
						
						startNode = endNode = undefined;

						d3.event.stopPropagation();
					}

				},
				mouseout : function() {
					if (!d3.event.relatedTarget || d3.event.relatedTarget.tagName =='HTML') {
						d3.selectAll('g.node.selection').classed('selection', false);
					}
				},
				dblclick : function() {
					// var p = d3.mouse(this);
				}
			});

			me.update();
		},

		/**
		 * Creates a new edge between two nodes
		 * @param  {Node} startNode
		 * @param  {Node} endNode
		 * @return {Edge}
		 */
		createConnection : function(startNode, endNode) {
			// HACK: FF
			drag_line
				.classed('hidden', true)
				.style('marker-end', '');

			if (this.allowConnection(startNode, endNode)) {
				
				var command = new hyryx.command.createEdgeCommand(startNode, endNode, this.update.bind(this));
				hyryx.command.do(command);
			}
		},

		/**
		 * Determines if a connection between the given nodes is allowed or not
		 * @param  {Node} startNode
		 * @param  {Node} endNode
		 * @return {Boolean}
		 */
		allowConnection : function(startNode, endNode) {
			if (startNode instanceof hyryx.debug.Canvas.Node && endNode instanceof hyryx.debug.Canvas.Node && startNode !== endNode) {
				// if the start node already has a connection to the end node or vice versa, refuse
				return !(startNode.edges.find(function(target) {
					return target.target === endNode;
				}) || endNode.edges.find(function(target) {
					return target.target === startNode;
				}));

			}
			// Only allow connections between nodes anyway...
			return false;
		},

		/**
		 * Show or hide the hints on how to use the canvas
		 * @param  {[type]} visible
		 * @return {[type]}
		 */
		toggleLoading : function(visible) {
			d3.selectAll('svg.stencilgraph .emptytext').classed('visible', visible);
		},

		/**
		 * Full rerender of the canvas (THIS IS EXPENSIVE, USE CAREFULLY)
		 */
		update : function(nodes) {
			if (nodes) {
				this.nodes = nodes;
			}

			gNodes = gNodes.data(me.nodes, function(d) {
				return me.nodes.indexOf(d);
			});
			this.renderNodes();

			var _edges = edges();
			gEdges = gEdges.data(_edges, function(d) {
				return _edges.indexOf(d);
			});

			this.renderEdges();

			// if no nodes exist, display hints
			this.toggleLoading(!gNodes.size());
		},

		renderNodes : function() {

			var gNode = gNodes.enter().append('g').attr({
				transform : function(d) {
					return 'translate(' + d.getPosition() + ')';
				},
				'class' : 'node'
			})
			.call(d3.behavior.drag()
				.on('dragstart', function(d) {
					
				})
				.on('dragend', function(d) {
					delete me.isDragging;
				})
				.on('drag', function(d) {
				if (startNode) {
					return;
				}

				me.isDragging = true;

				var selection = d3.selectAll('.stencilgraph .selected');

				if (selection[0].indexOf(this) == -1) {
					selection.classed('selected', false);
					selection = d3.select(this);
					selection.classed('selected', true);

					me.handleNodeSelectionChange(selection.length === 1, selection.data()[0]);
				}

				selection.attr({
					transform : function(d) {
						// might not be an svg, if no d is defined
						if (!d) { return; }

						// limit movement to canvas boundaries
						var x = Math.max(radius, Math.min(width - radius, d.getPosition()[0] + d3.event.dx));
						var y = Math.max(radius, Math.min(height - radius, d.getPosition()[1] + d3.event.dy));

						return 'translate(' + d.setPosition(x, y) + ')';
					}
				});

				var selectedNodes = d3.selectAll('g.node.selected').data();
				var affectedEdges = selectedNodes.reduce(function(array, node) {
					return array.concat(node.edges);
				}, []).filter(function(edge) {
					return selectedNodes.indexOf(edge.target) !== -1;
				});

				affectedEdges.each(function(edge) {
					for (var i = edge.points.length -1; i >= 0; --i) {
						var point = edge.points[i];
						point.x += d3.event.dx;
						point.y += d3.event.dy;
					}
				});

				// put back on top
				selection.each(function() {
					this.parentNode.appendChild(this);
				});

				gEdges.selectAll('path').attr({
					d : computeEdgePath
				});

				gEdges.selectAll('circle.endpoint').attr({
					transform : transformEdgeEndpoints
				});

				gEdges.selectAll('circle.point').attr({
					transform : transformEdgePoints
				});

				d3.event.sourceEvent.stopPropagation();
			}));

			gNode.append('circle').attr({
				r : radius + 4,
				'class' : 'outer'
			}).on({
				mousedown : function(d) {
					startNode = d, endNode;

					drag_line
						.style('marker-end', 'url(#end-arrow)')
						.classed('hidden', false)
						.attr('d', 'M' + d.getPosition() + 'L' + d.getPosition())
					;

					// put on top
					this.parentNode.parentNode.appendChild(this.parentNode);
					d3.event.stopPropagation();
				},
				mouseover : function() {
					d3.select(this).classed('hover', true);
				},
				mouseout : function() {
					d3.select(this).classed('hover', false);
				}
			});

			gNode.append('circle').attr({
				r : radius,
				'class' : 'inner'
			}).on({
				mouseup : function(d) {
					if (me.isDragging) { return; }


					var e = d3.event,
						g = this.parentNode,
						isSelected = d3.select(g).classed('selected');

					if (!e.shiftKey) {
						d3.selectAll('g.selected').classed('selected', false);
					}

					d3.select(g).classed('selected', !isSelected);
					
					me.handleNodeSelectionChange(!isSelected, d);
					// put back on top
					// g.parentNode.appendChild(g);
				},
				mouseover : function() {
					d3.select(this).classed('hover', true);
				},
				mouseout : function() {
					d3.select(this).classed('hover', false);
				},
				dblclick : function() {
					var d = d3.select(this.parentNode).datum();

					var command = new hyryx.command.removeNodeCommand(d, me.nodes, me.update.bind(me));
					hyryx.command.do(command);
				}
			});

			gNode.append('text')
				.attr({
					'text-anchor' : 'middle',
					y : 4
				})
				.text(function(d) { return d.type; })
			;

			gNode.append('title')
				.text(function(d) { return d.type; })
			;

			gNodes.exit().remove();
		},

		renderEdges : function() {
			
			var gEdge = gEdges.enter().append('g')
			// .style('marker-start', 'url(#start-arrow)')
			.attr({
				'class' : 'edge'
			}).on({
				click : function() {
					d3.selectAll('g.node.selection').classed('selection', false);
					d3.selectAll('g.selected').classed('selected', false);

					me.handleNodeSelectionChange(false);

					d3.select(this).classed('selected', true);
					// d3.event.stopPropagation();
				},
				mouseover : function() {
					d3.select(this).classed('hover', true);
				},
				mouseout : function() {
					d3.select(this).classed('hover', false);
				}
			});

			gEdge.append('path').attr({
				d : computeEdgePath,
				'class' : 'background'
			}).on({
				dblclick : function(d, i) {
					// var gEdge = d3.select(d3.event.target.parentElement);
					// if (d3.event.shiftKey) {
					// 	var p = d3.mouse(this);

					// 	gEdge.classed('selected', true);
					// 	d.edge.points.push({
					// 		x : p[0],
					// 		y : p[1]
					// 	});

					// 	renderEdgeMidPoints(gEdge, d);
					// 	gEdge.selectAll('path').attr({
					// 		d : computeEdgePath
					// 	});
					// } else {
					gEdge = d3.select(d3.event.target.parentElement);
					var edge = gEdge.datum();

					var command = new hyryx.command.removeEdgeCommand(edge, me.update.bind(me));
					hyryx.command.do(command);

					d3.event.stopPropagation();
					// }
				}
			});

			gEdge.append('path').attr({
				d : computeEdgePath,
				'class' : 'foreground'
			})
			.style('marker-end', 'url(#end-arrow)');

			renderEdgePoints(gEdge);
			renderEdgeMidPoints(gEdge);

			gEdges.exit().remove();
		},

		onDragStart : function(d) {
			// the dom node representing a new stencil
			var gStencil = d3.select(this);

			gStencil.style('opacity', .4);

			d3.event.sourceEvent.stopPropagation();
		},

		onDragEnd : function(d) {			
			var gStencil = d3.select(this);
			gStencil.style('opacity', 1);

			if (d3.event.sourceEvent.toElement.tagName == 'svg') {
				var p = d3.mouse(d3.event.sourceEvent.toElement);
				var x = p[0]-radius,
					y = p[1]-radius,
					name = $(gStencil[0]).data('type');

				var command = new hyryx.command.createNodeCommand([x, y], name, me.nodes, me.update.bind(me));
				hyryx.command.do(command);
			}
		},

		/**
		 * Create an SVG arrow as a line marker, can be addressed via url(#end-arrow)
		 * @param  {d3Element} svg
		 */
		createDefs : function(svg) {
			// create an arrow marker
			svg.append('svg:defs').append('svg:marker')
				.attr('id', 'end-arrow')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 4)
				.attr('markerWidth', 8)
				.attr('markerHeight', 8)
				.attr('orient', 'auto')
				.append('svg:path')
				.attr('d', 'M0,-5L10,0L0,5')
				.attr('class', 'end-arrow')
			;

			svg.append('svg:defs').append('svg:marker')
				.attr('id', 'start-arrow')
				.attr('viewBox', '0 -5 10 10')
				.attr('refX', 4)
				.attr('markerWidth', 8)
				.attr('markerHeight', 8)
				.attr('orient', 'auto')
				.append('svg:path')
				.attr('d', 'M0,0L10,5L10,-5')
				.attr('class', 'start-arrow')
			;
		},

		getValue : function() {
			
			var nodes = {};
			var edges = [];

			this.nodes.each(function(node) {
				nodes[node.id] = {};

				$.each(node, function(key, value) {
					if (hyryx.stencils[node.type] && hyryx.stencils[node.type][key]) {
						nodes[node.id][key] = value;
					}
				});

				nodes[node.id]._position = node._position;

				node.edges.each(function(edge) {
					edges.push([node.id, edge.target.id]);
				});
			})

			return {
			    "operators": nodes,
			    "edges": edges
			};
		},

		setValue : function(data, forceLoad) {

			// if data was modified using the json text editor
			if (data.hasChanged || forceLoad) {
				// check if basic constrains are met
				if (data.operators) {
					// load the new data
					var command = new hyryx.command.loadPlanCommand(data, this.nodes, this.update.bind(this));
					hyryx.command.do(command);
				}
			}
		},

		handleNodeSelectionChange : function(select, node) {

			if (select) {
				hyryx.debug.dispatch({
					type : 'attributes.show',
					options : {
						node : node
					}
				});
			} else {
				hyryx.debug.dispatch('attributes.hide');
			}
		},
	};

	var edges = function() {
		return me.nodes.reduce(function(initial, node) {
			return initial.concat(
				node.edges.map(function(o) {
					return {source : node, edge : o};
				})
			);
		}, []);
	}

	var transformEdgeEndpoints = function(d, i) {
		var endPoints = d.endPoints();
		var point = [
			d.type == 'start' ? endPoints[0].x : endPoints[1].x,
			d.type == 'start' ? endPoints[0].y : endPoints[1].y
		];

		return 'translate('+point+')';
	};

	var transformEdgePoints = function(d, i) {
		return "translate("+ [d.x,d.y] + ")";
	};

	var computeEdgePath = (function() {
		var line = d3.svg.line()
			.x(function(d) { return d.x; })
			.y(function(d) { return d.y; })
			.interpolate('cardinal')
		;

		return function(d) {
			var source = d.source,
				target = d.edge.points.length && d.edge.points[0] || d.edge.target,
				deltaX = target.getPosition()[0] - source.getPosition()[0],
				deltaY = target.getPosition()[1] - source.getPosition()[1],
				dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
	            normX = deltaX / dist,
	            normY = deltaY / dist,
	            sourcePadding = radius + 4,
	            sourceX = source.getPosition()[0] + (sourcePadding * normX),
	            sourceY = source.getPosition()[1] + (sourcePadding * normY);

			source = d.edge.points.length && d.edge.points[ d.edge.points.length-1] || d.source;
            target = d.edge.target;
            deltaX = target.getPosition()[0] - source.getPosition()[0];
            deltaY = target.getPosition()[1] - source.getPosition()[1];
            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            normX = deltaX / dist;
            normY = deltaY / dist;
            var targetPadding = radius + 8,
	            targetX = target.getPosition()[0] - (targetPadding * normX),
	            targetY = target.getPosition()[1] - (targetPadding * normY);

	        var points = [{
	        	x : sourceX,
	        	y : sourceY
	        }].concat(d.edge.points, [{
	        	x : targetX,
	        	y : targetY
	        }]);

	        return line(points); 
		}
	})();

	var renderEdgeMidPoints = function(gEdge) {
		gEdge.each(function(edge) {
			var edgePoints = d3.select(this)
				.selectAll('circle.point')
				.data(edge.edge.points, function(d, i) {
					return i;
				})
			;

			edgePoints.enter().append('circle').attr({
				'class' : 'point',
				r : 4,
				transform : transformEdgePoints
			}).on({
				/**
				 * Create a new spline control point (disabled due to :bleh: )
				 * @param  {[type]} d
				 */
				dblclick : function(d) {
					// var gEdge = d3.select(d3.event.target.parentElement),
					// 	edge = gEdge.datum(),
					// 	index = edge.edge.points.indexOf(d);

					// if (gEdge.classed('selected')) {
					// 	edge.edge.points.splice(index, 1);

					// 	gEdge.selectAll('path').attr({
					// 		d : computeEdgePath
					// 	});

					// 	renderEdgeMidPoints(gEdge);

					// 	gEdge.selectAll('circle.endpoint').attr({
					// 		transform : transformEdgeEndpoints
					// 	});
					// }
					// d3.event.stopPropagation();
				}
			}).call(d3.behavior.drag().on('drag', function(d) {
				var gEdgePoint = d3.select(this);

				gEdgePoint.attr('transform', function(d) {
				    d.x += d3.event.dx;
			        d.y += d3.event.dy;
			        return "translate(" + [ d.x,d.y ] + ")";
				});

				gEdges.selectAll('path')
					.attr('d', computeEdgePath)
				;

				gEdges.selectAll('circle.endpoint').attr({
					transform : transformEdgeEndpoints
				});

				gEdges.selectAll('circle.point').attr({
					transform : transformEdgePoints
				});

				d3.event.sourceEvent.stopPropagation();
			}));

			edgePoints.exit().remove();
		});
	};

	var renderEdgePoints = function(gEdge) {
		gEdge.each(function(d) {
			var endPoints = function() {
				var source = d.source,
		            target = d.edge.points.length && d.edge.points[0] || d.edge.target,
		            deltaX = target.getPosition()[0] - source.getPosition()[0],
		            deltaY = target.getPosition()[1] - source.getPosition()[1],
		            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
		            normX = deltaX / dist,
		            normY = deltaY / dist,
		            sourceX = source.getPosition()[0] + (radius * normX),
		            sourceY = source.getPosition()[1] + (radius * normY);

	            source = d.edge.points.length && d.edge.points[ d.edge.points.length-1] || d.source;
	            target = d.edge.target;
	            deltaX = target.getPosition()[0] - source.getPosition()[0];
	            deltaY = target.getPosition()[1] - source.getPosition()[1];
	            dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
	            normX = deltaX / dist;
	            normY = deltaY / dist;
		        var targetPadding = radius + 8,
		            targetX = target.getPosition()[0] - (radius * normX),
		            targetY = target.getPosition()[1] - (radius * normY);

		        return [ { x : sourceX, y : sourceY}, { x : targetX, y : targetY}];
			};

			var edgeEndPoints = d3.select(this).selectAll('circle.endpoint').data([{
				endPoints : endPoints, type : 'start'
			}, {
				endPoints : endPoints, type : 'end'
			}]);

			edgeEndPoints.enter().append('circle')
				.attr({
					'class' : function(d) {
						return 'endpoint ' + d.type;
					},
					r : 4,
					transform : transformEdgeEndpoints
				})
			;

			edgeEndPoints.exit().remove();
		});
	};
})();