(function() {

	function request(data) {
		return $.ajax({
			url : hyryx.settings.database + '/JSProcedure/',
			type : 'POST',
			dataType: 'json',
			data: "procedure=" + encodeURIComponent(JSON.stringify(data))
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
				});
			}
		},

		create:  function(procedureName, procedureSource) {
			// store procedure with given name and source
			return request({
				action: 'create',
				procedureName: procedureName,
				procedureSource: procedureSource
			});
		},

		execute:  function(procedureName) {
			// execute procedure with given name
			return request({
				action: 'execute',
				procedureName: procedureName
			});
		},

		executeSource:  function(procedureSource) {
			// execute source directly
			return request({
				action: 'execute',
				procedureSource: procedureSource
			});
		}

	};

})();
