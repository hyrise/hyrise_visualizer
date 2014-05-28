(function() {
	hyryx.editor.StoredProcedureList = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	}

	hyryx.editor.StoredProcedureList.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		id: hyryx.utils.getID('StoredProcedureList'),

		render: function(callback) {
			var self = this;
			$.get('js/templates/storedProcedureList.mst', function(template) {
				var rendered = Mustache.render(template, {
					id: self.id
				});
				callback(rendered)
			});
		},

		init: function() {
			$.getJSON('procedures.json', this.updateProcedureList);
			this.registerEvents();
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
		},

		registerEvents: function() {
			this.targetEl.on("click", "a.list-group-item", function() {
				hyryx.editor.dispatch({
					type: 'editor.load',
					options: {
						data: $(this).data('content')
					}
				});
			});
		}
	});
})();