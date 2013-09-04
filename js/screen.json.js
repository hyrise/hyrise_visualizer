(function() {

	hyryx.screen.JSONScreen = function(config) {
		this.width = config.width || 12;
		this.targetEl = config.targetEl;
		this.cls = config.cls || 'json-container';

		this.id = hyryx.utils.getID('JSON');
		
		this.el = this.render();
		this.init();
		return this;
	}

	hyryx.screen.JSONScreen.prototype = {

		data : {},

		show : function(data) {
			this.setValue(data);
			this.update();
			$(this.el).show();
		},

		hide : function() {
			$(this.el).hide();
		},

		render : function() {
			var markup = $('<div class="screen col-md-'+this.width+' '+this.cls+'" id="'+this.id+'">');

			this.targetEl.append(markup);

			return markup;
		},

		init : function() {

			var prettyContainer = $('<pre class="prettyprint editor"></pre>');

			this.el.append(prettyContainer);
		},

		setValue : function(data) {
			this.data = data;
		},

		getValue : function() {
			return this.data;
		},

		update : function() {
			var pretty = hyryx.utils.highlightJSON(this.data);
			this.el.find('.prettyprint').html(pretty);
		}
	};
})();