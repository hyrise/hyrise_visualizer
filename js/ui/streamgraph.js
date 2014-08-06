(function() {

    // Extend the standard ui plugin
    hyryx.editor.Streamgraph = function() {
        this.svgWidth = 50;
        this.svgHeight = 500;
        this.viewPortFrom = 0;
        this.viewPortTo = 26;
        this.reset();
        hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
    };

    hyryx.editor.Streamgraph.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
        render: function(callback) {
            var self = this;
            $.get('templates/streamgraph.mst', function(template) {
                var rendered = $(Mustache.render(template));
                self.frame = rendered.find('#frame_streamgraph');
                self.infoBox = rendered.find('#streamgraph_infobox');
                callback(rendered);
            });
        },

        init: function() {
            console.log('foo', d3.select(this.frame[0]));
            this.el = d3.select(this.frame[0]).append("svg")
                .attr("width", this.svgWidth)
                .attr("height", "100%");
            this.resetData();
        },

        reset: function() {
            this.curent_color = 0;
            this.color_map = {};
        },

        resetData: function() {
            this.updateData({});
        },

        updateData: function(data, lineCount) {
            this.rawData = data;
            this.data = (data === undefined || $.isEmptyObject(data)) ? [] : this.parseData(data, lineCount);
            this.refresh();
        },

        updateViewport: function(from, to) {
            this.viewPortFrom = from;
            this.viewPortTo = to;
            this.refresh();
        },

        loadSample: function(number) {
            if (number) {
                current_sample = number;
            } else {
                current_sample = current_sample + 1;
            }
            current_sample = current_sample % samples.length;

            this.updateData(samples[current_sample], 52);
        },

        refresh: function() {
            var self = this;
            var scale = this.buildScale(this.data);
            var empty_scale = this.buildScale([[]]);

            // updating variables
            var paths = this.el.selectAll("path")
                .data(this.data, function(d) { return d.variable; });
            paths.transition()
                .duration(250)
                .attr("d", scale);

            var mouseenter = function(d, i) {
                $('#streamgraph_infobox').show();
                $('#streamgraph_infobox .popover-title').text(Object.keys(self.rawData)[i]);
            };

            var mouseleave = function(d, i) {
                $('#streamgraph_infobox').hide();
            };

            // entering variables
            paths.enter().append("path")
                .attr("d", empty_scale)
                .style("fill", function(d) { return self.nextColor(d.variable); })
                .on("mouseover", mouseenter)
                .on("mouseleave", mouseleave)
                .transition()
                    .duration(250)
                    .attr("d", scale);
            // exiting variables
            paths.exit()
                .transition()
                    .duration(250)
                    .attr("d", empty_scale)
                    .remove();
        },

        parseData: function(data, lineCount) {
            var numberOfVariables = _.keys(data).length;
            var stack = d3.layout.stack();
            return stack(d3.range(numberOfVariables).map(function(e, idx) {
                var variable = _.keys(data)[idx];
                var blub = data[variable];
                var result = zeroLayer(lineCount);
                _.reduce(_.keys(blub), function(prev, element) {
                    for (var i = parseInt(prev.line); i < parseInt(element); i += 1) {
                        result[i].y = prev.value;
                    }
                    return {line: element, value: blub[element]};
                }, {value: 0, line: 0});
                result.variable = variable;
                return result;
            }));
        },

        buildScale: function(data) {
            var length = this.viewPortTo - this.viewPortFrom;
            var x = d3.scale.linear()
                .domain([0, length - 1])
                .range([0, this.svgHeight]);

            var y = d3.scale.linear()
                .domain([0, d3.max(data, function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
                .range([this.svgWidth, 0]);

            return d3.svg.area()
                .y(function(d) { return x(d.x); })
                .x0(function(d) { return y(d.y0); })
                .x1(function(d) { return y(d.y0 + d.y); });
        },

        nextColor: function(variable) {
            if(variable && this.color_map[variable]) {
                // if variable known and color saved, return this
                return this.color_map[variable];
            }

            var color = colors[this.curent_color];
            this.curent_color = (this.curent_color + 1) % colors.length;

            if(variable){
                // save new variable color
                this.color_map[variable] = color;
            }
            return color;
        }
    });

    function zeroLayer(n) {
        var a = [], i;
        for (i = 0; i < n; ++i) a[i] = {x: i, y: 0};
        return a;
    }

    var colors = ["#9ec4e5", "#3d698f", "#6894ba", "#1e4363"];

    var samples = [
        {
            "var1": {
                "1": 25,
                "5": 40,
                "11": 10,
                "15": 25,
                "23": 55,
                "29": 5,
                "40": 20,
                "51": 0
            },
            "var2": {
                "3": 12,
                "6": 0
            }
        },
        {
            "var1": {
                "1": 40,
                "5": 25,
                "11": 12,
                "15": 15,
                "23": 5,
                "29": 55,
                "40": 10,
                "51": 0
            },
            "var2": {
                "3": 12,
                "6": 0
            }
        },
        {
            "var2": {
                "3": 12,
                "6": 0
            }
        },
        {
            "var2": {
                "3": 12,
                "6": 0
            },
            "var3": {
                "1": 40,
                "5": 25,
                "11": 12,
                "15": 15,
                "23": 5,
                "29": 55,
                "40": 10,
                "51": 0
            }
        }
    ];
    var current_sample = -1;
})();
