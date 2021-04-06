// Initialise le module
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('./report_storage');
localStorage_tasks = new LocalStorage('./taskID');


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
const ModelAdvertiser = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");

exports.test = async (req, res) => {


  let timer = setInterval(function () {
    console.log('counter :   ' + counter);

    counter += 1000;

    if (counter >= 10000) {
      clearInterval(timer);
    }
  }, 1000);


}



exports.index = async (req, res) => {

  if (req.session.user.role == 1) {


    res.render("reporting/dasbord_report.ejs");

  }
}



exports.generate = async (req, res) => {

  //recupère en parametre get id annonceur / id campagne / date de debut
  let advertiserid = req.params.advertiserid;
  let campaignid = req.params.campaignid;
  let startDate = req.params.startdate;
  let endDate = req.params.enddate;


  const timestamp_startdate = Date.parse(startDate);
  const date_now = Date.now();




  var campaign = await ModelCampaigns.findOne({
    attributes: ['campaign_id', 'campaign_name', 'advertiser_id', 'start_date', 'end_date'],

    where: {
      campaign_id: req.params.campaignid,
      advertiser_id: req.params.advertiserid

    },
    include: [{
      model: ModelAdvertiser
    }],

  });

  res.render("reporting/generate.ejs", {
    advertiserid: advertiserid,
    campaignid: campaignid,
    startDate: startDate,
    endDate: endDate,
    campaign: campaign,
    timestamp_startdate: timestamp_startdate,
    date_now: date_now
  })




}

