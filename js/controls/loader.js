var hyryx = {
	images		: {},
	stencils	: {}
};

window.addEventListener('load', function() {

	var hyryxProto = document.getElementById('hyryx-proto'),
		rect = hyryxProto.getBoundingClientRect();

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

	// loading stage #1
	Modernizr.load([{
		load : [

			// LIBS
			"js/libs/jquery.js",
			"js/libs/jquery-ui.js",
			"js/libs/bootstrap.js",
			"js/libs/highcharts.js",
			"js/libs/d3.v3.js",
			"js/libs/mustache.js"
		],

		// load server config
		complete : function() {
			d3.json('config.json', function(error, result) {
				if (error) {
					console.log(error);
					alert('Could not load server configuration');
				} else {
					hyryx.settings = result;
				}
			});

			$('#tag a').on('click', function(event) {
				event.preventDefault();
				console.log('link clicked')
				var $target = $(event.target);

				$('#tag a').removeClass('active');
            	$target.addClass('active');

				window.location.hash = $target.attr('href').split('#page-')[1];
			});

			// disable hash change events for now until a proper navigation is implemented to prevent double page events
			// $(window).on('hashchange', function(event) {
			// 	console.log('hashchange')
			// 	var hash = (window.location.hash||'').trim().split('#')[1];
			// 	if (hash) {
			// 		hyryx.utils.showScreen(hash);
			// 	}
			// });

		}
	},{
		load : [

			// HELPERS
			'js/helpers/extensions.js',
			'js/helpers/utils.js',
			'js/helpers/database.js',
			'js/helpers/procedureStore.js',
			'js/helpers/alerts.js',

			// CONTROLS
			'js/controls/commands.js',

			// THIRD-PARTY
			'loader!third-party/codemirror/lib/codemirror.js',
			'loader!third-party/codemirror/lib/codemirror.css',
			'loader!third-party/codemirror/custom.css',
			'loader!third-party/codemirror/mode.javascript.js',

			'loader!third-party/codemirror/addons/lint/jshint-2.1.11.js',
			'loader!third-party/codemirror/addons/lint/jsonlint.js',
			'loader!third-party/codemirror/addons/lint/lint.js',
			'loader!third-party/codemirror/addons/lint/lint.css',
			'loader!third-party/codemirror/addons/lint/javascript-lint.js',
			'loader!third-party/codemirror/addons/lint/json-lint.js',

			"loader!third-party/selectpicker/bootstrap-select.js",
			"loader!third-party/selectpicker/bootstrap-select.css",

			// TIPSY
			"loader!third-party/tipsy/tipsy.js",
			"loader!third-party/tipsy/tipsy.css",

			// APPLICATION CODE

			'js/pages/1-explore.js',
			'js/pages/2-debug.js',
			'js/pages/4-editor.js',


			'js/ui/abstractPlugin.js',
			'js/ui/abstractTemplatePlugin.js',
			'js/ui/popover.js'
		]
	},{
		load : [
			// page 1 components
			'js/ui/tables.js',
			'js/ui/graph.js',
			'js/ui/results.js'
		],

		complete : function() {
			hyryx.explorer.setup();
			setTimeout(function(){
				// TODO remove splash screen

				$('body').addClass('onload');
				hyryx.utils.showScreen();
			}, 0);
		}
	}]);

	// loading stage #2
	Modernizr.load([{
		load : [
			// page 2 components
			'js/ui/stencils.js',
			'js/ui/canvas.js',
			'js/ui/canvas.svg.js',
			'js/ui/canvas.svgElements.js',
			'js/ui/canvas.json.js',
			'js/ui/attributes.js',
			'js/ui/resultPreview.js'
		],
		complete : function() {
			hyryx.debug.setup();
		}
	}]);

    // loading stage #4
    Modernizr.load([{
        load : [
            // page 4 components
            'js/ui/storedProcedureList.js',
            'js/ui/editor.js',
            'js/ui/procedureResults.js'
        ],
        complete : function() {
            hyryx.editor.setup();
        }
    }]);
}, false);
