// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);

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

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const Utilities = require('../functions/functions.utilities');


// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelFormatsSites = require("../models/models.formats_sites");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelSites = require("../models/models.sites");
const ModelPacksSites = require('../models/models.packs_sites');
const ModelCreatives = require("../models/models.creatives");
const {promiseImpl} = require('ejs');

exports.index = async (req, res) => {
    try {
        // Liste tous les sites
        const data = new Object();
        data.breadcrumb = "Sites";
        data.sites = await ModelSites.findAll({
            include: [
                {
                    model:ModelPacksSites
                }
            ]
        });
        
        data.moment = moment;
        res.render('manager/sites/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.list = async (req, res) => {
    try {
         // Liste toutes les sites & applis
        const data = new Object();
      
        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Liste des sites',
            'link': ''
        } );
        data.breadcrumb = breadcrumb;

        data.sites = await ModelSites.findAll({
            include: [
                {
                    model: ModelPacksSites
                }
            ]
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['site_name', 'ASC']
            ]
        });

        data.moment = moment;
        res.render('manager/sites/list.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.view = async (req, res) => {
    
    try {
        const data = new Object();
       
        var site_id = req.params.id;
        var site = await ModelSites
            .findOne({
                where: {
                    site_id: site_id
                },
                include: [
                    {
                        model: ModelPacksSites
                    }
                ]
            }) 
            .then(async function (site) {
                if (!site) 
                    return res
                        .status(404)
                        .render("manager/error.ejs", {statusCoded: 404});
               
                 // Créer le fil d'ariane
                breadcrumb = new Array({
                    'name': 'Liste des sites',
                    'link': 'sites/list'
                }, {
                    'name': site.site_name,
                    'link': ''
                } );
                data.breadcrumb = breadcrumb;

                data.site = site;
                data.moment = moment;

                 // Affiche les sites en fonction du format
                data.formats_sites = await ModelFormatsSites.findAll({
                    where: {
                        site_id: site.site_id
                    },
                    include: [
                        {
                            model: ModelFormats
                        },
                        {
                            model: ModelSites
                        }
                    ]
                });

                

                data.utilities = Utilities
                


                res.render('manager/sites/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}
