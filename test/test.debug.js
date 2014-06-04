var assert = chai.assert;

describe('debug', function() {
	var debug = hyryx.debug;

	it('should have a setup method', function() {
		assert.isFunction(debug.setup);
	});

	it('should have an event dispatcher', function() {
		assert.isFunction(debug.dispatch);
	});

	describe('Stencils', function() {
		var proto = debug.Stencils.prototype;

		it('should have an init method', function() {
			assert.isFunction(proto.init);
		});

		it('should have a render method', function() {
			assert.isFunction(proto.render);
		});


		var i = new debug.Stencils();
		it('creating an instance requires a rendering target', function() {

			assert.isUndefined(i.targetEl);
		});
		delete i;


		var i2 = new debug.Stencils($('#hidden'));
		it('instances should have a rendering target', function() {
			assert.ok(i2.targetEl);
		});

		it('instances should have a reference to their DOM element', function() {
			assert.ok(i2.el);
		})

		it('instances should have a unique id', function() {
			assert.isString(i2.id);
		});

		it('instances should have the class "stencils"', function() {
			assert.ok($(i2.el).hasClass('stencils'));
		});

		$('#hidden .stencils').remove();
		delete i2;
	});


	describe('Canvas', function() {
		var proto = debug.Canvas.prototype;

		it('should have an init method', function() {
			assert.isFunction(proto.init);
		});

		it('should have a render method', function() {
			assert.isFunction(proto.render);
		});


		var i = new debug.Canvas();
		it('creating an instance requires a rendering target', function() {

			assert.isUndefined(i.targetEl);
		});
		delete i;


		var i2 = new debug.Canvas($('#hidden'));
		it('instances should have a rendering target', function() {
			assert.ok(i2.targetEl);
		});

		it('instances should have a reference to their DOM element', function() {
			assert.ok(i2.el);
		});

		it('instances should have a unique id', function() {
			assert.isString(i2.id);
		});

		it('instances should have the class "canvas"', function() {
			assert.ok($(i2.el).hasClass('canvas'));
		});

		$('#hidden .canvas').remove();
		delete i2;
	});
});