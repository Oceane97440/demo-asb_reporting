// Initialise le module

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




const ModelAdvertiser = require("../models/models.advertisers")
const ModelCampaigns = require("../models/models.campaigns")






exports.advertiser_liste = async (req, res) => {

  //liste dans une vue tous les annonceurs
  try {
    if (req.session.user.role === 1) {
      var advertisers = await ModelAdvertiser.findAll({
        attributes: ['advertiser_id', 'advertiser_name'],
        order: [
          ['advertiser_name', 'ASC']
        ],
      })

      res.render('manage/list_advertisers.ejs', {
        advertisers: advertisers
      });
    }


  } catch (error) {
    console.log(error)
    var statusCoded = error.response.status;

    res.render("error.ejs", {
      statusCoded: statusCoded,

    })
  }


}

exports.view_campagne = async (req, res) => {

  //affiche dans une vue les campagnes liée à annnonceur id

  try {
    if (req.session.user.role === 1) {

      var advertiser_id = req.params.id

      var campaign = await ModelCampaigns.findAll({
        attributes: ['campaign_id', 'campaign_name', 'campaign_crypt', 'advertiser_id', 'campaign_start_date', 'campaign_end_date'],

        where: {
          //id_users: userId,
          advertiser_id: req.params.id

        },
        include: [{
          model: ModelAdvertiser
        }],

      })

      res.render('manage/view_campagnes.ejs', {
        campaign: campaign,
        advertiser_id: advertiser_id,
      });


    }


  } catch (error) {
    console.log(error)
    var statusCoded = error.response.status;

    res.render("error.ejs", {
      statusCoded: statusCoded,

    })
  }



}

