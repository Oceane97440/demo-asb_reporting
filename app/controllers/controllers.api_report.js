// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');
const http = require('http');
const https = require('https');

const NodeCache = require("node-cache");
//let csvToJson = require('convert-csv-to-json');
const LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch');

const axios = require(`axios`);

const fs = require('fs')

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
//let file_json = require('./tasksID.json')




exports.index = async (req, res) => {

  if (req.session.user.role == 1) {



    res.render("reporting/dasbord_report.ejs")

  }
}


/*
exports.json_report = async (req, res) => {

  //requête qui recupère tout la liste des rapport
  var tasksId = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/`, '')
  var data = tasksId.data
  var liste_obj = new Array()

  var number_line = data.length
  //convertie obj en json
  JSON.stringify(data);

  for (i = 0; i < number_line; i++) {

    var obj = {};

    obj.id = i

    obj.taskId = [data[i].taskId]
    obj.status = [data[i].status]

    var date_format = new Date([data[i].creationDateUTC]).toLocaleString();
    obj.creationDateUTC = date_format

    liste_obj.push(obj)

  }

  res.json(liste_obj)

}
exports.liste_report = async (req, res) => {

  if ((req.session.user.role == 4) || (req.session.user.role == 1)) {



    res.render("reporting/list_report.ejs")

  }

}
exports.view_report = async (req, res) => {

  let taskId = req.params.taskId;

  let dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');

  res.send(dataFile.data)

}*/
exports.generate = async (req, res) => {

  res.render("reporting/generate.ejs")




}

