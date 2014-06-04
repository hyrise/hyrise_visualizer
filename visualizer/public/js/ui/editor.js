(function() {
	// Extend the standard ui plugin
	hyryx.editor.Editor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	};

	hyryx.editor.Editor.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		id: hyryx.utils.getID('Editor'),

		/** Create a container for a SVG canvas and a container for the text editor */
		render: function(callback) {
			var self = this;
			$.get('js/templates/editor.mst', function(template) {
				var rendered = Mustache.render(template, {
					id: self.id,
					submitbutton: true
				});
				self.targetEl.on(
					'click', 'a.button-execute', self.execute.bind(self)
				);
				callback(rendered);
			});
		},

		/** Instantiate the Canvas and add the editor for the JSON representation */
		init: function() {
			this.registerEditor();
			this.registerEvents();
		},

		/** Make certain functions accessible for other plugins */
		handleEvent: function(event) {
			if (event.type === "load") {
				this.loadContent(event.options.data);
			}
		},

		execute: function() {
			console.log("Execute stored procedure...");
			if (this.editor.isClean(this.generation)) {
				this.generation = this.editor.changeGeneration();

				var code = this.editor.getValue();
				$.ajax({
					url : hyryx.settings.database + '/jsprocedure',
					type : 'POST',
					dataType: 'json',
					data : {
						action: 'execute',	//TODO: verify this!
						code: code
					}
				}).done(function(data) {
					if (data.error) {
						console.error("Error executing procedure:" + data.error);
					} else {
						console.log(data);

						hyryx.editor.dispatch({
							type : 'data.show',
							options : {
								data : data
							}
						});
					}
				}).fail(function(jqXHR, textStatus, errorThrown ) {
					console.log("Couldn't post/execute jsprocedure: " + textStatus + errorThrown);
				});
			} else {
				console.log("Nothing changed - nothing to do");
			}
		},

		registerEditor: function() {
			this.editor = CodeMirror(document.getElementById(this.id), {
				value: '',
				mode: {
					name: 'javascript'
				},
				theme: 'custom',
				lint: true,
				gutters: ['CodeMirror-lint-markers'],
				lineNumbers: true
			});
			this.generation = 0;
		},

		registerEvents: function() {
			$(self.targetEl).find('a.button-execute').on(
				'click', self.execute
			);
		},

		loadContent: function(content) {
			this.editor.setValue(content);
		}
	});
})();
