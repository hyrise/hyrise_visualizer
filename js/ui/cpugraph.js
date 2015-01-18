(function() {

    var aCPUData = [];
    var oChart;

    createCPUGraph = function(oDiv){

      oDiv.attr("style","min-width: 310px; height: 200px; margin: 0 auto");

      oDiv.highcharts({
        chart: {
        },
        credits: {
          enabled: false
        },
        title: {
            text: 'CPU'
        },
        xAxis: {
            type: 'linear',
            labels:{
              enabled:false
            },
            min: 0,
            maxRange: 60,
        },
        yAxis: {
            type: 'linear',
            labels: {
              enabled: false
            },
            min: 0,
            max: 1
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                fillColor: {
                    linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                    stops: [
                        [0, Highcharts.getOptions().colors[0]],
                        [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                    ]
                },
                // states: {
                //     hover: {
                //         lineWidth: 1
                //     }
                // },
                threshold: null
            }
        },

        series: [{
            type: 'area',
            name: 'CPU',
            pointInterval: 1,
            pointStart: 0,
            data: aCPUData
        }]
      });

    oChart= oDiv.highcharts();
    };

    addCPUGraphPoint = function(aData){

      var oData,nSum= 0, nAvg= 0;
      for (var i = 0; i < aData.length; i++) {
        oData = aData[i]
        nSum = 0;
        for (var j = 0; j < oData.cpu.length; j++) {
          nSum += oData.cpu[j].value;
        }
        nAvg += (nSum / oData.cpu.length)
      };

      nAvg = (nAvg/ aData.length)


      oChart.series[0].addPoint(nAvg);
    };


})();




