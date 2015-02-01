(function() {

    // creates a 2 series (sSeries1, sSeries2) Graph in oDiv with Title sTitle and value Suffix sSuffig
    createGraph = function(oDiv, sTitle, sSuffix, sSeries1, sSeries2, nMax, bStacking){

      oDiv.attr("style","min-width: 365px; height: 150px; margin: 0 auto");

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
            text: sTitle,
            floating: true,
            align: "left"
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
            max: nMax,
            tickWidth: 0,
            gridLineWidth: 0,
            minorGridLineWidth: 0,
        },
        legend: {
            // enabled: false
            align: "right",
            layout: "vertical",
             labelFormatter: function() {
                var nLastVal = this.yData[this.yData.length - 1] || 0;
                return '<span style="color:' + this.color + '">' + this.name + ':<br></span> <b>' + nLastVal.toFixed(2) + sSuffix + '</b> </n>';
            }
        },
        plotOptions: {
            area: {
                stacking: bStacking? "normal" : null,
                states: {
                    hover: {
                        enabled: false,
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
            valueSuffix: sSuffix
        },

        series: [{
            name: sSeries1,
            pointInterval: 1,
            pointStart: 0,
            data: [],
            color: {
                    linearGradient: { x1: 1, y1: 0, x2: 0, y2: 0},
                    stops: [
                        [0, 'rgba(177, 6, 58,1)'],
                        [1, 'rgba(177, 6, 58,0)']
                    ]
            }
        },
        {
            name: sSeries2,
            pointInterval: 1,
            pointStart: 0,
            data: [],
            color: {
                    linearGradient: { x1: 1, y1: 0, x2: 0, y2: 0},
                    stops: [
                        [0, 'rgba(246, 168, 0, 1)'],
                        [1, 'rgba(246, 168, 0, 0)']
                    ]
            }
        }]
      });

    return oDiv.highcharts();
    };

    addGraphPoints = function(oChart, nPoint1, nPoint2){

        //Set Axis to show only last Minute
        var bShift = oChart.series[0].points.length > 60;
        oChart.isDirtyLegend = true;
        oChart.series[0].legendItem = oChart.series[0].legendItem.destroy();
        oChart.series[1].legendItem = oChart.series[1].legendItem.destroy();

        oChart.series[0].addPoint(nPoint1, true, bShift);
        oChart.series[1].addPoint(nPoint2, true, bShift);
    };

    // calculate new CPU Usage values from last 2 Datasets
    // returns Overall, User, System
    calculateCPUUsage = function(aData, aLast, nUsedCPUs){
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

        return [nAvg,nAvgUser,nAvgSystem]
    };

})();




