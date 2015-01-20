(function() {

    // fills the Panel Body with Content
    createNodeStatsPanel = function(oDiv, oData, oLast, index){


      oDiv[0].innerHTML = ""; //Delete previous content to update (pseudo redraw)
      var width = 335;

      // CPU
      var sId;
      var nSum = 0;
      var user,system;
      var aValue = [];
      for (var i = 0; i < oData.cpu.length; i++) {
        aValue[i] = ((oLast.cpu[i].user - oData.cpu[i].user) + (oLast.cpu[i].nice - oData.cpu[i].nice) + (oLast.cpu[i].system - oData.cpu[i].system))/((oLast.cpu[i].user - oData.cpu[i].user) + (oLast.cpu[i].nice - oData.cpu[i].nice) + (oLast.cpu[i].system - oData.cpu[i].system) + (oLast.cpu[i].idle - oData.cpu[i].idle))
        nSum += aValue[i];
      }
      var nAvg = ((nSum / oData.cpu.length)*100).toFixed(3);
      var sAvg = "AVG: " + nAvg + "%";
      oDiv.append('<div><span>CPU</span><span class="TextSpan">' + sAvg + '</span></div>');
      for (var i = 0; i < oData.cpu.length; i++) {
        sId = "CPU-" + index + "-" + i;
        oDiv.append('<div id=' + sId +' class="ProgressCPU"/>');
        createProgressBar(sId, aValue[i], "cpubar",width);
      };


      // MEMORY
      var nFree = (oData.mem.free/1000000).toFixed(2);
      var nTotal = (oData.mem.total/1000000).toFixed(2);
      var sUsed = "Used: " + nFree + "GB/" + nTotal +"GB";
      oDiv.append('<div class="TextDiv"><span class="MemorySpan">Memory</span><span class="TextSpan">' + sUsed + '</span></div>');
      sId = "Memory-" + index;
      oDiv.append('<div id="' + sId + '" class="ProgressMEM"/>');
      createProgressBar(sId, (oData.mem.free/oData.mem.total), "membar",width);

      // NETWORK
      var nElapsed = (oData.time - oLast.time); // milliseconds to seconds and Byte to kB cancel each other
      var nSend = (oData.net.send - oLast.net.send)/nElapsed;
      var nReceived = (oData.net.received - oLast.net.received)/nElapsed;
      var sSend = "Send: " + nSend.toFixed(2) + " kB/s";
      var sReveiced = "Received: " + nReceived.toFixed(2) + " kB/s";
      oDiv.append('<div class="TextDiv"><span class="MemorySpan">Network</span><span class="SendSpan">' + sSend + '</span><span class="ReveivedSpan">' + sReveiced + '</span></div>');
      sId = "Netreceive-" +index;
      oDiv.append('<div id="' + sId + '" class="ProgressDIV"/>');
      createProgressBar(sId, (nReceived/1000), "netrbar",width);  // current rate in kB relative to 1 MB

      sId = "Netsend-" +index;
      oDiv.append('<div id="' + sId + '" class="ProgressDIV"/>');
      createProgressBar(sId, (nSend/1000), "netsbar",width);      // current rate in kB relative to 1 MB
    };

    // sId - id of the Div the Progressbar is to be placed in
    // nValue - fillvalue [0,1]
    // sClass - Styleclass the Bar gets
    // nWidth - width of the Parent
    createProgressBar = function(sId, nValue, sClass, nWidth){
      var width = nWidth;
      var height = 10;

      var x = d3.scale.linear()
        .range([0, width])

      var y = d3.scale.ordinal()
        .rangeRoundBands([0, height], 0);

      var xAxis = d3.svg.axis()
        .scale(x)
        .orient("top");

      var svg = d3.select("#" + sId)
        .attr("style", "width: "+(width+2)+"px")
      .append("svg")
        .attr("class", "progressbar")
        .attr("width", width)
        .attr("height", height)
      .append("g");

      data = [nValue];

      x.domain([0, 1]).nice();
      y.domain(data.map(function(d) { return 0; }));

      svg.selectAll(".bar")
        .data(data)
      .enter().append("rect")
        .attr("class", sClass)
        .attr("x", function(d) { return 0 })
        .attr("y", function(d) { return 0; })
        .attr("width", function(d) { return x(d); })
        .attr("height", y.rangeBand());
    };

})();




