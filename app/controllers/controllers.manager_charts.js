// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require('axios');
var crypto = require('crypto');

// const request = require('request'); const bodyParser =
// require('body-parser');

const {
    Op
} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

const {
    QueryTypes
} = require('sequelize');

const {
    check,
    query
} = require('express-validator');

const moment = require('moment');

const csv = require('csv-parser');
const fs = require('fs');

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const Utilities = require("../functions/functions.utilities");

// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAgencies = require("../models/models.agencies");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelInsertionsPriorities = require(
    "../models/models.insertions_priorities"
);
const ModelInsertionsStatus = require("../models/models.insertions_status");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const ModelEpilotCampaigns = require("../models/models.epilot_campaigns");
const ModelEpilotInsertions = require("../models/models.epilot_insertions");
const ModelUsers = require("../models/models.users");

const TEXT_REGEX = /^.{1,51}$/

const {
    promiseImpl
} = require('ejs');
const {
    insertions
} = require('./controllers.automate');

exports.index = async (req, res) => {
    try {} catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.campaigns = async (req, res) => {
    try {

        // Graph de suivi des campagnes L'année derniére
        var dateYearLast = moment()
            .subtract(1, 'year')
            .format('YYYY');
        // Cette année
        var dateYearNow = moment().format('YYYY');

        /*
        SELECT
        // COUNT('campaign_id') AS COUNT,
        // MONTH(campaign_start_date) AS mois,
        // YEAR(campaign_start_date) AS year
        // FROM `asb_campaigns`
        WHERE YEAR(campaign_start_date)
        BETWEEN "2020" AND '2021'
        AND MONTH(campaign_start_date) BETWEEN "1" AND '12'
        GROUP BY YEAR(campaign_start_date), MONTH(campaign_start_date) ORDER BY `campaign_start_date` ASC
        */
        campaigns = await ModelCampaigns
            .findAll({
                attributes: [
                    [
                        sequelize.fn('COUNT', sequelize.col('campaign_id')),
                        'count'
                    ],
                    [
                        sequelize.fn('MONTH', sequelize.col('campaign_start_date')),
                        'month'
                    ],
                    [
                        sequelize.fn('YEAR', sequelize.col('campaign_start_date')),
                        'year'
                    ]
                ],
                group: [
                    'month', 'year'
                ],
                raw: true
            }, {
                where: {
                    [Op.and]: [{
                        [sequelize.fn('YEAR', sequelize.col('campaign_start_date'))]: {
                            [Op.between]: [dateYearLast, dateYearNow]
                        },
                        [sequelize.fn('MONTH', sequelize.col('campaign_start_date'))]: {
                            [Op.between]: [1, 12]
                        }
                    }]
                },
                order: [
                    [
                        'year', 'ASC'
                    ],
                    [
                        'month', 'ASC'
                    ]
                ]
            })
            .then(async function (campaigns) {
                if (!campaigns) {
                    return res
                        .status(404)
                        .json({
                            statusCoded: '404'
                        });
                }
                //  console.log(campaigns);
                if (campaigns.length > 0) {
                    var dataArray = new Array();
                    var lastYear = new Array();
                    var nowYear = new Array();
                    var month = new Array();

                    // Trie les campagnes selon la date d'expiration
                    campaigns.sort(function (a, b) {
                        return a.year - b.year;
                    });

                    for (i = 0; i < campaigns.length; i++) {
                        var campaignYear = campaigns[i].year;
                        var campaignMonth = campaigns[i].month;
                        var campaignCount = campaigns[i].count;

                        if (dateYearLast == campaignYear) {
                            lastYear.push(campaignCount);
                        }
                        if (dateYearNow == campaignYear) {
                            nowYear.push(campaignCount);
                        }
                    }
                    var month = new Array(
                        'janvier',
                        'février',
                        'mars',
                        'avril',
                        'mai',
                        'juin',
                        'juillet',
                        'aout',
                        'septembre',
                        'octobre',
                        'novembre',
                        'décembre'
                    );

                    var data = {
                        'lastYear': {
                            year: dateYearLast,
                            result: lastYear
                        },
                        'nowYear': {
                            year: dateYearNow,
                            result: nowYear
                        },
                        month: month
                    }

                    return res
                        .status(200)
                        .json(data);
                }

            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res
            .status(404)
            .json({
                statusCoded: statusCoded
            });
    }
}

exports.advertisers = async (req, res) => {
    try {
        // Graph de suivi des annonceurs
       
        // L'année derniére
        var dateYearLast = moment()
            .subtract(1, 'year')
            .format('YYYY');
        // Cette année
        var dateYearNow = moment().format('YYYY');

        campaigns = await ModelCampaigns
            .findAll({
                attributes: [
                    [
                        sequelize.fn('COUNT', sequelize.col('advertiser_id')),
                        'count'
                    ],
                    [
                        sequelize.fn('MONTH', sequelize.col('campaign_start_date')),
                        'month'
                    ],
                    [
                        sequelize.fn('YEAR', sequelize.col('campaign_start_date')),
                        'year'
                    ]
                ],
                group: [
                    'month', 'year'
                ],
                raw: true
            }, {
                where: {
                    [Op.and]: [{
                        [sequelize.fn('YEAR', sequelize.col('campaign_start_date'))]: {
                            [Op.between]: [dateYearLast, dateYearNow]
                        },
                        [sequelize.fn('MONTH', sequelize.col('campaign_start_date'))]: {
                            [Op.between]: [1, 12]
                        }
                    }]
                },
                order: [
                    [
                        'year', 'ASC'
                    ],
                    [
                        'month', 'ASC'
                    ]
                ]
            })
            .then(async function (campaigns) {
                if (!campaigns) {
                    return res
                        .status(404)
                        .json({
                            statusCoded: '404'
                        });
                }

                if (campaigns.length > 0) {
                    var dataArray = new Array();
                    var lastYear = new Array();
                    var nowYear = new Array();
                    var month = new Array();

                    // Trie les campagnes selon la date d'expiration
                    campaigns.sort(function (a, b) {
                        return a.year - b.year;
                    });

                    for (i = 0; i < campaigns.length; i++) {
                        var campaignYear = campaigns[i].year;
                        var campaignMonth = campaigns[i].month;
                        var campaignCount = campaigns[i].count;

                        if (dateYearLast == campaignYear) {
                            lastYear.push(campaignCount);
                        }
                        if (dateYearNow == campaignYear) {
                            nowYear.push(campaignCount);
                        }
                    }
                    var month = new Array(
                        'janvier',
                        'février',
                        'mars',
                        'avril',
                        'mai',
                        'juin',
                        'juillet',
                        'aout',
                        'septembre',
                        'octobre',
                        'novembre',
                        'décembre'
                    );

                    var data = {
                        'lastYear': {
                            year: dateYearLast,
                            result: lastYear
                        },
                        'nowYear': {
                            year: dateYearNow,
                            result: nowYear
                        },
                        month: month
                    }

                    return res
                        .status(200)
                        .json(data);
                }

            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res
            .status(404)
            .json({
                statusCoded: statusCoded
            });
    }
}

exports.campaignReport = async (req, res) => {
    try {

        var formatHabillage = new Array();
        var formatInterstitiel = new Array();
        var formatGrandAngle = new Array();
        var formatMasthead = new Array();
        var formatInstream = new Array();
        var formatRectangleVideo = new Array();
        var formatLogo = new Array();
        var formatNative = new Array();
        var formatSlider = new Array();
        var formatMea = new Array();
        var formatSliderVideo = new Array();
        var formatClickCommand = new Array();

        // Permet de faire l'addition
        const reducer = (accumulator, currentValue) => accumulator + currentValue;

        let campaign_id = req.query.campaign_id;
        if (campaign_id) {
            campaignObject = {
                "campaign_id": req.query.campaign_id
            };

            var campaign = await ModelCampaigns
                .findOne({
                    where: {
                        campaign_id: campaign_id
                    },
                    include: [{
                        model: ModelAdvertisers
                    }]
                })
                .then(async function (campaign) {
                    if (!campaign) {
                        return res.json({
                            type: 'error',
                            message: 'Cette campagne n\'existe pas.'
                        });
                    }

                    // fonctionnalité de géneration du rapport
                    let campaigncrypt = campaign.campaign_crypt
                    let advertiserid = campaign.advertiser_id;
                    let campaignid = campaign.campaign_id;
                    var campaign_start_date = campaign.campaign_start_date;
                    var campaign_end_date = campaign.campaign_end_date;

                    // Récupére l'ensemble des insertions de la campagne
                    var epilotCampaign = await ModelEpilotCampaigns
                        .findOne({
                            where: {
                                campaign_id: campaign_id
                            },
                            include: [{
                                model: ModelEpilotInsertions,
                                attributes: [
                                    'epilot_campaign_id',
                                    'epilot_campaign_name',
                                    'format_group_id',
                                    'epilot_insertion_volume'
                                ],
                                where: {
                                    epilot_campaign_id: Sequelize.col('epilot_campaigns.epilot_campaign_id')
                                }
                            }]
                        })
                        .then(async function (epilotCampaign) {

                            if ((!Utilities.empty(epilotCampaign)) && (!Utilities.empty(epilotCampaign.epilot_insertions))) {
                                var epilot_insertions_count = epilotCampaign.epilot_insertions.length;

                                var insertions_group = new Array();
                                var booking = new Array();

                                for (let i = 0; i < epilot_insertions_count; i++) {
                                    var format_group_id = epilotCampaign.epilot_insertions[i].format_group_id;
                                    var insertion_volume = epilotCampaign.epilot_insertions[i].epilot_insertion_volume;
                                    // console.log('format_group_id :',format_group_id);
                                    switch (format_group_id) {
                                        case 1:
                                            formatHabillage.push(insertion_volume);
                                            break;
                                        case 2:
                                            formatInterstitiel.push(insertion_volume);
                                            break;
                                        case 3:
                                            formatMasthead.push(insertion_volume);
                                            break;
                                        case 4:
                                            formatGrandAngle.push(insertion_volume);
                                            break;
                                        case 5:
                                            formatSlider.push(insertion_volume);
                                            break;
                                        case 6:
                                            formatLogo.push(insertion_volume);
                                            break;
                                        case 9:
                                            formatInstream.push(insertion_volume);
                                            break;
                                        case 10:
                                            formatClickCommand.push(insertion_volume);
                                            break;
                                        case 11:
                                            formatNative.push(insertion_volume);
                                            break;
                                        case 12:
                                            formatRectangleVideo.push(insertion_volume);
                                            break;
                                        case 13:
                                            formatMea.push(insertion_volume);
                                            break;
                                        case 14:
                                            formatSliderVideo.push(insertion_volume);
                                            break;
                                    }

                                }
                            }

                        });

                    // Récupére l'ensemble des données du rapport
                    datalocalStorage = localStorage.getItem('campaignID-' + campaign.campaign_id);
                    if (reporting = JSON.parse(datalocalStorage)) {

                        var formats = new Array();
                        var booking = new Array();
                        var delivery = new Array();

                        if (reporting.habillage) {
                            formats.push('Habillage');
                            delivery.push(reporting.habillage.impressions);
                            booking.push(formatHabillage.reduce(reducer));
                        }

                        if (reporting.instream) {
                            formats.push('Instream');
                            delivery.push(reporting.instream.impressions);
                            booking.push(formatInstream.reduce(reducer) - reporting.instream.impressions);
                        }

                        if (reporting.interstitiel) {
                            console.log('RETORDT <<<<<<<<<<<<<', reporting.interstitiel.impressions)
                            console.log('RETORDT <<<<<<<<<<<<<', formatInterstitiel)
                            formats.push('Interstitiel');
                            delivery.push(reporting.interstitiel.impressions);
                            booking.push(formatInterstitiel.reduce(reducer) - reporting.interstitiel.impressions);
                        }

                        if (reporting.grandangle) {
                            formats.push('Grand Angle');
                            delivery.push(reporting.grandangle.impressions);
                            booking.push(formatGrandAngle.reduce(reducer) - reporting.grandangle.impressions);
                        }

                        if (reporting.masthead) {
                            formats.push('Masthead');
                            delivery.push(reporting.masthead.impressions);
                            booking.push(formatMasthead.reduce(reducer) - reporting.masthead.impressions);
                        }

                        if (reporting.rectanglevideo) {
                            formats.push('Rectangle Vidéo');
                            delivery.push(reporting.rectanglevideo.impressions);
                            booking.push(formatRectangleVideo.reduce(reducer) - reporting.rectanglevideo.impressions);
                        }

                        var data = {
                            'values': {
                                delivery: delivery,
                                booking: booking
                            },
                            formats: formats
                        }

                        return res
                            .status(200)
                            .json(data);
                    }

                });

        } else {
            return res.json({
                type: 'error',
                message: 'Veuillez saisir l\'identifiant de la campagne.'
            });
        }

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res
            .status(404)
            .json({
                statusCoded: statusCoded
            });
    }
}

exports.epilotCampaigns = async (req, res) => {
    try {
         // L'année derniére
        var dateYearLast = moment()
            .subtract(1, 'year')
            .format('YYYY');
        // Cette année
        var dateYearNow = moment().format('YYYY');

            campaigns = await ModelEpilotCampaigns.findAll({
                attributes: [
                    [
                        sequelize.fn('SUM', sequelize.col('epilot_campaign_budget_net')),
                        'sum'
                    ],
                    [
                        sequelize.fn('MONTH', sequelize.col('epilot_campaign_start_date')),
                        'month'
                    ],
                    [
                        sequelize.fn('YEAR', sequelize.col('epilot_campaign_start_date')),
                        'year'
                    ],
                    'epilot_campaign_nature'
                ],
                where: {
                    $and: sequelize.where(sequelize.fn('YEAR', sequelize.col('epilot_campaign_start_date')), { [Op.between]: [dateYearLast, dateYearNow] } ),
                    $and: sequelize.where(sequelize.col('epilot_campaign_status'), { [Op.eq]: 1 })  
                  // $and: sequelize.fn('YEAR', sequelize.col('epilot_campaign_start_date'))
                },
                group: [
                    'month', 'year','epilot_campaign_nature'
                ],           
                raw: true
              }).then(async function (campaigns) {
                if (!campaigns) {
                    return res
                        .status(404)
                        .json({
                            statusCoded: '404'
                        });
                }

                if (campaigns.length > 0) {
                    var dataArray = new Array();
                    var lastYear = new Array();
                    var nowYear = new Array();
                    var month = new Array();

                    // Trie les campagnes selon la date d'expiration
                    campaigns.sort(function (a, b) {
                        return a.year - b.year;
                    });

                    var dataResult = [];
                    var dataPeriode = [];
                    var dataMonthYear = [];
                    var dataMonthLetterYear = [];
                    
                    var dataResult_CL = [];
                    var dataResult_DIGOPS = [];
                    var dataResult_ECD = [];
                    var dataResult_EXTWB = [];
                    var dataResult_FLS = [];
                    var dataResult_HMOP = [];
                    var dataResult_IN = [];
                    var dataResult_MISS = [];
                    var dataResult_PROD = [];
                    var dataResult_PRODOP = [];

                    var dataResult_CL1 = [];
                    var dataResult_DIGOPS1 = [];
                    var dataResult_ECD1 = [];
                    var dataResult_EXTWB1 = [];
                    var dataResult_FLS1 = [];
                    var dataResult_HMOP1 = [];
                    var dataResult_IN1 = [];
                    var dataResult_MISS1 = [];
                    var dataResult_PROD1 = [];
                    var dataResult_PRODOP1 = [];

                   // console.log('Campaign lenght :',campaigns.length);

                    // Créer un tableau avec les années
                    var dataYears = new Array(dateYearLast, dateYearNow);                    
                    var monthLetter = new Array('janvier','février','mars','avril','mai','juin','juillet','aout','septembre','octobre','novembre','décembre');
                    var monthNumber = new Array('01','02','03','04','05','06','07','08','09','10','11','12'); 
                    for (i = 0; i < monthNumber.length; i++) { dataMonthYear.push(monthNumber[i]+'-'+dateYearLast); dataMonthLetterYear.push(monthLetter[i]+' '+dateYearLast); }
                    for (i = 0; i < monthNumber.length; i++) { dataMonthYear.push(monthNumber[i]+'-'+dateYearNow); dataMonthLetterYear.push(monthLetter[i]+' '+dateYearNow); }

                    for (i = 0; i < dataMonthYear.length; i++) { 
                      var month = dataMonthYear[i];
                                            
                      dataResult_CL[month] = 0;
                      dataResult_DIGOPS[month] = 0;
                      dataResult_ECD[month] = 0;
                      dataResult_EXTWB[month] = 0;
                      dataResult_FLS[month] = 0;
                      dataResult_HMOP[month] = 0;
                      dataResult_IN[month] = 0;
                      dataResult_MISS[month] = 0;
                      dataResult_PROD[month] = 0;
                      dataResult_PRODOP[month] = 0;
                    } 
                    
                    for (i = 0; i < campaigns.length; i++) {
                        var campaignYear = campaigns[i].year;
                        var campaignMonth = campaigns[i].month;
                        var campaignSum = campaigns[i].sum;
                        var campaignNature = campaigns[i].epilot_campaign_nature;
                       
                        if(campaignMonth < 10) { var campaignMonth = '0'+campaignMonth; } else { var campaignMonth = campaignMonth;  }
                        var searchMonth = campaignMonth+'-'+campaignYear;

                        if((campaignNature === 'CL') && !Utilities.empty(campaignSum)) { dataResult_CL[searchMonth] = campaignSum.toFixed(2); }
                        if((campaignNature === 'DIGOPS') && !Utilities.empty(campaignSum)) { dataResult_DIGOPS[searchMonth] = campaignSum.toFixed(2); }
                        if((campaignNature === 'ECD') && !Utilities.empty(campaignSum)) { dataResult_ECD[searchMonth] = campaignSum.toFixed(2); }
                        if((campaignNature === 'EXTWB') && !Utilities.empty(campaignSum)) { dataResult_EXTWB[searchMonth] = campaignSum.toFixed(2); }   
                        if((campaignNature === 'FLS') && !Utilities.empty(campaignSum)) { dataResult_FLS[searchMonth] = campaignSum.toFixed(2); } 
                        if((campaignNature === 'HMOP') && !Utilities.empty(campaignSum)) { dataResult_HMOP[searchMonth] = campaignSum.toFixed(2); }  
                        if((campaignNature === 'IN') && !Utilities.empty(campaignSum)) { dataResult_IN[searchMonth] = campaignSum.toFixed(2); }   
                        if((campaignNature === 'MISS') && !Utilities.empty(campaignSum)) { dataResult_MISS[searchMonth] = campaignSum.toFixed(2); }  
                        if((campaignNature === 'PROD') && !Utilities.empty(campaignSum)) { dataResult_PROD[searchMonth] = campaignSum.toFixed(2); } 
                        if((campaignNature === 'PRODOP') && !Utilities.empty(campaignSum)) { dataResult_PRODOP[searchMonth] = campaignSum.toFixed(2); }                         
                    }

                    // Retravaille les fichiers
                    for (i = 0; i < dataMonthYear.length; i++) {                       
                        var month = dataMonthYear[i];

                        dataResult_CL1.push(dataResult_CL[month]);
                        dataResult_DIGOPS1.push(dataResult_DIGOPS[month]);
                        dataResult_ECD1.push(dataResult_ECD[month]);
                        dataResult_EXTWB1.push(dataResult_EXTWB[month]);
                        dataResult_FLS1.push(dataResult_FLS[month]);
                        dataResult_HMOP1.push(dataResult_HMOP[month]);
                        dataResult_IN1.push(dataResult_IN[month]);
                        dataResult_MISS1.push(dataResult_MISS[month]);
                        dataResult_PROD1.push(dataResult_PROD[month]);
                        dataResult_PRODOP1.push(dataResult_PRODOP[month]);
                    }
                   
                    dataResult[0] = { name: 'CL', data: dataResult_CL1 }
                    dataResult[1] = { name: 'DIGOPS', data: dataResult_DIGOPS1 }
                    dataResult[2] = { name: 'ECD', data: dataResult_ECD1 }
                    dataResult[3] = { name: 'EXTWB', data: dataResult_EXTWB1 }
                    dataResult[4] = { name: 'FLS', data: dataResult_FLS1 }
                    dataResult[5] = { name: 'HMOP', data: dataResult_HMOP1 }
                    dataResult[6] = { name: 'IN', data: dataResult_IN1 }
                    dataResult[7] = { name: 'MISS', data: dataResult_MISS1 }
                    dataResult[8] = { name: 'PROD', data: dataResult_PROD1 }
                    dataResult[9] = { name: 'PRODOP', data: dataResult_PRODOP1 }

                     var data = {
                        data : dataResult,
                        month: dataMonthLetterYear
                     }
                   
                    return res
                        .status(200)
                        .json(data);
                }

            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res
            .status(404)
            .json({
                statusCoded: statusCoded
            });
    }
}