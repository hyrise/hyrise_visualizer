(function() {
	hyryx.debug.Stencils = function() {
		hyryx.screen.AbstractUIPlugin.apply(this, arguments);
	};

	hyryx.debug.Stencils.prototype = extend(hyryx.screen.AbstractUIPlugin, {

		render : function() {
			return this.createStencilsMarkup();
		},

		init : function() {
			this.load();
		},

		createStencilsMarkup : function() {
			// create container for stencils
			this.id = hyryx.utils.getID('Stencils');
			var frame = $('<div class="area_frame"></div>').appendTo(this.targetEl);
			var $stencils = $('<div class="stencils" id="'+this.id+'"><h3>Operations</h3></div>').appendTo(frame);
			$stencils.append('<div class="list">');

			return $stencils;
		},

		load : function() {
			var me = this;

			// load available stencils
			$.getJSON('operations.json', function(data) {
				hyryx.stencils = data;

				me.updateOpList();
			});
		},

		updateOpList : function() {

			var me = this,
				$stencil_list = this.targetEl.find('.stencils .list');

			$stencil_list.html('');

			// var header = 'Operations';
			var panel = ['<div class="item-list">', '<div class="list-group">'];

			$.each(hyryx.stencils, function(key, value) {

				var $buttonMarkup = me.getStencilButtonMarkup(value);

				panel.push($buttonMarkup);
			});

			panel.push('</div></div>');
			$(panel.join('')).appendTo($stencil_list);

			$stencil_list.find('.collapse.panel-collapse:first').addClass('in');

			this.emit("initDragDrop", $stencil_list.find('.list-group-item'));
		},

		getStencilButtonMarkup : function(config) {
			return ['<a class="list-group-item" data-key="'+config.type+'" data-type="'+config.type+'" draggable="true">',
						config.type,
					'</a>'].join('');
		},
	});
})();
