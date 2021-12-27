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

         // Créer le fil d'ariane
         breadcrumb = new Array({
             'name': 'Gestion des alertes',
             'link': ''
         }, );
         data.breadcrumb = breadcrumb;
    
        // Liste les campagnes sans insertions
        data.campaigns = await ModelCampaigns.findAll(
            {
               where: {
                    campaign_start_date: { 
                        [Op.between]: ['2020-01-01', '2020-12-31']
                     }
                },
                include: [{
                    model: ModelInsertions,
                    where: { campaign_id: {
                        [Op.eq]: null
                      } }
                }]
            }
        );


        data.moment = moment;
        console.log( data.campaigns.length);
        res.render('manager/alerts/index.ejs', data);
      //  

      //  process.exit(1);

      /*   // Liste tous les campagnes
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

        var yesterday = moment().subtract(1, 'days').format('YYYY-MM-DD');
        var todayAdd10 = moment().add(10, 'days').format('YYYY-MM-DD');
       
        // Affiche les campagnes qui se terminent dans les 10 prochains jours
        campaigns_last = await ModelCampaigns.findAll(
            {
                where: {
                    campaign_start_date: { 
                        [Op.between]: [yesterday, todayAdd10]
                     }
                }
            }
        );

        data.campaigns_last = campaigns_last;
  
        res.render('manager/index.ejs', data);
        */
    } catch (error) {
        var statusCoded = error.response;        
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.error = async (req, res) => {
    data.breadcrumb = "Erreur";
}