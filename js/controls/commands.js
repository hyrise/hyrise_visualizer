(function() {

	hyryx.command = (function() {
		
		var commandStack = [],
			redoStack = [];

		function _do(command) {

			if (command instanceof hyryx.command.Command) {
				// store command
				commandStack.push(command);

				// clear redo stack
				redoStack = [];

				command.execute();
			}
		}

		function undo() {
			var c = commandStack.pop();
			if (c) {
				redoStack.push(c);
				c.rollback();
			}
		}

		function redo() {
			var c = redoStack.pop();
			if (c) {
				commandStack.push(c);
				c.execute();
			}
		}

		return {
			'do' : _do,
			undo : undo,
			redo : redo
		};
	})();

	hyryx.command.Command = function(state, doClb) {

		this.oldState = state;
		this.doClb = doClb;

		this.execute();
	}

	hyryx.command.Command.prototype = {

		oldState : null,
		newState : null,

		execute : function() {
			this.newState = this.doClb(this.oldState);
		},

		rollback : function() {
			this.newState = this.oldState;
			this.doClb(this.newState);
		}
	};



	hyryx.command.createNodeCommand = function(position, name, nodes, updateFn) {
		this.node = new hyryx.debug.Canvas.Node(position, name);
		this.nodes = nodes;
		this.updateFn = updateFn;
	}

	hyryx.command.createNodeCommand.prototype = extend(hyryx.command.Command, {
		execute : function() {

			this.nodes.push(this.node);
			this.updateFn();
		},

		rollback : function() {
			this.nodes.splice(this.nodes.indexOf(this.node), 1);
			this.updateFn();
		}
	});



	hyryx.command.removeNodeCommand = function(node, nodes, updateFn) {
		this.node = node;
		this.nodes = nodes;
		this.updateFn = updateFn;
		this.index = nodes.indexOf(this.node);
		this.edgesToRemove = [];

	}

	hyryx.command.removeNodeCommand.prototype = extend(hyryx.command.Command, {
		execute : function() {

			this.nodes.splice(this.index, 1);

			this.nodes.each(function(node) {
				node.edges.each(function(edge, i) {
					if (edge.target === this.node) {
						// store the removed edge
						this.edgesToRemove.push([node, i, node.edges.splice(i, 1)[0]]);
					}
				}.bind(this));
			}.bind(this));

			this.updateFn();
		},

		rollback : function() {
			this.nodes.splice(this.index, 0, this.node);

			this.edgesToRemove.each(function(p) {
				this.nodes.find(function(node) {
					return node.id === p[0].id;
				}.bind(this)).edges.splice(p[1], 0, p[2]);
			}.bind(this));

			this.edgesToRemove = [];

			this.updateFn();
		}
	})

	
	hyryx.command.createEdgeCommand = function(startNode, endNode, updateFn) {
		this.startNode = startNode;
		this.endNode = endNode;
		this.updateFn = updateFn;
	}

	hyryx.command.createEdgeCommand.prototype = extend(hyryx.command.Command, {
		execute : function() {

			var edge = new hyryx.debug.Canvas.Edge(this.endNode);

			this.startNode.edges.push(edge);
			this.updateFn();
		},

		rollback : function() {
			var id = this.endNode.id;

			var element = this.startNode.edges.find(function(edge) {
				return edge.target.id === id;
			});
			// remove the edge between start and end node
			this.startNode.edges.splice(this.startNode.edges.indexOf(element), 1);

			this.updateFn();
		}
	});



	hyryx.command.removeEdgeCommand = function(edge, updateFn) {
		this.edge = edge.edge;
		this.startNode = edge.source;
		this.updateFn = updateFn;
		this.index = this.startNode.edges.indexOf(this.edge);
	}

	hyryx.command.removeEdgeCommand.prototype = extend(hyryx.command.Command, {
		execute : function() {
			
			this.startNode.edges.splice(this.index, 1);

			this.updateFn();
		},

		rollback : function() {
			this.startNode.edges.splice(this.index, 0, this.edge);

			this.updateFn();
		}
	});


	hyryx.command.loadPlanCommand = function(data, nodes, updateFn) {
		this.data = data;
		// weave in edges
		if (!this.data.edges) {
			this.data.edges = [];
		}
		this.oldNodes = nodes;
		this.updateFn = updateFn;
	}

	hyryx.command.loadPlanCommand.prototype = extend(hyryx.command.Command, {
		execute : function() {
			var nodes = [];

			// DESERIALIZE NODES

			var i = 0, lastPosition = 0, stepping = 100;

			var operators = [];
			var edges = [].concat(this.data.edges||[]);

			$.each(this.data.operators, function(key, values) {

				// SPEAKING OF BAD HACKS: SINCE 'INPUT' IS USED INSTEAD OF GETTABLE, A SPECIAL TREATMENT IS NECESSARY
				if ((values.input||[]).length) {
					// Create a getTable node to load the inputs
					values.input.each(function(table) {
						var loadOpKey = hyryx.utils.getID();
						
						var op = {
							type : 'GetTable',
							name : table
						};

						operators.push([loadOpKey, op]);

						// add an edge for the get table operation
						edges.push([loadOpKey, key]);

					}.bind(this));
				}
				operators.push([key, values]);

			}.bind(this));


			operators.each(function(node) {
				var key = node[0];
				var values = node[1];

				var position = values._position || [stepping, stepping*(++i)];
				var newNode;

				newNode = new hyryx.debug.Canvas.Node(position, values.type, null, values, key);

				nodes.push(newNode);
				// nodes[key] = newNode;

			}.bind(this));

			// CHANGE HEIGHT OF SVG TO MATCH NODE COUNT
			hyryx.debug.dispatch({
				type : 'canvas.changeHeight',
				options : stepping * (i+1)
			});

			// DESERIALIZE EDGES

			// add only unique edges, THIS IS A WORKAROUND FOR A BAD PLAN COMING FROM RAILS
			var uniqueEdges = [];
			edges.each(function(edge) {
				// if the edge is not yet listed
				if (uniqueEdges.indexOf(JSON.stringify(edge))==-1) {
					// add it
					uniqueEdges.push(JSON.stringify(edge));
				}
			});

			var receivingNodes = [];

			uniqueEdges.each(function(edge) {
				// parse edge back to array representation
				edge = JSON.parse(edge);

				var startNode, endNode;

				nodes.each(function(n) {
					if (n.id === edge[0]) {
						startNode = n;
					} else if (n.id === edge[1]) {
						endNode = n;
					}
				})

				// only add edges if source and target are valid nodes
				if (!startNode || !endNode) {
					return;
				}

				if (!startNode.edges) {
					startNode.edges = [];
				}
				// if the target node already has an incoming edge, move the start node so edges don't overlap
				if (receivingNodes.indexOf(edge[1]) !== -1) {

					var edgeCount = receivingNodes.findAll(function(receiver) {
						return receiver === edge[1];
					}).length;

					var pos = startNode.getPosition();
					pos[0] = stepping * (edgeCount+1);
					startNode.setPosition(pos[0], pos[1]);
				}

				// remember all end nodes
				receivingNodes.push(edge[1]);

				var newEdge = new hyryx.debug.Canvas.Edge(endNode);
				startNode.edges.push(newEdge);
			});

			this.updateFn(nodes);
		},

		rollback : function() {
			this.updateFn(this.oldNodes);
		}
	});



	hyryx.command.changeValueCommand = function(oldValue, newValue, field, object, id) {
		this.oldValue = oldValue;
		this.newValue = newValue;
		this.object = object;
		this.id = id;
		this.field = field;
	}

	hyryx.command.changeValueCommand.prototype = extend(hyryx.command.Command, {
		execute : function() {

			this.field.setValue(this.newValue);
			this.updateObject();
		},

		rollback : function() {
			this.field.setValue(this.oldValue);
			this.updateObject();
		},

		updateObject : function() {
			this.object[this.id] = this.field.getValue();
		}
	});



	hyryx.command.changeJSONCommand = function(oldValue, newValue, editor) {
		this.oldValue = oldValue;
		this.newValue = newValue;
		this.editor = editor;
	}

	hyryx.command.changeJSONCommand.prototype = extend(hyryx.command.Command, {
		execute : function() {
			this.editor.setValue(this.newValue);
		},

		rollback : function() {
			this.editor.setValue(this.oldValue);
		}
	})
})();