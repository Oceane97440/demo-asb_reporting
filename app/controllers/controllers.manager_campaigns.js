// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require('axios');
var crypto = require('crypto');

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

const csv = require('csv-parser');
const fs = require('fs');

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const Utilities = require("../functions/functions.utilities");

// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAgencies = require("../models/models.agencies");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelInsertionsPriorities = require(
    "../models/models.insertions_priorities"
);
const ModelInsertionsStatus = require("../models/models.insertions_status");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const ModelEpilotCampaigns = require("../models/models.epilot_campaigns");
const ModelEpilotInsertions = require("../models/models.epilot_insertions");
const ModelUsers = require("../models/models.users");

const TEXT_REGEX = /^.{1,51}$/

const {promiseImpl} = require('ejs');
const {insertions} = require('./controllers.automate');

exports.index = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': ''
        },);
        data.breadcrumb = breadcrumb;

        data.campaigns = await ModelCampaigns.findAll({
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        // Affiche les campagnes se terminant aujourd'hui
        var dateNow = moment().format('YYYY-MM-DD');
        var dateTomorrow = moment()
            .add(1, 'days')
            .format('YYYY-MM-DD');
        var date5Days = moment()
            .add(5, 'days')
            .format('YYYY-MM-DD');

          // Affiche les annonceurs
          const advertiserExclus = new Array(418935,427952,409707,425912,425914,438979,439470,439506,439511,439512,439513,439514,439515,440117,440118,440121,440122,440124,440126,445117,455371,455384,320778,417243,414097,411820,320778);
      

        data.campaigns_today = await ModelCampaigns.findAll({
            where: {
                campaign_end_date: {
                    [Op.between]:  [dateNow + ' 00:00:00', dateNow + ' 23:59:00']
                }
            },
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        // Affiche les campagnes se terminant demain
        data.campaigns_tomorrow = await ModelCampaigns.findAll({
            where: {
                campaign_end_date: {
                    [Op.between]:  [dateTomorrow + ' 00:00:00', dateTomorrow + ' 23:59:00']
                }
            },
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        // Affiche les campagnes se terminant dans les 5 prochains jours
        data.campaigns_nextdays = await ModelCampaigns.findAll({
            where: {
                [Op.and]: [
                    {
                        advertiser_id: {
                            [Op.notIn]: advertiserExclus
                        }
                    }
                ],
                [Op.or]: [/*{
                    campaign_start_date: {
                        [Op.between]:[dateNow, date5Days]
                    }
                },*/ {
                    campaign_end_date: {
                        [Op.between]: [dateNow, date5Days]
                    }
                }]
                
            },
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['campaign_start_date', 'ASC']
            ],
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });


      
        // Affiche les campagnes en ligne
        data.campaigns_online = await ModelCampaigns.findAll({
            where: {               
                [Op.and]: [
                    {
                        advertiser_id: {
                            [Op.notIn]: advertiserExclus
                        }
                    }
                ],
                [Op.or]: [{
                    campaign_start_date: {
                        [Op.between]: [dateNow, '2040-12-31 23:59:00']
                    }
                }, {
                    campaign_end_date: {
                        [Op.between]: [dateNow, '2040-12-31 23:59:00']
                    }
                }]
            },
            
                order: [['campaign_end_date','ASC']],
            
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        data.moment = moment;

        console.log('dateNow :', dateNow)
        console.log('dateTomorrow :', dateTomorrow)
        console.log('date5Days :', date5Days, ' - ', data.campaigns_nextdays.length)
       
        res.render('manager/campaigns/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.list = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();

        // Créer le fil d'ariane
        const breadcrumbLink = 'campaigns';
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Liste des campagnes',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.campaigns = await ModelCampaigns.findAll({
            include: [
                {
                    model: ModelAdvertisers
                }, {
                    model: ModelInsertions
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
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.view = async (req, res) => {
    try {
        const data = new Object();

        var insertionsIds = new Array();
        data.insertions = new Array();
        data.creatives = new Array();

        var campaign_id = req.params.id;
        var campaign = await ModelCampaigns
            .findOne({
                where: {
                    campaign_id: campaign_id
                },
                include: [
                    {
                        model: ModelAdvertisers
                    }, {
                        model: ModelAgencies
                    }, {
                        model: ModelInsertions
                    }
                ]
            })
            .then(async function (campaign) {
                if (!campaign) {
                    return res
                        .status(404)
                        .render("manager/error.ejs", {statusCoded: 404});
                }

                // Créer le fil d'ariane
                var breadcrumbLink = 'advertisers'
                breadcrumb = new Array({
                    'name': 'Campagnes',
                    'link': 'campaigns'
                }, {
                    'name': campaign.advertiser.advertiser_name,
                    'link': breadcrumbLink.concat('/', campaign.advertiser_id)
                }, {
                    'name': campaign.campaign_name,
                    'link': ''
                });
                data.breadcrumb = breadcrumb;

                // Récupére les données des campagnes epilot
                var epilot_campaign = await ModelEpilotCampaigns.findOne({
                    attributes: ['epilot_campaign_volume'],
                    where: {
                        campaign_id: campaign_id
                    }
                });

                //test si epilot_campaign existe
                if (!Utilities.empty(epilot_campaign)) {
                    data.epilot_campaign = epilot_campaign;
                }else{
                    data.epilot_campaign = 0;

                } 

                // Récupére les données des insertions de la campagne
                var insertionList = await ModelInsertions
                    .findAll({
                        where: {
                            campaign_id: campaign_id
                        },
                        include: [
                            {
                                model: ModelCampaigns,
                                attributes: ['campaign_id', 'campaign_name']
                            }, {
                                model: ModelFormats,
                                attributes: ['format_id', 'format_name']
                            }, {
                                model: ModelInsertionsPriorities,
                                attributes: ['priority_id', 'priority_name']
                            }, {
                                model: ModelInsertionsStatus,
                                attributes: ['insertion_status_id', 'insertion_status_name']
                            }
                        ]
                    })
                    .then(async function (insertionList) {

                        if (!Utilities.empty(insertionList) && (insertionList.length > 0)) {

                            data.insertions = insertionList;
                            for (i = 0; i < insertionList.length; i++) {
                                insertionsIds.push(insertionList[i].insertion_id);
                            }

                            // Récupére l'ensemble des insertions IDs pour afficher l'ensemble des créatives
                            if (insertionsIds) {
                                // Récupére les données des creatives de l'insertion
                                var creativesList = await ModelCreatives
                                    .findAll({
                                        attributes:["creative_url","creative_mime_type","creative_click_url"],
                                        where: {
                                            insertion_id: insertionsIds
                                        },
                                        group: 'creative_url'
                                    })
                                    .then(async function (creativesList) {
                                        data.creatives = creativesList;
                                    });
                            }

                        }
                    });

                // Attribue les données de la campagne
                data.campaign = campaign;
                data.moment = moment;
                data.utilities = Utilities;

                // Récupére l'ensemble des données du rapport
                data_localStorage = localStorage.getItem('campaignID-' + campaign.campaign_id);
                data.reporting = JSON.parse(data_localStorage);

                res.render('manager/campaigns/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.create = async (req, res) => {
    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Créer une campagne',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        // Récupére l'ensemble des annonceurs
        var advertisers = await ModelAdvertisers
            .findAll({
                where:{
                    advertiser_archived : 0
                },
                order: [
                    // Will escape title and validate DESC against a list of valid direction
                    // parameters
                    ['advertiser_name', 'ASC']
                ]
            })
            .then(async function (advertisers) {
                data.advertisers = advertisers;
            });

        res.render('manager/campaigns/create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.create_post = async (req, res) => {
    try {
        const advertiser = req.body.advertiser_id
        const campaign = req.body.campaign_name
        const start_date = req.body.campaign_start_date
        const end_date = req
            .body
            .campaign_end_date

            console
            .log(req.body)

        if (!TEXT_REGEX.test(campaign)) {
            req.session.message = {
                type: 'danger',
                intro: 'Erreur',
                message: 'Le nombre de caratère est limité à 50'
            }
            return res.redirect('/manager/campaigns/create')
        }

        if (advertiser == '' || campaign == '' || start_date == '' || end_date == '') {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Les champs doivent être complétés'
            }
            return res.redirect('/manager/campaigns/create')
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
            return res.redirect('/manager/campaigns/create')
        }

        var requestCampaign = {
            "name": campaign,

            "advertiserId": advertiser,

            "agencyId": 0,

            "campaignStatusId": 3,

            "description": "",

            "externalCampaignId": "",

            "traffickedBy": 0,

            "startDate": start_date,

            "endDate": end_date,

            "globalCapping": 0,

            "visitCapping": 0,

            "isArchived": false

        }

        await ModelCampaigns
            .findOne({
                attributes: ['campaign_name'],
                where: {
                    campaign_name: campaign
                }
            })
            .then(async function (campaignFound) {

                //Test si le nom de la campagne exsite

                if (!campaignFound) {
                    //envoie les éléments de la requête POST

                    let campaign_create = await AxiosFunction.postManage(
                        'campaigns',
                        requestCampaign
                    );

                    //Si url location existe on recupère l'id avec une requête GET

                    if (campaign_create.headers.location) {

                        var url_location = campaign_create.headers.location

                        var campaign_get = await AxiosFunction.getManage(url_location);

                        var campaign_id = campaign_get.data.id

                        // on chiffre la campagne id
                        const campaign_crypt = crypto
                            .createHash('md5')
                            .update(campaign_id.toString())
                            .digest("hex");

                        await ModelCampaigns.create({
                            campaign_name: campaign,
                            campaign_crypt: campaign_crypt,
                            advertiser_id: advertiser,
                            campaign_start_date: start_date,
                            campaign_end_date: end_date,
                            campaign_archived: 0

                        });

                        req.session.message = {
                            type: 'success',
                            intro: 'Ok',
                            message: 'La campagne a été crée dans SMARTADSERVEUR'
                        }
                        return res.redirect('/manager/campaigns/create');
                    }

                } else {
                    req.session.message = {
                        type: 'danger',
                        intro: 'Erreur',
                        message: 'Campagne est déjà utilisé'
                    }
                    return res.redirect('/manager/advertisers/create');
                }

            })

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}
