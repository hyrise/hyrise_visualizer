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
            callback();
        },

        init: function() {
            var n = 100; // number of layers // currently we only support 100 different variables
            var zeroLayer = this.zeroData(n);

            var color = d3.scale.linear()
                .range(["#a1c5e5", "#245178"]);

            this.el = d3.select(this.targetEl[0]).append("svg")
                .attr("width", this.svgWidth)
                .attr("height", this.svgHeight);
            this.el.selectAll("path")
                .data(zeroLayer)
              .enter().append("path")
                .attr("d", this.buildScale(zeroLayer))
                .style("fill", function() { return color(Math.random()); });
        },

        updateData: function(data) {
            this.data = this.parseData(data);
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

        parseData: function(data) {
            var numberOfVariables = 4;
            var length = 26;
            var stack = d3.layout.stack().offset("wiggle");
            return stack(d3.range(numberOfVariables).map(function() { return bumpLayer(length); }));
        },

        zeroData: function(variableCount) {
            var length = 26;
            var stack = d3.layout.stack().offset("wiggle");
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


    // Inspired by Lee Byron's test data generator.
    function bumpLayer(n) {

      function bump(a) {
        var x = 1 / (0.1 + Math.random()),
            y = 2 * Math.random() - 0.5,
            z = 10 / (0.1 + Math.random());
        for (var i = 0; i < n; i++) {
          var w = (i / n - y) * z;
          a[i] += x * Math.exp(-w * w);
        }
      }

      var a = [], i;
      for (i = 0; i < n; ++i) a[i] = 0;
      for (i = 0; i < 5; ++i) bump(a);
      // return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
      return a.map(function(d, i) { var w = (i < 4) ? 1 : 0; return {x: i, y: w}; });
    }
})();

