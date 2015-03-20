hyryx.sql = (function() {
	var sqlParser;

    function setup() {
	$.get('templates/page_sql.mst', function(template) {
	    var rendered = $(Mustache.render(template, {
	    }));
	    $('#visualizer #page-sql').append(rendered);

	    sqlParser = new hyryx.manage.sqlParser(rendered.find('#frame_sqlParser'));
	});
    }


    return {setup:setup};
})();