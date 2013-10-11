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

			return formatJson(json);

		    // json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		    // return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
		    //     var cls = 'lit';
		    //     if (/^"/.test(match)) {
		    //         if (/:$/.test(match)) {
		    //             cls = 'typ';
		    //         } else {
		    //             cls = 'str';
		    //         }
		    //     } else if (/true|false/.test(match)) {
		    //         cls = 'typ';
		    //     } else if (/null/.test(match)) {
		    //         cls = 'tag';
		    //     }
		    //     return '<span class="' + cls + '">' + match + '</span>';
		    // });
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

	/**
	 * Manual formatter taken straight from https://github.com/umbrae/jsonlintdotcom
	**/

    function formatJson(json, indentChars) {
        var i           = 0,
            il          = 0,
            tab         = (typeof indentChars !== "undefined") ? indentChars : "    ",
            newJson     = "",
            indentLevel = 0,
            inString    = false,
            inError		= function inNumber(setTo) {
            	// getter
            	if (setTo === undefined) {
            		return this.is;
            	}

            	// setter
            	if (this.is === undefined) {
            		this.is = setTo || false;
            	} else if (this.is !== setTo) {
            		newJson += (setTo ? '<span class="tag">' : '</span>');
            		this.is = setTo;
            	}
            },
            inNumber	= function inNumber(setTo) {
            	// getter
            	if (setTo === undefined) {
            		return this.is;
            	}

            	// setter
            	if (this.is === undefined) {
            		this.is = setTo || false;
            	} else if (this.is !== setTo) {
            		newJson += (setTo ? '<span class="lit">' : '</span>');
            		this.is = setTo;
            	}
            },
            isRightSide = false,
            currentChar = null,
            isNumber	= function isNumber(n) {
            	return !!(+n === 0 || +n);
            };

        for (i = 0, il = json.length; i < il; i += 1) { 
            currentChar = json.charAt(i);

            switch (currentChar) {
            case '{': 
            case '[': 
                if (!inString) {
                    newJson += currentChar + "\n" + repeat(tab, indentLevel + 1);
                    indentLevel += 1; 
                } else { 
                    newJson += currentChar; 
                }
                break; 
            case '}': 
            case ']': 
                if (!inString) { 
                    indentLevel -= 1; 
                    newJson += "\n" + repeat(tab, indentLevel) + currentChar;
                } else { 
                    newJson += currentChar; 
                } 
                break; 
            case ',': 
                if (!inString) { 
                	inNumber(false);
                	inError(false);
                    newJson += ",\n" + repeat(tab, indentLevel); 
                } else {
                    newJson += currentChar; 
                } 
                break; 
            case ':': 
                if (!inString) { 
                    isRightSide = true;
                    inNumber(false);
                    inError(false);
                    newJson += ": ";
                } else { 
                    newJson += currentChar; 
                } 
                break; 
            case "\n":
            	if (!inString) {
            		isRightSide = false;
            		inError(false);
            	}
            case ' ':
            case "\t":
                if (inString) {
                    newJson += currentChar;
                } else {
            		inNumber(false);
                }
                break;
            case '"': 
                if (i > 0 && json.charAt(i - 1) !== '\\') {
                    inString = !inString;
                }
                if (inString) {
                	newJson += '<span class="'+(isRightSide ? 'str' : 'typ')+'">';
                }
                newJson += currentChar; 
                if (!inString) {
                	newJson += '</span>';
                }
                break;
            default: 
            	if (inString) {
            		
            	} else if (/[0-9]/.test(currentChar)) {
					inNumber(true);
            	} else {
            		inError(true);
            	}

        		newJson += currentChar;
                break;                    
            } 
        } 

        // apply different style for boolean
        newJson = newJson.replace(/<span class="tag">(true|false|null)<\/span>/ig, '<span class="typ">$1</span>');

        return newJson;
    };
})();