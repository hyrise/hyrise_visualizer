(function() {

	// Extend the standard ui plugin
	hyryx.debug.Canvas = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	}

	// reference to the current instance
	var canvas;

	hyryx.debug.Canvas.prototype = extend(hyryx.screen.AbstractUIPlugin, {
		/** Create a container for a SVG canvas and a container for the text editor */
		render : function() {
			canvas = new hyryx.screen.CanvasScreen({
				width : 10,
				targetEl : this.targetEl
			});

			this.activeScreen = this.screens['canvas'] = canvas;

			this.screens['json'] = new hyryx.screen.JSONScreen({
				width : 8,
				targetEl : canvas.el
			});
		},

		/** Instantiate the Canvas and add the editor for the JSON representation */
		init : function() {
			this.createCanvasControls();
			this.registerKeyBindings();
		},

		/** Make certain functions accessible for other plugins */
		handleEvent : function(event) {
			if (canvas) {
				switch (event.type) {
					// Update drag drop handlers when updating the list of possible operations
					case 'initDragDrop' : canvas.initDragDrop(event.options); break;
				}
					
			}
		},

		createCanvasControls : function() {
			var me = this;

			var $controls = $('<div class="col-md-2 canvas-controls">').appendTo($('svg.stencilgraph').parent());
			$controls.append('<ul><li class="active" data-control="canvas">Designer</li><li data-control="json">JSON</li></ul>');

			$('.canvas-controls li').on({
				mouseover : function(d) {
					var $this = $(this);
					if (!$this.hasClass('active')) {
						$this.addClass('hover');
					}
				},
				mouseout : function(d) {
					$(this).removeClass('hover');
				},
				click : function(d) {
					$('.canvas-controls li.active').removeClass('active');
					$(this).addClass('active');

					me.switchView($(this).data('control'));
				}
			})

			return $controls;

		},

		registerKeyBindings : function() {

			$(document).keydown(function(e){
				if ($('#page-debug').hasClass('active')) {
					console.log('keydown');
					if (e.which === 90) {
						if (e.shiftKey) {
							hyryx.command.redo();
						} else {
							console.log('undo')
							hyryx.command.undo();
						}
					}
				}
			});
		},

		/**
		 * Display only the selected data view
		 * @param  {String} to CSS class of the container
		 */
		switchView : function(to) {

			var plan = this.getCurrentScreen().getValue();

			if (this.screens[to]) {

				this.getCurrentScreen().hide();
				this.setCurrentScreen(to).show(plan);
			}
		}
	});
})();