// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);
const Utilities = require("../functions/functions.utilities");

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

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');

// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const ModelEpilotCampaigns = require("../models/models.epilot_campaigns");
const ModelEpilotInsertions = require("../models/models.epilot_insertions");

const TEXT_REGEX = /^.{1,51}$/

const {
    promiseImpl
} = require('ejs');

exports.index = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Annonceurs',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        advertisers_last = await ModelAdvertisers.findAll({
            limit: 10,
            include: [{
                model: ModelCampaigns
            }]
        }, {
            order: [
                ['advertiser_id', 'ASC']
            ]
        });

        console.log(advertisers_last.length)


        data.moment = moment;

        res.render('manager/advertisers/index.ejs', data);
    } catch (error) {
        console.log(error);
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

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Annonceurs',
            'link': 'advertisers'
        }, {
            'name': 'Liste des annonceurs',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.advertisers = await ModelAdvertisers.findAll({
            include: [{
                model: ModelCampaigns
            }]
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['advertiser_id', 'DESC']
            ]
        });

        data.moment = moment;
        res.render('manager/advertisers/list.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.create = async (req, res) => {
    try {

        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Annonceurs',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.advertisers = await ModelAdvertisers.findAll({
            include: [{
                model: ModelCampaigns
            }]
        });
        data.moment = moment;


        res.render('manager/advertisers/create.ejs', data);

    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}


exports.create_post = async (req, res) => {
    try {
        const advertiser = req.body.advertiser_name


        if (!TEXT_REGEX.test(advertiser)) {
            req.session.message = {
                type: 'danger',
                intro: 'Erreur',
                message: 'Le nombre de caratère est limité à 50'
            }
            return res.redirect('/manager/advertisers/create');
        }

        if (advertiser == '') {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Les champs doivent être complétés'
            }
            return res.redirect('/manager/advertisers/create');
        }


        var requestAdvertiser = {
            "name": advertiser,

            "isDirectAdvertiser": true,

            "isHouseAds": false,

            "isArchived": false,

            "userGroupId": 12958

        }


        await ModelAdvertisers.findOne({
            attributes: ['advertiser_name'],
            where: {
                advertiser_name: advertiser
            }
        }).then(async function (advertiserFound) {


            //Test si le nom annonceur exsite
            if (!advertiserFound) {

                //envoie les éléments de la requête POST

                let advertiser_create = await AxiosFunction.postManage('advertisers', requestAdvertiser);

                //Si url location existe on recupère l'id avec une requête GET

                if (advertiser_create.headers.location) {

                    var url_location = advertiser_create.headers.location

                    var advertiser_get = await AxiosFunction.getManage(url_location);

                    const advertiser_id = advertiser_get.data.id


                    // On crée annonceur dans la bdd

                    await ModelAdvertisers.create({
                        advertiser_id: advertiser_id,
                        advertiser_name: advertiser,
                        advertiser_archived: 0
                    });

                    req.session.message = {
                        type: 'success',
                        intro: 'Ok',
                        message: 'L\'annonceur a été dans SMARTADSERVEUR',

                    }
                    return res.redirect('/manager/advertisers/create');

                } else {
                    res.status(404).render("error-status.ejs", {
                        statusCoded,

                    });
                }

            } else {
                req.session.message = {
                    type: 'danger',
                    intro: 'Erreur',
                    message: 'Annonceur est déjà utilisé'
                }
                return res.redirect('/manager/advertisers/create');
            }
        })






    } catch (error) {
        console.log(error);

        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}



