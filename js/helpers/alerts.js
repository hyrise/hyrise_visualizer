(function() {

	var template,
		AVAIL_TYPES = ["success", "info", "warning", "danger"];

	$.get('templates/alert.mst', function(loaded) {
		template = loaded;
		Mustache.parse(template);
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
				$new_alert.fadeOut();
			}, 3000);
		}

	};

	$.each(AVAIL_TYPES, function(index, value) {
		// defines "addSuccess", "addInfo", ...
		var functionName = "add" + value.charAt(0).toUpperCase() + value.slice(1);
		hyryx.Alerts[functionName] = (function(){
			return function(message, strong) {
				return hyryx.Alerts.add(value, message, strong);
			};
		})();
	});

})();
