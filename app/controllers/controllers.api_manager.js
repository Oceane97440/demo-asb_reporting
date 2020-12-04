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
const AxiosFunction = require('../functions/functions.axios');

// Initialise les models
//const ModelSite = require("../models/models.site");
const ModelFormat = require("../models/models.format");
//const ModelCountry = require("../models/models.country")
//const ModelCampaign_epilot = require("../models/models.campaing_epilot")
//const ModelPack = require("../models/models.pack")
//const ModelPack_Site = require("../models/models.pack_site")



exports.formats_add = async (req, res) => {


  try {



    // Charge la fonction formatAll
    let data_formats = await AxiosFunction.getManageData('GET');

    var array_format=data_formats.data
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