(function() {

	function request(data, dataType) {
		if (dataType === undefined)
			dataType = 'json';
		return $.ajax({
			url : hyryx.settings.database + '/JSProcedure/',
			type : 'POST',
			dataType: dataType,
			data: {procedure: JSON.stringify(data), performance: true}
		});
	}

	hyryx.ProcedureStore = {
		// wrapper for Hyrise stored procedure interface
		// https://github.com/hyrise/mp2014/blob/development/docs/documentation/queryexecution/v8ops.rst#api-for-retrieving-storing-and-executing-stored-javascript-procedures

		get:  function(procedureName) {
			if(procedureName === undefined) {
				// get whole list of stored procedure names
				return request({
					action: 'get'
				});
			} else {
				// get source of stored procedure with given name
				return request({
					action: 'get',
					procedureName: procedureName
				}, 'text');
			}
		},

		create:  function(procedureName, procedureSource) {
			// store procedure with given name and source
			return request({
				action: 'create',
				procedureName: procedureName,
				procedureSource: procedureSource
			}, 'text');
		},

		delete: function(procedureName) {
			console.log('name', procedureName);
			return request({
				action: 'delete',
				procedureName: procedureName
			}, 'text');
		},

		execute:  function(procedureName, papi) {
			var params = {
				action: 'execute',
				procedureName: procedureName
			};
			if (papi !== undefined) {
				params.papiEvent = papi;
			}

			// execute procedure with given name
			return request(params);
		},

		executeSource:  function(procedureSource, papi) {
			var params = {
				action: 'execute',
				procedureSource: procedureSource
			};
			if (papi !== undefined) {
				params.papiEvent = papi;
			}

			// execute source directly
			return request(params);
		},

		papiEvents: function() {
			// get list of available PAPI events
			return request({
				action: 'papiEventsAvailable'
			});
		}

	};

})();
