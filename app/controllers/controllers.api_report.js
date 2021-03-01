// Initialise le module
const http = require('http');
const https = require('https');
const fs = require('fs')
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./scratch');

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
const ModelAdvertiser = require("../models/models.advertiser")
const ModelCampaigns = require("../models/models.campaigns")

exports.test = async (req, res) => {

  const Array_InsertionName = [
    'PREROLL - APPLI LINFO / LINFO / ANTENNE REUNION',
    'PREROLL - APPLI LINFO / LINFO / ANTENNE REUNION',
    'PREROLL - APPLI LINFO / LINFO / ANTENNE REUNION',
    'PREROLL - APPLI LINFO / LINFO / ANTENNE REUNION',
    'PREROLL - APPLI LINFO / LINFO / ANTENNE REUNION',
    'MIDROLL - APPLI LINFO / LINFO / ANTENNE REUNION',
    'PREROLL - DAILYMOTION',
    'PREROLL - TF1 / M6',
    'PREROLL - TF1 / M6',
    'MIDROLL - TF1 / M6',
    'MIDROLL - TF1 / M6',
    '**Smart Test** PREROLL - APPLI LINFO / LINFO / ANTENNE REUNION',
    'MASTHEAD - Smart - Test - Display - Geo',
  ]


  var habillage = new Array()
  var interstitiel = new Array()
  var grand_angle = new Array()
  var masthead = new Array()
  var native = new Array()
  var video = new Array()




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

  /*

    console.log(habillage)
    console.log(interstitiel)
    console.log(grand_angle)
    console.log(masthead)
    console.log(native)
    console.log(video)*/


  var sm_linfo = new Array()
  var sm_linfo_android = new Array()
  var sm_linfo_ios = new Array()
  var sm_antenne = new Array()
  var sm_dtj = new Array()
  var sm_orange = new Array()

  const Array_SiteName = [
    'SiteName',
    'SM_LINFO - IOS',
    'SM_LINFO-ANDROID',
    'SM_ANTENNEREUNION',
    'SM_LINFO.re',
    'SM_ANTENNEREUNION',
    'SM_DAILYMOTION',
    'SM_M6',
    'SM_TF1',
    'SM_M6',
    'SM_TF1',
    'SM_LINFO-ANDROID',
    'SM_LINFO.re',


  ]


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

  })

  console.log(sm_linfo)
  console.log(sm_linfo_android)
  console.log(sm_linfo_ios)
  console.log(sm_antenne)
  console.log(sm_dtj)
  console.log(sm_orange)


}



exports.index = async (req, res) => {

  if (req.session.user.role == 1) {



    res.render("reporting/dasbord_report.ejs")

  }
}



exports.generate = async (req, res) => {

  //recupère en parametre get id annonceur / id campagne / date de debut
  let advertiserid = req.params.advertiserid;
  let campaignid = req.params.campaignid;
  let startDate = req.params.startdate



  var campaign = await ModelCampaigns.findOne({
    attributes: ['campaign_id', 'campaign_name', 'advertiser_id', 'start_date', 'end_date'],

    where: {
      campaign_id: req.params.campaignid,
      advertiser_id: req.params.advertiserid

    },
    include: [{
      model: ModelAdvertiser
    }],

  })

  res.render("reporting/generate.ejs", {
    advertiserid: advertiserid,
    campaignid: campaignid,
    startDate: startDate,
    campaign: campaign
  })




}

