(function() {

	// Extend the standard ui plugin
	hyryx.editor.QueryEditor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
		this.stencils = undefined;
		this.canvas = undefined;
	};

	hyryx.editor.QueryEditor.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		render : function(callback) {
			var self = this;
			$.get('templates/queryEditor.mst', function(template) {
				var rendered = $(Mustache.render(template, {
					width_stencils: 3,
					width_canvas: 9
				}));

				self.stencils = new hyryx.debug.Stencils(rendered.find('#frame_stencils'));
				self.canvas = new hyryx.debug.Canvas(rendered.find('#frame_canvas'), {
					showTitlebar: true,
					showExecuteButton: false
				});
				self.attributes = new hyryx.debug.Attributes(rendered.find('#frame_attributes'));

				callback($(rendered));
			});
		},

		init : function() {
			this.registerEvents();
		},

		registerEvents : function() {
			var self = this;

			this.stencils.on("initDragDrop", function(stencils){
				self.canvas.initDragDrop(stencils);
			});

			this.canvas.on('queryEdited', function(query, widget) {
				self.emit('queryEdited', query, widget);
			});
			this.canvas.on("nodeSelected", function(node) {
				self.attributes.show(node);
			});
			this.canvas.on("nodeDeselected", function() {
				self.attributes.hide();
			});
			this.canvas.on("switchingView", function() {
				self.attributes.hide();
			});
		},

		loadPlan : function(query, widget, performanceData) {
			this.canvas.loadPlan(query, widget, performanceData);
		}
	});
})();
