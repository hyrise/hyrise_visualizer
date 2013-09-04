var CanvasShape = Class.create(CanvasElement, {
	initialize : function($super, x, y, w, h) {

		$super.call(this);

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