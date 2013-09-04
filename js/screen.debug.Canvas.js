(function() {

	function updateForm() {
		console.log('call to updateForm')
	}

	hyryx.debug.Canvas = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	}

	hyryx.debug.Canvas.prototype = extend(hyryx.screen.AbstractUIPlugin, {
		
		render : function() {
			this.createCanvasMarkup();
		},

		init : function() {
			var s = new CanvasState(document.getElementById('canvas1'));

			// registerFormForCanvas(s);
			// registerResultViewerForCanvas(s);
		},

		createCanvasMarkup : function() {
			this.targetEl.append('<canvas id="canvas1" width="500px" height=400 style="border:1px solid gray;" ondragover="hyryx.debug.Canvas.allowDrop(event)"></canvas>');
		}
	});

	hyryx.debug.Canvas.allowDrop = function allowDrop(ev) {
		ev.preventDefault();
	}

	hyryx.debug.Canvas.drag = function drag(ev) {	
		ev.dataTransfer.setData("id", $(ev.target).data('key'));
		ev.dataTransfer.setData('json', JSON.stringify(hyryx.stencils[$(ev.target).data('key')]));
	}

	function CanvasState(canvas) {
		// **** First some setup! ****
		
		var C = hyryx.debug.Canvas;

		this.canvas = canvas;
		this.width = canvas.width;
		this.height = canvas.height;
		this.ctx = canvas.getContext('2d');
		// This complicates things a little but but fixes mouse co-ordinate problems
		// when there's a border or padding. See getMouse for more detail
		var stylePaddingLeft, stylePaddingTop, styleBorderLeft, styleBorderTop;
		if (document.defaultView && document.defaultView.getComputedStyle) {
			this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingLeft'], 10)      || 0;
			this.stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(canvas, null)['paddingTop'], 10)       || 0;
			this.styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderLeftWidth'], 10)  || 0;
			this.styleBorderTop   = parseInt(document.defaultView.getComputedStyle(canvas, null)['borderTopWidth'], 10)   || 0;
		}
		// Some pages have fixed-position bars (like the stumbleupon bar) at the top or left of the page
		// They will mess up mouse coordinates and this fixes that
		var html = document.body.parentNode;
		this.htmlTop = html.offsetTop;
		this.htmlLeft = html.offsetLeft;

		// **** Keep track of state! ****
		
		this.valid = false; // when set to false, the canvas will redraw everything
		this.shapes = [];  // the collection of things to be drawn
		this.edges = []; // the collection of edges to be drawn
		this.dragging = false; // Keep track of when we are dragging
		// the current selected object. In the future we could turn this into an array for multiple selection
		this.selection = null;
		this.dragoffx = 0; // See mousedown and mousemove events for explanation
		this.dragoffy = 0;
		
		// **** Then events! ****
		
		// This is an example of a closure!
		// Right here "this" means the CanvasState. But we are making events on the Canvas itself,
		// and when the events are fired on the canvas the variable "this" is going to mean the canvas!
		// Since we still want to use this particular CanvasState in the events we have to save a reference to it.
		// This is our reference!
		var myState = this;
		var SNAPPING = 1;
		var SHAPESIZE = 50;
		this.shapemenu = new hyryx.debug.Canvas.Shapemenu();

		//fixes a problem where double clicking causes text to get selected on the canvas
		canvas.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
		// Up, down, and move are for dragging
		canvas.addEventListener('mousedown', function(e) {

			var mouse = myState.getMouse(e);
			var mx = mouse.x;
			var my = mouse.y;

			if (myState.selection && myState.shapemenu.isVisible() && myState.shapemenu.contains(mx, my)) {
				myState.lineCreation = {
					startShape : myState.shapemenu.shape
				};
				return;
			}

			var shape = myState.shapes.reverse().find(function(shape) {
				return shape.contains(mx, my);
			});

			if (!shape) {
				myState.selection = null;
				updateForm();
				myState.valid = false;
				return;

			} else if (shape.id !== (myState.selection||{}).id) {
				myState.selection = shape;
				myState.shapemenu.putOn(shape);
				updateForm(shape);
				// myState.valid = false;
				// return;
			}

			// only allow dragging when already selected
			myState.dragoffx = Math.round((mx - shape.x));
			myState.dragoffy = Math.round((my - shape.y));
			myState.dragging = true;
			myState.valid = false;
		}, true);

		canvas.addEventListener('mousemove', function(e) {
			if (myState.dragging){
				var mouse = myState.getMouse(e);
				// We don't want to drag the object by its top-left corner, we want to drag it
				// from where we clicked. Thats why we saved the offset and use it here
				myState.selection.x = Math.round((mouse.x - myState.dragoffx)/SNAPPING)*SNAPPING;
				myState.selection.y = Math.round((mouse.y - myState.dragoffy)/SNAPPING)*SNAPPING;
				myState.valid = false; // Something's dragging so we must redraw
			}
		}, true);

		$(canvas).on('focus', function(){
			console.log('focus')
		})

		$(canvas).on('blur', function() {
			console.log('blur')
		})

		canvas.addEventListener('mouseup', function(e) {
			myState.dragging = false;

			if (myState.lineCreation) {
				var mouse = myState.getMouse(e);
				var mx = mouse.x;
				var my = mouse.y;
				var shapes = myState.shapes;
				var l = shapes.length;
				for (var i = l-1; i >= 0; i--) {
					if (shapes[i].contains(mx, my)) {
						if (myState.lineCreation) {
							var startShape = myState.lineCreation.startShape;
							var start = {
								x: startShape.x + startShape.w/2,
								y: startShape.y + startShape.h/2
							}
							var  w = Math.abs(start.x - shapes[i].x) + shapes[i].w/2;
							var  h = Math.abs(start.y - shapes[i].y) + shapes[i].h/2;

							// myState.addShape(new Shape(start.x, start.y, w, h, 'red'));
							var newEdge = new C.CanvasEdge(startShape, shapes[i], myState);

							myState.addEdge(newEdge);
							delete myState.lineCreation;
						}
					}
				}  
			} else {
				updateForm(myState.selection);
			}
			// myState.serialize();
		}, true);
		// double click for making new shapes
		canvas.addEventListener('dblclick', function(e) {
			var mouse = myState.getMouse(e);
			myState.serialize();
			// myState.addShape(new Shape(Math.round((mouse.x - 10)/SNAPPING)*SNAPPING, Math.round((mouse.y - 10)/SNAPPING)*SNAPPING, SHAPESIZE, SHAPESIZE, 'rgba(0,255,0,.6)'));
		}, true);
		
		canvas.addEventListener('drop', function(e) {
				e.preventDefault();
				var stencilType=e.dataTransfer.getData("id");
				var data = JSON.parse(e.dataTransfer.getData('json'));
				var mouse = myState.getMouse(e);

				myState.addShape(new C.CanvasNode(Math.round((mouse.x - 10)/SNAPPING)*SNAPPING, Math.round((mouse.y - 10)/SNAPPING)*SNAPPING, undefined, undefined, stencilType, data, myState));

				// myState.serialize();
		}, true);

		jQuery('#button-execute').click(function() {
			var request = myState.serialize();
			// console.log(request);
			jQuery.ajax({
				url : 'http://192.168.200.10:5000/jsonQuery',
				type : 'POST',
				dataType: 'json',
				data : request,
				success : function(data, status, xhr) {
					// console.log(data);
					if (data.error) {
						showError(data.error);
					} else {
						showResult(data, myState);
					}
				}
			});
		});

		(function() {
			var toJSONContainer = function() {
				jQuery('#canvas1').hide();
				updateForm();
				jQuery('#json-container').html('<pre>'+myState.serialize().split('query=').last()+'</pre>').show();

				jQuery(this).text('canvas').one('click', toCanvas);
			};

			var toCanvas = function() {
				jQuery('#canvas1').show();
				// todo deserialize json and update canvas
				myState.deserialize(jQuery('#json-container pre').html(), myState);
				jQuery('#json-container').hide();

				jQuery(this).text('Get JSON').one('click', toJSONContainer);
			};

			jQuery('#button-json').one('click', toJSONContainer);
		}());

		$(document).on('keydown', function(e) {
			if (myState.selection && e.keyCode === 46) {
				e.preventDefault();
				myState.selection.remove();
			}
		});

		// **** Options! ****
		
		this.selectionColor = '#CC0000';
		this.selectionWidth = 2;  
		this.interval = 30;
		setInterval(function() { myState.draw(); }, myState.interval);
	}

	CanvasState.prototype.addShape = function(shape) {
		this.shapes.push(shape);
		this.valid = false;
	}

	CanvasState.prototype.addEdge = function(edge) {
		this.edges.push(edge);
		this.valid = false;
	}

	CanvasState.prototype.remove = function(element) {
		if (element instanceof C.CanvasNode) {
			this.shapes = this.shapes.findAll(function(shape) {
				return shape.id !== element.id;
			});
			if (this.selection === element) {
				this.selection = null;
				updateForm();
			}
		} else if (element instanceof C.CanvasEdge) {
			this.edges = this.edges.findAll(function(edge) {
				return edge.id !== element.id;
			});
		}
		this.valid = false;
	}

	CanvasState.prototype.purgeAll = function() {
		this.shapes = [];
		this.edges = [];
		this.selection = null;
		this.valid = false;
	}

	CanvasState.prototype.clear = function() {
		this.ctx.clearRect(0, 0, this.width, this.height);
	}

	// While draw is called as often as the INTERVAL variable demands,
	// It only ever does something if the canvas gets invalidated by our code
	CanvasState.prototype.draw = function() {
		// if our state is invalid, redraw and validate!
		if (!this.valid) {
			var ctx = this.ctx;
			var shapes = this.shapes;
			var edges = this.edges;
			this.clear();
			
			// ** Add stuff you want drawn in the background all the time here **
			

			// draw all edges
			l = edges.length;
			for (var i = 0; i < l; ++i) {
				var edge = edges[i];

				edges[i].draw(ctx);
			}

			// draw all shapes
			var l = shapes.length;
			for (var i = 0; i < l; i++) {
				var shape = shapes[i];
				// We can skip the drawing of elements that have moved off the screen:
				if (shape.x > this.width || shape.y > this.height ||
						shape.x + shape.w < 0 || shape.y + shape.h < 0) continue;
				
				shapes[i].draw(ctx);
			}

			if (this.selection) {
				this.selection.draw(ctx, true);

				if (this.shapemenu.isVisible()) {
					this.shapemenu.draw(ctx);   
				}
			}
			
			this.valid = true;
		}
	}

	CanvasState.prototype.serialize = function() {
		var nodes = this.shapes.sort(function(a,b) {
			return a.y<b.y?-1:a.y>b.y?1:a.x<b.x?-1:1;
		});

		var orderedNodeIds = nodes.pluck('id');

		var edges = this.edges.map(function(edge) {
			return [edge.start.id, edge.end.id].sortBy(function(n) {
				return orderedNodeIds.indexOf(n);
			});
		}).sortBy(function(edge) {
			return orderedNodeIds.indexOf(edge[1]);
		})

		/*.sort(function(a,b) {
			return a[0]<b[0]?-1:a[0]>b[0]?1:a[1]<b[1]?-1:1;
		})*/.compact();

		var j = {
			nodes : nodes,
			edges : edges
		};

		var operators = {};
		
		nodes.each(function(node, i) {
			var o = {};
			$.each(node.data, function(key, value) {
				if ((value||{}).getValue instanceof Function) {
					o[key] = value.getValue();
				} else {
					o[key] = value.value || p.value;
				}
			})
			operators[node.id] = o;
		});

		var request = {
		    "operators": operators,
		    "edges": edges
		};

		return "query=" + JSON.stringify(request, null, 4);
	}

	CanvasState.prototype.deserialize = function(json, myState) {
		var obj;
		if ('undefined' !== typeof json) {
			if ('string' === typeof json) {
				try {
					obj = JSON.parse(json.split('query=').last());
				} catch (e) {
					console.log('error when parsing given json', json, e);
					obj = {};
				}
			} else {
				obj = Object.clone(json);
			}
		}

		var getX = function(p) {
			var parent = (obj.edges.find(function(edge) {
				return edge[1] === p.key;
			})||[])[0];
			if (!parent) {
				return 250;
			}
			var siblings = obj.edges.findAll(function(edge) {
				return edge[0] === parent;
			}).pluck('1');

			if (siblings.length === 1) {
				return myState.shapes.find(function(s) {
					return s.id === parent;
				}).x + 100;
			}

			return siblings.indexOf(p.key)*250+120;
		};

		var rows = [];

		var getY = function(p) {
			var row = 0;
			if (!rows.flatten().include(p.key)) {
				// if the node is a child node
				if (obj.edges.pluck('1').include(p.key)) {
					var lastPredecessingNode = obj.edges.find(function(e) {
						return e[1] === p.key;
					})[0];

					/* Find the row index of the parent row, return the next row */
					var c = 0;
					rows.find(function(r) {
						if (r.include(lastPredecessingNode)) {
							row = ++c;
							return true;
						};
						++c;
						return false;
					});
					
					if (row === rows.length) {
						rows.push([p.key]);
					} else {
						rows[row].push(p.key);
					}
				}
				// // if not a child node but has child nodes, it is the root node, therefore put it in row 1
				// else if (obj.edges.pluck('0').include(p.key)) {
				// 	if (!rows[0]) {
				// 		rows[0] = [];
				// 	}
				// 	rows[0].push(p.key);
				// 	row = 0;
				// }
				// if unconnected node, sort it in the list of pre nodes
				else {
					if (!rows[0]) {
						rows[0] = [];
					}
					rows[0].push(p.key);
				}
			}
			// If the node is already listed
			else {
				var c = 0;
				rows.find(function(r) {
					if (r.include(p.key)) {
						row = c;
						return true;
					};
					++c;
					return false;
				});
			}
			return row*50+50;
		};

		myState.purgeAll();
		
		$H(obj.operators).each(function(p) {
			var stencil = jQuery.extend(true, {}, hyryx.stencils[p.value.type]);

			$H(p.value).each(function(prop) {
				if (prop.key === 'type') { return; }

				if (stencil[prop.key]) {
					var type = stencil[prop.key].type;
					var isList = stencil[prop.key].isList;
					var value = null;
					// if the property type is a column, extract the column name from the list of available columns
					if (type === 'column') {
						value = (isList ? prop.value : [prop.value]).map(function(v) {
							return (columns[v]||{}).name;
						}).compact();
					} else if (type === 'function') {
						value = (isList ? prop.value : [prop.value]).map(function(v) {
							return {
								field : (columns[v.field]||{}).name,
								type : v.type
							};
						}).compact();
					} else {
						value = isList ? [prop.value] : prop.value;
					}
					stencil[prop.key].value = value;
				}
			});

			if (p.value.type === 'TableLoad') {
				var selTable = tables.find(function(table) {return table.name === p.value.filename});
				if (selTable) {
					selTable.columns.each(function(availableColumn) {
						// if not already selected, add the column from the selected table to the list of all columns
						if (!columns.any(function(col) { return col.name === availableColumn.name; })) {
							columns.push(availableColumn);
						}
					});
				}
			}

			// stencil = JSON.stringify(stencil, null, 4);

			myState.addShape(new C.CanvasNode(
			// console.log(
				getX(p),
				getY(p),
				undefined, undefined,
				p.value.type,
				stencil,
				myState,
				p.key
			));
		});

		obj.edges.each(function(edge) {
			myState.addEdge(new C.CanvasEdge(
			// console.log(
				myState.shapes.find(function(shape) {
					return shape.id === edge[0];
				}),
				myState.shapes.find(function(shape) {
					return shape.id === edge[1];
				}),
				myState
			));
		});
	}

	// Creates an object with x and y defined, set to the mouse position relative to the state's canvas
	// If you wanna be super-correct this can be tricky, we have to worry about padding and borders
	CanvasState.prototype.getMouse = function(e) {
		var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
		
		// Compute the total offset
		if (element.offsetParent !== undefined) {
			do {
				offsetX += element.offsetLeft;
				offsetY += element.offsetTop;
			} while ((element = element.offsetParent));
		}

		// Add padding and border style widths to offset
		// Also add the <html> offsets in case there's a position:fixed bar
		offsetX += this.stylePaddingLeft + this.styleBorderLeft + this.htmlLeft;
		offsetY += this.stylePaddingTop + this.styleBorderTop + this.htmlTop;

		mx = e.pageX - offsetX;
		my = e.pageY - offsetY;
		
		// We return a simple javascript object (a hash) with x and y defined
		return {x: mx, y: my};
	}
})();