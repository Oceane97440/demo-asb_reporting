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
const ModelCountry = require("../models/models.country")
const ModelCampaign_epilot = require("../models/models.campaing_epilot")
const ModelPack = require("../models/models.pack")
const ModelPack_Site = require("../models/models.pack_site")



exports.index = async (req, res) => {

  var date_start = "2020-11-10T00:00:00"
  var date_end = "2020-11-10T23:59:00"
  var advertiserid= "413510"
  var campaignid= "1794328"

  try {
    
    requestReporting = {

      "startDate": date_start,
      "endDate": date_end,
      "fields": [
        {
            "CampaignName":{}
        },
        {
            "CampaignId":{}
        },
        {
            "FormatName": {}
        },
        {
            "Impressions": {}
        },
        {
            "Clicks": {}
        },
        {
            "ClickRate": {}
        }
    ],
    "filter": [
        {
          
            "AdvertiserId": [
              advertiserid
            ],
            "CampaignId":[
              campaignid
            ]
        }
    ]

    }


    // First step
    let firstLink = await AxiosFunction.getReportingData('POST', '', requestReporting)

    if (firstLink.data.taskId) {
      taskId = firstLink.data.taskId;


      //excute le script interval de temps
      let timerFile = setInterval(async () => {

        let url = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`


        let secondLink = await AxiosFunction.getReportingData('GET', url, '');

        if (secondLink.data.lastTaskInstance.jobProgress == '1.0') {

          clearInterval(timerFile);
          let dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');

          //console.log(dataFile);

          //split 
          var CampaignName = []
          var CampaignId = []
          var FormatName = []
          var Impressions = []
          var Clicks = []
          var ClickRate = []

          var data_reporting = dataFile.data

          var data_split = data_reporting.split(/\r?\n/);

          //compte le nbr ligne 
          var number_line = data_split.length;

          //boucle sur les ligne
          for (i = 0; i < number_line; i++) {

            //delete les ; et delete les blanc
            line = data_split[i].split(';');

            //push la donnéé splité dans un tab vide
            CampaignName.push(line[0]);
            CampaignId.push(line[1]);
            FormatName.push(line[2])
            Impressions.push(line[3]);
            Clicks.push(line[4]);
            ClickRate.push(line[5]);



            //console.log(line);


          }
          var table = {
            CampaignName,
            CampaignId,
            FormatName,
            Impressions,
            Clicks,
            ClickRate,

          }
          console.log(table)

          res.render('reporting/data.ejs', {
            table: table

          });


        }


      }, 5000);


    }






  } catch (error) {
    console.log(error);
  }





}


