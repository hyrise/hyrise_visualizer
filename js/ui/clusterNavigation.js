(function() {

    var cluster_management_hidden = true, cluster_statistics_hidden = true;

    // Extend the standard ui plugin
    hyryx.manage.ClusterNavigation = function() {
	hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
    };

    hyryx.manage.ClusterNavigation.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
	render : function(callback) {
	    $.get('templates/clusterNavigation.mst', function(template) {
		var rendered = $(Mustache.render(template, {}));
	
		callback(rendered);
	    });
	},
	
	
		
	init : function() {
	    $('#btn-cluster-management').click( function() {
		if (cluster_statistics_hidden == false) {
		    $('#clusterStatsScreen').hide();
		    cluster_statistics_hidden = true;
		}
		if (cluster_management_hidden == true) {
		    $('#clusterManagementScreen').show();
		    cluster_management_hidden = false;
		}
	    });

	    $('#btn-cluster-stats').click( function() {
		if (cluster_management_hidden == false) {
		    $('#clusterManagementScreen').hide();
		    cluster_management_hidden = true;
		}
		if (cluster_statistics_hidden == true) {
		    $('#clusterStatsScreen').show();
		    cluster_statistics_hidden = false;
		}
	    });

	    
	}
    });
})();