// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);
var crypto = require('crypto');
const needle = require("needle");
var nodeoutlook = require('nodejs-nodemailer-outlook');

const csv = require('csv-parser')
const {
    Op
} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});
const path = require('path');

const ExcelJS = require('exceljs');
const excel = require('node-excel-export');
var nodeoutlook = require('nodejs-nodemailer-outlook');
const {
    QueryTypes
} = require('sequelize');
const moment = require('moment');
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
const ModelFormatsGroupsTypes = require(
    "../models/models.formats_groups_types"
);
const ModelFormatsGroups = require("../models/models.formats_groups");
const ModelCampaigns = require("../models/models.campaigns");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelSites = require("../models/models.sites");
const ModelTemplates = require("../models/models.templates");
const ModelPlatforms = require("../models/models.platforms");
const ModelDeliverytypes = require("../models/models.deliverytypes");
const ModelInsertionsStatus = require("../models/models.insertions_status");

const ModelCountries = require("../models/models.countries");
const ModelInsertions = require("../models/models.insertions");
const ModelInsertionsPriorities = require(
    "../models/models.insertions_priorities"
);
const ModelInsertionsTemplates = require(
    "../models/models.insertions_templates"
);
const ModelCreatives = require("../models/models.creatives");

const ModelEpilotCampaigns = require("../models/models.epilot_campaigns");
const ModelEpilotInsertions = require("../models/models.epilot_insertions");

const ModelUsers = require("../models/models.users");
const ModelPacks_Smart = require("../models/models.packs_smart");

const {
    resolve
} = require('path');
const {
    cpuUsage
} = require('process');
const fs = require('fs');
// Initialise le module
var LocalStorage = require('node-localstorage').LocalStorage;
const { creatives } = require('./controllers.automate');
// localStorage = new LocalStorage('data/reporting/'+moment().format('YYYY/MM/DD'));
// localStorageTasks = new LocalStorage('data/taskID/'+moment().format('YYYY/MM/DD/H'));
// localStorageAutomate = new LocalStorage('data/automate/'+moment().format('YYYY/MM/DD'));
localStorage = new LocalStorage('data/reporting/');
localStorageTasks = new LocalStorage('data/taskID/');
localStorageAutomate = new LocalStorage('data/automate/');
localStorageTV = new LocalStorage('data/tv/reporting');
localStorageForecast = new LocalStorage('data/forecast/');

