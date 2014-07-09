(function() {

    // Extend the standard ui plugin
    hyryx.editor.Streamgraph = function() {
      hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
    };

    hyryx.editor.Streamgraph.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
        render: function(callback) {
            callback();
        },

        init: function() {
            var self = this;
            var n = 10, // number of layers
                m = 50, // number of samples per layer
                stack = d3.layout.stack().offset("wiggle");
            this.layers0 = stack(d3.range(n).map(function() { return bumpLayer(m); }));
            this.layers1 = stack(d3.range(n).map(function() { return bumpLayer(m); }));

            var width = 960,
                height = 500;

            var x = d3.scale.linear()
                .domain([0, m - 1])
                .range([0, width]);

            var y = d3.scale.linear()
                .domain([0, d3.max(this.layers0.concat(this.layers1), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
                .range([height, 0]);

            var color = d3.scale.linear()
                .range(["#aad", "#556"]);

            this.area = d3.svg.area()
                .x(function(d) { return x(d.x); })
                .y0(function(d) { return y(d.y0); })
                .y1(function(d) { return y(d.y0 + d.y); });

            this.el = d3.select(self.targetEl[0]).append("svg")
                .attr("width", width)
                .attr("height", height);
            this.el.selectAll("path")
                .data(this.layers0)
              .enter().append("path")
                .attr("d", this.area)
                .style("fill", function() { return color(Math.random()); });

            self.targetEl.click('svg', this.transition.bind(this));
        },

        transition: function () {
            var self = this;
            this.el.selectAll("path")
                .data(function() {
                    var d = self.layers1;
                    self.layers1 = self.layers0;
                    self.layers0 = d;
                    return d;
                })
                .transition()
                .duration(2500)
                .attr("d", this.area);
        }
    });


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
      return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
    }
})();

