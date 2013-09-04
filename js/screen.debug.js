hyryx.debug = (function() {
    
    var Stencils, Canvas, Json, Visualization, Result, Button, Form;

    function setup() {
        var $visualizer = $('#visualizer #page-debug').append('<div class="container"><div class="row">');
        var $fluidLayout = $visualizer.find('.row');

        // create stencils container
        Stencils = new hyryx.debug.Stencils($fluidLayout);

        // create canvas
        Canvas = new hyryx.debug.Canvas($fluidLayout);
    }

    function dispatch(event) {
        if ('string' === typeof event) {
            event = {
                type : event,
                options : {}
            }
        }
        var config = (event.type||'').split('.'), target = config[0], command = config[1];

        if (target === 'canvas' && Canvas) {
            Canvas.handleEvent({
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

// <ul id='stencil-container'>
// </ul>

// <div id='hero-unit'>
//     <canvas id='canvas1' width='500px' height=400 style='border:1px solid gray;' ondragover="allowDrop(event)"></canvas>
//     <div id="json-container" width=500 height=400 style="display:none;"></div>
//     <div id='visualisation-container'></div>
//     <div id='result-container'></div>
// </div>
// <div id='button-container'>
//     <button id='button-execute'>Execute</button>
//     <button id='button-json'>Get JSON</button>
// </div>
// <div id='form-container'></div>