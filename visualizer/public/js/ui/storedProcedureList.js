(function() {
	hyryx.editor.StoredProcedureList = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	}

	hyryx.editor.StoredProcedureList.prototype = extend(hyryx.screen.AbstractUIPlugin, {
		id: hyryx.utils.getID('StoredProcedureList'),
		frame: $('<div class="col-md-' + 2 + '"></div>'),

		render: function() {
			var self = this;
			$.get('js/templates/storedProcedureList.mst', function(template) {
				var rendered = Mustache.render(template, {
					id: self.id
				});
				self.frame.append(rendered);
				self.frame.on("click", "a.list-group-item", function () {
					alert($(this).data('content'));
				})
			});
			this.targetEl.append(this.frame);
			return this.frame;
		},

		init: function() {
			$.getJSON('procedures.json', this.updateProcedureList);
		},

		updateProcedureList: function(data) {
			$('.storedProcedureList .list').html('');

			$.get('js/templates/storedProcedureList_content.mst', function(template) {
				var rendered = Mustache.render(template, {
					header: 'Operations',
					parent: 'storedProcedureList',
					procedures: data.procedures
				});
				$('.storedProcedureList .list').append(rendered);
				$('.storedProcedureList .list .collapse.panel-collapse:first').addClass('in');
			});
		}
	});
})();
