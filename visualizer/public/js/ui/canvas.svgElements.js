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

		hyryx.debug.Canvas.Node = function() {
			hyryx.screen.AbstractCanvasPlugin.apply(this, arguments);
		}

		hyryx.debug.Canvas.Node.prototype = extend(hyryx.screen.AbstractCanvasPlugin, {
			init : function(position, type, edges, data, id) {
				
				this.type = type || '';

				this._position = position;

				this.edges = (edges||[]).map(function(d){ return d; });

				$.each((hyryx.stencils[type]||{}), function(key, value) {
					if (key === 'type') { return; }

					// get properties defined in the stencil
					this[key] = data && data[key] || value.value;
				}.bind(this));

				// this = $.extend(true, this, (data||hyryx.stencils[type]||{}));
				// console.log(this.data)

				if (id) {
					this.id = id;
				}
				return this;
			},

			getPosition : function() {
				return this._position;
			},

			setPosition : function(x, y) {
				return this._position = [+x, +y];
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
