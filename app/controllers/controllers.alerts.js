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
const ModelFormats = require("../models/__models.formats");
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
const ModelFormatsTemplates = require("../models/models.formats_templates")
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



exports.alerts = async (req, res) => {

    try {

        //Creative url CDN: Vérification de l'https dans la créative / extentions
        const NOW = new Date();
        const url = 'https://cdn.antennepublicite.re';
        const extention = 'mp4|gif|jpeg|png|html';


        const creatives = await sequelize.query(
            'SELECT creatives.creative_id, creatives.creative_name, creatives.insertion_id, creatives.creative_url, creatives.creative_mime_type, creatives.creatives_activated, creatives.creatives_archived,campaigns.campaign_id ,campaigns.campaign_name ,campaigns.campaign_archived , advertisers.advertiser_name, campaigns.advertiser_id FROM asb_creatives AS creatives INNER JOIN asb_insertions AS insertion ON creatives.insertion_id = insertion.insertion_id AND insertion.insertion_archived = 0 AND insertion.insertion_end_date >= ? INNER JOIN asb_campaigns AS campaigns ON campaigns.campaign_id = insertion.campaign_id INNER JOIN asb_advertisers AS advertisers ON advertisers.advertiser_id = campaigns.advertiser_id  WHERE (creatives.creative_url NOT REGEXP ? OR creatives.creative_mime_type NOT REGEXP ?) AND creatives.creatives_activated = 1 AND creatives.creatives_archived = 0 AND campaigns.campaign_archived = 0 AND advertisers.advertiser_id  NOT IN (409707,320778)', {
                replacements: [NOW, url, extention],
                type: QueryTypes.SELECT
            });


        //La campagne est programmée mais pas en ligne

        const insertions = await ModelInsertions.findAll({


            where: {

                insertion_archived: 0,
                insertion_status_id: 0,
                insertion_start_date: {
                    [Op.gt]: NOW,
                },
            },

            include: [{
                model: ModelCampaigns,

                include: [{
                    model: ModelAdvertisers,

                }]
            }],





        });



        //Template (erreur ou oubli) : Vérifier que le template corresponde au format sur lequel il est diffusé
        
        const insertionsOnline = await sequelize.query(
            'SELECT asb_insertions.insertion_id, insertion_name, insertion_status_id,insertion_start_date,insertion_end_date,asb_insertions.format_id,asb_formats.format_id,format_name,asb_insertionstemplates.insertion_id,asb_insertionstemplates.template_id,asb_templates.template_name,asb_templates.template_official,asb_templates.template_archived,asb_templates.template_updated_at, asb_templates.template_description, asb_formats_templates.format_id,asb_formats_templates.template_id , asb_insertions.campaign_id , asb_campaigns.campaign_name   FROM `asb_insertions`,asb_insertionstemplates, asb_formats, asb_templates, asb_formats_templates , asb_campaigns  WHERE `insertion_archived` = "0" AND insertion_status_id = "1" AND insertion_end_date >= ?  AND asb_insertions.insertion_id = asb_insertionstemplates.insertion_id   AND asb_templates.template_id = asb_insertionstemplates.template_id  AND asb_insertions.format_id = asb_formats.format_id AND asb_formats_templates.format_id = asb_insertions.format_id AND asb_formats_templates.template_id=  asb_insertionstemplates.template_id AND asb_insertions.campaign_id=  asb_campaigns.campaign_id', {
                replacements: [NOW],
                type: QueryTypes.SELECT
            });

        const number_insertionsOnline = insertionsOnline.length;

        const obj_TemplateFormat = new Array();

        for (i = 0; i < number_insertionsOnline; i++) {

            const obj = {};

            obj["campagne_id"] = insertionsOnline[i].campaign_id;
            obj["campagne_id"] = insertionsOnline[i].campaign_id;
            obj["campagne_name"] = insertionsOnline[i].campaign_name;
            obj["insertion_id"] = insertionsOnline[i].insertion_id;
            obj["insertion_name"] = insertionsOnline[i].insertion_name;
            obj["format_id"] = insertionsOnline[i].format_id;
            obj["format_name"] = insertionsOnline[i].format_name;
            obj["template_id"] = insertionsOnline[i].template_id;
            obj["template_name"] = insertionsOnline[i].template_name;



            const insertiontemplate = await ModelFormatsTemplates.findOne({

                where: {

                    format_id:insertionsOnline[i].format_id,
                    template_id:  insertionsOnline[i].template_id
                }
            });

            //push si template incompatible avec les formats
            if (!insertiontemplate) {

                obj_TemplateFormat.push(obj)

            } 

        }


        res.render("manage/alerts.ejs", {

            creatives: creatives,
            insertions: insertions,
            formatstemplates: obj_TemplateFormat


        })


/*
        obj["campagne_id"] = 1850219
        obj["campagne_name"] = "ART TROPHEE ENTREPRISE 2021"
        obj["insertion_id"] = 9978558
        obj["insertion_name"] = "GRAND ANGLE - APPLI LINFO - POSITION 0"
        obj["format_id"] = 79425
        obj["format_name"] = "WEB_MPAVE_ATF0"
        obj["template_id"] = 63078
        obj["template_name"] = "MRAID Video Banner"

       obj["campagne_id"] = 1850217
        obj["campagne_name"] = "ZEOP PARR ZOT GAME - 65505"
        obj["insertion_id"] = 9978558
        obj["insertion_name"] = "RECTANGLE VIDEO"
        obj["format_id"] = 79425
        obj["format_name"] = "WEB_MPAVE_ATF0"
        obj["template_id"] = 89076
        obj["template_name"] = "Default Banner"

*/









    } catch (error) {
        console.error('Error : ', error);
    }
}