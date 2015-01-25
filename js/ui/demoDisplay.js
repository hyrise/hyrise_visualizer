(function() {

    // Extend the standard ui plugin
    hyryx.manage.demoDisplay = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
    };

    hyryx.manage.demoDisplay.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
	render : function(callback) {
	    $.get('templates/demoDisplay.mst', function(template) {
		var rendered = $(Mustache.render(template, {}));
	
		callback(rendered);
	    });
	},
	
	
		
	init : function() {    

		$('#btn-start-workload').click(function(oEvent){
			$.ajax({
				method: "GET",
				url: "startworkload",
				success: function(oResult){
				},
				error: function(oResult){
				}
			})
		});

		$('#btn-stop-workload').click(function(oEvent){
			$.ajax({
				method: "GET",
				url: "endworkload",
				success: function(oResult){
				},
				error: function(oResult){
				}
			})
		});
	}

    });

})();