jQuery(document).ready(function () { 

    //make attributes draggable and clone them
    jQuery("#attributes > .btn").draggable({ 
        helper: 'clone'
    });

    //define dropzone for the attributes
    jQuery(".axisDroppableContainer").droppable({
        over: function(event, ui){
            jQuery(this).addClass("hoverDroppable");
        },
        out: function(event, ui){
            jQuery(this).removeClass("hoverDroppable");
        },
        drop: function(event, ui) {
            if (jQuery(this).children('[data-id="' + jQuery(ui.draggable).data("id") + '"]').length <= 0) { //no column twice
                if (jQuery(this).hasClass('xAxis')) {
                    jQuery(this).children('.column').each( function() {
                        removeSeriesWithColumn(jQuery(this).data('id'), 'x');
                        jQuery(this).remove();
                    });
                }
                if ((jQuery(ui.draggable).data("type") < 2 && jQuery(this).children('[data-id="2"]').length == 0) || (jQuery(ui.draggable).data("type") == 2 && jQuery(this).children('[data-id="1"]').length == 0 && jQuery(this).children('[data-id="0"]').length == 0)) {  
                    jQuery(this).append(jQuery(ui.draggable).clone());
                    reloadData();
                } else {
                    alert('You can only add columns of either number or string type at the same time');
                }
            }
            jQuery(this).removeClass("hoverDroppable");
        }
    });

    //define filter dropzone
    jQuery('.filterDroppableContainer').droppable({
        over: function(event, ui) {
            jQuery(this).addClass("hoverDroppable");
        },
        out: function(event, ui) {
            jQuery(this).removeClass("hoverDroppable");
        },
        drop: function(event, ui) {
            if (jQuery(this).children('[data-id="' + jQuery(ui.draggable).data("id") + '"]').length <= 0) {         
                jQuery(this).append(jQuery(ui.draggable).clone());
                reloadData();
            }
            jQuery(this).removeClass("hoverDroppable");
        }
    });
    
    //remove a column when x is clicked from the axis
    jQuery(document).on("click", ".axisDroppableContainer .removeColumn", function() {
        removeSeriesWithColumn(jQuery(this).parent().data('id'), jQuery(this).parents('.axis').attr('id').substring(0,1));
        jQuery(this).parent().remove();
    });

    //remove a filter when x is clicked and reload
    jQuery(document).on("click", ".filterDroppableContainer .removeColumn", function() {
        jQuery(this).parent().remove();
        reloadData();
    });

    // mode selest --> soon deprecated (after aggregation select is used)
    jQuery(document).on("click", ".modeSelect", function() {
        jQuery(this).parents('.column').attr('data-mode',jQuery(this).attr('mode'));
        jQuery(this).parent().parent().siblings('.actionSelect').html(jQuery(this).text()+'<span class="caret">');
        reloadData();
    });

    //aggregation select
    jQuery(document).on("click", ".aggrSelect", function() {
        jQuery(this).parents('.column').attr('data-aggregation',jQuery(this).attr('value'));
        jQuery(this).parent().parent().siblings('.aggrSelectToggle').html(jQuery(this).text()+' <span class="caret">');
        jQuery(this).parents('.popover').siblings('.popoverContent').find('.aggrSelectToggle').html(jQuery(this).text()+' <span class="caret">');
        reloadData();
    });

    //change series chart type
    jQuery(document).on("click", ".typeSelect", function() {
        jQuery(this).parents('.column').attr('data-chartType',jQuery(this).attr('value'));
        jQuery(this).parent().parent().siblings('.typeSelectToggle').html(jQuery(this).text()+' <span class="caret">');
        jQuery(this).parents('.popover').siblings('.popoverContent').find('.typeSelectToggle').html(jQuery(this).text()+' <span class="caret">');
        changeChartType(jQuery(this).parents('.column').data('id'), jQuery(this).attr('value'), jQuery(this).parents('.axis').attr('id').substring(0,1));
    });

    //initilaize the options popover
    jQuery('#oAxis').popover({
        selector: '[rel=popover]',
        html: true,
        placement: 'left',
        title: 'Options',
        content: function() { return jQuery(this).next().html();}
    });
    jQuery('#yAxis, #filterContainer').popover({
        selector: '[rel=popover]',
        html: true,
        placement: 'right',
        title: 'Options',
        content: function() { return jQuery(this).next().html();}
    });

    //add filter slider
    jQuery(document).on('click', '[rel=popover]', function() {
        var popoverSlider = jQuery(this).next().find('.valueRangeSlider');
        var templateSlider = jQuery(this).siblings('.popoverContent').find('.valueRangeSlider');

        popoverSlider.slider({
            min: parseInt(popoverSlider.data('min-value')), 
            max: parseInt(popoverSlider.data('max-value')), 
            range: true,
            values: [parseInt(templateSlider.attr('data-lower-value')), parseInt(templateSlider.attr('data-higher-value'))],
            slide: function( event, ui ) {
                templateSlider.attr('data-lower-value', ui.values[0]);
                templateSlider.attr('data-higher-value', ui.values[1]);

                jQuery(this).parents('.column').attr('data-lower-value', ui.values[0]);
                jQuery(this).parents('.column').attr('data-higher-value', ui.values[1]);

                jQuery(this).siblings().children('.minValue').text(ui.values[0]);
                jQuery(this).siblings().children('.maxValue').text(ui.values[1]);

                reloadData();
            }
        });
    });

    //close the popover on click on the background
    jQuery(':not(#anything)').on('click', function (e) {
        jQuery('.popoverToggle').each(function () {
            if (!jQuery(this).is(e.target) && jQuery(this).has(e.target).length === 0 && jQuery('.popover').has(e.target).length === 0) {
                jQuery(this).popover('hide');
                return;
            }
        });
    });

    //buttons for the graph type selection
    jQuery(".graphTypeButton").click( function() {
        if (chart.series) {
            for(var i = 0; i < chart.series.length; i++) {
                chart.series[i].update({type: jQuery(this).data('type')}); 
            }
        }
        jQuery('.column').attr('data-chartType', jQuery(this).data('type'));
        jQuery('.graphTypeButton').removeClass('active');
        jQuery(this).addClass('active');
    });

    //change the axis types
    jQuery(".axisTypeSelect").change( function() {
        switch(jQuery(this).parents('.axisSettings').attr('id')) {
            case 'yAxis':
                chart.yAxis[0].update({type: jQuery(this).val()});
                break; 
            case 'oAxis':
                chart.yAxis[1].update({type: jQuery(this).val()}); 
                break; 
            case 'xAxis':
                chart.xAxis[0].update({type: jQuery(this).val()}); 
                break;
        } 
    });

    //change the axis titles
     jQuery(".axisTitle").bind('input', function() {
        switch(jQuery(this).parents('.axisSettings').attr('id')) {
            case 'yAxis':
                chart.yAxis[0].setTitle({text: jQuery(this).val()}); 
                break;
            case 'oAxis':
                chart.yAxis[1].setTitle({text: jQuery(this).val()});
                break;
            case 'xAxis':
                chart.xAxis[0].setTitle({text: jQuery(this).val()});
                break;
        }
    });
    //initialize axis titles
    jQuery('#ySettings .axisTitle').val(chart.options.yAxis[0].title.text);
    jQuery('#oppositeYSettings .axisTitle').val(chart.options.yAxis[1].title.text);
    jQuery('#xSettings .axisTitle').val(chart.options.xAxis[0].title.text);

    //change graph title
    jQuery('#graphTitle').bind('input', function() {
        chart.setTitle({text: jQuery(this).val()});
    });
    //initialize graph title
    jQuery('#graphTitle').val(chart.title.text);

});