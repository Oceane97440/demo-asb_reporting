// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');

//let csvToJson = require('convert-csv-to-json');


const axios = require(`axios`);

//const asyncly = require('async');

const fileGetContents = require('file-get-contents');

// Initiliase le module axios
//const axios = require(`axios`);


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
//const AxiosFunction = require('../functions/functions.axios');

// Initialise les models
//const ModelSite = require("../models/models.site");
//const ModelFormat = require("../models/models.format");
//const ModelCountry = require("../models/models.country")
const ModelCampaign_epilot = require("../models/models.campaing_epilot")
//const ModelPack = require("../models/models.pack")
//const ModelPack_Site = require("../models/models.pack_site")



exports.index = async (req, res) => {



  try {

    var confirmer = await ModelCampaign_epilot.findAll({
      attributes: ['campaign_name', 'format_name', 'campaign_start_date', 'campaign_end_date', 'volume_prevue'],

      where: {
        etat: 1
      },
      order: [
        ['campaign_name', 'ASC']
      ],
    })

    var reserver = await ModelCampaign_epilot.findAll({
      attributes: ['campaign_name', 'format_name', 'campaign_start_date', 'campaign_end_date', 'volume_prevue'],

      where: {
        etat: 2
      },
      order: [
        ['campaign_name', 'ASC']
      ],
    })

    var reult_confirmer = Object.keys(confirmer).length; 

    var reult_reserver = Object.keys(reserver).length; 


    res.render('forecast/liste_epilot.ejs', {
      confirmer: confirmer,
      reserver:reserver,
      reult_confirmer:reult_confirmer,
      reult_reserver:reult_reserver
    });



  } catch (error) {
    console.log(error);
  }





}