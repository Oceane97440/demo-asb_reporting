// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');

const csv = require('csv-parser')
const fs = require('fs')
const results = [];

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
      reserver: reserver,
      reult_confirmer: reult_confirmer,
      reult_reserver: reult_reserver
    });



  } catch (error) {
    console.log(error);
  }





}



exports.csv_import = async (req, res) => {

  const uploadedFile = req.files.file_csv;

  try {

    //console.log(req.files)



    //verification de extention du fichier
    if ((uploadedFile.mimetype === 'application/vnd.ms-excel')) {

      //il faut que le dossier upload existe. 
      //crée des dossier archive (ex:upload20210108)
      await uploadedFile.mv('public/admin/uploads/' + uploadedFile.name, err => {
        if (err)
          return res.status(500).send(err)
      });

      //recupère le fichier upload et lecture des donnée

      fs.createReadStream('public/admin/uploads/' + uploadedFile.name)
        // fs.createReadStream('public/admin/uploads/template_csv.csv')



        .pipe(csv({
          separator: '\;'
        }))
        .on('data', (data) => results.push(data))
        .on('end', () => {
          console.log(results);

          for (let i = 0; i < results.length; i++) {


            //recupère mes donnée puis assigné à une variabme
            var campaign_epilot_id = results[i].campaign_epilot_id;
            var campaign_name = results[i].campaign_name;
            var format_name = results[i].format_name;
            var etat = results[i].etat;
            var campaign_start_date = results[i].campaign_start_date;
            var campaign_end_date = results[i].campaign_end_date;
            var volume_prevue = results[i].volume_prevue;

           // console.log(results[i])
            var nbr_line = Object.keys(results[i]).length
           // console.log(nbr_line)
          }
          // [
          //   { NAME: 'Daffy Duck', AGE: '24' },
          //   { NAME: 'Bugs Bunny', AGE: '22' }
          // ]
        });




    } else {
      return res.send({
        error: {
          message: "Extention du fichier invalide"
        }
      });
    }






  } catch (error) {
    console.log(error);
  }



}