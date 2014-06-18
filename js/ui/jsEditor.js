(function() {
	var disableChanges = false;

	// Extend the standard ui plugin
	hyryx.editor.JSEditor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);

		this.saveGeneration = 0;
		this.id = hyryx.utils.getID('Editor');

		this.highlightedLines = {};
	};

	hyryx.editor.JSEditor.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		exampleCode: 'function hyrise_run_op(input)' + "\n" + '{' + "\n\t" + '// your code here...' + "\n" + '}',

		/** Create a container for a SVG canvas and a container for the text editor */
		render: function(callback) {
			var self = this;
			$.get('templates/jsEditor.mst', function(template) {
				var rendered = Mustache.render(template, {
					id: self.id,
					submitbutton: true
				});
				callback(rendered);
			});
		},

		/** Instantiate the Canvas and add the editor for the JSON representation */
		init: function() {
			this.registerEditor();
			this.registerEvents();
		},

		getCurrentSource: function(generation) {
			// returns current content of the editor
			// if generation is given:
			//	- checks if content changed since then and return false if not
			//  - otherwise change generation and return new one
			var result = {};

			if (generation !== undefined) {
				if (this.editor.isClean(generation)) {
					return false;
				} else {
					result.generation = this.editor.changeGeneration();
				}
			}
			this.updateInteractiveQuerys();
			result.source = this.editor.getValue();
			return result;
		},

		updateInteractiveQuerys: function() {
			var self = this;
			$.each($.grep(this.editor.getAllMarks(), function(mark) {
				return mark.className === 'interactiveQuery';
			}), function(i, mark) {
				var lineNumber = mark.doc.getLineNumber(mark.lines[0]);
				$.each($.grep(mark.lines[0].markedSpans, function(span) {
					return span.marker === mark;
				}), function(j, span) {
					var from = {line: lineNumber, ch: span.from};
					var to = {line: lineNumber, ch: span.to};
					var content = mark.widgetNode.firstChild.dataset.content;
					var title = mark.widgetNode.firstChild.innerText;
					var className = mark.className;
					self.createInteractiveQueryWidget(mark.doc.cm, content, from, to)
				});
			});
		},

		save: function(procedureName) {
			var currentSource = this.getCurrentSource(this.saveGeneration);

			if(!currentSource) {
				console.log("no need to save - source didn't changed");
				hyryx.Alerts.addInfo("Procedure was not modified since last save.");
				return;
			}

			this.saveGeneration = currentSource.generation;

			var self = this;
			hyryx.ProcedureStore.create(
				procedureName,
				currentSource.source
			).done(function() {
				console.log("success! procedure saved!");
				hyryx.Alerts.addSuccess("Procedure successfully saved!");
			}).fail(function(jqXHR, textStatus, errorThrown) {
				console.log("Couldn't save procedure: " + textStatus + ", " + errorThrown);
				hyryx.Alerts.addDanger("Couldn't save procedure", textStatus + ", " + errorThrown);
			}).always(function() {
				self.emit("procedureSaved", arguments);
			});
		},

		execute: function() {
			console.log("Execute stored procedure...");

			var self = this;
			var current = this.getCurrentSource(this.generation);
			if (current) {
				this.generation = current.generation;
				hyryx.ProcedureStore.executeSource(current.source).done(function(data) {
					if (data.error) {
						hyryx.Alerts.addWarning("Error while executing procedure", data.error);
						console.error("Error executing procedure:" + data.error);
					} else {
						hyryx.Alerts.addSuccess("Procedure executed");
						console.log(data);

						self.emit("procedureExecuted", data);
						self.showPerformanceData(data);
					}
				}).fail(function(jqXHR, textStatus, errorThrown) {
					hyryx.Alerts.addDanger("Error while executing procedure", textStatus + ' ' + errorThrown);
					console.log("Couldn't post/execute jsprocedure: " + textStatus + errorThrown);
				});
			} else {
				hyryx.Alerts.addInfo("Procedure didn't changed and won't be executed");
				console.log("Nothing changed - nothing to do");
			}
		},

		registerEditor: function() {
			var server = new CodeMirror.TernServer({defs: [hyryx.ProcedureApi]});

			this.editor = CodeMirror(document.getElementById(this.id), {
				value: this.exampleCode,
				mode: 'javascript',
				theme: 'solarized light',
				lint: true,
				gutters: ['CodeMirror-lint-markers'],
				lineNumbers: true,
				minHeight: 500,
				indentWithTabs: true,
				indentUnit: 4,
				extraKeys: {
					"Ctrl-Space": function(cm) { server.complete(cm); },
					"Alt-Space": function(cm) { server.complete(cm); },
					"Ctrl-I": function(cm) { server.showType(cm); },
					"Alt-.": function(cm) { server.jumpToDef(cm); },
					"Alt-,": function(cm) { server.jumpBack(cm); },
					"Ctrl-Q": function(cm) { server.rename(cm); },
					"Ctrl-.": function(cm) { server.selectName(cm); }
				}
			});
			this.editor.on('cursorActivity', function(cm) { server.updateArgHints(cm); });
			this.editor.on('change', this.handleChanges.bind(this));
			this.generation = 0;
			this.editor.setSize(null, 500);
		},

		registerEvents: function() {
			var self = this;
			this.targetEl.on(
				'click', 'button.button-execute', this.execute.bind(this)
			);
			this.targetEl.on(
				'click', '.interactiveQuery', function() {
					var content = this.dataset.content;
					var matcher = /^buildQuery\((.*)\)$/g;

					if (match = matcher.exec(content)) {
						var args = JSON.parse('[' + match[1] + ']');
						var query = {
							operators: args[0] || {},
							edges: args[1] || []
						}

						self.emit('editJsonQuery', this, query);
					}
				}
			);
		},

		handleChanges: function(cm, change) {
			if (disableChanges) return;

			var lineHandle = this.editor.getLineHandle(change.to.line);
			this.parseLine(lineHandle);
		},

		updateWidget: function(widget, query) {
			var operators = JSON.stringify(query.operators);
			var edges = JSON.stringify(query.edges);

			var methodCall = 'buildQuery(' + operators + ', ' + edges + ')';
			widget.dataset.content = methodCall;
		},

		createInteractiveQueryWidget: function(cm, text, from, to) {
			text = (text.length === 0) ? ' ' : text;

			var title = 'QUERY';
			var className = 'interactiveQuery';

			var widget = document.createElement('span');
			widget.className = className;
			widget.textContent = title;
			widget.dataset.content = text;

			disableChanges = true;

			cm.replaceRange(text, from, to);
			cm.markText(from, {
				line: from.line,
				ch: from.ch + text.length
			}, {
				handleMouseEvents: true,
				replacedWith: widget,
				shared: true,
				addToHistory: true,
				className: className
			});

			disableChanges = false;
		},

		showContent: function(content) {
			this.clearOverlays();
			this.editor.setValue(content);
			this.editor.eachLine(this.parseLine.bind(this));
		},

		parseLine: function(line) {
			if ( ! line) return;

			var self = this;
			var lineNumber = self.editor.getLineNumber(line);

			var regex = /buildQuery\([^)]*\)/g;

			$.each(line.text.allRegexMatches(regex), function(j, match) {
				self.createInteractiveQueryWidget(
					self.editor,
					match.content,
					{line: lineNumber, ch: match.from},
					{line: lineNumber, ch: match.to}
				);
			});
		},

		clearOverlays: function() {
			this.removeAllHighlightedLines();
		},

		highlightLine: function(lineNumber, text, className) {
			var msg = document.createElement("div");
		    msg.appendChild(document.createTextNode(text));
		    msg.className = className;
		    var widget = this.editor.addLineWidget(lineNumber, msg, {coverGutter: false});
			this.highlightedLines[lineNumber] = widget;
		},

		removeHighlightedLine: function(lineNumber, safe) {
			safe = (safe === undefined) ? true : safe;
			if (!safe || this.highlightedLines[lineNumber]) {
				this.highlightedLines[lineNumber].clear();
				delete this.highlightedLines[lineNumber];
			}
		},

		removeAllHighlightedLines: function() {
			for (lineNumber in this.highlightedLines) {
				this.removeHighlightedLine(lineNumber, false);
			}
		},

		showPerformanceData: function(data) {
			var self = this;
			if (data && data.performanceData) {
				data.performanceData.forEach(function(perf) {
					for (lineNumber in perf.subQueryPerformanceData) {
						var content = perf.subQueryPerformanceData[lineNumber].reduce(function(prev, value) {
							return prev + value.duration;
						}, 0);
						self.highlightLine(lineNumber-1, content.toString() + ' cycles', "performance-time");
					}
				});
			}
		}

	});
})();
