if ('undefined' === typeof hyryx) { var hyryx = {}; }

(function() {

	hyryx.utils = (function() {

		function getID(cls) {
			if (!this.uniqueId) {
				this.uniqueId = (new Date()).getTime();
			}
			return '' + (this.uniqueId++) + '-' + (cls||'Object');
		}

		function showScreen(id) {
			var hash = (window.location.hash || '').trim().split('#')[1];

			// the default page
			id = (id || hash || '').trim() || 'explorer';
			var $target = $('.navbar-nav a[href=#page-'+id+']');

			$target.click();
		}

		function getConfigForProperty(type, key) {
			if (hyryx.stencils[type] && hyryx.stencils[type][key] && hyryx.stencils[type][key].type) {
				return hyryx.stencils[type][key];
			}
		}

		function getConfigForValue(type, key) {
			var propConfig = getConfigForProperty(type, key);
			if (propConfig) {
				return propConfig.valueConfig;
			}
		}

		function getTypedValueForKey(type, value) {
			if (type == 'number') {
				return parseInt(value);
			}

			return value;
		}

		function serializeNode(node) {
			
			var o = {};

			$.each(node, function(key, value) {
				if ('undefined' !== typeof value.value) {
					o[key] = value.value;
				} else {
					o[key] = value;
				}
			});

			o._position = node.getPosition();

			return o;
		}

		function highlightJSON(json) {
			if ('object' === typeof json) {
				json = JSON.stringify(json, null, 4);
			}

			return json;
		}

		return {
			getID : getID,
			showScreen : showScreen,
			getConfigForProperty : getConfigForProperty,
			getConfigForValue : getConfigForValue,
			getTypedValueForKey : getTypedValueForKey,
			serializeNode : serializeNode,
			highlightJSON : highlightJSON
		};

	})();

	function repeat(s, count) {
		return new Array(count + 1).join(s);
	}
})();
