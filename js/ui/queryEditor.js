(function() {
	var stencils,
		canvas;

	// Extend the standard ui plugin
	hyryx.editor.QueryEditor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	};

	function registerEvents() {
		stencils.on("initDragDrop", function(){
			canvas.initDragDrop("#frame_queryEditor");
		});
	}

	hyryx.editor.QueryEditor.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		render : function(callback) {
			$.get('templates/queryEditor.mst', function(template) {
				var rendered = $(Mustache.render(template, {
					width_stencils: 3,
					width_canvas: 9
				}));

				stencils = new hyryx.debug.Stencils(rendered.find('#frame_stencils'));
				canvas = new hyryx.debug.Canvas(rendered.find('#frame_canvas'), {
					showTitlebar: true,
					showExecuteButton: false
				});

				registerEvents();
				callback(rendered);
			});
		},

		init : function() {
			this.registerEvents();
		},

		registerEvents : function() {
			var self = this;
			$('button#hideQueryEditor').click(function() {
				canvas.storeJsonInMarker();
				self.emit('hideQueryEditor');
			});
			$('button#revertQueryPlan').click(function() {
				canvas.revertToInitialQueryPlan();
			});
		},

		handleEvent : function(event) {
			canvas.handleEvent(event);
		}
	});
})();