exports.report = async (req, res) => {
  // display http://127.0.0.1:3000/api/reporting/4455418/1839404 
  //video http://127.0.0.1:3000/api/reporting/443863/1850009


  let advertiserid = req.params.advertiserid;
  let campaignid = req.params.campaignid;

  /* var startDate = {}
  http.get(`http://127.0.0.1:3000/api/manager/campagne_json/${campaignid}`, function (result) {

    let data = '';

    result.on('data', function (chunk) {
      data += chunk;
    })

    result.on('end', () => {

      var obj = {};

      console.log(data.start_date)
     
  
    
    })

  })
console.log(startDate)*/

  try {

    var requestReporting = {

      "startDate": "2021-01-18T00:00:00",

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
        },

        {
          "VideoCount": {
            "Id": "17",
            "OutputName": "Nbr_Complete"
          }
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
    var requestVisitor_unique = {

      "startDate": "2021-01-18T00:00:00",

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
      var taskId = firstLink.data.taskId;
      var taskId2 = threeLink.data.taskId;
/*
      console.log('TaskId : ' + taskId)
      console.log('TaskId2 : ' + taskId2)
      console.log('-------------------')

      var data_taskId = file_json[0].taskid1
      console.log('TaskId save : ' + data_taskId)

      var data_taskId2 = file_json[1].taskid2
      console.log('TaskId2 save : ' + data_taskId2)

    

      if (data_taskId !== taskId || data_taskId2 !== taskId2 ) {
        var date_creation = new Date().toLocaleString();


        let data = [{
            "taskid1": taskId,
            "date_create": date_creation,

          },
          {
            "taskid2": taskId2,
            "date_create": date_creation
          }
        ]

        let donnees = JSON.stringify(data)
        console.log(donnees)
        console.log(data)

        fs.writeFile('tasksID.json', donnees, function (erreur) {
          if (erreur) {
            console.log(erreur)
          }
        })
      }else{
        var dataFile2 = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${data_taskId2}/file`, '');
       var dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${data_taskId}/file`, '');
     } 
*/
      //excute le script interval de temps



      let requête1 = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`
      let requête2 = `https://reporting.smartadserverapis.com/2044/reports/${taskId2}`


      let timerFile = setInterval(async () => {
        let fourLink = await AxiosFunction.getReportingData('GET', requête2, '');

        let secondLink = await AxiosFunction.getReportingData('GET', requête1, '');


        if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (secondLink.data.lastTaskInstance.jobProgress == '1.0')) {

          clearInterval(timerFile);


             dataFile2 = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId2}/file`, '');
             dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');

        
          

        //console.log(dataFile)


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

          //traitement des resultat requête 1
          const CampaignStartDate = []
          const CampaignEndtDate = []
          const CampaignName = []
          const InsertionName = []
          const FormatName = []
          const SiteName = []
          const Impressions = []
          const ClickRate = []
          const Clicks = []
          const Complete = []

          var data_reporting = dataFile.data
          var data_split = data_reporting.split(/\r?\n/);
          var number_line = data_split.length;

          for (i = 1; i < number_line; i++) {
            //split push les données dans chaque colone
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
            Complete.push(line[9]);


          }



          //Convertie les Timestamp campagne startdate et enddate / date du jour
          function getDateTimeFromTimestamp(unixTimeStamp) {
            let date = new Date(unixTimeStamp);
            return ('0' + date.getDate()).slice(-2) + '/' + ('0' + (date.getMonth() + 1)).slice(-2) + '/' + date.getFullYear() + ' ' + ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
          }
          var t1 = parseInt(CampaignStartDate[0])
          var t2 = parseInt(CampaignEndtDate[0])
          const timeElapsed = Date.now()
          const Date_rapport = getDateTimeFromTimestamp(timeElapsed);

          const StartDate = getDateTimeFromTimestamp(t1);
          const EndDate = getDateTimeFromTimestamp(t2);



          //filte les array exclure les valeur undefined qui empêche le calcule des somme

          const Array_Impression = [];
          const Array_Clicks = [];
          const Array_InsertionName = [];
          const Array_SiteName = [];
          const Array_FormatName = [];
          const Array_ClickRate = [];
          const Array_Complete = [];


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
              Array_Complete.push(Complete[i]);


            }
          }

          //test si le tableau est un array + si il comporte 1 éléments dans l'array
          if ((InsertionName.length > 1) && (Array.isArray(InsertionName) === true)) {

            var habillage = new Array()
            var interstitiel = new Array()
            var grand_angle = new Array()
            var masthead = new Array()
            var native = new Array()
            var video = new Array()


            var interstitielImpressions = new Array()
            var interstitielClicks = new Array()
            var interstitielSitename = new Array()
            var interstitielFormatName = new Array()
            var interstitielCTR = new Array()


            var habillageImpressions = new Array()
            var habillageClicks = new Array()
            var habillageSitename = new Array()
            var habillageFormatName = new Array()
            var habillageCTR = new Array()


            var mastheadImpressions = new Array()
            var mastheadClicks = new Array()
            var mastheadSitename = new Array()
            var mastheadFormatName = new Array()
            var mastheadCTR = new Array()

            var grand_angleImpressions = new Array()
            var grand_angleClicks = new Array()
            var grand_angleSitename = new Array()
            var grand_angleFormatName = new Array()
            var grand_angleCTR = new Array()

            var nativeImpressions = new Array()
            var nativeClicks = new Array()
            var nativeSitename = new Array()
            var nativeFormatName = new Array()
            var nativeCTR = new Array()

            var videoImpressions = new Array()
            var videoClicks = new Array()
            var videoSitename = new Array()
            var videoFormatName = new Array()
            var videoCTR = new Array()
            var videoComplete = new Array()


            //regex sur les insertions name si il y a match push dans le tableau qui correspond au format
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
              if (word.match(/PREROLL/gi)) {
                video.push(index);
              }
              if (word.match(/MIDROLL/gi)) {
                video.push(index);
              }

            });


            async function VideoArrayElements(element, index, array) {

              videoImpressions.push(eval(Array_Impression[element]));
              videoClicks.push(eval(Array_Clicks[element]));
              videoSitename.push(Array_SiteName[element]);
              videoFormatName.push(Array_FormatName[element]);
              videoComplete.push(eval(Array_Complete[element]));
              let v = Math.round(Array_ClickRate[element] * 100) / 100
              videoCTR.push(v);
            }

            // Function foreach qui met dans un tableau les impressions correspondant au format
            async function interstitielArrayElements(element, index, array) {
              // Rajouter les immpresions  et clics des formats
              interstitielImpressions.push(eval(Array_Impression[element]));
              interstitielClicks.push(eval(Array_Clicks[element]));
              interstitielSitename.push(Array_SiteName[element]);
              interstitielFormatName.push(Array_FormatName[element]);
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

            }



            async function mastheadArrayElements(element, index, array) {
              mastheadImpressions.push(eval(Array_Impression[element]));
              mastheadClicks.push(eval(Array_Clicks[element]));
              mastheadSitename.push(Array_SiteName[element]);
              mastheadFormatName.push(Array_FormatName[element]);
              let m = Math.round(Array_ClickRate[element] * 100) / 100
              mastheadCTR.push(m);

            }
            //faire un agration de site ( grand_angle_LINFO.push(sm_linfo[element]);)
            async function grand_angleArrayElements(element, index, array) {
              // Rajouter les immpresions  et clics des formats
              grand_angleImpressions.push(eval(Array_Impression[element]));
              grand_angleClicks.push(eval(Array_Clicks[element]));
              grand_angleSitename.push(Array_SiteName[element]);
              grand_angleFormatName.push(Array_FormatName[element]);
              let g = Math.round(Array_ClickRate[element] * 100) / 100
              grand_angleCTR.push(g);


            }


            async function nativeArrayElements(element, index, array) {
              nativeImpressions.push(eval(Array_Impression[element]));
              nativeClicks.push(eval(Array_Clicks[element]));
              nativeSitename.push(Array_SiteName[element]);
              nativeFormatName.push(Array_FormatName[element]);
              let n = Math.round(Array_ClickRate[element] * 100) / 100
              nativeCTR.push(n);

            }



            interstitiel.forEach(interstitielArrayElements);
            habillage.forEach(habillageArrayElements);
            masthead.forEach(mastheadArrayElements);
            grand_angle.forEach(grand_angleArrayElements);
            native.forEach(nativeArrayElements);
            video.forEach(VideoArrayElements)



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

            var sommeVideoImpression = videoImpressions.reduce(reducer, 0);
            var sommeVideoClicks = videoClicks.reduce(reducer, 0);






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


          }


          var TotalImpressions = 0
          var TotalCliks = 0
          var TotalComplete = 0
          //somme impression clic complete
          for (let i = 0; i < Array_Impression.length; i++) {
            if (Array_Impression[i] != '') {
              TotalImpressions += parseInt(Array_Impression[i])
              TotalCliks += parseInt(Array_Clicks[i])
              TotalComplete += parseInt(Array_Complete[i])


            }
          }


          CTR_video = (sommeVideoClicks / sommeVideoImpression) * 100
          CTR_video = CTR_video.toFixed(2);

          //Calcule de taux de clic par format
          CTR_habillage = (sommeHabillageClicks / sommeHabillageImpression) * 100
          CTR_habillage = CTR_habillage.toFixed(2);

          CTR_interstitiel = (sommeInterstitielClicks / sommeInterstitielImpression) * 100
          CTR_interstitiel = CTR_interstitiel.toFixed(2);


          CTR_grand_angle = (sommeGrand_AngleClicks / sommeGrand_AngleImpression) * 100
          CTR_grand_angle = CTR_grand_angle.toFixed(2);


          CTR_masthead = (sommeMastheadClicks / sommeMastheadImpression) * 100
          CTR_masthead = CTR_masthead.toFixed(2);


          CTR_native = (sommeNativeClicks / sommeNativeImpression) * 100
          CTR_native = CTR_native.toFixed(2);



          //Calcule de taux clic par site
          CTR_habillage_linfo = (sommeHabillageClicks_info / sommeHabillage_Impression_info) * 100
          CTR_habillage_linfo = CTR_habillage_linfo.toFixed(2);

          CTR_habillage_linfoios = (sommeHabillageClicks_infoIos / sommeHabillage_Impression_infoIos) * 100
          CTR_habillage_linfoios = CTR_habillage_linfoios.toFixed(2);

          CTR_habillage_linfoandroid = (sommeHabillageClicks_infoAndroid / sommeHabillage_Impression_infoAndroid) * 100
          CTR_habillage_linfoandroid = CTR_habillage_linfoandroid.toFixed(2);

          CTR_habillage_antenne = (sommeHabillageClicks_antenne / sommeHabillage_Impression_antenne) * 100
          CTR_habillage_antenne = CTR_habillage_antenne.toFixed(2);

          CTR_habillage_orange = (sommeHabillageClicks_orange / sommeHabillage_Impression_orange) * 100
          CTR_habillage_orange = CTR_habillage_orange.toFixed(2);

          CTR_habillage_dtj = (sommeHabillageClicks_dtj / sommeHabillage_Impression_dtj) * 100
          CTR_habillage_dtj = CTR_habillage_dtj.toFixed(2);


          //Calcul des chiffre global %Taux clic Repetition %VTR
          Taux_VTR = (TotalComplete / TotalImpressions) * 100
          VTR = Taux_VTR.toFixed(2);

          var Taux_clics = (TotalCliks / TotalImpressions) * 100
          CTR = Taux_clics.toFixed(2);

          var Impression_vu = (TotalImpressions / Total_VU)
          Repetition = Impression_vu.toFixed(2);




          //SEPARATEUR DE MILLIER
          TotalImpressions = new Number(TotalImpressions).toLocaleString("fi-FI")
          TotalCliks = new Number(TotalCliks).toLocaleString("fi-FI")
          Total_VU = new Number(Total_VU).toLocaleString("fi-FI");

          sommeVideoImpression = new Number(sommeVideoImpression).toLocaleString("fi-FI")
          sommeHabillageImpression = new Number(sommeHabillageImpression).toLocaleString("fi-FI")
          sommeInterstitielImpression = new Number(sommeInterstitielImpression).toLocaleString("fi-FI")
          sommeGrand_AngleImpression = new Number(sommeGrand_AngleImpression).toLocaleString("fi-FI")
          sommeMastheadImpression = new Number(sommeMastheadImpression).toLocaleString("fi-FI")
          sommeNativeImpression = new Number(sommeNativeImpression).toLocaleString("fi-FI")
          sommeHabillage_Impression_info = new Number(sommeHabillage_Impression_info).toLocaleString("fi-FI")
          sommeHabillage_Impression_infoIos = new Number(sommeHabillage_Impression_infoIos).toLocaleString("fi-FI")
          sommeHabillage_Impression_infoAndroid = new Number(sommeHabillage_Impression_infoAndroid).toLocaleString("fi-FI")
          sommeHabillage_Impression_antenne = new Number(sommeHabillage_Impression_antenne).toLocaleString("fi-FI")
          sommeHabillage_Impression_orange = new Number(sommeHabillage_Impression_orange).toLocaleString("fi-FI")
          sommeHabillage_Impression_dtj = new Number(sommeHabillage_Impression_dtj).toLocaleString("fi-FI")

          var Campagne_name = CampaignName[0]


          var table = {

            //info rapport
            Date_rapport,
            Campagne_name,
            StartDate,
            EndDate,
            //DATA
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
            TotalComplete,
            VTR,

            sommeHabillageImpression,
            sommeInterstitielImpression,
            sommeGrand_AngleImpression,
            sommeMastheadImpression,
            sommeNativeImpression,
            sommeVideoImpression,

            sommeHabillageClicks,
            sommeInterstitielClicks,
            sommeGrand_AngleClicks,
            sommeMastheadClicks,
            sommeNativeClicks,
            sommeVideoClicks,

            CTR_habillage,
            CTR_interstitiel,
            CTR_grand_angle,
            CTR_masthead,
            CTR_native,
            CTR_video

          }


          // total impression / total clic / CTR par Habillage par site
          const reducer = (accumulator, currentValue) => accumulator + currentValue;
          var sommevideoImpressions = videoImpressions.reduce(reducer, 0);
          var sommevideoClics = videoClicks.reduce(reducer, 0);
          var videoCTR_clics = (videoClicks / videoImpressions) * 100
          videoCTR_clics = videoCTR_clics.toFixed(2);

          var sommehabillageImpressions = habillageImpressions.reduce(reducer, 0);
          var sommehabillageClics = habillageClicks.reduce(reducer, 0);
          var habillageCTR_clics = (sommehabillageClics / sommehabillageImpressions) * 100
          habillageCTR_clics = habillageCTR_clics.toFixed(2);

          // total impression / total clic / CTR par Interstitiel par site
          var sommeinterstitielImpressions = interstitielImpressions.reduce(reducer, 0);
          var sommeinterstitielClics = interstitielClicks.reduce(reducer, 0);
          var interstitielCTR_clics = (sommeinterstitielClics / sommeinterstitielImpressions) * 100
          interstitielCTR_clics = interstitielCTR_clics.toFixed(2);

          // total impression / total clic / CTR par Masthead par site
          var sommemastheadImpressions = mastheadImpressions.reduce(reducer, 0);
          var sommemastheadClics = mastheadClicks.reduce(reducer, 0);
          var mastheadCTR_clics = (sommemastheadClics / sommemastheadImpressions) * 100
          mastheadCTR_clics = mastheadCTR_clics.toFixed(2);


          // total impression / total clic / CTR par grand_angle par site
          var sommegrand_angleImpressions = grand_angleImpressions.reduce(reducer, 0);
          var sommegrand_angleClics = grand_angleClicks.reduce(reducer, 0);
          var grand_angleCTR_clics = (sommegrand_angleClics / sommegrand_angleImpressions) * 100
          grand_angleCTR_clics = grand_angleCTR_clics.toFixed(2);

          // total impression / total clic / CTR par native par site
          var sommenativeImpressions = nativeImpressions.reduce(reducer, 0);
          var sommenativeClics = nativeClicks.reduce(reducer, 0);
          var nativeCTR_clics = (sommenativeClics / sommenativeImpressions) * 100
          nativeCTR_clics = nativeCTR_clics.toFixed(2);



          var data_video = {

            videoImpressions,
            videoClicks,
            videoSitename,
            videoFormatName,
            videoCTR,
            videoComplete,
            sommevideoImpressions,
            sommevideoClics,
            videoCTR_clics

          }



          var data_habillage = {


            habillageSitename,
            habillageImpressions,
            habillageClicks,
            habillageCTR,
            sommehabillageImpressions,
            sommehabillageClics,
            habillageCTR_clics,


          }


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


          var data_masthead = {

            mastheadImpressions,
            mastheadClicks,
            mastheadFormatName,
            mastheadSitename,
            mastheadCTR,
            sommemastheadImpressions,
            sommemastheadClics,
            mastheadCTR_clics

          }


          var data_grand_angle = {

            grand_angleImpressions,
            grand_angleClicks,
            grand_angleFormatName,
            grand_angleSitename,
            grand_angleCTR,
            sommegrand_angleImpressions,
            sommegrand_angleClics,
            grand_angleCTR_clics

          }

          var data_native = {

            nativeImpressions,
            nativeClicks,
            nativeFormatName,
            nativeSitename,
            nativeCTR,
            sommenativeImpressions,
            sommenativeClics,
            nativeCTR_clics

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


          }

          res.render('reporting/data-reporting-template.ejs', {
            table: table,
            data_site: data_site,
            data_habillage: data_habillage,
            data_interstitiel: data_interstitiel,
            data_masthead: data_masthead,
            data_grand_angle: data_grand_angle,
            data_native: data_native,
            data_video: data_video
          });










        }



      }, 60000);
    }




  } catch (error) {
    console.log(error);
  }




  /* var interstitielRepetition = []

   for (let i = 0; i < interstitielImpressions.length; i++) {
     if (interstitielImpressions[i] != '') {
       var total_repetition = interstitielImpressions[i] / interstitielVU[i]
       interstitielRepetition.push(total_repetition.toFixed(2))
     }
   }*/


}