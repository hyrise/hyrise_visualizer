(function() {

	hyryx.command = (function() {
		
		var commandStack = [],
			redoStack = [];

		function _do(command) {

			if (command instanceof hyryx.command.Command) {
				// store command
				commandStack.push(command);

				// clear redo stack
				redoStack = [];

				command.execute();
			}
		}

		function undo() {
			var c = commandStack.pop();
			if (c) {
				redoStack.push(c);
				c.rollback();
			}
		}

		function redo() {
			var c = redoStack.pop();
			if (c) {
				commandStack.push(c);
				c.execute();
			}
		}

		return {
			'do' : _do,
			undo : undo,
			redo : redo
		};
	})();

	hyryx.command.Command = function(state, doClb) {

		this.oldState = state;
		this.doClb = doClb;

		this.execute();
	}

	hyryx.command.Command.prototype = {

		oldState : null,
		newState : null,

		execute : function() {
			this.newState = this.doClb(this.oldState);
		},

		rollback : function() {
			this.newState = this.oldState;
			this.doClb(this.newState);
		}
	};
})();