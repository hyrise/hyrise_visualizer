var CanvasEdge = Class.create(CanvasElement, {
	initialize : function($super, start, end, canvas) {
	
		$super.call(this);
		
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