(function() {
	// Extend the standard ui plugin
	hyryx.editor.JSEditor = function() {
		hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);

		this.customAutoCompletes = [{
			title: 'JSON',
			displayText: 'JSON object',
			className: 'interactiveJSON',
			content: '{"operators": {},"edges": []}',
			regex: /\{"operators".*"edges"[^\}]*\}/g,
			func: this.createInteractiveJSONWidget
		}];
	};

	hyryx.editor.JSEditor.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
		id: hyryx.utils.getID('Editor'),
		exampleCode: 'function hyrise_run_op(input)' + "\n" + '{' + "\n\t" + '// your code here...' + "\n" + '}',
		saveGeneration: 0,

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
			this.registerCustomAutoCompletes();
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
			this.updateInteractiveJSONs();
			result.source = this.editor.getValue();
			return result;
		},

		updateInteractiveJSONs: function() {
			var self = this;
			$.each($.grep(this.editor.getAllMarks(), function(mark) {
				return mark.className === 'interactiveJSON';
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
					self.createInteractiveJSONWidget(mark.doc.cm, title, content, className, from, to)
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

			var self= this,
				current = this.getCurrentSource(this.generation);
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
				value: '',
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
			this.generation = 0;
			this.editor.setSize(null, 500);
			this.editor.setValue(this.exampleCode);
		},

		registerEvents: function() {
			var self = this;
			this.targetEl.on(
				'click', 'button.button-execute', this.execute.bind(this)
			);
			this.targetEl.on(
				'click', '.interactiveJSON', function() {
					self.emit("editJsonQuery", $(this));
				}
			);
		},

		registerCustomAutoCompletes: function() {
			var self = this;
			var orig = CodeMirror.hint.javascript;
			CodeMirror.hint.javascript = function(cm) {
				var inner = orig(cm) || {from: cm.getCursor(), to: cm.getCursor(), list: []};
				$.each(self.customAutoCompletes, function(idx, autoComplete) {
					inner.list.push({
						text: autoComplete.title,
						displayText: autoComplete.displayText,
						hint: function(cm, me, data) {
							autoComplete.func(cm, data.text, autoComplete.content, autoComplete.className, me.from, me.to);
						}
					});
				});
				return inner;
			};
		},

		createInteractiveJSONWidget: function(cm, title, text, className, from, to) {
			text = (text.length === 0) ? ' ' : text;

			var widget = document.createElement('span');
			widget.className = className;
			widget.textContent = title;
			widget.dataset.content = text;

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
		},

		showContent: function(content) {
			var self = this;
			this.editor.setValue(content);
			this.editor.eachLine(function(line) {
				var lineNumber = self.editor.getLineNumber(line);
				$.each(self.customAutoCompletes, function(i, autoComplete) {
					$.each(line.text.allRegexMatches(autoComplete.regex), function(j, match) {
						autoComplete.func(self.editor, autoComplete.title, match.content,
							autoComplete.className, {line: lineNumber, ch: match.from},
							{line: lineNumber, ch: match.to});
					});
				});
			});
		}
	});
})();
