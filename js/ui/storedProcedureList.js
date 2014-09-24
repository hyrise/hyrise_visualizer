(function() {
	hyryx.editor.StoredProcedureList = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	};

	hyryx.editor.StoredProcedureList.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		id: hyryx.utils.getID('StoredProcedureList'),

		render: function(callback) {
			var self = this;
			$.get('templates/storedProcedureList.mst', function(template) {
				var rendered = Mustache.render(template, {
					id: self.id
				});
				callback(rendered);
			});
		},

		init: function() {
			this.updateProcedureList();
			this.registerEvents();
		},

		updateProcedureList: function() {
			$('.storedProcedureList .item-list').html('');

			$.get('templates/storedProcedureList_content.mst', function(template) {
				hyryx.ProcedureStore.get().done(function(procedures) {
					var rendered = Mustache.render(template, {
						procedures: procedures
					});
					$('.storedProcedureList .item-list').html(rendered);
				});
			});
		},

		saveProcedure: function(procedureName) {
			if(!procedureName || procedureName === "") {
				console.log("cannot save with empty name!");
				hyryx.Alerts.addWarning("Please enter a name for the procedure!");
				return;
			}
			// TODO: check if we would overwrite other procedure!

			var self = this;

			this.emit("saveProcedure", procedureName);
		},

		registerEvents: function() {
			var self = this;
			this.targetEl.on("click", "a.list-group-item", function() {
				self.loadStoredProcedure.call(self, $(this).data('name'));
			});

			this.targetEl.on("click", "button.save", function() {
				self.saveProcedure(
					self.targetEl.find("input")[0].value
				);
			});

			this.targetEl.on("click", "a.list-group-item button.remove", function() {
				var procedureName = $(this).parent().data('name');
				if (confirm("Delete procedure " + procedureName + "?")) {
					self.deleteProcedure.call(self, $(this).parent());
				}
				return false;
			});
		},

		loadStoredProcedure: function(procedureName) {
			var self = this;
			//TODO: test if there are unsaved changes in currently open procedure
			hyryx.ProcedureStore.get(procedureName).done(function(source) {
				self.targetEl.find("input")[0].value = procedureName;
				self.emit("procedureLoaded", source);
			}).fail(function(jqXHR, textStatus, errorThrown) {
				hyryx.Alerts.addWarning("Couldn't load procedure", textStatus + ", " + errorThrown);
				console.log("Couldn't load jsprocedure: " + textStatus + errorThrown);
			});
		},

		deleteProcedure: function(entry) {
			var self = this;
			var procedureName = entry.data('name');
			hyryx.ProcedureStore.delete(procedureName).done(function() {
				hyryx.Alerts.addSuccess("Procedure successfully deleted!");
				console.log("Procedure successfully deleted");
				self.updateProcedureList();
			}).fail(function(jqXHR, textStatus, errorThrown) {
				hyryx.Alerts.addWarning("Couldn't delete procedure", textStatus + ", " + errorThrown);
				console.log("Couldn't delete jsprocedure: " + textStatus + errorThrown);
			})
		}
	});
})();
