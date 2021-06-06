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

// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelInsertionsPriorities = require("../models/models.insertions_priorities");
const ModelInsertionsStatus = require("../models/models.insertions_status");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const {promiseImpl} = require('ejs');
const { insertions } = require('./controllers.automate');

exports.index = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();
        data.breadcrumb = "Campagnes";
        data.campaigns = await ModelCampaigns.findAll({
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });
        
        data.moment = moment;
        res.render('manager/campaigns/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.list = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();
        data.breadcrumb = "Liste des campagnes";

        data.campaigns = await ModelCampaigns.findAll({
            include: [
                {
                    model: ModelAdvertisers
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
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.view = async (req, res) => {
     try {
        const data = new Object();
        data.breadcrumb = "Campagnes";

        var campaign_id = req.params.id;
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
                    return res
                        .status(404)
                        .render("manager/error.ejs", {statusCoded: 404});
                }

                // Récupére les données des insertions de la campagne
               var insertionList = await ModelInsertions.findAll({
                    where: {
                        campaign_id: campaign_id
                    }, 
                    include: [
                        { model: ModelCampaigns, attributes: ['campaign_id', 'campaign_name'] },
                        { model: ModelFormats, attributes: ['format_id', 'format_name'] },
                        { model: ModelInsertionsPriorities, attributes: ['priority_id', 'priority_name'] },
                        { model: ModelInsertionsStatus, attributes: ['insertion_status_id', 'insertion_status_name'] }
                    ]
                })

               
                // Attribue les données de la campagne
                data.insertions = insertionList;
                data.creatives = false;
                data.campaign = campaign;
                data.moment = moment;

                res.render('manager/campaigns/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.create = async (req, res) => {
    try {
        const data = new Object();
        data.breadcrumb = "Ajouter une campagne";
        
        // Récupére l'ensemble des annonceurs
        var advertisers = await ModelAdvertisers.findAll(            
            {
                order: [
                    // Will escape title and validate DESC against a list of valid direction
                    // parameters
                    ['advertiser_name', 'ASC']
                ]
            }
        ).then(async function (advertisers) {
            data.advertisers = advertisers;
        });

        res.render('manager/campaigns/create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}



exports.create_post = async (req, res) => {
    try {
      console.log(req.body);

    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}
