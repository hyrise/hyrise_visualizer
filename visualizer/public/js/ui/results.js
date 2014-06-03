(function() {
	hyryx.explorer.Data = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	};

	hyryx.explorer.Data.prototype = extend(hyryx.screen.AbstractUIPlugin, {

		render: function() {

			this.table = this.createDataContainerMarkup();
			return this.table;
		},

		createDataContainerMarkup : function() {
			this.id = hyryx.utils.getID('Data');
			var frame = $('<div class="area_frame"></div>').appendTo(this.targetEl);
			var $div = jQuery('<div class="data" id="'+this.id+'"><h3>Retrieved Data</h3></div>');
			jQuery('<table width="100%" class="table table-condensed table-striped table-responsive"></table>').appendTo($div);
			$div.appendTo(frame);

			return $div;
		},

		handleEvent : function(event) {
			if (event.type === "reload") {
				this.reload(event.options);
			}
		},

		reload : function(options) {
			var container = this.table.find('table');
			if (options.all) {
				container = $('.data table');
			}
			var json = options.data;

			// load the simple data table on bottom of page
			container.children().each(function(){
				$(this).remove();
			});

			var headers = '<thead><tr>';

			if (json.header && json.rows) {
				headers += '<th>' + json.header.join('</th><th>') + '</th>';

				headers += '</tr></thead>';
				container.append(headers);

				var body = '<tbody>';
				body += '<tr>' + json.rows.map(function(row) {
						return '<td>' + row.join('</td><td>') + '</td>';
				}).join('</tr><tr>') + '</tr></tbody>';

				container.append(body);

			}
		}
	});
})();

