(function() {
	hyryx.editor.ProcedureResults = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	};

	hyryx.editor.ProcedureResults.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		id: hyryx.utils.getID('ProcedureResults'),

		render: function(callback) {
			this.frame = $('<div class="procedureResults"></div>');
			callback(this.frame);
		},

		init: function() {},

		handleEvent: function(event) {
			if (event.type === "show") {
				this.showResults(event.options.data);
			} else if (event.type === "clear") {
				this.clearResults();
			}
		},

		showResults: function(data) {
			var self = this;
			data.joinedRows = function () {
				return function (text, render) {
					return "<tr><td>" + render(text).split(",").join("</td><td>") + "</td></tr>";
				}
			};
			$.each(data.performanceData, function(idx, perfData) {
				perfData.index = idx;
			});
			$.get('templates/procedureResults.mst', function(template) {
				var rendered = Mustache.render(template, data);
				self.frame.html(rendered);
			});
		},

		clearResults: function() {
			this.frame.html('');
		}
	});
})();