exports.index = async (req, res) => {
    try {

        // Creative url CDN: Vérification de l'https dans la créative / extentions
        const NOW = new Date();
        const url = 'https://cdn.antennepublicite.re';
        const extention = 'mp4|gif|jpeg|png|html';

        const creatives = await sequelize.query(
            'SELECT creatives.creative_id, creatives.creative_name, creatives.insertion_id,' +
            ' creatives.creative_url, creatives.creative_mime_type, creatives.creative_act' +
            'ivated, creatives.creative_archived,campaigns.campaign_id ,campaigns.campaign' +
            '_name ,campaigns.campaign_archived , advertisers.advertiser_name, campaigns.ad' +
            'vertiser_id FROM asb_creatives AS creatives INNER JOIN asb_insertions AS inser' +
            'tion ON creatives.insertion_id = insertion.insertion_id AND insertion.insertio' +
            'n_archived = 0 AND insertion.insertion_end_date >= ? INNER JOIN asb_campaigns ' +
            'AS campaigns ON campaigns.campaign_id = insertion.campaign_id INNER JOIN asb_a' +
            'dvertisers AS advertisers ON advertisers.advertiser_id = campaigns.advertiser_' +
            'id  WHERE (creatives.creative_url NOT REGEXP ? OR creatives.creative_mime_type' +
            ' NOT REGEXP ?) AND creatives.creative_activated = 1 AND creatives.creatives_a' +
            'rchived = 0 AND campaigns.campaign_archived = 0 AND advertisers.advertiser_id ' +
            ' NOT IN (409707,320778)', {
            replacements: [
                NOW, url, extention
            ],
            type: QueryTypes.SELECT
        }
        );

        //La campagne est programmée mais pas en ligne

        const insertions = await ModelInsertions.findAll({
            where: {
                insertion_archived: 0,
                insertion_status_id: 0,
                insertion_start_date: {
                    [Op.gt]: NOW
                }
            },
            include: [{
                model: ModelCampaigns,
                include: [{
                    model: ModelAdvertisers
                }]
            }]
        });

        // Template (erreur ou oubli) : Vérifier que le template corresponde au format
        // sur lequel il est diffusé

        const insertionsOnline = await sequelize.query(
            'SELECT asb_insertions.insertion_id, insertion_name, insertion_status_id,insert' +
            'ion_start_date,insertion_end_date,asb_insertions.format_id,asb_formats.format_' +
            'id,format_name,asb_insertions_templates.insertion_id,asb_insertions_templates.te' +
            'mplate_id,asb_templates.template_name,asb_templates.template_official,asb_temp' +
            'lates.template_archived,asb_templates.template_updated_at, asb_templates.templ' +
            'ate_description, asb_formats_templates.format_id,asb_formats_templates.templat' +
            'e_id , asb_insertions.campaign_id , asb_campaigns.campaign_name  FROM asb_insertions,asb_insertions_templates, asb_formats, asb_templates, asb_formats_tem' +
            'plates , asb_campaigns  WHERE insertion_archived = "0" AND insertion_status_' +
            'id = "1" AND insertion_end_date >= ?  AND asb_insertions.insertion_id = asb_in' +
            'sertionstemplates.insertion_id   AND asb_templates.template_id = asb_insertion' +
            'stemplates.template_id  AND asb_insertions.format_id = asb_formats.format_id A' +
            'ND asb_formats_templates.format_id = asb_insertions.format_id AND asb_formats_' +
            'templates.template_id=  asb_insertions_templates.template_id AND asb_insertions' +
            '.campaign_id=  asb_campaigns.campaign_id', {
            replacements: [NOW],
            type: QueryTypes.SELECT
        }
        );

        const number_insertionsOnline = insertionsOnline.length;

        const obj_TemplateFormat = new Array();

        for (i = 0; i < number_insertionsOnline; i++) {
            const obj = {};

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
                    format_id: insertionsOnline[i].format_id,
                    template_id: insertionsOnline[i].template_id
                }
            });

            //push si template incompatible avec les formats
            if (!insertiontemplate) {
                obj_TemplateFormat.push(obj);
            }
        }

        //Template "Advanced Banner" verif du champs maxWidth = 100%
        const AdvancedBanner = await ModelInsertionsTemplates.findAll({
            where: {
                template_id: 89074,
                parameter_value: {
                    [Op.notRegexp]: 'maxWidth=100%'
                }
            },

            include: [{
                model: ModelInsertions,
                where: {
                    insertion_archived: 0,
                    insertion_status_id: 1,
                    insertion_start_date: {
                        [Op.gt]: NOW
                    }
                }

            }]
        });

        console.log(AdvancedBanner)

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

exports.campaign = async (req, res) => {
    try {
        let campaign_id = req.query.campaign_id;
        if (campaign_id) {
            campaignObject = {
                "campaign_id": req.query.campaign_id
            };

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
                    if (!campaign) {
                        return res.json({
                            type: 'error',
                            message: 'Cette campagne n\'existe pas.'
                        });
                    }

                    // fonctionnalité de géneration du rapport
                    let campaigncrypt = campaign.campaign_crypt
                    let advertiserid = campaign.advertiser_id;
                    let campaignid = campaign.campaign_id;
                    var campaign_start_date = campaign.campaign_start_date;
                    var campaign_end_date = campaign.campaign_end_date;
                });

        } else {
            return res.json({
                type: 'error',
                message: 'Veuillez saisir l\'identifiant de la campagne.'
            });
        }

    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }
}

