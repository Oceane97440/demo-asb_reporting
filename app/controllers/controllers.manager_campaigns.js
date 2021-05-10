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

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');

// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");

exports.index = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();
        data.breadcrumb = "Campagnes";
        data.campaigns = await ModelCampaigns.findAll({
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        res.render('manager/campaigns/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("error.ejs", {statusCoded: statusCoded});
    }
}

exports.view = async (req, res) => {
    try {
      const data = new Object();
      data.breadcrumb = "Campagnes";
      
      var campaign_id = req.params.id;
        var campaign = await ModelCampaigns.findOne({
            where: {
                campaign_id:req.params.id
            },
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        })

        res.render('manager/campaigns/view.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("error.ejs", {statusCoded: statusCoded});
    }
}

/*exports.advertiser_add = async (req, res) => {

  //ajoute dans la bdd les annonceurs

  try {

    if (req.session.user.role == 1) {


      var config = {
        method: 'GET',
        url: 'https://manage.smartadserverapis.com/2044/advertisers/',
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

            const advertiser = ModelAdvertisers.create({
              advertiser_id,
              advertiser_name,


            })

          }

        })
        res.redirect("/manager/list_advertisers")

    }


  }catch (error) {
    console.log(error)
    var statusCoded = error.response.status;

    res.render("error.ejs",{
      statusCoded:statusCoded,

    })
  }


}*/

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
            })

            res.render('manage/list_advertisers.ejs', {advertisers: advertisers});
        }

    } catch (error) {
        console.log(error)
        var statusCoded = error.response.status;

        res.render("error.ejs", {statusCoded: statusCoded})
    }

}

/*exports.campaign_add = async (req, res) => {

  //ajoute les campagnes dans la bdd

  try {
    if (req.session.user.role == 1) {


      var config = {
        method: 'GET',
        url: 'https://manage.smartadserverapis.com/2044/advertisers/442520/campaigns',
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


            var campaign_id = data[i].id
            var campaign_name = data[i].name
            var advertiser_id = data[i].advertiserId
            var start_date = data[i].startDate
            var end_date = data[i].endDate

            const campaigns = ModelCampaigns.create({
              campaign_id,
              campaign_name,
              advertiser_id,
              start_date,
              end_date



            })
          }


        })
        res.redirect("/manager/list_advertisers")

    }
  } catch (error) {
    console.log(error)
    var statusCoded = error.response.status;

    res.render("error.ejs",{
      statusCoded:statusCoded,

    })
  }


}
*/
exports.view_campagne = async (req, res) => {

    //affiche dans une vue les campagnes liée à annnonceur id

    try {
        if (req.session.user.role === 1) {

            var advertiser_id = req.params.id

            var campaign = await ModelCampaigns.findAll({
                attributes: [
                    'campaign_id',
                    'campaign_name',
                    'campaign_crypt',
                    'advertiser_id',
                    'campaign_start_date',
                    'campaign_end_date'
                ],

                where: {
                    //id_users: userId,
                    advertiser_id: req.params.id

                },
                include: [
                    {
                        model: ModelAdvertisers
                    }
                ]
            })

            res.render('manage/view_campagnes.ejs', {
                campaign: campaign,
                advertiser_id: advertiser_id
            });

        }

    } catch (error) {
        console.log(error)
        var statusCoded = error.response.status;

        res.render("error.ejs", {statusCoded: statusCoded})
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

        res.render("error.ejs", {statusCoded: statusCoded})
    }
}