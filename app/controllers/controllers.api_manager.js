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

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');

// Initialise les models const ModelSite = require("../models/models.sites");
const ModelFormats = require("../models/models.formats");
// const ModelCountries = require("../models/models.countries") const
// ModelCampaignsEpilot = require("../models/models.campaings_epilot") const
// ModelPacks = require("../models/models.packs") 
// const ModelPacksSites = require("../models/models.packs_sites")
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");



exports.advertiser_liste = async (req, res) => {

    //liste dans une vue tous les annonceurs
    try {

        if (req.session.user.role === 1) {
            var advertisers = await ModelAdvertisers.findAll({
                attributes: [
                    'advertiser_id', 'advertiser_name'
                ],
                order: [
                    ['advertiser_name', 'ASC']
                ]
            });

            res.render('manage/list_advertisers.ejs', {
                advertisers: advertisers
            });
        }


    } catch (error) {
        // console.log(error)
        var statusCoded = error.response.status;
        res.render("error_log.ejs", {
            statusCoded: statusCoded
        });
    }

}


exports.view_campagne = async (req, res) => {

    //affiche dans une vue les campagnes liée à annnonceur id
    try {
        if (req.session.user.role === 1) {
            var advertiser_id = req.params.id;
            var campaign = await ModelCampaigns.findAll({
                attributes: [
                    'campaign_id', 'campaign_name', 'advertiser_id', 'campaign_start_date', 'campaign_end_date'
                ],
                where: {
                    //id_users: userId,
                    advertiser_id: req.params.id
                },
                include: [{
                    model: ModelAdvertisers
                }]
            });

            res.render('manage/view_campagnes.ejs', {
                campaign: campaign,
                advertiser_id: advertiser_id
            });
        }
    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("error_log.ejs", {
            statusCoded: statusCoded
        });
    }

}

exports.campagne_json = async (req, res) => {
    //renvoie du json les info campagnes
    try {
        ModelCampaigns
            .findOne({
                where: {
                    campaign_id: req.params.id
                }
            })
            .then(campagnes => {
                res.json(campagnes)
            })
    } catch (error) {
        console.log(error)
        var statusCoded = error.response.status;
        res.render("error_log.ejs", {
            statusCoded: statusCoded
        });
    }
}