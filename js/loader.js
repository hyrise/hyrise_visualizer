var hyryx = {
	settings	: {},
	images		: {},
	stencils	: {}
};

window.addEventListener('load', function() {

	var hyryxProto = document.getElementById('hyryx-proto'),
		rect = hyryxProto.getBoundingClientRect();

	hyryx.settings.hyryxSize = rect.width;

	Modernizr.addTest('standalone', function() {
		return (window.navigator.standalone != false);
	});

	yepnope.addPrefix('preload', function(resource) {
		resource.noexec = true;
		return resource;
	});

	var numPreload = 0, numLoaded = 0;
	yepnope.addPrefix('loader', function(resource) {
		var isImage = /.+\.(jpg|png|gif)$/i.test(resource.url);
		resource.noexec = isImage;

		++numPreload;
		resource.autoCallback = function(e) {
			++numLoaded;
			if (isImage) {
				var image = new Image();
				image.src = resource.url;
				hyryx.images[resource.url] = image;
			}
		}
		return resource;
	});

	function getLoadProgress() {
		if (numPreload > 0) {
			return numLoaded / numPreload;
		} else {
			return 0;
		}
	}

	// loading stage #1 - EXPLORER PAGE
	Modernizr.load([{
		load : [
			// "js/libs/prototype.js",
			"js/libs/jquery.js",
			"js/libs/jquery-ui.js",
			"js/libs/bootstrap.js",
			"js/libs/highcharts.js",
			"js/libs/d3.v3.js",

			// application code
			'js/extensions.js',
			"js/utils.js",
			'js/commands.js',
			'loader!third-party/prettify/prettify.css'
		]
	},{
		load : [
			"loader!third-party/selectpicker/bootstrap-select.js",
			"loader!third-party/selectpicker/bootstrap-select.css",
			'js/screen.AbstractUIPlugin.js',
			'js/screen.canvas.js',
			'js/screen.json.js',
			'js/screen.explorer.js',
			'js/screen.explorer.Attributes.js',
			'js/screen.explorer.Graph.js',
			'js/screen.explorer.Data.js'
		], //'scripts/screen.setup.js'

		complete : function() {
			hyryx.explorer.setup();
			setTimeout(function(){
				// TODO remove splash screen

				$('body').addClass('onload');
				hyryx.utils.showScreen();
			}, 0);
		}
	}]);

	// loading stage #2 - DEBUG PAGE
	
	Modernizr.load([{
		load : [
			'js/screen.debug.js',
			'js/screen.debug.Stencils.js'
		]
	},{
		test : Modernizr.draganddrop,
		yep : [
			'js/screen.debug.CanvasSVG.js',
			'js/screen.debug.CanvasSVGPlugins.js'
		],
		nope: [
			'js/screen.debug.Canvas.js',
			'js/screen.debug.CanvasPlugins.js'
		],
		complete : function() {
			hyryx.debug.setup();
		}
	}]);
			
}, false);