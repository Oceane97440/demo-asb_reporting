// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require('axios');
var crypto = require('crypto');

// const request = require('request'); const bodyParser =
// require('body-parser');

const {Op} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

const {QueryTypes} = require('sequelize');

const {check, query} = require('express-validator');

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

const {promiseImpl} = require('ejs');
const {insertions} = require('./controllers.automate');

exports.index = async (req, res) => {
    try {} catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
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
                    [Op.and]: [
                        {
                            [sequelize.fn('YEAR', sequelize.col('campaign_start_date'))]: {
                                [Op.between]: [dateYearLast, dateYearNow]
                            },
                            [sequelize.fn('MONTH', sequelize.col('campaign_start_date'))]: {
                                [Op.between]: [1, 12]
                            }
                        }
                    ]
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
                        .json({statusCoded: '404'});
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
            .json({statusCoded: statusCoded});
    }
}

exports.advertisers = async (req, res) => {
    try {

        // Graph de suivi des campagnes
        var advertiser_id = req.params.advertiser_id;

        // L'année derniére
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
                    [Op.and]: [
                        {
                            [sequelize.fn('YEAR', sequelize.col('campaign_start_date'))]: {
                                [Op.between]: [dateYearLast, dateYearNow]
                            },
                            [sequelize.fn('MONTH', sequelize.col('campaign_start_date'))]: {
                                [Op.between]: [1, 12]
                            },
                            'advertiser_id': advertiser_id
                        }
                    ]
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
                        .json({statusCoded: '404'});
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
            .json({statusCoded: statusCoded});
    }

}

exports.campaignReport = async (req, res) => {
    try {

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
                    include: [
                        {
                            model: ModelAdvertisers
                        }
                    ]
                })
                .then(async function (campaign) {
                    if (!campaign) {
                        return res.json({type: 'error', message: 'Cette campagne n\'existe pas.'});
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
                        include: [
                            {
                                model: ModelEpilotInsertions,
                                attributes: [
                                   'format_group_id',
                                    [sequelize.fn('sum', sequelize.col('epilot_insertion_volume')), 'insertion_volume']
                                ],
                                where : {
                                    epilot_campaign_id : Sequelize.col('epilot_campaigns.epilot_campaign_id'),
                                    'format_group_id' : '9'
                                },
                                group:['format_group_id','user_id']
                            }
                        ]
                    })
                    .then(async function (epilotCampaign) {
                       console.log(epilotCampaign.epilot_insertions)
                    });




                    // Récupére l'ensemble des données du rapport
                    datalocalStorage = localStorage.getItem('campaignID-' + campaign.campaign_id);
                    if (reporting = JSON.parse(datalocalStorage)) {
                       // console.log('REPORTING : ', reporting);
                       console.log('REPORTING : ');

                        var formats = new Array();
                        var booking = new Array(); 
                        var delivery = new Array();

                        if (reporting.habillage) {
                            formats.push('habillage');
                            delivery.push(reporting.habillage.impressions);

                        }

                        if (reporting.instream) {
                            formats.push('instream');
                            delivery.push(reporting.instream.impressions);
                        }

                        if (reporting.interstitiel) {
                            formats.push('interstitiel');
                            delivery.push(reporting.interstitiel.impressions);
                        }

                        var data = { 'values' : { delivery : delivery, booking : booking}, formats : formats}

                        return res
                            .status(200)
                            .json(data);
                    }

                    /* var month =  new Array('janvier','février','mars','avril','mai','juin','juillet', 'aout','septembre','octobre','novembre','décembre');

                    var data = { 'lastYear' : { year : dateYearLast, result : lastYear} ,  'nowYear' : { year : dateYearNow, result : nowYear} , month : month}

                    return res.status(200).json(data);
                */

                });

        } else {
            return res.json(
                {type: 'error', message: 'Veuillez saisir l\'identifiant de la campagne.'}
            );
        }

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res
            .status(404)
            .json({statusCoded: statusCoded});
    }
}