'use strict';
$(document).ready(function () {
   /* 
   var config = {
        baseurl: "https://reporting.antennesb.fr/" 
    };
    */

    var chartCampaignUrl = config.baseurl + 'manager/charts/campaigns';
    var chartAdvertiserUrl = config.baseurl + 'manager/charts/advertisers';
    var chartEpilotCampaignUrl = config.baseurl + 'manager/charts/epilot/campaigns';

    var campaign_id = $('div.card').attr('data-campaign_id');
  
    /*
     * Chart Campaigns -
    */
    $.getJSON(chartCampaignUrl, function (response) {
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
                curve: 'smooth'
            },
            series: [{
                name: response.lastYear.year,
                data: response.lastYear.result
            }, {
                name: response.nowYear.year,
                data: response.nowYear.result
            }],
            xaxis: {
                categories: response.month
            }
        }

        var chart = new ApexCharts(document.querySelector("#chart-campaigns"), options);
        chart.render();
    });
 
    /*
     * Annonceurs 
    */  
    $.getJSON(chartAdvertiserUrl, function (response) {      
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
                curve: 'smooth'
            },
            series: [{
                name: response.lastYear.year,
                data: response.lastYear.result
            }, {
                name: response.nowYear.year,
                data: response.nowYear.result
            }],
            xaxis: {
                categories: response.month
            }
        }

        var chart = new ApexCharts(document.querySelector("#chart-advertisers"), options);
        chart.render();
    });

     /*
     * Chart Bar Reporting
     */
    if(campaign_id) {
            var chartCampaignReportUrl = config.baseurl + 'manager/charts/campaign/report?campaign_id=' + campaign_id;

            $.getJSON(chartCampaignReportUrl, function (response) {
                var options = {
                    series: [{
                        name: 'Diffusé',
                        data: response.values.delivery
                    }, {
                        name: 'Restant à diffuser',
                        data: response.values.booking
                    }],
                    chart: {
                        type: 'bar',
                        height: 150,
                        stacked: true,
                        stackType: '100%'
                    },
                    plotOptions: {
                        bar: {
                            horizontal: true
                        }
                    },
                    stroke: {
                        width: 1,
                        colors: ['#fff']
                    },
                    xaxis: {
                        categories: response.formats,
                        labels: {
                            formatter: function (val) {
                                return val
                            }
                        }
                    },
                    yaxis: {
                        title: {
                            text: undefined
                        }
                    },
                    tooltip: {
                        y: {
                            formatter: function (val) {
                                return val
                            }
                        }
                    },
                    fill: {
                        opacity: 1
                    },
                    colors: [
                        '#3f51b5', '#cc0000'
                    ],
                    legend: {
                        position: 'bottom',
                        horizontalAlign: 'left',
                        offsetX: 10
                    }
                };

                var chart = new ApexCharts(
                    document.querySelector("#chart-campaignreport"),
                    options
                );
                chart.render();

            });
    }

    /*
    * Graph des budgets
    */
    $.getJSON(chartEpilotCampaignUrl, function (response) {
       
        var options = {
          series: response.data,
            chart: {
            type: 'bar',
            height: 350,
            stacked: true,
            plotOptions: {
                bar: {
                  horizontal: true,
                },
              },
          stackType: '100%',
            toolbar: {
              show: true
            },
            zoom: {
              enabled: true
            }
          },
          responsive: [{
            breakpoint: 480,
            options: {
              legend: {
                position: 'bottom',
                offsetX: -10,
                offsetY: 0
              }
            }
          }],
          plotOptions: {
            bar: {
              horizontal: false,
              borderRadius: 10
            },
          },
          xaxis: {
            categories: response.month
          },
          legend: {
            position: 'right',
            offsetY: 40
          },
          fill: {
            opacity: 1
          }
          };
  
          var chart = new ApexCharts(document.querySelector("#charts-epilot-campaigns"), options);
          chart.render();

    });
    /*
        var options = {
            series: [
                {
                    name: 'Réservée',
                    data: [(467000), (374268), (289980)]
                }, {
                    name: 'Restant à diffuser',
                    data: [
                        (467000 - 475272),
                        (374268 - 383483),
                        (289980 - 268365)
                    ]
                }
            ],
            chart: {
                type: 'bar',
                height: 250,
                stacked: true
            },
            plotOptions: {
                bar: {
                    horizontal: true
                }
            },
            stroke: {
                width: 1,
                colors: ['#fff']
            },
            xaxis: {
                categories: [
                    'Habillage', 'Interstitiel', 'Instream'
                ],
                labels: {
                    formatter: function (val) {
                        return val 
                    }
                }
            },
            yaxis: {
                title: {
                    text: undefined
                }
            },
            tooltip: {
                y: {
                    formatter: function (val) {
                        return val
                    }
                }
            },
            fill: {
                opacity: 1
            },
            colors: [
                '#3f51b5', '#cc0000'
            ],
            legend: {
                position: 'bottom',
                horizontalAlign: 'left',
                offsetX: 10
            }
        };

        var chart = new ApexCharts(
            document.querySelector("#chart-campaignreport"),
            options
        );
        chart.render();
    */

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