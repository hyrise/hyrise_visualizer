(function() {

	hyryx.ProcedureApi = {
		"!name": "hyrise",
		"!define": {
			"field": {
				"type": "string",
				"name": "string"
			},
			"table": {
				"getValueInt": {
					"!type": "fn(col: int, row: int) -> int"
				},
				"getValueFloat": {
					"!type": "fn(col: int, row: int) -> float"
				},
				"getValueString": {
					"!type": "fn(col: int, row: int) -> string"
				},
				"setValueInt": {
					"!type": "fn(col: int, row: int, value: int)"
				},
				"setValueFloat": {
					"!type": "fn(col: int, row: int, value: float)"
				},
				"setValueString": {
					"!type": "fn(col: int, row: int, value: string)"
				},
				"size": {
					"!type": "fn() -> int"
				},
				"columnCount": {
					"!type": "fn() -> int"
				},
				"asArray": {
					"!type": "fn() -> [[]]"
				}
			},
			"query": {
				"operators": "object",
				"edges": "[edge]"
			},
			"edge": "[string, string]"
		},
		"getAttributeVectors": {
			"!type": "fn()",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": "Access the underlying table storage object."
		},
		"valueId": {
			"!type": "fn(arg: string)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": "Return the value ID struct with value ID and table ID."
		},
		"valueIdV": {
			"!type": "fn(arg: string)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": "Return only the value ID of the value ID struct."
		},
		"resize": {
			"!type": "fn(size: int)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": "Resize the table, if possible. Throw an exception otherwise."
		},
		"setValueInt": {
			"!type": "fn(column: string, value: int)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": ""
		},
		"setValueFloat": {
			"!type": "fn(column: string, value: float)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": ""
		},
		"setValueString": {
			"!type": "fn(column: string, value: string)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": ""
		},
		"getValueInt": {
			"!type": "fn(column: string)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": ""
		},
		"getValueFloat": {
			"!type": "fn(column: string)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": ""
		},
		"getValueString": {
			"!type": "fn(column: string)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": ""
		},
		"copyStructureModifiable": {
			"!type": "fn(column: string)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": ""
		},
		"createPointerCalculator": {
			"!type": "fn(column: string)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": ""
		},
		"buildVerticalTable": {
			"!type": "fn(table1: string, table2: string)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": "Concatenate two tables and build a vertical table."
		},
		"include": {
			"!type": "fn(filename: string)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": "Include a file and make all functions globally available."
		},
		"log": {
			"!type": "fn(message: string)",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": "Log a string to the HYRISE logging facilities."
		},
		"buildTable": {
			"!type": "fn(fields: [field], groups: [int]) -> table",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": "Create a custom output table."
		},
		"executeQuery": {
			"!type": "fn(query: query, input: table) -> table",
			"!url": "http://hyrise.github.io/hyrise/queryexecution/v8ops.html#using-javascript-for-plan-operations",
			"!doc": "Execute a database query and return the results."
		},
		"buildQuery()": {
			"!type": "fn() -> query",
			"!doc": "Create a query object."
		}
	};

})();
