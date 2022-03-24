const {
    Op
} = require("sequelize");

// const excel = require('node-excel-export');
process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

const {
    QueryTypes
} = require('sequelize');

var axios = require('axios');
const fs = require('fs')
const moment = require('moment');

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const Utilities = require('../functions/functions.utilities');
const SmartFunction = require("../functions/functions.smartadserver.api");

// Initialise les models
const ModelFormat = require("../models/models.formats");
const ModelCountry = require("../models/models.countries")
const ModelPack = require("../models/models.packs")
const ModelCampaigns = require("../models/models.campaigns");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelInsertions = require("../models/models.insertions");
const ModelSites = require("../models/models.sites");
const ModelTemplates = require("../models/models.templates");
const ModelEpilotCampaigns =  require("../models/models.epilot_campaigns");
const ModelFormatsGroupsTypes = require(
    "../models/models.formats_groups_types"
);
const ModelFormatsGroups = require("../models/models.formats_groups");
const ModelPlatforms = require("../models/models.platforms");

exports.advertisers = async (req, res) => {
    try {        
        var advertisers = await ModelAdvertisers.findAll();
        return res.json(advertisers);
    } catch (error) {
        return res.json({
            type: 'error',
            message: 'Les annonceurs n\existent pas.'
        });
    }
}

exports.campaigns = async (req, res) => {
    try {        
        var campaigns = await ModelCampaigns.findAll();
        return res.json(campaigns);
    } catch (error) {
        return res.json({
            type: 'error',
            message: 'Les campagnes n\existent pas.'
        });
    }
}

exports.insertions = async (req, res) => {
    try {        
        var insertions = await ModelInsertions.findAll();
        return res.json(insertions);
    } catch (error) {
        return res.json({
            type: 'error',
            message: 'Les insertions n\existent pas.'
        });
    }
}

exports.formats = async (req, res) => {
    try {        
        var formats = await ModelFormat.findAll();
        return res.json(formats);
    } catch (error) {
        return res.json({
            type: 'error',
            message: 'Les formats n\existent pas.'
        });
    }
}

exports.templates = async (req, res) => {
    try {        
        var templates = await ModelTemplates.findAll();
        return res.json(templates);
    } catch (error) {
        return res.json({
            type: 'error',
            message: 'Les templates n\existent pas.'
        });
    }
}

exports.sites = async (req, res) => {
    try {        
        var sites = await ModelSites.findAll();
        return res.json(sites);
    } catch (error) {
        return res.json({
            type: 'error',
            message: 'Les sites n\existent pas.'
        });
    }
}

exports.platforms = async (req, res) => {
    try {        
        var platforms = await ModelPlatforms.findAll();
        return res.json(platforms);
    } catch (error) {
        return res.json({
            type: 'error',
            message: 'Les platformes n\existent pas.'
        });
    }
}

exports.folder = async (req, res) => {
    try {        
         var dirDateNOW = moment().format('YYYY/MM/DD');
		  // Créer un dossier si celui-ci n'existe pas
        fs.mkdir('data/tv/' + dirDateNOW + '/', {
            recursive: true

        }, (err) => {
            if (err)
                throw err;
        });

        return res.json(
			{message:dirDateNOW
			}
		);
		
    } catch (error) {
        return res.json({
            type: 'error',
            message: 'Les platformes n\existent pas.'
        });
    }
}