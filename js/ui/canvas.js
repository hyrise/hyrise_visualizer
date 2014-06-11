(function() {

	// Extend the standard ui plugin
	hyryx.debug.Canvas = function(target, config) {
		var config = (typeof config === "undefined") ? {} : config;
		this.showTitlebar = (typeof config.showTitlebar === "undefined") ? false : config.showTitlebar;
		this.showExecuteButton = (typeof config.showExecuteButton === "undefined") ? true : config.showExecuteButton;

		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	}

	hyryx.debug.Canvas.prototype = extend(hyryx.screen.AbstractUIPlugin, {
		/** Create a container for a SVG canvas and a container for the text editor */
		render : function() {
			var frame = $('<div class="area_frame no_padding"></div>').appendTo(this.targetEl);


			if (this.showTitlebar) {
				frame.append('<div class="titlebar"><button type="button" id="hideQueryEditor" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span> Back</button></div>');
			}
			// create the canvas
			this.activeScreen = this.screens.canvas = new hyryx.screen.CanvasScreen({
				width : 7,
				targetEl : frame
			});

			// create json view
			this.screens.json = new hyryx.screen.JSONScreen({
				width : 10,
				targetEl : frame
			});

			this.createCanvasControls(this.targetEl);

			this.resultPreview = new hyryx.screen.resultPreview({
				target : $('.execution-preview')
			});
		},

		/** Instantiate the Canvas and add the editor for the JSON representation */
		init : function() {
			this.registerCanvasControls();
			this.registerKeyBindings();
		},

		/** Make certain functions accessible for other plugins */
		handleEvent : function(event) {
			switch (event.type) {
				case 'loadPlan' :
					this.loadPlan(event.options);
					break;

				case 'changeHeight' :
					this.screens.canvas.setHeight(event.options);
					break;
			}
		},

		initDragDrop : function(parentSelector) {
			// Update drag drop handlers when updating the list of possible operations
			var self = this;

			d3.selectAll(parentSelector + ' .stencils .list-group-item').call(d3.behavior.drag()
			.on('dragstart', function(d) {
				if (self.activeScreen.onDragStart instanceof Function) {
					self.activeScreen.onDragStart.call(this, d);
				}
			})
			.on('dragend', function(d) {
				if (self.activeScreen.onDragEnd instanceof Function) {
					self.activeScreen.onDragEnd.call(this, d);
				}
			}));
		},

		createCanvasControls : function(target) {
			var $controls = $('<div class="canvas-controls pull-right">').appendTo(target.find('div.canvas'));
			$controls.append('<div class="btn-group" data-toggle="buttons">' +
				'<label class="btn btn-default active" data-control="canvas">' +
					'<input type="radio" name="switchView" id="canvas"> Designer' +
				'</label>' +
				'<label class="btn btn-default" data-control="json">' +
					'<input type="radio" name="switchView" id="json"> JSON' +
				'</label>' +
			'</div>');

			if (this.showExecuteButton) {
				$controls.append('<a class="btn btn-primary button-execute">Execute<a>');
			}

			// $controls.append('<div class="execution-preview">');

		},

		registerCanvasControls : function() {
			var me = this;

			$('.canvas-controls .button-execute').on('click', function() {

				var request = this.getSerializedQuery();

				/*
				$.ajax({
					url : hyryx.settings.database + '/jsonQuery',
					type : 'POST',
					dataType: 'json',
					data : request,
					success : function(data, status, xhr) {
						if (data.error) {
							this.resultPreview.showError(data.error);
						} else {
							console.log(data);
							this.resultPreview.update(data.performanceData);

							hyryx.debug.dispatch({
								type : 'data.reload',
								options : {
									all : true,
									data : data
								}
							});
						}

						// $('.execution-preview')
					}.bind(this)
				});
				*/

			}.bind(this));

			$('.canvas-controls label').on({
				// mouseover : function(d) {
				// 	var $this = $(this);
				// 	if (!$this.hasClass('active')) {
				// 		$this.addClass('hover');
				// 	}
				// },
				// mouseout : function(d) {
				// 	$(this).removeClass('hover');
				// },
				click : function(d) {
					// $('.canvas-controls li.active').removeClass('active');
					// $(this).addClass('active');

					me.switchView($(this).data('control'));
				}
			})


		},

		getSerializedQuery : function() {
			var query = "query=";

			var plan = this.activeScreen.getValue();
			this.flattenPlan(plan);

			return query + JSON.stringify(plan, null, 4);
		},

		/**
		 * Prepares the given plan to be handled by the hyrise backend - pulls up values to the root level of each operation
		 * @param  {Object} plan A plan with operators and edges
		 */
		flattenPlan : function(plan) {

			$.each(plan.operators, function(opID, v) {
				var data = v.data;
				if (data) {
					$.each(data, function(key, value) {
						v[key] = value.value || value;
					});
					delete v.data;
				}
			});
		},

		registerKeyBindings : function() {
			var me = this;

			$(document).keydown(function(e){
				if ($('#page-debug').hasClass('active')) {
					if (e.target.nodeName.toLowerCase() === 'input') { return; }
					// only enact undo/redo when the canvas is visible
					if (me.getCurrentScreen() === me.screens.canvas && e.which === 90) {
						if (e.shiftKey) {
							hyryx.command.redo();
						} else {
							hyryx.command.undo();
						}
					}
				}
			});
		},

		hideAttributesPanel : function() {
			// todo use events or facade or stuff, this is evil
			// $('.attributes').hide();
			$('.sidebar').addClass('hideSidebar');
		},

		loadPlan : function(plan) {
			var screen = this.getCurrentScreen();
			if (screen) {
				plan.hasChanged = true;
				screen.show(plan);
			}
		},

		/**
		 * Display only the selected data view
		 * @param  {String} to CSS class of the container
		 */
		switchView : function(to) {

			var plan = this.getCurrentScreen().getValue();

			if (this.screens[to]) {

				this.getCurrentScreen().hide();
				this.hideAttributesPanel();
				this.setCurrentScreen(to).show(plan);
			}
		}
	});
})();
