hyryx.explorer = (function() {
    var eventHandlers;

	function setup() {
		$(document).bind('touchmove', function(event) {
			event.preventDefault();
		})

		var $visualizer = $('#visualizer #page-explorer').append('<div class="container"><div class="row">');
		var $fluidLayout = $visualizer.find('.row');

		this.eventHandlers = {
			'attributes': new hyryx.explorer.Attributes($fluidLayout),
			'graph': new hyryx.explorer.Graph($fluidLayout),
			'data': new hyryx.explorer.Data($visualizer)
		};

		initUIElements();
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
