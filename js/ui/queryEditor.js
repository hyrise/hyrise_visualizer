(function() {

	// Extend the standard ui plugin
	hyryx.editor.QueryEditor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	}

	hyryx.editor.QueryEditor.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		render : function(callback) {
			$.get('templates/queryEditor.mst', function(template) {
				var rendered = $(Mustache.render(template, {
					width_stencils: 3,
					width_canvas: 9
				}));

				eventHandlers = {
					'stencils': new hyryx.debug.Stencils(rendered.find('#frame_stencils')),
					'canvas': new hyryx.debug.Canvas(rendered.find('#frame_canvas')),
				};

				callback(rendered);
			});
		},

		init : function() {},

		handleEvent : function(event) {}
	});
})();