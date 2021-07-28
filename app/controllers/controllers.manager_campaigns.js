// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);

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
const ModelCampaignsEpilot = require("../models/models.campaigns_epilot")

const {promiseImpl} = require('ejs');
const {insertions} = require('./controllers.automate');

exports.index = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': ''
        },);
        data.breadcrumb = breadcrumb;

        data.campaigns = await ModelCampaigns.findAll({
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        // Affiche les campagnes se terminant aujourd'hui
        var dateNow = moment().format('YYYY-MM-DD');
        var dateTomorrow = moment().add(1, 'days').format('YYYY-MM-DD');
        var date5Days = moment().add(5, 'days').format('YYYY-MM-DD');

        data.campaigns_today = await ModelCampaigns.findAll({
            where: {
                campaign_end_date: {
                    [Op.like]: '%' + dateNow + '%'
                }
            },
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        // Affiche les campagnes se terminant demain
        data.campaigns_tomorrow = await ModelCampaigns.findAll({
            where: {
                campaign_end_date: {
                    [Op.like]: '%' + dateTomorrow + '%'
                }
            },
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        // Affiche les campagnes se terminant dans les 5 prochains jours
        data.campaigns_nextdays = await ModelCampaigns.findAll({
            where: {
                [Op.or]: [
                    {
                        campaign_start_date: {
                            [Op.between]: [ dateNow, date5Days ]  
                        }
                }
                ],
                [Op.or]: [
                    {                       
                        campaign_end_date: {
                            [Op.between]: [ dateNow, date5Days ]  
                        }
                }
                ]      
            },
            order: [
                // Will escape title and validate DESC against a list of valid direction parameters
                ['campaign_start_date', 'ASC']
            ],
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });


         // Affiche les campagnes se terminant dans les 5 prochains jours
         data.campaigns_online = await ModelCampaigns.findAll({
            where: {
                campaign_start_date: {
                    [Op.gte]: '%' + dateNow + '%'
                }
            },
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        data.moment = moment;

        console.log('dateNow :',dateNow)
        console.log('dateTomorrow :',dateTomorrow)
        console.log('date5Days :',date5Days, ' - ',data.campaigns_nextdays.length)

        res.render('manager/campaigns/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.list = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();

        // Créer le fil d'ariane
        const breadcrumbLink = 'campaigns';
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Liste des campagnes',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.campaigns = await ModelCampaigns.findAll({
            include: [
                {
                    model: ModelAdvertisers
                }, {
                    model: ModelInsertions
                }
            ]
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['campaign_id', 'DESC']
            ]
        });

        data.moment = moment;
        res.render('manager/campaigns/list.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.view = async (req, res) => {
    try {
        const data = new Object();

        var insertionsIds = new Array();
        data.insertions = new Array();
        data.creatives = new Array();

        var campaign_id = req.params.id;
        var campaign = await ModelCampaigns
            .findOne({
                where: {
                    campaign_id: campaign_id
                },
                include: [
                    {
                        model: ModelAdvertisers
                    }, {
                        model: ModelAgencies
                    }, {
                        model: ModelInsertions
                    }
                ]
            })
            .then(async function (campaign) {
                if (!campaign) {
                    return res
                        .status(404)
                        .render("manager/error.ejs", {statusCoded: 404});
                }

                // Créer le fil d'ariane
                var breadcrumbLink = 'advertisers'
                breadcrumb = new Array({
                    'name': 'Campagnes',
                    'link': 'campaigns'
                }, {
                    'name': campaign.advertiser.advertiser_name,
                    'link': breadcrumbLink.concat('/',campaign.advertiser_id)
                }, {
                    'name': campaign.campaign_name,
                    'link': ''
                });
                data.breadcrumb = breadcrumb;

                // Récupére les données des insertions de la campagne
                var insertionList = await ModelInsertions
                    .findAll({
                        where: {
                            campaign_id: campaign_id
                        },
                        include: [
                            {
                                model: ModelCampaigns,
                                attributes: ['campaign_id', 'campaign_name']
                            }, {
                                model: ModelFormats,
                                attributes: ['format_id', 'format_name']
                            }, {
                                model: ModelInsertionsPriorities,
                                attributes: ['priority_id', 'priority_name']
                            }, {
                                model: ModelInsertionsStatus,
                                attributes: ['insertion_status_id', 'insertion_status_name']
                            }
                        ]
                    })
                    .then(async function (insertionList) {

                        if (!Utilities.empty(insertionList) && (insertionList.length > 0)) {

                            data.insertions = insertionList;
                            for (i = 0; i < insertionList.length; i++) {
                                insertionsIds.push(insertionList[i].insertion_id);
                            }

                            // Récupére l'ensemble des insertions IDs pour afficher l'ensemble des créatives
                            if (insertionsIds) {
                                // Récupére les données des creatives de l'insertion
                                var creativesList = await ModelCreatives
                                    .findAll({
                                        where: {
                                            insertion_id: insertionsIds
                                        },
                                        group: 'creative_url'
                                    })
                                    .then(async function (creativesList) {
                                        data.creatives = creativesList;
                                    });
                            }

                        }
                    });

                // Attribue les données de la campagne
                data.campaign = campaign;
                data.moment = moment;
                data.utilities = Utilities;

                // Récupére l'ensemble des données du rapport
                data_localStorage = localStorage.getItem('campaignID-' + campaign.campaign_id);
                data.reporting = JSON.parse(data_localStorage);

                res.render('manager/campaigns/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.create = async (req, res) => {
    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Créer une campagne',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        // Récupére l'ensemble des annonceurs
        var advertisers = await ModelAdvertisers
            .findAll({
                order: [
                    // Will escape title and validate DESC against a list of valid direction
                    // parameters
                    ['advertiser_name', 'ASC']
                ]
            })
            .then(async function (advertisers) {
                data.advertisers = advertisers;
            });

        res.render('manager/campaigns/create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.create_post = async (req, res) => {
    try {
        console.log(req.body);

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.list_epilot = async (req, res) => {

    try {
        // Liste tous les campagnes
        const data = new Object();
        data.breadcrumb = "Liste des campagnes";

        data.epilot = await ModelCampaignsEpilot.findAll({});
        data.formats = await ModelFormats.findAll({
            attributes: ['format_group'],
            group: "format_group",
            where: {
                format_group: {
                    [Op.not]: null
                }
            },
            order: [
                ['format_group', 'ASC']
            ]
        })
        data.moment = moment;

        res.render('manager/campaigns/list_epilot.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.epilot_create = async (req, res) => {
    try {
        const data = new Object();
        data.breadcrumb = "Ajouter une campagne EPILOT";

        // Récupére l'ensemble des annonceurs
        var advertisers = await ModelAdvertisers
            .findAll({
                order: [
                    ['advertiser_name', 'ASC']
                ]
            })
            .then(async function (advertisers) {
                data.advertisers = advertisers;
            });

        // Récupére l'ensemble des annonceurs
        var formats = await ModelFormats
            .findAll({
                order: [
                    ['format_name', 'ASC']
                ]
            })
            .then(async function (formats) {
                data.formats = formats;
            });

        res.render('manager/campaigns/epilot_create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}