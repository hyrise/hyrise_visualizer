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
					width: 10,
					submitbutton: true
				});
				self.targetEl.append(rendered);
				$(self.targetEl).find('a.button-execute').on(
					'click', self.execute
				);
				callback(rendered);
			});
		},

		/** Instantiate the Canvas and add the editor for the JSON representation */
		init: function() {
			this.registerEditor();
		},

		/** Make certain functions accessible for other plugins */
		handleEvent: function(event) {},

		execute: function() {
			alert('Execute!');
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
		}
	});
})();