exports.report = async (req, res) => {

  //fonctionnalité generation du rapport

  let advertiserid = req.params.advertiserid;
  let campaignid = req.params.campaignid;
  let startDate = req.params.startdate;
  let EndtDate = req.params.enddate;



  try {


    var data_localStorage = localStorage.getItem('campagneId' + '-' + campaignid);

    //si le localStorage exsite -> affiche la data du localstorage
    if (data_localStorage) {

      //convertie la date JSON en objet
      var data_report_view = JSON.parse(data_localStorage);

      var date_expiry = data_report_view.date_expiry;



      //date aujourd'hui en timestamp
      const now = new Date();
      var timestamp_now = now.getTime();

      //si la date expiration est < a  la date du jour on garde la cache
      if (timestamp_now < date_expiry) {


        //interval de temps <2h
        var dts_table = data_report_view.table;
        var dts_data_habillage = data_report_view.data_habillage;
        var dts_data_interstitiel = data_report_view.data_interstitiel;
        var dts_data_masthead = data_report_view.data_masthead;
        var dts_data_grand_angle = data_report_view.data_grand_angle;
        var dts_data_native = data_report_view.data_native;
        var dts_data_video = data_report_view.data_video;
        var dts_date_expiry = data_report_view.date_expirer;

        res.render('reporting/data-reporting-template.ejs', {
          table: dts_table,
          data_habillage: dts_data_habillage,
          data_interstitiel: dts_data_interstitiel,
          data_masthead: dts_data_masthead,
          data_grand_angle: dts_data_grand_angle,
          data_native: dts_data_native,
          data_video: dts_data_video,
          data_expirer: dts_date_expiry
        });



      } else {
        //si le local storage est expire supprime item precedent et les taskid
        localStorage.removeItem('campagneId' + '-' + campaignid);
        localStorage_tasks.removeItem('campagneId' + '-' + campaignid + '-' + "task_global");
        localStorage_tasks.removeItem('campagneId' + '-' + campaignid + '-' + "task_global_vu");

        res.redirect(`/reporting/generate/${advertiserid}/${campaignid}/${startDate}`);

      }


    } else {

      const timestamp_enddate = Date.parse(EndtDate);


      const now = new Date();
      var timestamp_datenow = now.getTime();

      //si la date du jour est > à la date de fin on prend la date de fin sinon la date du jour
      if (timestamp_enddate < timestamp_datenow) {

        var end_date = EndtDate;



      } else {

        var end_date = "CURRENT_DAY+1";


      }

      //initialisation des requÃªtes
      var requestReporting = {

        "startDate": startDate,

        "endDate": end_date,

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

      //test si la date de fin de la campagne est => date au jourd'hui = 31j ne pas effectuer la requête
      //date_fin - date du jour = nbr jour

      //RequÃªte visitor unique
      var requestVisitor_unique = {

        "startDate": startDate,

        "endDate": end_date,

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


      // 1) RequÃªte POST 
      let firstLink = await AxiosFunction.getReportingData('POST', '', requestReporting);
      let twoLink = await AxiosFunction.getReportingData('POST', '', requestVisitor_unique);



      if (firstLink.data.taskId || twoLink.data.taskId) {
        var taskId = firstLink.data.taskId;
        var taskId_uu = twoLink.data.taskId;



        let requete_global = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`;
        let requete_vu = `https://reporting.smartadserverapis.com/2044/reports/${taskId_uu}`;

        //2) Requete GET boucle jusqu'a que le rapport generer 100% delais 1min
        //on commence à 10sec
        var time = 10000;
        let timerFile = setInterval(async () => {

          //on incremente + 10sec
          time += 10000;

          // DATA STORAGE - TASK 1 et 2
          var dataLSTaskGlobal = localStorage_tasks.getItem('campagneId' + '-' + campaignid + '-' + "task_global");
          var dataLSTaskGlobalVU = localStorage_tasks.getItem('campagneId' + '-' + campaignid + '-' + "task_global_vu");

          if (!dataLSTaskGlobal || !dataLSTaskGlobalVU) {

            let threeLink = await AxiosFunction.getReportingData('GET', requete_global, '');
            let fourLink = await AxiosFunction.getReportingData('GET', requete_vu, '');


            //si le job progresse des 2 taskId est = 100% ou SUCCESS on arrête le fonction setInterval
            if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (threeLink.data.lastTaskInstance.jobProgress == '1.0') &&
              (fourLink.data.lastTaskInstance.instanceStatus == 'SUCCESS') && (threeLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')
            ) {

              clearInterval(timerFile);

              // Request task1
              if ((threeLink.data.lastTaskInstance.jobProgress == '1.0') && (threeLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {
                //3) Récupère la date de chaque requÃªte
                dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');

                //save la data requête 1 dans le local storage
                var obj_dataFile = {
                  'datafile': dataFile.data
                };

                localStorage_tasks.setItem('campagneId' + '-' + campaignid + '-' + "task_global", JSON.stringify(obj_dataFile));
              }

              // Request task2
              if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (fourLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {
                //3) Récupère la date de chaque requÃªte
                dataFile2 = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId_uu}/file`, '');

                //save la data requête 2 dans le local storage
                var obj_dateFile2 = {
                  'datafile': dataFile2.data
                };

                localStorage_tasks.setItem('campagneId' + '-' + campaignid + '-' + "task_global_vu", JSON.stringify(obj_dateFile2));
              }

            }

          } else {

            //on arrête la fonction setInterval si il y a les 2 taskID en cache
            clearInterval(timerFile);

            //convertie le fichier localStorage task_global en objet
            const obj_default = JSON.parse(dataLSTaskGlobal);
            var data_split_global = obj_default.datafile;

            //convertie le fichier localStorage task_vu en objet
            const obj_vu = JSON.parse(dataLSTaskGlobalVU);
            var data_split_vu = obj_vu.datafile;


            //4) Traitement des données
            const UniqueVisitors = [];

            var data_splinter_vu = data_split_vu.split(/\r?\n/);
            var number_line = data_splinter_vu.length;
            //boucle sur les ligne
            for (i = 1; i < number_line; i++) {

              line = data_splinter_vu[i].split(';');
              UniqueVisitors.push(line[0]);

            }

            var Total_VU = UniqueVisitors[0];

            //traitement des resultat requête 1
            const CampaignStartDate = [];
            const CampaignEndtDate = [];
            const CampaignName = [];
            const InsertionName = [];
            const FormatName = [];
            const SiteId = [];
            const SiteName = [];
            const Impressions = [];
            const ClickRate = [];
            const Clicks = [];
            const Complete = [];

            var data_splinter_global = data_split_global.split(/\r?\n/);
            var number_line = data_splinter_global.length;

            for (i = 1; i < number_line; i++) {
              //split push les données dans chaque colone
              line = data_splinter_global[i].split(';');
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
            var t1 = parseInt(CampaignStartDate[0]);
            var t2 = parseInt(CampaignEndtDate[0]);
            const timeElapsed = Date.now();
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


            const Remove_undefined = undefined;

            //exclure les valeur undefined des array
            for (let i = 0; i < Impressions.length; i++) {
              if (Impressions[i] !== Remove_undefined ) {

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

              var habillage = new Array();
              var interstitiel = new Array();
              var grand_angle = new Array();
              var masthead = new Array();
              var native = new Array();
              var video = new Array();

              //////////////////FORMAT INTERSTITIEL//////////////////////
              var interstitielImpressions = new Array();
              var interstitielClicks = new Array();
              var interstitielSitename = new Array();
              var interstitielFormatName = new Array();
              var interstitielCTR = new Array();

              var interstitiel_linfo_impression = new Array()
              var interstitiel_linfo_click = new Array()
              var interstitiel_linfo_siteId = new Array()
              var interstitiel_linfo_siteName = new Array()
              var interstitiel_linfo_ctr = new Array()

              var interstitiel_linfo_android_impression = new Array()
              var interstitiel_linfo_android_click = new Array()
              var interstitiel_linfo_android_siteId = new Array()
              var interstitiel_linfo_android_siteName = new Array()
              var interstitiel_linfo_android_ctr = new Array()

              var interstitiel_linfo_ios_impression = new Array()
              var interstitiel_linfo_ios_click = new Array()
              var interstitiel_linfo_ios_siteId = new Array()
              var interstitiel_linfo_ios_siteName = new Array()
              var interstitiel_linfo_ios_ctr = new Array()

              //////////////////FORMAT HABILLAGE//////////////////////

              var habillageImpressions = new Array();
              var habillageClicks = new Array();
              var habillageSiteId = new Array();
              var habillageSitename = new Array();
              var habillageFormatName = new Array();
              var habillageCTR = new Array();

              var habillage_linfo_impression = new Array()
              var habillage_linfo_click = new Array()
              var habillage_linfo_siteId = new Array()
              var habillage_linfo_siteName = new Array()
              var habillage_linfo_ctr = new Array()

              var habillage_linfo_android_impression = new Array()
              var habillage_linfo_android_click = new Array()
              var habillage_linfo_android_siteId = new Array()
              var habillage_linfo_android_siteName = new Array()
              var habillage_linfo_android_ctr = new Array()

              var habillage_linfo_ios_impression = new Array()
              var habillage_linfo_ios_click = new Array()
              var habillage_linfo_ios_siteId = new Array()
              var habillage_linfo_ios_siteName = new Array()
              var habillage_linfo_ios_ctr = new Array()

              //////////////////FORMAT MASTHEAD//////////////////////

              var mastheadImpressions = new Array();
              var mastheadClicks = new Array();
              var mastheadSitename = new Array();
              var mastheadFormatName = new Array();
              var mastheadCTR = new Array();

              var masthead_linfo_impression = new Array()
              var masthead_linfo_click = new Array()
              var masthead_linfo_siteId = new Array()
              var masthead_linfo_siteName = new Array()
              var masthead_linfo_ctr = new Array()

              var masthead_linfo_android_impression = new Array()
              var masthead_linfo_android_click = new Array()
              var masthead_linfo_android_siteId = new Array()
              var masthead_linfo_android_siteName = new Array()
              var masthead_linfo_android_ctr = new Array()

              var masthead_linfo_ios_impression = new Array()
              var masthead_linfo_ios_click = new Array()
              var masthead_linfo_ios_siteId = new Array()
              var masthead_linfo_ios_siteName = new Array()
              var masthead_linfo_ios_ctr = new Array()

              //////////////////FORMAT GRAND-ANGLE//////////////////////

              var grand_angleImpressions = new Array();
              var grand_angleClicks = new Array();
              var grand_angleSitename = new Array();
              var grand_angleFormatName = new Array();
              var grand_angleCTR = new Array();

              var grandAngle_linfo_impression = new Array()
              var grandAngle_linfo_click = new Array()
              var grandAngle_linfo_siteId = new Array()
              var grandAngle_linfo_siteName = new Array()
              var grandAngle_linfo_ctr = new Array()

              var grandAngle_linfo_android_impression = new Array()
              var grandAngle_linfo_android_click = new Array()
              var grandAngle_linfo_android_siteId = new Array()
              var grandAngle_linfo_android_siteName = new Array()
              var grandAngle_linfo_android_ctr = new Array()

              var grandAngle_linfo_ios_impression = new Array()
              var grandAngle_linfo_ios_click = new Array()
              var grandAngle_linfo_ios_siteId = new Array()
              var grandAngle_linfo_ios_siteName = new Array()
              var grandAngle_linfo_ios_ctr = new Array()


              //////////////////FORMAT NATIVE//////////////////////

              var nativeImpressions = new Array();
              var nativeClicks = new Array();
              var nativeSitename = new Array();
              var nativeFormatName = new Array();
              var nativeCTR = new Array();

              var native_linfo_impression = new Array()
              var native_linfo_click = new Array()
              var native_linfo_siteId = new Array()
              var native_linfo_siteName = new Array()
              var native_linfo_ctr = new Array()

              var native_linfo_android_impression = new Array()
              var native_linfo_android_click = new Array()
              var native_linfo_android_siteId = new Array()
              var native_linfo_android_siteName = new Array()
              var native_linfo_android_ctr = new Array()

              var native_linfo_ios_impression = new Array()
              var native_linfo_ios_click = new Array()
              var native_linfo_ios_siteId = new Array()
              var native_linfo_ios_siteName = new Array()
              var native_linfo_ios_ctr = new Array()

              //////////////////FORMAT VIDEO//////////////////////

              var videoImpressions = new Array();
              var videoClicks = new Array();
              var videoSiteId = new Array();
              var videoSitename = new Array();
              var videoFormatName = new Array();
              var videoCTR = new Array();
              var videoComplete = new Array();

              var video_linfo_impression = new Array()
              var video_linfo_click = new Array()
              var video_linfo_siteId = new Array()
              var video_linfo_siteName = new Array()
              var video_linfo_ctr = new Array()


              var video_linfo_android_impression = new Array()
              var video_linfo_android_click = new Array()
              var video_linfo_android_siteId = new Array()
              var video_linfo_android_siteName = new Array()
              var video_linfo_android_ctr = new Array()

              var video_linfo_ios_impression = new Array()
              var video_linfo_ios_click = new Array()
              var video_linfo_ios_siteId = new Array()
              var video_linfo_ios_siteName = new Array()
              var video_linfo_ios_ctr = new Array()

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
                videoSiteId.push(Array_SiteID[element]);
                videoSitename.push(Array_SiteName[element]);
                videoFormatName.push(Array_FormatName[element]);
                videoComplete.push(eval(Array_Complete[element]));
                let v = Math.round(Array_ClickRate[element] * 100) / 100
                videoCTR.push(v);

                //sous traitement des array / filtre par format et par site
                //LINFO.re
                if (Array_SiteID[element] === "322433") {
                  video_linfo_impression.push(eval(Array_Impression[element]));
                  video_linfo_click.push(eval(Array_Clicks[element]));
                  video_linfo_siteId.push(Array_SiteID[element]);
                  video_linfo_siteName.push(Array_SiteName[element]);


                }
                 //LINFO_android
                if (Array_SiteID[element] ==="299249") {

                  video_linfo_android_impression.push(eval(Array_Impression[element]));
                  video_linfo_android_click.push(eval(Array_Clicks[element]));
                  video_linfo_android_siteId.push(Array_SiteID[element]);
                  video_linfo_android_siteName.push(Array_SiteName[element]);


                }
                //LINFO_ios

                if (Array_SiteID[element] ==="299248") {

                  video_linfo_ios_impression.push(eval(Array_Impression[element]));
                  video_linfo_ios_click.push(eval(Array_Clicks[element]));
                  video_linfo_ios_siteId.push(Array_SiteID[element]);
                  video_linfo_ios_siteName.push(Array_SiteName[element]);


                }
                
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

                //sous traitement des array / filtre par format et par site
                if (Array_SiteID[element] === "322433") {
                  interstitiel_linfo_impression.push(eval(Array_Impression[element]));
                  interstitiel_linfo_click.push(eval(Array_Clicks[element]));
                  interstitiel_linfo_siteId.push(Array_SiteID[element]);
                  interstitiel_linfo_siteName.push(Array_SiteName[element]);


                }
                if (Array_SiteID[element] ==="299249") {

                  interstitiel_linfo_android_impression.push(eval(Array_Impression[element]));
                  interstitiel_linfo_android_click.push(eval(Array_Clicks[element]));
                  interstitiel_linfo_android_siteId.push(Array_SiteID[element]);
                  interstitiel_linfo_android_siteName.push(Array_SiteName[element]);


                }
                
                if (Array_SiteID[element] ==="299248") {

                  interstitiel_linfo_ios_impression.push(eval(Array_Impression[element]));
                  interstitiel_linfo_ios_click.push(eval(Array_Clicks[element]));
                  interstitiel_linfo_ios_siteId.push(Array_SiteID[element]);
                  interstitiel_linfo_ios_siteName.push(Array_SiteName[element]);


                }
              }


              // Function foreach qui met dans un tableau les impressions correspondant au format
              async function habillageArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                habillageImpressions.push(eval(Array_Impression[element]));
                habillageClicks.push(eval(Array_Clicks[element]));
                habillageSiteId.push(Array_SiteID[element]);
                habillageSitename.push(Array_SiteName[element]);
                habillageFormatName.push(Array_FormatName[element]);
                let h = Math.round(Array_ClickRate[element] * 100) / 100;
                habillageCTR.push(h);


                //sous traitement des array / filtre par format et par site
                if (Array_SiteID[element] === "322433") {
                  habillage_linfo_impression.push(eval(Array_Impression[element]));
                  habillage_linfo_click.push(eval(Array_Clicks[element]));
                  habillage_linfo_siteId.push(Array_SiteID[element]);
                  habillage_linfo_siteName.push(Array_SiteName[element]);


                }
                if (Array_SiteID[element] ==="299249") {

                  habillage_linfo_android_impression.push(eval(Array_Impression[element]));
                  habillage_linfo_android_click.push(eval(Array_Clicks[element]));
                  habillage_linfo_android_siteId.push(Array_SiteID[element]);
                  habillage_linfo_android_siteName.push(Array_SiteName[element]);


                }

                if (Array_SiteID[element] ==="299248") {

                  habillage_linfo_ios_impression.push(eval(Array_Impression[element]));
                  habillage_linfo_ios_click.push(eval(Array_Clicks[element]));
                  habillage_linfo_ios_siteId.push(Array_SiteID[element]);
                  habillage_linfo_ios_siteName.push(Array_SiteName[element]);


                }

              }


              async function mastheadArrayElements(element, index, array) {
                mastheadImpressions.push(eval(Array_Impression[element]));
                mastheadClicks.push(eval(Array_Clicks[element]));
                mastheadSitename.push(Array_SiteName[element]);
                mastheadFormatName.push(Array_FormatName[element]);
                let m = Math.round(Array_ClickRate[element] * 100) / 100
                mastheadCTR.push(m);


                //sous traitement des array / filtre par format et par site
                if (Array_SiteID[element] === "322433") {
                  masthead_linfo_impression.push(eval(Array_Impression[element]));
                  masthead_linfo_click.push(eval(Array_Clicks[element]));
                  masthead_linfo_siteId.push(Array_SiteID[element]);
                  masthead_linfo_siteName.push(Array_SiteName[element]);


                }
                if (Array_SiteID[element] ==="299249") {

                  masthead_linfo_android_impression.push(eval(Array_Impression[element]));
                  masthead_linfo_android_click.push(eval(Array_Clicks[element]));
                  masthead_linfo_android_siteId.push(Array_SiteID[element]);
                  masthead_linfo_android_siteName.push(Array_SiteName[element]);


                }

                if (Array_SiteID[element] ==="299248") {

                  masthead_linfo_ios_impression.push(eval(Array_Impression[element]));
                  masthead_linfo_ios_click.push(eval(Array_Clicks[element]));
                  masthead_linfo_ios_siteId.push(Array_SiteID[element]);
                  masthead_linfo_ios_siteName.push(Array_SiteName[element]);


                }
              }

              async function grand_angleArrayElements(element, index, array) {
                // Rajouter les immpresions  et clics des formats
                grand_angleImpressions.push(eval(Array_Impression[element]));
                grand_angleClicks.push(eval(Array_Clicks[element]));
                grand_angleSitename.push(Array_SiteName[element]);
                grand_angleFormatName.push(Array_FormatName[element]);
                let g = Math.round(Array_ClickRate[element] * 100) / 100;
                grand_angleCTR.push(g);

                //sous traitement des array / filtre par format et par site
                if (Array_SiteID[element] === "322433") {

                  grandAngle_linfo_impression.push(eval(Array_Impression[element]));
                  grandAngle_linfo_click.push(eval(Array_Clicks[element]));
                  grandAngle_linfo_siteId.push(Array_SiteID[element]);
                  grandAngle_linfo_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] ==="299249") {

                  grandAngle_linfo_android_impression.push(eval(Array_Impression[element]));
                  grandAngle_linfo_android_click.push(eval(Array_Clicks[element]));
                  grandAngle_linfo_android_siteId.push(Array_SiteID[element]);
                  grandAngle_linfo_android_siteName.push(Array_SiteName[element]);


                }

                if (Array_SiteID[element] ==="299248") {

                  grandAngle_linfo_ios_impression.push(eval(Array_Impression[element]));
                  grandAngle_linfo_ios_click.push(eval(Array_Clicks[element]));
                  grandAngle_linfo_ios_siteId.push(Array_SiteID[element]);
                  grandAngle_linfo_ios_siteName.push(Array_SiteName[element]);


                }
              }


              async function nativeArrayElements(element, index, array) {
                nativeImpressions.push(eval(Array_Impression[element]));
                nativeClicks.push(eval(Array_Clicks[element]));
                nativeSitename.push(Array_SiteName[element]);
                nativeFormatName.push(Array_FormatName[element]);
                let n = Math.round(Array_ClickRate[element] * 100) / 100;
                nativeCTR.push(n);

                //sous traitement des array / filtre par format et par site

                if (Array_SiteID[element] === "322433") {
                  native_linfo_impression.push(eval(Array_Impression[element]));
                  native_linfo_click.push(eval(Array_Clicks[element]));
                  native_linfo_siteId.push(Array_SiteID[element]);
                  native_linfo_siteName.push(Array_SiteName[element]);


                }
                if (Array_SiteID[element] ==="299249") {

                  native_linfo_android_impression.push(eval(Array_Impression[element]));
                  native_linfo_android_click.push(eval(Array_Clicks[element]));
                  native_linfo_android_siteId.push(Array_SiteID[element]);
                  native_linfo_android_siteName.push(Array_SiteName[element]);


                }

                if (Array_SiteID[element] ==="299248") {

                  native_linfo_ios_impression.push(eval(Array_Impression[element]));
                  native_linfo_ios_click.push(eval(Array_Clicks[element]));
                  native_linfo_ios_siteId.push(Array_SiteID[element]);
                  native_linfo_ios_siteName.push(Array_SiteName[element]);


                }
              }



              interstitiel.forEach(interstitielArrayElements);
              habillage.forEach(habillageArrayElements);
              masthead.forEach(mastheadArrayElements);
              grand_angle.forEach(grand_angleArrayElements);
              native.forEach(nativeArrayElements);
              video.forEach(VideoArrayElements);




              //calcule la somme total par format et site
              const somme_array = (accumulator, currentValue) => accumulator + currentValue;

              var total_impressions_linfoHabillage = habillage_linfo_impression.reduce(somme_array , 0);
              var total_clicks_linfoHabillage = habillage_linfo_click.reduce(somme_array , 0);

              var total_impressions_linfo_androidHabillage = habillage_linfo_android_impression.reduce(somme_array , 0);
              var total_clicks_linfo_androidHabillage = habillage_linfo_android_click.reduce(somme_array , 0);

              var total_impressions_linfo_iosHabillage = habillage_linfo_ios_impression.reduce(somme_array , 0);
              var total_clicks_linfo_iosHabillage = habillage_linfo_ios_click.reduce(somme_array , 0);
              ///////////////////////////

              var total_impressions_linfoGrandAngle = grandAngle_linfo_impression.reduce(somme_array , 0);
              var total_clicks_linfoGrandAngle = grandAngle_linfo_click.reduce(somme_array , 0);

              var total_impressions_linfo_androidGrandAngle = grandAngle_linfo_android_impression.reduce(somme_array , 0);
              var total_clicks_linfo_androidGrandAngle = grandAngle_linfo_android_click.reduce(somme_array , 0);

              var total_impressions_linfo_iosGrandAngle = grandAngle_linfo_ios_impression.reduce(somme_array , 0);
              var total_clicks_linfo_iosGrandAngle = grandAngle_linfo_ios_click.reduce(somme_array , 0);
              /////////////////////////
              var total_impressions_linfoVideo = video_linfo_impression.reduce(somme_array , 0);
              var total_clicks_linfoVideo = video_linfo_click.reduce(somme_array , 0);

              var total_impressions_linfo_androidVideo = video_linfo_android_impression.reduce(somme_array , 0);
              var total_clicks_linfo_androidVideo = video_linfo_android_click.reduce(somme_array , 0);

              var total_impressions_linfo_iosVideo = video_linfo_ios_impression.reduce(somme_array , 0);
              var total_clicks_linfo_iosVideo = video_linfo_ios_click.reduce(somme_array , 0);
              /////////////////////
              var total_impressions_linfoInterstitiel = interstitiel_linfo_impression.reduce(somme_array , 0);
              var total_clicks_linfoInterstitiel = interstitiel_linfo_click.reduce(somme_array , 0);

              var total_impressions_linfo_androidInterstitiel = interstitiel_linfo_android_impression.reduce(somme_array , 0);
              var total_clicks_linfo_androidInterstitiel = interstitiel_linfo_android_click.reduce(somme_array , 0);

              var total_impressions_linfo_iosInterstitiel = interstitiel_linfo_ios_impression.reduce(somme_array , 0);
              var total_clicks_linfo_iosInterstitiel = interstitiel_linfo_ios_click.reduce(somme_array , 0);
              /////////////////
              var total_impressions_linfoMasthead = masthead_linfo_impression.reduce(somme_array , 0);
              var total_clicks_linfoMasthead = masthead_linfo_click.reduce(somme_array , 0);

              var total_impressions_linfo_androidMasthead = masthead_linfo_android_impression.reduce(somme_array , 0);
              var total_clicks_linfo_androidMasthead = masthead_linfo_android_click.reduce(somme_array , 0);

              var total_impressions_linfo_iosMasthead = masthead_linfo_ios_impression.reduce(somme_array , 0);
              var total_clicks_linfo_iosMasthead = masthead_linfo_ios_click.reduce(somme_array , 0);
            //////////////////////
              var total_impressions_linfoNative = native_linfo_impression.reduce(somme_array , 0);
              var total_clicks_linfoNative = native_linfo_click.reduce(somme_array , 0);

              var total_impressions_linfo_androidNative = native_linfo_android_impression.reduce(somme_array , 0);
              var total_clicks_linfo_androidNative = native_linfo_android_click.reduce(somme_array , 0);

              var total_impressions_linfo_iosNative = native_linfo_ios_impression.reduce(somme_array , 0);
              var total_clicks_linfo_iosNative = native_linfo_ios_click.reduce(somme_array , 0);

              //calcule le ctr total par format et site
              let h_linfo = (total_clicks_linfoHabillage / total_impressions_linfoHabillage) * 100;
              habillage_linfo_ctr.push(h_linfo.toFixed(2));

              let h_linfo_android = (total_clicks_linfo_androidHabillage / total_impressions_linfo_androidHabillage) * 100;
              habillage_linfo_android_ctr.push(h_linfo_android.toFixed(2));

              let h_linfo_ios = (total_clicks_linfo_iosHabillage / total_impressions_linfo_iosHabillage) * 100;
              habillage_linfo_ios_ctr.push(h_linfo_ios.toFixed(2));
            //////////////////
              let ga_linfo = (total_clicks_linfoGrandAngle / total_impressions_linfoGrandAngle) * 100;
              grandAngle_linfo_ctr.push(ga_linfo.toFixed(2));

              let ga_linfo_android = (total_clicks_linfo_androidGrandAngle / total_impressions_linfo_androidGrandAngle) * 100;
              grandAngle_linfo_android_ctr.push(ga_linfo_android.toFixed(2));

              let ga_linfo_ios = (total_clicks_linfo_iosGrandAngle / total_impressions_linfo_iosGrandAngle) * 100;
              grandAngle_linfo_ios_ctr.push(ga_linfo_ios.toFixed(2));
            //////////////////

              let i_linfo = (total_clicks_linfoInterstitiel / total_impressions_linfoInterstitiel) * 100;
              interstitiel_linfo_ctr.push(i_linfo.toFixed(2));

              let i_linfo_android = (total_clicks_linfo_androidInterstitiel / total_impressions_linfo_androidInterstitiel) * 100;
              interstitiel_linfo_android_ctr.push(i_linfo_android.toFixed(2));

              let i_linfo_ios = (total_clicks_linfo_iosInterstitiel / total_impressions_linfo_iosInterstitiel) * 100;
              interstitiel_linfo_ios_ctr.push(i_linfo_ios.toFixed(2));
            //////////////////

              let m_linfo = (total_clicks_linfoMasthead / total_impressions_linfoMasthead) * 100;
              masthead_linfo_ctr.push(m_linfo.toFixed(2));

              let m_linfo_android = (total_clicks_linfo_androidMasthead / total_impressions_linfo_androidMasthead) * 100;
              masthead_linfo_android_ctr.push(m_linfo_android.toFixed(2));

              let m_linfo_ios = (total_clicks_linfo_iosMasthead / total_impressions_linfo_iosMasthead) * 100;
              masthead_linfo_ios_ctr.push(m_linfo_ios.toFixed(2));
            //////////////////

              let n_linfo = (total_clicks_linfoNative / total_impressions_linfoNative) * 100;
              native_linfo_ctr.push(n_linfo.toFixed(2));

              let n_linfo_android = (total_clicks_linfo_androidNative / total_impressions_linfo_androidNative) * 100;
              native_linfo_android_ctr.push(n_linfo_android.toFixed(2));

              let n_linfo_ios = (total_clicks_linfo_iosNative / total_impressions_linfo_iosNative) * 100;
              native_linfo_ios_ctr.push(n_linfo_ios.toFixed(2));
            //////////////////


              let v_linfo = (total_clicks_linfoVideo / total_impressions_linfoVideo) * 100;
              video_linfo_ctr.push(v_linfo.toFixed(2));

              let v_linfo_android = (total_clicks_linfo_androidVideo / total_impressions_linfo_androidVideo) * 100;
              video_linfo_android_ctr.push(v_linfo_android.toFixed(2));

              let v_linfo_ios = (total_clicks_linfo_iosVideo / total_impressions_linfo_iosVideo) * 100;
              video_linfo_ios_ctr.push(v_linfo_ios.toFixed(2));

              var sm_linfo = new Array();
              var sm_linfo_android = new Array();
              var sm_linfo_ios = new Array();
              var sm_antenne = new Array();
              var sm_dtj = new Array();
              var sm_orange = new Array();
              var sm_tf1 = new Array();
              var sm_m6 = new Array();
              var sm_immo974 = new Array();
              var sm_dailymotion = new Array();
              var sm_actu_reunion_ios = new Array();
              var sm_actu_reunion_android = new Array();
              var sm_rodzafer_ios = new Array();
              var sm_rodzafer_android = new Array();
              var sm_rodzafer_lp = new Array();
              var sm_rodali = new Array();



              var linfo_impression = new Array();
              var linfo_clic = new Array();

              var m6_impression = new Array();
              var m6_clic = new Array();

              var tf1_impression = new Array();
              var tf1_clic = new Array();

              var daily_impression = new Array();
              var daily_clic = new Array();

              var ar_impression = new Array();
              var ar_clic = new Array();

              var info_ios_impression = new Array();
              var info_ios_clic = new Array();

              var info_android_impression = new Array();
              var info_android_clic = new Array();

              var dtj_impression = new Array();
              var dtj_clic = new Array();

              var orange_impression = new Array();
              var orange_clic = new Array();


              var immo974_impression = new Array();
              var immo974_clic = new Array();

              var actu_ios_impression = new Array();
              var actu_ios_clic = new Array();

              var actu_android_impression = new Array();
              var actu_android_clic = new Array();


              var rz_impression = new Array();
              var rz_clic = new Array();

              var rz_ios_impression = new Array();
              var rz_ios_clic = new Array();


              var rz_android_impression = new Array();
              var rz_andoid_clic = new Array();

              var rodali_impression = new Array();
              var rodali_clic = new Array();

              Array_SiteID.filter(function (word, index) {


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



              async function info_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                linfo_impression.push(eval(Array_Impression[element]));
                linfo_clic.push(eval(Array_Clicks[element]));


              }
              async function info_ios_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                info_ios_impression.push(eval(Array_Impression[element]));
                info_ios_clic.push(eval(Array_Clicks[element]));


              }
              async function info_android_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                info_android_impression.push(eval(Array_Impression[element]));
                info_android_clic.push(eval(Array_Clicks[element]));

              }
              async function m6_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                m6_impression.push(eval(Array_Impression[element]));
                m6_clic.push(eval(Array_Clicks[element]));

              }
              async function tf1_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                tf1_impression.push(eval(Array_Impression[element]));
                tf1_clic.push(eval(Array_Clicks[element]));

              }
              async function daily_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                daily_impression.push(eval(Array_Impression[element]));
                daily_clic.push(eval(Array_Clicks[element]));

              }
              async function ar_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                ar_impression.push(eval(Array_Impression[element]));
                ar_clic.push(eval(Array_Clicks[element]));

              }
              async function dtj_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                dtj_impression.push(eval(Array_Impression[element]));
                dtj_clic.push(eval(Array_Clicks[element]));

              }
              async function orange_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                orange_impression.push(eval(Array_Impression[element]));
                orange_clic.push(eval(Array_Clicks[element]));

              }
              async function immo_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                immo974_impression.push(eval(Array_Impression[element]));
                immo974_clic.push(eval(Array_Clicks[element]));

              }
              async function actu_ios_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                actu_ios_impression.push(eval(Array_Impression[element]));
                actu_ios_clic.push(eval(Array_Clicks[element]));

              }
              async function actu_android_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                actu_android_impression.push(eval(Array_Impression[element]));
                actu_android_clic.push(eval(Array_Clicks[element]));

              }
              async function rz_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                rz_impression.push(eval(Array_Impression[element]));
                rz_clic.push(eval(Array_Clicks[element]));

              }
              async function rz_ios_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                rz_ios_impression.push(eval(Array_Impression[element]));
                rz_ios_clic.push(eval(Array_Clicks[element]));

              }
              async function rz_andoid_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                rz_android_impression.push(eval(Array_Impression[element]));
                rz_andoid_clic.push(eval(Array_Clicks[element]));

              }
              async function rodali_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                rodali_impression.push(eval(Array_Impression[element]));
                rodali_clic.push(eval(Array_Clicks[element]));

              }

              sm_linfo.forEach(info_siteArrayElements);
              sm_linfo_ios.forEach(info_ios_siteArrayElements);
              sm_linfo_android.forEach(info_android_siteArrayElements);
              sm_m6.forEach(m6_siteArrayElements);
              sm_tf1.forEach(tf1_siteArrayElements);
              sm_dailymotion.forEach(daily_siteArrayElements);
              sm_antenne.forEach(ar_siteArrayElements);
              sm_dtj.forEach(dtj_siteArrayElements);
              sm_orange.forEach(orange_siteArrayElements);
              sm_immo974.forEach(immo_siteArrayElements);
              sm_actu_reunion_ios.forEach(actu_ios_siteArrayElements);
              sm_actu_reunion_android.forEach(actu_android_siteArrayElements);
              sm_rodzafer_lp.forEach(rz_siteArrayElements);
              sm_rodzafer_ios.forEach(rz_ios_siteArrayElements);
              sm_rodzafer_android.forEach(rz_andoid_siteArrayElements);
              sm_rodali.forEach(rodali_siteArrayElements);













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






              var sommeinfoImpression = linfo_impression.reduce(reducer, 0);
              var sommeinfoClicks = linfo_clic.reduce(reducer, 0);

              var sommeinfo_iosImpression = info_ios_impression.reduce(reducer, 0);
              var sommeinfo_iosClicks = info_ios_clic.reduce(reducer, 0);

              var sommeinfo_androidImpression = info_android_impression.reduce(reducer, 0);
              var sommeinfo_androidClicks = info_android_clic.reduce(reducer, 0);

              var sommetf1Impression = tf1_impression.reduce(reducer, 0);
              var sommetf1Clicks = tf1_clic.reduce(reducer, 0);

              var sommem6Impression = m6_impression.reduce(reducer, 0);
              var sommem6Clicks = m6_clic.reduce(reducer, 0);

              var sommedailyImpression = daily_impression.reduce(reducer, 0);
              var sommedailyClicks = daily_clic.reduce(reducer, 0);

              var sommearImpression = ar_impression.reduce(reducer, 0);
              var sommearClicks = ar_clic.reduce(reducer, 0);

              var sommedtjImpression = dtj_impression.reduce(reducer, 0);
              var sommedtjClicks = dtj_clic.reduce(reducer, 0);

              var sommeorangeImpression = orange_impression.reduce(reducer, 0);
              var sommeorangeClicks = orange_clic.reduce(reducer, 0);

              var sommeimmo974Impression = immo974_impression.reduce(reducer, 0);
              var sommeimmo974Clicks = immo974_clic.reduce(reducer, 0);

              var sommeactu_iosImpression = actu_ios_impression.reduce(reducer, 0);
              var sommeactu_iosClicks = actu_ios_clic.reduce(reducer, 0);

              var sommeactu_androidImpression = actu_android_impression.reduce(reducer, 0);
              var sommeactu_androidClicks = actu_android_clic.reduce(reducer, 0);

              var sommerzImpression = rz_impression.reduce(reducer, 0);
              var sommerzClicks = rz_clic.reduce(reducer, 0);


              var sommerz_iosImpression = rz_ios_impression.reduce(reducer, 0);
              var sommerz_iosClicks = rz_ios_clic.reduce(reducer, 0);

              var sommerz_androidImpression = rz_android_impression.reduce(reducer, 0);
              var sommerz_androidClicks = rz_andoid_clic.reduce(reducer, 0);

              var sommerodaliImpression = rodali_impression.reduce(reducer, 0);
              var sommerodaliClicks = rodali_clic.reduce(reducer, 0);

            }




            var total_impression_format = sommeHabillageImpression + sommeGrand_AngleImpression + sommeInterstitielImpression + sommeMastheadImpression + sommeNativeImpression + sommeVideoImpression;
            var total_click_format = sommeHabillageClicks + sommeGrand_AngleClicks + sommeInterstitielClicks + sommeMastheadClicks + sommeNativeClicks + sommeVideoClicks;




            //var TotalImpressions = 0
            // var TotalCliks = 0
            var TotalComplete = 0;
            //somme impression clic complete
            for (let i = 0; i < Array_Impression.length; i++) {
              if (Array_Impression[i] != '') {
                //  TotalImpressions += parseInt(Array_Impression[i])
                // TotalCliks += parseInt(Array_Clicks[i])
                TotalComplete += parseInt(Array_Complete[i]);


              }
            }


            CTR_video = (sommeVideoClicks / sommeVideoImpression) * 100;
            CTR_video = CTR_video.toFixed(2);

            //Calcule de taux de clic par format
            CTR_habillage = (sommeHabillageClicks / sommeHabillageImpression) * 100;
            CTR_habillage = CTR_habillage.toFixed(2);

            CTR_interstitiel = (sommeInterstitielClicks / sommeInterstitielImpression) * 100;
            CTR_interstitiel = CTR_interstitiel.toFixed(2);


            CTR_grand_angle = (sommeGrand_AngleClicks / sommeGrand_AngleImpression) * 100;
            CTR_grand_angle = CTR_grand_angle.toFixed(2);


            CTR_masthead = (sommeMastheadClicks / sommeMastheadImpression) * 100;
            CTR_masthead = CTR_masthead.toFixed(2);

            CTR_native = (sommeNativeClicks / sommeNativeImpression) * 100;
            CTR_native = CTR_native.toFixed(2);
            ///////////////////////////////////

            CTR_m6 = (sommem6Clicks / sommem6Impression) * 100;
            CTR_m6 = CTR_m6.toFixed(2);


            CTR_info = (sommeinfoClicks / sommeinfoImpression) * 100;
            CTR_info = CTR_info.toFixed(2);

            CTR_info_ios = (sommeinfo_iosClicks / sommeinfo_iosImpression) * 100;
            CTR_info_ios = CTR_info_ios.toFixed(2);

            CTR_info_android = (sommeinfo_androidClicks / sommeinfo_androidImpression) * 100;
            CTR_info_android = CTR_info_android.toFixed(2);

            CTR_tf1 = (sommetf1Clicks / sommetf1Impression) * 100;
            CTR_tf1 = CTR_tf1.toFixed(2);

            CTR_daily = (sommedailyClicks / sommedailyImpression) * 100;
            CTR_daily = CTR_daily.toFixed(2);

            CTR_ar = (sommearClicks / sommearImpression) * 100;
            CTR_ar = CTR_ar.toFixed(2);

            CTR_dtj = (sommedtjClicks / sommedtjImpression) * 100;
            CTR_dtj = CTR_dtj.toFixed(2);

            CTR_orange = (sommeorangeClicks / sommeorangeImpression) * 100;
            CTR_orange = CTR_orange.toFixed(2);

            CTR_immo974 = (sommeimmo974Clicks / sommeimmo974Impression) * 100;
            CTR_immo974 = CTR_immo974.toFixed(2);


            CTR_actu_ios = (sommeactu_iosClicks / sommeactu_iosImpression) * 100;
            CTR_actu_ios = CTR_actu_ios.toFixed(2);

            CTR_actu_android = (sommeactu_androidClicks / sommeactu_androidImpression) * 100;
            CTR_actu_android = CTR_actu_android.toFixed(2);


            CTR_rz = (sommerzClicks / sommerzImpression) * 100;
            CTR_rz = CTR_rz.toFixed(2);

            CTR_rz_ios = (sommerz_iosClicks / sommerz_iosImpression) * 100;
            CTR_rz_ios = CTR_rz_ios.toFixed(2);

            CTR_rz_android = (sommerz_androidClicks / sommerz_androidImpression) * 100;
            CTR_rz_android = CTR_rz_android.toFixed(2);


            CTR_rodali = (sommerodaliClicks / sommerodaliImpression) * 100;
            CTR_rodali = CTR_rodali.toFixed(2);




            //Calcul des chiffre global %Taux clic Repetition %VTR
            Taux_VTR = (TotalComplete / total_impression_format) * 100;
            VTR = Taux_VTR.toFixed(2);

            /*var Taux_clics = (TotalCliks / TotalImpressions) * 100
            CTR = Taux_clics.toFixed(2);*/
            var Taux_clics = (total_click_format / total_impression_format) * 100;
            CTR = Taux_clics.toFixed(2);


            var Impression_vu = (total_impression_format / Total_VU);
            Repetition = Impression_vu.toFixed(2);





            //SEPARATEUR DE MILLIER
            // TotalImpressions = new Number(TotalImpressions).toLocaleString("fi-FI");
            // TotalCliks = new Number(TotalCliks).toLocaleString("fi-FI");
            total_impression_format = new Number(total_impression_format).toLocaleString("fi-FI");
            total_click_format = new Number(total_click_format).toLocaleString("fi-FI");
            Total_VU = new Number(Total_VU).toLocaleString("fi-FI");

            sommeVideoImpression = new Number(sommeVideoImpression).toLocaleString("fi-FI");
            sommeHabillageImpression = new Number(sommeHabillageImpression).toLocaleString("fi-FI");
            sommeInterstitielImpression = new Number(sommeInterstitielImpression).toLocaleString("fi-FI");
            sommeGrand_AngleImpression = new Number(sommeGrand_AngleImpression).toLocaleString("fi-FI");
            sommeMastheadImpression = new Number(sommeMastheadImpression).toLocaleString("fi-FI");
            sommeNativeImpression = new Number(sommeNativeImpression).toLocaleString("fi-FI");


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

              total_impression_format,
              total_click_format,

              //TotalImpressions,
              //TotalCliks,
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
              CTR_video,


              sommem6Impression,
              sommeinfoImpression,
              sommeinfo_iosImpression,
              sommeinfo_androidImpression,
              sommetf1Impression,
              sommedailyImpression,
              sommearImpression,
              sommedtjImpression,
              sommeorangeImpression,
              sommeimmo974Impression,
              sommeactu_iosImpression,
              sommeactu_androidImpression,
              sommerzImpression,
              sommerz_iosImpression,
              sommerz_androidImpression,
              sommerodaliImpression,

              sommem6Clicks,
              sommeinfoClicks,
              sommeinfo_iosClicks,
              sommeinfo_androidClicks,
              sommetf1Clicks,
              sommedailyClicks,
              sommearClicks,
              sommedtjClicks,
              sommeorangeClicks,
              sommeimmo974Clicks,
              sommeactu_iosClicks,
              sommeactu_androidClicks,
              sommerzClicks,
              sommerz_iosClicks,
              sommerz_androidClicks,
              sommerodaliClicks,

              CTR_m6,
              CTR_info,
              CTR_info_ios,
              CTR_info_android,
              CTR_tf1,
              CTR_daily,
              CTR_ar,
              CTR_dtj,
              CTR_orange,
              CTR_immo974,
              CTR_actu_ios,
              CTR_actu_android,
              CTR_rz,
              CTR_rz_ios,
              CTR_rz_android,
              CTR_rodali,


            }


            // total impression / total clic / CTR par Habillage par site
            const reducer = (accumulator, currentValue) => accumulator + currentValue;
            var sommevideoImpressions = videoImpressions.reduce(reducer, 0);
            var sommevideoClics = videoClicks.reduce(reducer, 0);
            var videoCTR_clics = (videoClicks / videoImpressions) * 100;
            videoCTR_clics = videoCTR_clics.toFixed(2);

            var sommehabillageImpressions = habillageImpressions.reduce(reducer, 0);
            var sommehabillageClics = habillageClicks.reduce(reducer, 0);
            var habillageCTR_clics = (sommehabillageClics / sommehabillageImpressions) * 100;
            habillageCTR_clics = habillageCTR_clics.toFixed(2);

            // total impression / total clic / CTR par Interstitiel par site
            var sommeinterstitielImpressions = interstitielImpressions.reduce(reducer, 0);
            var sommeinterstitielClics = interstitielClicks.reduce(reducer, 0);
            var interstitielCTR_clics = (sommeinterstitielClics / sommeinterstitielImpressions) * 100;
            interstitielCTR_clics = interstitielCTR_clics.toFixed(2);

            // total impression / total clic / CTR par Masthead par site
            var sommemastheadImpressions = mastheadImpressions.reduce(reducer, 0);
            var sommemastheadClics = mastheadClicks.reduce(reducer, 0);
            var mastheadCTR_clics = (sommemastheadClics / sommemastheadImpressions) * 100;
            mastheadCTR_clics = mastheadCTR_clics.toFixed(2);


            // total impression / total clic / CTR par grand_angle par site
            var sommegrand_angleImpressions = grand_angleImpressions.reduce(reducer, 0);
            var sommegrand_angleClics = grand_angleClicks.reduce(reducer, 0);
            var grand_angleCTR_clics = (sommegrand_angleClics / sommegrand_angleImpressions) * 100;
            grand_angleCTR_clics = grand_angleCTR_clics.toFixed(2);

            // total impression / total clic / CTR par native par site
            var sommenativeImpressions = nativeImpressions.reduce(reducer, 0);
            var sommenativeClics = nativeClicks.reduce(reducer, 0);
            var nativeCTR_clics = (sommenativeClics / sommenativeImpressions) * 100;
            nativeCTR_clics = nativeCTR_clics.toFixed(2);

            video_linfo_siteName =  video_linfo_siteName[0] ;
            video_linfo_android_siteName =  video_linfo_android_siteName[0] ;


            var data_video = {

              videoImpressions,
              videoClicks,
              videoSitename,
              videoFormatName,
              videoCTR,
              videoComplete,
              sommevideoImpressions,
              sommevideoClics,
              videoCTR_clics,

              total_impressions_linfoVideo,
              total_clicks_linfoVideo,
              video_linfo_siteName,
              video_linfo_ctr,

              total_impressions_linfo_androidVideo,
              total_clicks_linfo_androidVideo,
              video_linfo_android_siteName,
              video_linfo_android_ctr,

              total_impressions_linfo_iosVideo,
              total_clicks_linfo_iosVideo,
              video_linfo_ios_siteName,
              video_linfo_ios_ctr,


            };

           
            habillage_linfo_siteName = habillage_linfo_siteName[0] ;
            habillage_linfo_android_siteName = habillage_linfo_android_siteName[0] ;
            habillage_linfo_ios_siteName = habillage_linfo_ios_siteName[0] ;



            var data_habillage = {


              habillageSitename,
              habillageImpressions,
              habillageClicks,
              habillageCTR,
              sommehabillageImpressions,
              sommehabillageClics,
              habillageCTR_clics,

              total_impressions_linfoHabillage,
              total_clicks_linfoHabillage,
              habillage_linfo_siteName,
              habillage_linfo_ctr,

              total_impressions_linfo_androidHabillage,
              total_clicks_linfo_androidHabillage,
              habillage_linfo_android_siteName,
              habillage_linfo_android_ctr,

              total_impressions_linfo_iosHabillage,
              total_clicks_linfo_iosHabillage,
              habillage_linfo_ios_siteName,
              habillage_linfo_ios_ctr,

            };

            interstitiel_linfo_siteName = interstitiel_linfo_siteName[0] ;
            interstitiel_linfo_android_siteName = interstitiel_linfo_android_siteName[0] ;
            interstitiel_linfo_ios_siteName = interstitiel_linfo_ios_siteName[0] ;


            var data_interstitiel = {

              interstitielImpressions,
              interstitielClicks,
              interstitielFormatName,
              interstitielSitename,
              interstitielCTR,
              sommeinterstitielImpressions,
              sommeinterstitielClics,
              interstitielCTR_clics,

              total_impressions_linfoInterstitiel,
              total_clicks_linfoInterstitiel,
              interstitiel_linfo_siteName,
              interstitiel_linfo_ctr,

              total_impressions_linfo_androidInterstitiel,
              total_clicks_linfo_androidInterstitiel,
              interstitiel_linfo_android_siteName,
              interstitiel_linfo_android_ctr,

              total_impressions_linfo_iosInterstitiel,
              total_clicks_linfo_iosInterstitiel,
              interstitiel_linfo_ios_siteName,
              interstitiel_linfo_ios_ctr,

            };

            masthead_linfo_siteName =  masthead_linfo_siteName[0] ;
            masthead_linfo_android_siteName =  masthead_linfo_android_siteName[0] ;
            masthead_linfo_ios_siteName =  masthead_linfo_ios_siteName[0] ;



            var data_masthead = {

              mastheadImpressions,
              mastheadClicks,
              mastheadFormatName,
              mastheadSitename,
              mastheadCTR,
              sommemastheadImpressions,
              sommemastheadClics,
              mastheadCTR_clics,

              total_impressions_linfoMasthead,
              total_clicks_linfoMasthead,
              masthead_linfo_siteName,
              masthead_linfo_ctr,

              total_impressions_linfo_androidMasthead,
              total_clicks_linfo_androidMasthead,
              masthead_linfo_android_siteName,
              masthead_linfo_android_ctr,

              total_impressions_linfo_iosMasthead,
              total_clicks_linfo_iosMasthead,
              masthead_linfo_ios_siteName,
              masthead_linfo_ios_ctr,

            };

            grandAngle_linfo_siteName =  grandAngle_linfo_siteName[0] ;
            grandAngle_linfo_android_siteName =  grandAngle_linfo_android_siteName[0] ;
            grandAngle_linfo_ios_siteName =  grandAngle_linfo_ios_siteName[0] ;


            var data_grand_angle = {

              grand_angleImpressions,
              grand_angleClicks,
              grand_angleFormatName,
              grand_angleSitename,
              grand_angleCTR,
              sommegrand_angleImpressions,
              sommegrand_angleClics,
              grand_angleCTR_clics,

              total_impressions_linfoGrandAngle,
              total_clicks_linfoGrandAngle,
              grandAngle_linfo_siteName,
              grandAngle_linfo_ctr,

              total_impressions_linfo_androidGrandAngle,
              total_clicks_linfo_androidGrandAngle,
              grandAngle_linfo_android_siteName,
              grandAngle_linfo_android_ctr,

              total_impressions_linfo_iosGrandAngle,
              total_clicks_linfo_iosGrandAngle,
              grandAngle_linfo_ios_siteName,
              grandAngle_linfo_ios_ctr,

            };

            native_linfo_siteName =  native_linfo_siteName[0] ;
            native_linfo_android_siteName =  native_linfo_android_siteName[0] ;
            native_linfo_ios_siteName =  native_linfo_ios_siteName[0] ;


            var data_native = {

              nativeImpressions,
              nativeClicks,
              nativeFormatName,
              nativeSitename,
              nativeCTR,
              sommenativeImpressions,
              sommenativeClics,
              nativeCTR_clics,

              total_impressions_linfoNative,
              total_clicks_linfoNative,
              native_linfo_siteName,
              native_linfo_ctr,

              total_impressions_linfo_androidNative,
              total_clicks_linfo_androidNative,
              native_linfo_android_siteName,
              native_linfo_android_ctr,

              total_impressions_linfo_iosNative,
              total_clicks_linfo_iosNative,
              native_linfo_ios_siteName,
              native_linfo_ios_ctr,

            };

            // var ttl = 7200 //2h
            const now = new Date();
            var timestamp_now = now.getTime();
            var timestamp_expire = now.setHours(now.getHours() + 2);
            //console.log(timestamp_expire)


            function getDateTimeTimestamp(refrechTimeStamp) {
              let dates = new Date(refrechTimeStamp);
              return ('0' + dates.getDate()).slice(-2) + '/' + ('0' + (dates.getMonth() + 1)).slice(-2) + '/' + dates.getFullYear() + ' ' + ('0' + dates.getHours()).slice(-2) + ':' + ('0' + dates.getMinutes()).slice(-2);
            }
            var t3 = parseInt(timestamp_expire);

            var date_expirer = getDateTimeTimestamp(t3);

            var testObject = {
              'campaign_id': campaignid,
              'date_now': timestamp_now,
              'date_expiry': timestamp_expire,
              'date_expirer': date_expirer,
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
              data_video: data_video,
              data_expirer: date_expirer
            });














          }



        }, time);
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

exports.automatisation = async (req, res) => {



  let campaignid = req.params.campaignid;


  try {



    var data_localStorage = localStorage.getItem('campagneId' + '-' + campaignid);



    res.json(data_localStorage);



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