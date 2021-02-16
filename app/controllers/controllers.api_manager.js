// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');

//let csvToJson = require('convert-csv-to-json');
const https = require('https');
const http = require('http');



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
const AxiosFunction = require('../functions/functions.axios');

// Initialise les models
//const ModelSite = require("../models/models.site");
const ModelFormat = require("../models/models.format");
//const ModelCountry = require("../models/models.country")
//const ModelCampaign_epilot = require("../models/models.campaing_epilot")
//const ModelPack = require("../models/models.pack")
//const ModelPack_Site = require("../models/models.pack_site")
const ModelAdvertiser = require("../models/models.advertiser")
const ModelCampaigns = require("../models/models.campaigns")




exports.advertiser_add = async (req, res) => {

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
        // console.log(data)
        var number_line = data.length

        //  JSON.stringify(data);


        for (i = 0; i < number_line; i++) {


          var advertiser_id = data[i].id
          var advertiser_name = data[i].name


          const advertiser = ModelAdvertiser.create({
            advertiser_id,
            advertiser_name,


          })

        }

      })





  }
}

exports.advertiser_liste = async (req, res) => {

  var advertisers = await ModelAdvertiser.findAll({
    attributes: ['advertiser_id', 'advertiser_name'],
    order: [
      ['advertiser_name', 'ASC']
    ],
  })

  // console.log(advertisers)

  res.render('manage/list_advertisers.ejs', {
    advertisers: advertisers
  });



}
exports.view_campagne = async (req, res) => {



  var campaign = await ModelCampaigns.findAll({
    attributes: ['campaign_id', 'campaign_name', 'advertiser_id', 'start_date', 'end_date'],

    where: {
      //id_users: userId,
      advertiser_id: req.params.id

    },
    include: [{
      model: ModelAdvertiser
    }],

  })
  //console.log(campaign)


  res.render('manage/view_campagnes.ejs', {
    campaign: campaign
  });



}
exports.campaign_add = async (req, res) => {

  if (req.session.user.role == 1) {


    var config = {
      method: 'GET',
      url: 'https://manage.smartadserverapis.com/2044/campaigns/',
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
        // console.log(data)
        var number_line = data.length

        //  JSON.stringify(data);


        for (i = 0; i < number_line; i++) {


          var campaign_id = data[i].id
          var campaign_name = data[i].name
          var advertiser_id = data[i].advertiserId
          var startDate = data[i].startDate
          var endDate = data[i].endDate





          const campaigns = ModelCampaigns.create({
            campaign_id,
            campaign_name,
            advertiser_id,
            startDate,
            endDate



          })

        }

      })





  }
}

exports.generate_link = async (req, res) => {


  
    let idcampaign = req.params.idcampaign

    http.get(`http://127.0.0.1:3000/api/manager/campagne_json/${idcampaign}`, function (result) {

    //console.log(idcampaign)
      let data = '';

      result.on('data', function (chunk) {
        data += chunk;
      })

      result.on('end', () => {
        
        let makes = JSON.parse(data)

       /*res.render('cars', {
          makes: makes
        });*/
  
  
        console.log(makes[2].start_date);
      })


    })

    //liste des advertiser :https://manage.smartadserverapis.com/2044/advertisers
    //campagne liée à l'advertiser : https://manage.smartadserverapis.com/2044/advertisers/417740/campaigns

    //   let data_advertiserid = await AxiosFunction.getManage_AdvertiserData('GET', `https://manage.smartadserverapis.com/2044/advertiser`,'');


  
}  

exports.campagne_json = async (req, res) => {
  try {
    ModelCampaigns.findOne({

        where: {
          //id_users: userId,
          campaign_id: req.params.id

        }
      }


    ).then(campagnes => {
      //  console.log(annonceurs);

      res.json(campagnes)

    })
  } catch (error) {
    res.json({
      adresse: "KO",
      message: error
    })
  }
}


exports.formats_add = async (req, res) => {


  try {



    // Charge la fonction formatAll
    let data_formats = await AxiosFunction.getManageData('GET');

    var array_format = data_formats.data
    // console.log(array_format)
    array_format.forEach(obj => {
      // Créer le tableau de données
      formatsData = {
        format_id: `${obj.id}`,
        format_name: `${obj.name}`,
        format_width: `${obj.width}`,
        format_height: `${obj.height}`,
        format_type_id: `${obj.formatTypeId}`,
        format_is_archived: `${obj.isArchived}`,
        format_resource_url: `${obj.resourceUrl}`
      };
      console.log(formatsData)

      ModelFormat.findOrCreate({
        where: {
          format_id: formatsData.format_id,
          format_name: formatsData.format_name,
          format_group: '',
          format_width: formatsData.format_width,
          format_height: formatsData.format_height,
          format_type_id: formatsData.format_type_id,
          format_is_archived: formatsData.format_is_archived,
          format_resource_url: formatsData.format_resource_url,
        },
        defaults: formatsData

      }).then(formats => {
        return res.send("OK: les formats ont été ajoutés à la bdd")
      })

    });


    /*for (let i = 0; i < data_formats.data.length; i++) {

      var format_id = data_formats.data[i].id
      var format_name = data_formats.data[i].name
      var format_width = data_formats.data[i].width
      var format_height = data_formats.data[i].height
      var format_type_id = data_formats.data[i].formatTypeId
      var format_is_archived = data_formats.data[i].isArchived
      var format_resource_url = data_formats.data[i].resourceUrl



      
    }



    await ModelFormat.create({

        format_id: format_id,
        format_name: format_name,
        format_group: '',
        format_width: format_width,
        format_height: format_height,
        format_type_id: format_type_id,
        format_is_archived: format_is_archived,
        format_resource_url: format_resource_url,

      })
      .then(campagne => {
        console.log(campagne)
        return res.send("OK: les formats ont été ajoutés à la bdd")
      })

*/

  } catch (error) {
    console.log(error);
  }





}