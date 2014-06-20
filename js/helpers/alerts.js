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

	function insertAlert(type, message, strong, progress) {
		if(0 > $.inArray(type, AVAIL_TYPES)) {
			console.error("This alert type does not exist!");
			return;
		}
		var $new_alert = $(Mustache.render(template, {
			type: type,
			message: message,
			strong: strong,
			progress: progress
		}));
		$('.alerts').append($new_alert);
		return $new_alert;
	}

	function deleteAlert($alert) {
		if ($alert) {
			$alert.fadeOut(function() {
				$alert.remove();
			});
		}
	}

	hyryx.Alerts = {

		add: function(type, message, strong) {
			var $new_alert = insertAlert(type, message, strong, false);
			if (!$new_alert) {return;}

			return window.setTimeout(
				deleteAlert.bind(this, $new_alert),
				3000
			);
		},

		wait: function(type, message, strong, deferred) {
			var $new_alert = insertAlert(type, message, strong, true);
			if (!$new_alert) {return;}
			deferred.always(
				deleteAlert.bind(this, $new_alert)
			);
		}

	};

	$.each(AVAIL_TYPES, function(index, value) {
		// defines "addSuccess", "addInfo", ...
		// ([title,] message): title is bold
		var namePart = value.charAt(0).toUpperCase() + value.slice(1),
			addFunctionName = "add" + namePart,
			waitFunctionName = "wait" + namePart;

		hyryx.Alerts[addFunctionName] = (function(){
			return function(strong, message) {
				if (arguments.length < 2) {
					message = strong;
					strong = undefined;
				}
				return hyryx.Alerts.add(value, message, strong);
			};
		})();

		hyryx.Alerts[waitFunctionName] = (function(){
			return function(strong, message, deferred) {
				if (arguments.length < 3) {
					deferred = message;
					message = strong;
					strong = undefined;
				}
				return hyryx.Alerts.wait(value, message, strong, deferred);
			};
		})();
	});

})();
