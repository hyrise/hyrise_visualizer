hyryx.demos = (function() {

    function setup() {
	$.get('templates/page_demos.mst', function(template) {
	    var rendered = $(Mustache.render(template, {
	    }));
	    $('#visualizer #page-demos').append(rendered);
	    
	});
    }


    return {setup:setup};
})();