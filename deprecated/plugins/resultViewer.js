
function showError(error) {

    console.log(error);
    //jQuery('#form-container').html('');

    // if (obj && obj.data) {
        
    //  var $fieldset = jQuery('<fieldset style="text-align:right;"></fieldset>');
    //  var $legend = jQuery('<legend><b>'+'Attributes'+'</b></legend>');
    //  $fieldset.append($legend);

    //  $H(obj.data).each(function(pair) {

    //      var disabled = (pair.key === 'type');
            
    //      var $input = FieldRenderer.getField(pair.value);
    //      ($input instanceof Array && $input[0] || $input)
    //          .data('field', pair.key)
    //          .data('operation', obj.id)
    //          .attr('disabled', disabled)
    //          ;

    //      var $row = jQuery('<fieldset></fieldset>');
    //      $row.append([pair.key, $input].flatten());

    //      $fieldset.append($row);

    //  });

    //  jQuery('#form-container').append($fieldset);
    // }
}

function showResult(data, s) {
    // build table headers from header data

    jQuery('#result-container').html('');

    if (data.header) {
      var $table = jQuery(['<table><thead><th>', data.header.join('</th><th>'), '</th></thead></table>'].join(''));
      $table.append(['<tbody>', '<tr>', data.rows.map(function(row) {
          return ['<td>', row.join("</td><td>"), '</td>'].join('');
      }).join('</tr><tr>'), '</tr></tbody>'].join(''));
      jQuery('#result-container').append($table);
    }
    
    visualiseExecution(data, s);
}

function visualiseExecution(data, s) {
    
    var w = 500, h = 200, p = [20, 50, 30, 20];

    var x = d3.scale.linear().range([0, w - p[1] - p[3]]),
        y = d3.scale.linear().range([0, h - p[0] - p[2]]),
        z = d3.scale.category20b();

    if (!s.svg) {
        s.svg = d3.select("#visualisation-container").append("svg:svg")
        .attr("width", w+80)
        .attr("height", h+80)
        .append("svg:g")
        .attr("transform", "translate(" + (p[3]+30) + "," + (h - p[2]+10) + ")");
    }

    (function(perfData, svg) {

      // Transpose the data into layers by cause.
      var ops = d3.layout.stack().out(function(d, y0, y) {
        d.y0 = d.data.startTime;
        d.y = d.data.endTime - d.data.startTime;
      })(perfData.sortBy(function(d) {
        return d.startTime;
      }).map(function(datum, i){
        return [{
                    id      : datum.id,
                    name    : datum.name,
                    x       : i,
                    data    : datum
                }];
      }));

      var bandwidth = 20;//(w - p[1] - p[3])/(ops.length)/2;

      // Compute the x-domain (by date) and y-domain (by top).
      x.domain([0, ops.length - 1]);
      y.domain([0, d3.max(ops[ops.length - 1], function(d) {
        return d.data.endTime;
      })]).range([0,h]).nice(1);

      svg.selectAll("g").remove();
      svg.selectAll("rect").remove();
      svg.selectAll("text").remove();
      svg.selectAll("line").remove();


      // Add a label per date.
      var label = svg.selectAll("text")
          .data(ops)
        .enter().append("svg:text")
          .attr("x", function(d, i) { return x(i)+bandwidth/2; })
          .attr("y", -h+p[0]+20)
          .attr("text-anchor", "middle")
          .attr("dy", function(d, i) { return i%2?".8em":"-.4em"})
          .text(function(d) {
            return d[0].name  ;
          });

      // Add life lines
      var rule = svg.selectAll("g.rule")
        .data(x.ticks(ops.length))
        .enter().append("svg:g")
          .attr("class", "rule")
          .attr("transform", function(d, i) { return "translate(" + (x(i)+bandwidth/2) + ","+(-h+p[2]+(i%2?30:10))+")"; });

      // finish life lines
      rule.append("svg:line")
          .attr("y2", function(d, i) { return h+(i%2 ? 10 : 30); })
          .style("stroke", function(d) { return "#000"; })
          .style("stroke-dasharray", "5, 5")
          .style("stroke-opacity", function(d) { return d ? .7 : null; });

      // Draw Y-axis grid lines
      svg.selectAll("line.y")
        .data(y.ticks(8))
        .enter().append("line")
        .attr("class", "y")
        .attr("x1", 0)
        .attr("x2", w-p[2])
        .attr("y1", function(d) { return y(d)+(-h+p[2]+30);})
        .attr("y2", function(d) { return y(d)+(-h+p[2]+30);})
        .style("stroke", "#ccc");

      // add y-axis scala
      var yAxis = d3.svg.axis().scale(y).orient("right").ticks(8);
      
      svg.append('g')
        .attr("class", "axis")
        .attr("transform", "translate(" + (w-15) + ","+(-h+p[2]+30)+")")
        .call(yAxis);

      // Add a group for each worker.
      var op = svg.selectAll("g.operation")
      .data(ops)
      .enter().append("svg:g")
        .attr("class", "operation")
        .style("fill", function(d, i) { return d3.rgb(z(i)); })
        .style("stroke", function(d, i) { return d3.rgb(z(i)).darker(); });

      // Add a rect for each date.
      var rect = op.selectAll("rect")
          .data(Object)
        .enter().append("svg:rect")
          .attr("x", function(d) {
            return x(d.x);
          })
          .attr("y", function(d) { return -h+p[0] + y(d.y0) + 40; })
          .attr("height", function(d) { return y(d.y); })
          .attr("width", bandwidth);

      rect.each(function(d) {
            // $(this).hover(function(){$($(absatzAxis)[0][0]).css("opacity",1)}, function(){$($(absatzAxis)[0][0]).css("opacity",EDK.AXIS_OPAQUE_VALUE)})
            jQuery(this).tipsy({
                gravity: 'w',
                offset:0,
                html:true,
                // fade:true,
                title: function() {
                    return '<b>'+d.name + "</b> " + d.data.id + '</br>'+
                            'execution time: '+ (d.data.duration ? d.data.duration/1000+'ms' : '-')+'</br>'+
                            'duration: ' + d3.round(d.data.endTime - d.data.startTime, 2)+'ms</br>' +
                            'method: ' + (d.data.papi_event ? d.data.papi_event : '-');
                }
            })
          })

    }(data.performanceData, s.svg));
}

function registerResultViewerForCanvas(canvasState) {
    // jQuery('#form-container').on('change', 'input', function() {
    //  if (!canvasState.selection) { return; }

    //  var $field = jQuery(this);

    //  var operation = $field.data('operation');
    //  var field = $field.data('field');
    //  var isList = canvasState.selection.data[field].isList;

    //  if (!isList && canvasState.selection.id === operation) {
    //      var props = canvasState.selection.data[field];

    //      if ($field.attr('type') === 'number') {
    //          props.value = +$field.val();
    //      } else if ($field.attr('type') === 'checkbox') {
    //          props.value = $field.is(':checked');
    //      } else {
    //          props.value = $field.val();
    //      }
    //  }
    // });
}
