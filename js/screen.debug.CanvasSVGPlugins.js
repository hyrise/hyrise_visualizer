(function() {
	(function() {
		if ('undefined' === typeof hyryx.screen) {
			hyryx.screen = {};
		}

		hyryx.screen.AbstractCanvasPlugin = function() {	
			this.id = hyryx.utils.getID('Object');

			this.init.apply(this, arguments);

			return this;
		}

		hyryx.screen.AbstractUIPlugin.prototype = {

			init : function() {
				console.log('apply abstract canvas plugin logic');
			}
		}
	})();

	/**
	 * Node class
	 */

	(function() {
		var Position = function(position) {

			var pos;

			var valid = function(n) {
				return !!(+n === 0 || +n);
			}

			this.setPosition = function(x, y) {
				if (!x) { return; }

				// parse an array of the format [x, y]
				if (x instanceof Array) {
					y = x[1];
					x = x[0];
				}
				// if position should be set to an object {x:number, y:number}
				else if (x.x && x.y) {
					y = x.y;
					x = x.x;
				}

				// prevent NaN
				if (valid(x) && valid(y)) {
					pos = [+x, +y];
					pos.x = +x;
					pos.y = +y;
				}

				return this.getPosition();
			}

			this.getPosition = function() {
				return pos;
			}

			this.setPosition(position);

			return this;
		}

		hyryx.debug.Canvas.Node = function() {
			hyryx.screen.AbstractCanvasPlugin.apply(this, arguments);
		}

		hyryx.debug.Canvas.Node.prototype = extend(hyryx.screen.AbstractCanvasPlugin, {
			init : function(position, name, edges, id) {
				
				this.label = name || '';

				this.position = new Position(position);

				this.edges = (edges||[]).map(function(d){ return d; });

				if (id) {
					this.id = id;
				}
				return this;
			},

			getPosition : function() {
				return this.position.getPosition();
			},

			setPosition : function(x, y) {
				return this.position.setPosition(x, y);
			}
		});
	})();

	/**
	 * Edge class
	 */

	(function() {
		hyryx.debug.Canvas.Edge = function() {
			hyryx.screen.AbstractCanvasPlugin.apply(this, arguments);
		}

		hyryx.debug.Canvas.Edge.prototype = extend(hyryx.screen.AbstractCanvasPlugin, {
			init : function(target, points) {
				this.target = target;
				this.points = [];
				// ** enable the next line to add midpoints **
				// this.points = [].concat(points||[]);
			}
		});
	})();

	(function() {
		hyryx.debug.Canvas.Point = function() {
			hyryx.screen.AbstractCanvasPlugin.apply(this, arguments);
		}

		hyryx.debug.Canvas.Point.prototype = extend(hyryx.screen.AbstractCanvasPlugin, {
			init : function(x, y) {
				this.x = x;
				this.y = y;
			}
		});
	})();
})();
