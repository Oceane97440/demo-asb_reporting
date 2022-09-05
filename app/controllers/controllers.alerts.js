// Initialise le module
const axios = require(`axios`);
var nodeoutlook = require('nodejs-nodemailer-outlook');
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
const moment = require('moment');
const {
    check,
    query
} = require('express-validator');

// Charge l'ensemble des functions de l'API
const SmartFunction = require("../functions/functions.smartadserver.api");
const Utilities = require("../functions/functions.utilities");

// Initialise les models const ModelSite = require("../models/models.sites");
const ModelFormat = require("../models/models.formats");
const ModelCampaigns = require("../models/models.campaigns");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelInsertions = require("../models/models.insertions");
const ModelCreatives = require("../models/models.creatives");
const ModelInsertionsTemplates = require(
    "../models/models.insertions_templates"
);


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
localStorage = new LocalStorage('data/reporting/');
localStorageTasks = new LocalStorage('data/taskID/');
localStorageAutomate = new LocalStorage('data/automate/');
localStorageTV = new LocalStorage('data/tv/reporting');
localStorageForecast = new LocalStorage('data/forecast/');


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

/**
 * Alerte forecast il y a des problèmes de livraison.
 * @constructor
 */
exports.alert_delivered_percentage = async (req, res) => {


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

                            //Se finit dans 5j ou - mais le forecast a - 95% ou inf. à 95%
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

                            ObjDeliveredPercentageSurreservation.push(objForecastSurreservation)


                        }




                    }

                })



            }

        }




        //regroupe chaque obj par campagne id
        const campaignNameGroup = Utilities.groupBy(ObjDeliveredPercentage, 'campaign_id');
        const campaignNameGroupSurreservation = Utilities.groupBy(ObjDeliveredPercentageSurreservation, 'campaign_id');
        const campaignNameGroupLastDay = Utilities.groupBy(ObjDeliveredPercentageLastDay, 'campaign_id')


        var listCampaignString = new Array()


        //création du mail
        if (!Utilities.empty(campaignNameGroup)) {



            Object.keys(campaignNameGroup).forEach(key => {

                var message = '<li>' + moment(campaignNameGroup[key][0].campaign_start_date).format('DD-MM') + ' - ' + moment(campaignNameGroup[key][0].campaign_end_date).format('DD-MM') + ' :  <a href="https://manage.smartadserver.com/gestion/smartprog2.asp?CampagneID=' + campaignNameGroup[key][0].campaign_id + '"target="_blank"><strong>' + campaignNameGroup[key][0].campaign_name + '</strong> </a>(Total des insertions: <span>' + Object.keys(campaignNameGroup[key]).length + ') </span></li>'

                listCampaignString.push(message)
            })



        }

        var listCampaignSurreservationString = new Array()

        if (!Utilities.empty(campaignNameGroupSurreservation)) {


            Object.keys(campaignNameGroupSurreservation).forEach(key => {

                var message_surreservation = '<li>' + moment(campaignNameGroupSurreservation[key][0].campaign_start_date).format('DD-MM') + ' - ' + moment(campaignNameGroupSurreservation[key][0].campaign_end_date).format('DD-MM') + ' :  <a href="https://manage.smartadserver.com/gestion/smartprog2.asp?CampagneID=' + campaignNameGroupSurreservation[key][0].campaign_id + '"target="_blank"><strong>' + campaignNameGroupSurreservation[key][0].campaign_name + '</strong> </a>(Total des insertions: <span>' + Object.keys(campaignNameGroupSurreservation[key]).length + ') </span></li>'

                listCampaignSurreservationString.push(message_surreservation)
            })

        }



        if ((!Utilities.empty(campaignNameGroup)) || (!Utilities.empty(campaignNameGroupSurreservation)) || (!Utilities.empty(campaignNameGroupLastDay))) {

            nodeoutlook.sendEmail({

                auth: {
                    user: "oceane.sautron@antennereunion.fr",
                    pass: process.env.EMAIL_PASS
                },
                from: "oceane.sautron@antennereunion.fr",
                to: "alvine.didier@antennereunion.fr",
                cc: "oceane.sautron@antennereunion.fr",
                subject: 'Alerte Forecast: Problème de livraison',
                html: ' <head><style>font-family: Century Gothic;    font-size: large; </style></head>Bonjour <br><br>  Tu trouveras ci-dessous le lien pour voir la liste des alertes du forecast <b> </b> :<ul>' + listCampaignString.join('') + '</ul> <ul>' + listCampaignSurreservationString.join('') + '</ul> <br><br> À dispo pour échanger <br><br> <div style="font-size: 11pt;font-family: Calibri,sans-serif;"><img src="https://reporting.antennesb.fr/public/admin/photos/logo.png" width="79px" height="48px"><br><br><p><strong>L\'équipe Adtraffic</strong><br><small>Antenne Solutions Business<br><br> 2 rue Emile Hugot - Technopole de La Réunion<br> 97490 Sainte-Clotilde<br> Fixe : 0262 48 47 54<br> Fax : 0262 48 28 01 <br> Mobile : 0692 05 15 90<br> <a href="mailto:adtraffic@antennereunion.fr">adtraffic@antennereunion.fr</a></small></p></div>'

                ,

                onError: (e) => res.json({ message: "Une erreur est survenue lors de l'envoie du mail" }),
                onSuccess: (i) => res.json({ message: "Email alete forecats" })


            })


        } else {
            res.json({ message: "Pas alerte forecast " + moment().format('YYYY-MM-DD') })
        }



    }
}
/**
 * Alerte créatives il y a des problèmes dans la programmation des insertions.
 * @constructor
 */
