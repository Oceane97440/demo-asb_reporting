// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);

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

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const Utilities = require("../functions/functions.utilities");

// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelInsertionsPriorities = require("../models/models.insertions_priorities");
const ModelInsertionsStatus = require("../models/models.insertions_status");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");

const TEXT_REGEX = /^.{1,51}$/

const {
    promiseImpl
} = require('ejs');
const {
    insertions
} = require('./controllers.automate');

exports.index = async (req, res) => {
    try {
        // Liste toutes les insertions
        const data = new Object();
        data.breadcrumb = "Insertions";
        data.insertions = await ModelInsertions.findAll({
            include: [{
                model: ModelCampaigns
            }]
        });

        data.moment = moment;
        res.render('manager/insertions/index.ejs', data);
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
        // Liste toutes les insertions
        const data = new Object();
        data.breadcrumb = "Liste des insertions";

        data.insertions = await ModelInsertions.findAll({
            include: [{
                model: ModelCampaigns
            }]
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['insertion_id', 'DESC']
            ]
        });

        data.moment = moment;
        res.render('manager/insertions/list.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.view = async (req, res) => {
    try {
        const data = new Object();
        data.breadcrumb = "Insertions";
        var insertionsIds = new Array();

        var campaign_id = req.params.campaign_id;
        var insertion_id = req.params.insertion_id;
        var insertion = await ModelInsertions
            .findOne({
                where: {
                    campaign_id: campaign_id,
                    insertion_id: insertion_id
                },
                include: [{
                        model: ModelCampaigns,
                        attributes: ['campaign_id', 'campaign_name']
                    },
                    // { model: ModelAdvertisers, attributes: ['advertiser_id', 'advertiser_name'] },
                    {
                        model: ModelFormats,
                        attributes: ['format_id', 'format_name']
                    },
                    {
                        model: ModelInsertionsPriorities,
                        attributes: ['priority_id', 'priority_name']
                    },
                    {
                        model: ModelInsertionsStatus,
                        attributes: ['insertion_status_id', 'insertion_status_name']
                    },
                ]
            })
            .then(async function (insertion) {
                if (!insertion) {
                    return res
                        .status(404)
                        .render("manager/error.ejs", {
                            statusCoded: 404
                        });
                }

                // Récupére l'annonceur lié à cette campagne
                var campaign = await ModelCampaigns
                    .findOne({
                        where: {
                            campaign_id: campaign_id
                        },
                        include: [{
                            model: ModelAdvertisers
                        }]
                    });

                // Récupére les données des creatives de l'insertion
                var creativesList = await ModelCreatives.findAll({
                    where: {
                        insertion_id: insertion_id
                    }
                }).then(async function (creativesList) {
                    data.creatives = creativesList;
                    console.log(creativesList)
                });

                // Attribue les données de la campagne                   
                data.insertion = insertion;
                data.campaign = campaign;
                data.moment = moment;
                data.Utilities = Utilities;

                res.render('manager/insertions/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.create = async (req, res) => {
    try {
        const data = new Object();
        data.breadcrumb = "Ajouter une insertions";

        // Récupére l'ensemble les données
        data.campaigns = await ModelCampaigns.findOne({
            where: {
                campaign_id: req.params.id
            },

        });
        data.formats = await ModelFormats.findAll({
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['format_id', 'DESC']
            ]
        });
        data.sites = await ModelSites.findAll({
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['site_id', 'DESC']
            ]
        });


        res.render('manager/insertions/create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}


exports.create_post = async (req, res) => {
    try {
        const campaign = req.body.campaign
        const insertion = req.body.insertion
        const format = req.body.format
        const site = req.body.site
        const start_date = req.body.campaign_start_date
        const end_date = req.body.campaign_end_date

        if (!TEXT_REGEX.test(insertion)) {
            req.session.message = {
                type: 'danger',
                intro: 'Erreur',
                message: 'Le nombre de caratère est limité à 50'
            }
            return res.redirect(`/manager/insertions/create/${campaign}`)

        }

        if (insertion == '' || campaign == '' || start_date == '' || end_date == '' || format == '') {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Les champs doivent être complétés'
            }
            return res.redirect(`/manager/insertions/create/${campaign}`)
        }

        const timstasp_start = Date.parse(start_date)
        const timstasp_end = Date.parse(end_date)

        // si date aujourd'hui est >= à la date selectionné envoie une erreur
        if (timstasp_end <= timstasp_start || timstasp_start >= timstasp_end) {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Saisissez une date valide'
            }
            return res.redirect(`/manager/insertions/create/${campaign}`)
        }

        var requestInsertion = {
            "isDeliveryRegulated": true,

            "isUsedByGuaranteedDeal": false,

            "isUsedByNonGuaranteedDeal": false,

            "voiceShare": 0,

            "eventId": 0,

            "name": insertion,

            "description": "",

            "isPersonalizedAd": false,

            "siteIds": site,

            "insertionStatusId": 1,

            "startDate": start_date,

            "endDate": end_date,

            "campaignId": campaign,

            "insertionTypeId": 0,

            "deliveryTypeId": 10,

            "timezoneId": 4,

            "priorityId": 62,

            "periodicCappingId": 0,

            "groupCappingId": 0,

            "maxImpressions": 0,

            "weight": 0,

            "maxClicks": 0,

            "maxImpressionsPerDay": 0,

            "maxClicksPerDay": 0,

            "insertionGroupedVolumeId": 452054,

            "eventImpressions": 0,

            "isHolisticYieldEnabled": false,

            "deliverLeftVolumeAfterEndDate": false,

            "globalCapping": 0,

            "cappingPerVisit": 0,

            "cappingPerClick": 0,

            "autoCapping": 0,

            "periodicCappingImpressions": 0,

            "periodicCappingPeriod": 0,

            "isObaIconEnabled": false,

            "formatId": format,

            "externalId": 0,

            "externalDescription": "",

            "updatedAt": "2020-08-07T16:29:00",

            "createdAt": "2020-08-07T13:43:00",

            "isArchived": false,

            "rateTypeId": 0,

            "rate": 0.0,

            "rateNet": 0.0,

            "discount": 0.0,

            "currencyId": 0,

            "insertionLinkId": 0,

            "insertionExclusionIds": [

                111233

            ],

            "customizedScript": "",

            "salesChannelId": 1

        }

        await ModelInsertions
            .findOne({
                attributes: ['insertion_name'],
                where: {
                    insertion_name: insertion
                }
            }).then(async function (insertionFound) {


                if (!insertionFound) {


                    let insertion_create = await AxiosFunction.postManage(
                        'insertions',
                        requestInsertion
                    );


                    if (insertion_create.headers.location) {


                        var url_location = insertion_create.headers.location



                        var insertion_get = await AxiosFunction.getManage(url_location);



                        const insertion_id = insertion_get.data.id


                        await ModelInsertions.create({
                            insertion_id: insertion_id,
                            insertion_name: insertion,
                            campaign_id: campaign,
                            campaign_start_date: start_date,
                            campaign_end_date: end_date,
                            campaign_archived: 0

                        });

                        req.session.message = {
                            type: 'success',
                            intro: 'Ok',
                            message: 'L\'inserion a été crée dans SMARTADSERVEUR',

                        }
                        return res.redirect(`/manager/insertions/create/${campaign}`)
                    }





                } else {
                    req.session.message = {
                        type: 'danger',
                        intro: 'Erreur',
                        message: 'Insertions est déjà utilisé'
                    }
                    return res.redirect(`/manager/insertions/create/${campaign}`)
                }


            })





    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}