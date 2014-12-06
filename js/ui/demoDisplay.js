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
	}

    });

})();