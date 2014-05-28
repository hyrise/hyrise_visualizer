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

    function dispatch(event) {}

    return {
        setup : setup,
        dispatch : dispatch
    };
})();