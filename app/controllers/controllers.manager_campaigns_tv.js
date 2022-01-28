const {
    Op,
    and
} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});
var crypto = require('crypto');

const {
    QueryTypes
} = require('sequelize');
const moment = require('moment');
moment.locale('fr');
const path = require('path');
const {
    check,
    query
} = require('express-validator');
const fs = require('fs');

// Module ExcelJS
const ExcelJS = require('exceljs');
const excel = require('node-excel-export');

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const SmartFunction = require("../functions/functions.smartadserver.api");
const Utilities = require('../functions/functions.utilities');

// Initialise les models
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelFormats = require("../models/models.formats");
const ModelSites = require("../models/models.sites");
const ModelCampaignsTv = require("../models/models.campaigns_tv")
const ModelAdvertisersTV = require("../models/models.advertisers_tv")



var LocalStorage = require('node-localstorage').LocalStorage;
localStorageTV = new LocalStorage('data/tv/reporting');

exports.list = async (req, res) => {
    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'insertions'
        }, {
            'name': 'Liste des planmedia',
            'link': '/manager/campaigns/tv/list'
        }, {
            'name': 'Ajouter un planmedia',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        var dirDateNOW = moment().format('YYYY/MM/DD');
        data.moment = moment;

        // Créer un dossier si celui-ci n'existe pas
        fs.mkdir('data/tv/' + dirDateNOW + '/', {
            recursive: true

        }, (err) => {
            if (err)
                throw err;
        });

        // // Récupére l'ensemble des annonceurs
        await ModelCampaignsTv
            .findAll({
                order: [
                    ['campaign_tv_name', 'ASC']
                ],
                include: [{
                    model: ModelAdvertisersTV
                }]
            })
            .then(async function (campaignsTv) {
                data.campaignsTv = campaignsTv;
            });


        console.log(data.campaignsTv)


        res.render('report-tv/create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.edit = async (req, res) => {

    var campaign_tv_id = req.params.campaigntv
    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'insertions'
        }, {
            'name': 'Liste des planmedia',
            'link': '/manager/campaigns/tv/list'
        }, {
            'name': 'Ajouter un planmedia',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        var dirDateNOW = moment().format('YYYY/MM/DD');
        data.moment = moment;


        // // Récupére l'ensemble des annonceurs
        await ModelCampaignsTv
            .findOne({
                where: {
                    campaign_tv_id: campaign_tv_id
                },
                include: [{
                    model: ModelAdvertisersTV
                }]
            })
            .then(async function (campaignsTv) {
                data.campaignsTv = campaignsTv;
            });


        console.log(data.campaignsTv)


        res.render('report-tv/edit.ejs', data);

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.update = async (req, res) => {

    var campaign_tv_id = req.params.campaigntv


    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'insertions'
        }, {
            'name': 'Liste des planmedia',
            'link': '/manager/campaigns/tv/list'
        }, {
            'name': 'Ajouter un planmedia',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        const campaign_tv_name = req.body.campaign_tv_name;
        const file = req.files.planmedia_file;

        console.log(req.files)
        console.log(req.body)

        data.moment = moment;


        // // Récupére l'ensemble des annonceurs
        await ModelCampaignsTv
            .findOne({
                where: {
                    campaign_tv_id: campaign_tv_id
                },
                include: [{
                    model: ModelAdvertisersTV
                }]
            })
            .then(async function (campaignsTv) {

                var dirDateNOW = moment().format('YYYY/MM/DD');


                if ((file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/octet-stream') || (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {

                    var dirDateNOW = moment().format('YYYY/MM/DD');


                    // Déplace le fichier de l'upload vers le dossier
                    file.mv('data/tv/' + dirDateNOW + '/' + file.name, async err => {
                        if (err) {
                            req.session.message = {
                                type: 'danger',
                                intro: 'Erreur',
                                message: 'Un problème est survenu lors de la création du dossier'
                            }
                            return res.redirect('/manager/campaigns/tv/list');


                        }


                        var path_file = 'data/tv/' + dirDateNOW + '/' + file.name
                        console.log(path_file)

                        await ModelCampaignsTv.update({
                            campaign_tv_name: campaign_tv_name,
                            campaign_tv_file: path_file
                        }, {
                            where: {
                                campaign_tv_id: campaign_tv_id
                            }
                        }).then(res.redirect('/manager/campaigns/tv/list'))
                    })



                }


            });





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

        var type = 'campaigns_tv'
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
            'name': 'Liste les campagnes TV',
            'link': 'campaigns/tv'
        });
        data.breadcrumb = breadcrumb;
      
        // Récupére l'ensemble des annonceurs
         data.campaigns = await ModelCampaignsTv
            .findAll({
                order: [
                    ['campaign_tv_name', 'ASC']
                ],
                  include: [
                {
                    model: ModelAdvertisersTV
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
           
                campagnes: {
                    displayName: 'NOMS',
                    headerStyle: styles.headerDark,
                    width: 450, // <- width in chars (when the number is passed as string)
                    cellStyle: styles.cellNone,
    
                },
                campaign_tv_crypt: {
                    displayName: 'ID CRYPTAGE',
                    headerStyle: styles.headerDark,
                    width: 450, // <- width in chars (when the number is passed as string)
                    cellStyle: styles.cellNone,
    
                },
                advertisers_tv: {
                    displayName: 'ANNONCEURS',
                    headerStyle: styles.headerDark,
                    width: 450, // <- width in chars (when the number is passed as string)
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
                campaign_tv_user: {
                    displayName: 'UTILISATEURS',
                    headerStyle: styles.headerDark,
                    width: 200, // <- width in pixels
                    cellStyle: styles.cellNone,
    
                },
                campaign_tv_type: {
                    displayName: 'LES CIBLES',
                    headerStyle: styles.headerDark,
                    width: 200, // <- width in pixels
                    cellStyle: styles.cellNone,
    
                },
                budget: {
                    displayName: 'BUDGET',
                    headerStyle: styles.headerDark,
                    width: 100, // <- width in pixels
                    cellStyle: styles.cellNone,
    
                },
           
                campaign_tv_file: {
                    displayName: 'URLS FICHIERS',
                    headerStyle: styles.headerDark,
                    width: 300, // <- width in pixels
                    cellStyle: styles.cellNone,
    
                },
            };
    
    
    
            const dataset_global = []

    
            if (!Utilities.empty(data)) {
                for (i = 0; i < data.campaigns.length; i++) {
    
                    dataset_global.push({
                        id: data.campaigns[i].campaign_tv_id,
                        campagnes: data.campaigns[i].campaign_tv_name,
                        campaign_tv_crypt: data.campaigns[i].campaign_tv_crypt,
                        advertisers_tv: data.campaigns[i].advertisers_tv.advertiser_tv_name,
                        date_start: data.campaigns[i].campaign_tv_start_date,
                        date_end: data.campaigns[i].campaign_tv_end_date,
                        campaign_tv_user: data.campaigns[i].campaign_tv_user,
                        campaign_tv_type: data.campaigns[i].campaign_tv_type,
                        budget: data.campaigns[i].campaign_tv_budget,
                        campaign_tv_file: data.campaigns[i].campaign_tv_file,



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
