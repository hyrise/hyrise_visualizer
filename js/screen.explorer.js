hyryx.explorer = (function() {

	var Attributes, Graph, Data;

	function setup() {
		$(document).bind('touchmove', function(event) {
			event.preventDefault();
		})

		var $visualizer = $('#visualizer #page-explorer').append('<div class="container"><div class="row">');
		var $fluidLayout = $visualizer.find('.row');

		// Create the attributes container
		Attributes = new hyryx.explorer.Attributes($fluidLayout);

		// Create the graph container
		Graph = new hyryx.explorer.Graph($fluidLayout);

		// Create data container
		Data = new hyryx.explorer.Data($visualizer);

		initUIElements();
	}

	function initUIElements() {
	    $('.dropdown-toggle').dropdown();
	    $('.selectpicker').selectpicker();
	}

	function dispatch(event) {
		if ('string' === typeof event) {
			event = {
				type : event,
				options : {}
			}
		}
		var config = (event.type||'').split('.'), target = config[0], command = config[1];

		if (target === 'graph') {
			Graph.handleEvent({
				type	: command,
				options	:event.options
			});
		}
	}

	return {
		setup			: setup,
		dispatch		: dispatch,
		loadAttributes	: function() { return Attributes.load(); },
		loadTable		: function() { return Attributes.loadTable(); },
	}
})();