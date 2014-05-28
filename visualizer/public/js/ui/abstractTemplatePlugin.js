(function() {
	hyryx.screen.AbstractUITemplatePlugin = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	}

	hyryx.screen.AbstractUITemplatePlugin.prototype = extend(hyryx.screen.AbstractUIPlugin, {
		create: function() {
			var self = this;
			if (($(this.targetEl)[0] instanceof Element)) {
				this.render(function (el) {
					self.el = el;
					self.init();
				});
			}
		}
	});
})();