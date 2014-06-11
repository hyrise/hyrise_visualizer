hyryx.editor = (function() {
    var eventHandlers;

    function setup() {
        $.get('templates/page_editor.mst', function(template) {
            var rendered = $(Mustache.render(template, {
                width_ide: 12,
                width_procedureResults: 12
            }));
            $('#visualizer #page-editor').append(rendered);

            eventHandlers = {
                'ide' : new hyryx.editor.IDE(rendered.find('#frame_ide')),
                'procedureResults': new hyryx.editor.ProcedureResults(rendered.find('#frame_procedureResults'))
            };
        });
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
