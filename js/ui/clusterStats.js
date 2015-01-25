(function() {

    var clusterThroughputGraph;
    var aNodes, nUsedCPUs;

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
                nUsedCPUs = 0;

                for(var i = 0; i < oData.nodes.length; i++){
                    oData.nodes[i].index = i;
                    aNodes[i].usedCPUs = _.range(nUsedCPUs,nUsedCPUs + aNodes[i].cpu,1);
                    nUsedCPUs = nUsedCPUs + aNodes[i].cpu;
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
            var aCPUs = $(".NodeCPU");
            for(var i = 0; i < aHosts.length; i++){
                oData.nodes.push({
                    host: aHosts[i].value,
                    port: parseInt(aPorts[i].value),
                    cpu: parseInt(aCPUs[i].value)})
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
                    aNodes = oData.nodes;
                    console.log("Nodes set")
                    nUsedCPUs = 0;

                    for(var i = 0; i < oData.nodes.length; i++){
                        oData.nodes[i].index = i;
                        aNodes[i].usedCPUs = _.range(nUsedCPUs,nUsedCPUs + aNodes[i].cpu,1);
                        nUsedCPUs = nUsedCPUs + aNodes[i].cpu;
                        if(oData.master === i){
                            oData.nodes[i].master = true;
                        }
                    }

                },
                error: function(oResult){
                    alert("error")
                }
            })
        });

        var oCPUGraph = createGraph($('#ClusterCPU'),"CPU","%","User","System",100);
        var oQueryGraph = createGraph($('#ClusterThroughput'), "Throughput", "/s","Read","Write", null);

        var bFirst = [true,true];
        var aLast = [];
        var oLast = {};
        setInterval(function(){
            $.ajax({
                method: "GET",
                url: "SystemStats",
                success: function(oResult){
                    try{
                        aData = JSON.parse(oResult)
                        if(!bFirst[0]){
                            for(var i = 0; i < aNodes.length; i++){
                                createNodeStatsPanel($("#PanelBody-"+i), aData[i],aLast[i], i, aNodes[i].usedCPUs)
                            }
                            var aCPUValues = calculateCPUUsage(aData, aLast, nUsedCPUs);
                            addGraphPoints(oCPUGraph, aCPUValues[1], aCPUValues[2]);
                        }
                        bFirst[0] = false;
                        aLast = aData;
                    } catch (e) {
                        console.log(oResult);
                    }


                },
                error: function(oResult){
                    error = oResult
                    console.log(oResult);
                }

            });

            $.ajax({
                method: "GET",
                url: "QueryData",
                success:function(oResult) {
                    try{
                        oData = JSON.parse(oResult).data;
                        if(!bFirst[1]){
                            var nElapsed = (oData.timestamp - oLast.timestamp);
                            var nRead = (oData.read - oLast.read)/nElapsed;
                            var nWrite = (oData.write - oLast.write)/nElapsed;
                            addGraphPoints(oQueryGraph, nRead, nWrite);
                        }
                        bFirst[1] = false;
                        oLast = oData;
                    } catch (e) {
                        console.log(oResult);
                    }
                }
            });
        }, 1000);

    }
    });
})();
