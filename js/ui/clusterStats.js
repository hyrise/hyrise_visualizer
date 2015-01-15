(function() {

	var clusterThroughputGraph;
	var aNodes;

	// Extend the standard ui plugin
	hyryx.manage.ClusterStats = function() {
	hyryx.screen.AbstractUITemplatePlugin.apply(this, arguments);
	};

	hyryx.manage.ClusterStats.prototype = extend(hyryx.screen.AbstractUITemplatePlugin, {
	render : function(callback) {

		$.ajax({
			method: "GET",
			url: "loadConfig",
			async: false,
			success: function(oResult){
				var oData = JSON.parse(oResult);
				aNodes = oData.nodes;
				console.log("Nodes set")

				for(var i = 0; i < oData.nodes.length; i++){
					oData.nodes[i].index = i;
					if(oData.master === i){
						oData.nodes[i].master = true;
					}
				}

				$.get('templates/clusterStats.mst', function(template) {
				var rendered = $(Mustache.render(template, {
					nodes: oData.nodes,
					dispatcher: oData.dispatcher
				}));

				callback(rendered);
				});
			},
			error: function(oResult){
				console.log(oResult);
			}
		});
	},



	init : function() {

		$('#btn-startup').click(function(oEvent){
			$.ajax({
				method: "GET",
				url: "startserver",
				success: function(oResult){
					alert("success");
				},
				error: function(oResult){
					alert("error")
				}
			})
		});

		$('#btn-kill-all').click(function(oEvent){
			$.ajax({
				method: "GET",
				url: "killall",
				success: function(oResult){
					alert("success");
				},
				error: function(oResult){
					alert("error")
				}
			})
		});

		$('#btn-save').click(function(oEvent){

			oData = {};
			oData.master = parseInt($("input[name=master]:checked")[0].value);
			oData.nodes = [];

			var aHosts = $(".NodeHost");
			var aPorts = $(".NodePort");
			for(var i = 0; i < aHosts.length; i++){
				oData.nodes.push({
					host: aHosts[i].value,
					port: parseInt(aPorts[i].value)})
			}

			oData.dispatcher = {
				host: $("#host-dispatcher")[0].value,
				port: parseInt($("#port-dispatcher")[0].value)
			};

			$.ajax({
				method: "POST",
				url: "saveConfig",
				data: {data: JSON.stringify(oData)},
				success: function(oResult){
					alert("success");
				},
				error: function(oResult){
					alert("error")
				}
			})
		});

		createCPUGraph($('#ClusterCPU'));

		var bFirst = true;
		var aHistory = [];
		setInterval(function(){
			$.ajax({
				method: "GET",
				url: "SystemStats",
				success: function(oResult){
					aData = JSON.parse(oResult)
					if(!bFirst){
						for (var i = 0; i < aData.length; i++) {
							aData[i].time_last = aHistory[aHistory.length-1][i].time
							aData[i].net.received_last = aHistory[aHistory.length-1][i].net.received;
							aData[i].net.send_last = aHistory[aHistory.length-1][i].net.send;
						};
					}
					bFirst = false;
					aHistory.push(aData);
					for(var i = 0; i < aNodes.length; i++){
						createNodeStatsPanel($("#PanelBody-"+i), aData[i], i)
					}
					addCPUGraphPoint(aData);

				},
				error: function(oResult){
					error = oResult
					console.log(oResult);
				}

			});
		}, 1000);



	 //    $('#ClusterThroughput').highcharts({
		// chart: {
  //                   type: 'areaspline',
  //                   animation: false,
  //                   // animation: Highcharts.svg, // don't animate in old IE
  //                   marginRight: 10,
  //                   events: {
		// 	load: function () {
  //                           // set up the updating of the chart each second
  //                           var series_write = this.series[1];
  //                           var series_read = this.series[0];

  //                           //, events = this.series[1];
		// 	    var chart = this;
  //                           var last_size_read = 0;
  //                           var last_size_write = 0;
  //                           var last_timestamp = 0;
  //                           var first = true;
  //                           var last_x_value = 0;
		// 	    console.log('Set interval');
  //                           setInterval(function () {
		// 		$.ajax({
  //                   method: "GET",
  //                   url: "QueryData",
  //                   success:function(response) {
		// 				console.log("successful response from QueryData");
		// 				var json = $.parseJSON(response);
		// 				if(!json) return;
		// 				var elapsed_time = json.data.timestamp - last_timestamp;
		// 				if (!first) last_x_value += elapsed_time;
		// 				first = false;
		// 				last_timestamp = json.data.timestamp;
		// 				console.log('Adding data point.');
		// 				series_write.addPoint([last_x_value, Math.round((json.data.write-last_size_write)/elapsed_time)]);
		// 				last_size_write = json.data.write;
		// 				series_read.addPoint([last_x_value, Math.round((json.data.read-last_size_read)/elapsed_time)]);
		// 				last_size_read = json.data.read;
		// 				chart.redraw();
  //                   }
		// 		});
		// 	    }, 500);
  //                       }
  //                   }
		// },
		// title: {
  //                   text: "Query Throughput"
		// },
		// xAxis: {
  //                   type: 'linear',
  //                   max: 600,
  //                   min: 0
  //                   // ,
  //                   // labels: {
  //                   // formatter: function() {return this.value/SCALE + "s"}
  //                   // }
		// },
		// yAxis: {
  //                   title: {
		// 	text: '#Queries per Second'
  //                   },
  //                   // plotLines: [{
  //                   //     value: 0,
  //                   //     width: 1,
  //                   //     color: '#808080'
  //                   // }],
  //                   min: 0,
  //                   max: 6000
		// },
		// legend: {
  //                   layout: 'vertical',
  //                   align: 'right',
  //                   verticalAlign: 'top',
  //                   borderWidth: 0
		// },
		// exporting: {
  //                   enabled: false
		// },
		// plotOptions: {
  //                   areaspline: {
		// 	marker: {
  //                           enabled: false
		// 	}
  //                   }
		// },
		// series: [
		//     {
		// 	id: 'read',
		// 	name: "Read-Only Queries",
		// 	data: [null],
		// 	allowPointSelect: false,
  //                   }, {
		// 	id: 'write',
		// 	name: "Write Queries",
		// 	data: [null],
		// 	allowPointSelect: false,
  //                   }
  //                   // , {
  //                   //     type : 'flags',
  //                   //     data : [],
  //                   //     onSeries : 'data',  // Id of which series it should be placed on. If not defined
  //                   //                     // the flag series will be put on the X axis
  //                   //     shape : 'flag'  // Defines the shape of the flags.
  //                   // }
		// ],
  //           });

	 //    $('#frame_serverLoad').highcharts({
		// chart: {
  //                   type: 'heatmap',
  //                   marginTop: 40,
  //                   marginBottom: 40,
  //                   events: {
		// 	load: function () {
  //                           // set up the updating of the chart each second
  //                           var series = this.series[0], events = this.series[1];
  //                           var inserted_data = [], inserted_events = [];
  //                           var chart = this;
  //                           var last_size = 0;
  //                           setInterval(function () {
		// 		$.ajax({
  //                                   method:"GET",
  //                                   url: "load",
  //                                   success:function(response){
		// 			json = $.parseJSON(response);
		// 			if(!json) return;
		// 			chart.series[0].setData([[0,0,json[0][0]],[1,0,json[0][1]], [2,0,json[0][2]],[3,0,json[0][3]],[4,0,json[0][4]],[5,0,json[0][5]],[6,0,json[0][6]],[7,0,json[0][7]],[0,1,json[1][0]],[1,1,json[1][1]], [2,1,json[1][2]],[3,1,json[1][3]],[4,1,json[1][4]],[5,1,json[1][5]],[6,1,json[1][6]],[7,1,json[1][7]],[0,2,json[2][0]],[1,2,json[2][1]], [2,2,json[2][2]],[3,2,json[2][3]],[4,2,json[2][4]],[5,2,json[2][5]],[6,2,json[2][6]],[7,2,json[2][7]],[0,3,json[3][0]],[1,3,json[3][1]], [2,3,json[3][2]],[3,3,json[3][3]],[4,3,json[3][4]],[5,3,json[3][5]],[6,3,json[3][6]],[7,3,json[3][7]]]);

		// 		    }
		// 		});
		// 	    }, 1000);
		// 	}
		//     }
		// },

		// title: {
  //                   text: 'Server Load'
		// },

		// xAxis: {
  //                   categories: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
  //                   labels: {
		// 	style: {
		// 	    color: '#525151',
		// 	    font: '8px Helvetica'
		// 	},
		// 	formatter: function () {
		// 	    return this.value;
		// 	}
		//     },
		// },

		// yAxis: {
  //                   categories: ['Node 1', 'Node 2', 'Node 3', 'Node 4'],
  //                   title: null
		// },

		// colorAxis: {
  //                   min: 0,
  //                   max: 100,
  //                   minColor: '#fffdde',
  //                   maxColor: '#c4463a',
		// },

		// legend: {
  //                   align: 'right',
  //                   layout: 'vertical',
  //                   margin: 5,
  //                   verticalAlign: 'top',
  //                   y: 20,
  //                   symbolHeight: 80
		// },

		// tooltip: {
  //                   formatter: function () {
		// 	return this.point.value + '% load of <b>CPU ' + this.series.xAxis.categories[this.point.x] + '</b> on <b>' + this.series.yAxis.categories[this.point.y] + '</b>';
  //                   }
		// },

		// series: [{
  //                   name: 'Load',
  //                   borderColor: 'silver',
  //                   borderWidth: 0.4,
  //                   data: [[0,0,0],[1,0,0], [2,0,0],[3,0,0],[4,0,0],[5,0,0],[6,0,0],[7,0,0],[0,1,0],[1,1,0], [2,1,0],[3,1,0],[4,1,0],[5,1,0],[6,1,0],[7,1,0],[0,2,0],[1,2,0], [2,2,0],[3,2,0],[4,2,0],[5,2,0],[6,2,0],[7,2,0],[0,3,0],[1,3,0], [2,3,0],[3,3,0],[4,3,0],[5,3,0],[6,3,0],[7,3,0]],

  //                   dataLabels: {
		// 	enabled: false,
		// 	color: 'black',
		// 	style: {
  //                           textShadow: 'none',
  //                           HcTextStroke: null
		// 	}
  //                   }
		// }]
	 //    });


	 //    $('#frame_replicationDelay').highcharts({

		// chart: {
		//     type: 'gauge',
		//     plotBorderWidth: 0,
		//     plotBackgroundColor: {
		// 	linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
		// 	stops: [
		// 	    [0, '#FFFFFF'],
		// 	    [0.3, '#FFFFFF'],
		// 	    [1, '#FFFFFF']
		// 	]
		//     },
		//     plotBackgroundImage: null,
		//     height: 120

		// },

		// title: {
		//     text: 'Replication Delay'
		// },
		// tooltip: { enabled: false },
		// pane: [{
		//     startAngle: -45,
		//     endAngle: 45,
		//     background: null,
		//     center: ['15%', '145%'],
		//     size: 150
		// }
		//        , {
		// 	   startAngle: -45,
		// 	   endAngle: 45,
		// 	   background: null,
		// 	   center: ['50%', '145%'],
		// 	   size: 150
		//        }, {
		// 	   startAngle: -45,
		// 	   endAngle: 45,
		// 	   background: null,
		// 	   center: ['85%', '145%'],
		// 	   size: 150
		//        }
		//       ],

		// yAxis: [{
		//     min: 0,
		//     max: hyryx.settings.cluster_management.delay_max,
		//     minorTickPosition: 'outside',
		//     tickPosition: 'outside',
		//     labels: {
		// 	rotation: 'auto',
		// 	distance: 20
		//     },
		//     plotBands: [{
		// 	from: hyryx.settings.cluster_management.delay_max-(hyryx.settings.cluster_management.delay_max*hyryx.settings.cluster_management.delay_percent_red),
		// 	to: hyryx.settings.cluster_management.delay_max,
		// 	color: '#C02316',
		// 	innerRadius: '100%',
		// 	outerRadius: '105%'
		//     }],
		//     pane: 0,
		//     title: {
		// 	text: 'Replica A<br/><span style="font-size:8px">#TX Behind</span>',
		// 	y: -10
		//     }
		// }, {
		//     min: 0,
		//     max: hyryx.settings.cluster_management.delay_max,
		//     minorTickPosition: 'outside',
		//     tickPosition: 'outside',
		//     labels: {
		// 	rotation: 'auto',
		// 	distance: 20
		//     },
		//     plotBands: [{
		// 	from: hyryx.settings.cluster_management.delay_max-(hyryx.settings.cluster_management.delay_max*hyryx.settings.cluster_management.delay_percent_red),
		// 	to: hyryx.settings.cluster_management.delay_max,
		// 	color: '#C02316',
		// 	innerRadius: '100%',
		// 	outerRadius: '105%'
		//     }],
		//     pane: 1,
		//     title: {
		// 	text: 'Replica B<br/><span style="font-size:8px">#TX Behind</span>',
		// 	y: -10
		//     }
		// }, {
		//     min: 0,
		//     max: hyryx.settings.cluster_management.delay_max,
		//     minorTickPosition: 'outside',
		//     tickPosition: 'outside',
		//     labels: {
		// 	rotation: 'auto',
		// 	distance: 20
		//     },
		//     plotBands: [{
		// 	from: hyryx.settings.cluster_management.delay_max-(hyryx.settings.cluster_management.delay_max*hyryx.settings.cluster_management.delay_percent_red),
		// 	to: hyryx.settings.cluster_management.delay_max,
		// 	color: '#C02316',
		// 	innerRadius: '100%',
		// 	outerRadius: '105%'
		//     }],
		//     pane: 2,
		//     title: {
		// 	text: 'Replica C<br/><span style="font-size:8px">#TX Behind</span>',
		// 	y: -10
		//     }
		// }
		//        ],

		// plotOptions: {
		//     gauge: {
		// 	dataLabels: {
		// 	    enabled: false
		// 	},
		// 	dial: {
		// 	    radius: '100%'
		// 	}
		//     }
		// },


		// series: [{
		//     data: [0],
		//     yAxis: 0
		// }, {
		//     data: [0],
		//     yAxis: 1
		// }, {
		//     data: [0],
		//     yAxis: 2
		// }]

	 //    },

	 //    // Let the music play
	 //    function (chart) {
		// setInterval(function () {
		//     var r1 = chart.series[0].points[0];
		//     var r2 = chart.series[1].points[0];
		//     var r3 = chart.series[2].points[0];

		//     $.ajax({
		// 	method:"GET",
		// 	url:"delay",
		// 	onFailure:function(response){
		// 	    r = chart.series[0].points[0];
		// 	    r.update(0, false);
		// 	    r = chart.series[1].points[0];
		// 	    r.update(0, false);
		// 	    r = chart.series[2].points[0];
		// 	    r.update(0, false);
		// 	    chart.redraw();
		// 	},
		// 	success:function(response){
		// 	    json = $.parseJSON(response);
		// 	    rows = json.rows
		// 	    if(!json) return

		// 	    if (master_killed) {
		// 		lcid_replica1 = rows[2][2];
		// 		lcid_replica2 = rows[0][2];
		// 		lcid_replica3 = rows[1][2];
		// 		lcid_master = rows[2][2];
		// 	    } else {
		// 		lcid_replica1 = rows[0][2];
		// 		lcid_replica2 = rows[1][2];
		// 		lcid_replica3 = rows[2][2];
		// 		lcid_master = rows[3][2];
		// 	    }


		// 	    v1 = lcid_master-lcid_replica1;
		// 	    v2 = lcid_master-lcid_replica2;
		// 	    v3 = lcid_master-lcid_replica3;

		// 	    if (v1 > hyryx.settings.cluster_management.delay_max)
		// 		v1 = hyryx.settings.cluster_management.delay_max;
		// 	    if (v2 > hyryx.settings.cluster_management.delay_max)
		// 		v2 = hyryx.settings.cluster_management.delay_max;
		// 	    if (v3 > hyryx.settings.cluster_management.delay_max)
		// 		v3 = hyryx.settings.cluster_management.delay_max;

		// 	    if (workload_stopped) {
		// 		v1 = 0;
		// 		v2 = 0;
		// 		v3 = 0;
		// 	    }

		// 	    r = chart.series[0].points[0];
		// 	    r.update(v1, false);
		// 	    r = chart.series[1].points[0];
		// 	    r.update(v2, false);
		// 	    r = chart.series[2].points[0];
		// 	    r.update(v3, false);
		// 	    chart.redraw();
		// 	}
		//     });
		// }, 1000);
	 //    });
	}
	});
})();
