(function() {

	// Extend the standard ui plugin
	hyryx.editor.IDE = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	};

	hyryx.editor.IDE.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		render : function(callback) {
			var self = this;
			$.get('templates/ide.mst', function(template) {
				var rendered = $(Mustache.render(template, {
					width_procedureEditor: 12,
					width_queryEditor: 12
				}));

				self.screens.procedureEditor = new hyryx.editor.ProcedureEditor(rendered.find('#frame_procedureEditor'));
				self.screens.queryEditor = new hyryx.editor.QueryEditor(rendered.find('#frame_queryEditor'));
				self.activeScreen =  self.screens.procedureEditor;

				self.registerEvents();
				callback(rendered);
			});
		},

		registerEvents : function () {
			var self = this;
			this.screens.procedureEditor.on("procedure*", function(eventName, data, data2) {
				self.emit(eventName, data, data2);
			});

			this.screens.procedureEditor.on('showQueryEditor', function(widget, query, parameters, performanceData) {
				self.screens.queryEditor.loadPlan(query, parameters, widget, performanceData);
				$('#frame_queryEditor').removeClass('hideQueryEditor');
			});

			this.screens.queryEditor.on('queryEdited', function(query, widget) {
				$('#frame_queryEditor').addClass('hideQueryEditor');
				self.screens.procedureEditor.updateQuery(query, widget);
			});
		},

		init : function() {}
	});
})();
