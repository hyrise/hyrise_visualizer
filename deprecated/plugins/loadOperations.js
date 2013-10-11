

var jsons = {};
var tables =[];
var columns = [];
var predicates = [];
var expressions = [];

jQuery.ajax('tables.json', {
	success : function(data) {
		tables = data.tables;
		// columns = data.tables.pluck('columns').flatten().compact();
	}
});

jQuery.ajax('operations.json', {
	success : function(data) {
		$H(data).each(function(d) {
			if ($H(d.value).size()) {
				jsons[d.key] = d.value;
			};
		});

		updateOpList();
	}
});

jQuery.ajax('predicates.json', {
  success : function(data) {
    predicates = data.predicates;
    expressions = data.expressions;
  }
});

function updateOpList() {
	if (jsons) {
		var opList = $H(jsons).map(function(p) {
			var domEl = jQuery('<li id="'+p.key+'" ondragstart="drag(event)" draggable="true">'+p.key+'</li>');
			return domEl;
		});

		jQuery('#stencil-container').html(opList);
		init();
	}
}

function drag(ev) {	
	ev.dataTransfer.setData("id", ev.target.id);
	ev.dataTransfer.setData('json', JSON.stringify(jsons[ev.target.id]));
}

var defaultJSON = {
  "operators": {
    "load_reference": {
      "type": "TableLoad",
      "table": "reference",
      "filename": "tables/employees_revised.tbl"
    },
    "noop" : {
      "type" : "NoOp"
    },
    "load_main" : {
      "type" : "TableLoad",
      "table": "main", //TODO: Remove
      "filename": "tables/employees.tbl"
    },
    "load_delta" : {
      "type": "TableLoad",
      "table": "delta", //TODO: Remove
      "filename": "tables/employees_new_row.tbl"
    },
    "merge": {
      "type" : "MergeTable"
    }
  }, 
  "edges": [["load_reference", "noop"], 
            ["noop", "load_main"], 
            ["noop", "load_delta"], 
            ["load_main", "merge"], 
            ["load_delta", "merge"]]
};