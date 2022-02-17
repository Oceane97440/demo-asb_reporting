// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require('axios');
var crypto = require('crypto');
const excel = require('node-excel-export');
var nodeoutlook = require('nodejs-nodemailer-outlook');

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
const ModelFormatsGroups = require("../models/models.formats_groups");

const TEXT_REGEX = /^.{1,51}$/

const {
    promiseImpl
} = require('ejs');
const {
    insertions
} = require('./controllers.automate');

exports.index = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': ''
        }, );
        data.breadcrumb = breadcrumb;

        data.campaigns = await ModelCampaigns.findAll({
            include: [{
                model: ModelAdvertisers
            }]
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
            320778
        );

        data.campaigns_today = await ModelCampaigns.findAll({
            where: {
                campaign_end_date: {
                    [Op.between]: [
                        dateNow + ' 00:00:00',
                        dateNow + ' 23:59:00'
                    ]
                }
            },
            include: [{
                model: ModelAdvertisers
            }]
        });

        // Affiche les campagnes se terminant demain
        data.campaigns_tomorrow = await ModelCampaigns.findAll({
            where: {
                campaign_end_date: {
                    [Op.between]: [
                        dateTomorrow + ' 00:00:00',
                        dateTomorrow + ' 23:59:00'
                    ]
                }
            },
            include: [{
                model: ModelAdvertisers
            }]
        });

        // Affiche les campagnes se terminant dans les 5 prochains jours
        data.campaigns_nextdays = await ModelCampaigns.findAll({
            where: {
                [Op.and]: [{
                    advertiser_id: {
                        [Op.notIn]: advertiserExclus
                    }
                }],
                [Op.or]: [
                    /*{
                                        campaign_start_date: {
                                            [Op.between]:[dateNow, date5Days]
                                        }
                                    },*/
                    {
                        campaign_end_date: {
                            [Op.between]: [dateNow, date5Days]
                        }
                    }
                ]

            },
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['campaign_start_date', 'ASC']
            ],
            include: [{
                model: ModelAdvertisers
            }]
        });

        // Affiche les campagnes en ligne
        data.campaigns_online = await ModelCampaigns.findAll({
            where: {
                [Op.and]: [{
                    advertiser_id: {
                        [Op.notIn]: advertiserExclus
                    }
                }],
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
            order: [
                ['campaign_end_date', 'ASC']
            ],
            include: [{
                model: ModelAdvertisers
            }]
        });

        data.moment = moment;

        /*console.log('dateNow :', dateNow)
        console.log('dateTomorrow :', dateTomorrow)
        console.log('date5Days :', date5Days, ' - ', data.campaigns_nextdays.length)*/

        res.render('manager/campaigns/index.ejs', data);
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
            include: [{
                model: ModelAdvertisers
            }, {
                model: ModelInsertions
            }]
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
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.export = async (req, res) => {
    try {

        var type = 'campaigns'
        // crée label avec le date du jour ex : 20210403
        const date = new Date();
        const JJ = ('0' + (
            date.getDate()
        )).slice(-2);

        const MM = ('0' + (
            date.getMonth()
        )).slice(-2);
        const AAAA = date.getFullYear();

        const label_now = AAAA + MM + JJ;
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
            include: [{
                model: ModelAdvertisers
            }, {
                model: ModelInsertions
            }]
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['campaign_id', 'DESC']
            ]
        });
        data.moment = moment;

        const styles = {
            headerDark: {
                fill: {
                    fgColor: {
                        rgb: 'FF000000'
                    }

                },

                font: {
                    color: {
                        rgb: 'FFFFFFFF'
                    },
                    sz: 14,
                    bold: false,
                    underline: false
                }
            },
            cellNone: {

                numFmt: "0",

            },

            cellTc: {
                numFmt: "0",

            }
        };

        const heading = [
            [],
        ];

        const bilan_global = {

            id: { // <- the key should match the actual data key
                displayName: '#', // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                width: 100, // <- width in pixels
                cellStyle: styles.cellNone,
            },
            annonceurs: {
                displayName: 'ANNONCEURS',
                headerStyle: styles.headerDark,
                width: 300, // <- width in chars (when the number is passed as string)
                cellStyle: styles.cellNone,

            },
            noms: {
                displayName: 'NOMS',
                headerStyle: styles.headerDark,
                width: 450, // <- width in chars (when the number is passed as string)
                cellStyle: styles.cellNone,

            },
            archives: {
                displayName: 'ARCHIVES',
                headerStyle: styles.headerDark,
                cellFormat: function (value, row) { // <- Renderer function, you can access also any row.property
                    return (value == 1) ? 'Archivé' : '-';
                },
                width: 100, // <- width in pixels
                cellStyle: styles.cellNone,

            },
            maj: {
                displayName: 'DERNIERE MAJ',
                headerStyle: styles.headerDark,
                width: 200, // <- width in pixels
                cellStyle: styles.cellNone
            }
        };

        const dataset_global = []

        if (!Utilities.empty(data)) {
            for (i = 0; i < data.campaigns.length; i++) {

                dataset_global.push({
                    id: data.campaigns[i].campaign_id,
                    annonceurs: data.campaigns[i].advertiser.advertiser_name,
                    noms: data.campaigns[i].campaign_name,
                    archives: data.campaigns[i].campaign_archived,
                    maj: data.campaigns[i].updated_at,
                });

            }
        }

        const merges = [{
            start: {
                row: 1,
                column: 1
            },
            end: {
                row: 1,
                column: 5
            }
        }];

        // Create the excel report. This function will return Buffer
        const report = excel.buildExport([{ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
            name: 'Listes', // <- Specify sheet name (optional)
            heading: heading, // <- Raw heading array (optional)
            merges: merges, // <- Merge cell ranges
            specification: bilan_global, // <- Report specification
            data: dataset_global // <-- Report data
        }]);

        // You can then return this straight
        // rapport_antennesb-202105031152-ESPACE_DECO-67590.xls
        res.attachment(
            'exports-' + type + '-' + label_now + '.xlsx',

        ); // This is sails.js specific (in general you need to set headers)

        return res.send(report);

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

        var insertionsIds = new Array();
        data.insertions = new Array();
        data.creatives = new Array();
        data.epilot_insertions = new Array();
        data.commercial = new Array();


        var campaign_id = req.params.id;
        var campaign = await ModelCampaigns
            .findOne({
                where: {
                    campaign_id: campaign_id
                },
                include: [{
                    model: ModelAdvertisers
                }, {
                    model: ModelAgencies
                }, {
                    model: ModelInsertions
                }]
            })
            .then(async function (campaign) {
                // console.log(campaign)
                if (!campaign) {
                    return res.redirect(`/extension-chrome/campaign?campaign_id=${campaign_id}`)
                    /*  return res
                          .status(404)
                          .render("manager/error.ejs", {
                              statusCoded: 404
                          });*/
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
                    where: {
                        campaign_id: campaign_id
                    }
                });

                // Teste si epilot_campaign existe
                if (!Utilities.empty(epilot_campaign)) {
                    //  console.log(epilot_campaign.user_id)

                    data.commercial = await ModelUsers.findOne({
                        attributes: ['user_id', 'user_email', 'user_firstname'],
                        where: {
                            user_id: epilot_campaign.user_id
                        }
                    })


                    data.epilot_campaign = epilot_campaign;

                    // Récupére les données des insertions epilot
                    var epilot_insertions = await ModelEpilotInsertions.findAll({
                        where: {
                            epilot_campaign_id: epilot_campaign.epilot_campaign_id
                        },
                        include: [{
                            model: ModelFormatsGroups
                        }]
                    });

                    if (!Utilities.empty(epilot_insertions)) {
                        data.epilot_insertions = epilot_insertions;
                    } else {
                        data.epilot_insertions = '';
                    }

                } else {
                    data.epilot_campaign = '';
                }

                // Récupére les données des insertions de la campagne
                var insertionList = await ModelInsertions
                    .findAll({
                        where: {
                            campaign_id: campaign_id
                        },
                        include: [{
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
                        }]
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
                                        attributes: [
                                            "creative_url", "creative_mime_type", "creative_click_url"
                                        ],
                                        where: {
                                            insertion_id: insertionsIds
                                        },
                                        group: ["creative_url", "creative_mime_type", "creative_click_url"]
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

                // console.log(data)
                res.render('manager/campaigns/view.ejs', data);
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
                where: {
                    advertiser_archived: 0
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
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
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
                message: 'Le nombre de caractère est limité à 50'
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
                            message: 'La campagne a été créée dans SMARTADSERVEUR'
                        }
                        return res.redirect('/manager/campaigns/create');
                    }

                } else {
                    req.session.message = {
                        type: 'danger',
                        intro: 'Erreur',
                        message: 'La campagne a été déjà utilisée'
                    }
                    return res.redirect('/manager/advertisers/create');
                }

            })

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.repartitions = async (req, res) => {
    // Répartitions instreams
    try {
        const data = new Object();

        // Affiche les campagnes se terminant aujourd'hui
        /*
    var dateLastMonday = moment().weekday(-7).format('YYYY-MM-DD'); // moment().add(1, 'days').format('YYYY-MM-DD');
    var dateLastSunday = moment().weekday(-1).format('YYYY-MM-DD');

    console.log('dateLastMonday : ',dateLastMonday);
    console.log('dateLastSunday : ',dateLastSunday);
*/

        var dateLastMonday = "2022-01-08";
        var dateLastSunday = "2040-12-31";

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
            417716,
            464149,
            421871
        );

        var campaigns = await ModelCampaigns
            .findAll({
                where: {
                    [Op.and]: [{
                        campaign_name: {
                            [Op.notLike]: '% PARR %'
                        }
                    }],
                    [Op.or]: [{
                        campaign_start_date: {
                            [Op.between]: [dateLastMonday, dateLastSunday]
                        }
                    }, {
                        campaign_end_date: {
                            [Op.between]: [dateLastMonday, dateLastSunday]
                        }
                    }]
                },
                order: [
                    ['campaign_start_date', 'ASC']
                ],
                include: [{
                    model: ModelAdvertisers,
                    where: {
                        [Op.and]: [{
                            advertiser_id: {
                                [Op.notIn]: advertiserExclus
                            }
                        }]
                    }
                }]
            })
            .then(async function (campaigns) {
                if (!campaigns) {
                    return res
                        .status(404)
                        .render("manager/error.ejs", {
                            statusCoded: 404
                        });
                }

                // Créer le fil d'ariane
                breadcrumb = new Array({
                    'name': 'Campagnes',
                    'link': 'campaigns'
                }, {
                    'name': 'Répartitions des instreams',
                    'link': ''
                });
                data.breadcrumb = breadcrumb;

                // Attribue les données de la campagne
                data.campaigns = campaigns;
                //console.log(campaigns)
                data.moment = moment;
                data.utilities = Utilities;

                res.render('manager/campaigns/repartitions.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        // res.render("manager/error.ejs", {statusCoded: statusCoded});
    }

}

exports.email = async (req, res) => {
    const campaign_id = req.params.campaign
    const user_id = req.params.user

    //console.log(campaign_id)
    // console.log(email)

    await ModelCampaigns
        .findOne({
            attributes: ['campaign_id', 'campaign_name', 'campaign_crypt'],
            where: {
                campaign_id: campaign_id
            },

        })
        .then(async function (campaign) {

            var commercial = await ModelUsers.findOne({
                attributes: ['user_id', 'user_email', 'user_firstname'],
                where: {
                    user_id: user_id
                }
            })

            //  console.log(commercial.user_firstname)

            const user_firstname = await commercial.user_firstname
            const campaign_name = await campaign.campaign_name
            const campaign_crypt = await campaign.campaign_crypt
            const email = await commercial.user_email;
            //const email = "oceane.sautron@antennereunion.fr"


            console.log(user_firstname +'-'+  campaign_name  +'-'+campaign_crypt+'-'+email)


            nodeoutlook.sendEmail({

                auth: {
                    user: "oceane.sautron@antennereunion.fr",
                    pass: process.env.EMAIL_PASS
                },
                from: email,
                to: 'adtraffic@antennereunion.fr,oceane.sautron@antennereunion.fr',
                subject: 'Envoie du permalien de la campagne ' + campaign_name,
                html: ' <head><style>font-family: Century Gothic;    font-size: large; </style></head>Bonjour ' +
                    user_firstname + '<br><br>  Tu trouveras ci-dessous le permalien pour la campagne <b>"' +
                    campaign_name + '"</b> : <a traget="_blank" href="https://reporting.antennesb.fr/r/' +
                    campaign_crypt + '">https://reporting.antennesb.fr/r/' +
                    campaign_crypt + '</a> <br><br> À dispo pour échanger <br><br> <div style="font-size: 11pt;font-family: Calibri,sans-serif;"><img src="https://reporting.antennesb.fr/public/admin/photos/logo.png" width="79px" height="48px"><br><br><p><strong>L\'équipe Adtraffic</strong><br><small>Antenne Solutions Business<br><br> 2 rue Emile Hugot - Technopole de La Réunion<br> 97490 Sainte-Clotilde<br> Fixe : 0262 48 47 54<br> Fax : 0262 48 28 01 <br> Mobile : 0692 05 15 90<br> <a href="mailto:adtraffic@antennereunion.fr">adtraffic@antennereunion.fr</a></small></p></div>',

                onError: (e) => console.log(e),
                onSuccess: (i) => {
                    return res.json(`Le permalien est envoyé`)
                }

            })

        })

}