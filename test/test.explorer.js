var assert = chai.assert;

describe('explorer', function() {
	var explorer = hyryx.explorer;

	it('should have a setup method', function() {
		assert.isFunction(explorer.setup);
	});

	it('should have an event dispatcher', function() {
		assert.isFunction(explorer.dispatch);
	});

	it('should have a public method to load attributes', function() {
		assert.isFunction(explorer.loadAttributes);
	});

	it('should have a public method to load tables', function() {
		assert.isFunction(explorer.loadTable);
	});

	// it('should not offer the data containers (Attributes, Graph, Data)', function() {
	// 	assert.isUndefined(window.Attributes, 'Attributes are accessible');
	// 	assert.isUndefined(window.Graph, 'Graph are accessible');
	// 	assert.isUndefined(window.Data, 'Data are accessible');
	// });

	describe('Attributes', function() {
		var proto = explorer.Attributes.prototype;

		it('should have an init method', function() {
			assert.isFunction(proto.init);
		});

		it('should have a render method', function() {
			assert.isFunction(proto.render);
		});


		var i = new explorer.Attributes();
		it('creating an instance requires a rendering target', function() {

			assert.isUndefined(i.targetEl);
		});
		delete i;


		var i2 = new explorer.Attributes($('#hidden'));
		it('instances should have a rendering target', function() {
			assert.ok(i2.targetEl);
		});

		it('instances should have a reference to their DOM element', function() {
			assert.ok(i2.el);
		})

		it('instances should have a unique id', function() {
			assert.isString(i2.id);
		});

		it('instances should have the class "attributes"', function() {
			assert.ok($(i2.el).hasClass('attributes'));
		});

		$('.attributes').remove();
		delete i2;
	});

	describe('Graph', function() {
		var proto = explorer.Graph.prototype;

		it('should have an init method', function() {
			assert.isFunction(proto.init);
		});

		it('should have a render method', function() {
			assert.isFunction(proto.render);
		});


		var i = new explorer.Graph();
		it('creating an instance requires a rendering target', function() {
			assert.isUndefined(i.targetEl);
		});
		delete i;


		var i2 = new explorer.Graph($('#hidden'));
		it('instances should have a rendering target', function() {
			assert.ok(i2.targetEl);
		});

		it('instances should have a reference to their DOM element', function() {
			assert.ok(i2.el);
		})

		it('instances should have a unique id', function() {
			assert.isString(i2.id);
		});

		it('instances should have the class "graph"', function() {
			assert.ok($(i2.el).hasClass('graph'));
		});

		$('.graph').remove();
		delete i2;

	});

	describe('Data', function() {
		var proto = explorer.Data.prototype;

		it('should have an init method', function() {
			assert.isFunction(proto.init);
		});

		it('should have a render method', function() {
			assert.isFunction(proto.render);
		});
		

		var i = new explorer.Data();
		it('creating an instance requires a rendering target', function() {
			assert.isUndefined(i.targetEl);
		});
		delete i;


		var i2 = new explorer.Data($('#hidden'));
		it('instances should have a rendering target', function() {
			assert.ok(i2.targetEl);
		});

		it('instances should have a reference to their DOM element', function() {
			assert.ok(i2.el);
		})

		it('instances should have a unique id', function() {
			assert.isString(i2.id);
		});

		it('instances should have the class "data"', function() {
			assert.ok($(i2.el).hasClass('data'));
		});

		$('.data').remove();
		delete i2;

	});
});