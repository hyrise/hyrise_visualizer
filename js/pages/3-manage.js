hyryx.manage = (function() {
    var clusterStats, clusterNavigation;

    function setup() {
	$.get('templates/page_manage.mst', function(template) {
	    var rendered = $(Mustache.render(template, {
		width_clusterNavigation: 3,
		width_clusterStats: 9
	    }));
	    $('#visualizer #page-manage').append(rendered);


	    clusterStats = new hyryx.manage.ClusterStats(rendered.find('#frame_clusterStats'));
	    clusterNavigation = new hyryx.manage.ClusterNavigation(rendered.find('#frame_clusterNavigation'));

	});
    }


    return {setup:setup};
})();