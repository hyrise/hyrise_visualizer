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

			this.targetEl.on("click", "button", function() {
				self.saveProcedure(
					self.targetEl.find("input")[0].value
				);
			});
		},

		loadStoredProcedure: function(procedureName) {
			var self = this;
			//TODO: test if there are unsaved changes in currently open procedure
			hyryx.ProcedureStore.get(procedureName).done(function(source) {
				self.targetEl.find("input")[0].value = procedureName;
				self.emit("procedureLoaded", source);
			}).fail(function(jqXHR, textStatus, errorThrown ) {
				hyryx.Alerts.addWarning("Couldn't load procedure", textStatus + ", " + errorThrown);
				console.log("Couldn't load jsprocedure: " + textStatus + errorThrown);
			});
		}
	});
})();
