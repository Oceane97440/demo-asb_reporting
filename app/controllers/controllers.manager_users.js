// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);
const excel = require('node-excel-export');

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

// Initialise les models
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelEpilotCampaigns = require("../models/models.epilot_campaigns");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const ModelUsers = require("../models/models.users");
const ModelRolesUsers = require("../models/models.roles_users");
const ModelRoles = require("../models/models.roles");

exports.index = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();
        data.users = await ModelUsers.findAll();
        data.metas.title = 'Utilisateurs';
        data.breadcrumb = "Utilisateurs";
        data.moment = moment;

        res.render('manager/users/index.ejs', data);
    } catch (error) {
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
        data.breadcrumb = "Liste des utilisateurs";

        var userList = await ModelUsers.findAll({
            include: [{
                    model: ModelRolesUsers
                }
                /*,
                                {
                                    model: ModelRoles
                                }*/
            ]
        });
        data.users = userList;

        // Créer le fil d'ariane
        var breadcrumbLink = 'users'
        breadcrumb = new Array({
            'name': 'Utilisateurs',
            'link': 'users'
        });
        data.breadcrumb = breadcrumb;

        data.moment = moment;
        res.render('manager/users/list.ejs', data);
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
        var type = 'users'
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

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Utilisateurs',
            'link': 'users'
        });
        data.breadcrumb = breadcrumb;


        data.users = await ModelUsers.findAll({
            include: [{
                    model: ModelRolesUsers
                }

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
            email: {
                displayName: 'EMAIL',
                headerStyle: styles.headerDark,
                width: 300, // <- width in chars (when the number is passed as string)
                cellStyle: styles.cellNone,

            },
            prenoms: {
                displayName: 'PRENOMS',
                headerStyle: styles.headerDark,
                width: 450, // <- width in chars (when the number is passed as string)
                cellStyle: styles.cellNone,

            },
            noms: { // <- the key should match the actual data key
                displayName: 'NOMS', // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                width: 100, // <- width in pixels
                cellStyle: styles.cellNone,
            },
            initials: { // <- the key should match the actual data key
                displayName: 'INITIAL', // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                width: 100, // <- width in pixels
                cellStyle: styles.cellNone,
            },
            roles: {
                displayName: 'ROLES',
                headerStyle: styles.headerDark,
                cellFormat: function (value, row) { // <- Renderer function, you can access also any row.property
                    return (value == 1) ? 'Admins' : 'Utilisateurs';
                },
                width: 100, // <- width in pixels
                cellStyle: styles.cellNone,

            },
            nbr_connexion: {
                displayName: 'NOMBRES DE CONNEXION',
                headerStyle: styles.headerDark,
                width: 200, // <- width in pixels
                cellStyle: styles.cellNone,

            },
            maj: {
                displayName: 'DERNIERE MAJ',
                headerStyle: styles.headerDark,
                width: 200, // <- width in pixels
                cellStyle: styles.cellNone,

            }


        };



        const dataset_global = []


        if (!Utilities.empty(data)) {
            for (i = 0; i < data.users.length; i++) {

                dataset_global.push({
                    id: data.users[i].user_id,
                    email: data.users[i].user_email,
                    prenoms: data.users[i].user_firstname,
                    noms: data.users[i].user_lastname,
                    initials: data.users[i].user_initial,
                    roles: data.users[i].user_role,
                    nbr_connexion: data.users[i].user_log,
                    maj: data.users[i].updated_at,



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


exports.create = async (req, res) => {
    try {} catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.edit = async (req, res) => {
    try {

        res.render("manager/users/create.ejs");

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

        /*
        data.breadcrumb = "Liste des utilisateurs";

        const data = new Object();
        var userList = await ModelUsers.findOne({
            include: [
                {
                    model: ModelRolesUsers
                },
                {
                    model: ModelRoles
                }
            ]
        });
        data.users = userList;

        data.moment = moment;
        */

        const data = new Object();
        data.moment = moment;
        data.breadcrumb = "Utilisateurs";
        var insertionsIds = new Array();

        var user_id = req.params.id;
        var user = await ModelUsers
            .findOne({
                where: {
                    user_id: user_id
                }
            })
            .then(async function (user) {
                if (!user) {
                    return res
                        .status(404)
                        .render("manager/error.ejs", {
                            statusCoded: 404
                        });
                }
                data.user = user;
                console.log(user)

                // Créer le fil d'ariane
                var breadcrumbLink = 'users'
                breadcrumb = new Array({
                    'name': 'Utilisateurs',
                    'link': 'users'
                }, {
                    'name': user.user_firstname + ' ' + user.user_lastname,
                    'link': ''
                });
                data.breadcrumb = breadcrumb;

                data.campaigns = await ModelEpilotCampaigns.findAll({
                    where: {
                        user_id: user_id
                    },
                    include: [{
                            model: ModelAdvertisers
                        },
                        {
                            model: ModelCampaigns
                        },
                        {
                            model: ModelUsers
                        }
                    ]
                }, {
                    order: [
                        // Will escape title and validate DESC against a list of valid direction
                        // parameters
                        ['campaign_id', 'DESC']
                    ]
                });

                console.log(data.campaigns)

                /*
               // Récupére les données des insertions de la campagne
               var insertionList = await ModelInsertions.findAll({
                    where: {
                        user_id: user_id
                    },
                    include: [
                        { model: Modelusers, attributes: ['user_id', 'user_name'] },
                        { model: ModelFormats, attributes: ['format_id', 'format_name'] },
                        { model: ModelInsertionsPriorities, attributes: ['priority_id', 'priority_name'] },
                        { model: ModelInsertionsStatus, attributes: ['insertion_status_id', 'insertion_status_name'] },
                    ]
                }) .then(async function (insertionList) {
                    if (!Utilities.empty(insertionList) && (insertionList.length > 0)) {

                        data.insertions = insertionList;
                        for(i = 0; i < insertionList.length; i++) {
                           insertionsIds.push(insertionList[i].insertion_id);
                            //  console.log(i,' : ',insertionList[i].insertion_id);
                        }

                    }
                });

                // Attribue les données de la campagne

                data.creatives = false;
                data.user = user;
                data.moment = moment;
                */
                data.utilities = Utilities;
                data.moment = moment;
                res.render('manager/users/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}