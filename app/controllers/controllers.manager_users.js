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
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.list = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();
        data.breadcrumb = "Liste des utilisateurs";

        var userList = await ModelUsers.findAll();
        data.users = userList;
        console.log(userList)
        data.moment = moment;
        res.render('manager/users/list.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.create = async (req, res) => {
    try {} catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.edit = async (req, res) => {
    try { 
        
        res.render("manager/users/create.ejs");


} catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.view = async (req, res) => {
    try {} catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}