exports.alert_manage_creative = async (req, res) => {



    const regex_url = /https:\/\/(((cdn.antennepublicite.re\/linfo\/IMG\/pub\/(display|video|rodzafer))|(dash.rodzafer.re\/uploads\/)))([/|.|\w|\s|-])*\.(?:jpg|gif|mp4|jpeg|png|html)/igm
    const regex_urlClic = /^(?:https:\/\/)?[\w.-]+(?:\.[\w\.-]+)+[\w\-\._~:/?#[\]@!\$&'\(\)\*\+,;=.]+$/igm
    const regexFormats = /((GRAND ANGLE|MASTHEAD) - (ANTENNEREUNION|DOMTOMJOB|LINFO \/ ORANGE REUNION) - POSITION (?:0)$)|(MASTHEAD - LINFO - POSITION (?:0|5|8|9|10)$)|(GRAND ANGLE - LINFO - POSITION (?:0|5)$)|(APPLI LINFO)|((INTERSTITIEL|HABILLAGE|RECTANGLE|PREROLL|MIDROLL|PREROLL \/ MIDROLL){1})/igm



    const date_now = moment().format('YYYY-MM-DD');
    //date du jour -2mois
    var now = new Date();
    var MonthPast = new Date(now.getFullYear(), (now.getMonth() - 1), now.getDate());
    var MonthLast = new Date(now.getFullYear(), (now.getMonth() + 2), now.getDate());
    var MonthLastEnd = new Date(now.getFullYear(), (now.getMonth() + 5), now.getDate());

    const dateMonthPast = moment(MonthPast).format('YYYY-MM-DD');
    const dateMonthLast = moment(MonthLast).format('YYYY-MM-DD');
    const dateMonthLastEnd = moment(MonthLastEnd).format('YYYY-MM-DD');


    console.log(date_now + ' - ' + dateMonthPast + ' - ' + dateMonthLast)
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

    await ModelInsertions.findAll({
        where: {
            [Op.and]: [{
                insertion_start_date: {
                    [Op.between]: [dateMonthPast,date_now]

                },
                insertion_end_date: {
                    [Op.between]: [date_now, dateMonthLast]

                },

            }]
        },
        include: [{
            model: ModelCampaigns,
            where:{
                advertiser_id: {
                    [Op.notIn]: advertiserExclus
                }
            }


        }]
    }).then(async function (insertions) {
        const ObjCreativeUrl = new Array()
        const ObjCreativeurlClic = new Array()
        const ObjCreativeAll = new Array()

        const listCreativeCompte = new Array()
        const listCreativeCompteOther = new Array()
        const listCreativeVideo = new Array()
        const listCreativeMobile = new Array()
        const listCreativeMobileHabillage = new Array()


        nbr_insertion = insertions.length


        for (let i = 0; i < nbr_insertion; i++) {

            await ModelCreatives.findOne({

                where: {
                    insertion_id: insertions[i].insertion_id,
                }
              

            }).then(async (element) => {


                if (!Utilities.empty(element)) {
                    const insertion_id = element.insertion_id
                    const creative_id = element.creative_id
                    const creative_url = element.creative_url
                    const creative_name = element.creative_name
                    const creative_width = element.creative_width
                    const creative_height = element.creative_height
                    const creative_clickUrl = element.creative_click_url


                    const insertion = await ModelInsertions.findOne({
                        where: { insertion_id: insertion_id },
                        include: [{
                            model: ModelCampaigns,
                        }]
                    })


                    const formats = await ModelFormat.findOne({
                        attributes: ['format_group', 'format_id'],

                        where: {
                            format_id: insertion.format_id,
                        },

                    })


                    const insertion_name = insertion.insertion_name
                    const campaign_id = insertion.campaign.campaign_id
                    const campaign_name = insertion.campaign.campaign_name
                    const campaign_start_date = moment(insertion.campaign.campaign_start_date).format('DD-MM')
                    const campaign_end_date = moment(insertion.campaign.campaign_end_date).format('DD-MM')
                    const format_group = formats.format_group

                    switch (insertion.delivery_type_id) {
                        case 0:
                            var delivery_type_id = "WEB"
                            break;
                        case 10:
                            var delivery_type_id = "MOBILE/TABLETTE"
                            break;
                        case 21:
                            var delivery_type_id = "VIDEO"
                            break;

                        case 22:
                            var delivery_type_id = "VIDEO"
                            break;
                        default:
                            break;
                    }



                    const regexMatch = await insertion_name.match(regexFormats)

                    if (!Utilities.empty(creative_id)) {
                        if (regexMatch) {
                            var objAllCreative = {
                                campaign_id: campaign_id,
                                campaign_name: campaign_name,
                                campaign_start_date: campaign_start_date,
                                campaign_end_date: campaign_end_date,
                                insertion_id: insertion_id,
                                insertion_name: insertion_name,
                                format_group: format_group,
                                delivery_type_id: delivery_type_id,
                                creative_id: creative_id,
                                creative_width: creative_width,
                                creative_height: creative_height,
                                creative_name: creative_name,
                                creative_url: creative_url,
                                creative_click_url: creative_clickUrl
                            }

                            ObjCreativeAll.push(objAllCreative)


                        }

                        if (!Utilities.empty(creative_url)) {
                            const regexMatchCrea_Url = await creative_url.match(regex_url)

                            if (regexMatchCrea_Url) {

                                var objCreative = {
                                    campaign_id: campaign_id,
                                    campaign_name: campaign_name,
                                    campaign_start_date: campaign_start_date,
                                    campaign_end_date: campaign_end_date,
                                    insertion_id: insertion_id,
                                    insertion_name: insertion_name,
                                    creative_id: creative_id,
                                    creative_name: creative_name,
                                    creative_url: creative_url,
                                    creative_click_url: creative_clickUrl
                                }


                                ObjCreativeUrl.push(objCreative)

                            }
                        }
                        if (!Utilities.empty(creative_clickUrl)) {

                            const regexMatchCrea_clicUrl = await creative_clickUrl.match(regex_urlClic)

                            if (regexMatchCrea_clicUrl) {

                                var objCreativeUrlClic = {
                                    campaign_id: campaign_id,
                                    campaign_name: campaign_name,
                                    campaign_start_date: campaign_start_date,
                                    campaign_end_date: campaign_end_date,
                                    insertion_id: insertion_id,
                                    insertion_name: insertion_name,
                                    creative_id: creative_id,
                                    creative_name: creative_name,
                                    creative_url: creative_url,
                                    creative_click_url: creative_clickUrl
                                }

                                ObjCreativeurlClic.push(objCreativeUrlClic)

                            }
                        }


                    }

                }

            })

        }



        const creativeUrl = await Utilities.groupBy(ObjCreativeUrl, 'campaign_id');
        const creativeUrlClic = await Utilities.groupBy(ObjCreativeurlClic, 'campaign_id');
        const creativeAll = await Utilities.groupBy(ObjCreativeAll, 'insertion_id');

        if (!Utilities.empty(creativeAll)) {




            Object.keys(creativeAll).forEach(key => {


                switch (creativeAll[key][0].delivery_type_id) {
                    case "WEB":
                        if ((((creativeAll[key][0].format_group === "MASTHEAD") || (creativeAll[key][0].format_group === "GRAND ANGLE") || (creativeAll[key][0].format_group === "INTERSTITIEL")) && (Object.keys(creativeAll[key]).length < 2))) {

                            var message_format = '<li>' + creativeAll[key][0].campaign_start_date + ' - ' + creativeAll[key][0].campaign_end_date + ' : ' + creativeAll[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeAll[key][0].insertion_id + '"target="_blank"><strong>' + creativeAll[key][0].insertion_name + '</strong> </a>(Total des créatives: <span>' + Object.keys(creativeAll[key]).length + ') </span></li>'
                            listCreativeCompte.push(message_format)



                        }

                        if (((creativeAll[key][0].format_group === "HABILLAGE") && (Object.keys(creativeAll[key]).length < 1))) {
                            var message_other = '<li>' + creativeAll[key][0].campaign_start_date + ' - ' + creativeAll[key][0].campaign_end_date + ' : ' + creativeAll[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeAll[key][0].insertion_id + '"target="_blank"><strong>' + creativeAll[key][0].insertion_name + '</strong> </a>(Total des créatives: <span>' + Object.keys(creativeAll[key]).length + ') </span></li>'
                            listCreativeCompteOther.push(message_other)


                        }
                        break;

                    case "MOBILE/TABLETTE":
                        if ((((creativeAll[key][0].format_group === "MASTHEAD") || (creativeAll[key][0].format_group === "GRAND ANGLE") || (creativeAll[key][0].format_group === "INTERSTITIEL")) && (Object.keys(creativeAll[key]).length < 1))) {

                            var message_mobile = '<li>' + creativeAll[key][0].campaign_start_date + ' - ' + creativeAll[key][0].campaign_end_date + ' : ' + creativeAll[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeAll[key][0].insertion_id + '"target="_blank"><strong>' + creativeAll[key][0].insertion_name + '</strong> </a>(Total des créatives: <span>' + Object.keys(creativeAll[key]).length + ') </span></li>'
                            listCreativeMobile.push(message_mobile)



                        }

                        if (((creativeAll[key][0].format_group === "HABILLAGE") && (Object.keys(creativeAll[key]).length < 2))) {

                            var message_mobileHabillage = '<li>' + creativeAll[key][0].campaign_start_date + ' - ' + creativeAll[key][0].campaign_end_date + ' : ' + creativeAll[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeAll[key][0].insertion_id + '"target="_blank"><strong>' + creativeAll[key][0].insertion_name + '</strong> </a>(Total des créatives: <span>' + Object.keys(creativeAll[key]).length + ') </span></li>'
                            listCreativeMobileHabillage.push(message_mobileHabillage)



                        }
                        break;

                    case "VIDEO":
                        if ((((creativeAll[key][0].format_group === "RECTANGLE VIDEO") || (creativeAll[key][0].format_group === "INTERSTITIEL")) && (Object.keys(creativeAll[key]).length < 1))) {

                            var message_video = '<li>' + creativeAll[key][0].campaign_start_date + ' - ' + creativeAll[key][0].campaign_end_date + ' : ' + creativeAll[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeAll[key][0].insertion_id + '"target="_blank"><strong>' + creativeAll[key][0].insertion_name + '</strong> </a>(Total des créatives: <span>' + Object.keys(creativeAll[key]).length + ') </span></li>'
                            listCreativeVideo.push(message_video)



                        }
                        break;

                    default:
                        break;
                }








            })


        }



        const listCreative = new Array()
        const listCreativeUrlClic = new Array()


        if (!Utilities.empty(creativeUrl)) {
            Object.keys(creativeUrl).forEach(key => {

                var message = '<li>' + creativeUrl[key][0].campaign_start_date + ' - ' + creativeUrl[key][0].campaign_end_date + ' : ' + creativeUrl[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeUrl[key][0].insertion_id + '"target="_blank"><strong>' + creativeUrl[key][0].insertion_name + '</strong> </a>(Total des insertions: <span>' + Object.keys(creativeUrl[key]).length + ') </span></li>'

                listCreative.push(message)
            })
        }

        if (!Utilities.empty(creativeUrlClic)) {
            Object.keys(creativeUrlClic).forEach(key => {

                var message2 = '<li>' + creativeUrlClic[key][0].campaign_start_date + ' - ' + creativeUrlClic[key][0].campaign_end_date + ' : ' + creativeUrlClic[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeUrlClic[key][0].insertion_id + '"target="_blank"><strong>' + creativeUrlClic[key][0].insertion_name + '</strong> </a>(Total des insertions: <span>' + Object.keys(creativeUrlClic[key]).length + ') </span></li>'

                listCreativeUrlClic.push(message2)
            })
        }




        if ((!Utilities.empty(listCreative)) ||
            (!Utilities.empty(listCreativeUrlClic)) ||
            (!Utilities.empty(listCreativeCompte)) ||
            (!Utilities.empty(listCreativeCompteOther)) ||
            (!Utilities.empty(listCreativeVideo)) ||
            (!Utilities.empty(listCreativeMobile)) ||
            (!Utilities.empty(listCreativeMobileHabillage))) {


                nodeoutlook.sendEmail({

                    auth: {
                        user: "oceane.sautron@antennereunion.fr",
                        pass: process.env.EMAIL_PASS
    
    
                    },
                    from: "oceane.sautron@antennereunion.fr",
                    to: "alvine.didier@antennereunion.fr",
                    cc: "oceane.sautron@antennereunion.fr",
                    subject: 'Alerte Manage: Problème de programmation des créatives',
    
                    html: ' <head><style>font-family: Century Gothic;font-size: large; </style></head>Bonjour <br><br>  Tu trouveras ci-dessous le lien pour voir la liste des alertes du manage, problème de paramétrage: des créative sont manquantes dans les insertions et/ou les url sont invalides <b> </b> : <ul>' + listCreative.join('') + listCreativeUrlClic.join('') + listCreativeCompte.join('') + listCreativeCompteOther.join('') + listCreativeMobile.join('') + listCreativeVideo.join('') + listCreativeMobile.join('') + listCreativeMobileHabillage.join('') + '</ul><br><br> À dispo pour échanger <br><br> <div style="font-size: 11pt;font-family: Calibri,sans-serif;"><img src="https://reporting.antennesb.fr/public/admin/photos/logo.png" width="79px" height="48px"><br><br><p><strong>L\'équipe Adtraffic</strong><br><small>Antenne Solutions Business<br><br> 2 rue Emile Hugot - Technopole de La Réunion<br> 97490 Sainte-Clotilde<br> Fixe : 0262 48 47 54<br> Fax : 0262 48 28 01 <br> Mobile : 0692 05 15 90<br> <a href="mailto:adtraffic@antennereunion.fr">adtraffic@antennereunion.fr</a></small></p></div>'
    
                    ,
                    onError: (e) => res.json({ message: "Une erreur est survenue lors de l'envoie du mail" }),
                    onSuccess: (i) => res.json({ message: "Email alerte manage campagne" })
    
    
                })
        } else {
            res.json({ message: "Aucune alerte créative" })
        }

        /*
        
                for (let i = 0; i < nbr_insertion; i++) {
                    var insertionObject = {
                        "insertion_id": insertions[i].insertion_id,
        
                    };
        
        
        
        
                    var config2 = SmartFunction.config('creatives', insertionObject);
        
                    await axios(config2).then(async function (response) {
        
                        if (!Utilities.empty(response)) {
                            var dataValue = response.data;
        
        
        
                            if (!Utilities.empty(dataValue)) {
                                dataValue.forEach(async function (element) {
                                    const insertion_id = element.insertionId
                                    const creative_id = element.id
                                    const creative_url = element.url
                                    const creative_name = element.name
                                    const creative_width = element.width
                                    const creative_height = element.height
                                    const creative_clickUrl = element.clickUrl
        
                                    var insertion = await ModelInsertions.findOne({
                                        where: { insertion_id: insertion_id },
                                        include: [{
                                            model: ModelCampaigns,
                                        }]
                                    })
        
        
                                    const formats = await ModelFormat.findOne({
                                        attributes: ['format_group', 'format_id'],
                                        // group: "format_group",
                                        where: {
                                            format_id: insertion.format_id,
                                        },
        
                                    })
        
        
                                    const insertion_name = insertion.insertion_name
                                    const campaign_id = insertion.campaign.campaign_id
                                    const campaign_name = insertion.campaign.campaign_name
                                    const campaign_start_date = moment(insertion.campaign.campaign_start_date).format('DD-MM')
                                    const campaign_end_date = moment(insertion.campaign.campaign_end_date).format('DD-MM')
                                    const format_group = formats.format_group
        
                                    switch (insertion.delivery_type_id) {
                                        case 0:
                                            var delivery_type_id = "WEB"
                                            break;
                                        case 10:
                                            var delivery_type_id = "MOBILE/TABLETTE"
                                            break;
                                        case 21:
                                            var delivery_type_id = "VIDEO"
                                            break;
        
                                        case 22:
                                            var delivery_type_id = "VIDEO"
                                            break;
                                        default:
                                            break;
                                    }
        
        
        
                                    const regexMatch = await insertion_name.match(regexFormats)
        
                                    if (regexMatch) {
                                        var objAllCreative = {
                                            campaign_id: campaign_id,
                                            campaign_name: campaign_name,
                                            campaign_start_date: campaign_start_date,
                                            campaign_end_date: campaign_end_date,
                                            insertion_id: insertion_id,
                                            insertion_name: insertion_name,
                                            format_group: format_group,
                                            delivery_type_id: delivery_type_id,
                                            creative_id: creative_id,
                                            creative_width: creative_width,
                                            creative_height: creative_height,
                                            creative_name: creative_name,
                                            creative_url: creative_url,
                                            creative_click_url: creative_clickUrl
                                        }
        
                                        ObjCreativeAll.push(objAllCreative)
        
                                    }
        
        
        
        
                                    if (!creative_url.match(regex_url)) {
        
                                        var objCreative = {
                                            campaign_id: campaign_id,
                                            campaign_name: campaign_name,
                                            campaign_start_date: campaign_start_date,
                                            campaign_end_date: campaign_end_date,
                                            insertion_id: insertion_id,
                                            insertion_name: insertion_name,
                                            creative_id: creative_id,
                                            creative_name: creative_name,
                                            creative_url: creative_url,
                                            creative_click_url: creative_clickUrl
                                        }
        
        
                                        ObjCreativeUrl.push(objCreative)
        
                                    }
        
                                    if ((!creative_url.match(regex_urlClic))) {
        
                                        var objCreativeUrlClic = {
                                            campaign_id: campaign_id,
                                            campaign_name: campaign_name,
                                            campaign_start_date: campaign_start_date,
                                            campaign_end_date: campaign_end_date,
                                            insertion_id: insertion_id,
                                            insertion_name: insertion_name,
                                            creative_id: creative_id,
                                            creative_name: creative_name,
                                            creative_url: creative_url,
                                            creative_click_url: creative_clickUrl
                                        }
        
                                        ObjCreativeurlClic.push(objCreativeUrlClic)
        
                                    }
        
                                })
        
                            }
        
        
        
                        } else {
                            res.json({
                                type: 'error',
                                message: 'Error : Aucune donnée disponible'
                            });
                        }
                    })
        
        
                }
        
        
        
                const creativeUrl = await Utilities.groupBy(ObjCreativeUrl, 'campaign_id');
                const creativeUrlClic = await Utilities.groupBy(ObjCreativeurlClic, 'campaign_id');
                const creativeAll = await Utilities.groupBy(ObjCreativeAll, 'insertion_id');
        
        
                const listCreativeCompte = new Array()
                const listCreativeCompteOther = new Array()
                const listCreativeVideo = new Array()
                const listCreativeMobile = new Array()
                const listCreativeMobileHabillage = new Array()
        
                if (!Utilities.empty(creativeAll)) {
        
                  
        
        
                    Object.keys(creativeAll).forEach(key => {
        
        
                        switch (creativeAll[key][0].delivery_type_id) {
                            case "WEB":
                                if ((((creativeAll[key][0].format_group === "MASTHEAD") || (creativeAll[key][0].format_group === "GRAND ANGLE") || (creativeAll[key][0].format_group === "INTERSTITIEL")) && (Object.keys(creativeAll[key]).length < 2))) {
        
                                    var message_format = '<li>' + creativeAll[key][0].campaign_start_date + ' - ' + creativeAll[key][0].campaign_end_date + ' : ' + creativeAll[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeAll[key][0].insertion_id + '"target="_blank"><strong>' + creativeAll[key][0].insertion_name + '</strong> </a>(Total des créatives: <span>' + Object.keys(creativeAll[key]).length + ') </span></li>'
                                    listCreativeCompte.push(message_format)
        
        
        
                                }
        
                                if (((creativeAll[key][0].format_group === "HABILLAGE") && (Object.keys(creativeAll[key]).length < 1))) {
                                    var message_other = '<li>' + creativeAll[key][0].campaign_start_date + ' - ' + creativeAll[key][0].campaign_end_date + ' : ' + creativeAll[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeAll[key][0].insertion_id + '"target="_blank"><strong>' + creativeAll[key][0].insertion_name + '</strong> </a>(Total des créatives: <span>' + Object.keys(creativeAll[key]).length + ') </span></li>'
                                    listCreativeCompteOther.push(message_other)
        
        
                                }
                                break;
        
                            case "MOBILE/TABLETTE":
                                if ((((creativeAll[key][0].format_group === "MASTHEAD") || (creativeAll[key][0].format_group === "GRAND ANGLE") || (creativeAll[key][0].format_group === "INTERSTITIEL"))&&(Object.keys(creativeAll[key]).length < 1))) {
        
                                        var message_mobile = '<li>' + creativeAll[key][0].campaign_start_date + ' - ' + creativeAll[key][0].campaign_end_date + ' : ' + creativeAll[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeAll[key][0].insertion_id + '"target="_blank"><strong>' + creativeAll[key][0].insertion_name + '</strong> </a>(Total des créatives: <span>' + Object.keys(creativeAll[key]).length + ') </span></li>'
                                        listCreativeMobile.push(message_mobile)
        
                                    
        
                                }
        
                                if (((creativeAll[key][0].format_group === "HABILLAGE")&&(Object.keys(creativeAll[key]).length < 2))) {
        
                                        var message_mobileHabillage = '<li>' + creativeAll[key][0].campaign_start_date + ' - ' + creativeAll[key][0].campaign_end_date + ' : ' + creativeAll[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeAll[key][0].insertion_id + '"target="_blank"><strong>' + creativeAll[key][0].insertion_name + '</strong> </a>(Total des créatives: <span>' + Object.keys(creativeAll[key]).length + ') </span></li>'
                                        listCreativeMobileHabillage.push(message_mobileHabillage)
        
                                    
        
                                }
                                break;
        
                            case "VIDEO":
                                if ((((creativeAll[key][0].format_group === "RECTANGLE VIDEO") || (creativeAll[key][0].format_group === "INTERSTITIEL"))&&(Object.keys(creativeAll[key]).length < 1))) {
        
                                        var message_video = '<li>' + creativeAll[key][0].campaign_start_date + ' - ' + creativeAll[key][0].campaign_end_date + ' : ' + creativeAll[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeAll[key][0].insertion_id + '"target="_blank"><strong>' + creativeAll[key][0].insertion_name + '</strong> </a>(Total des créatives: <span>' + Object.keys(creativeAll[key]).length + ') </span></li>'
                                        listCreativeVideo.push(message_video)
        
                                    
        
                                }
                                break;
        
                            default:
                                break;
                        }
        
        
        
        
        
        
        
        
                    })
        
        
                }
        
        
        
                const listCreative = new Array()
                const listCreativeUrlClic = new Array()
        
        
                if (!Utilities.empty(creativeUrl)) {
                    Object.keys(creativeUrl).forEach(key => {
        
                        var message = '<li>' + creativeUrl[key][0].campaign_start_date + ' - ' + creativeUrl[key][0].campaign_end_date + ' : ' + creativeUrl[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeUrl[key][0].insertion_id + '"target="_blank"><strong>' + creativeUrl[key][0].insertion_name + '</strong> </a>(Total des insertions: <span>' + Object.keys(creativeUrl[key]).length + ') </span></li>'
        
                        listCreative.push(message)
                    })
                }
        
                if (!Utilities.empty(creativeUrlClic)) {
                    Object.keys(creativeUrlClic).forEach(key => {
        
                        var message2 = '<li>' + creativeUrlClic[key][0].campaign_start_date + ' - ' + creativeUrlClic[key][0].campaign_end_date + ' : ' + creativeUrlClic[key][0].campaign_name + ' - <a href="https://manage.smartadserver.com/Admin/Campagnes/Insertion/MediaCenter.aspx?insertionid=' + creativeUrlClic[key][0].insertion_id + '"target="_blank"><strong>' + creativeUrlClic[key][0].insertion_name + '</strong> </a>(Total des insertions: <span>' + Object.keys(creativeUrlClic[key]).length + ') </span></li>'
        
                        listCreativeUrlClic.push(message2)
                    })
                }
        
        
        
        
                if ((!Utilities.empty(listCreative)) ||
                    (!Utilities.empty(listCreativeUrlClic)) ||
                    (!Utilities.empty(listCreativeCompte)) ||
                    (!Utilities.empty(listCreativeCompteOther)) ||
                    (!Utilities.empty(listCreativeVideo)) ||
                    (!Utilities.empty(listCreativeMobile)) ||
                    (!Utilities.empty(listCreativeMobileHabillage))) {
        
        
                    nodeoutlook.sendEmail({
        
                        auth: {
                            user: "oceane.sautron@antennereunion.fr",
                            pass: process.env.EMAIL_PASS
                           
        
                        },
                        from: "oceane.sautron@antennereunion.fr",
                        to: "alvine.didier@antennereunion.fr",
                        cc: "oceane.sautron@antennereunion.fr",
                        subject: 'Alerte Manage: Problème de programmation des créatives',
        
                        html: ' <head><style>font-family: Century Gothic;font-size: large; </style></head>Bonjour <br><br>  Tu trouveras ci-dessous le lien pour voir la liste des alertes du manage, problème de paramétrage: des créative sont manquantes dans les insertions et/ou les url sont invalides <b> </b> : <ul>' + listCreative.join('')  + listCreativeUrlClic.join('')  + listCreativeCompte.join('') + listCreativeCompteOther.join('') + listCreativeMobile.join('') + listCreativeVideo.join('') + listCreativeMobile.join('') + listCreativeMobileHabillage.join('') + '</ul><br><br> À dispo pour échanger <br><br> <div style="font-size: 11pt;font-family: Calibri,sans-serif;"><img src="https://reporting.antennesb.fr/public/admin/photos/logo.png" width="79px" height="48px"><br><br><p><strong>L\'équipe Adtraffic</strong><br><small>Antenne Solutions Business<br><br> 2 rue Emile Hugot - Technopole de La Réunion<br> 97490 Sainte-Clotilde<br> Fixe : 0262 48 47 54<br> Fax : 0262 48 28 01 <br> Mobile : 0692 05 15 90<br> <a href="mailto:adtraffic@antennereunion.fr">adtraffic@antennereunion.fr</a></small></p></div>'
        
                        ,
                        onError: (e) => res.json({ message: "Une erreur est survenue lors de l'envoie du mail" }),
                        onSuccess: (i) => res.json({ message: "Email alerte manage campagne" })
        
        
                    })
                } else {
                    res.json({ message: "Aucune alerte créative" })
                }
        
        */
    })


}


exports.alert_campaignOnline = async (req, res) => {


    try {


        const now = new Date();
        const dateYesterday = moment(now).add('1', 'd').format('YYYY-MM-DDT00:00:00');

        await ModelCampaigns.findAll({
            where: {
                campaign_start_date: {
                    [Op.eq]: moment().format('YYYY-MM-DD')

                }
            }
        }).then(async function (campaigns) {

            // console.log(campaigns)


            if (!Utilities.empty(campaigns)) {

                nbr_campaign = campaigns.length


                const ObjCampagneAlert = new Array()

                for (let i = 0; i < nbr_campaign; i++) {
                    var campaignObject = {
                        "campaign_id": campaigns[i].campaign_id,

                    };

                    var config2 = SmartFunction.config('campaignsInsertions', campaignObject);


                    await axios(config2).then(async function (response) {

                        if (!Utilities.empty(response.data)) {
                            var dataValue = response.data;

                            if (!Utilities.empty(dataValue)) {

                                dataValue.forEach(async function (element) {

                                    const insertion_id = element.id
                                    const insertion_name = element.name
                                    const insertion_status_id = element.insertionStatusId
                                    const campaign_id = element.campaignId


                                    if (insertion_status_id !== 1) {


                                        var campaign = await ModelCampaigns.findOne({
                                            where: {
                                                campaign_id: campaign_id
                                            }
                                        })



                                        var ObjCampaignOffLine = {

                                            insertion_id: insertion_id,
                                            insertion_name: insertion_name,
                                            campaign_id: campaign_id,
                                            campaign_name: campaign.campaign_name,
                                            campaign_start_date: moment(campaign.campaign_start_date).format('DD-MM'),
                                            campaign_end_date: moment(campaign.campaign_end_date).format('DD-MM')
                                        }




                                        ObjCampagneAlert.push(ObjCampaignOffLine)

                                    }










                                });

                            }

                        } else {
                            return res.json({
                                type: 'error',
                                message: 'Error : Aucune donnée disponible'
                            });
                        }


                    })


                }

                const campaignStatut = Utilities.groupBy(ObjCampagneAlert, 'campaign_id');


                var listCampaignOffLineString = new Array()


                if (!Utilities.empty(campaignStatut)) {
                    Object.keys(campaignStatut).forEach(key => {

                        var message = '<li>' + campaignStatut[key][0].campaign_start_date + ' - ' + campaignStatut[key][0].campaign_end_date + ' : <a href="https://manage.smartadserver.com/gestion/smartprog2.asp?CampagneID=' + campaignStatut[key][0].campaign_id + '"target="_blank"><strong>' + campaignStatut[key][0].campaign_name + '</strong> </a>(Total des insertions: <span>' + Object.keys(campaignStatut[key]).length + ') </span></li>'

                        listCampaignOffLineString.push(message)
                    })
                }



                if (!Utilities.empty(listCampaignOffLineString)) {


                    nodeoutlook.sendEmail({

                        auth: {
                            user: "oceane.sautron@antennereunion.fr",
                            pass: process.env.EMAIL_PASS
                        },
                        from: "oceane.sautron@antennereunion.fr",
                        to: "alvine.didier@antennereunion.fr",
                        cc: "oceane.sautron@antennereunion.fr",
                        subject: 'Alerte Manage: Problème de mise en ligne des campagnes',

                        html: ' <head><style>font-family: Century Gothic;font-size: large; </style></head>Bonjour <br><br>  Tu trouveras ci-dessous le lien pour voir la liste des alertes du manage <b> </b> : <ul>' + listCampaignOffLineString.join('') + '</ul><br><br> À dispo pour échanger <br><br> <div style="font-size: 11pt;font-family: Calibri,sans-serif;"><img src="https://reporting.antennesb.fr/public/admin/photos/logo.png" width="79px" height="48px"><br><br><p><strong>L\'équipe Adtraffic</strong><br><small>Antenne Solutions Business<br><br> 2 rue Emile Hugot - Technopole de La Réunion<br> 97490 Sainte-Clotilde<br> Fixe : 0262 48 47 54<br> Fax : 0262 48 28 01 <br> Mobile : 0692 05 15 90<br> <a href="mailto:adtraffic@antennereunion.fr">adtraffic@antennereunion.fr</a></small></p></div>'

                        ,
                        onError: (e) => res.json({ message: "Une erreur est survenue lors de l'envoie du mail" }),
                        onSuccess: (i) => res.json({ message: "Email alerte manage campagne" })


                    })
                } else {
                    res.json({ message: "Aucune alerte campagne" })
                }



            } else {
                res.json({ message: "Aucune campagne alerte" })
            }


        })




    } catch (error) {

        console.log(error)

    }





}