exports.campaigns = async (req, res) => {
    try {
        const dateNowLong = Date.now();
        var dateNow = moment().format('YYYY-M-D 00:00:00'); // "2021-12-22";
        var dateEnd = '2040-12-31 23:59:00';

        // Affiche les annonceurs
        const advertiserExclus = new Array(
            418935,
            427952,
            409707,
            425912,
            425914,
            438979,
            439470,
            439506,
            439511,
            439512,
            439513,
            439514,
            439515,
            440117,
            440118,
            440121,
            440122,
            440124,
            440126,
            445117,
            455371,
            455384,
            320778,
            417243,
            414097,
            411820,
            320778,
            464149,
            417716,
            464862
        );

        // Affiche les campagnes en ligne
        campaigns = await ModelCampaigns.findAll({
            where: {
                [Op.and]: [{
                    advertiser_id: {
                        [Op.notIn]: advertiserExclus
                    }
                }],
                [Op.or]: [{
                    campaign_start_date: {
                        [Op.between]: [dateNow, dateEnd]
                    }
                }, {
                    campaign_end_date: {
                        [Op.between]: [dateNow, dateEnd]
                    }
                }]
            },
            include: [{
                model: ModelInsertions,
                group: ['campaign_id']
            },
            {
                model: ModelAdvertisers
            }
            ]
        });

        var campaign_ids = new Array();
        for (i = 0; i < campaigns.length; i++) {
            if (campaigns[i].insertions.length == 0) {
                console.log(campaigns[i].campaign_name + ' - ' + campaigns[i].campaign_id + ' - ' + campaigns[i].insertions.length);
                // console.log(campaigns[i].advertiser.advertiser_name + ' - ' + campaigns[i].advertiser.advertiser_id);
                campaign_ids.push(campaigns[i]);

                alert_message = 'Il manque les insertions pour cette campagne';
                alert_table_name = 'campaign_id';
                alert_table_id = campaigns[i].campaign_id;
                alert_type = '0';
                alert_status = '2';
                alert_code = 'insertions';
                // created_at =  moment().format('Y-M-d h:i:s');
                updated_at = moment().format('Y-M-d h:i:s');

                Utilities
                    .updateOrCreate(ModelAlerts, {
                        alert_table_name: alert_table_name,
                        alert_table_id: alert_table_id
                    }, {
                        alert_table_name: alert_table_name,
                        alert_table_id: alert_table_id,
                        alert_message: alert_message,
                        alert_type: alert_type,
                        alert_code: alert_code,
                        alert_status: alert_status,
                        updated_at: updated_at
                    })
                    .then(function (result) {
                        //  console.log()

                        //result.item; // the model
                        // result.created; // bool, if a new item was created.
                    });

            }
        }

        return res.json({
            type: 'success',
            message: campaign_ids
        });

    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }

}

exports.alert_delivered_percentage = async (req, res) => {

    const data = new Object();

    // Créer le fil d'ariane
    const breadcrumbLink = 'forecast';
    breadcrumb = new Array({
        'name': 'Alerting',
        'link': 'forecast'
    }, {
        'name': 'Liste des alertes forecast',
        'link': ''
    });
    data.breadcrumb = breadcrumb;

    const cacheStorageNow = "forecast-global-" + moment().format('YYYYMMDD') + '.json';
    var data_localStorageForecast = localStorageForecast.getItem(cacheStorageNow);

    const now = new Date();
    const date_end = new Date(moment(now).add('5', 'd').format('YYYY-MM-DD'));
    const timestamp_lastDay = date_end.getTime()


    if (data_localStorageForecast) {

        const ObjDeliveredPercentage = new Array()
        const ObjDeliveredPercentageSurreservation = new Array()
        const ObjDeliveredPercentageLastDay = new Array()

        var forecastData = JSON.parse(data_localStorageForecast)

        var countdata = Object.keys(forecastData).length - 1
        for (var index = 1; index <= countdata; index++) {
            var campaign_id = forecastData[index].CampaignID;
            var campaign_name = forecastData[index].CampaignName;
            var insertion_id = forecastData[index].InsertionId;
            var insertion_name = forecastData[index].InsertionName;
            var delivered_percentage = parseInt(forecastData[index].InsertionForecastedDeliveredPercentage);

            if (forecastData[index].CampaignID != "N/A") {


                const advertiserExclus = [
                    471802,
                    412328,
                    418935,
                    427952,
                    409707,
                    425912,
                    425914,
                    438979,
                    439470,
                    439506,
                    439511,
                    439512,
                    439513,
                    439514,
                    439515,
                    440117,
                    440118,
                    440121,
                    440122,
                    440124,
                    440126,
                    445117,
                    455371,
                    455384,
                    320778,
                    417243,
                    414097,
                    411820,
                    320778,
                    320778,
                    421871,
                    459132,
                    464862
                ];

                await ModelCampaigns.findOne({
                    where: {

                        [Op.and]: [{
                            campaign_id: campaign_id,
                            advertiser_id: {
                                [Op.notIn]: advertiserExclus
                            }
                        }]
                    },
                    include: [{
                        model: ModelAdvertisers
                    }]
                }).then(async function (campaign) {

                    if (campaign) {

                        var campaign_start_date = campaign.campaign_start_date
                        var campaign_end_date = campaign.campaign_end_date
                        var campaign_crypt = campaign.campaign_crypt
                        const CampaignEndDate = new Date(moment(campaign_end_date).format('YYYY-MM-DD'));
                        const timestamp_endDate = CampaignEndDate.getTime()


                        //liste les campagne qui se termine les 5prochain j
                        if (timestamp_endDate <= timestamp_lastDay) {

                            if (delivered_percentage <= 95) {

                                var objForecastLastDay = {
                                    campaign_id: campaign_id,
                                    campaign_crypt: campaign_crypt,
                                    campaign_name: campaign_name,
                                    campaign_start_date: campaign_start_date,
                                    campaign_end_date: campaign_end_date,
                                    insertion_id: insertion_id,
                                    insertion_name: insertion_name,
                                    delivered_percentage: delivered_percentage
                                }

                                ObjDeliveredPercentageLastDay.push(objForecastLastDay)


                            }

                        }

                        //La campagne est de - 95% du forecast
                        if (delivered_percentage < 95) {


                            var objForecast = {
                                campaign_id: campaign_id,
                                campaign_crypt: campaign_crypt,
                                campaign_name: campaign_name,
                                campaign_start_date: campaign_start_date,
                                campaign_end_date: campaign_end_date,
                                insertion_id: insertion_id,
                                insertion_name: insertion_name,
                                delivered_percentage: delivered_percentage
                            }

                            //ObjDeliveredPercentage[index] = objForecast
                            ObjDeliveredPercentage.push(objForecast)


                        }

                        //La campagne est en surréservation > 100%
                        if (delivered_percentage > 100) {


                            var objForecastSurreservation = {
                                campaign_id: campaign_id,
                                campaign_crypt: campaign_crypt,
                                campaign_name: campaign_name,
                                campaign_start_date: campaign_start_date,
                                campaign_end_date: campaign_end_date,
                                insertion_id: insertion_id,
                                insertion_name: insertion_name,
                                delivered_percentage: delivered_percentage
                            }

                            //ObjDeliveredPercentageSurreservation[index] = objForecast
                            ObjDeliveredPercentageSurreservation.push(objForecastSurreservation)


                        }




                    }

                })



            }

        }





        const campaignNameGroup = Utilities.groupBy(ObjDeliveredPercentage, 'campaign_id');
        const campaignNameGroupSurreservation = Utilities.groupBy(ObjDeliveredPercentageSurreservation, 'campaign_id');
        const campaignNameGroupLastDay = Utilities.groupBy(ObjDeliveredPercentageLastDay, 'campaign_id')


        data.moment = moment;
        data.utilities = Utilities
        data.campaignNameGroup = campaignNameGroup
        data.campaignNameGroupSurreservation = campaignNameGroupSurreservation
        data.campaignNameGroupLastDay = campaignNameGroupLastDay



        res.render('alerts/forecast/list.ejs', data)


    }
}

