(function() {

	// Extend the standard ui plugin
	hyryx.editor.ProcedureEditor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	}

	hyryx.editor.ProcedureEditor.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		render : function(callback) {
			$.get('templates/procedureEditor.mst', function(template) {
				var rendered = $(Mustache.render(template, {
					width_storedProcedureList: 3,
					width_editor: 9
				}));

				eventHandlers = {
					'storedProcedureList': new hyryx.editor.StoredProcedureList(rendered.find('#frame_storedProcedureList')),
					'editor': new hyryx.editor.JSEditor(rendered.find('#frame_editor')),
				};

				callback(rendered);
			});
		},

		init : function() {},

		handleEvent : function(event) {}
	});
})();