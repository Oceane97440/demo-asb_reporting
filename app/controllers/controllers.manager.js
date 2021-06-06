// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);

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

// Initialise les models
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const ModelUsers = require("../models/models.users");

exports.index = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();
        data.campaigns = await ModelCampaigns.count();
        data.formats = await ModelFormats.count();
        data.advertisers = await ModelAdvertisers.count();
        data.insertions = await ModelInsertions.count();
        data.sites = await ModelSites.count();
        data.creatives = await ModelCreatives.count();
        data.users = await ModelUsers.count();

        data.breadcrumb = "Tableau de bord";
        data.moment = moment;

        // Affiche les campagnes qui se terminent dans les 5 derniers jours
        campaigns_last = await ModelCampaigns.findAll(
            {
                where: {
                    campaign_start_date: { 
                        [Op.between]: ['2021-06-01', '2021-06-13'],  
                     }
                }
            }
        );

        data.campaigns_last = campaigns_last;
       // console.log(campaigns_last);
      //  process.exit()

        // SELECT * FROM `asb_campaigns` WHERE (`campaign_start_date` BETWEEN '2021-06-05' AND '2021-06-13') OR (`campaign_end_date` BETWEEN '2021-06-05' AND '2021-06-13')


        res.render('manager/index.ejs', data);
    } catch (error) {
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.error = async (req, res) => {
    data.breadcrumb = "Erreur";
}