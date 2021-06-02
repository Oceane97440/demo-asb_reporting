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

// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const {
    promiseImpl
} = require('ejs');

const TEXT_REGEX =/^.{1,51}$/

exports.index = async (req, res) => {
    try {
        if (req.session.user.role === 1) {
            // Liste tous les campagnes
            const data = new Object();
            data.breadcrumb = "Campagnes";
            data.campaigns = await ModelCampaigns.findAll({
                include: [{
                    model: ModelAdvertisers
                }]
            });

            data.moment = moment;
            res.render('manager/campaigns/index.ejs', data);

        } else {
            res.status(404).render("error-status.ejs", {
                statusCoded,

            });
        }

    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.list = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();
        data.breadcrumb = "Liste des campagnes";

        data.campaigns = await ModelCampaigns.findAll({
            include: [{
                model: ModelAdvertisers
            }]
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
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.view = async (req, res) => {
    if (req.session.user.role == 1) {
        console.log('Administrateur', req.session.user)

    } else {
        console.log('Visiteur')

    }

    try {
        const data = new Object();
        data.breadcrumb = "Campagnes";

        var campaign_id = req.params.id;
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
                if (!campaign)
                    return res
                        .status(404)
                        .render("manager/error.ejs", {
                            statusCoded: 404
                        });

                // Récupére les données des insertions de la campagne
                insertions = await ModelInsertions.findAll({
                    where: {
                        campaign_id: campaign_id
                    },
                    include: [{
                        model: ModelCampaigns
                    }]
                });

                // Attribue les données de la campagne
                data.insertions = insertions
                data.campaign = campaign;
                data.moment = moment;
                res.render('manager/campaigns/view.ejs', data);
            });

        // console.log(campaign);

    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.create = async (req, res) => {
    try {
        const data = new Object();
        data.breadcrumb = "Ajouter une campagne";

        // Récupére l'ensemble des annonceurs
        var advertisers = await ModelAdvertisers.findAll({
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['advertiser_name', 'ASC']
            ]
        }).then(async function (advertisers) {
            data.advertisers = advertisers;
        });

        res.render('manager/campaigns/create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}



exports.create_post = async (req, res) => {
    try {
        const advertiser = req.body.advertiser_id
        const campaign = req.body.campaign_name
        const start_date = req.body.campaign_start_date
        const end_date = req.body.campaign_end_date

        if (!TEXT_REGEX.test(campaign)) {
            req.session.message = {
              type: 'danger',
              intro: 'Erreur',
              message: 'Le nombre de caratère est limité à 50'
            }
            return res.redirect('/manager/campaigns/create')
          }

        if (advertiser == '' || campaign == '' || start_date == '' || end_date == '') {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Les champs doivent être complétés'
            }
            return res.redirect('/manager/campaigns/create')
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
            return res.redirect('/manager/campaigns/create')
        }

        var requestCampaign = {
            "name": campaign,

            "advertiserId": advertiser,

            "agencyId": 0,

            "campaignStatusId": 3,

            "description": "",

            "externalCampaignId": "",

            "traffickedBy": 0,

            "startDate": start_date,

            "endDate": end_date,

            "globalCapping": 0,

            "visitCapping": 0,

            "isArchived": false

        }

        let campaign_create = await AxiosFunction.getManage('campaigns', requestCampaign);
        if (campaign_create.headers.location) {

            var url = campaign_create.headers.location
            req.session.message = {
                type: 'success',
                intro: 'Ok',
                message: 'La campagne a été crée dans SMARTADSERVEUR',
                id_advertiser : advertiser

            }
            return res.redirect('/manager/campaigns/create');
        }



    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}


exports.create_insertions = async (req, res) => {
    try {
        const data = new Object();
        data.breadcrumb = "Ajouter une insertions";

        // Récupére l'ensemble les données
        data.campaigns = await ModelCampaigns.findAll({
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['campaign_id', 'DESC']
            ]
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
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}



exports.create_post_insertions = async (req, res) => {
    try {
        const campaign = req.body.campaign
        const insertion = req.body.insertion
        const format = req.body.format
        const site = req.body.site
        const start_date = req.body.campaign_start_date
        const end_date = req.body.campaign_end_date


     //   console.log(req.body)

      if (!TEXT_REGEX.test(insertion)) {
            req.session.message = {
              type: 'danger',
              intro: 'Erreur',
              message: 'Le nombre de caratère est limité à 50'
            }
            return res.redirect('/manager/insertions/create')
          }

        if (insertion == '' || campaign == '' || start_date == '' || end_date == ''|| format == ''|| site == '') {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Les champs doivent être complétés'
            }
            return res.redirect('/manager/insertions/create')
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
            return res.redirect('/manager/insertions/create')
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
 
        let insertion_create = await AxiosFunction.getManage('insertions', requestInsertion);
        if (insertion_create.headers.location) {

            req.session.message = {
                type: 'success',
                intro: 'Ok',
                message: 'L\'inserion a été crée dans SMARTADSERVEUR',
                id_campaign : campaign

            }
            return res.redirect('/manager/insertions/create')
        }



    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}