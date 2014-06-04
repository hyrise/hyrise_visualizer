hyryx.debug = (function() {
    var eventHandlers;

    function setup() {
        var $visualizer = $('#visualizer #page-debug').append('<div class="container"><div class="row">');
        var $fluidLayout = $visualizer.find('.row');

        eventHandlers = {
            'stencil': new hyryx.debug.Stencils($fluidLayout),
            'canvas': new hyryx.debug.Canvas($fluidLayout),
            'attributes': new hyryx.debug.Attributes($fluidLayout),
            'data': new hyryx.explorer.Data($visualizer)
        };
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
                type: command,
                options: event.options
            });
        }
    }

    return {
        setup: setup,
        dispatch: dispatch
    };
})();
