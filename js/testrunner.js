var hyryx = {
	settings	: {},
	images		: {},
	stencils	: {}
};

window.addEventListener('load', function() {

	Modernizr.load([{
		load : [
			// load mocha
			'third-party/mocha/mocha.js',
			'third-party/mocha/mocha.css',
			'third-party/mocha/chai.js',
		],
		complete : function() {
			// init mocha
			mocha.setup('bdd');
			mocha.globals(['$', 'jQuery']);
		}
	},{
		load : [
			// load application libraries
			'js/libs/jquery.js',
			'js/libs/jquery-ui.js',
			'js/libs/bootstrap.js',
			'js/libs/highcharts.js',
			'js/libs/d3.v3.js',

			// load application code
			'js/extensions.js',
			'js/utils.js',
			
			'js/screen.AbstractUIPlugin.js',
			'js/screen.explorer.js',
			'js/screen.explorer.Attributes.js',
			'js/screen.explorer.Graph.js',
			'js/screen.explorer.Data.js',

			'js/screen.debug.js',
			'js/screen.debug.Stencils.js',
			'js/screen.debug.CanvasSVG.js',
			'js/screen/debug.CanvasSVGPlugins.js',

			// load tests
			'test/test.utils.getID.js',
			'test/test.explorer.js',
			'test/test.debug.js'			
		],
		complete : function() {
			if (window.mochaPhantomJS) {
				mochaPhantomJS.run();
			}
			else {
				mocha.run();
			}
		}
	}]);
});