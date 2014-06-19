(function() {

	var template,
		AVAIL_TYPES = ["success", "info", "warning", "danger"];

	$.get('templates/alert.mst', function(loaded) {
		template = loaded;
		Mustache.parse(template);
	});

	$('.alerts').on('click', '.alert', function(event) {
		$(this).remove();
	});

	hyryx.Alerts = {

		add: function(type, message, strong) {
			if(0 > $.inArray(type, AVAIL_TYPES)) {
				console.error("This alert type does not exist!");
				return;
			}
			var $new_alert = $(Mustache.render(template, {
				type: type,
				message: message,
				strong: strong
			}));
			$('.alerts').append($new_alert);
			return window.setTimeout(function() {
				if ($new_alert) {
					$new_alert.fadeOut(function() {
						$new_alert.remove();
					});
				}
			}, 3000);
		}

	};

	$.each(AVAIL_TYPES, function(index, value) {
		// defines "addSuccess", "addInfo", ...
		// ([title,] message): title is bold
		var functionName = "add" + value.charAt(0).toUpperCase() + value.slice(1);
		hyryx.Alerts[functionName] = (function(){
			return function(strong, message) {
				if (arguments.length < 2) {
					message = strong;
					strong = undefined;
				}
				return hyryx.Alerts.add(value, message, strong);
			};
		})();
	});

})();
