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

exports.test = async (req, res) => {

  var advertiserid = "4455418"
  var campaignid = "1839404"

  try {

    requestReporting = {

      "startDate": "2021-01-15T00:00:00",

      "endDate": "CURRENT_DAY",

      "fields": [{
          "CampaignName": {}
        },

        {
          "InsertionName": {}
        },

        {
          "FormatName": {}
        },

        {
          "SiteName": {}
        },

        {
          "Impressions": {}
        },

        {
          "ClickRate": {}
        },

        {
          "Clicks": {}
        }

      ],

      "filter": [

        {

          "AdvertiserId": [

            advertiserid

          ],

          "CampaignId": [

            campaignid

          ]

        }

      ]

    }



    //Requête visitor unique
    requestVisitor_unique = {

      "startDate": "2021-01-15T00:00:00",

      "endDate": "CURRENT_DAY",

      "fields": [

        {
          "UniqueVisitors": {}
        }

      ],

      "filter": [{
          "AdvertiserId": [advertiserid],

          "CampaignId": [campaignid]

        }

      ]

    }


    let firstLink = await AxiosFunction.getReportingData('POST', '', requestReporting)
    let threeLink = await AxiosFunction.getReportingData('POST', '', requestVisitor_unique)

    if (firstLink.data.taskId || threeLink.data.taskId) {

      taskId = firstLink.data.taskId;
      taskId2 = threeLink.data.taskId;
      //console.log("requête1" + taskId)
      // console.log("requête2" + taskId2)

      //excute le script interval de temps
      let timerFile = setInterval(async () => {

        let requête1 = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`
        let requête2 = `https://reporting.smartadserverapis.com/2044/reports/${taskId2}`

        let fourLink = await AxiosFunction.getReportingData('GET', requête2, '');

        let secondLink = await AxiosFunction.getReportingData('GET', requête1, '');


        if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (secondLink.data.lastTaskInstance.jobProgress == '1.0')) {

          clearInterval(timerFile);
          let dataFile2 = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId2}/file`, '');
          let dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');

          //console.log(dataFile);
          //console.log(dataFile2);



        }



      }, 60000);
    }



  } catch (error) {
    console.log(error);
  }


}

exports.index = async (req, res) => {

  // var date_start = "2020-11-10T00:00:00"
  //  var date_end = "2020-11-10T23:59:00"
  var advertiserid = "4455418"
  var campaignid = "1839404"

  try {



    requestReporting = {

      "startDate": "2021-01-15T00:00:00",

      "endDate": "CURRENT_DAY",

      "fields": [{
          "CampaignName": {}
        },

        {
          "InsertionName": {}
        },

        {
          "FormatName": {}
        },

        {
          "SiteName": {}
        },

        {
          "Impressions": {}
        },

        {
          "ClickRate": {}
        },

        {
          "Clicks": {}
        }

      ],

      "filter": [

        {

          "AdvertiserId": [

            advertiserid

          ],

          "CampaignId": [

            campaignid

          ]

        }

      ]

    }



    //Requête visitor unique
    requestVisitor_unique = {

      "startDate": "2021-01-15T00:00:00",

      "endDate": "CURRENT_DAY",

      "fields": [

        {
          "UniqueVisitors": {}
        }

      ],

      "filter": [{
          "AdvertiserId": [advertiserid],

          "CampaignId": [campaignid]

        }

      ]

    }


    let firstLink = await AxiosFunction.getReportingData('POST', '', requestReporting)
    let threeLink = await AxiosFunction.getReportingData('POST', '', requestVisitor_unique)

    if (firstLink.data.taskId || threeLink.data.taskId) {

      taskId = firstLink.data.taskId;
      taskId2 = threeLink.data.taskId;


      //excute le script interval de temps
      let timerFile = setInterval(async () => {

        let requête1 = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`
        let requête2 = `https://reporting.smartadserverapis.com/2044/reports/${taskId2}`

        let fourLink = await AxiosFunction.getReportingData('GET', requête2, '');

        let secondLink = await AxiosFunction.getReportingData('GET', requête1, '');


        if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (secondLink.data.lastTaskInstance.jobProgress == '1.0')) {

          clearInterval(timerFile);
          let dataFile2 = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId2}/file`, '');
          let dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');


          //traitement des resultat requête 2

          var UniqueVisitors = []

          var data_uniqueVisitors = dataFile2.data
          var data_split2 = data_uniqueVisitors.split(/\r?\n/);
          var number_line = data_split2.length;

          //boucle sur les ligne
          for (i = 1; i < number_line; i++) {

            line = data_split2[i].split(';');
            UniqueVisitors.push(line[0]);

          }

          var Total_VU = UniqueVisitors[0]

          //rtraitement des resultat requête 1
          const CampaignName = []
          const InsertionName = []
          const FormatName = []
          const SiteName = []
          const Impressions = []
          const ClickRate = []
          const Clicks = []



          var data_reporting = dataFile.data
          var data_split = data_reporting.split(/\r?\n/);
          var number_line = data_split.length;

          for (i = 1; i < number_line; i++) {

            line = data_split[i].split(';');
            CampaignName.push(line[0]);
            InsertionName.push(line[1]);
            FormatName.push(line[2])
            SiteName.push(line[3])
            Impressions.push(line[4]);
            ClickRate.push(line[5]);
            Clicks.push(line[6]);

          }


          //filte les array exclure les valeur undefined qui empêche le calcule des somme
          const valueToRemove = undefined;
          const Array_Impression = [];
          const Array_Clicks = [];
          const Array_InsertionName = [];
          const Array_SiteName = [];
          const Array_FormatName = [];

          //push les valeur filtré total  et clique
          for (let i = 0; i < Impressions.length; i++) {
            if (Impressions[i] !== valueToRemove) {
              Array_Impression.push(Impressions[i]);
              Array_Clicks.push(Clicks[i]);
              Array_InsertionName.push(InsertionName[i]);
              Array_SiteName.push(SiteName[i]);
              Array_FormatName.push(FormatName[i]);
            }
          }
          if ((InsertionName.length > 1) && (Array.isArray(InsertionName) === true)) {

            var habillage = new Array()
            var interstitiel = new Array()
            var grand_angle = new Array()
            var masthead = new Array()
            var native = new Array()



            var interstitielImpressions = new Array()
            var interstitielClicks = new Array()
            var interstitielSitename = new Array()
            var interstitielFormatName = new Array()


            var habillageImpressions = new Array()
            var habillageClicks = new Array()
            var habillageSitename = new Array()
            var habillageFormatName = new Array()

            var mastheadImpressions = new Array()
            var mastheadClicks = new Array()
            var mastheadSitename = new Array()
            var mastheadFormatName = new Array()


            var grand_angleImpressions = new Array()
            var grand_angleClicks = new Array()
            var grand_angleSitename = new Array()
            var grand_angleFormatName = new Array()

            var nativeImpressions = new Array()
            var nativeClicks = new Array()
            var nativeSitename = new Array()
            var nativeFormatName = new Array()

            Array_InsertionName.filter(function (word, index) {



              if (word.match(/INTERSTITIEL/gi)) {
                interstitiel.push(index);
              }
              if (word.match(/HABILLAGE/gi)) {
                habillage.push(index);
              }
              if (word.match(/MASTHEAD/gi)) {
                masthead.push(index);
              }
              if (word.match(/GRAND ANGLE/gi)) {
                grand_angle.push(index);
              }
              if (word.match(/NATIVE/gi)) {
                native.push(index);
              }

            });


            function interstitielArrayElements(element, index, array) {
              // Rajouter les immpresions  et clics des formats
              interstitielImpressions.push(eval(Array_Impression[element]));
              interstitielClicks.push(eval(Array_Clicks[element]));

              interstitielSitename.push(Array_SiteName[element]);
              interstitielFormatName.push(Array_FormatName[element]);

            }


            // Function foreach qui met dans un tableau les impressions correspondant au format
            function habillageArrayElements(element, index, array) {
              // Rajouter les immpresions  et clics des formats
              habillageImpressions.push(eval(Array_Impression[element]));
              habillageClicks.push(eval(Array_Clicks[element]));

              habillageSitename.push(Array_SiteName[element]);
              habillageFormatName.push(Array_FormatName[element]);
            }



            function mastheadArrayElements(element, index, array) {
              mastheadImpressions.push(eval(Array_Impression[element]));
              mastheadClicks.push(eval(Array_Clicks[element]));

              mastheadSitename.push(Array_SiteName[element]);
              mastheadFormatName.push(Array_FormatName[element]);

            }

            function grand_angleArrayElements(element, index, array) {
              // Rajouter les immpresions  et clics des formats
              grand_angleImpressions.push(eval(Array_Impression[element]));
              grand_angleClicks.push(eval(Array_Clicks[element]));

              grand_angleSitename.push(Array_SiteName[element]);
              grand_angleFormatName.push(Array_FormatName[element]);


            }


            function nativeArrayElements(element, index, array) {
              nativeImpressions.push(eval(Array_Impression[element]));
              nativeClicks.push(eval(Array_Clicks[element]));

              nativeSitename.push(Array_SiteName[element]);
              nativeFormatName.push(Array_FormatName[element]);
            }


            interstitiel.forEach(interstitielArrayElements);
            habillage.forEach(habillageArrayElements);
            masthead.forEach(mastheadArrayElements);
            grand_angle.forEach(grand_angleArrayElements);
            native.forEach(nativeArrayElements);


            // Function qui permet de calculer les éléments du tableau
            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            var sommeHabillageImpression = habillageImpressions.reduce(reducer, 0);
            var sommeHabillageClicks = habillageClicks.reduce(reducer, 0);

            var sommeGrand_AngleImpression = grand_angleImpressions.reduce(reducer, 0);
            var sommeGrand_AngleClicks = grand_angleClicks.reduce(reducer, 0);


            var sommeInterstitielImpression = interstitielImpressions.reduce(reducer, 0);
            var sommeInterstitielClicks = interstitielClicks.reduce(reducer, 0);

            var sommeMastheadImpression = mastheadImpressions.reduce(reducer, 0);
            var sommeMastheadClicks = mastheadClicks.reduce(reducer, 0);

            var sommeNativeImpression = nativeImpressions.reduce(reducer, 0);
            var sommeNativeClicks = nativeClicks.reduce(reducer, 0);


          }


          var TotalImpressions = 0
          var TotalCliks = 0

          for (let i = 0; i < Array_Impression.length; i++) {
            if (Array_Impression[i] != '') {
              TotalImpressions += parseInt(Array_Impression[i])
              TotalCliks += parseInt(Array_Clicks[i])

            }
          }

          CTR_habillage = Math.round((sommeHabillageImpression / sommeHabillageClicks) / 100)
          CTR_interstitiel = Math.round((sommeInterstitielImpression / sommeInterstitielClicks) / 100)
          CTR_grand_angle = Math.round((sommeGrand_AngleImpression / sommeGrand_AngleClicks) / 100)
          CTR_masthead = Math.round((sommeMastheadImpression / sommeMastheadClicks) / 100)
          CTR_native = Math.round((sommeNativeImpression / sommeNativeClicks) / 100)



          var CTR = Math.round((TotalImpressions / TotalCliks) / 100)
          var Impression_vu = (TotalImpressions / Total_VU) / 100
          Repetition = Impression_vu.toFixed(2);



          var table = {
            CampaignName,
            InsertionName,
            FormatName,
            SiteName,
            Impressions,
            ClickRate,
            Array_Clicks,

            TotalImpressions,
            TotalCliks,
            CTR,
            Total_VU,
            Repetition,



            sommeHabillageImpression,
            sommeInterstitielImpression,
            sommeGrand_AngleImpression,
            sommeMastheadImpression,
            sommeNativeImpression,

            sommeHabillageClicks,
            sommeInterstitielClicks,
            sommeGrand_AngleClicks,
            sommeMastheadClicks,
            sommeNativeClicks,


            CTR_habillage,
            CTR_interstitiel,
            CTR_grand_angle,
            CTR_masthead,
            CTR_native
          }

          res.render('reporting/data.ejs', {
            table: table,
          });












        }



      }, 60000);
    }




  } catch (error) {
    console.log(error);
  }





}