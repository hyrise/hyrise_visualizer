(function() {

	hyryx.Database = {

		runQuery : function(query) {
			return $.ajax({
				url : hyryx.settings.database + '/jsonQuery/',
				type : 'POST',
				dataType: 'json',
				data : {
					query: JSON.stringify(query),
					limit: 0
				}
			}).fail(function(jqXHR, textStatus, errorThrown ) {
				console.log('Could not execute query: ' + textStatus + errorThrown);
			});
		},

		Query : {

			//

		}

	};

})();
