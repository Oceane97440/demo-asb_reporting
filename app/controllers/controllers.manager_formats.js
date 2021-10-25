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
const ModelFormatsGroups = require("../models/models.formats_groups");

const {
    promiseImpl
} = require('ejs');
const {
    insertions
} = require('./controllers.automate');

exports.index = async (req, res) => {
    try {
        // Liste tous les formats
        const data = new Object();

        // Créer le fil d'ariane
        const breadcrumbLink = 'formats';
        breadcrumb = new Array({
            'name': 'Formats',
            'link': 'formats'
        });
        data.breadcrumb = breadcrumb;


        res.render('manager/formats/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.list = async (req, res) => {
    try {
        // Liste tous les formats
        const data = new Object();

        // Créer le fil d'ariane
        const breadcrumbLink = 'formats';
        breadcrumb = new Array({
            'name': 'Formats',
            'link': 'formats'
        }, {
            'name': 'Liste les formats',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.formats = await ModelFormats.findAll({
            /* include: [
                 {
                     model: ModelCampaigns
                 }
             ]*/
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['format_id', 'ASC']
            ]
        });

        data.moment = moment;
        res.render('manager/formats/list.ejs', data);
    } catch (error) {
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
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
                include: [{
                    model: ModelAdvertisers
                }, {
                    model: ModelAgencies
                }, {
                    model: ModelInsertions
                }]
            })
            .then(async function (campaign) {
                if (!campaign) {
                    return res
                        .status(404)
                        .render("manager/error.ejs", {
                            statusCoded: 404
                        });
                }

                // Créer le fil d'ariane
                var breadcrumbLink = 'advertisers'
                breadcrumb = new Array({
                    'name': 'Campagnes',
                    'link': 'campaigns'
                }, {
                    'name': campaign.advertiser.advertiser_name,
                    'link': breadcrumbLink.concat('/', campaign.advertiser_id)
                }, {
                    'name': campaign.campaign_name,
                    'link': ''
                });
                data.breadcrumb = breadcrumb;

                // Récupére les données des campagnes epilot
                var epilot_campaign = await ModelEpilotCampaigns.findOne({
                    attributes: ['epilot_campaign_volume', 'epilot_campaign_budget_net'],
                    where: {
                        campaign_id: campaign_id
                    }
                });

                //test si epilot_campaign existe
                if (!Utilities.empty(epilot_campaign)) {
                    data.epilot_campaign = epilot_campaign;
                } else {
                    data.epilot_campaign = 0;
                }

                // Récupére les données des insertions de la campagne
                var insertionList = await ModelInsertions
                    .findAll({
                        where: {
                            campaign_id: campaign_id
                        },
                        include: [{
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
                        }]
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
                                        attributes: [
                                            "creative_url", "creative_mime_type", "creative_click_url"
                                        ],
                                        where: {
                                            insertion_id: insertionsIds
                                        },
                                        group: ["creative_url", "creative_mime_type", "creative_click_url"]
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
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.groups = async (req, res) => {
    try {
        // Liste tous les formats
        const data = new Object();

        // Créer le fil d'ariane
        const breadcrumbLink = 'formats';
        breadcrumb = new Array({
            'name': 'Formats',
            'link': 'formats'
        }, {
            'name': 'Groupes de formats',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.formats_groups = await ModelFormatsGroups.findAll({
            order: [
                ['group_format_id', 'ASC']
            ]
        });

        data.moment = moment;
        res.render('manager/formats/groups.ejs', data);
    } catch (error) {
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}