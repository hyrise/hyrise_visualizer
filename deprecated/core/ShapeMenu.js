var Shapemenu = Class.create(CanvasShape, {
	initialize : function($super) {

		$super.call(this);

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
