(function() {

	hyryx.screen.JSONScreen = function(config) {
		this.width = config.width || 12;
		this.targetEl = config.targetEl;
		this.cls = config.cls || 'json-container';

		this.isActiveScreen = false;
		this.id = hyryx.utils.getID('JSON');
		
		this.el = this.render();
		this.init();
		return this;
	}

	var jsonEditor;

	hyryx.screen.JSONScreen.prototype = {

		data : {},

		show : function(data) {
			this.isActiveScreen = true;
			this.setValue(data);
			this.update();
			$(this.el).show();
			this.editor.refresh();
		},

		hide : function() {
			this.isActiveScreen = false;
			$(this.el).hide();
		},

		render : function() {
			var markup = $('<div class="screen '+this.cls+'" id="'+this.id+'">');

			this.targetEl.append(markup);

			return markup;
		},

		init : function() {

			// var prettyContainer = $('<pre class="prettyprint editor"></pre>');

			// this.container = prettyContainer;
			// this.el.append(prettyContainer);

			this.registerEditor();
		},

		onDragStart : function(d) {
			// the dom node representing a new stencil
			var gStencil = d3.select(this);

			gStencil.style('opacity', .4);

			d3.event.sourceEvent.stopPropagation();
		},

		onDragEnd : function(d) {
			var gStencil = d3.select(this);
			gStencil.style('opacity', 1);

			if (d3.event.sourceEvent.toElement.tagName.toLowerCase() == 'pre') {
				var p = d3.event.sourceEvent;
				var name = $(gStencil[0]).data('type');
				var node = new hyryx.debug.Canvas.Node([0,0], name);

				CodeMirror.signal(jsonEditor, 'drop', jsonEditor, node, {left : p.x, top : p.y});
			}
		},

		/**
		 * Create a custom text editor where the pretty print container is located, so the user can directly modify the JSON
		 */
		registerEditor : function() {
			jsonEditor = this.editor = CodeMirror(this.el[0], {
				value : '',
				mode : {
					name : 'javascript',
					json : true
				},
				theme : 'custom',
				lint : true,
				gutters : ['CodeMirror-lint-markers'],
				lineNumbers : true
			});
			this.editor.setSize(null, 500);

			this.editor.on('blur', function(editor) {
				var oldValue = this.getValue();
				var newValue = editor.getValue();

				try {
					newValue = JSON.parse(newValue);
					newValue.hasChanged = true;
				} catch(e) {
					console.log('error when parsing input');
					newValue = oldValue;
					newValue.hasChanged = false;
				}

				if (newValue.hasChanged) {
					this.setValue(newValue);
				}

			}.bind(this));

			this.editor.on('drop', function(editor, node, pos) {
				var insertAt = editor.coordsChar(pos);
				var stringifiedNode = JSON.stringify(hyryx.utils.serializeNode(node), null, 4);

				editor.replaceRange(stringifiedNode, insertAt);
			}.bind(this));
		},

		setValue : function(data) {
			this.data = data;
			if (this.editor) {
				this.editor.setValue(JSON.stringify(data, null, 4));
			}
		},

		getValue : function() {
			return this.data;
		},

		update : function() {
			var pretty = hyryx.utils.highlightJSON(this.data);
			this.el.find('.prettyprint').html(pretty);
		}
	};
})();