$(document).ready(function () { 

    //make attributes draggable and clone them
    $("#attributes > .btn").draggable({ 
        helper: 'clone'
    });

    //define dropzone for the attributes
    $(".axisDroppableContainer").droppable({
        over: function(event, ui){
            $(this).addClass("hoverDroppable");
        },
        out: function(event, ui){
            $(this).removeClass("hoverDroppable");
        },
        drop: function(event, ui) {
            if ($(this).children('[data-id="' + $(ui.draggable).data("id") + '"]').length <= 0) { //no column twice
                if ($(this).hasClass('xAxis')) {
                    $(this).children('.column').each( function() {
                        removeSeriesWithColumn($(this).data('id'), 'x');
                        $(this).remove();
                    });
                }
                if (($(ui.draggable).data("type") < 2 && $(this).children('[data-id="2"]').length == 0) || ($(ui.draggable).data("type") == 2 && $(this).children('[data-id="1"]').length == 0 && $(this).children('[data-id="0"]').length == 0)) {  
                    $(this).append($(ui.draggable).clone());
                    reloadData();
                } else {
                    alert('You can only add columns of either number or string type at the same time');
                }
            }
            $(this).removeClass("hoverDroppable");
        }
    });

    //define filter dropzone
    $('.filterDroppableContainer').droppable({
        over: function(event, ui) {
            $(this).addClass("hoverDroppable");
        },
        out: function(event, ui) {
            $(this).removeClass("hoverDroppable");
        },
        drop: function(event, ui) {
            if ($(this).children('[data-id="' + $(ui.draggable).data("id") + '"]').length <= 0) {         
                $(this).append($(ui.draggable).clone());
                reloadData();
            }
            $(this).removeClass("hoverDroppable");
        }
    });
    
    //remove a column when x is clicked from the axis
    $(document).on("click", ".axisDroppableContainer .removeColumn", function() {
        removeSeriesWithColumn($(this).parent().data('id'), $(this).parents('.axis').attr('id').substring(0,1));
        $(this).parent().remove();
    });

    //remove a filter when x is clicked and reload
    $(document).on("click", ".filterDroppableContainer .removeColumn", function() {
        $(this).parent().remove();
        reloadData();
    });

    // mode selest --> soon deprecated (after aggregation select is used)
    $(document).on("click", ".modeSelect", function() {
        $(this).parents('.column').attr('data-mode',$(this).attr('mode'));
        $(this).parent().parent().siblings('.actionSelect').html($(this).text()+'<span class="caret">');
        reloadData();
    });

    //aggregation select
    $(document).on("click", ".aggrSelect", function() {
        $(this).parents('.column').attr('data-aggregation',$(this).attr('value'));
        $(this).parent().parent().siblings('.aggrSelectToggle').html($(this).text()+' <span class="caret">');
        $(this).parents('.popover').siblings('.popoverContent').find('.aggrSelectToggle').html($(this).text()+' <span class="caret">');
        reloadData();
    });

    //change series chart type
    $(document).on("click", ".typeSelect", function() {
        $(this).parents('.column').attr('data-chartType',$(this).attr('value'));
        $(this).parent().parent().siblings('.typeSelectToggle').html($(this).text()+' <span class="caret">');
        $(this).parents('.popover').siblings('.popoverContent').find('.typeSelectToggle').html($(this).text()+' <span class="caret">');
        changeChartType($(this).parents('.column').data('id'), $(this).attr('value'), $(this).parents('.axis').attr('id').substring(0,1));
    });

    //initilaize the options popover
    $('#oAxis').popover({
        selector: '[rel=popover]',
        html: true,
        placement: 'left',
        title: 'Options',
        content: function() { return $(this).next().html();}
    });
    $('#yAxis, #filterContainer').popover({
        selector: '[rel=popover]',
        html: true,
        placement: 'right',
        title: 'Options',
        content: function() { return $(this).next().html();}
    });

    //add filter slider
    $(document).on('click', '[rel=popover]', function() {
        var popoverSlider = $(this).next().find('.valueRangeSlider');
        var templateSlider = $(this).siblings('.popoverContent').find('.valueRangeSlider');

        popoverSlider.slider({
            min: parseInt(popoverSlider.data('min-value')), 
            max: parseInt(popoverSlider.data('max-value')), 
            range: true,
            values: [parseInt(templateSlider.attr('data-lower-value')), parseInt(templateSlider.attr('data-higher-value'))],
            slide: function( event, ui ) {
                templateSlider.attr('data-lower-value', ui.values[0]);
                templateSlider.attr('data-higher-value', ui.values[1]);

                $(this).parents('.column').attr('data-lower-value', ui.values[0]);
                $(this).parents('.column').attr('data-higher-value', ui.values[1]);

                $(this).siblings().children('.minValue').text(ui.values[0]);
                $(this).siblings().children('.maxValue').text(ui.values[1]);

                reloadData();
            }
        });
    });

    //close the popover on click on the background
    $(':not(#anything)').on('click', function (e) {
        $('.popoverToggle').each(function () {
            if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                $(this).popover('hide');
                return;
            }
        });
    });

    //buttons for the graph type selection
    $(".graphTypeButton").click( function() {
        if (chart.series) {
            for(var i = 0; i < chart.series.length; i++) {
                chart.series[i].update({type: $(this).data('type')}); 
            }
        }
        $('.column').attr('data-chartType', $(this).data('type'));
        $('.graphTypeButton').removeClass('active');
        $(this).addClass('active');
    });

    //change the axis types
    $(".axisTypeSelect").change( function() {
        switch($(this).parents('.axisSettings').attr('id')) {
            case 'yAxis':
                chart.yAxis[0].update({type: $(this).val()});
                break; 
            case 'oAxis':
                chart.yAxis[1].update({type: $(this).val()}); 
                break; 
            case 'xAxis':
                chart.xAxis[0].update({type: $(this).val()}); 
                break;
        } 
    });

    //change the axis titles
     $(".axisTitle").bind('input', function() {
        switch($(this).parents('.axisSettings').attr('id')) {
            case 'yAxis':
                chart.yAxis[0].setTitle({text: $(this).val()}); 
                break;
            case 'oAxis':
                chart.yAxis[1].setTitle({text: $(this).val()});
                break;
            case 'xAxis':
                chart.xAxis[0].setTitle({text: $(this).val()});
                break;
        }
    });
    //initialize axis titles
    $('#ySettings .axisTitle').val(chart.options.yAxis[0].title.text);
    $('#oppositeYSettings .axisTitle').val(chart.options.yAxis[1].title.text);
    $('#xSettings .axisTitle').val(chart.options.xAxis[0].title.text);

    //change graph title
    $('#graphTitle').bind('input', function() {
        chart.setTitle({text: $(this).val()});
    });
    //initialize graph title
    $('#graphTitle').val(chart.title.text);

});