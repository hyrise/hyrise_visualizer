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
			$('.storedProcedureList .list').html('');

			$.get('templates/storedProcedureList_content.mst', function(template) {
				hyryx.ProcedureStore.get().done(function(procedures) {
					var rendered = Mustache.render(template, {
						procedures: procedures
					});
					$('.storedProcedureList .list').html(rendered);
				});
			});
		},

		saveProcedure: function(procedureName) {
			if(!procedureName || procedureName === "") {
				// TODO: check if we would overwrite other procedure!
				console.log("cannot save with empty name!");
				return;
			}

			var self = this;

			hyryx.editor.dispatch({
				type: 'editor.save',
				options: {
					generation: this.save_generation,
					callback: function(currentSource) {
						if(!currentSource) {
							console.log("no need to save - source didn't changed");
							return;
						}

						this.save_generation = currentSource.generation;
						hyryx.ProcedureStore.create(
							procedureName,
							currentSource.source
						).done(function() {
							console.log("success! procedure saved!");
						}).fail(function(jqXHR, textStatus, errorThrown) {
							console.log("Couldn't save procedure: " + textStatus + ", " + errorThrown);
						}).always(self.updateProcedureList);
					}
				}
			});
		},

		registerEvents: function() {
			var self = this;

			this.targetEl.on("click", "a.list-group-item", function() {
				hyryx.editor.dispatch({
					type: 'editor.load',
					options: {
						data: $(this).data('content')
					}
				});
			});

			this.targetEl.on("click", "button", function() {
				self.saveProcedure(
					self.targetEl.find("input")[0].value
				);
			});
		}
	});
})();
