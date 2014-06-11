(function() {

	// Extend the standard ui plugin
	hyryx.editor.QueryEditor = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	}

	hyryx.editor.QueryEditor.prototype = extend(hyryx.screen.AbstractUIPlugin, {
		render : function(callback) {},

		init : function() {},

		handleEvent : function(event) {}
	});
})();