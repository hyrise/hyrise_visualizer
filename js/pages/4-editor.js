hyryx.editor = (function() {
    var ide,
        procedureResults;

    function setup() {
        $.get('templates/page_editor.mst', function(template) {
            var rendered = $(Mustache.render(template, {
                width_ide: 12,
                width_procedureResults: 12
            }));
            $('#visualizer #page-editor').append(rendered);

            ide = new hyryx.editor.IDE(rendered.find('#frame_ide'));
            procedureResults = new hyryx.editor.ProcedureResults(rendered.find('#frame_procedureResults'));

            registerEvents();
        });
    }

    function registerEvents() {
        ide.on("procedureLoaded", procedureResults.clearResults.bind(procedureResults));
        ide.on("procedureExecuting", procedureResults.startLoading.bind(procedureResults));
        ide.on("procedureExecuted", procedureResults.showResults.bind(procedureResults));
        procedureResults.on("editorExecute", function(papi) {
            ide.screens.procedureEditor.jsEditor.execute(papi);
        });
    }

    return {
        setup: setup
    };
})();
