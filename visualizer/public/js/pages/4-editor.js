hyryx.editor = (function() {
    var StoredProcedureList, Editor;

    function setup() {
        $.get('js/templates/page_editor.mst', function(template) {
            var rendered = $(Mustache.render(template, {
                width_storedProcedureList: 2,
                width_editor: 10
            }));
            $('#visualizer #page-editor').append(rendered);

            // create stored procedure list
            StoredProcedureList = new hyryx.editor.StoredProcedureList(rendered.find('#frame_storedProcedureList'));

            // create editor
            Editor = new hyryx.editor.Editor(rendered.find('#frame_editor'));
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

        if (target === 'storedprocedurelist' && StoredProcedureList) {
            StoredProcedureList.handleEvent({
                type: command,
                options: event.options
            });
        } else if (target === 'editor' && Editor) {
            Editor.handleEvent({
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
