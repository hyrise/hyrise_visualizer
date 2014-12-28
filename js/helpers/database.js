(function() {

	function randomKey() {
		return Math.floor(Math.random() * 1000000);
	}

	hyryx.Database = {

		runQuery : function(query) {
			if (query instanceof this.Query) {
				query = query.serialize();
			}

			return $.ajax({
				url : hyryx.settings.nodes[hyryx.settings.master].host + ":" + hyryx.settings.nodes[hyryx.settings.master].port + '/jsonQuery/',
				type : 'POST',
				dataType: 'json',
				data : {
					query: JSON.stringify(query),
					limit: 0
				},
				success: function(oResult){
					console.log(oResult);
				}
			}).fail(function(jqXHR, textStatus, errorThrown ) {
				console.log('Could not execute query: ' + textStatus + errorThrown);
				hyryx.Alerts.addDanger("Database error:", textStatus + ", " + errorThrown);
			});
		},

		Query : function() {
			return {

				operators: {},
				edges: [],

				addOperator : function(key, op) {
					// If only an op is specified, we generate a key and return it.
					if (op === undefined) {
						op = key;
						key = randomKey();
					}

					this.operators[key] = op;

					return key;
				},

				getOperator : function(key) {
					return this.operators[key];
				},

				addEdge : function(from, to) {
					this.edges.push([from, to]);
				},

				serialize : function() {
					return {
						operators: this.operators,
						edges: this.edges
					};
				}

			};
		}

	};

})();
