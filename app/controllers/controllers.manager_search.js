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

// For the default version
/*
const algoliasearch = require('algoliasearch');

const client = algoliasearch('7L0LDMH42V', 'bf57bd2367126fc4d4a48d8549f48f03');
const index = client.initIndex('asb_project');
*/
// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const ModelEpilotCampaigns = require("../models/models.epilot_campaigns");
const ModelEpilotInsertions = require("../models/models.epilot_insertions");

const TEXT_REGEX = /^.{1,51}$/

const {promiseImpl} = require('ejs');

exports.index = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({'name': 'Annonceurs', 'link': ''});
        data.breadcrumb = breadcrumb;

        data.advertisers = await ModelAdvertisers.findAll({
            include: [
                {
                    model: ModelCampaigns
                }
            ]
        });
        data.moment = moment;

        res.render('manager/advertisers/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.import = async (req, res) => {
    try {
        const results = new Object();

        campaignID = '1931277'
        
         // Récupére les données des campagnes
       


       console.log('campaigns : ',campaigns)
        
        var campaigns = ModelCampaigns
            .findAll(
                    { limit : 5 }
                 )
            .then(async function (campaigns) {
               // data.campaigns = campaigns;
             //   console.log(data.campaigns)
                campaignsLength = campaigns.length;

             for (c = 0; c < campaignsLength; c++) {
                var campaignID = campaigns[c].campaign_id;
                console.log(campaignID);                
                insertions = await ModelInsertions.findAll({
                            where: {
                                campaign_id: campaignID
                            }
                            /*,
                            include: [{
                                model: ModelCampaigns
                            }]
                            */
                        });
                lol = campaigns[c];
                       // lol.concat(insertions)

                        console.log( lol);
                        process.exit(1);
            }


/*
             index
             .saveObjects(campaigns, { autoGenerateObjectIDIfNotExist: true })
             .then(({ objectIDs }) => {
               console.log(objectIDs);
             });
*/
            });

           // process.exit(1);

        //  res.render('manager/advertisers/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}