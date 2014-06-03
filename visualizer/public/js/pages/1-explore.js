hyryx.explorer = (function() {
	var eventHandlers;

	function setup() {
		$(document).bind('touchmove', function(event) {
			event.preventDefault();
		});

		$.get('templates/page_explore.mst', function(template) {
			var rendered = $(Mustache.render(template, {
				width_attributes: 3,
				width_graph: 9,
				width_data: 12
			}));
			$('#visualizer #page-explorer').append(rendered);

			eventHandlers = {
				'attributes': new hyryx.explorer.Attributes(rendered.find('#frame_attributes')),
				'graph': new hyryx.explorer.Graph(rendered.find('#frame_graph')),
				'data': new hyryx.explorer.Data(rendered.find('#frame_data'))
			};

			initUIElements();
		});
	}

	function initUIElements() {
		$('.dropdown-toggle').dropdown();
		$('.selectpicker').selectpicker();
	}

	function dispatch(event) {
		if ('string' === typeof event) {
			event = {
				type: event,
				options: {}
			};
		}
		var config = (event.type || '').split('.'),
			target = config[0],
			command = config[1];

		if (eventHandlers[target]) {
			eventHandlers[target].handleEvent({
				type    : command,
				options : event.options
			});
		}
	}

	return {
		setup: setup,
		dispatch: dispatch,
		loadAttributes: function() {
			return Attributes.load();
		},
		loadTable: function() {
			return Attributes.loadTable();
		},
	}
})();
