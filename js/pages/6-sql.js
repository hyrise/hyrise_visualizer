hyryx.sql = (function() {

    function setup() {
	$.get('templates/page_sql.mst', function(template) {
	    var rendered = $(Mustache.render(template, {
	    }));
	    $('#visualizer #page-sql').append(rendered);
	    
	});
    }


    return {setup:setup};
})();