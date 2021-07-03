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

// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelAgencies = require("../models/models.agencies");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const {promiseImpl} = require('ejs');

exports.index = async (req, res) => {
    try {
        // Liste tous les agences
        const data = new Object();
        data.breadcrumb = "Agences";
        data.agencies = await ModelAgencies.findAll({
         /*   include: [
                {
                    model: ModelAdvertisers
                }
            ]*/
        });
        data.moment = moment;

        res.render('manager/agencies/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.list = async (req, res) => {
    try {
        // Liste tous les agences
        const data = new Object();
        data.breadcrumb = "Liste les agences";

        data.agencies = await ModelAgencies.findAll({
            include: [
                {
                   model: ModelCampaigns
                }
            ]
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['agency_id', 'DESC']
            ]
        });

        data.moment = moment;        
        res.render('manager/agencies/list.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.view = async (req, res) => {
    try {
        const data = new Object();
        data.breadcrumb = "Agences";

        var agency_id = req.params.id;
        
        var agency = await ModelAgencies
            .findOne({
                where: {
                    agency_id: agency_id
                }/*,
                include: [
                    {
                        model: ModelAdvertisers
                    }
                ]*/
            })
            .then(async function (agency) {
                if (!agency) 
                    return res
                        .status(404)
                        .render("manager/error.ejs", {statusCoded: 404});
                
                // Récupére les données des campaigns
                campaigns = await ModelCampaigns.findAll({
                    where: {
                        agency_id: agency_id
                    },
                    include: [
                        {
                            model: ModelAdvertisers
                        }
                    ]
                });
               
                // Attribue les données de la campagne
                data.campaigns = campaigns; 
                data.agency = agency;
                data.moment = moment;
                res.render('manager/agencies/view.ejs', data);
            });      

    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

/*exports.advertiser_add = async (req, res) => {

  //ajoute dans la bdd les annonceurs

  try {

    if (req.session.user.user_role == 1) {


      var config = {
        method: 'GET',
        url: 'https://manage.smartadserverapis.com/2044/agencies/',
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        auth: {
          username: dbApi.SMART_login,
          password: dbApi.SMART_password
        },

      };
      await axios(config)
        .then(function (res) {

          var data = res.data
          var number_line = data.length

          for (i = 0; i < number_line; i++) {

            var advertiser_id = data[i].id
            var advertiser_name = data[i].name

            const advertiser = ModelAgencies.create({
              advertiser_id,
              advertiser_name,


            })

          }

        })
        res.redirect("/manager/list_agencies")

    }


  }catch (error) {
    console.log(error)
    var statusCoded = error.response.status;

    res.render("error.ejs",{
      statusCoded:statusCoded,

    })
  }


}*/
