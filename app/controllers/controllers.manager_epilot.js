// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require('axios');
const excel = require('node-excel-export');

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

const {promiseImpl} = require('ejs');
const {insertions} = require('./controllers.automate');

exports.list = async (req, res) => {
    try {
        const data = new Object();
        data.moment = moment;
        data.utilities = Utilities;

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Liste les campagnes EPILOT',
            'link': 'campaigns/epilot'
        });
        data.breadcrumb = breadcrumb;
      
        // Récupére l'ensemble des annonceurs
        var campaigns = await ModelEpilotCampaigns
            .findAll({
                order: [
                    ['epilot_campaign_name', 'ASC']
                ],
                  include: [
                {
                    model: ModelAdvertisers
                },
                {
                    model: ModelCampaigns
                }, {
                    model: ModelUsers
                }
                ]
            })
            .then(async function (campaigns) {
                data.campaigns = campaigns;              
            });
 

       res.render('manager/epilot/list.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}
exports.export = async (req, res) => {
    try {

        var type = 'campaigns_epilot'
        // crée label avec le date du jour ex : 20210403
        const date = new Date();
        const JJ = ('0' + (
            date.getDate()
        )).slice(-2);

        const MM = ('0' + (
            date.getMonth()
        )).slice(-2);
        const AAAA = date.getFullYear();

        const label_now = AAAA + MM + JJ

        const data = new Object();
        data.moment = moment;
        data.utilities = Utilities;

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Liste les campagnes EPILOT',
            'link': 'campaigns/epilot'
        });
        data.breadcrumb = breadcrumb;
      
        // Récupére l'ensemble des annonceurs
         data.campaigns = await ModelEpilotCampaigns
            .findAll({
                order: [
                    ['epilot_campaign_name', 'ASC']
                ],
                  include: [
                {
                    model: ModelAdvertisers
                },
                {
                    model: ModelCampaigns
                }, {
                    model: ModelUsers
                }
                ]
            })
       

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
                campagnes: {
                    displayName: 'NOMS',
                    headerStyle: styles.headerDark,
                    width: 450, // <- width in chars (when the number is passed as string)
                    cellStyle: styles.cellNone,
    
                },
                commercial: { // <- the key should match the actual data key
                    displayName: 'COMMERCIAL', // <- Here you specify the column header
                    headerStyle: styles.headerDark, // <- Header style
                    width: 100, // <- width in pixels
                    cellStyle: styles.cellNone,
                },
                nature: { // <- the key should match the actual data key
                    displayName: 'NATURE', // <- Here you specify the column header
                    headerStyle: styles.headerDark, // <- Header style
                    width: 100, // <- width in pixels
                    cellStyle: styles.cellNone,
                },
                status: {
                    displayName: 'STATUS',
                    headerStyle: styles.headerDark,
                    cellFormat: function (value, row) { // <- Renderer function, you can access also any row.property
                        return (value == 1) ? 'Confirmé' : 'Réservé';
                    },
                    width: 100, // <- width in pixels
                    cellStyle: styles.cellNone,
    
                },
                date_start: {
                    displayName: 'DATE DE DEBUT',
                    headerStyle: styles.headerDark,
                    width: 200, // <- width in pixels
                    cellStyle: styles.cellNone,
    
                },
                date_end: {
                    displayName: 'DATE DE FIN',
                    headerStyle: styles.headerDark,
                    width: 200, // <- width in pixels
                    cellStyle: styles.cellNone,
    
                },
                volumes: {
                    displayName: 'VOLUMES',
                    headerStyle: styles.headerDark,
                    width: 200, // <- width in pixels
                    cellStyle: styles.cellNone,
    
                },
                budget: {
                    displayName: 'BUDGETS',
                    headerStyle: styles.headerDark,
                    width: 200, // <- width in pixels
                    cellStyle: styles.cellNone,
    
                },
                cmp: {
                    displayName: 'CMP',
                    headerStyle: styles.headerDark,
                    width: 200, // <- width in pixels
                    cellStyle: styles.cellNone,
    
                },
    
            };
    
    
    
            const dataset_global = []

    
            if (!Utilities.empty(data)) {
                for (i = 0; i < data.campaigns.length; i++) {
    
                    dataset_global.push({
                        id: data.campaigns[i].epilot_campaign_id,
                        annonceurs:data.campaigns[i].epilot_advertiser_name,
                        campagnes: data.campaigns[i].epilot_campaign_name,
                        commercial: data.campaigns[i].epilot_campaign_commercial,
                        nature: data.campaigns[i].epilot_campaign_nature,
                        status: data.campaigns[i].epilot_campaign_status,
                        date_start: data.campaigns[i].epilot_campaign_start_date,
                        date_end: data.campaigns[i].epilot_campaign_end_date,
                        volumes: data.campaigns[i].epilot_campaign_volume,
                        budget: data.campaigns[i].epilot_campaign_budget_net,
                        cmp: data.campaigns[i].epilot_campaign_cpm_net,


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
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}
exports.insertions = async (req, res) => {
    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Liste les campagnes EPILOT',
            'link': 'campaigns/epilot'
        }, {
            'name': 'Liste les insertions EPILOT',
            'link': ''
        });
        data.breadcrumb = breadcrumb;
        
        // Récupére l'ensemble des annonceurs
        var insertions = await ModelEpilotInsertions
            .findAll({
                order: [
                    ['epilot_campaign_name', 'ASC']
                ]
            })
            .then(async function (insertions) {
                data.insertions = insertions;
            });
        
        res.render('manager/epilot/insertions.ejs', data);
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
            'link': 'insertions'
        }, {
            'name': 'Liste les campagnes EPILOT',
            'link': 'campaigns/epilot'
        }, {
            'name': 'Ajouter une campagne EPILOT',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        // Récupére l'ensemble des annonceurs
        var advertisers = await ModelAdvertisers
            .findAll({
                order: [
                    ['advertiser_name', 'ASC']
                ]
            })
            .then(async function (advertisers) {
                data.advertisers = advertisers;
            });

        // Récupére l'ensemble des annonceurs
        var formats = await ModelFormats
            .findAll({
                order: [
                    ['format_name', 'ASC']
                ]
            })
            .then(async function (formats) {
                data.formats = formats;
            });

        res.render('manager/epilot/create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.import = async (req, res) => {
    try {
        const file = req.files.epilot_file;
        var results = new Array();

        // Le fichier doit être un fichier excel ou csv
        if ((file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/octet-stream')) {
            // Créer un dossier s'il n'existe pas (ex: public/uploads/epilot/2021/07/31)
            // dirDate + '/' +
            var dirDateNOW = moment().format('YYYY/MM/DD');
        
            // Créer un dossier si celui-ci n'existe pas
            fs.mkdir('public/uploads/' + dirDateNOW + '/', {
                recursive: true
            }, (err) => {
                if (err) 
                    throw err;
                }
            );

            // Déplace le fichier de l'upload vers le dossier
            await file.mv('public/uploads/' + dirDateNOW + '/' + file.name, err => {
                if (err) 
                    return res
                        .status(500)
                        .send('ERRORRRRRRRRRRRRRR :' + err);
                }
            );

            fs
                .createReadStream('public/uploads/' + dirDateNOW + '/' + file.name)
                .pipe(csv({
                    separator: '\;'
                },))
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    console.log('RESULTATS : ', results.length);
                    
                    // Si le résultat est supérieur à 0
                    if (results.length > 0) {
                    
                        for (i = 0; i < results.length; i++) {
                            if ((results[i]['PAD']) && (results[i]['Nom'])) {
                                // Gére les insertions de la campagne EPILOT console.log('INSERTIONS
                                // :',results[i]); process.exit();
                                if (results[i]['Campagne']) {
                                    var epilot_campaign_name = results[i]['Campagne'];

                                    const regexCampaignCode = /([0-9]{5})/g;
                                    regexCampaignCodeResult = epilot_campaign_name.match(regexCampaignCode);
                                    if (regexCampaignCodeResult.length > 0) {
                                        var epilot_campaign_code = regexCampaignCodeResult[0];
                                    } else {
                                        var epilot_campaign_code = null;
                                    }
                                }

                                var epilot_insertion_name = results[i]['Nom'];

                                if (results[i]['Etat']) {
                                    switch (results[i]['Etat']) {
                                        case 'Confirmée':
                                        case 'Confirmee':
                                            var epilot_insertion_status = 1;
                                            break;
                                        case 'Reservée':
                                        case 'Reservee':
                                            var epilot_insertion_status = 2;
                                            break;
                                        default:
                                            var epilot_insertion_status = 0;
                                            break;
                                    }
                                }

                                var epilot_insertion_volume = results[i]['Volume total prévu'];
                                var epilot_insertion_commercial = results[i]['Responsable commercial'];

                                var epilot_insertion_start_date = moment(
                                    results[i]['Date de début prévue'],
                                    'DD/MM/YYYY'
                                ).format('YYYY-MM-DD');
                                var epilot_insertion_end_date = moment(
                                    results[i]['Date de fin prévue'],
                                    'DD/MM/YYYY'
                                ).format('YYYY-MM-DD');

                                // Charge les données dans la base de donnée
                                var data_insertion = {
                                    'epilot_campaign_name': epilot_campaign_name,
                                    'epilot_campaign_code': epilot_campaign_code,
                                    'epilot_insertion_name': epilot_insertion_name,
                                    'epilot_insertion_status': epilot_insertion_status,
                                    'epilot_insertion_volume': epilot_insertion_volume,
                                    'epilot_insertion_start_date': epilot_insertion_start_date,
                                    'epilot_insertion_end_date': epilot_insertion_end_date,
                                    'epilot_insertion_commercial': epilot_insertion_commercial
                                }

                                 // Ajoute ou MAJ la campagne
                                // EPILOT
                                Utilities
                                    .updateOrCreate(ModelEpilotInsertions, {
                                        epilot_campaign_name: epilot_campaign_name,
                                        epilot_insertion_name: epilot_insertion_name
                                    }, data_insertion)
                                    .then(function (result) {
                                        console.log(' - ',data_insertion['epilot_campaign_name'],' - ',data_insertion['epilot_insertion_name']);
                                        result.item; // the model
                                        //   result.created;  bool, if a new item was created.
                                    });
                                   // console.log(data_insertion); process.exit(1);
                            } else {
                                // Gére les campagnes EPILOT
                                if (results[i]['Campagne']) {
                                    var epilot_campaign_name = results[i]['Campagne'];

                                    const regexCampaignCode = /([0-9]{5})/g;
                                    regexCampaignCodeResult = epilot_campaign_name.match(regexCampaignCode);
                                    if (regexCampaignCodeResult.length > 0) {
                                        var epilot_campaign_code = regexCampaignCodeResult[0];
                                    } else {
                                        var epilot_campaign_code = null;
                                    }
                                }

                                var epilot_advertiser_name = results[i]['Annonceur'];

                                if (results[i]['Etat planning']) {
                                    switch (results[i]['Etat planning']) {
                                        case 'Confirmée':
                                        case 'Confirmee':
                                            var epilot_campaign_status = 1;
                                            break;
                                        case 'Reservée':
                                        case 'Reservee':
                                            var epilot_campaign_status = 2;
                                            break;
                                        default:
                                            var epilot_insertion_status = 0;
                                            break;
                                    }
                                }

                                var epilot_campaign_start_date = moment(results[i]['Début'], 'DD/MM/YYYY').format(
                                    'YYYY-MM-DD 00:00:00'
                                );
                                var epilot_campaign_end_date = moment(results[i]['Fin'], 'DD/MM/YYYY').format(
                                    'YYYY-MM-DD 23:59:00'
                                );

                                var epilot_campaign_volume = results[i]['Volume total prévu'];
                                var epilot_campaign_nature = results[i]['Nature'];

                                var epilot_campaign_budget = results[i]['Net diffusé'];
                                var epilot_campaign_budget_net = epilot_campaign_budget.replace(',', '.');

                                var epilot_campaign_cpm = results[i]['CPM net prévu']
                                var epilot_campaign_cpm_net = epilot_campaign_cpm.replace(',', '.');

                                var epilot_campaign_commercial = results[i]['Responsable commercial'];

                                // Charge les données dans la base de donnée
                                var data_campaign = {
                                    'epilot_campaign_name': epilot_campaign_name,
                                    'epilot_advertiser_name': epilot_advertiser_name,
                                    'epilot_campaign_code': epilot_campaign_code,
                                    'epilot_campaign_status': epilot_campaign_status,
                                    'epilot_campaign_start_date': epilot_campaign_start_date,
                                    'epilot_campaign_end_date': epilot_campaign_end_date,
                                    'epilot_campaign_volume': epilot_campaign_volume,
                                    'epilot_campaign_nature': epilot_campaign_nature,
                                    'epilot_campaign_budget_net': epilot_campaign_budget_net,
                                    'epilot_campaign_cpm_net': epilot_campaign_cpm_net,
                                    'epilot_campaign_commercial': epilot_campaign_commercial
                                }

                                // Ajoute ou MAJ la campagne EPILOT
                                Utilities
                                    .updateOrCreate(ModelEpilotCampaigns, {
                                        epilot_campaign_name: epilot_campaign_name
                                    }, data_campaign)
                                    .then(function (result) {
                                        result.item; // the model
                                        //   result.created;  bool, if a new item was created.
                                    });
                               
                            }
                        }

                        // Envoie du message de confirmation
                        req.session.message = {
                            type: 'info',
                            intro: 'Importation réussie',
                            message: 'L\'importation a été faite : "' + results.length + ' éléments" a' +
                                    'joutés.'
                        }
                        return res.redirect('/manager/campaigns/epilot/create');
                    } else {
                          // Envoie du message de confirmation
                          req.session.message = {
                            type: 'danger',
                            intro: 'Importation échouée',
                            message: 'L\'importation a échoué : "' + results.length + ' éléments" a' +
                                    'joutés.'
                        }
                        return res.redirect('/manager/campaigns/epilot/create');

                    }

                });

        } else {
            req.session.message = {
                type: 'danger',
                intro: 'Erreur',
                message: 'L\'extension du fichier est invalide. '
            }
            return res.redirect('/manager/epilot/create');
        }

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        // res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}