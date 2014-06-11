(function() {
	// Extend the standard ui plugin
	hyryx.editor.JSEditor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);

		this.customAutoCompletes = [{
			text: 'JSON',
			displayText: 'JSON object',
			className: 'interactiveJSON'
		}];
	};

	hyryx.editor.JSEditor.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		id: hyryx.utils.getID('Editor'),
		saveGeneration: 0,

		/** Create a container for a SVG canvas and a container for the text editor */
		render: function(callback) {
			var self = this;
			$.get('templates/jsEditor.mst', function(template) {
				var rendered = Mustache.render(template, {
					id: self.id,
					submitbutton: true
				});
				callback(rendered);
			});
		},

		/** Instantiate the Canvas and add the editor for the JSON representation */
		init: function() {
			this.registerEditor();
			this.registerEvents();
			this.registerCustomAutoCompletes();
		},

		/** Make certain functions accessible for other plugins */
		handleEvent: function(event) {
			if (event.type === "show") {
				this.showContent(event.options.data);
			} else if (event.type === "save") {
				event.options.callback(
					this.getCurrentSource(event.options.generation)
				);
			}
		},

		getCurrentSource: function(generation) {
			// returns current content of the editor
			// if generation is given:
			//	- checks if content changed since then and return false if not
			//  - otherwise change generation and return new one
			var result = {};

			if (generation !== undefined) {
				if (this.editor.isClean(generation)) {
					return false;
				} else {
					result.generation = this.editor.changeGeneration();
				}
			}
			result.source = this.editor.getValue();
			return result;
		},

		save: function(procedureName) {
			var currentSource = this.getCurrentSource(this.saveGeneration);

			if(!currentSource) {
				console.log("no need to save - source didn't changed");
				hyryx.Alerts.addInfo("Procedure was not modified since last save.");
				return;
			}

			this.saveGeneration = currentSource.generation;

			var self = this;
			hyryx.ProcedureStore.create(
				procedureName,
				currentSource.source
			).done(function() {
				console.log("success! procedure saved!");
				hyryx.Alerts.addSuccess("Procedure successfully saved!");
			}).fail(function(jqXHR, textStatus, errorThrown) {
				console.log("Couldn't save procedure: " + textStatus + ", " + errorThrown);
				hyryx.Alerts.addDanger("Couldn't save procedure", textStatus + ", " + errorThrown);
			}).always(function() {
				self.emit("procedureSaved", arguments);
			});
		},

		execute: function() {
			console.log("Execute stored procedure...");
			var current = this.getCurrentSource(this.generation);
			if (current) {
				this.generation = current.generation;
				hyryx.ProcedureStore.executeSource(current.source).done(function(data) {
					if (data.error) {
						hyryx.Alerts.addWarning("Error while executing procedure", data.error);
						console.error("Error executing procedure:" + data.error);
					} else {
						hyryx.Alerts.addSuccess("Procedure executed");
						console.log(data);

						hyryx.editor.dispatch({
							type : 'procedureResults.show',
							options : {
								data : data
							}
						});
					}
				}).fail(function(jqXHR, textStatus, errorThrown) {
					hyryx.Alerts.addDanger("Error while executing procedure", textStatus + ' ' + errorThrown);
					console.log("Couldn't post/execute jsprocedure: " + textStatus + errorThrown);
				});
			} else {
				hyryx.Alerts.addInfo("Procedure didn't changed and won't be executed");
				console.log("Nothing changed - nothing to do");
			}
		},

		registerEditor: function() {
			this.editor = CodeMirror(document.getElementById(this.id), {
				value: '',
				mode: 'javascript',
				theme: 'custom',
				lint: true,
				gutters: ['CodeMirror-lint-markers'],
				lineNumbers: true,
				minHeight: 500,
				extraKeys: {"Ctrl-Space": "autocomplete"}
			});
			this.generation = 0;
			this.editor.setSize(null, 500);
		},

		registerEvents: function() {
			this.targetEl.on(
				'click', 'button.button-execute', this.execute.bind(this)
			);
			this.targetEl.on(
				'click', '.interactiveJSON', function() {
					console.log('click on interactive JSON');
				}
			);
		},

		registerCustomAutoCompletes: function() {
			var self = this;
			var orig = CodeMirror.hint.javascript;
			CodeMirror.hint.javascript = function(cm) {
				var inner = orig(cm) || {from: cm.getCursor(), to: cm.getCursor(), list: []};
				$.each(self.customAutoCompletes, function(idx, autoComplete) {
					inner.list.push({
						text: autoComplete.text,
						displayText: autoComplete.displayText,
						hint: function(cm, self, data) {
							var widget = document.createElement('span');
							widget.className = autoComplete.className;
							widget.textContent = data.text;
							cm.markText(self.from, self.to, {
								handleMouseEvents: true,
								replacedWith: widget,
								shared: true,
								addToHistory: true
							});
						}
					});
				});
				return inner;
			};
		},

		showContent: function(content) {
			this.editor.setValue(content);
		}
	});
})();
