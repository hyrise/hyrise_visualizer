// BASIC CANVAS ELEMENT

(function() {
	if ('undefined' === typeof hyryx.screen) {
		hyryx.screen = {};
	}

	hyryx.screen.AbstractCanvasPlugin = function() {	
		this.id = hyryx.utils.getID('Object');

		this.init.apply(this, arguments);

		return this;
	}

	hyryx.screen.AbstractCanvasPlugin.prototype = {

		init : function() {
			console.log('apply abstract canvas plugin logic');
		}
	}
})();

// CANVAS SHAPE ELEMENT

(function() {
	hyryx.debug.Canvas.CanvasShape = function() {
		hyryx.screen.AbstractCanvasPlugin.apply(this, arguments);
	}
	
	hyryx.debug.Canvas.CanvasShape.prototype = extend(hyryx.screen.AbstractCanvasPlugin, {
		init : function(x, y, w, h) {

			// This is a very simple and unsafe constructor. All we're doing is checking if the values exist.
			// "x || 0" just means "if there is a value for x, use that. Otherwise use 0."
			// But we aren't checking anything else! We could put "Lalala" for the value of x 
			this.x = x || 0;
			this.y = y || 0;
			this.w = w || 50;
			this.h = h || 50;
			this.fill = 'gray';
		},

		center : function() {
			return {
				x : this.x + this.w/2,
				y : this.y + this.h/2
			}
		},

		draw : function(ctx) {
			ctx.strokeStyle = this.fill;
			ctx.strokeRect(this.x, this.y, this.w, this.h);
		},

		contains : function(mx, my) {
			return  (this.x <= mx) && (this.x + this.w >= mx) &&
		          (this.y <= my) && (this.y + this.h >= my);
		}
	});
})();

// CANVAS NODE ELEMENT

(function() {
	hyryx.debug.Canvas.CanvasNode = function() {
		hyryx.debug.Canvas.CanvasShape.apply(this, arguments);
	}

	hyryx.debug.Canvas.CanvasNode.prototype = extend(hyryx.debug.Canvas.CanvasShape, {
		init : function(x, y, w, h, type, data, canvas, _id) {
		
			this.canvas = canvas;

			this.x = x - 100 || 0;
			this.y = y - 8 || 0;
			this.w = w || 200;
			this.h = h || 32;

		  this.type = type;
		  this.data = data;

		  if (_id) {
		  	this.id = _id;
		  }
		  
		  this.stroke = '#AAAAAA';
		  this.fill = 'white';
		},

		draw : function(ctx, isSelected) {
		  ctx.fillStyle = this.fill;
			ctx.strokeStyle = !isSelected ? this.stroke : 'red';
			
			ctx.fillRect(this.x, this.y, this.w, this.h);
			ctx.strokeRect(this.x, this.y, this.w, this.h);
			ctx.fillStyle = 'black';
			ctx.font = '14px sans-serif';
			var v = /*this.data.table.value ||*/ this.type;
			ctx.fillText(v, this.x+10, this.y+this.h*.7);
		},

		remove : function() {
			var id = this.id;
			this.canvas.edges.findAll(function(edge) {
				return edge.start.id === id || edge.end.id === id;
			}).invoke('remove');

			this.canvas.remove(this);
		}
	});
})();

// CANVAS EDGE ELEMENT

(function() {
	hyryx.debug.Canvas.CanvasEdge = function() {
		hyryx.screen.AbstractCanvasPlugin.apply(this, arguments);
	}

	hyryx.debug.Canvas.CanvasEdge.prototype = extend(hyryx.screen.AbstractCanvasPlugin, {
		init : function(start, end, canvas) {

			this.canvas = canvas;

			this.start = start;
			this.end = end;
			this.stroke = '#444444';
		},

		draw : function(ctx) {
			ctx.strokeStyle = this.stroke;
	  	ctx.beginPath();
		  
		  ctx.moveTo(this.start.center().x, this.start.center().y);
		  ctx.lineTo(this.end.center().x, this.end.center().y);

		  ctx.stroke();
		},

		remove : function() {
			this.canvas.remove(this);
		}
	});
})();

// CANVAS SHAPE: SHAPEMENU

(function() {
	hyryx.debug.Canvas.Shapemenu = function() {
		hyryx.debug.Canvas.CanvasShape.apply(this, arguments);
	};

	hyryx.debug.Canvas.Shapemenu.prototype = extend(hyryx.debug.Canvas.CanvasShape, {
		init : function() {
			this.w = 32;
			this.h = 32;
			this.shape = null;
			this.stroke = '#444444';
		},

		putOn : function(shape) {
			this.shape = shape;
			this.x = shape.x + shape.w + 10;
			this.y = shape.y;
		},

		clear : function() {
			this.shape = null;
			this.x = 0;
			this.y = 0;
		},

		isVisible : function() {
			return !!this.shape;
		},

		draw : function(ctx) {

			ctx.strokeStyle = this.stroke;

			this.x = this.shape.x + this.shape.w + 10;
			this.y = this.shape.y;
			
			ctx.fillStyle = 'white';
			ctx.fillRect(this.x, this.y, this.w, this.h);
			ctx.strokeRect(this.x, this.y, this.w, this.h);

			ctx.beginPath();
		  ctx.moveTo(this.x + 5, this.y + this.h - 5);
		  ctx.lineTo(this.x + this.w - 5, this.y + 5);
		  ctx.lineWidth = 2;
		  ctx.stroke();
		  ctx.lineWidth = 1;
		}
	});
})();