exports.view = async (req, res) => {
    try {

        const data = new Object();

        var advertiser_id = req.params.id;


        var advertiser = await ModelAdvertisers
            .findOne({
                where: {
                    advertiser_id: advertiser_id
                },
                include: [{
                    model: ModelCampaigns
                }]
            })
            .then(async function (advertiser) {
              



                if (!advertiser) {
                    return res.redirect(`/extension-chrome/advertiser/?advertiser_id=${advertiser_id}`)
                   /* return res
                        .status(404)
                        .render("manager/error.ejs", {
                            statusCoded: 404
                        });*/

                }

                // Créer le fil d'ariane
                breadcrumb = new Array({
                    'name': 'Annonceurs',
                    'link': 'advertisers'
                }, {
                    'name': 'Liste des annonceurs',
                    'link': 'advertisers/list'
                }, {
                    'name': advertiser.advertiser_name,
                    'link': ''
                });
                data.breadcrumb = breadcrumb;

                // Récupére les données des campagnes epilot  
                const epilot_campaigns = await ModelEpilotCampaigns.findOne({
                    attributes: [
                        [sequelize.fn('sum', sequelize.col('epilot_campaign_budget_net')), 'campaign_budget']
                    ],
                    where: {
                        advertiser_id: advertiser_id
                    },
                    raw: true
                });
                data.epilot_campaigns = epilot_campaigns;

                console.log(epilot_campaigns);


                // Récupére les données des campagnes
                campaigns = await ModelCampaigns.findAll({
                    where: {
                        advertiser_id: advertiser_id
                    },
                    include: [{
                        model: ModelAdvertisers
                    }]
                });

                // Attribue les données de la campagne
                data.campaigns = campaigns
                data.advertiser = advertiser;
                data.utilities = Utilities;
                data.moment = moment;
                res.render('manager/advertisers/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

/*exports.advertiser_add = async (req, res) => {

  //ajoute dans la bdd les annonceurs

  try {

    if (req.session.user.user_role == 1) {


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
    var statusCoded = error.response;

    res.render("error.ejs",{
      statusCoded:statusCoded,

    })
  }


}*/

exports.advertiser_list = async (req, res) => {

    //liste dans une vue tous les annonceurs
    try {

        const data = new Object();
        var advertisers = await ModelAdvertisers.findAll({
            attributes: [
                'advertiser_id', 'advertiser_name'
            ],
            order: [
                ['advertiser_name', 'ASC']
            ]
        })

        data.advertisers = advertisers;
        data.moment = moment;
        res.render('manage/list_advertisers.ejs', data);

    } catch (error) {
        console.log(error)
        var statusCoded = error.response;

        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        })
    }

}

/*exports.campaign_add = async (req, res) => {

  //ajoute les campagnes dans la bdd

  try {
    if (req.session.user.user_role == 1) {


      var config = {
        method: 'GET',
        url: 'https://manage.smartadserverapis.com/2044/advertisers/442520/advertisers',
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
            var campaign_name = data[i].name
            var advertiser_id = data[i].advertiserId
            var start_date = data[i].startDate
            var end_date = data[i].endDate

            const advertisers = ModelAdvertisers.create({
              advertiser_id,
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
    var statusCoded = error.response;

    res.render("error.ejs",{
      statusCoded:statusCoded,

    })
  }


}
*/
exports.view_campagne = async (req, res) => {

    //affiche dans une vue les campagnes liée à annnonceur id

    try {
        if (req.session.user.user_role === 1) {

            var advertiser_id = req.params.id

            var campaign = await ModelAdvertisers.findAll({
                attributes: [
                    'advertiser_id',
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
                include: [{
                    model: ModelAdvertisers
                }]
            })

            res.render('manage/view_campagnes.ejs', {
                campaign: campaign,
                advertiser_id: advertiser_id
            });

        }

    } catch (error) {
        console.log(error)
        var statusCoded = error.response;

        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        })
    }

}

exports.campagne_json = async (req, res) => {
    //renvoie du json les info campagnes
    try {
        ModelAdvertisers
            .findOne({

                where: {
                    advertiser_id: req.params.id

                }
            })
            .then(campagnes => {
                res.json(campagnes)

            })
    } catch (error) {
        console.log(error)
        var statusCoded = error.response;

        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        })
    }
}