exports.alert_manage_creative = async (req, res) => {
    const data = new Object();

    // Créer le fil d'ariane
    const breadcrumbLink = 'forecast';
    breadcrumb = new Array({
        'name': 'Alerting',
        'link': 'forecast'
    }, {
        'name': 'Liste des alertes forecast',
        'link': ''
    });
    data.breadcrumb = breadcrumb;

    const date_now = moment().format('YYYY-MM-DD');


    //date du jour -2mois
    var now = new Date();
    var MonthPast = new Date(now.getFullYear(), (now.getMonth()-2), now.getDate());
    const dateMonthPast = moment(MonthPast).format('YYYY-MM-DD 00:00:00'); 

   





    ModelInsertions.findAll({
      where: {
            [Op.and]: [{
                insertion_start_date: {
                    [Op.between]: [dateMonthPast, date_now]
                }
            }]
        },
        include: [{
            model: ModelCampaigns,
        }]
    }).then(async function (insertions) {

        const regex_url = /https:\/\/(((cdn.antennepublicite.re\/linfo\/IMG\/pub\/(display|video|rodzafer))|(dash.rodzafer.re\/uploads\/)))([/|.|\w|\s|-])*\.(?:jpg|gif|mp4|jpeg|png|html)/igm
        const regex_urlClic = /^(?:https:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/igm


        for (let i = 0; i < Object.keys(insertions).length; i++) {


            await ModelCreatives.findAll({
                where: {

                    insertion_id: insertions[i].insertion_id,


                }
            }).then(async function (creative) {



                if (!Utilities.empty(creative)) {



                    for (let c = 0; c < Object.keys(creative).length; c++) {

                        const creative_name = creative[c].creative_name
                        const creative_url = creative[c].creative_url
                        const creative_click_url = creative[c].creative_click_url

                        

                        if (!creative_url.match(regex_url)) {


                            return res.json({message:"alerte"})

                        }else{
                           
                           return  res.json({message:"Aucune alerte: les urls des créatives sont valides"})
                           
                        }

                    }

                }





            })

        }



    })


}