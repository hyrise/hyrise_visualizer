hyryx.editor = (function() {
    var eventHandlers;

    function setup() {
        $.get('js/templates/page_editor.mst', function(template) {
            var rendered = $(Mustache.render(template, {
                width_storedProcedureList: 3,
                width_editor: 9
            }));
            $('#visualizer #page-editor').append(rendered);

            eventHandlers = {
                'storedProcedureList': new hyryx.editor.StoredProcedureList(rendered.find('#frame_storedProcedureList')),
                'editor': new hyryx.editor.Editor(rendered.find('#frame_editor'))
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
