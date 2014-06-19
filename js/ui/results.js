(function() {
	hyryx.explorer.Data = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
		var self = this;
		$.get('templates/queryResultTable.mst', function(template) {
			self.tableTemplate = template;
		});
	};

	hyryx.explorer.Data.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {

		render: function(callback) {
			var self = this;

			this.id = hyryx.utils.getID('Data');


			$.get('templates/queryResults.mst', function(template) {
				var rendered = Mustache.render(template, {
					id: self.id
				});
				callback($(rendered));
			});
		},

		renderTable: function(data) {
			return Mustache.render(this.tableTemplate, {
				header: data.header,
				rows: data.rows,
				no_content: (data.rows.length === 0),
				column_count: data.header.length
			});
		},

		handleEvent : function(event) {
			if (event.type === "reload") {
				this.reload(event.options);
			}
		},

		reload : function(queryResult) {
			// load the simple data table on bottom of page
			var container = queryResult.all ? $('.data').parent() : this.el;

			container.removeClass('hide');
			container.find('table').html(
				this.renderTable(queryResult.data)
			);
		}
	});
})();

