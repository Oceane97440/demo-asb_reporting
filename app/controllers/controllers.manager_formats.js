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
const ModelFormatsSites = require("../models/models.formats_sites");

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

        var format_id = req.params.id;
        var format = await ModelFormats
            .findOne({
                where: {
                    format_id: format_id
                }                
            })
            .then(async function (format) {
                if (!format) {
                    return res
                        .status(404)
                        .render("manager/error.ejs", {
                            statusCoded: 404
                        });
                }
                

                // Créer le fil d'ariane
                var breadcrumbLink = 'formats'
                breadcrumb = new Array({
                    'name': 'Formats',
                    'link': 'formats'
                }, {
                    'name': format.format_name,
                    'link': ''
                });
                data.breadcrumb = breadcrumb;

                // Récupére les sites pour ce format
                data.formats_sites = await ModelFormatsSites.findAll({
                    where: {
                        format_id: format_id
                    },
                    include: [
                        {
                            model: ModelFormats
                        },
                        {
                            model: ModelSites
                        }
                    ]
                });








              /*

                // Récupére les données des insertions de la campagne
                var insertionList = await ModelInsertions
                    .findAll({
                        where: {
                            format_id: format_id
                        },
                        include: [{
                            model: Modelformats,
                            attributes: ['format_id', 'format_name']
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
                    */
                // Attribue les données du format
                data.format = format;
                data.moment = moment;
                data.utilities = Utilities;
                 
                res.render('manager/formats/view.ejs', data);
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
                ['format_group_id', 'ASC']
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