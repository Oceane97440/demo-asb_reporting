// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');
const http = require('http');

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

exports.test = async (req, res) => {




  let advertiserid = req.params.advertiserid;
  let campaignid = req.params.campaignid;

  //url = http.get(`http://127.0.0.1:3000/api/reporting/test/?advertiserid=${advertiserid}&campaignid=${campaignid}`)





  //var advertiserid = "4455418"
  // var campaignid = "1839404"

  try {



    /*  requestReporting = {

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
*/

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


    //let firstLink = await AxiosFunction.getReportingData('POST', '', requestReporting)
    let threeLink = await AxiosFunction.getReportingData('POST', '', requestVisitor_unique)

    if (threeLink.data.taskId) {

      // taskId = firstLink.data.taskId;
      taskId2 = threeLink.data.taskId;

      //console.log("requête1" + taskId)
      // console.log("requête2" + taskId2)

      //excute le script interval de temps
      let timerFile = setInterval(async () => {

        //let requête1 = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`
        let requête2 = `https://reporting.smartadserverapis.com/2044/reports/${taskId2}`

        let fourLink = await AxiosFunction.getReportingData('GET', requête2, '');

        //let secondLink = await AxiosFunction.getReportingData('GET', requête1, '');


        if (fourLink.data.lastTaskInstance.jobProgress == '1.0') {

          clearInterval(timerFile);
          let dataFile2 = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId2}/file`, '');
          //let dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');

          //console.log(dataFile);
          //console.log(dataFile2);

          const UniqueVisitors = []

          var data_uniqueVisitors = dataFile2.data
          var data_split2 = data_uniqueVisitors.split(/\r?\n/);
          var number_line = data_split2.length;

          //boucle sur les ligne
          for (i = 1; i < number_line; i++) {

            line = data_split2[i].split(';');
            UniqueVisitors.push(line[0]);

          }
          //console.log(UniqueVisitors[0])
          var Total_VU = UniqueVisitors[0]

        }


        var table = {
          Total_VU
        }

        return res.render("reporting/test.ejs", {
          table: table
        })
      }, 30000);


    }




    // return res.render("reporting/generate_data.ejs")




  } catch (error) {
    console.log(error);
  }


}

exports.index = async (req, res) => {
 //http://127.0.0.1:3000/api/reporting/4455418/1839404

  let advertiserid = req.params.advertiserid;
  let campaignid = req.params.campaignid;

  // var date_start = "2020-11-10T00:00:00"
  //  var date_end = "2020-11-10T23:59:00"
  // var advertiserid = "4455418"
  // var campaignid = "1839404"

  try {



    requestReporting = {

      "startDate": "2021-01-15T00:00:00",

      "endDate": "CURRENT_DAY",

      "fields": [{
          "CampaignStartDate": {}
        },
        {
          "CampaignEndDate": {}
        },
        {
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
        //console.log('TaskId : ' + taskId)
        //console.log('TaskId2 : ' + taskId2)

        let fourLink = await AxiosFunction.getReportingData('GET', requête2, '');

        let secondLink = await AxiosFunction.getReportingData('GET', requête1, '');


        if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (secondLink.data.lastTaskInstance.jobProgress == '1.0')) {

          clearInterval(timerFile);

          let dataFile2 = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId2}/file`, '');
          let dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');

          // console.log(dataFile)
          //traitement des resultat requête 2

          const UniqueVisitors = []

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
          const CampaignStartDate = []
          const CampaignEndtDate = []
          const CampaignName = []
          const InsertionName = []
          const FormatName = []
          const SiteName = []
          const Impressions = []
          const ClickRate = []
          const Clicks = []
          // const Unique_Visitors = []

          var data_reporting = dataFile.data
          var data_split = data_reporting.split(/\r?\n/);
          var number_line = data_split.length;

          for (i = 1; i < number_line; i++) {

            line = data_split[i].split(';');
            CampaignStartDate.push(line[0]);
            CampaignEndtDate.push(line[1]);
            CampaignName.push(line[2]);
            InsertionName.push(line[3]);
            FormatName.push(line[4])
            SiteName.push(line[5])
            Impressions.push(line[6]);
            ClickRate.push(line[7]);
            Clicks.push(line[8]);
            // Unique_Visitors.push(line[9]);

          }


          //Convertie les Timestamp campagne startdate et enddate
          function getDateTimeFromTimestamp(unixTimeStamp) {
            let date = new Date(unixTimeStamp);
            return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
          }
          var t1 = parseInt(CampaignStartDate[0])
          var t2 = parseInt(CampaignEndtDate[0])
          const StartDate = getDateTimeFromTimestamp(t1);
          const EndDate = getDateTimeFromTimestamp(t2);



          //filte les array exclure les valeur undefined qui empêche le calcule des somme

          const Array_Impression = [];
          const Array_Clicks = [];
          const Array_InsertionName = [];
          const Array_SiteName = [];
          const Array_FormatName = [];
          const Array_ClickRate = [];
          // const Array_UniqueVisitors = [];


          const valueToRemove = undefined;
          //push les valeur filtré total  et clique
          for (let i = 0; i < Impressions.length; i++) {
            if (Impressions[i] !== valueToRemove) {

              Array_Impression.push(Impressions[i]);
              Array_Clicks.push(Clicks[i]);
              Array_InsertionName.push(InsertionName[i]);
              Array_SiteName.push(SiteName[i]);
              Array_FormatName.push(FormatName[i]);
              Array_ClickRate.push(ClickRate[i]);
              // Array_UniqueVisitors.push(Unique_Visitors[i]);


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
            //  var interstitielVU = new Array()
            var interstitielCTR = new Array()


            var habillageImpressions = new Array()
            var habillageClicks = new Array()
            var habillageSitename = new Array()
            var habillageFormatName = new Array()
            // var habillageVU = new Array()
            var habillageCTR = new Array()


            var mastheadImpressions = new Array()
            var mastheadClicks = new Array()
            var mastheadSitename = new Array()
            var mastheadFormatName = new Array()
            //var mastheadVU = new Array()
            var mastheadCTR = new Array()

            var grand_angleImpressions = new Array()
            var grand_angleClicks = new Array()
            var grand_angleSitename = new Array()
            var grand_angleFormatName = new Array()
            // var grand_angleVU = new Array()
            var grand_angleCTR = new Array()

            var nativeImpressions = new Array()
            var nativeClicks = new Array()
            var nativeSitename = new Array()
            var nativeFormatName = new Array()
            // var nativeVU = new Array()
            var nativeCTR = new Array()


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


            // Function foreach qui met dans un tableau les impressions correspondant au format
            async function interstitielArrayElements(element, index, array) {
              // Rajouter les immpresions  et clics des formats
              interstitielImpressions.push(eval(Array_Impression[element]));
              interstitielClicks.push(eval(Array_Clicks[element]));
              interstitielSitename.push(Array_SiteName[element]);
              interstitielFormatName.push(Array_FormatName[element]);
              // interstitielVU.push(Array_UniqueVisitors[element]);
              let i = Math.round(Array_ClickRate[element] * 100) / 100
              interstitielCTR.push(i);

            }


            // Function foreach qui met dans un tableau les impressions correspondant au format
            async function habillageArrayElements(element, index, array) {

              // Rajouter les immpresions  et clics des formats
              habillageImpressions.push(eval(Array_Impression[element]));
              habillageClicks.push(eval(Array_Clicks[element]));
              habillageSitename.push(Array_SiteName[element]);
              habillageFormatName.push(Array_FormatName[element]);
              let h = Math.round(Array_ClickRate[element] * 100) / 100
              habillageCTR.push(h);
              //habillageVU.push(Array_UniqueVisitors[element]);


            }



            async function mastheadArrayElements(element, index, array) {
              mastheadImpressions.push(eval(Array_Impression[element]));
              mastheadClicks.push(eval(Array_Clicks[element]));

              mastheadSitename.push(Array_SiteName[element]);
              mastheadFormatName.push(Array_FormatName[element]);

              //mastheadVU.push(Array_UniqueVisitors[element]);

              let m = Math.round(Array_ClickRate[element] * 100) / 100
              mastheadCTR.push(m);

            }

            async function grand_angleArrayElements(element, index, array) {
              // Rajouter les immpresions  et clics des formats
              grand_angleImpressions.push(eval(Array_Impression[element]));
              grand_angleClicks.push(eval(Array_Clicks[element]));

              grand_angleSitename.push(Array_SiteName[element]);


              //faire un agration de site ( grand_angle_LINFO.push(sm_linfo[element]);)
              grand_angleFormatName.push(Array_FormatName[element]);

              // grand_angleVU.push(Array_UniqueVisitors[element]);

              let g = Math.round(Array_ClickRate[element] * 100) / 100
              grand_angleCTR.push(g);


            }


            async function nativeArrayElements(element, index, array) {
              nativeImpressions.push(eval(Array_Impression[element]));
              nativeClicks.push(eval(Array_Clicks[element]));

              nativeSitename.push(Array_SiteName[element]);
              nativeFormatName.push(Array_FormatName[element]);

              //nativeVU.push(Array_UniqueVisitors[element]);
              let n = Math.round(Array_ClickRate[element] * 100) / 100
              nativeCTR.push(n);

            }



            interstitiel.forEach(interstitielArrayElements);
            habillage.forEach(habillageArrayElements);
            masthead.forEach(mastheadArrayElements);
            grand_angle.forEach(grand_angleArrayElements);
            native.forEach(nativeArrayElements);


            var sm_linfo = new Array()
            var sm_linfo_android = new Array()
            var sm_linfo_ios = new Array()
            var sm_antenne = new Array()
            var sm_dtj = new Array()
            var sm_orange = new Array()




            var habillage_linfo_impression = new Array()
            var habillage_linfo_clic = new Array()
            var habillage_dtj_impression = new Array()
            var habillage_dtj_clic = new Array()
            var habillage_antenne_impression = new Array()
            var habillage_antenne_clic = new Array()
            var habillage_infoIos_impression = new Array()
            var habillage_infoIos_clic = new Array()
            var habillage_infoAndroid_impression = new Array()
            var habillage_infoAndroid_clic = new Array()
            var habillage_orange_impression = new Array()
            var habillage_orange_clic = new Array()


            /*  var grand_angle_linfo_impression = new Array()
              var grand_angle_linfo_clic = new Array()
              var grand_angle_dtj_impression = new Array()
              var grand_angle_dtj_clic = new Array()
              var grand_angle_antenne_impression = new Array()
              var grand_angle_antenne_clic = new Array()
              var grand_angle_infoIos_impression = new Array()
              var grand_angle_infoIos_clic = new Array()
              var grand_angle_infoAndroid_impression = new Array()
              var grand_angle_infoAndroid_clic = new Array()
              var grand_angle_orange_impression = new Array()
              var grand_angle_orange_clic = new Array()*/


            Array_SiteName.filter(function (word, index) {


              if (word.match(/SM_LINFO.re/gi)) {
                sm_linfo.push(index);
              }
              if (word.match(/SM_LINFO-ANDROID/gi)) {
                sm_linfo_android.push(index);
              }
              if (word.match(/SM_LINFO-IOS/gi)) {
                sm_linfo_ios.push(index);
              }
              if (word.match(/SM_DOMTOMJOB/gi)) {
                sm_dtj.push(index);
              }
              if (word.match(/SM_ANTENNEREUNION/gi)) {
                sm_antenne.push(index);
              }
              if (word.match(/SM_ORANGE_REUNION/gi)) {
                sm_orange.push(index);
              }

            });


            // Function foreach qui met dans un tableau les impressions correspondant au site
            async function habillage_Info_ArrayElements(element, index, array) {
              habillage_linfo_impression.push(habillageImpressions[element]);
              habillage_linfo_clic.push(habillageClicks[element]);

            }

            async function habillage_DTJ_ArrayElements(element, index, array) {
              habillage_dtj_impression.push(habillageImpressions[element]);
              habillage_dtj_clic.push(habillageClicks[element]);

            }

            async function habillage_Antenne_ArrayElements(element, index, array) {

              habillage_antenne_impression.push(habillageImpressions[element]);
              habillage_antenne_clic.push(habillageClicks[element]);

            }

            async function habillage_LinfoIos_ArrayElements(element, index, array) {
              habillage_infoIos_impression.push(habillageImpressions[element]);
              habillage_infoIos_clic.push(habillageClicks[element]);

            }

            async function habillage_LinfoAndroid_ArrayElements(element, index, array) {

              habillage_infoAndroid_impression.push(habillageImpressions[element]);
              habillage_infoAndroid_clic.push(habillageClicks[element]);

            }


            async function habillage_Orange_ArrayElements(element, index, array) {
              habillage_orange_impression.push(habillageImpressions[element]);
              habillage_orange_clic.push(habillageClicks[element]);

            }

            /*  
            // Function foreach qui met dans un tableau les impressions correspondant au site
                          async function grand_angle_Info_ArrayElements(element, index, array) {
                            grand_angle_linfo_impression.push(grand_angleImpressions[element]);
                            grand_angle_linfo_clic.push(grand_angleClicks[element]);
              
                          }
              
                          async function grand_angle_DTJ_ArrayElements(element, index, array) {
                            grand_angle_dtj_impression.push(grand_angleImpressions[element]);
                            grand_angle_dtj_clic.push(grand_angleClicks[element]);
              
                          }
              
                          async function grand_angle_Antenne_ArrayElements(element, index, array) {

                            grand_angle_antenne_impression.push(grand_angleImpressions[element]);
                            grand_angle_antenne_clic.push(grand_angleClicks[element]);
              
                          }
              
                          async function grand_angle_LinfoIos_ArrayElements(element, index, array) {
                            grand_angle_infoIos_impression.push(grand_angleImpressions[element]);
                            grand_angle_infoIos_clic.push(grand_angleClicks[element]);
              
                          }
              
                          async function grand_angle_LinfoAndroid_ArrayElements(element, index, array) {
              
                            grand_angle_infoAndroid_impression.push(grand_angleImpressions[element]);
                            grand_angle_infoAndroid_clic.push(grand_angleClicks[element]);
              
                          }
              
              
                          async function grand_angle_Orange_ArrayElements(element, index, array) {
                            grand_angle_orange_impression.push(grand_angleImpressions[element]);
                            grand_angle_orange_clic.push(grand_angleClicks[element]);
              
                          }



                       
            **/
            /*           sm_linfo.forEach(grand_angle_Info_ArrayElements);
            sm_dtj.forEach(grand_angle_DTJ_ArrayElements);
            sm_antenne.forEach(grand_angle_Antenne_ArrayElements);
            sm_linfo_ios.forEach(grand_angle_LinfoIos_ArrayElements);
            sm_linfo_android.forEach(grand_angle_LinfoAndroid_ArrayElements);
            sm_orange.forEach(grand_angle_Orange_ArrayElements);
*/



            sm_linfo.forEach(habillage_Info_ArrayElements);
            sm_dtj.forEach(habillage_DTJ_ArrayElements);
            sm_antenne.forEach(habillage_Antenne_ArrayElements);
            sm_linfo_ios.forEach(habillage_LinfoIos_ArrayElements);
            sm_linfo_android.forEach(habillage_LinfoAndroid_ArrayElements);
            sm_orange.forEach(habillage_Orange_ArrayElements);

            const SM_LINFO_HABILLAGE_impression = new Array()
            const SM_LINFO_HABILLAGE_clic = new Array()
            const SM_LINFO_IOS_HABILLAGE_impression = new Array()
            const SM_LINFO_IOS_HABILLAGE_clic = new Array()
            const SM_LINFO_ANDROID_HABILLAGE_impression = new Array()
            const SM_LINFO_ANDROID_HABILLAGE_clic = new Array()
            const SM_ANTENNE_HABILLAGE_impression = new Array()
            const SM_ANTENNE_HABILLAGE_clic = new Array()
            const SM_ORANGE_HABILLAGE_impression = new Array()
            const SM_ORANGE_HABILLAGE_clic = new Array()
            const SM_DTJ_HABILLAGE_impression = new Array()
            const SM_DTJ_HABILLAGE_clic = new Array()

            /*            const SM_LINFO_GRAND_ANGLE_impression = new Array()
                        const SM_LINFO_GRAND_ANGLE_clic = new Array()
                        const SM_LINFO_IOS_GRAND_ANGLE_impression = new Array()
                        const SM_LINFO_IOS_GRAND_ANGLE_clic = new Array()
                        const SM_LINFO_ANDROID_GRAND_ANGLE_impression = new Array()
                        const SM_LINFO_ANDROID_GRAND_ANGLE_clic = new Array()
                        const SM_ANTENNE_GRAND_ANGLE_impression = new Array()
                        const SM_ANTENNE_GRAND_ANGLE_clic = new Array()
                        const SM_ORANGE_GRAND_ANGLE_impression = new Array()
                        const SM_ORANGE_GRAND_ANGLE_clic = new Array()
                        const SM_DTJ_GRAND_ANGLE_impression = new Array()
                        const SM_DTJ_GRAND_ANGLE_clic = new Array()
            */


            const valueToRemove = undefined;
            //push les valeur filtré total  et clique
            for (let i = 0; i < habillage_linfo_impression.length; i++) {
              if (habillage_linfo_impression[i] !== valueToRemove) {

                SM_LINFO_HABILLAGE_impression.push(habillage_linfo_impression[i]);
                SM_LINFO_HABILLAGE_clic.push(habillage_linfo_clic[i]);
              }

            }
            for (let i = 0; i < habillage_infoIos_impression.length; i++) {
              if (habillage_infoIos_impression[i] !== valueToRemove) {

                SM_LINFO_IOS_HABILLAGE_impression.push(habillage_infoIos_impression[i]);
                SM_LINFO_IOS_HABILLAGE_clic.push(habillage_infoIos_clic[i]);
              }
            }
            for (let i = 0; i < habillage_infoAndroid_impression.length; i++) {
              if (habillage_infoAndroid_impression[i] !== valueToRemove) {

                SM_LINFO_ANDROID_HABILLAGE_impression.push(habillage_infoAndroid_impression[i]);
                SM_LINFO_ANDROID_HABILLAGE_clic.push(habillage_infoAndroid_clic[i]);
              }
            }
            for (let i = 0; i < habillage_antenne_impression.length; i++) {

              if (habillage_antenne_impression[i] !== valueToRemove) {
                SM_ANTENNE_HABILLAGE_impression.push(habillage_antenne_impression[i]);
                SM_ANTENNE_HABILLAGE_clic.push(habillage_antenne_clic[i]);
              }
            }
            for (let i = 0; i < habillage_orange_impression.length; i++) {
              if (habillage_orange_impression[i] !== valueToRemove) {
                SM_ORANGE_HABILLAGE_impression.push(habillage_orange_impression[i]);
                SM_ORANGE_HABILLAGE_clic.push(habillage_orange_clic[i]);
              }
            }
            for (let i = 0; i < habillage_dtj_impression.length; i++) {
              if (habillage_dtj_impression[i] !== valueToRemove) {

                SM_DTJ_HABILLAGE_impression.push(habillage_dtj_impression[i]);
                SM_DTJ_HABILLAGE_clic.push(habillage_dtj_clic[i]);
              }
            }
            /*
            for (let i = 0; i < grand_angle_linfo_impression.length; i++) {
              if (grand_angle_linfo_impression[i] !== valueToRemove) {

                SM_LINFO_GRAND_ANGLE_impression.push(grand_angle_linfo_impression[i]);
                SM_LINFO_GRAND_ANGLE_clic.push(grand_angle_linfo_clic[i]);
              }

            }
            for (let i = 0; i < grand_angle_infoIos_impression.length; i++) {
              if (grand_angle_infoIos_impression[i] !== valueToRemove) {

                SM_LINFO_IOS_GRAND_ANGLE_impression.push(grand_angle_infoIos_impression[i]);
                SM_LINFO_IOS_GRAND_ANGLE_clic.push(grand_angle_infoIos_clic[i]);
              }
            }
            for (let i = 0; i < grand_angle_infoAndroid_impression.length; i++) {
              if (grand_angle_infoAndroid_impression[i] !== valueToRemove) {

                SM_LINFO_ANDROID_GRAND_ANGLE_impression.push(grand_angle_infoAndroid_impression[i]);
                SM_LINFO_ANDROID_GRAND_ANGLE_clic.push(grand_angle_infoAndroid_clic[i]);
              }
            }
            for (let i = 0; i < grand_angle_antenne_impression.length; i++) {

              if (grand_angle_antenne_impression[i] !== valueToRemove) {
                SM_ANTENNE_GRAND_ANGLE_impression.push(grand_angle_antenne_impression[i]);
                SM_ANTENNE_GRAND_ANGLE_clic.push(grand_angle_antenne_clic[i]);
              }
            }
            for (let i = 0; i < grand_angle_orange_impression.length; i++) {
              if (grand_angle_orange_impression[i] !== valueToRemove) {
                SM_ORANGE_GRAND_ANGLE_impression.push(grand_angle_orange_impression[i]);
                SM_ORANGE_GRAND_ANGLE_clic.push(grand_angle_orange_clic[i]);
              }
            }
            for (let i = 0; i < grand_angle_dtj_impression.length; i++) {
              if (grand_angle_dtj_impression[i] !== valueToRemove) {

                SM_DTJ_GRAND_ANGLE_impression.push(grand_angle_dtj_impression[i]);
                SM_DTJ_GRAND_ANGLE_clic.push(grand_angle_dtj_clic[i]);
              }
            }
 */

            // Function qui permet de calculer les éléments du tableau (calcul somme impression/clic par format)
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


            // Function qui permet de calculer les éléments du tableau (calcul somme impression/clic par site et format)
            var sommeHabillage_Impression_info = SM_LINFO_HABILLAGE_impression.reduce(reducer, 0);
            var sommeHabillageClicks_info = SM_LINFO_HABILLAGE_clic.reduce(reducer, 0);
            var sommeHabillage_Impression_infoIos = SM_LINFO_IOS_HABILLAGE_impression.reduce(reducer, 0);
            var sommeHabillageClicks_infoIos = SM_LINFO_IOS_HABILLAGE_clic.reduce(reducer, 0);
            var sommeHabillage_Impression_infoAndroid = SM_LINFO_ANDROID_HABILLAGE_impression.reduce(reducer, 0);
            var sommeHabillageClicks_infoAndroid = SM_LINFO_ANDROID_HABILLAGE_clic.reduce(reducer, 0);
            var sommeHabillage_Impression_antenne = SM_ANTENNE_HABILLAGE_impression.reduce(reducer, 0);
            var sommeHabillageClicks_antenne = SM_ANTENNE_HABILLAGE_clic.reduce(reducer, 0);
            var sommeHabillage_Impression_orange = SM_ORANGE_HABILLAGE_impression.reduce(reducer, 0);
            var sommeHabillageClicks_orange = SM_ORANGE_HABILLAGE_clic.reduce(reducer, 0);
            var sommeHabillage_Impression_dtj = SM_DTJ_HABILLAGE_impression.reduce(reducer, 0);
            var sommeHabillageClicks_dtj = SM_DTJ_HABILLAGE_clic.reduce(reducer, 0);

            /*
                        var sommeGrandAngle_Impression_info = SM_LINFO_GRAND_ANGLE_impression.reduce(reducer, 0);
                        var sommeGrandAngleClicks_info = SM_LINFO_GRAND_ANGLE_clic.reduce(reducer, 0);
                        var sommeGrandAngle_Impression_infoIos = SM_LINFO_IOS_GRAND_ANGLE_impression.reduce(reducer, 0);
                        var sommeGrandAngleClicks_infoIos = SM_LINFO_IOS_GRAND_ANGLE_clic.reduce(reducer, 0);
                        var sommeGrandAngle_Impression_infoAndroid = SM_LINFO_ANDROID_GRAND_ANGLE_impression.reduce(reducer, 0);
                        var sommeGrandAngleClicks_infoAndroid = SM_LINFO_ANDROID_GRAND_ANGLE_clic.reduce(reducer, 0);
                        var sommeGrandAngle_Impression_antenne = SM_ANTENNE_GRAND_ANGLE_impression.reduce(reducer, 0);
                        var sommeGrandAngleClicks_antenne = SM_ANTENNE_GRAND_ANGLE_clic.reduce(reducer, 0);
                        var sommeGrandAngle_Impression_orange = SM_ORANGE_GRAND_ANGLE_impression.reduce(reducer, 0);
                        var sommeGrandAngleClicks_orange = SM_ORANGE_GRAND_ANGLE_clic.reduce(reducer, 0);
                        var sommeGrandAngle_Impression_dtj = SM_DTJ_GRAND_ANGLE_impression.reduce(reducer, 0);
                        var sommeGrandAngleClicks_dtj = SM_DTJ_GRAND_ANGLE_clic.reduce(reducer, 0);
            **/


          }


          var TotalImpressions = 0
          var TotalCliks = 0

          for (let i = 0; i < Array_Impression.length; i++) {
            if (Array_Impression[i] != '') {
              TotalImpressions += parseInt(Array_Impression[i])
              TotalCliks += parseInt(Array_Clicks[i])

            }
          }




          //Calcule de taux de clic par format
          CTR_habillage = (sommeHabillageClicks / sommeHabillageImpression) * 100
          CTR_habillage = CTR_habillage.toFixed(2);
          sommeHabillageImpression = new Number(sommeHabillageImpression).toLocaleString("fi-FI")

          CTR_interstitiel = (sommeInterstitielClicks / sommeInterstitielImpression) * 100
          CTR_interstitiel = CTR_interstitiel.toFixed(2);
          sommeInterstitielImpression = new Number(sommeInterstitielImpression).toLocaleString("fi-FI")


          CTR_grand_angle = (sommeGrand_AngleClicks / sommeGrand_AngleImpression) * 100
          CTR_grand_angle = CTR_grand_angle.toFixed(2);
          sommeGrand_AngleImpression = new Number(sommeGrand_AngleImpression).toLocaleString("fi-FI")


          CTR_masthead = (sommeMastheadClicks / sommeMastheadImpression) * 100
          CTR_masthead = CTR_masthead.toFixed(2);
          sommeMastheadImpression = new Number(sommeMastheadImpression).toLocaleString("fi-FI")


          CTR_native = (sommeNativeClicks / sommeNativeImpression) * 100
          CTR_native = CTR_native.toFixed(2);
          sommeNativeImpression = new Number(sommeNativeImpression).toLocaleString("fi-FI")



          //Calcule de taux clic par site
          CTR_habillage_linfo = (sommeHabillageClicks_info / sommeHabillage_Impression_info) * 100
          CTR_habillage_linfo = CTR_habillage_linfo.toFixed(2);
          sommeHabillage_Impression_info = new Number(sommeHabillage_Impression_info).toLocaleString("fi-FI")

          CTR_habillage_linfoios = (sommeHabillageClicks_infoIos / sommeHabillage_Impression_infoIos) * 100
          CTR_habillage_linfoios = CTR_habillage_linfoios.toFixed(2);
          sommeHabillage_Impression_infoIos = new Number(sommeHabillage_Impression_infoIos).toLocaleString("fi-FI")

          CTR_habillage_linfoandroid = (sommeHabillageClicks_infoAndroid / sommeHabillage_Impression_infoAndroid) * 100
          CTR_habillage_linfoandroid = CTR_habillage_linfoandroid.toFixed(2);
          sommeHabillage_Impression_infoAndroid = new Number(sommeHabillage_Impression_infoAndroid).toLocaleString("fi-FI")

          CTR_habillage_antenne = (sommeHabillageClicks_antenne / sommeHabillage_Impression_antenne) * 100
          CTR_habillage_antenne = CTR_habillage_antenne.toFixed(2);
          sommeHabillage_Impression_antenne = new Number(sommeHabillage_Impression_antenne).toLocaleString("fi-FI")

          CTR_habillage_orange = (sommeHabillageClicks_orange / sommeHabillage_Impression_orange) * 100
          CTR_habillage_orange = CTR_habillage_orange.toFixed(2);
          sommeHabillage_Impression_orange = new Number(sommeHabillage_Impression_orange).toLocaleString("fi-FI")

          CTR_habillage_dtj = (sommeHabillageClicks_dtj / sommeHabillage_Impression_dtj) * 100
          CTR_habillage_dtj = CTR_habillage_dtj.toFixed(2);
          sommeHabillage_Impression_dtj = new Number(sommeHabillage_Impression_dtj).toLocaleString("fi-FI")




          /* CTR_grand_angle_linfo = (sommeGrandAngleClicks_info / sommeGrandAngle_Impression_info) * 100
          CTR_grand_angle_linfo = CTR_grand_angle_linfo.toFixed(2);
          sommeGrandAngle_Impression_info = new Number(sommeGrandAngle_Impression_info).toLocaleString("fi-FI")

          CTR_grand_angle_linfoios = (sommeGrandAngleClicks_infoIos / sommeGrandAngle_Impression_infoIos) * 100
          CTR_grand_angle_linfoios = CTR_grand_angle_linfoios.toFixed(2);
          sommeGrandAngle_Impression_infoIos = new Number(sommeGrandAngle_Impression_infoIos).toLocaleString("fi-FI")

          CTR_grand_angle_linfoandroid = (sommeGrandAngleClicks_infoAndroid / sommeGrandAngle_Impression_infoAndroid) * 100
          CTR_grand_angle_linfoandroid = CTR_grand_angle_linfoandroid.toFixed(2);
          sommeGrandAngle_Impression_infoAndroid = new Number(sommeGrandAngle_Impression_infoAndroid).toLocaleString("fi-FI")

          CTR_grand_angle_antenne = (sommeGrandAngleClicks_antenne / sommeGrandAngle_Impression_antenne) * 100
          CTR_grand_angle_antenne = CTR_grand_angle_antenne.toFixed(2);
          sommeGrandAngle_Impression_antenne = new Number(sommeGrandAngle_Impression_antenne).toLocaleString("fi-FI")

          CTR_grand_angle_orange = (sommeGrandAngleClicks_orange / sommeGrandAngle_Impression_orange) * 100
          CTR_grand_angle_orange = CTR_grand_angle_orange.toFixed(2);
          sommeGrandAngle_Impression_orange = new Number(sommeGrandAngle_Impression_orange).toLocaleString("fi-FI")

          CTR_grand_angle_dtj = (sommeGrandAngleClicks_dtj / sommeGrandAngle_Impression_dtj) * 100
          CTR_grand_angle_dtj = CTR_grand_angle_dtj.toFixed(2);
          sommeGrandAngle_Impression_dtj = new Number(sommeGrandAngle_Impression_dtj).toLocaleString("fi-FI")

*/




          var Taux_clics = (TotalCliks / TotalImpressions) * 100
          CTR = Taux_clics.toFixed(2);


          var Impression_vu = (TotalImpressions / Total_VU)
          Repetition = Impression_vu.toFixed(2);



          const timeElapsed = Date.now()
          const today = new Date(timeElapsed);
          var Date_rapport = today.toLocaleDateString()


          TotalImpressions = new Number(TotalImpressions).toLocaleString("fi-FI")
          TotalCliks = new Number(TotalCliks).toLocaleString("fi-FI")
          Total_VU = new Number(Total_VU).toLocaleString("fi-FI");

          var Campagne_name = CampaignName[0]



          var table = {


            Date_rapport,
            Campagne_name,
            StartDate,
            EndDate,

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



          // total impression / total clic / CTR par Habillage par site
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          var sommehabillageImpressions = habillageImpressions.reduce(reducer, 0);
          var sommehabillageClics = habillageClicks.reduce(reducer, 0);

          var habillageCTR_clics = (sommehabillageClics / sommehabillageImpressions) * 100
          habillageCTR_clics = habillageCTR_clics.toFixed(2);


          /*
            var habillageRepetition = []

           for (let i = 0; i < habillageImpressions.length; i++) {
            if (habillageImpressions[i] != '') {
              var total_repetition = habillageImpressions[i] / habillageVU[i]
              habillageRepetition.push(total_repetition.toFixed(2))
            }
          }*/



          var data_habillage = {


            //habillageVU,
            // habillageRepetition,
            habillageSitename,
            habillageImpressions,
            habillageClicks,
            habillageCTR,
            sommehabillageImpressions,
            sommehabillageClics,
            habillageCTR_clics,


          }


          // total impression / total clic / CTR par Interstitiel par site
          var sommeinterstitielImpressions = interstitielImpressions.reduce(reducer, 0);
          var sommeinterstitielClics = interstitielClicks.reduce(reducer, 0);

          var interstitielCTR_clics = (sommeinterstitielClics / sommeinterstitielImpressions) * 100
          interstitielCTR_clics = interstitielCTR_clics.toFixed(2);



          /* var interstitielRepetition = []

           for (let i = 0; i < interstitielImpressions.length; i++) {
             if (interstitielImpressions[i] != '') {
               var total_repetition = interstitielImpressions[i] / interstitielVU[i]
               interstitielRepetition.push(total_repetition.toFixed(2))
             }
           }*/


          var data_interstitiel = {

            interstitielImpressions,
            interstitielClicks,
            interstitielFormatName,
            interstitielSitename,
            interstitielCTR,
            sommeinterstitielImpressions,
            sommeinterstitielClics,
            interstitielCTR_clics
            //interstitielRepetition,
            //interstitielVU,

          }


          // total impression / total clic / CTR par Masthead par site
          var sommemastheadImpressions = mastheadImpressions.reduce(reducer, 0);
          var sommemastheadClics = mastheadClicks.reduce(reducer, 0);

          var mastheadCTR_clics = (sommemastheadClics / sommemastheadImpressions) * 100
          mastheadCTR_clics = mastheadCTR_clics.toFixed(2);


          /*var mastheadRepetition = []

          for (let i = 0; i < mastheadImpressions.length; i++) {
            if (mastheadImpressions[i] != '') {
              var total_repetition = mastheadImpressions[i] / mastheadVU[i]
              mastheadRepetition.push(total_repetition.toFixed(2))
            }
          }*/

          var data_masthead = {

            mastheadImpressions,
            mastheadClicks,
            mastheadFormatName,
            mastheadSitename,
            mastheadCTR,
            sommemastheadImpressions,
            sommemastheadClics,
            mastheadCTR_clics

            //mastheadVU,

            //mastheadRepetition
          }

          // total impression / total clic / CTR par grand_angle par site
          var sommegrand_angleImpressions = grand_angleImpressions.reduce(reducer, 0);
          var sommegrand_angleClics = grand_angleClicks.reduce(reducer, 0);

          var grand_angleCTR_clics = (sommegrand_angleClics / sommegrand_angleImpressions) * 100
          grand_angleCTR_clics = grand_angleCTR_clics.toFixed(2);

          /* var grand_angleRepetition = []

           for (let i = 0; i < grand_angleImpressions.length; i++) {
             if (grand_angleImpressions[i] != '') {
               var total_repetition = grand_angleImpressions[i] / grand_angleVU[i]
               grand_angleRepetition.push(total_repetition.toFixed(2))
             }
           }*/

          var data_grand_angle = {

            grand_angleImpressions,
            grand_angleClicks,
            grand_angleFormatName,
            grand_angleSitename,
            grand_angleCTR,
            sommegrand_angleImpressions,
            sommegrand_angleClics,
            grand_angleCTR_clics
            // grand_angleVU,

            //grand_angleRepetition
          }

          // total impression / total clic / CTR par native par site
          var sommenativeImpressions = nativeImpressions.reduce(reducer, 0);
          var sommenativeClics = nativeClicks.reduce(reducer, 0);

          var nativeCTR_clics = (sommenativeClics / sommenativeImpressions) * 100
          nativeCTR_clics = nativeCTR_clics.toFixed(2);
          /* var nativeRepetition = []

           for (let i = 0; i < nativeImpressions.length; i++) {
             if (nativeImpressions[i] != '') {
               var total_repetition = nativeImpressions[i] / nativeVU[i]
               nativeRepetition.push(total_repetition.toFixed(2))
             }
           }*/

          var data_native = {

            nativeImpressions,
            nativeClicks,
            nativeFormatName,
            nativeSitename,
            //nativeVU,
            nativeCTR,
            sommenativeImpressions,
            sommenativeClics,
            nativeCTR_clics
            //nativeRepetition
          }



          var data_site = {
            sommeHabillage_Impression_info,
            sommeHabillageClicks_info,
            CTR_habillage_linfo,
            sommeHabillage_Impression_infoIos,
            sommeHabillageClicks_infoIos,
            CTR_habillage_linfoios,
            sommeHabillage_Impression_infoAndroid,
            sommeHabillageClicks_infoAndroid,
            CTR_habillage_linfoandroid,
            sommeHabillage_Impression_antenne,
            sommeHabillageClicks_antenne,
            CTR_habillage_antenne,
            sommeHabillage_Impression_orange,
            sommeHabillageClicks_orange,
            CTR_habillage_orange,
            sommeHabillage_Impression_dtj,
            sommeHabillageClicks_dtj,
            CTR_habillage_dtj,

            /*  sommeGrandAngle_Impression_info,
              sommeGrandAngleClicks_info,
              CTR_grand_angle_linfo,
              sommeGrandAngle_Impression_infoIos,
              sommeGrandAngleClicks_infoIos,
              CTR_grand_angle_linfoios,
              sommeGrandAngle_Impression_infoAndroid,
              sommeGrandAngleClicks_infoAndroid,
              CTR_grand_angle_linfoandroid,
              sommeGrandAngle_Impression_antenne,
              sommeGrandAngleClicks_antenne,
              CTR_grand_angle_antenne,
              sommeGrandAngle_Impression_orange,
              sommeGrandAngleClicks_orange,
              CTR_grand_angle_orange,
              sommeGrandAngle_Impression_dtj,
              sommeGrandAngleClicks_dtj,
              CTR_grand_angle_dtj,*/

          }

          res.render('reporting/data-reporting-template.ejs', {
            table: table,
            data_site: data_site,
            data_habillage: data_habillage,
            data_interstitiel: data_interstitiel,
            data_masthead: data_masthead,
            data_grand_angle: data_grand_angle,
            data_native: data_native

          });










        }



      }, 60000);
    }




  } catch (error) {
    console.log(error);
  }





}