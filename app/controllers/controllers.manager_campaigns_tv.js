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