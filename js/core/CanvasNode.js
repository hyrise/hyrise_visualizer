var CanvasNode = Class.create(CanvasShape, {
	initialize : function($super, x, y, w, h, type, data, canvas, _id) {
	
		$super.call(this);
		
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