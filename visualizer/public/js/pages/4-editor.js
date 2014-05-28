hyryx.editor = (function() {

    var StoredProcedureList, Editor;

    function setup() {
        var $visualizer = $('#visualizer #page-editor').append('<div class="container"><div class="row">');
        var $fluidLayout = $visualizer.find('.row');

        // create stored procedure list
        StoredProcedureList = new hyryx.editor.StoredProcedureList($fluidLayout);

        // create editor
        Editor = new hyryx.editor.Editor($fluidLayout);
    }

    function dispatch(event) {
        if ('string' === typeof event) {
            event = {
                type : event,
                options : {}
            };
        }
        var config = (event.type||'').split('.'),
            target = config[0],
            command = config[1];

        if (target === 'storedprocedurelist' && StoredProcedureList) {
            Canvas.handleEvent({
                type    : command,
                options : event.options
            });
        } else if (target === 'editor' && Editor) {
            Attributes.handleEvent({
                type    : command,
                options : event.options
            });
        }
    }

    return {
        setup : setup,
        dispatch : dispatch
    };
})();
