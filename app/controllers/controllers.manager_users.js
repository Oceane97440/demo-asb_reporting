// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);

const {Op} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

const {QueryTypes} = require('sequelize');

const {check, query} = require('express-validator');

const moment = require('moment');

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');

// Initialise les models
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
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
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.list = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();
        data.breadcrumb = "Liste des utilisateurs";

        var userList = await ModelUsers.findAll({
            include: [
                {
                    model: ModelRolesUsers
                }/*,
                {
                    model: ModelRoles
                }*/
            ]
        });
        data.users = userList;

        // Créer le fil d'ariane
        var breadcrumbLink = 'users'
        breadcrumb = new Array({'name': 'Utilisateurs', 'link': 'users'});
        data.breadcrumb = breadcrumb;

        data.moment = moment;
        res.render('manager/users/list.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.create = async (req, res) => {
    try {} catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.edit = async (req, res) => {
    try {

        res.render("manager/users/create.ejs");

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
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
                        .render("manager/error.ejs", {statusCoded: 404});
                }
                data.user = user;

                 // Créer le fil d'ariane
        var breadcrumbLink = 'users'
        breadcrumb = new Array({'name': 'Utilisateurs', 'link': 'users'}, {'name' : user.firstname,'link' : ''});
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
                res.render('manager/users/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}
