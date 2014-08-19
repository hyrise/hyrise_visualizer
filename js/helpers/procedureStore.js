(function() {

	function request(data, dataType) {
		if (dataType === undefined)
			dataType = 'json';

		data.performance = true;
		if (data.procedure) {
			data.procedure = JSON.stringify(data.procedure);
		}

		return $.ajax({
			url : hyryx.settings.database + '/JSProcedure/',
			type : 'POST',
			dataType: dataType,
			data: data
		});
	}

	hyryx.ProcedureStore = {
		// wrapper for Hyrise stored procedure interface
		// https://github.com/hyrise/mp2014/blob/development/docs/documentation/queryexecution/v8ops.rst#api-for-retrieving-storing-and-executing-stored-javascript-procedures

		get:  function(procedureName) {
			if(procedureName === undefined) {
				// get whole list of stored procedure names
				return request({
					procedure: {
						action: 'get'
					}
				});
			} else {
				// get source of stored procedure with given name
				return request({
					procedure: {
						action: 'get',
						procedureName: procedureName
					}
				}, 'text');
			}
		},

		create:  function(procedureName, procedureSource) {
			// store procedure with given name and source
			return request({
				procedure: {
					action: 'create',
					procedureName: procedureName,
					procedureSource: procedureSource
				}
			}, 'text');
		},

		delete: function(procedureName) {
			console.log('name', procedureName);
			return request({
				procedure: {
					action: 'delete',
					procedureName: procedureName
				}
			}, 'text');
		},

		execute:  function(procedureName, papi) {
			var params = {
				procedure: {
					action: 'execute',
					procedureName: procedureName
				}
			};
			if (papi !== undefined) {
				params.procedure.papiEvent = papi;
			}

			// execute procedure with given name
			return request(params);
		},

		executeSource:  function(procedureSource, proc_params, papi) {
			var params = {
				procedure: {
					action: 'execute',
					procedureSource: procedureSource
				}
			};
			if (papi !== undefined) {
				params.procedure.papiEvent = papi;
			}
			if (proc_params) {
				params.parameter = proc_params;
			}

			// execute source directly
			return request(params);
		},

		papiEvents: function() {
			// get list of available PAPI events
			return request({
				procedure: {
					action: 'papiEventsAvailable'
				}
			});
		}

	};

})();
