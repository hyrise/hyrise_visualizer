(function() {
	hyryx.explorer.Data = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	};

	hyryx.explorer.Data.prototype = extend(hyryx.screen.AbstractUIPlugin, {

		render: function() {
			return this.createDataContainerMarkup();
		},

		createDataContainerMarkup : function() {
			this.id = hyryx.utils.getID('Data');
			var $div = jQuery('<div class="data" id="'+this.id+'"><h3>Retrieved Data</h3></div>');
			jQuery('<table width="100%" class="table table-striped table-bordered"></table>').appendTo($div);
			$div.appendTo(this.targetEl);

			return $div;
		}
	});
})();

