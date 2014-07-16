(function() {

	// Extend the standard ui plugin
	hyryx.debug.Canvas = function(target, config) {
		var config = (typeof config === "undefined") ? {} : config;
		this.showTitlebar = (typeof config.showTitlebar === "undefined") ? false : config.showTitlebar;
		this.showExecuteButton = (typeof config.showExecuteButton === "undefined") ? true : config.showExecuteButton;
		this.marker = null;
		this.parameters = [];
		this.newQueryPlan = {operators: {}, edges: []};
		this.initialQueryPlan = this.newQueryPlan;

		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	}

	hyryx.debug.Canvas.prototype = extend(hyryx.screen.AbstractUIPlugin, {
		/** Create a container for a SVG canvas and a container for the text editor */
		render : function() {
			var frame = $('<div class="area_frame no_padding"></div>').appendTo(this.targetEl);


			if (this.showTitlebar) {
				frame.append('<div class="titlebar">'
					+ '<button type="button" id="hideQueryEditor" class="btn btn-link"><span class="glyphicon glyphicon-chevron-down"></span> Back</button>'
					+ '<button type="button" id="revertQueryPlan" class="btn btn-link pull-right"><span class="glyphicon glyphicon-repeat"></span> Revert</button></div>');
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
			this.registerEventHandlers();
			this.registerCanvasControls();
			this.registerKeyBindings();
			this.registerEvents();
		},

		registerEventHandlers : function() {
			// bubble up node selection and deselection events
			this.screens.canvas.on("node*", this.emit.bind(this));
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

		initDragDrop : function(stencils) {
			// Update drag drop handlers when updating the list of possible operations
			var self = this;

			d3.selectAll(stencils).call(d3.behavior.drag()
			.on('dragstart', function(d) {
				if (self.activeScreen.onDragStart instanceof Function) {
					self.activeScreen.onDragStart(this, d);
				}
			})
			.on('dragend', function(d) {
				if (self.activeScreen.onDragEnd instanceof Function) {
					self.activeScreen.onDragEnd(this, d);
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

			this.targetEl.on('click', '.canvas-controls .button-execute', function() {
				hyryx.Database.runQuery(
					me.getSerializedQuery()
				).done((function(data, status, xhr) {
					if (data.error) {
						hyryx.Alerts.addWarning("Error while executing query", data.error);
						me.resultPreview.showError(data.error);
					} else {
						hyryx.Alerts.addSuccess("Query executed");
						console.log(data);
						me.resultPreview.update(data.performanceData);

						hyryx.debug.dispatch({
							type : 'data.reload',
							options : {
								all : true,
								data : data
							}
						});
					}
				}).bind(me));
			});

			this.targetEl.on('click', '.canvas-controls label', function(d) {
				me.switchView($(this).data('control'));
			});


		},

		revertToInitialQueryPlan: function() {
			this.loadPlan(this.initialQueryPlan);
		},

		queryEdited: function() {
			this.emit('queryEdited', this.getSerializedQuery(), this.marker);
		},

		getSerializedQuery : function() {
			var plan = this.activeScreen.getValue();
			this.flattenPlan(plan);
			return plan;
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

		registerEvents : function() {
			$(this.targetEl).on('click', 'button#hideQueryEditor', this.queryEdited.bind(this));
			$(this.targetEl).on('click', 'button#revertQueryPlan', this.revertToInitialQueryPlan.bind(this));
		},

		loadPlan : function(plan, parameters, marker, performanceData) {
			if (marker) {
				this.marker = marker;
			}

			this.parameters = parameters;

			this.initialQueryPlan = plan;

			var screen = this.getCurrentScreen();
			if (screen) {
				plan.hasChanged = true;
				screen.show(plan, performanceData);
			}
		},

		/**
		 * Display only the selected data view
		 * @param  {String} to CSS class of the container
		 */
		switchView : function(to) {

			var plan = this.getCurrentScreen().getValue();

			if (this.screens[to]) {
				this.emit('switchingView', to);
				this.getCurrentScreen().hide();
				this.setCurrentScreen(to).show(plan);
			}
		}
	});
})();
