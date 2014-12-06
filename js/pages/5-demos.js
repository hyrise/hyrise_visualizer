hyryx.demos = (function() {

	var demoNavigation, demoDisplay;

    function setup() {
	$.get('templates/page_demos.mst', function(template) {
	    var rendered = $(Mustache.render(template, {
	    	width_demoNavigation: 3,
	    	width_demoDisplay: 9
	    }));
	    $('#visualizer #page-demos').append(rendered);
	    

	    demoNavigation = new hyryx.manage.demoNavigation(rendered.find('#frame_demoNavigation'));
	    demoDisplay = new hyryx.manage.demoDisplay(rendered.find('#frame_demoDisplay'));
	});
    }


    return {setup:setup};
})();