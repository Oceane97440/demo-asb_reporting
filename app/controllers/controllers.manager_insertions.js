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
const Utilities = require("../functions/functions.utilities");

// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelInsertionsPriorities = require("../models/models.insertions_priorities");
const ModelInsertionsStatus = require("../models/models.insertions_status");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const ModelDeliverytTypes = require("../models/models.deliverytypes")
const ModelPacksSmart = require("../models/models.packs_smart")
const ModelPacks = require("../models/models.packs")
const ModelPacksSites = require("../models/models.packs_sites")
const ModelFormatsGroupsTypes = require(
    "../models/models.formats_groups_types"
);
const ModelFormatsTemplates = require("../models/models.formats_templates")
const ModelFormatsGroups = require("../models/models.formats_groups");
const ModelGroupFormats = require("../models/models.formats_groups")
const ModelTemplates = require("../models/models.templates")
const ModelInsertionsTemplates = require("../models/models.insertions_templates")

const TEXT_REGEX = /^.{1,51}$/

const {
    promiseImpl
} = require('ejs');
const {
    insertions
} = require('./controllers.automate');
const {
    types
} = require('util');

exports.index = async (req, res) => {
    try {
        // Liste toutes les insertions
        const data = new Object();
        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Insertions',
            'link': ''
        }, );
        data.breadcrumb = breadcrumb;

        data.insertions = await ModelInsertions.findAll({
            include: [{
                model: ModelCampaigns
            }]
        });

        data.moment = moment;

        res.render('manager/insertions/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.list = async (req, res) => {
    try {
        // Liste toutes les insertions
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Insertions',
            'link': 'insertions'
        }, {
            'name': 'Liste des insertions',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.insertions = await ModelInsertions.findAll({
            include: [{
                    model: ModelCampaigns,
                    attributes: ['campaign_id', 'campaign_name']
                },
                // { model: ModelAdvertisers, attributes: ['advertiser_id', 'advertiser_name'] },
                {
                    model: ModelFormats,
                    attributes: ['format_id', 'format_name']
                },
                {
                    model: ModelInsertionsPriorities,
                    attributes: ['priority_id', 'priority_name']
                },
                {
                    model: ModelInsertionsStatus,
                    attributes: ['insertion_status_id', 'insertion_status_name']
                },
            ]
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['insertion_id', 'DESC']
            ]
        });

        data.utilities = Utilities;
        data.moment = moment;
        res.render('manager/insertions/list.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.view = async (req, res) => {
    try {
        const data = new Object();

        var campaign_id = req.params.campaign_id;
        var insertion_id = req.params.insertion_id;
        var insertion = await ModelInsertions
            .findOne({
                where: {
                    campaign_id: campaign_id,
                    insertion_id: insertion_id
                },
                include: [{
                        model: ModelCampaigns,
                        attributes: ['campaign_id', 'campaign_name']
                    },
                    // { model: ModelAdvertisers, attributes: ['advertiser_id', 'advertiser_name'] },
                    {
                        model: ModelFormats,
                        attributes: ['format_id', 'format_name']
                    },
                    {
                        model: ModelInsertionsPriorities,
                        attributes: ['priority_id', 'priority_name']
                    },
                    {
                        model: ModelInsertionsStatus,
                        attributes: ['insertion_status_id', 'insertion_status_name']
                    },
                ]
            })
            .then(async function (insertion) {
                if (!insertion) {
                    return res
                        .status(404)
                        .render("manager/error.ejs", {
                            statusCoded: 404
                        });
                }

                // Créer le fil d'ariane
                var breadcrumbLink = 'campaigns'
                breadcrumb = new Array({
                    'name': 'Insertions',
                    'link': 'insertions'
                }, {
                    'name': insertion.campaign.campaign_name,
                    'link': breadcrumbLink.concat('/', insertion.campaign_id)
                }, {
                    'name': insertion.insertion_name,
                    'link': ''
                });
                data.breadcrumb = breadcrumb;
                // Récupére l'annonceur lié à cette campagne
                var campaign = await ModelCampaigns
                    .findOne({
                        where: {
                            campaign_id: campaign_id
                        },
                        include: [{
                            model: ModelAdvertisers
                        }]
                    });

                // Récupére les données des creatives de l'insertion
                var creativesList = await ModelCreatives.findAll({
                    where: {
                        insertion_id: insertion_id
                    }
                }).then(async function (creativesList) {
                    data.creatives = creativesList;
                    console.log(creativesList)
                });

                // Attribue les données de la campagne                   
                data.insertion = insertion;
                data.campaign = campaign;
                data.moment = moment;
                data.Utilities = Utilities;

                res.render('manager/insertions/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.create = async (req, res) => {
    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Insertions',
            'link': 'insertions'
        }, {
            'name': 'Ajouter une insertion',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.campaigns = await ModelCampaigns.findAll({
            include: [{
                model: ModelAdvertisers
            }]
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                // ['advertiser_id', 'ASC'],
                [{
                    model: ModelAdvertisers,
                    as: 'ModelAdvertisers'
                }, 'advertiser_name', 'ASC'],
                ['campaign_name', 'ASC']
            ]
        });

        data.advertisers = await ModelAdvertisers.findAll({
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['advertiser_name', 'ASC'],
                // ['campaign_name', 'ASC']
            ]
        });

        data.deliverytypes = await ModelDeliverytTypes.findAll({
            where: {
                deliverytype_id: [0, 10, 22]
            }
        });

        data.priorities = await ModelInsertionsPriorities.findAll({
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['priority_id', 'DESC']
            ]
        });

        data.group_formats = await ModelGroupFormats.findAll({
            attributes: ['format_group_id', 'format_group_name'],
            order: [
                ['format_group_name', 'ASC']
            ],
        })

        data.formats = await ModelFormats.findAll({
            attributes: ['format_group'],
            group: "format_group",
            where: {
                format_group: {
                    [Op.not]: null
                }
            },
            order: [
                ['format_group', 'ASC']
            ],
        })

        data.packs = await ModelPacks.findAll({

        });

        res.render('manager/insertions/create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.create_post = async (req, res) => {

    try {
        var body = {
            campaign_id: '1764641',
            // format_group_id: '4',
            format_group_id: 'GRAND ANGLE',

            pack_id: '1',
            display_mobile_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LEAL_REUNION/20201104/BMWSERIE4-63594/300x250.jpg',
            display_mobile_url: 'https://www.bmw.re/',
            display_tablet_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LEAL_REUNION/20201104/BMWSERIE4-63594/300x250.jpg',
            display_tablet_url: 'https://www.bmw.re/',
            display_desktop_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LEAL_REUNION/20201104/BMWSERIE4-63594/300x600.jpg',
            display_desktop_url: 'https://www.bmw.re/',
            video_file: '',
            video_url: '',
            submit: 'Créer une nouvelle insertion'
        }


  

        const campaign_id = body.campaign_id;
        const format_group_id = body.format_group_id;
        const pack_id = body.pack_id;

        const display_mobile_file = body.display_mobile_file;
        const display_mobile_url = body.display_mobile_url;

        const display_tablet_file = body.display_tablet_file;
        const display_tablet_url = body.display_tablet_url;

        const display_desktop_file = body.display_desktop_file;
        const display_desktop_url = body.display_desktop_url;

        const video_file = body.video_file;
        const video_url = body.video_url;

        const formatIdsArray = []
        const sites = []
        // si format site countrie ne sont pas vide selectionne le groupe format
        if (format_group_id.length != 0 && pack_id.length != 0 && campaign_id.length != 0) {
            // select groupe format + format id
            const formatIds = await ModelFormats.findAll({
                attributes: ['format_id'],
                where: {
                    format_group: {
                        [Op.eq]: format_group_id
                    }
                }
            });

            // Create formatIdsArray's variable to handler more later
            for (let l = 0; l < formatIds.length; l++) {
                formatIdsArray.push(formatIds[l].format_id);
            }
        }


        // recupération des site d'un pack
        const sitesdb = await ModelPacksSites.findAll({
            attributes: ['pack_id', 'site_id'],
            where: {
                pack_id: {
                    [Op.eq]: pack_id
                }
            }
        });

        if (sitesdb.length > 0) {
            for (let l = 0; l < sitesdb.length; l++) {
                sites.push(sitesdb[l].site_id);
            }

            // Si c'est un string on met en tableau pour respecter l'api
            if (typeof sites == 'string') {
                sites = [sites];
            }
        }

        console.log('GRANG ANGLE '+ formatIdsArray)
        console.log('Pack GR '+sites)



        process.exit()

        // Affichage du tableau
        var requestValues = new Array();

        // ------ 

        // 1. Sélectionner la campagne
        // 
        console.log('campaign_id :', campaign_id);

        // 2. Sélectionner le format 
        // 
        console.log('format_group_id :', format_group_id);

        const formats = await ModelFormatsGroupsTypes.findAll({
            where: {
                format_group_id: format_group_id
            },
            include: [{
                model: ModelFormats,
                attributes: ['format_id', 'format_name', 'format_type_id']
            }, {
                model: ModelFormatsGroups,
                attributes: ['format_group_id', 'format_group_name']
            }]
        });

        // if(!utilities.empty(formats)) {
        console.log('Formats :', formats.length)
        for (i = 0; i < formats.length; i++) {
            var value = new Array();
            // console.log(formats[i].formats_group.format_group_name, ' ', formats[i].format_id, ' ', formats[i].format.format_name, ' - ', formats[i].format.format_type_id);
            value['format_group_name'] = formats[i].formats_group.format_group_name;
            value['format_id'] = formats[i].format_id;
            value['format_name'] = formats[i].format.format_name;
            value['format_type_id'] = formats[i].format.format_type_id;

            requestValues.push(value);
        }

        console.log(requestValues);
        // }


        /*
       
        process.exit();
        console.log(formats[0])
        */
        // 3. Sélectionner le pack 
        // 

        const packs = await ModelPacks.findAll({
            where: {
                pack_id: pack_id
            },
            include: [{
                    model: ModelPacksSites,
                    attributes: ['pack_site_id', 'pack_id', 'site_id']
                }
                /* {
                                model: ModelFormatsGroups,
                                attributes: ['format_group_id', 'format_group_name']
                            }*/
            ]
        });


        if (Utilities.empty(packs)) {
            console.log('Packs :', packs.length, ' - pack_id :', pack_id);

            for (i = 0; i < packs.length; i++) {
                var value = new Array();
                console.log(packs[i].pack_site_id, ' ', packs[i].pack_id, ' ', packs[i].site_id);
                // console.log(formats[i].formats_group.format_group_name, ' ', formats[i].format_id, ' ', formats[i].format.format_name, ' - ', formats[i].format.format_type_id);
                /* value['format_group_name'] = formats[i].formats_group.format_group_name;
                 value['format_id'] = formats[i].format_id;
                 value['format_name'] = formats[i].format.format_name;
                 value['format_type_id'] = formats[i].format.format_type_id;

                 requestValues.push(value);*/
            }

            switch (pack_id) {
                case '1':

                    break;
                case '2':
                    break;
                case '3':
                    break;
                case '4':
                    break;
                case '5':
                    break;
                case '6':
                    break;
                default:
                    console.log(`Sorry, we are out of ${expr}.`);
            }
        }



        // 4. Sélectionner le format et les afficher
        // 


        // 5. 
        // 


        // 6. Requête de l'insertion
        var requestInsertion = {
            "isDeliveryRegulated": true,
            "isUsedByGuaranteedDeal": false,
            "isUsedByNonGuaranteedDeal": false,
            "name": "20211101 - MPAVE AD - ",
            "description": "",
            "isPersonalizedAd": false,
            /* "siteIds": [
                 299248,
                 299249
             ],*/
            "insertionStatusId": 1,
            "startDate": "2021-10-27T00:00:00",
            "endDate": "2021-10-27T23:59:00",
            "campaignId": 1764641,
            "insertionTypeId": 0,
            "deliveryTypeId": 10,
            "timezoneId": 4, // Insertion TimezoneId
            "priorityId": 62, // Insertion PriorityId
            "insertionGroupedVolumeId": 452054,
            "globalCapping": 0, // Insertion CappingGlobal
            "cappingPerVisit": 0, // Insertion CappingVisite
            //   "cappingPerClick": 0,
            //   "autoCapping": 0,
            "PeriodicCappingImpressions": 0,
            "PeriodicCappingPeriod": 0,
            "isObaIconEnabled": false,
            // "formatId": 79654,
            "isArchived": false,
            /* "insertionExclusionIds": [
                 111233
             ],*/
            "customizedScript": "",
            "salesChannelId": 1
        }

        console.log('REQUEST : ', requestInsertion);


        process.exit();

        /*
               const campaign_id = req.body.campaign_id;
               const format_group_id = req.body.format_group_id;        
               const pack_id = req.body.pack_id;

               const display_mobile_file = req.body.display_mobile_file;
               const display_mobile_url = req.body.display_mobile_url;
               
               const display_tablet_file = req.body.display_tablet_file;
               const display_tablet_url = req.body.display_tablet_url;
               
               const display_desktop_file = req.body.display_desktop_file;
               const display_desktop_url = req.body.display_desktop_url;
               
               const video_file = req.body.video_file;
               const video_url = req.body.video_url;
                   
               console.log(req.body)

              

               const campaign_id = req.body.campaign_id;
               const insertion = req.body.insertion
               const format = req.body.format
               const packs = req.body.packs
               const start_date = req.body.campaign_start_date
               const end_date = req.body.campaign_end_date
               const delivery_type = req.body.delivery_type
               const priority = req.body.priority

               console.log(req.body)

               if (!TEXT_REGEX.test(insertion)) {
                   req.session.message = {
                       type: 'danger',
                       intro: 'Erreur',
                       message: 'Le nombre de caratère est limité à 50'
                   }
                   return res.redirect(`/manager/insertions/create/${campaign}`)

               }

               if (insertion == '' || campaign == '' || start_date == '' || end_date == '' || format == '') {
                   req.session.message = {
                       type: 'danger',
                       intro: 'Un problème est survenu',
                       message: 'Les champs doivent être complétés'
                   }
                   return res.redirect(`/manager/insertions/create/${campaign}`)
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
                   return res.redirect(`/manager/insertions/create/${campaign}`)
               }

               const dateNow = moment().format('YYYY-MM-DD HH:mm:ss');


               var requestInsertion = {

                   "isDeliveryRegulated": true,
                   "isUsedByGuaranteedDeal": false,
                   "isUsedByNonGuaranteedDeal": false,
                   "impressionTypeId": 0,
                   "voiceShare": 0,
                   "eventId": 0,
                   "creativeRotationModeId": 0,
                   "name": insertion,
                   "description": "",
                   "isPersonalizedAd": false,
                   "insertionStatusId": 0,
                   //"siteIds": site,
                   "packIds": [packs],
                   "insertionStatusId": 1,
                   "startDate": start_date,
                   "endDate": end_date,
                   "campaignId": campaign,
                   "insertionTypeId": 0,
                   "deliveryTypeId": delivery_type,
                   "timezoneId": 4,
                   "priorityId": priority,
                   "periodicCappingId": 0,
                   "groupCappingId": 0,
                   "maxImpressions": 0,
                   "weight": 0,
                   "maxClicks": 0,
                   "maxImpressionsPerDay": 0,
                   "maxClicksPerDay": 0,
                   "eventImpressions": 0,
                   "isHolisticYieldEnabled": false,
                   "deliverLeftVolumeAfterEndDate": false,
                   "globalCapping": 0,
                   "cappingPerVisit": 0,
                   "cappingPerClick": 0,
                   "autoCapping": 0,
                   // "periodicCappingImpressions": 0,
                   // "periodicCappingPeriod": 0,
                   "isObaIconEnabled": false,
                   "formatId": format,
                   "externalId": 0,
                   "externalDescription": "",
                   "updatedAt": dateNow,
                   "createdAt": dateNow,
                   "isArchived": false,
                   "rateTypeId": 0,
                   "rate": 0.0,
                   "rateNet": 0.0,
                   "discount": 0.0,
                   "currencyId": 0,
                   "insertionLinkId": 0,
                   "customizedScript": "",
                   "salesChannelId": 1,
                   "inventoryTypeId": 0

               }

               //paramètre avec capping si format Interstitiel
               if (format === '79633' || format === '44152') {

                   var requestInsertion = {

                       "isDeliveryRegulated": true,
                       "isUsedByGuaranteedDeal": false,
                       "isUsedByNonGuaranteedDeal": false,
                       "impressionTypeId": 0,
                       "voiceShare": 0,
                       "eventId": 0,
                       "creativeRotationModeId": 0,
                       "name": insertion,
                       "description": "",
                       "isPersonalizedAd": false,
                       "insertionStatusId": 0,
                       //"siteIds": site,
                       "packIds": [packs],
                       "insertionStatusId": 1,
                       "startDate": start_date,
                       "endDate": end_date,
                       "campaignId": campaign,
                       "insertionTypeId": 0,
                       "deliveryTypeId": delivery_type,
                       "timezoneId": 4,
                       "priorityId": priority,
                       "periodicCappingId": 0,
                       "groupCappingId": 0,
                       "maxImpressions": 0,
                       "weight": 0,
                       "maxClicks": 0,
                       "maxImpressionsPerDay": 0,
                       "maxClicksPerDay": 0,
                       "eventImpressions": 0,
                       "isHolisticYieldEnabled": false,
                       "deliverLeftVolumeAfterEndDate": false,
                       "globalCapping": 0,
                       "cappingPerVisit": 0,
                       "cappingPerClick": 0,
                       "autoCapping": 0,
                       "periodicCappingImpressions": 1,
                       "periodicCappingPeriod": 15,
                       "isObaIconEnabled": false,
                       "formatId": format,
                       "externalId": 0,
                       "externalDescription": "",
                       "updatedAt": dateNow,
                       "createdAt": dateNow,
                       "isArchived": false,
                       "rateTypeId": 0,
                       "rate": 0.0,
                       "rateNet": 0.0,
                       "discount": 0.0,
                       "currencyId": 0,
                       "insertionLinkId": 0,
                       "customizedScript": "",
                       "salesChannelId": 1,
                       "inventoryTypeId": 0

                   }


               }


               await ModelInsertions
                   .findOne({
                       attributes: ['insertion_name'],
                       where: {
                           insertion_name: insertion
                       }
                   }).then(async function (insertionFound) {


                       if (!insertionFound) {


                           let insertion_create = await AxiosFunction.postManage(
                               'insertions',
                               requestInsertion
                           );


                           if (insertion_create.headers.location) {
                               var url_location = insertion_create.headers.location
                               var insertion_get = await AxiosFunction.getManage(url_location);
                               const insertion_id = insertion_get.data.id

                               //Si le format Interstitiel est choisi et que il n'y a pas exclusion
                               //on coche la case targeting cookie
                               if (format === '79633' || format === '44152') {
                                   requestInsertionsTarget = {
                                       "insertionId": insertion_id,
                                       "targetBrowserWithCookies": true
                                   }
                                   await AxiosFunction.putManage(
                                       'insertiontargetings',
                                       requestInsertionsTarget
                                   );
                               }


                               await ModelInsertions.create({
                                   insertion_id: insertion_id,
                                   insertion_name: insertion,
                                   campaign_id: campaign,
                                   insertion_start_date: start_date,
                                   insertion_end_date: end_date,
                                   pack_id: packs,
                                   format_id: format,
                                   delivery_type_id: delivery_type,
                                   timezone_id: 4,
                                   priority_id: priority,
                                   campaign_archived: 0

                               });

                               req.session.message = {
                                   type: 'success',
                                   intro: 'Ok',
                                   message: 'L\'inserion a été crée dans SMARTADSERVEUR',

                               }
                               return res.redirect(`/manager/insertions/create/${campaign}`)
                           }





                       } else {
                           req.session.message = {
                               type: 'danger',
                               intro: 'Erreur',
                               message: 'Insertions est déjà utilisé'
                           }
                           return res.redirect(`/manager/insertions/create/${campaign}`)
                       }


                   })
         */

    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }

}


exports.create_creative = async (req, res) => {

    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Creatives',
            'link': 'creatives/list'
        }, {
            'name': 'Ajouter une créative à l\'insertion',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        // Récupére l'ensemble les données


        data.insertions = await ModelInsertions.findOne({
            where: {
                insertion_id: req.params.id
            },

        });

        data.formats_templates = await ModelFormatsTemplates.findOne({
            where: {
                format_id: data.insertions.format_id
            },

            include: [{
                    model: ModelFormats

                },
                {
                    model: ModelTemplates,

                }
            ]

        });



        res.render('manager/insertions/create_creative.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.create_creative_post = async (req, res) => {
    try {
        const insertion = req.body.insertion
        const creative = req.body.creative
        const template = req.body.template
        const type = req.body.type
        const url = req.body.url
        const url_click = req.body.url_click



        if (!TEXT_REGEX.test(creative)) {
            req.session.message = {
                type: 'danger',
                intro: 'Erreur',
                message: 'Le nombre de caratère est limité à 50'
            }
            return res.redirect(`/manager/creatives/create/${insertion}`)

        }

        if (insertion == '' || creative == '' || type == '' || url == '' || url_click == '') {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Les champs doivent être complétés'
            }
            return res.redirect(`/manager/creatives/create/${insertion}`)
        }



        var requestCreatives = {

            "InsertionId": insertion,

            "Name": creative,

            "FileName": creative,

            "Url": url,

            "clickUrl": url_click,

            "Width": 350,

            "Height": 250,

            "CreativeTypeId": type,

            "IsActivated": "true"

        }



        await ModelCreatives
            .findOne({
                attributes: ['creative_name'],
                where: {
                    creative_name: creative
                }
            }).then(async function (creativeFound) {


                if (!creativeFound) {


                    let creative_create = await AxiosFunction.postManage(
                        'creatives',
                        requestCreatives
                    );

                    if (creative_create.headers.location) {


                        var url_location = creative_create.headers.location


                        var creative_get = await AxiosFunction.getManage(url_location);

                        const creative_id = creative_get.data.id
                        const file_name = creative_get.data.fileName
                        const creative_mime_type = creative_get.data.mimeType
                        const creative_width = creative_get.data.width
                        const creative_height = creative_get.data.height


                        await ModelCreatives.create({
                            creative_id: creative_id,
                            creative_name: creative,
                            file_name: file_name,
                            insertion_id: insertion,
                            creative_url: url,
                            creative_click_url: url_click,
                            creative_width: creative_width,
                            creative_height: creative_height,
                            creative_mime_type: creative_mime_type,
                            creative_type_id: type,
                            creative_activated: 1,
                            creative_archived: 0

                        });

                        const templateId = await ModelTemplates.findOne({
                            where: {
                                template_id: template
                            }
                        })

                        var RequestInsertionTemplate = {
                            "InsertionId": insertion,
                            "ParameterValues": templateId.parameter_default_values,
                            "TemplateId": templateId.template_id
                        }

                        await AxiosFunction.putManage(
                            'insertiontemplates',
                            RequestInsertionTemplate
                        );

                        await ModelInsertionsTemplates.create({
                            insertion_id: insertion,
                            parameter_value: templateId.parameter_default_values,
                            template_id: templateId.template_id,


                        });
                        req.session.message = {
                            type: 'success',
                            intro: 'Ok',
                            message: 'La créative a été crée dans SMARTADSERVEUR',

                        }
                        return res.redirect(`/manager/creatives/create/${insertion}`)



                    }





                } else {
                    req.session.message = {
                        type: 'danger',
                        intro: 'Erreur',
                        message: 'Créatives est déjà utilisé'
                    }
                    return res.redirect(`/manager/creatives/create/${insertion}`)
                }


            })





    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}