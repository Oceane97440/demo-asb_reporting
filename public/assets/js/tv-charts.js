'use strict';
$(document).ready(function () {
  var config = {
    baseurl: "https://reporting.antennesb.fr/"
};

var chartCampaignUrl = config.baseurl+'t/charts';
     
$.getJSON(chartCampaignUrl, function (response) {   

       // Montée en couverture et répétition
        var campaignIncreaseInLoadPerDayOptions = {
            series: [{
                name: response.campaignIncreaseInLoadPerDayCouverture.name, 
                type: 'column',
                data:  response.campaignIncreaseInLoadPerDayCouverture.data
          }, {
            name: response.campaignIncreaseInLoadPerDayRepetition.name, 
            type : 'line',     
            data:  response.campaignIncreaseInLoadPerDayRepetition.data
          }],
            chart: {
            height: 350,
            type: 'line',
            stacked: false
          },
          dataLabels: {
            enabled: false
          },
          stroke: {
            width: [1, 3]
          },
        /*  title: {
            text: 'Montée en couverture et répétition',
            enabled: false,
            align: 'center',
          },*/
          xaxis: {
            categories: response.campaignIncreaseInLoadPerDayJour.data,
          },
          yaxis: [
            {
              axisTicks: {
                show: true,
              },
              axisBorder: {
                show: true,
                color: '#008FFB'
              },
              labels: {
                style: {
                  colors: '#008FFB',
                }
              },
              title: {
                text: response.campaignIncreaseInLoadPerDayCouverture.name,
                style: {
                  color: '#008FFB',
                }
              },
              tooltip: {
                enabled: true
              }
            },
            {
              seriesName: response.campaignIncreaseInLoadPerDayRepetition.name,
              opposite: true,
              axisTicks: {
                show: true,
              },
              axisBorder: {
                show: true,
                color: '#00E396'
              },
              labels: {
                style: {
                  colors: '#00E396',
                }
              },
              title: {
                text: response.campaignIncreaseInLoadPerDayRepetition.name, 
                style: {
                  color: '#00E396',
                  border : '2px'
                }
              },
            }
          ],
          tooltip: {
            fixed: {
              enabled: true,
              position: 'topLeft', // topRight, topLeft, bottomRight, bottomLeft
              offsetY: 30,
              offsetX: 60
            },
          },
          legend: {
            horizontalAlign: 'left',
            offsetX: 40
          }
          };
  
          var campaignIncreaseInLoadPerDayChart = new ApexCharts(document.querySelector("#chart-table_montee_en_couverture"), campaignIncreaseInLoadPerDayOptions);
          campaignIncreaseInLoadPerDayChart.render();
          console.log(response.cibleEnsemble)
          // Couverture par cible
          var options = {
            series: [response.cibleEnsemble.data],
            chart: {
            width: 380,
            type: 'radialBar',
          },
          labels: [response.cibleEnsemble.name],
          responsive: [{
            breakpoint: 480,
            options: {
              chart: {
                width: 100
              },
              legend: {
                position: 'bottom'
              }
            }
          }]
          };
  
          var chart = new ApexCharts(document.querySelector("#chart-table_couverture_par_cible"), options);
          chart.render();

        // Ventilations des GRP par tranches horaires​
        var campaigntimeSlotDiaryOptions = {
            series: [{
               name: response.campaigntimeSlotDiaryGRP.name,      
               data: response.campaigntimeSlotDiaryGRP.data
             }],
               chart: {
               type: 'bar',
               height: 300
             },
             plotOptions: {
               bar: {
                 horizontal: false
               },
             },
             dataLabels: {
               enabled: false
             },
             stroke: {
               show: true,
               width: 0,
               colors: ['transparent']
             },
             xaxis: {
               title: {
                   text: response.campaigntimeSlotDiaryTrancheHoraires.name
                 },
               categories: response.campaigntimeSlotDiaryTrancheHoraires.data               
             },
             yaxis: {
               title: {
                 text:  response.campaigntimeSlotDiaryGRP.name
               },
               type: 'numeric'
             },
             fill: {
               opacity: 1
             },
             tooltip: {
               y: {
                 formatter: function (val) {
                   return val 
                 }
               }
             }
            };       

        var campaigntimeSlotDiaryChart = new ApexCharts(document.querySelector("#chart-table_ventilations_GRP_horaires"), campaigntimeSlotDiaryOptions);
        campaigntimeSlotDiaryChart.render();    
        
        // Jours nommés
        // Ventilations des GRP par tranches horaires​
        var campaignNameDayOptions = {
            series: [{
               name: response.campaignNameDayCouverture.name,      
               data: response.campaignNameDayCouverture.data
             }],
               chart: {
               type: 'bar',
               height: 300
             },
             plotOptions: {
               bar: {
                 horizontal: false
               },
             },
             dataLabels: {
               enabled: true
             },
             stroke: {
               show: true,
               width: 0,
               colors: ['transparent']
             },
             xaxis: {
               title: {
                   text: response.campaignNameDayJour.name
                 },
               categories: response.campaignNameDayJour.data               
             },
             yaxis: {
               title: {
                 text:  response.campaigntimeSlotDiaryGRP.name
               },
               type: 'numeric'
             },
             fill: {
               opacity: 1
             },
             tooltip: {
               y: {
                 formatter: function (val) {
                   return val 
                 }
               }
             }
            };     
            
             /*var campaignNameDayOptions = {
             series: [{
                name: 'Marine Sprite',
                data: [44, 55, 41, 37, 22, 43, 21]
              }, {
                name: 'Striking Calf',
                data: [53, 32, 33, 52, 13, 43, 32]
              }, {
                name: 'Tank Picture',
                data: [12, 17, 11, 9, 15, 11, 20]
              }, {
                name: 'Bucket Slope',
                data: [9, 7, 5, 8, 6, 9, 4]
              }, {
                name: 'Reborn Kid',
                data: [25, 12, 19, 32, 25, 24, 10]
              }],
              series: [{
              
                 name: response.campaignNameDayCouverture.name,      
                 data: response.campaignNameDayCouverture.data
               }],
               chart: {
                type: 'bar',
                height: 350,
                stacked: true,
                //stackType: '100%'
              },
              plotOptions: {
                bar: {
                  horizontal: true,
                },
              },
              stroke: {
                width: 1,
                colors: ['#fff']
              },
              title: {
                text: '100% Stacked Bar'
              },
             xaxis: {
                categories: [2008, 2009, 2010, 2011, 2012, 2013, 2014],
              },
              tooltip: {
                y: {
                  formatter: function (val) {
                    return val + "K"
                  }
                }
              }, fill: {
                opacity: 1
              
              },
              legend: {
                position: 'top',
                horizontalAlign: 'left',
                offsetX: 40
              }
              };   */

       var campaignNameDayChart = new ApexCharts(document.querySelector("#chart-table_ventilations_GRP_jours"), campaignNameDayOptions);
        campaignNameDayChart.render();    
    });

/*

    var chartCampaignUrl = 'http://localhost:3002/manager/charts/campaigns';
    var chartAdvertiserUrl = 'http://localhost:3002/manager/charts/advertisers';
    var chartCampaignReportUrl = 'http://localhost:3002/manager/charts/campaign/report';

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
            series: [
                {
                    name: response.lastYear.year,
                    data: response.lastYear.result
                }, {
                    name: response.nowYear.year,
                    data: response.nowYear.result
                }
            ],
            xaxis: {
                categories: response.month
            }
        }

        var chart = new ApexCharts(document.querySelector("#chart-campaigns"), options);
        chart.render();
    });

//Chart Bar Reporting

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