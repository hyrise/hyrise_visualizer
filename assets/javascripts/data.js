var chart;
var loadedSeries = []; //contains the series with refernces to columns and the charts series used for altering

jQuery(document).ready(function () { 
    // create initial chart
    chart = new Highcharts.Chart({
        chart: {
            renderTo: 'graph'
        },
        title: {
            text: 'Your Graph'
        },
        xAxis: {
            title: {
                text: ''
            }
        },
        yAxis: [{
            opposite: false,
            title: {
                text: 'Values'
            }
        }, {
            opposite: true,
            title: {
                text: ''
            },
            showEmpty: false
        }]
    });
});

var changeChartType = function(columnId, chartType, axis) {
    for (var i = 0; i < loadedSeries.length; i++) {
        if (loadedSeries[i]['yColumn']['id'] == columnId && loadedSeries[i]['axis'] == axis) {
            chart.series[i].update({type: chartType});
        }
    }
}

var removeSeriesWithColumn = function(columnId, axis) {
    if (axis == 'x') {
        while (chart.series.length) {
            chart.series[0].remove();
        }
        loadedSeries = [];
    } else {
        var indicesToRemove = [];
        for (var i = 0; i < loadedSeries.length; i++) {
            if (loadedSeries[i]['yColumn']['id'] == columnId && loadedSeries[i]['axis'] == axis) {
                indicesToRemove.push(i);
            }
        }
        for (var i = 0; i < indicesToRemove.length; i++) {
            chart.series[indicesToRemove[i]].remove();
            loadedSeries.splice(indicesToRemove[i], 1);
        }
    }  
};

var collectSeries = function() {
    var newSeries = [];
    var seriesCount = 0;

    var collectFunction = function(){

        var data = {
            aggregation: jQuery(this).attr("data-aggregation"), // to avoid jquery caching
            column: jQuery(this).data("column"),
            type: jQuery(this).data("type"),
            table: jQuery(this).data("table"),
            id: jQuery(this).data("id"),
            min: jQuery(this).attr("data-lower-value"),
            max: jQuery(this).attr("data-higher-value")
        };

        series = {
            'yColumn': data,
            'id': seriesCount,
            'axis': jQuery(this).parents('.axis').attr('id').substring(0,1)
        };
        newSeries.push(series);
        seriesCount++;
    };

    jQuery('#ySettings .column').each(collectFunction);
    jQuery('#oppositeYSettings .column').each(collectFunction);

    return newSeries;
}

var collectFilters = function() {
    var filters = [];

    jQuery('#filterContainer .column').each( function() {
        var data = {
            column: jQuery(this).data("column"),
            table: jQuery(this).data("table"),
            type: jQuery(this).data("type"),
            id: jQuery(this).data("id"),
            min: jQuery(this).attr("data-lower-value"),
            max: jQuery(this).attr("data-higher-value")
        }

        filters.push(data);
    });

    return filters;
}

var reloadData = function() {

    if ((jQuery('#ySettings .column').length > 0 || jQuery('#oppositeYSettings .column').length > 0) && jQuery('#xSettings .column').length > 0) {
        
        var newSeries = collectSeries();
        var xAxisColumn = jQuery('#xSettings .btn.disabled');
        var xAxis = {
            "mode": xAxisColumn.data("mode"),
            "column": xAxisColumn.data("column"),
            "type": xAxisColumn.data("type"),
            "table": xAxisColumn.data("table")
        };
        var filters = collectFilters();

        console.log(filters);

        jQuery.ajax({
            url: 'getContentForSeries',
            type: "POST",
            data: {series: newSeries, xaxis: xAxis, filters: filters},
            dataType: "script",
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(textStatus);
            },
            complete: function(jqXHR, textStatus ){
                json = jQuery.parseJSON(jqXHR.responseText);
                if (json.hasOwnProperty("error")){
                    alert(json["error"]);
                }else{

                    console.log(json)
                    // update x-axis
                    if (json[0].hasOwnProperty("categories")) {
                        chart.xAxis[0].setCategories(json[0]['categories'], true);
                    }
                    chart.xAxis[0].setTitle({text:xAxis['column']}, true);
                    jQuery('#xSettings .axisTitle').val(xAxis['column']);

                    //remove old series from chart
                    while (chart.series.length) {
                        chart.series[0].remove();
                    }

                    for (var i = 0; i < json.length; i++) {

                        var axis = 0;
                        if (json[i]['axis'] == 'o') {
                            axis = 1;
                        }

                        // update y-Axis with series
                        chart.addSeries({
                            name: json[i]['name'],
                            data: json[i]['data'],
                            yAxis: axis
                        }, true);
                        //preserve chart type after reload
                        chart.series[chart.series.length-1].update({type:  jQuery('.axisDroppableContainer [data-id="'+json[i]['id']+'"]').attr('data-chartType')});
                    }                    

                    // load the simple data table on bottom of page
                    jQuery('#dataTable').children().each(function(){
                        jQuery(this).remove();
                    });

                    var headers = '<tr>'
                    headers += '<th>' + xAxis['column'] + '</th>';
                    jQuery.each(json, function(index,val) {
                        if(val != 'rows')
                            headers = headers + '<th>' + val['name'] + '</th>';
                    });
                    headers += '</tr>';

                    jQuery('#dataTable').append(headers);

                    for(var i = 0; i < json[0]['data'].length; i++) {
                        var html = '<tr class="dataTableRow">';

                        if (json[0].hasOwnProperty("categories")) {
                            html += '<td>' + json[0]['categories'][i] + '</td>'; 

                            jQuery.each(json, function(index,val) {
                                if(val != 'rows')
                                    html += '<td>' + val['data'][i] + '</td>';
                            });
                        } else {
                            html += '<td>' + json[0]['data'][i][0] + '</td>';

                            jQuery.each(json, function(index,val) {
                                if(val != 'rows')
                                    html += '<td>' + val['data'][i][1] + '</td>';
                            });
                        }

                        html += '</tr>';
                        jQuery('#dataTable').append(html);
                    }

                    // save created series in global variable
                    loadedSeries = newSeries;
                }   
            }
        });
    }
};

