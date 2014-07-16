(function() {

    // Extend the standard ui plugin
    hyryx.editor.Streamgraph = function() {
        this.svgWidth = 50;
        this.svgHeight = 500;
        this.viewPortFrom = 0;
        this.viewPortTo = 26;
        hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
    };

    hyryx.editor.Streamgraph.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
        render: function(callback) {
            this.frame = $('<div id="frame_streamgraph">');
            callback(this.frame);
        },

        init: function() {
            var n = 100; // number of layers // currently we only support 100 different variables
            var zeroLayer = this.zeroData(n);

            var color = ["#9ec4e5", "#3d698f", "#6894ba", "#1e4363"];

            this.el = d3.select(this.frame[0]).append("svg")
                .attr("width", this.svgWidth)
                .attr("height", "100%");
            this.el.selectAll("path")
                .data(zeroLayer)
                .enter()
                .append("path")
                .attr("d", this.buildScale(zeroLayer))
                .style("fill", function(d, i) { return color[i % 4]; });
        },

        updateData: function(data, lineCount) {
            this.data = (data === undefined || $.isEmptyObject(data)) ? this.zeroData(100) : this.parseData(data, lineCount);
            this.refresh();
        },

        updateViewport: function(from, to) {
            this.viewPortFrom = from;
            this.viewPortTo = to;
            this.refresh();
        },

        refresh: function() {
            var self = this;
            this.el.selectAll("path")
                .data(function() {
                    return self.data;
                })
                .transition()
                .duration(250)
                .attr("d", this.buildScale(this.data));
        },

        parseData: function(data, lineCount) {
            var numberOfVariables = _.keys(data).length;
            var stack = d3.layout.stack();
            return stack(d3.range(numberOfVariables).map(function(e, idx) {
                var blub = data[_.keys(data)[idx]];
                var result = zeroLayer(lineCount);
                _.reduce(_.keys(blub), function(prev, element) {
                    for (var i = parseInt(prev.line); i < parseInt(element); i += 1) {
                        result[i].y = prev.value
                    }
                    return {line: element, value: blub[element]}
                }, {value: 0, line: 0});
                return result;
            }));
        },

        zeroData: function(variableCount) {
            var length = this.viewPortTo - this.viewPortFrom;
            var stack = d3.layout.stack();
            return stack(d3.range(variableCount).map(function() { return zeroLayer(length); }));
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
        }
    });

    function zeroLayer(n) {
        var a = [], i;
        for (i = 0; i < n; ++i) a[i] = {x: i, y: 0};
        return a;
    }
})();
