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

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const SmartFunction = require("../functions/functions.smartadserver.api");
const Utilities = require("../functions/functions.utilities");

// Initialise les models const ModelSite = require("../models/models.sites");
const ModelAgencies = require("../models/models.agencies");
const ModelFormats = require("../models/models.formats");
const ModelCampaigns = require("../models/models.campaigns");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelSites = require("../models/models.sites");
const ModelTemplates = require("../models/models.templates");
const ModelPlatforms = require("../models/models.platforms");
const ModelDeliverytypes = require("../models/models.deliverytypes");
const ModelCountries = require("../models/models.countries");

const ModelGroupsFormatsTypes = require(
    "../models/models.formats_groups_types"
);
const ModelGroupsFormats = require("../models/models.groups_formats");
const ModelInsertions = require("../models/models.insertions");
const ModelInsertionsTemplates = require("../models/models.insertionstemplates");
const ModelCreatives = require("../models/models.creatives");



const {
    resolve
} = require('path');
const {
    cpuUsage
} = require('process');



exports.creativeUrl = async (req, res) => {

    try {

        //liste tout les creatives active des urls non https et qui n'ont pas les extentions valide
        const NOW = new Date();
        const url = 'https://cdn.antennepublicite.re'
        const extention = 'mp4|gif|jpeg|png|html'



        await sequelize.query(
            'SELECT creatives.creative_id, creatives.creative_name, creatives.insertion_id, creatives.creative_url, creatives.creative_mime_type, creatives.creatives_activated, creatives.creatives_archived,campaigns.campaign_id ,campaigns.campaign_name ,campaigns.campaign_archived , advertisers.advertiser_name, campaigns.advertiser_id FROM asb_creatives AS creatives INNER JOIN asb_insertions AS insertion ON creatives.insertion_id = insertion.insertion_id AND insertion.insertion_archived = 0 AND insertion.insertion_end_date >= ? INNER JOIN asb_campaigns AS campaigns ON campaigns.campaign_id = insertion.campaign_id INNER JOIN asb_advertisers AS advertisers ON advertisers.advertiser_id = campaigns.advertiser_id  WHERE (creatives.creative_url NOT REGEXP ? OR creatives.creative_mime_type NOT REGEXP ?) AND creatives.creatives_activated = 1 AND creatives.creatives_archived = 0 AND campaigns.campaign_archived = 0 AND advertisers.advertiser_id  NOT IN (409707,320778)', {
                replacements: [NOW, url, extention],
                type: QueryTypes.SELECT
            }
        ).then(async function (creatives) {


            //console.log(creatives)

            res.render("manage/alerts_creatives.ejs", {

                creatives: creatives,


            })
        });




    } catch (error) {
        console.error('Error : ', error);
    }
}

exports.insertionsOffligne = async (req, res) => {

    try {

        //liste tout les creatives active des urls non https et qui n'ont pas les extentions valide
        const NOW = new Date();
        

        await ModelInsertions.findAll({


            attributes: ['insertion_id', 'campaign_id', 'insertion_archived', 'insertion_start_date','insertion_status_id'],


            where: {

                insertion_archived: 0,
                insertion_status_id:0,
                insertion_start_date: {
                    [Op.gt]: NOW,
                },
            },







        }).then(async function (insertions) {

           // console.log(insertions.length)


            res.render("manage/alerts_insertions.ejs", {

                insertions: insertions,


            })
        });




    } catch (error) {
        console.error('Error : ', error);
    }
}