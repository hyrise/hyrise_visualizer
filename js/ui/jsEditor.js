(function() {
	var disableChanges = false;

	// Extend the standard ui plugin
	hyryx.editor.JSEditor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);

		this.saveGeneration = 0;
		this.id = hyryx.utils.getID('Editor');
		this.mayExecute = true;
		this.shouldExecute = false;
		this.executeImmediate = true;
		this.ignoreChanges = false;	// ignore changes made between change event and "real" execution

		this.server = new CodeMirror.TernServer({defs: [hyryx.ProcedureApi]});

		this.queryWidgets = {};
		this.highlightedLines = {};
		this.resultData = undefined;
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
			this.registerStreamGraph();
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
				if (mark.lines.length == 0) return;
				
				var lineNumber = mark.doc.getLineNumber(mark.lines[0]);
				$.each($.grep(mark.lines[0].markedSpans, function(span) {
					return span.marker === mark;
				}), function(j, span) {
					var from = {line: lineNumber, ch: span.from};
					var to = {line: lineNumber, ch: span.to};
					var content = mark.widgetNode.firstChild.dataset.content;
					self.createInteractiveQueryWidget(self, mark.doc.cm, content, from, to);
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

		execute: function(papi) {
			console.log("Execute stored procedure...");

			var self = this;
			var current = this.getCurrentSource(this.generation);
			if (current) {
				this.generation = current.generation;
				this.startExecution();
				hyryx.ProcedureStore.executeSource(current.source, papi).done(function(data) {
					if (data.error) {
						hyryx.Alerts.addWarning("Error while executing procedure", data.error);
						console.error("Error executing procedure:" + data.error);
					} else {
						hyryx.Alerts.addSuccess("Procedure executed");
						console.log(data);

						self.emit("procedureExecuted", data, papi);
						self.renewResultData(data);
						self.showPerformanceData(data);

						if (data.subQueryDataflow) {
							self.enrichExecutionData(data);
							self.streamGraph.updateData(data.subQueryDataflow, data.lineCount, data.performanceData);
						}
					}
				}).fail(function(jqXHR, textStatus, errorThrown) {
					hyryx.Alerts.addDanger("Error while executing procedure", jqXHR.responseText);
					console.log("Couldn't post/execute jsprocedure: " + textStatus + errorThrown);
				});
			} else {
				hyryx.Alerts.addInfo("Procedure didn't changed and won't be executed");
				console.log("Nothing changed - nothing to do");
			}
		},

		renewResultData: function(data) {
			var self = this;
			this.resultData = {};
			if (data.performanceData) {
				data.performanceData.forEach(function(perf) {
					if (perf.subQueryPerformanceData) {
						for (var line in perf.subQueryPerformanceData) {
							self.resultData[line] = perf.subQueryPerformanceData[line];
						}
					}
				});
			}
		},

		registerEditor: function() {
			var self = this;

			this.editor = CodeMirror(document.getElementById(this.id), {
				value: this.exampleCode,
				mode: 'javascript',
				theme: 'solarized light',
				lint: true,
				lineNumbers: true,
				minHeight: 500,
				indentWithTabs: true,
				indentUnit: 4,
				gutters: ['CodeMirror-lint-markers', 'CodeMirror-linenumbers', 'gutters-highlighted-lines'],
				extraKeys: {
					"Ctrl-X": function(cm) { self.streamGraph.loadSample(); },
					"Ctrl-Y": function(cm) { self.streamGraph.resetData(); },
					"Ctrl-Space": function(cm) { self.server.complete(cm); },
					"Alt-Space": function(cm) { self.server.complete(cm); },
					"Ctrl-I": function(cm) { self.server.showType(cm); },
					"Alt-.": function(cm) { self.server.jumpToDef(cm); },
					"Alt-,": function(cm) { self.server.jumpBack(cm); },
					"Ctrl-Q": function(cm) { self.server.rename(cm); },
					"Ctrl-.": function(cm) { self.server.selectName(cm); },
					"Ctrl-S": function() { self.save(); }
				}
			});
			this.editor.on('cursorActivity', function(cm) { self.server.updateArgHints(cm); });
			this.editor.on('change', function(cm) { self.invalidatePerformanceData(); });
			this.editor.on('change', this.handleChanges.bind(this));
			this.editor.on('changes', this.executeLive.bind(this));
			this.generation = 0;
			this.editor.setSize(null, 500);
		},

		registerEvents: function() {
			var self = this;
			this.targetEl.on('click', 'button.button-execute', function() {
				self.execute();
			});
			this.targetEl.on('click', 'button.button-immediate', function() {
				self.toggleImmediate(this);
			});
			this.targetEl.on('click', '.performance-time span.stepInto', function() {
				var lineNumber = $(this).closest('.performance-time').data('line-number');
				self.showExecutedQueryPlan($(this), lineNumber);
			});
			this.targetEl.on(
				'click', '.interactiveQuery', function() {
					self.editJsonQuery(this);
				}
			);
		},

		registerStreamGraph: function() {
			this.streamGraph = new hyryx.editor.Streamgraph($('#frame_editor .CodeMirror-sizer'));
		},

		editJsonQuery: function(element, data) {
			var content = element.dataset.content;
			var line = element.dataset.line;
			var matcher = /^buildQuery\((.*)\)$/g;
			var match = matcher.exec(content);

			if (match) {
				var args = JSON.parse('[' + match[1] + ']');
				var query = {
					operators: args[0] || {},
					edges: args[1] || []
				};

				var parameters = this.findQueryParamsFromAST(tern.parse(this.editor.getLineHandle(line).text));

				this.emit('editJsonQuery', element, query, parameters, data);
			}
		},

		findParamsFromAST: function(node) {
			if (node.type !== 'Program') return [];

			var params = [];
			for (var func in node.body) {
				if (func.type !== 'FunctionDeclaration') continue;
				if (func.id.name !== 'hyrise_run_op') continue;

				// Remove the first parameter, get the names for the rest.
				params = func.params.splice(0, 1).map(function(elem) {
					return elem.name;
				});
			}

			return params;
		},

		findQueryParamsFromAST: function(node) {
			traversal:
			while (node.type !== 'CallExpression') {
				switch (node.type) {
					case 'Program':
						node = node.body[0];
						break;
					case 'ExpressionStatement':
						node = node.expression;
						break;
					case 'AssignmentExpression':
						node = node.right;
						break;
					case 'VariableDeclaration':
						node = node.declarations[0];
						break;
					case 'VariableDeclarator':
						node = node.init;
						break;
					default:
						break traversal;
				}
			}

			if (node.type !== 'CallExpression') return [];
			if (node.callee.name !== 'executeQuery') return [];
			if (node.arguments.length < 3) return [];
			if (node.arguments[2].type !== 'ObjectExpression') return [];

			return node.arguments[2].properties.map(function(property) {
				return property.key.name;
			});
		},

		showExecutedQueryPlan: function(span, lineNumber) {
			var self = this;
			this.determineQueryObjectCreationLine(span, lineNumber, function(line) {
				// determine interactive query object widget
				var widget = self.editor.getLineHandle(line).markedSpans[0].marker.widgetNode.firstChild;
				// determine performance data for interactive query object
				var perfData = (self.resultData && self.resultData[lineNumber+1]) ? self.resultData[lineNumber+1] : undefined;

				self.editJsonQuery(widget, perfData);
			});
		},

		determineQueryObjectCreationLine: function(span, lineNumber, callback) {
			// check if query object is created in execution line
			if (this.editor.getLineHandle(lineNumber).text.indexOf('buildQuery') !== -1) {
				callback(lineNumber);
				return;
			}

			var self = this;
			var varName = span.closest('.CodeMirror-gutter-wrapper').parent().find('pre .cm-variable-2:first').text();
			var lineHandle = self.editor.getLineHandle(lineNumber);
			var start = {line: lineNumber, ch: lineHandle.text.indexOf(varName)};
			var end = {line: lineNumber, ch: start.ch+varName.length};


			// find definition of variable
			self.server.request(self.editor, {type: 'definition', start: start, end: end}, function(err, definition) {
				if (!err) {
					// find references of variable
					self.server.request(self.editor, {type: 'refs', start: start, end: end}, function(err, refs) {
						if (!err) {
							// determine last assignment of variable
							var last = _.reduce(refs.refs, function(prev, value) {
								if ((value.start.line > prev.start.line || (value.start.line == prev.start.line && value.start.ch > prev.start.ch)) &&
									self.editor.getLineHandle(value.start.line).text.indexOf('buildQuery') !== -1 &&
									value.start.line <= lineNumber - 1)
									return value;
								return prev;
							}, definition);

							callback(last.start.line);
						} else {
							console.error('Could not determine query object refs:', err);
						}
					});
				} else {
					console.error('Could not determine query object definition:', err);
				}
			});
		},

		handleChanges: function(cm, change) {
			if (disableChanges) return;

			var lineHandle = this.editor.getLineHandle(change.to.line);
			this.parseLine(lineHandle);
		},

		toggleImmediate: function(button) {
			this.executeImmediate = !this.executeImmediate;
			$(button).html(this.executeImmediate ? '&#10004' : '&#10008;' );
			// '&#10004' is a tick, '&#10008;' is a cross
			if (this.executeImmediate) {
				this.executeLive();
			}
		},

		isValidCode: function(code) {
			try {
				acorn.parse(code);
				return true;
			} catch (e) {
				return false;
			}
		},

		executeLive: function() {
			if (! this.executeImmediate || this.ignoreChanges) {
				return;
			}
			if (! this.mayExecute) {
				this.shouldExecute = true;
				console.log('Not running code, another execution seems to be underway.');
				return;
			}
			this.mayExecute = false;
			this.ignoreChanges = true;

			/*if (this.isValidCode(this.editor.getValue())) {
				console.log('Not running code, JS code seems to be faulty.');
				return;
			}*/

			this.execute();
		},

		startExecution: function() {
			var self = this;
			this.ignoreChanges = false;
			// Allow a new execution after five seconds.
			window.setTimeout(function() {
				self.mayExecute = true;
				if (self.shouldExecute) {
					self.shouldExecute = false;
					self.executeLive();
				}
			}, 5000);
		},

		updateWidget: function(widget, query) {
			var operators = JSON.stringify(query.operators);
			var edges = JSON.stringify(query.edges);

			var methodCall = 'buildQuery(' + operators + ', ' + edges + ')';
			widget.dataset.content = methodCall;
		},

		createInteractiveQueryWidget: function(self, cm, text, from, to) {
			text = (text.length === 0) ? ' ' : text;

			var title = 'QUERY';
			var className = 'interactiveQuery';

			var widget = document.createElement('span');
			widget.className = className;
			widget.textContent = title;
			widget.dataset.content = text;
			widget.dataset.line = from.line;
			widget.id = hyryx.utils.getID('QueryWidget');

			disableChanges = true;

			cm.replaceRange(text, from, to);
			var marker = cm.markText(from, {
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
			self.queryWidgets[widget.id] = marker;
		},

		showContent: function(content) {
			this.performanceData = undefined;
			this.clearOverlays();
			this.editor.setValue(content);
			this.streamGraph.updateData();
			this.editor.eachLine(this.parseLine.bind(this));
		},

		parseLine: function(line) {
			if ( ! line) return;

			var self = this;
			var lineNumber = self.editor.getLineNumber(line);

			var regex = /buildQuery\([^)]*\)/g;

			$.each(line.text.allRegexMatches(regex), function(j, match) {
				self.createInteractiveQueryWidget(
					self,
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

		highlightLine: function(lineNumber, text, className, widget) {
			var msg = document.createElement("div");
			msg.className = 'highlighted-line ' + className;
			msg.dataset.lineNumber = lineNumber;
			if (widget !== undefined) {
				msg.appendChild(widget);
			}

			this.editor.setGutterMarker(lineNumber, 'gutters-highlighted-lines', msg);
			this.highlightedLines[lineNumber] = msg;

			if (widget !== undefined) {
				$(widget).tooltip({
					title: text,
					placement: 'right'
				});
			}
		},

		removeAllHighlightedLines: function() {
			this.editor.clearGutter('gutters-highlighted-lines');
			this.highlightedLines= {};
		},

		showPerformanceData: function(data) {
			var self = this;
			this.clearOverlays();
			if (data && data.performanceData) {
				var f_duration_class = self.calculateDurations(data.performanceData);
				data.performanceData.forEach(function(perf) {
					for (var lineNumber in perf.subQueryPerformanceData) {
						var duration = perf.subQueryPerformanceData[lineNumber].duration,
							widget = document.createElement("span");
						widget.className = 'glyphicon glyphicon-circle-arrow-right stepInto';
						self.highlightLine(parseInt(lineNumber-1), duration.toString() + ' CPU cycles', 'performance-time ' + f_duration_class(duration), widget);
					}
				});
			}
		},

		calculateDurations: function(performanceData) {
			var duration,
				maxDuration = 0,
				minDuration = null,
				f_sum_durations = function(prev, value) {
				return prev + value.duration;
			};

			performanceData.forEach(function(perf) {
				for (var lineNumber in perf.subQueryPerformanceData) {
					duration = perf.subQueryPerformanceData[lineNumber].reduce(f_sum_durations, 0);
					perf.subQueryPerformanceData[lineNumber].duration = duration;
					if(duration > maxDuration) {
						maxDuration = duration;
					}
					if(!minDuration || duration < minDuration) {
						minDuration = duration;
					}
				}
			});

			return this.calculatePerformanceClasses(minDuration, maxDuration);
		},

		calculatePerformanceClasses: function(minDuration, maxDuration) {
			if(maxDuration !== minDuration) {
				var section_duration = (maxDuration - minDuration) / 9;
				return function(duration) {
					var section = Math.round((duration - minDuration) / section_duration);
					return 'performance-section-' + section;
				};
			} else {
				return function() {
					return 'performance-section-5';
				};
			}
		},

		invalidatePerformanceData: function() {
			this.streamGraph.resetData();
			this.editor.clearGutter('gutters-highlighted-lines');
			for (var line in this.highlightedLines) {
				var msg = this.highlightedLines[line];
				msg.className = msg.className + ' invalid';
				this.editor.setGutterMarker(parseInt(line), 'gutters-highlighted-lines', msg);
			}
		},

		enrichExecutionData: function(data) {
			// this adds lineCount & last references (for subQueryDataflow)
			var self = this,
				newDataFlow = {};

			$.each(data.subQueryDataflow, function(variable, occurences) {
				// for every variable, find all references to
				var line_of_some_occurence = parseInt(Object.keys(occurences)[0]) - 1,	// "- 1" because editor starts counting with zero
					lineHandle = self.editor.getLineHandle(line_of_some_occurence),
					start = {
						line: line_of_some_occurence,
						ch: 0
					},
					end = {
						line: line_of_some_occurence,
						ch: lineHandle.text.length
					};

				// find the variable name by analyzing the ast of this line
				var ast = tern.parse(lineHandle.text);
				var expr = tern.findExpressionAround(ast, start, end, {});
				// set start and end accoring to the found variable
				start.ch = expr.node.start;
				end.ch = expr.node.end;

				self.server.request(self.editor, {type: 'refs', start: start, end: end}, function(err, refs) {
					if (!err) {
						// determine last use of variable
						var last = _.reduce(refs.refs, function(prev, value) {
							if (value.start.line > prev.start.line){
								return value;
							}
							return prev;
						}, {start: start});

						var next_line = "" + (last.start.line + 2);
						if (!occurences[next_line]) {
							occurences[next_line] = 0;
						}
					} else {
						console.error('Could not determine variables last reference of ' + variable + ':', err);
					}
				});

				newDataFlow[expr.node.name] = occurences;
			});

			data.subQueryDataflow = newDataFlow;
			data.lineCount = this.editor.lineCount() + 1;
		}

	});
})();
