if ('undefined' === typeof hyryx) { var hyryx = {}; }

(function() {
	hyryx.utils = (function() {

		function getID(cls) {
		  if (!this.uniqueId) {
		    this.uniqueId = (new Date()).getTime();
		  }
		  return '' + (this.uniqueId++) + '#' + (cls||'Object');
		};

		function showScreen() {
			var hash = window.location.hash;
			// the default page
			var $target = $('#tag a[href=#page-explorer]');

			if (hash.trim()) {
				var target = hash.replace('#', '#page-');
				if ($('#tag a[href='+target+']')[0]) {
					$target = $('#tag a[href='+target+']');
				}
			}

			$target.click();			
		}

		function highlightJSON(json) {
			if ('object' === typeof json) {
				json = JSON.stringify(json, null, 4);
			}
		    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		        var cls = 'lit';
		        if (/^"/.test(match)) {
		            if (/:$/.test(match)) {
		                cls = 'typ';
		            } else {
		                cls = 'str';
		            }
		        } else if (/true|false/.test(match)) {
		            cls = 'typ';
		        } else if (/null/.test(match)) {
		            cls = 'tag';
		        }
		        return '<span class="' + cls + '">' + match + '</span>';
		    });
		}

		return {
			getID : getID,
			showScreen : showScreen,
			highlightJSON : highlightJSON
		};

	})();
})();