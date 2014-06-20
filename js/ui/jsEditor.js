(function() {
	var disableChanges = false;

	// Extend the standard ui plugin
	hyryx.editor.JSEditor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);

		this.saveGeneration = 0;
		this.id = hyryx.utils.getID('Editor');

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
					self.createInteractiveQueryWidget(self, mark.doc.cm, content, from, to)
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
						self.renewResultData(data);
						self.showPerformanceData(data);
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
						for (line in perf.subQueryPerformanceData) {
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
				gutters: ['CodeMirror-lint-markers'],
				lineNumbers: true,
				minHeight: 500,
				indentWithTabs: true,
				indentUnit: 4,
				gutters: ['CodeMirror-linenumbers', 'gutters-highlighted-lines'],
				extraKeys: {
					"Ctrl-Space": function(cm) { self.server.complete(cm); },
					"Alt-Space": function(cm) { self.server.complete(cm); },
					"Ctrl-I": function(cm) { self.server.showType(cm); },
					"Alt-.": function(cm) { self.server.jumpToDef(cm); },
					"Alt-,": function(cm) { self.server.jumpBack(cm); },
					"Ctrl-Q": function(cm) { self.server.rename(cm); },
					"Ctrl-.": function(cm) { self.server.selectName(cm); }
				}
			});
			this.editor.on('cursorActivity', function(cm) { self.server.updateArgHints(cm); });
			this.editor.on('change', function(cm) { self.invalidatePerformanceData(); });
			this.editor.on('change', this.handleChanges.bind(this));
			this.generation = 0;
			this.editor.setSize(null, 500);
		},

		registerEvents: function() {
			var self = this;
			this.targetEl.on(
				'click', 'button.button-execute', this.execute.bind(this)
			);
			this.targetEl.on('click', '.performance-time span.stepInto', function() {
				var lineNumber = $(this).closest('.performance-time').data('line-number') - 1;
				var varName = $(this).closest('.CodeMirror-gutter-wrapper').parent().prev().find('pre .cm-variable-2:first').text();
				self.showExecutedQueryPlan(lineNumber, varName);
			})
			this.targetEl.on(
				'click', '.interactiveQuery', function(event, data) {
					data = (typeof data !== 'undefined') ? data.data : data;
					var content = this.dataset.content;
					var matcher = /^buildQuery\((.*)\)$/g;

					if (match = matcher.exec(content)) {
						var args = JSON.parse('[' + match[1] + ']');
						var query = {
							operators: args[0] || {},
							edges: args[1] || []
						}

						self.emit('editJsonQuery', this, query, data);
					}
				}
			);
		},

		showExecutedQueryPlan: function(lineNumber, varName) {
			console.log('var!!!!!', varName, lineNumber);
			var self = this;
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
								if ((value.start.line > prev.start.line || (value.start.line == prev.start.line && value.start.ch > prev.start.ch))
									&& self.editor.getLineHandle(value.start.line).text.indexOf('buildQuery') !== -1
									&& value.start.line <= lineNumber)
									return value;
								return prev;
							}, definition);
							// find interactive query object in code line
							var bubble = $('#frame_editor .CodeMirror-code > div:nth-child(' + (last.start.line+1) + ') .interactiveQuery:first-child');
							// determine performance data for interactive query object
							var perfData = (self.resultData && self.resultData[lineNumber+1]) ? self.resultData[lineNumber+1] : undefined;
							// click on bubble with performance data
							bubble.trigger('click', {data: perfData});
						} else {
							console.error('Could not determine query object refs:', err)
						}
					});
				} else {
					console.error('Could not determine query object definition:', err)
				}
			});
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

		createInteractiveQueryWidget: function(self, cm, text, from, to) {
			text = (text.length === 0) ? ' ' : text;

			var title = 'QUERY';
			var className = 'interactiveQuery';

			var widget = document.createElement('span');
			widget.className = className;
			widget.textContent = title;
			widget.dataset.content = text;
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
			msg.appendChild(document.createTextNode(text));
			msg.className = 'highlighted-line ' + className;
			msg.dataset.lineNumber = lineNumber;
			if (widget !== undefined) {
				msg.appendChild(widget);
			}

			this.editor.setGutterMarker(lineNumber, 'gutters-highlighted-lines', msg);
			this.highlightedLines[lineNumber] = msg;
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
						self.highlightLine(parseInt(lineNumber), duration.toString() + ' cycles', 'performance-time ' + f_duration_class(duration), widget);
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
			this.editor.clearGutter('gutters-highlighted-lines');
			for (var line in this.highlightedLines) {
				var msg = this.highlightedLines[line];
				msg.className = msg.className + ' invalid';
				this.editor.setGutterMarker(parseInt(line), 'gutters-highlighted-lines', msg);
			}
		}

	});
})();