exports.report = async (req, res) => {

  //fonctionnalité génération du rapport

  //let advertiserid = req.params.advertiserid;
  let campaignid = req.params.campaignid;
  let startDate = req.params.startdate;


  try {



    var data_localStorage = localStorage.getItem('campagneId' + '-' + campaignid);


    //si le localStorage exsite -> affiche la data du localstorage
    if (data_localStorage) {

      //convertie la date JSON en objet
      var data_report_view = JSON.parse(data_localStorage);

      var date_expire = data_report_view.date_expiry

      //date aujourd'hui en timestamp
      const now = new Date()
      var timestamp_now = now.getTime()
      // console.log('Time_now:' + timestamp_now)
      //date expiration du rapport en timestamp
      //console.log('Time_expire:' + date_expire)

      //si la date expiration est < à la date du jour on garde la cache
      if (timestamp_now < date_expire) {


        //console.log('cache');

        //interval de temps <2h
        var dts_campaignid = data_report_view.ls_campaignid
        var dts_table = data_report_view.table
        var dts_data_habillage = data_report_view.data_habillage
        var dts_data_interstitiel = data_report_view.data_interstitiel
        var dts_data_masthead = data_report_view.data_masthead
        var dts_data_grand_angle = data_report_view.data_grand_angle
        var dts_data_native = data_report_view.data_native
        var dts_data_video = data_report_view.data_video


        res.render('reporting/data-reporting-template.ejs', {
          table: dts_table,
          data_habillage: dts_data_habillage,
          data_interstitiel: dts_data_interstitiel,
          data_masthead: dts_data_masthead,
          data_grand_angle: dts_data_grand_angle,
          data_native: dts_data_native,
          data_video: dts_data_video,
          iscache: true
        });



      }









    } else {

      //si le local storage est expiré ou n'existe pas supprime item précédant
      localStorage.removeItem('campagneId' + '-' + campaignid);

      //initialisation des requêtes


      var requestReporting = {

        "startDate": startDate,

        "endDate": "CURRENT_DAY+1",

        "fields": [

          {
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
            "SiteId": {}
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

            // "AdvertiserId": [

            //   advertiserid

            // ],

            "CampaignId": [

              campaignid

            ]

          }

        ]

      }


      //Requête visitor unique
      var requestVisitor_unique = {

        "startDate": startDate,

        "endDate": "CURRENT_DAY+1",

        "fields": [

          {
            "UniqueVisitors": {}
          }

        ],

        "filter": [{
            // "AdvertiserId": [advertiserid],

            "CampaignId": [campaignid]

          }

        ]

      }


      // 1) Requête POST 
      let firstLink = await AxiosFunction.getReportingData('POST', '', requestReporting);
      let threeLink = await AxiosFunction.getReportingData('POST', '', requestVisitor_unique);



      if (firstLink.data.taskId || threeLink.data.taskId) {
        var taskId = firstLink.data.taskId;
        var taskId2 = threeLink.data.taskId;

        /*console.log(taskId)
         console.log(requestReporting)

         console.log('---------------')

         console.log(taskId2)
         console.log(requestVisitor_unique)
         console.log('---------------')*/




        let requête1 = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`
        let requête2 = `https://reporting.smartadserverapis.com/2044/reports/${taskId2}`

        //2) Requête GET boucle jusqu'a que le rapport génère 100% delais 1min

        let timerFile = setInterval(async () => {
          let fourLink = await AxiosFunction.getReportingData('GET', requête2, '');

          let secondLink = await AxiosFunction.getReportingData('GET', requête1, '');


          if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (secondLink.data.lastTaskInstance.jobProgress == '1.0') &&
            (fourLink.data.lastTaskInstance.instanceStatus == 'SUCCESS') && (secondLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')
          ) {

            clearInterval(timerFile);

            //3) Récupère la date de chaque requête
            dataFile2 = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId2}/file`, '');
            dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');

            //console.log(dataFile)

            //4) Traitement des données pour affiché dans le vue

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
            const SiteId = []
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
              SiteId.push(line[5])
              SiteName.push(line[6])
              Impressions.push(line[7]);
              ClickRate.push(line[8]);
              Clicks.push(line[9]);
              Complete.push(line[10]);


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
            const Array_SiteID = [];
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
                Array_SiteID.push(SiteId[i]);
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

                if (word.match(/^\INTERSTITIEL{1}/igm)) {
                  interstitiel.push(index);
                }
                if (word.match(/^\HABILLAGE{1}/igm)) {
                  habillage.push(index);
                }
                if (word.match(/^\MASTHEAD{1}/igm)) {
                  masthead.push(index);
                }
                if (word.match(/^\GRAND ANGLE{1}/igm)) {
                  grand_angle.push(index);
                }
                if (word.match(/^\NATIVE{1}/igm)) {
                  native.push(index);
                }
                if (word.match(/^\PREROLL{1}/gim)) {
                  video.push(index);
                }
                if (word.match(/^\MIDROLL{1}/gim)) {
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
              var sm_tf1 = new Array()
              var sm_m6 = new Array()
              var sm_immo974 = new Array()
              var sm_dailymotion = new Array()
              var sm_actu_reunion_ios = new Array()
              var sm_actu_reunion_android = new Array()
              var sm_rodzafer_ios = new Array()
              var sm_rodzafer_android = new Array()
              var sm_rodzafer_lp = new Array()
              var sm_rodali = new Array()











              /*   var habillage_linfo_impression = new Array()
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
                 var habillage_orange_clic = new Array()*/





              Array_SiteName.filter(function (word, index) {


                if (word.match(/322433/gi)) {
                  sm_linfo.push(index);
                }
                if (word.match(/299249/gi)) {
                  sm_linfo_android.push(index);
                }
                if (word.match(/299248/gi)) {
                  sm_linfo_ios.push(index);
                }
                if (word.match(/323124/gi)) {
                  sm_dtj.push(index);
                }
                if (word.match(/299263/gi)) {
                  sm_antenne.push(index);
                }
                if (word.match(/299252/gi)) {
                  sm_orange.push(index);
                }
                if (word.match(/299245/gi)) {
                  sm_tf1.push(index);
                }
                if (word.match(/299244/gi)) {
                  sm_m6.push(index);
                }
                if (word.match(/389207/gi)) {
                  sm_immo974.push(index);
                }
                if (word.match(/337707/gi)) {
                  sm_dailymotion.push(index);
                }
                if (word.match(/299253/gi)) {
                  sm_actu_reunion_ios.push(index);
                }
                if (word.match(/299254/gi)) {
                  sm_actu_reunion_android.push(index);
                }
                if (word.match(/336662/gi)) {
                  sm_rodzafer_ios.push(index);
                }
                if (word.match(/336733/gi)) {
                  sm_rodzafer_android.push(index);
                }
                if (word.match(/371544/gi)) {
                  sm_rodzafer_lp.push(index);
                }
                if (word.match(/369138/gi)) {
                  sm_rodali.push(index);
                }



              });

              console.log(sm_linfo)
              console.log(sm_linfo_android)
              console.log(sm_linfo_ios)
              console.log(sm_antenne)
              console.log(sm_dtj)
              console.log(sm_orange)
              console.log(sm_tf1)
              console.log(sm_m6)
              console.log(sm_immo974)
              console.log(sm_dailymotion)
              console.log(sm_actu_reunion_ios)
              console.log(sm_actu_reunion_android)
              console.log(sm_rodzafer_ios)
              console.log(sm_rodzafer_android)
              console.log(sm_rodzafer_lp)
              console.log(sm_rodali)

              /*
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
              var sommeVideoImpression = videoImpressions.reduce(reducer, 0);
              var sommeVideoClicks = videoClicks.reduce(reducer, 0);





              /*
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
              */

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



            /*        //Calcule de taux clic par site
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
*/

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
            /* sommeHabillage_Impression_info = new Number(sommeHabillage_Impression_info).toLocaleString("fi-FI")
             sommeHabillage_Impression_infoIos = new Number(sommeHabillage_Impression_infoIos).toLocaleString("fi-FI")
             sommeHabillage_Impression_infoAndroid = new Number(sommeHabillage_Impression_infoAndroid).toLocaleString("fi-FI")
             sommeHabillage_Impression_antenne = new Number(sommeHabillage_Impression_antenne).toLocaleString("fi-FI")
             sommeHabillage_Impression_orange = new Number(sommeHabillage_Impression_orange).toLocaleString("fi-FI")
             sommeHabillage_Impression_dtj = new Number(sommeHabillage_Impression_dtj).toLocaleString("fi-FI")*/

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

            /*          var data_site = {
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
            */

            // var ttl = 7200 //2h
            const now = new Date()
            var timestamp_now = now.getTime()
            var timestamp_expire = now.setHours(now.getHours() + 2);

            var testObject = {
              'campaign_id': campaignid,
              'date_now': timestamp_now,
              'date_expiry': timestamp_expire,
              'table': table,
              'data_habillage': data_habillage,
              'data_interstitiel': data_interstitiel,
              'data_masthead': data_masthead,
              'data_grand_angle': data_grand_angle,
              'data_native': data_native,
              'data_video': data_video

            };


            localStorage.setItem('campagneId' + '-' + campaignid, JSON.stringify(testObject));


            res.render('reporting/data-reporting-template.ejs', {
              table: table,
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

    }



  } catch (error) {
    console.log(error)
    var statusCoded = error.response.status;

    res.render("error.ejs", {
      statusCoded: statusCoded,
      advertiserid: advertiserid,
      campaignid: campaignid,
      startDate: startDate,
    })


  }



}

exports.report_view = async (req, res) => {

  // Retrieve the object from storage
  var data_report = localStorage.getItem('testObject');

  var data_report_view = JSON.parse(data_report);

  var campaignid = data_report_view.campaignid
  var table = data_report_view.table
  var data_habillage = data_report_view.data_habillage
  var data_interstitiel = data_report_view.data_interstitiel
  var data_masthead = data_report_view.data_masthead
  var data_grand_angle = data_report_view.data_grand_angle
  var data_native = data_report_view.data_native
  var data_video = data_report_view.data_video

  //console.log(campaignid)





  res.render('reporting/data-reporting-template.ejs', {
    table: table,
    data_habillage: data_habillage,
    data_interstitiel: data_interstitiel,
    data_masthead: data_masthead,
    data_grand_angle: data_grand_angle,
    data_native: data_native,
    data_video: data_video
  })

}