if ('undefined' === typeof hyryx) { var hyryx = {}; }

(function() {

	hyryx.utils = (function() {

		function getID(cls) {
		  if (!this.uniqueId) {
		    this.uniqueId = (new Date()).getTime();
		  }
		  return '' + (this.uniqueId++) + '-' + (cls||'Object');
		};

		function showScreen(id) {
            var hash = (window.location.hash||'').trim().split('#')[1];

            id = 'explorer';//(id||hash||'').trim() || 'explorer';
			// var hash = window.location.hash;
			// the default page
			var $target = $('.navbar-nav a[href=#page-'+id+']');

			// if (hash.trim()) {
			// 	var target = hash.replace('#', '#page-');
			// 	if ($('#tag a[href='+target+']')[0]) {
			// 		$target = $('#tag a[href='+target+']');
			// 	}
			// }
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

            // return {
            //     type : node.type,
            //     data : node.data,
            //     _position : node.getPosition()
            // };
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
            serializeNode : serializeNode,
			highlightJSON : highlightJSON
		};

	})();

	function repeat(s, count) {
        return new Array(count + 1).join(s);
    }
})();