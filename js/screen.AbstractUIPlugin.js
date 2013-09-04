(function() {
	if ('undefined' === typeof hyryx.screen) {
		hyryx.screen = {};
	}

	hyryx.screen.AbstractUIPlugin = function(targetEl) {

		this.targetEl = targetEl;

		if (($(targetEl)[0] instanceof Element)) {
			this.el = this.render();
			this.init();
		}

		return this;
	}

	hyryx.screen.AbstractUIPlugin.prototype = {

		screens : {},
		activeScreen : null,

		render : function() {
			console.log('render abstract UI plugin'); 
		},

		init : function() {
			console.log('apply abstract UI plugin logic');
		},

		getCurrentScreen : function() {
			return this.activeScreen;
		},

		setCurrentScreen : function(id) {
			this.activeScreen = this.screens[id];
			return this.activeScreen;
		}
	}
})();