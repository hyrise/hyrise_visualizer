(function() {

    // Extend the standard ui plugin
    hyryx.manage.demoNavigation = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
    };

    hyryx.manage.demoNavigation.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
	render : function(callback) {
	    $.get('templates/demoNavigation.mst', function(template) {
		var rendered = $(Mustache.render(template, {}));
	
		callback(rendered);
	    });
	},
	
	
		
	init : function() {
	    $('#btn-demo1').click( function() {
		    $('#demo1Screen').show();
		    $('#demo2Screen').hide();
	    });

	    $('#btn-demo2').click( function() {
		    $('#demo1Screen').hide();
		    $('#demo2Screen').show();
	    });

	    
	}
    });
})();