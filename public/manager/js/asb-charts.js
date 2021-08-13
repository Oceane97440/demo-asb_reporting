'use strict';
$(document).ready(function() {

var chartCampaignUrl = 'http://localhost:3001/manager/charts/campaigns';
var chartAdvertiserUrl = 'http://localhost:3001/manager/charts/advertisers';

/*
* Chart Campaigns - 
*/

$.getJSON(chartCampaignUrl, function(response) {
var options = {
        chart: {
          type: 'line',
          animations: {
            enabled: true,
            easing: 'easeinout',
            speed: 800,
            animateGradually: {
                enabled: true,
                delay: 150
            },
            dynamicAnimation: {
                enabled: true,
                speed: 20
            }
        }
        },
        stroke: {
        curve: 'smooth',
      },
        series: [{
          name: response.lastYear.year,
          data: response.lastYear.result
        },
       {
        name: response.nowYear.year,
        data: response.nowYear.result
        }],
        xaxis: {
          categories : response.month
          // ['janvier','février','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','décembre']
        }
      }
      
    var chart = new ApexCharts(document.querySelector("#chart-campaigns"), options);
    chart.render();

});
    

});


/*
$(document).ready(function() {
    setTimeout(function() {
        floatchart()
    }, 700);
    // [ campaign-scroll ] start
    var px = new PerfectScrollbar('.feed-scroll', {
        wheelSpeed: .5,
        swipeEasing: 0,
        wheelPropagation: 1,
        minScrollbarLength: 40,
    });
    var px = new PerfectScrollbar('.pro-scroll', {
        wheelSpeed: .5,
        swipeEasing: 0,
        wheelPropagation: 1,
        minScrollbarLength: 40,
    });
    // [ campaign-scroll ] end
});

function floatchart() {

    // [ satisfaction-chart ] start
    $(function() {
        var options = {
            chart: {
                height: 200,
                type: 'pie',
            },
            series: [47408,867523],
            labels: ["Diffusé", "Restant"],
            legend: {
                show: false,
                offsetY: 50,
            },
            dataLabels: {
                enabled: true,
                dropShadow: {
                    enabled: false,
                }
            },
            theme: {
                monochrome: {
                    enabled: true,
                    color: '#7267EF',
                }
            },
            responsive: [{
                breakpoint: 768,
                options: {
                    chart: {
                        height: 320,

                    },
                    legend: {
                        position: 'bottom',
                        offsetY: 0,
                    }
                }
            }]
        }
        var chart = new ApexCharts(document.querySelector("#campaign-chart"), options);
        chart.render();
    });

    // [ satisfaction-chart ] end
}

*/