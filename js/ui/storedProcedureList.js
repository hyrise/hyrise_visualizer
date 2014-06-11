(function() {
	hyryx.editor.StoredProcedureList = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	};

	hyryx.editor.StoredProcedureList.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		id: hyryx.utils.getID('StoredProcedureList'),
		save_generation: 0,	// used to check if source changed since last saving

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

			hyryx.editor.dispatch({
				type: 'editor.save',
				options: {
					generation: this.save_generation,
					callback: function(currentSource) {
						if(!currentSource) {
							console.log("no need to save - source didn't changed");
							hyryx.Alerts.addInfo("Procedure was not modified since last save.");
							return;
						}

						self.save_generation = currentSource.generation;
						hyryx.ProcedureStore.create(
							procedureName,
							currentSource.source
						).done(function() {
							console.log("success! procedure saved!");
							hyryx.Alerts.addSuccess("Procedure successfully saved!");
						}).fail(function(jqXHR, textStatus, errorThrown) {
							console.log("Couldn't save procedure: " + textStatus + ", " + errorThrown);
							hyryx.Alerts.addDanger("Couldn't save procedure", textStatus + ", " + errorThrown);
						}).always(self.updateProcedureList);
					}
				}
			});
		},

		registerEvents: function() {
			var self = this;
			this.targetEl.on("click", "a.list-group-item", function() {
				self.loadStoredProcedure.call(self, $(this).data('name'));
				hyryx.editor.dispatch('procedureResults.clear');
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
				hyryx.editor.dispatch({
					type: 'editor.show',
					options: {
						data: source
					}
				});
			}).fail(function(jqXHR, textStatus, errorThrown ) {
				hyryx.Alerts.addWarning("Couldn't load procedure", textStatus + ", " + errorThrown);
				console.log("Couldn't load jsprocedure: " + textStatus + errorThrown);
			});
		}
	});
})();
