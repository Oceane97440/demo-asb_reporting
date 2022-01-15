// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require('axios');
const excel = require('node-excel-export');

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
const ModelGamCampaigns = require("../models/models.campaigns_gam");

const ModelEpilotInsertions = require("../models/models.epilot_insertions");
const ModelUsers = require("../models/models.users");

const {
    promiseImpl
} = require('ejs');
const {
    insertions
} = require('./controllers.automate');

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
            'name': 'Liste les campagnes Google Ad Manager',
            'link': 'campaigns/gam'
        });
        data.breadcrumb = breadcrumb;

        // Récupére l'ensemble des annonceurs
        var campaigns = await ModelGamCampaigns
            .findAll({
                order: [
                    ['campaign_admanager_name', 'ASC']
                ],
                include: [{
                    model: ModelCampaigns
                }]
            })
            .then(async function (campaigns) {
                data.campaigns = campaigns;
            });

        res.render('manager/gam/list.ejs', data);
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

        var type = 'campaigns_gam'
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
            'name': 'Liste les campagnes Google Admanager',
            'link': 'campaigns/gam'
        });
        data.breadcrumb = breadcrumb;

        // Récupére l'ensemble des annonceurs
        data.campaigns = await ModelGamCampaigns
            .findAll({
                order: [
                    ['campaign_admanager_name', 'ASC']
                ],
                include: [{
                    model: ModelCampaigns
                }]
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
                numFmt: "0"
            },
            cellTc: {
                numFmt: "0"
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
            advertisers: {
                displayName: 'Annonceur',
                headerStyle: styles.headerDark,
                width: 450, // <- width in chars (when the number is passed as string)
                cellStyle: styles.cellNone,
            },
            campaigns: {
                displayName: 'Campagne',
                headerStyle: styles.headerDark,
                width: 450, // <- width in chars (when the number is passed as string)
                cellStyle: styles.cellNone,
            },
            date_start: {
                displayName: 'Date de début',
                headerStyle: styles.headerDark,
                width: 200, // <- width in pixels
                cellStyle: styles.cellNone,
            },
            date_end: {
                displayName: 'Date de fin',
                headerStyle: styles.headerDark,
                width: 200, // <- width in pixels
                cellStyle: styles.cellNone,
            },
            status: {
                displayName: 'Status',
                headerStyle: styles.headerDark,
                width: 100, // <- width in pixels
                cellStyle: styles.cellNone
            },
        };

        const dataset_global = []

        if (!Utilities.empty(data)) {
            for (i = 0; i < data.campaigns.length; i++) {

                dataset_global.push({
                    id: data.campaigns[i].campaign_admanager_id,
                    advertisers: data.campaigns[i].advertiser_admanager_id,
                    campaigns: data.campaigns[i].campaign_admanager_name,
                    date_start: data.campaigns[i].campaign_admanager_start_date,
                    date_end: data.campaigns[i].campaign_admanager_end_date,
                    status: data.campaigns[i].campaign_admanager_status
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