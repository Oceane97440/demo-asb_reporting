// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);

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

// Initialise les models 
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelAgencies = require("../models/models.agencies");

const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const ModelUsers = require("../models/models.users");
const ModelTemplates = require("../models/models.templates");
const ModelPlatforms = require("../models/models.platforms");
const ModelDeliverytypes = require("../models/models.deliverytypes");
const ModelCountries = require("../models/models.countries");
const ModelCampaignsEpilot = require("../models/models.campaings_epilot")


const ModelGroupsFormatsTypes = require(
    "../models/models.formats_groups_types"
);
const ModelFormatsTemplates = require("../models/models.formats_templates")
const ModelGroupsFormats = require("../models/models.groups_formats");
const ModelInsertionsTemplates = require(
    "../models/models.insertionstemplates"
);








exports.index = async (req, res) => {
    try {
        if (req.session.user.role === 1) { 

            // Liste tous les campagnes
            const data = new Object();
            data.campaigns = await ModelCampaigns.count();
            data.formats = await ModelFormats.count();
            data.advertisers = await ModelAdvertisers.count();
            data.insertions = await ModelInsertions.count();
            data.sites = await ModelSites.count();
            data.creatives = await ModelCreatives.count();
            data.users = await ModelUsers.count();
            data.epilot = await ModelCampaignsEpilot.count();

            data.infos = await ModelUsers.findAll();

            data.breadcrumb = "Tableau de bord";
            data.moment = moment;


                    //Creative url CDN: Vérification de l'https dans la créative / extentions
        const NOW = new Date();
        const url = 'https://cdn.antennepublicite.re';
        const extention = 'mp4|gif|jpeg|png|html';

       const creatives = await sequelize.query(
            'SELECT creatives.creative_id, creatives.creative_name, creatives.insertion_id,' +
                    ' creatives.creative_url, creatives.creative_mime_type, creatives.creatives_act' +
                    'ivated, creatives.creatives_archived,campaigns.campaign_id ,campaigns.campaign' +
                    '_name ,campaigns.campaign_archived , advertisers.advertiser_name, campaigns.ad' +
                    'vertiser_id FROM asb_creatives AS creatives INNER JOIN asb_insertions AS inser' +
                    'tion ON creatives.insertion_id = insertion.insertion_id AND insertion.insertio' +
                    'n_archived = 0 AND insertion.insertion_end_date >= ? INNER JOIN asb_campaigns ' +
                    'AS campaigns ON campaigns.campaign_id = insertion.campaign_id INNER JOIN asb_a' +
                    'dvertisers AS advertisers ON advertisers.advertiser_id = campaigns.advertiser_' +
                    'id  WHERE (creatives.creative_url NOT REGEXP ? OR creatives.creative_mime_type' +
                    ' NOT REGEXP ?) AND creatives.creatives_activated = 1 AND creatives.creatives_a' +
                    'rchived = 0 AND campaigns.campaign_archived = 0 AND advertisers.advertiser_id ' +
                    ' NOT IN (409707,320778)',
            {
                replacements: [
                    NOW, url, extention
                ],
                type: QueryTypes.SELECT
            }
        );

        //La campagne est programmée mais pas en ligne

        const insertions_alert = await ModelInsertions.findAll({

            where: {

                insertion_archived: 0,
                insertion_status_id: 0,
                insertion_start_date: {
                    [Op.gt]: NOW
                }
            },

            include: [
                {
                    model: ModelCampaigns,

                    include: [
                        {
                            model: ModelAdvertisers
                        }
                    ]
                }
            ]
        });

     
        data.creatives = creatives;
        data.insertions_alert = insertions_alert;


  
             
            res.render('manager/index.ejs',data);
        } else {
            res.status(404).render("error-status.ejs", {
                statusCoded,

            });
        }  
    } catch (error) {
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.data = async (req, res) => {
    try {
        if (req.session.user.role === 1) { 

            // Liste tous les campagnes
            const data = new Object();
            data.agencies = await ModelAgencies.count();
            data.advertisers = await ModelAdvertisers.count();
            data.campaigns = await ModelCampaigns.count();
            data.formats = await ModelFormats.count();
            data.insertions = await ModelInsertions.count();
            data.sites = await ModelSites.count();
            data.templates = await ModelTemplates.count()



            data.breadcrumb = "Tableau de bord";
            data.moment = moment;



  
             
            res.render('manager/api_data.ejs',data);
        } else {
            res.status(404).render("error-status.ejs", {
                statusCoded,

            });
        }  
    } catch (error) {
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.error = async (req, res) => {
    data.breadcrumb = "Erreur";
}