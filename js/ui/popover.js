(function() {
	if ('undefined' === typeof hyryx.screen) {
		hyryx.screen = {};
	}

	hyryx.screen.popover = function(config) {

		this.title = config.title;
		this.content = config.content;

		this.applyClb = config.applyClb;
		this.showClb = config.showClb;

		this.targetEl = config.target;

		this.modal = config.modal !== undefined ? config.modal : true;
		this.enableButtons = config.enableButtons !== undefined ? config.enableButtons : true;

		this.placement = config.placement || 'left';

		this.container = config.container; // default to undefined

		if (($(this.targetEl)[0] instanceof Element)) {
			this.render();
		}

		return this;
	}

	hyryx.screen.popover.prototype = {

		render : function() {
			var me = this;

			this.targetEl.popover({
				title : this.title,
				html : true,
				content : this.content || '',
				container : this.container,
				placement : this.placement,
				trigger : 'manual'
			}).click(function(event) {
				var $this = $(this);

				// HIDE
				if (d3.select(this).classed('active')) {
					d3.select(this).classed('active', false);

					$this.popover('hide');
					if (me.modal) {
						$('.modal').fadeOut();
					}
				}
				// SHOW
				else {
					d3.select(this).classed('active', true);

					$this.popover('show');

					var form = (me.container && $(me.container).find('.popover') || $this.next('.popover'));
					var title = form.find('.popover-title');
					var content = form.find('.popover-content');

					if (me.modal) {
						form.parent().prepend('<div class="modal">');
					}

					var closeButton = $('<span class="close">x</span>').appendTo(title);
					// close on click
					closeButton.click(function(event) {
						$this.click();
					});

					if (me.enableButtons) {
						var cancelButton = $('<a class="btn col-md-6 btn-plain btn-close">Cancel</a>').appendTo(content);
						var applyButton = $('<a class="btn col-md-6 apply">Apply</a>').appendTo(content);

						cancelButton.click(function() {
							$this.click();
						})

						applyButton.click(function() {
							if (me.applyClb instanceof Function) {
								me.applyClb(form, $this);
							}
							$this.click();
						})
					}

					form.find('input:first').focus();


					if (me.showClb instanceof Function) {
						me.showClb(form);
					}

				}
			});
		}
	}
})();