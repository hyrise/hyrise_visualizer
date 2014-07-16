(function() {

	// Extend the standard ui plugin
	hyryx.editor.ProcedureEditor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	};

	hyryx.editor.ProcedureEditor.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		render : function(callback) {
			var self = this;
			$.get('templates/procedureEditor.mst', function(template) {
				var rendered = $(Mustache.render(template, {
					width_storedProcedureList: 3,
					width_editor: 9
				}));

				self.storedProcedureList = new hyryx.editor.StoredProcedureList(rendered.find('#frame_storedProcedureList'));
				self.jsEditor = new hyryx.editor.JSEditor(rendered.find('#frame_editor'));

				self.registerEvents();

				callback(rendered);
			});
		},

		registerEvents : function () {
			var self = this;
			this.storedProcedureList.on("procedureLoaded", function(source) {
				self.jsEditor.showContent(source);
				self.emit("procedureLoaded", source);
			});
			this.storedProcedureList.on("saveProcedure", this.jsEditor.save.bind(this.jsEditor));
			this.jsEditor.on("procedureSaved", this.storedProcedureList.updateProcedureList.bind(this.storedProcedureList));
			this.jsEditor.on("procedureExecuted", function(results, papi) {
				self.emit("procedureExecuted", results, papi);
			});
			this.jsEditor.on("editJsonQuery", function(widget, query, parameters, performanceData) {
				self.emit("showQueryEditor", widget, query, parameters, performanceData);
			});
		},

		updateQuery : function(query, widget) {
			this.jsEditor.updateWidget(widget, query);
		},

		init : function() {}
	});
})();
