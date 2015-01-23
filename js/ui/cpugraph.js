(function() {

    var oChart;

    createCPUGraph = function(oDiv){

      oDiv.attr("style","min-width: 365px; height: 200px; margin: 0 auto");

      oDiv.highcharts({
        chart: {
            type: "area",
            width: 365,
            borderColor: "#ddd",
            borderWidth: 1,
            borderRadius: 4
        },
        credits: {
          enabled: false
        },
        title: {
            text: "CPU"
        },
        xAxis: {
            type: 'linear',
            labels:{
              enabled:false
            },
            tickWidth: 0,
        },
        yAxis: {
            type: 'linear',
            labels: {
              enabled: false
            },
            title: {
                enabled: false
            },
            min: 0,
            max: 100,
            tickWidth: 0
        },
        legend: {
            enabled: false
        },
        plotOptions: {
            area: {
                stacking: "normal",
                // fillColor: {
                //     linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                //     stops: [
                //         [0, Highcharts.getOptions().colors[0]],
                //         [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                //     ]
                // },
                states: {
                    hover: {
                        enabled: false,
                        // lineWidth: 1
                    }
                },
                marker: {
                    enabled:false
                }
            }
        },
        tooltip: {
            shared: true,
            valueDecimals: 3,
            valueSuffix: "%"
        },

        series: [{
            // type: 'area',
            name: 'User',
            pointInterval: 1,
            pointStart: 0,
            data: []
        },
        {
            // type: 'area',
            name: 'System',
            pointInterval: 1,
            pointStart: 0,
            data: []
        }]
      });

    oChart= oDiv.highcharts();
    };

    addCPUGraphPoint = function(aData, aLast, nUsedCPUs){

      var user,system,value,oData, oLast;
      var dUser, dSystem, dNice, dIdle, dSum;
      var nSum, nSumUser, nSumSystem;
      var nAvg = 0, nAvgUser = 0, nAvgSystem = 0;
      for (var i = 0; i < aData.length; i++) {  // Loop over every System
        oData = aData[i];
        oLast = aLast[i];
        nSum = 0; nSumUser = 0; nSumSystem = 0;
        for (var j = 0; j < oData.cpu.length; j++) { // Loop over every CPU
            if( j < nUsedCPUs){
                dUser = (oData.cpu[j].user - oLast.cpu[j].user);
                dNice = (oData.cpu[j].nice - oLast.cpu[j].nice);
                dSystem = (oData.cpu[j].system - oLast.cpu[j].system);
                dIdle = (oData.cpu[j].idle - oLast.cpu[j].idle);
                dSum = dUser + dNice + dSystem + dIdle;
                
                user = (dUser+dNice)/(dSum);
                system = (dSystem)/(dSum);
                value = (dUser+dNice+dSystem)/(dSum);

                nSumUser += user;
                nSumSystem += system;
                nSum += value;
            }
        }
        nAvgUser += nSumUser/ nUsedCPUs;
        nAvgSystem += nSumSystem/ nUsedCPUs;
        nAvg += nSum/ nUsedCPUs;
      };

      nAvg = (nAvg / aData.length)*100
      nAvgUser = (nAvgUser/ aData.length)*100 //convert to %
      nAvgSystem = (nAvgSystem/ aData.length)*100

      if(Math.abs(nAvg - nAvgUser - nAvgSystem) > 0.1){
        console.log("wtf!")
      }

      oChart.setTitle({text: nAvg.toFixed(3) + "% CPU"});

      //Set Axis to show only last Minute
      var nLength = oChart.series[0].points.length
      if(nLength > 60){
        oChart.xAxis[0].setExtremes(nLength-60, nLength);
      }

      oChart.series[0].addPoint(nAvgUser);
      oChart.series[1].addPoint(nAvgSystem);
    };


})();




