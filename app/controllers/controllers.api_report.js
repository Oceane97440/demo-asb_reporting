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
const ModelAdvertiser = require("../models/models.advertiser");
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

      console.log(requestReporting)

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
      console.log(requestReporting)


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
              if (Impressions[i] !== Remove_undefined) {

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

              var interstitiel_dtj_impression = new Array()
              var interstitiel_dtj_click = new Array()
              var interstitiel_dtj_siteId = new Array()
              var interstitiel_dtj_siteName = new Array()
              var interstitiel_dtj_ctr = new Array()

              var interstitiel_antenne_impression = new Array()
              var interstitiel_antenne_click = new Array()
              var interstitiel_antenne_siteId = new Array()
              var interstitiel_antenne_siteName = new Array()
              var interstitiel_antenne_ctr = new Array()

              var interstitiel_orange_impression = new Array()
              var interstitiel_orange_click = new Array()
              var interstitiel_orange_siteId = new Array()
              var interstitiel_orange_siteName = new Array()
              var interstitiel_orange_ctr = new Array()

              var interstitiel_tf1_impression = new Array()
              var interstitiel_tf1_click = new Array()
              var interstitiel_tf1_siteId = new Array()
              var interstitiel_tf1_siteName = new Array()
              var interstitiel_tf1_ctr = new Array()

              var interstitiel_m6_impression = new Array()
              var interstitiel_m6_click = new Array()
              var interstitiel_m6_siteId = new Array()
              var interstitiel_m6_siteName = new Array()
              var interstitiel_m6_ctr = new Array()

              var interstitiel_dailymotion_impression = new Array()
              var interstitiel_dailymotion_click = new Array()
              var interstitiel_dailymotion_siteId = new Array()
              var interstitiel_dailymotion_siteName = new Array()
              var interstitiel_dailymotion_ctr = new Array()

              var interstitiel_actu_ios_impression = new Array()
              var interstitiel_actu_ios_click = new Array()
              var interstitiel_actu_ios_siteId = new Array()
              var interstitiel_actu_ios_siteName = new Array()
              var interstitiel_actu_ios_ctr = new Array()

              var interstitiel_actu_android_impression = new Array()
              var interstitiel_actu_android_click = new Array()
              var interstitiel_actu_android_siteId = new Array()
              var interstitiel_actu_android_siteName = new Array()
              var interstitiel_actu_android_ctr = new Array()

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

              var habillage_dtj_impression = new Array()
              var habillage_dtj_click = new Array()
              var habillage_dtj_siteId = new Array()
              var habillage_dtj_siteName = new Array()
              var habillage_dtj_ctr = new Array()

              var habillage_antenne_impression = new Array()
              var habillage_antenne_click = new Array()
              var habillage_antenne_siteId = new Array()
              var habillage_antenne_siteName = new Array()
              var habillage_antenne_ctr = new Array()

              var habillage_orange_impression = new Array()
              var habillage_orange_click = new Array()
              var habillage_orange_siteId = new Array()
              var habillage_orange_siteName = new Array()
              var habillage_orange_ctr = new Array()

              var habillage_tf1_impression = new Array()
              var habillage_tf1_click = new Array()
              var habillage_tf1_siteId = new Array()
              var habillage_tf1_siteName = new Array()
              var habillage_tf1_ctr = new Array()

              var habillage_m6_impression = new Array()
              var habillage_m6_click = new Array()
              var habillage_m6_siteId = new Array()
              var habillage_m6_siteName = new Array()
              var habillage_m6_ctr = new Array()

              var habillage_dailymotion_impression = new Array()
              var habillage_dailymotion_click = new Array()
              var habillage_dailymotion_siteId = new Array()
              var habillage_dailymotion_siteName = new Array()
              var habillage_dailymotion_ctr = new Array()

              var habillage_actu_ios_impression = new Array()
              var habillage_actu_ios_click = new Array()
              var habillage_actu_ios_siteId = new Array()
              var habillage_actu_ios_siteName = new Array()
              var habillage_actu_ios_ctr = new Array()

              var habillage_actu_android_impression = new Array()
              var habillage_actu_android_click = new Array()
              var habillage_actu_android_siteId = new Array()
              var habillage_actu_android_siteName = new Array()
              var habillage_actu_android_ctr = new Array()
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

              var masthead_dtj_impression = new Array()
              var masthead_dtj_click = new Array()
              var masthead_dtj_siteId = new Array()
              var masthead_dtj_siteName = new Array()
              var masthead_dtj_ctr = new Array()

              var masthead_antenne_impression = new Array()
              var masthead_antenne_click = new Array()
              var masthead_antenne_siteId = new Array()
              var masthead_antenne_siteName = new Array()
              var masthead_antenne_ctr = new Array()


              var masthead_orange_impression = new Array()
              var masthead_orange_click = new Array()
              var masthead_orange_siteId = new Array()
              var masthead_orange_siteName = new Array()
              var masthead_orange_ctr = new Array()

              var masthead_tf1_impression = new Array()
              var masthead_tf1_click = new Array()
              var masthead_tf1_siteId = new Array()
              var masthead_tf1_siteName = new Array()
              var masthead_tf1_ctr = new Array()

              var masthead_m6_impression = new Array()
              var masthead_m6_click = new Array()
              var masthead_m6_siteId = new Array()
              var masthead_m6_siteName = new Array()
              var masthead_m6_ctr = new Array()

              var masthead_dailymotion_impression = new Array()
              var masthead_dailymotion_click = new Array()
              var masthead_dailymotion_siteId = new Array()
              var masthead_dailymotion_siteName = new Array()
              var masthead_dailymotion_ctr = new Array()

              var masthead_actu_ios_impression = new Array()
              var masthead_actu_ios_click = new Array()
              var masthead_actu_ios_siteId = new Array()
              var masthead_actu_ios_siteName = new Array()
              var masthead_actu_ios_ctr = new Array()

              var masthead_actu_android_impression = new Array()
              var masthead_actu_android_click = new Array()
              var masthead_actu_android_siteId = new Array()
              var masthead_actu_android_siteName = new Array()
              var masthead_actu_android_ctr = new Array()
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

              var grandAngle_dtj_impression = new Array()
              var grandAngle_dtj_click = new Array()
              var grandAngle_dtj_siteId = new Array()
              var grandAngle_dtj_siteName = new Array()
              var grandAngle_dtj_ctr = new Array()


              var grandAngle_antenne_impression = new Array()
              var grandAngle_antenne_click = new Array()
              var grandAngle_antenne_siteId = new Array()
              var grandAngle_antenne_siteName = new Array()
              var grandAngle_antenne_ctr = new Array()

              var grandAngle_orange_impression = new Array()
              var grandAngle_orange_click = new Array()
              var grandAngle_orange_siteId = new Array()
              var grandAngle_orange_siteName = new Array()
              var grandAngle_orange_ctr = new Array()

              var grandAngle_tf1_impression = new Array()
              var grandAngle_tf1_click = new Array()
              var grandAngle_tf1_siteId = new Array()
              var grandAngle_tf1_siteName = new Array()
              var grandAngle_tf1_ctr = new Array()

              var grandAngle_m6_impression = new Array()
              var grandAngle_m6_click = new Array()
              var grandAngle_m6_siteId = new Array()
              var grandAngle_m6_siteName = new Array()
              var grandAngle_m6_ctr = new Array()

              var grandAngle_dailymotion_impression = new Array()
              var grandAngle_dailymotion_click = new Array()
              var grandAngle_dailymotion_siteId = new Array()
              var grandAngle_dailymotion_siteName = new Array()
              var grandAngle_dailymotion_ctr = new Array()

              var grandAngle_actu_ios_impression = new Array()
              var grandAngle_actu_ios_click = new Array()
              var grandAngle_actu_ios_siteId = new Array()
              var grandAngle_actu_ios_siteName = new Array()
              var grandAngle_actu_ios_ctr = new Array()

              var grandAngle_actu_android_impression = new Array()
              var grandAngle_actu_android_click = new Array()
              var grandAngle_actu_android_siteId = new Array()
              var grandAngle_actu_android_siteName = new Array()
              var grandAngle_actu_android_ctr = new Array()

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


              var native_dtj_impression = new Array()
              var native_dtj_click = new Array()
              var native_dtj_siteId = new Array()
              var native_dtj_siteName = new Array()
              var native_dtj_ctr = new Array()

              var native_antenne_impression = new Array()
              var native_antenne_click = new Array()
              var native_antenne_siteId = new Array()
              var native_antenne_siteName = new Array()
              var native_antenne_ctr = new Array()


              var native_orange_impression = new Array()
              var native_orange_click = new Array()
              var native_orange_siteId = new Array()
              var native_orange_siteName = new Array()
              var native_orange_ctr = new Array()

              var native_tf1_impression = new Array()
              var native_tf1_click = new Array()
              var native_tf1_siteId = new Array()
              var native_tf1_siteName = new Array()
              var native_tf1_ctr = new Array()

              var native_m6_impression = new Array()
              var native_m6_click = new Array()
              var native_m6_siteId = new Array()
              var native_m6_siteName = new Array()
              var native_m6_ctr = new Array()

              var native_dailymotion_impression = new Array()
              var native_dailymotion_click = new Array()
              var native_dailymotion_siteId = new Array()
              var native_dailymotion_siteName = new Array()
              var native_dailymotion_ctr = new Array()

              var native_actu_ios_impression = new Array()
              var native_actu_ios_click = new Array()
              var native_actu_ios_siteId = new Array()
              var native_actu_ios_siteName = new Array()
              var native_actu_ios_ctr = new Array()

              var native_actu_android_impression = new Array()
              var native_actu_android_click = new Array()
              var native_actu_android_siteId = new Array()
              var native_actu_android_siteName = new Array()
              var native_actu_android_ctr = new Array()

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


              var video_dtj_impression = new Array()
              var video_dtj_click = new Array()
              var video_dtj_siteId = new Array()
              var video_dtj_siteName = new Array()
              var video_dtj_ctr = new Array()

              var video_antenne_impression = new Array()
              var video_antenne_click = new Array()
              var video_antenne_siteId = new Array()
              var video_antenne_siteName = new Array()
              var video_antenne_ctr = new Array()

              var video_orange_impression = new Array()
              var video_orange_click = new Array()
              var video_orange_siteId = new Array()
              var video_orange_siteName = new Array()
              var video_orange_ctr = new Array()

              var video_tf1_impression = new Array()
              var video_tf1_click = new Array()
              var video_tf1_siteId = new Array()
              var video_tf1_siteName = new Array()
              var video_tf1_ctr = new Array()

              var video_m6_impression = new Array()
              var video_m6_click = new Array()
              var video_m6_siteId = new Array()
              var video_m6_siteName = new Array()
              var video_m6_ctr = new Array()

              var video_dailymotion_impression = new Array()
              var video_dailymotion_click = new Array()
              var video_dailymotion_siteId = new Array()
              var video_dailymotion_siteName = new Array()
              var video_dailymotion_ctr = new Array()

              var video_actu_ios_impression = new Array()
              var video_actu_ios_click = new Array()
              var video_actu_ios_siteId = new Array()
              var video_actu_ios_siteName = new Array()
              var video_actu_ios_ctr = new Array()

              
              var video_actu_android_impression = new Array()
              var video_actu_android_click = new Array()
              var video_actu_android_siteId = new Array()
              var video_actu_android_siteName = new Array()
              var video_actu_android_ctr = new Array()


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
                if (Array_SiteID[element] === "299249") {

                  video_linfo_android_impression.push(eval(Array_Impression[element]));
                  video_linfo_android_click.push(eval(Array_Clicks[element]));
                  video_linfo_android_siteId.push(Array_SiteID[element]);
                  video_linfo_android_siteName.push(Array_SiteName[element]);


                }
                //LINFO_ios

                if (Array_SiteID[element] === "299248") {

                  video_linfo_ios_impression.push(eval(Array_Impression[element]));
                  video_linfo_ios_click.push(eval(Array_Clicks[element]));
                  video_linfo_ios_siteId.push(Array_SiteID[element]);
                  video_linfo_ios_siteName.push(Array_SiteName[element]);


                }


                if (Array_SiteID[element] === "323124") {

                  video_dtj_impression.push(eval(Array_Impression[element]));
                  video_dtj_click.push(eval(Array_Clicks[element]));
                  video_dtj_siteId.push(Array_SiteID[element]);
                  video_dtj_siteName.push(Array_SiteName[element]);

                }


                if (Array_SiteID[element] === "299263") {

                  video_antenne_impression.push(eval(Array_Impression[element]));
                  video_antenne_click.push(eval(Array_Clicks[element]));
                  video_antenne_siteId.push(Array_SiteID[element]);
                  video_antenne_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299252") {
                  video_orange_impression.push(eval(Array_Impression[element]));
                  video_orange_click.push(eval(Array_Clicks[element]));
                  video_orange_siteId.push(Array_SiteID[element]);
                  video_orange_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299245") {
                  video_tf1_impression.push(eval(Array_Impression[element]));
                  video_tf1_click.push(eval(Array_Clicks[element]));
                  video_tf1_siteId.push(Array_SiteID[element]);
                  video_tf1_siteName.push(Array_SiteName[element]);


                }
                if (Array_SiteID[element] === "299244") {

                  video_m6_impression.push(eval(Array_Impression[element]));
                  video_m6_click.push(eval(Array_Clicks[element]));
                  video_m6_siteId.push(Array_SiteID[element]);
                  video_m6_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "337707") {
                  video_dailymotion_impression.push(eval(Array_Impression[element]));
                  video_dailymotion_click.push(eval(Array_Clicks[element]));
                  video_dailymotion_siteId.push(Array_SiteID[element]);
                  video_dailymotion_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299253") {
                  video_actu_ios_impression.push(eval(Array_Impression[element]));
                  video_actu_ios_click.push(eval(Array_Clicks[element]));
                  video_actu_ios_siteId.push(Array_SiteID[element]);
                  video_actu_ios_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299254") {
                  video_actu_android_impression.push(eval(Array_Impression[element]));
                  video_actu_android_click.push(eval(Array_Clicks[element]));
                  video_actu_android_siteId.push(Array_SiteID[element]);
                  video_actu_android_siteName.push(Array_SiteName[element]);

                }
                /*if (Array_SiteID[element] ==="389207") {
                                    sm_immo974.push(index);

                }
              
               
                if (Array_SiteID[element] ==="299254") {
                                    sm_actu_reunion_android.push(index);

                }
                if (Array_SiteID[element] ==="336662") {
                                    sm_rodzafer_ios.push(index);

                }
                if (Array_SiteID[element] ==="336733") {
                                    sm_rodzafer_android.push(index);

                }
                if (Array_SiteID[element] ==="371544") {
                                    sm_rodzafer_lp.push(index);

                }
                if (Array_SiteID[element] ==="369138") {
                                    sm_rodali.push(index);


                }*/

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
                if (Array_SiteID[element] === "299249") {

                  interstitiel_linfo_android_impression.push(eval(Array_Impression[element]));
                  interstitiel_linfo_android_click.push(eval(Array_Clicks[element]));
                  interstitiel_linfo_android_siteId.push(Array_SiteID[element]);
                  interstitiel_linfo_android_siteName.push(Array_SiteName[element]);


                }

                if (Array_SiteID[element] === "299248") {

                  interstitiel_linfo_ios_impression.push(eval(Array_Impression[element]));
                  interstitiel_linfo_ios_click.push(eval(Array_Clicks[element]));
                  interstitiel_linfo_ios_siteId.push(Array_SiteID[element]);
                  interstitiel_linfo_ios_siteName.push(Array_SiteName[element]);


                }
                if (Array_SiteID[element] === "323124") {

                  interstitiel_dtj_impression.push(eval(Array_Impression[element]));
                  interstitiel_dtj_click.push(eval(Array_Clicks[element]));
                  interstitiel_dtj_siteId.push(Array_SiteID[element]);
                  interstitiel_dtj_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299263") {

                  interstitiel_antenne_impression.push(eval(Array_Impression[element]));
                  interstitiel_antenne_click.push(eval(Array_Clicks[element]));
                  interstitiel_antenne_siteId.push(Array_SiteID[element]);
                  interstitiel_antenne_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299252") {
                  interstitiel_orange_impression.push(eval(Array_Impression[element]));
                  interstitiel_orange_click.push(eval(Array_Clicks[element]));
                  interstitiel_orange_siteId.push(Array_SiteID[element]);
                  interstitiel_orange_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299245") {
                  interstitiel_tf1_impression.push(eval(Array_Impression[element]));
                  interstitiel_tf1_click.push(eval(Array_Clicks[element]));
                  interstitiel_tf1_siteId.push(Array_SiteID[element]);
                  interstitiel_tf1_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299244") {
                  interstitiel_m6_impression.push(eval(Array_Impression[element]));
                  interstitiel_m6_click.push(eval(Array_Clicks[element]));
                  interstitiel_m6_siteId.push(Array_SiteID[element]);
                  interstitiel_m6_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "337707") {
                  interstitiel_dailymotion_impression.push(eval(Array_Impression[element]));
                  interstitiel_dailymotion_click.push(eval(Array_Clicks[element]));
                  interstitiel_dailymotion_siteId.push(Array_SiteID[element]);
                  interstitiel_dailymotion_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299253") {
                  interstitiel_actu_ios_impression.push(eval(Array_Impression[element]));
                  interstitiel_actu_ios_click.push(eval(Array_Clicks[element]));
                  interstitiel_actu_ios_siteId.push(Array_SiteID[element]);
                  interstitiel_actu_ios_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299254") {
                  interstitiel_actu_android_impression.push(eval(Array_Impression[element]));
                  interstitiel_actu_android_click.push(eval(Array_Clicks[element]));
                  interstitiel_actu_android_siteId.push(Array_SiteID[element]);
                  interstitiel_actu_android_siteName.push(Array_SiteName[element]);
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
                if (Array_SiteID[element] === "299249") {

                  habillage_linfo_android_impression.push(eval(Array_Impression[element]));
                  habillage_linfo_android_click.push(eval(Array_Clicks[element]));
                  habillage_linfo_android_siteId.push(Array_SiteID[element]);
                  habillage_linfo_android_siteName.push(Array_SiteName[element]);


                }

                if (Array_SiteID[element] === "299248") {

                  habillage_linfo_ios_impression.push(eval(Array_Impression[element]));
                  habillage_linfo_ios_click.push(eval(Array_Clicks[element]));
                  habillage_linfo_ios_siteId.push(Array_SiteID[element]);
                  habillage_linfo_ios_siteName.push(Array_SiteName[element]);


                }
                if (Array_SiteID[element] === "323124") {

                  habillage_dtj_impression.push(eval(Array_Impression[element]));
                  habillage_dtj_click.push(eval(Array_Clicks[element]));
                  habillage_dtj_siteId.push(Array_SiteID[element]);
                  habillage_dtj_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299263") {
                  habillage_antenne_impression.push(eval(Array_Impression[element]));
                  habillage_antenne_click.push(eval(Array_Clicks[element]));
                  habillage_antenne_siteId.push(Array_SiteID[element]);
                  habillage_antenne_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299252") {

                  habillage_orange_impression.push(eval(Array_Impression[element]));
                  habillage_orange_click.push(eval(Array_Clicks[element]));
                  habillage_orange_siteId.push(Array_SiteID[element]);
                  habillage_orange_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299245") {
                  habillage_tf1_impression.push(eval(Array_Impression[element]));
                  habillage_tf1_click.push(eval(Array_Clicks[element]));
                  habillage_tf1_siteId.push(Array_SiteID[element]);
                  habillage_tf1_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299244") {
                  habillage_m6_impression.push(eval(Array_Impression[element]));
                  habillage_m6_click.push(eval(Array_Clicks[element]));
                  habillage_m6_siteId.push(Array_SiteID[element]);
                  habillage_m6_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "337707") {
                  habillage_dailymotion_impression.push(eval(Array_Impression[element]));
                  habillage_dailymotion_click.push(eval(Array_Clicks[element]));
                  habillage_dailymotion_siteId.push(Array_SiteID[element]);
                  habillage_dailymotion_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299253") {
                  habillage_actu_ios_impression.push(eval(Array_Impression[element]));
                  habillage_actu_ios_click.push(eval(Array_Clicks[element]));
                  habillage_actu_ios_siteId.push(Array_SiteID[element]);
                  habillage_actu_ios_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299254") {
                  habillage_actu_android_impression.push(eval(Array_Impression[element]));
                  habillage_actu_android_click.push(eval(Array_Clicks[element]));
                  habillage_actu_android_siteId.push(Array_SiteID[element]);
                  habillage_actu_android_siteName.push(Array_SiteName[element]);
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
                if (Array_SiteID[element] === "299249") {

                  masthead_linfo_android_impression.push(eval(Array_Impression[element]));
                  masthead_linfo_android_click.push(eval(Array_Clicks[element]));
                  masthead_linfo_android_siteId.push(Array_SiteID[element]);
                  masthead_linfo_android_siteName.push(Array_SiteName[element]);


                }

                if (Array_SiteID[element] === "299248") {

                  masthead_linfo_ios_impression.push(eval(Array_Impression[element]));
                  masthead_linfo_ios_click.push(eval(Array_Clicks[element]));
                  masthead_linfo_ios_siteId.push(Array_SiteID[element]);
                  masthead_linfo_ios_siteName.push(Array_SiteName[element]);


                }
                if (Array_SiteID[element] === "323124") {

                  masthead_dtj_impression.push(eval(Array_Impression[element]));
                  masthead_dtj_click.push(eval(Array_Clicks[element]));
                  masthead_dtj_siteId.push(Array_SiteID[element]);
                  masthead_dtj_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299263") {
                  masthead_antenne_impression.push(eval(Array_Impression[element]));
                  masthead_antenne_click.push(eval(Array_Clicks[element]));
                  masthead_antenne_siteId.push(Array_SiteID[element]);
                  masthead_antenne_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299252") {
                  masthead_orange_impression.push(eval(Array_Impression[element]));
                  masthead_orange_click.push(eval(Array_Clicks[element]));
                  masthead_orange_siteId.push(Array_SiteID[element]);
                  masthead_orange_siteName.push(Array_SiteName[element]);
                }

                if (Array_SiteID[element] === "299245") {
                  masthead_tf1_impression.push(eval(Array_Impression[element]));
                  masthead_tf1_click.push(eval(Array_Clicks[element]));
                  masthead_tf1_siteId.push(Array_SiteID[element]);
                  masthead_tf1_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299244") {
                  masthead_m6_impression.push(eval(Array_Impression[element]));
                  masthead_m6_click.push(eval(Array_Clicks[element]));
                  masthead_m6_siteId.push(Array_SiteID[element]);
                  masthead_m6_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "337707") {
                  masthead_dailymotion_impression.push(eval(Array_Impression[element]));
                  masthead_dailymotion_click.push(eval(Array_Clicks[element]));
                  masthead_dailymotion_siteId.push(Array_SiteID[element]);
                  masthead_dailymotion_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299253") {
                  masthead_actu_ios_impression.push(eval(Array_Impression[element]));
                  masthead_actu_ios_click.push(eval(Array_Clicks[element]));
                  masthead_actu_ios_siteId.push(Array_SiteID[element]);
                  masthead_actu_ios_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299254") {
                  masthead_actu_android_impression.push(eval(Array_Impression[element]));
                  masthead_actu_android_click.push(eval(Array_Clicks[element]));
                  masthead_actu_android_siteId.push(Array_SiteID[element]);
                  masthead_actu_android_siteName.push(Array_SiteName[element]);
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
                if (Array_SiteID[element] === "299249") {

                  grandAngle_linfo_android_impression.push(eval(Array_Impression[element]));
                  grandAngle_linfo_android_click.push(eval(Array_Clicks[element]));
                  grandAngle_linfo_android_siteId.push(Array_SiteID[element]);
                  grandAngle_linfo_android_siteName.push(Array_SiteName[element]);


                }

                if (Array_SiteID[element] === "299248") {

                  grandAngle_linfo_ios_impression.push(eval(Array_Impression[element]));
                  grandAngle_linfo_ios_click.push(eval(Array_Clicks[element]));
                  grandAngle_linfo_ios_siteId.push(Array_SiteID[element]);
                  grandAngle_linfo_ios_siteName.push(Array_SiteName[element]);


                }
                if (Array_SiteID[element] === "323124") {

                  grandAngle_dtj_impression.push(eval(Array_Impression[element]));
                  grandAngle_dtj_click.push(eval(Array_Clicks[element]));
                  grandAngle_dtj_siteId.push(Array_SiteID[element]);
                  grandAngle_dtj_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299263") {

                  grandAngle_antenne_impression.push(eval(Array_Impression[element]));
                  grandAngle_antenne_click.push(eval(Array_Clicks[element]));
                  grandAngle_antenne_siteId.push(Array_SiteID[element]);
                  grandAngle_antenne_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299252") {
                  grandAngle_orange_impression.push(eval(Array_Impression[element]));
                  grandAngle_orange_click.push(eval(Array_Clicks[element]));
                  grandAngle_orange_siteId.push(Array_SiteID[element]);
                  grandAngle_orange_siteName.push(Array_SiteName[element]);

                }

                if (Array_SiteID[element] === "299245") {
                  grandAngle_tf1_impression.push(eval(Array_Impression[element]));
                  grandAngle_tf1_click.push(eval(Array_Clicks[element]));
                  grandAngle_tf1_siteId.push(Array_SiteID[element]);
                  grandAngle_tf1_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299244") {
                  grandAngle_m6_impression.push(eval(Array_Impression[element]));
                  grandAngle_m6_click.push(eval(Array_Clicks[element]));
                  grandAngle_m6_siteId.push(Array_SiteID[element]);
                  grandAngle_m6_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "337707") {
                  grandAngle_dailymotion_impression.push(eval(Array_Impression[element]));
                  grandAngle_dailymotion_click.push(eval(Array_Clicks[element]));
                  grandAngle_dailymotion_siteId.push(Array_SiteID[element]);
                  grandAngle_dailymotion_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299253") {
                  grandAngle_actu_ios_impression.push(eval(Array_Impression[element]));
                  grandAngle_actu_ios_click.push(eval(Array_Clicks[element]));
                  grandAngle_actu_ios_siteId.push(Array_SiteID[element]);
                  grandAngle_actu_ios_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299254") {
                  grandAngle_actu_android_impression.push(eval(Array_Impression[element]));
                  grandAngle_actu_android_click.push(eval(Array_Clicks[element]));
                  grandAngle_actu_android_siteId.push(Array_SiteID[element]);
                  grandAngle_actu_android_siteName.push(Array_SiteName[element]);

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
                if (Array_SiteID[element] === "299249") {

                  native_linfo_android_impression.push(eval(Array_Impression[element]));
                  native_linfo_android_click.push(eval(Array_Clicks[element]));
                  native_linfo_android_siteId.push(Array_SiteID[element]);
                  native_linfo_android_siteName.push(Array_SiteName[element]);


                }

                if (Array_SiteID[element] === "299248") {

                  native_linfo_ios_impression.push(eval(Array_Impression[element]));
                  native_linfo_ios_click.push(eval(Array_Clicks[element]));
                  native_linfo_ios_siteId.push(Array_SiteID[element]);
                  native_linfo_ios_siteName.push(Array_SiteName[element]);


                }
                if (Array_SiteID[element] === "323124") {

                  native_dtj_impression.push(eval(Array_Impression[element]));
                  native_dtj_click.push(eval(Array_Clicks[element]));
                  native_dtj_siteId.push(Array_SiteID[element]);
                  native_dtj_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299263") {
                  native_antenne_impression.push(eval(Array_Impression[element]));
                  native_antenne_click.push(eval(Array_Clicks[element]));
                  native_antenne_siteId.push(Array_SiteID[element]);
                  native_antenne_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299252") {
                  native_orange_impression.push(eval(Array_Impression[element]));
                  native_orange_click.push(eval(Array_Clicks[element]));
                  native_orange_siteId.push(Array_SiteID[element]);
                  native_orange_siteName.push(Array_SiteName[element]);

                }
                if (Array_SiteID[element] === "299245") {
                  native_tf1_impression.push(eval(Array_Impression[element]));
                  native_tf1_click.push(eval(Array_Clicks[element]));
                  native_tf1_siteId.push(Array_SiteID[element]);
                  native_tf1_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299244") {
                  native_m6_impression.push(eval(Array_Impression[element]));
                  native_m6_click.push(eval(Array_Clicks[element]));
                  native_m6_siteId.push(Array_SiteID[element]);
                  native_m6_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "337707") {
                  native_dailymotion_impression.push(eval(Array_Impression[element]));
                  native_dailymotion_click.push(eval(Array_Clicks[element]));
                  native_dailymotion_siteId.push(Array_SiteID[element]);
                  native_dailymotion_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299253") {
                  native_actu_ios_impression.push(eval(Array_Impression[element]));
                  native_actu_ios_click.push(eval(Array_Clicks[element]));
                  native_actu_ios_siteId.push(Array_SiteID[element]);
                  native_actu_ios_siteName.push(Array_SiteName[element]);
                }
                if (Array_SiteID[element] === "299254") {
                  native_actu_android_impression.push(eval(Array_Impression[element]));
                  native_actu_android_click.push(eval(Array_Clicks[element]));
                  native_actu_android_siteId.push(Array_SiteID[element]);
                  native_actu_android_siteName.push(Array_SiteName[element]);

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

              var total_impressions_linfoHabillage = habillage_linfo_impression.reduce(somme_array, 0);
              var total_clicks_linfoHabillage = habillage_linfo_click.reduce(somme_array, 0);

              var total_impressions_linfo_androidHabillage = habillage_linfo_android_impression.reduce(somme_array, 0);
              var total_clicks_linfo_androidHabillage = habillage_linfo_android_click.reduce(somme_array, 0);

              var total_impressions_linfo_iosHabillage = habillage_linfo_ios_impression.reduce(somme_array, 0);
              var total_clicks_linfo_iosHabillage = habillage_linfo_ios_click.reduce(somme_array, 0);

              var total_impressions_dtjHabillage = habillage_dtj_impression.reduce(somme_array, 0);
              var total_clicks_dtjHabillage = habillage_dtj_click.reduce(somme_array, 0);

              var total_impressions_antenneHabillage = habillage_antenne_impression.reduce(somme_array, 0);
              var total_clicks_antenneHabillage = habillage_antenne_click.reduce(somme_array, 0);

              var total_impressions_orangeHabillage = habillage_orange_impression.reduce(somme_array, 0);
              var total_clicks_orangeHabillage = habillage_orange_click.reduce(somme_array, 0);

              var total_impressions_tf1Habillage = habillage_tf1_impression.reduce(somme_array, 0);
              var total_clicks_tf1Habillage = habillage_tf1_click.reduce(somme_array, 0);

              var total_impressions_m6Habillage = habillage_m6_impression.reduce(somme_array, 0);
              var total_clicks_m6Habillage = habillage_m6_click.reduce(somme_array, 0);

              var total_impressions_dailymotionHabillage = habillage_dailymotion_impression.reduce(somme_array, 0);
              var total_clicks_dailymotionHabillage = habillage_dailymotion_click.reduce(somme_array, 0);

              var total_impressions_actu_iosHabillage = habillage_actu_ios_impression.reduce(somme_array, 0);
              var total_clicks_actu_iosHabillage = habillage_actu_ios_click.reduce(somme_array, 0);

              var total_impressions_actu_androidHabillage = habillage_actu_android_impression.reduce(somme_array, 0);
              var total_clicks_actu_androidHabillage = habillage_actu_android_click.reduce(somme_array, 0);
              ///////////////////////////

              var total_impressions_linfoGrandAngle = grandAngle_linfo_impression.reduce(somme_array, 0);
              var total_clicks_linfoGrandAngle = grandAngle_linfo_click.reduce(somme_array, 0);

              var total_impressions_linfo_androidGrandAngle = grandAngle_linfo_android_impression.reduce(somme_array, 0);
              var total_clicks_linfo_androidGrandAngle = grandAngle_linfo_android_click.reduce(somme_array, 0);

              var total_impressions_linfo_iosGrandAngle = grandAngle_linfo_ios_impression.reduce(somme_array, 0);
              var total_clicks_linfo_iosGrandAngle = grandAngle_linfo_ios_click.reduce(somme_array, 0);

              var total_impressions_dtjGrandAngle = grandAngle_dtj_impression.reduce(somme_array, 0);
              var total_clicks_dtjGrandAngle = grandAngle_dtj_click.reduce(somme_array, 0)

              var total_impressions_antenneGrandAngle = grandAngle_antenne_impression.reduce(somme_array, 0);
              var total_clicks_antenneGrandAngle = grandAngle_antenne_click.reduce(somme_array, 0);

              var total_impressions_orangeGrandAngle = grandAngle_orange_impression.reduce(somme_array, 0);
              var total_clicks_orangeGrandAngle = grandAngle_orange_click.reduce(somme_array, 0);

              var total_impressions_tf1GrandAngle = grandAngle_tf1_impression.reduce(somme_array, 0);
              var total_clicks_tf1GrandAngle = grandAngle_tf1_click.reduce(somme_array, 0);

              var total_impressions_m6GrandAngle = grandAngle_m6_impression.reduce(somme_array, 0);
              var total_clicks_m6GrandAngle = grandAngle_m6_click.reduce(somme_array, 0);

              var total_impressions_dailymotionGrandAngle = grandAngle_dailymotion_impression.reduce(somme_array, 0);
              var total_clicks_dailymotionGrandAngle = grandAngle_dailymotion_click.reduce(somme_array, 0);

              var total_impressions_actu_iosGrandAngle = grandAngle_actu_ios_impression.reduce(somme_array, 0);
              var total_clicks_actu_iosGrandAngle = grandAngle_actu_ios_click.reduce(somme_array, 0);

              var total_impressions_actu_androidGrandAngle = grandAngle_actu_android_impression.reduce(somme_array, 0);
              var total_clicks_actu_androidGrandAngle = grandAngle_actu_android_click.reduce(somme_array, 0);
              /////////////////////////
              var total_impressions_linfoVideo = video_linfo_impression.reduce(somme_array, 0);
              var total_clicks_linfoVideo = video_linfo_click.reduce(somme_array, 0);

              var total_impressions_linfo_androidVideo = video_linfo_android_impression.reduce(somme_array, 0);
              var total_clicks_linfo_androidVideo = video_linfo_android_click.reduce(somme_array, 0);

              var total_impressions_linfo_iosVideo = video_linfo_ios_impression.reduce(somme_array, 0);
              var total_clicks_linfo_iosVideo = video_linfo_ios_click.reduce(somme_array, 0);

              var total_impressions_dtjVideo = video_dtj_impression.reduce(somme_array, 0);
              var total_clicks_dtjVideo = video_dtj_click.reduce(somme_array, 0);

              var total_impressions_antenneVideo = video_antenne_impression.reduce(somme_array, 0);
              var total_clicks_antenneVideo = video_antenne_click.reduce(somme_array, 0);

              var total_impressions_orangeVideo = video_orange_impression.reduce(somme_array, 0);
              var total_clicks_orangeVideo = video_orange_click.reduce(somme_array, 0);

              var total_impressions_tf1Video = video_tf1_impression.reduce(somme_array, 0);
              var total_clicks_tf1Video = video_tf1_click.reduce(somme_array, 0);

              var total_impressions_m6Video = video_m6_impression.reduce(somme_array, 0);
              var total_clicks_m6Video = video_m6_click.reduce(somme_array, 0);

              var total_impressions_dailymotionVideo = video_dailymotion_impression.reduce(somme_array, 0);
              var total_clicks_dailymotionVideo = video_dailymotion_click.reduce(somme_array, 0);

              var total_impressions_actu_iosVideo = video_actu_ios_impression.reduce(somme_array, 0);
              var total_clicks_actu_iosVideo = video_actu_ios_click.reduce(somme_array, 0);

              var total_impressions_actu_androidVideo = video_actu_android_impression.reduce(somme_array, 0);
              var total_clicks_actu_androidVideo = video_actu_android_click.reduce(somme_array, 0);
              /////////////////////
              var total_impressions_linfoInterstitiel = interstitiel_linfo_impression.reduce(somme_array, 0);
              var total_clicks_linfoInterstitiel = interstitiel_linfo_click.reduce(somme_array, 0);

              var total_impressions_linfo_androidInterstitiel = interstitiel_linfo_android_impression.reduce(somme_array, 0);
              var total_clicks_linfo_androidInterstitiel = interstitiel_linfo_android_click.reduce(somme_array, 0);

              var total_impressions_linfo_iosInterstitiel = interstitiel_linfo_ios_impression.reduce(somme_array, 0);
              var total_clicks_linfo_iosInterstitiel = interstitiel_linfo_ios_click.reduce(somme_array, 0);


              var total_impressions_dtjInterstitiel = interstitiel_dtj_impression.reduce(somme_array, 0);
              var total_clicks_dtjInterstitiel = interstitiel_dtj_click.reduce(somme_array, 0);

              var total_impressions_antenneInterstitiel = interstitiel_antenne_impression.reduce(somme_array, 0);
              var total_clicks_antenneInterstitiel = interstitiel_antenne_click.reduce(somme_array, 0);

              var total_impressions_orangeInterstitiel = interstitiel_orange_impression.reduce(somme_array, 0);
              var total_clicks_orangeInterstitiel = interstitiel_orange_click.reduce(somme_array, 0);

              var total_impressions_tf1Interstitiel = interstitiel_tf1_impression.reduce(somme_array, 0);
              var total_clicks_tf1Interstitiel = interstitiel_tf1_click.reduce(somme_array, 0);

              var total_impressions_m6Interstitiel = interstitiel_m6_impression.reduce(somme_array, 0);
              var total_clicks_m6Interstitiel = interstitiel_m6_click.reduce(somme_array, 0);

              var total_impressions_dailymotionInterstitiel = interstitiel_dailymotion_impression.reduce(somme_array, 0);
              var total_clicks_dailymotionInterstitiel = interstitiel_dailymotion_click.reduce(somme_array, 0);

              var total_impressions_actu_iosInterstitiel = interstitiel_actu_ios_impression.reduce(somme_array, 0);
              var total_clicks_actu_iosInterstitiel = interstitiel_actu_ios_click.reduce(somme_array, 0);

              var total_impressions_actu_androidInterstitiel = interstitiel_actu_android_impression.reduce(somme_array, 0);
              var total_clicks_actu_androidInterstitiel = interstitiel_actu_android_click.reduce(somme_array, 0);
              /////////////////
              var total_impressions_linfoMasthead = masthead_linfo_impression.reduce(somme_array, 0);
              var total_clicks_linfoMasthead = masthead_linfo_click.reduce(somme_array, 0);

              var total_impressions_linfo_androidMasthead = masthead_linfo_android_impression.reduce(somme_array, 0);
              var total_clicks_linfo_androidMasthead = masthead_linfo_android_click.reduce(somme_array, 0);

              var total_impressions_linfo_iosMasthead = masthead_linfo_ios_impression.reduce(somme_array, 0);
              var total_clicks_linfo_iosMasthead = masthead_linfo_ios_click.reduce(somme_array, 0);

              var total_impressions_dtjMasthead = masthead_dtj_impression.reduce(somme_array, 0);
              var total_clicks_dtjMasthead = masthead_dtj_click.reduce(somme_array, 0);

              var total_impressions_antenneMasthead = masthead_antenne_impression.reduce(somme_array, 0);
              var total_clicks_antenneMasthead = masthead_antenne_click.reduce(somme_array, 0);

              var total_impressions_orangeMasthead = masthead_orange_impression.reduce(somme_array, 0);
              var total_clicks_orangeMasthead = masthead_orange_click.reduce(somme_array, 0);

              var total_impressions_tf1Masthead = masthead_tf1_impression.reduce(somme_array, 0);
              var total_clicks_tf1Masthead = masthead_tf1_click.reduce(somme_array, 0);

              var total_impressions_m6Masthead = masthead_m6_impression.reduce(somme_array, 0);
              var total_clicks_m6Masthead = masthead_m6_click.reduce(somme_array, 0);

              var total_impressions_dailymotionMasthead = masthead_dailymotion_impression.reduce(somme_array, 0);
              var total_clicks_dailymotionMasthead = masthead_dailymotion_click.reduce(somme_array, 0);

              var total_impressions_actu_iosMasthead = masthead_actu_ios_impression.reduce(somme_array, 0);
              var total_clicks_actu_iosMasthead = masthead_actu_ios_click.reduce(somme_array, 0);

              var total_impressions_actu_androidMasthead = masthead_actu_android_impression.reduce(somme_array, 0);
              var total_clicks_actu_androidMasthead = masthead_actu_android_click.reduce(somme_array, 0);
              //////////////////////
              var total_impressions_linfoNative = native_linfo_impression.reduce(somme_array, 0);
              var total_clicks_linfoNative = native_linfo_click.reduce(somme_array, 0);

              var total_impressions_linfo_androidNative = native_linfo_android_impression.reduce(somme_array, 0);
              var total_clicks_linfo_androidNative = native_linfo_android_click.reduce(somme_array, 0);

              var total_impressions_linfo_iosNative = native_linfo_ios_impression.reduce(somme_array, 0);
              var total_clicks_linfo_iosNative = native_linfo_ios_click.reduce(somme_array, 0);


              var total_impressions_dtjNative = native_dtj_impression.reduce(somme_array, 0);
              var total_clicks_dtjNative = native_dtj_click.reduce(somme_array, 0);


              var total_impressions_antenneNative = native_antenne_impression.reduce(somme_array, 0);
              var total_clicks_antenneNative = native_antenne_click.reduce(somme_array, 0);

              var total_impressions_orangeNative = native_orange_impression.reduce(somme_array, 0);
              var total_clicks_orangeNative = native_orange_click.reduce(somme_array, 0);

              var total_impressions_tf1Native = native_tf1_impression.reduce(somme_array, 0);
              var total_clicks_tf1Native = native_tf1_click.reduce(somme_array, 0);

              var total_impressions_m6Native = native_m6_impression.reduce(somme_array, 0);
              var total_clicks_m6Native = native_m6_click.reduce(somme_array, 0);

              var total_impressions_dailymotionNative = native_dailymotion_impression.reduce(somme_array, 0);
              var total_clicks_dailymotionNative = native_dailymotion_click.reduce(somme_array, 0);

              var total_impressions_actu_iosNative = native_actu_ios_impression.reduce(somme_array, 0);
              var total_clicks_actu_iosNative = native_actu_ios_click.reduce(somme_array, 0);

              var total_impressions_actu_androidNative = native_actu_android_impression.reduce(somme_array, 0);
              var total_clicks_actu_androidNative = native_actu_android_click.reduce(somme_array, 0);


              //calcule le ctr total par format et site
              let h_linfo = (total_clicks_linfoHabillage / total_impressions_linfoHabillage) * 100;
              habillage_linfo_ctr.push(h_linfo.toFixed(2));

              let h_linfo_android = (total_clicks_linfo_androidHabillage / total_impressions_linfo_androidHabillage) * 100;
              habillage_linfo_android_ctr.push(h_linfo_android.toFixed(2));

              let h_linfo_ios = (total_clicks_linfo_iosHabillage / total_impressions_linfo_iosHabillage) * 100;
              habillage_linfo_ios_ctr.push(h_linfo_ios.toFixed(2));

              let h_dtj = (total_clicks_dtjHabillage / total_impressions_dtjHabillage) * 100;
              habillage_dtj_ctr.push(h_dtj.toFixed(2));

              let h_antenne = (total_clicks_antenneHabillage / total_impressions_antenneHabillage) * 100;
              habillage_antenne_ctr.push(h_antenne.toFixed(2));


              let h_orange = (total_clicks_orangeHabillage / total_impressions_orangeHabillage) * 100;
              habillage_orange_ctr.push(h_orange.toFixed(2));

              let h_tf1 = (total_clicks_tf1Habillage / total_impressions_tf1Habillage) * 100;
              habillage_tf1_ctr.push(h_tf1.toFixed(2));

              let h_m6 = (total_clicks_m6Habillage / total_impressions_m6Habillage) * 100;
              habillage_m6_ctr.push(h_m6.toFixed(2));

              let h_dailymotion = (total_clicks_dailymotionHabillage / total_impressions_dailymotionHabillage) * 100;
              habillage_dailymotion_ctr.push(h_dailymotion.toFixed(2));

              let h_actu_ios = (total_clicks_actu_iosHabillage / total_impressions_actu_iosHabillage) * 100;
              habillage_actu_ios_ctr.push(h_actu_ios.toFixed(2));

              let h_actu_android = (total_clicks_actu_androidHabillage / total_impressions_actu_androidHabillage) * 100;
              habillage_actu_android_ctr.push(h_actu_android.toFixed(2));
              //////////////////
              let ga_linfo = (total_clicks_linfoGrandAngle / total_impressions_linfoGrandAngle) * 100;
              grandAngle_linfo_ctr.push(ga_linfo.toFixed(2));

              let ga_linfo_android = (total_clicks_linfo_androidGrandAngle / total_impressions_linfo_androidGrandAngle) * 100;
              grandAngle_linfo_android_ctr.push(ga_linfo_android.toFixed(2));

              let ga_linfo_ios = (total_clicks_linfo_iosGrandAngle / total_impressions_linfo_iosGrandAngle) * 100;
              grandAngle_linfo_ios_ctr.push(ga_linfo_ios.toFixed(2));

              let ga_dtj = (total_clicks_dtjGrandAngle / total_impressions_dtjGrandAngle) * 100;
              grandAngle_dtj_ctr.push(ga_dtj.toFixed(2));

              let ga_antenne = (total_clicks_antenneGrandAngle / total_impressions_antenneGrandAngle) * 100;
              grandAngle_antenne_ctr.push(ga_antenne.toFixed(2));

              let ga_orange = (total_clicks_orangeGrandAngle / total_impressions_orangeGrandAngle) * 100;
              grandAngle_orange_ctr.push(ga_orange.toFixed(2));

              let ga_tf1 = (total_clicks_tf1GrandAngle / total_impressions_tf1GrandAngle) * 100;
              grandAngle_tf1_ctr.push(ga_tf1.toFixed(2));

              let ga_m6 = (total_clicks_m6GrandAngle / total_impressions_m6GrandAngle) * 100;
              grandAngle_m6_ctr.push(ga_m6.toFixed(2));

              let ga_dailymotion = (total_clicks_dailymotionGrandAngle / total_impressions_dailymotionGrandAngle) * 100;
              grandAngle_dailymotion_ctr.push(ga_dailymotion.toFixed(2));

              let ga_actu_ios = (total_clicks_actu_iosGrandAngle / total_impressions_actu_iosGrandAngle) * 100;
              grandAngle_actu_ios_ctr.push(ga_actu_ios.toFixed(2));

              let ga_actu_android = (total_clicks_actu_androidGrandAngle / total_impressions_actu_androidGrandAngle) * 100;
              grandAngle_actu_android_ctr.push(ga_actu_android.toFixed(2));
              //////////////////

              let i_linfo = (total_clicks_linfoInterstitiel / total_impressions_linfoInterstitiel) * 100;
              interstitiel_linfo_ctr.push(i_linfo.toFixed(2));

              let i_linfo_android = (total_clicks_linfo_androidInterstitiel / total_impressions_linfo_androidInterstitiel) * 100;
              interstitiel_linfo_android_ctr.push(i_linfo_android.toFixed(2));

              let i_linfo_ios = (total_clicks_linfo_iosInterstitiel / total_impressions_linfo_iosInterstitiel) * 100;
              interstitiel_linfo_ios_ctr.push(i_linfo_ios.toFixed(2));


              let i_dtj = (total_clicks_dtjInterstitiel / total_impressions_dtjInterstitiel) * 100;
              interstitiel_dtj_ctr.push(i_dtj.toFixed(2));

              let i_antenne = (total_clicks_antenneInterstitiel / total_impressions_antenneInterstitiel) * 100;
              interstitiel_antenne_ctr.push(i_antenne.toFixed(2));

              let i_orange = (total_clicks_orangeInterstitiel / total_impressions_orangeInterstitiel) * 100;
              interstitiel_orange_ctr.push(i_orange.toFixed(2));

              let i_tf1 = (total_clicks_tf1Interstitiel / total_impressions_tf1Interstitiel) * 100;
              interstitiel_tf1_ctr.push(i_tf1.toFixed(2));

              let i_m6 = (total_clicks_m6Interstitiel / total_impressions_m6Interstitiel) * 100;
              interstitiel_m6_ctr.push(i_m6.toFixed(2));

              let i_dailymotion = (total_clicks_dailymotionInterstitiel / total_impressions_dailymotionInterstitiel) * 100;
              interstitiel_dailymotion_ctr.push(i_dailymotion.toFixed(2));

              let i_actu_ios = (total_clicks_actu_iosInterstitiel / total_impressions_actu_iosInterstitiel) * 100;
              interstitiel_actu_ios_ctr.push(i_actu_ios.toFixed(2));

              let i_actu_android = (total_clicks_actu_androidInterstitiel / total_impressions_actu_androidInterstitiel) * 100;
              interstitiel_actu_android_ctr.push(i_actu_android.toFixed(2));
              //////////////////

              let m_linfo = (total_clicks_linfoMasthead / total_impressions_linfoMasthead) * 100;
              masthead_linfo_ctr.push(m_linfo.toFixed(2));

              let m_linfo_android = (total_clicks_linfo_androidMasthead / total_impressions_linfo_androidMasthead) * 100;
              masthead_linfo_android_ctr.push(m_linfo_android.toFixed(2));

              let m_linfo_ios = (total_clicks_linfo_iosMasthead / total_impressions_linfo_iosMasthead) * 100;
              masthead_linfo_ios_ctr.push(m_linfo_ios.toFixed(2));

              let m_dtj = (total_clicks_dtjMasthead / total_impressions_dtjMasthead) * 100;
              masthead_dtj_ctr.push(m_dtj.toFixed(2));

              let m_antenne = (total_clicks_antenneMasthead / total_impressions_antenneMasthead) * 100;
              masthead_antenne_ctr.push(m_antenne.toFixed(2));

              let m_orange = (total_clicks_orangeMasthead / total_impressions_orangeMasthead) * 100;
              masthead_orange_ctr.push(m_orange.toFixed(2));

              let m_tf1 = (total_clicks_tf1Masthead / total_impressions_tf1Masthead) * 100;
              masthead_tf1_ctr.push(m_tf1.toFixed(2));

              let m_m6 = (total_clicks_m6Masthead / total_impressions_m6Masthead) * 100;
              masthead_m6_ctr.push(m_m6.toFixed(2));

              let m_dailymotion = (total_clicks_dailymotionMasthead / total_impressions_dailymotionMasthead) * 100;
              masthead_dailymotion_ctr.push(m_dailymotion.toFixed(2));

              let m_actu_ios = (total_clicks_actu_iosMasthead / total_impressions_actu_iosMasthead) * 100;
              masthead_actu_ios_ctr.push(m_actu_ios.toFixed(2));

              let m_actu_android = (total_clicks_actu_androidMasthead / total_impressions_actu_androidMasthead) * 100;
              masthead_actu_android_ctr.push(m_actu_android.toFixed(2));
              //////////////////

              let n_linfo = (total_clicks_linfoNative / total_impressions_linfoNative) * 100;
              native_linfo_ctr.push(n_linfo.toFixed(2));

              let n_linfo_android = (total_clicks_linfo_androidNative / total_impressions_linfo_androidNative) * 100;
              native_linfo_android_ctr.push(n_linfo_android.toFixed(2));

              let n_linfo_ios = (total_clicks_linfo_iosNative / total_impressions_linfo_iosNative) * 100;
              native_linfo_ios_ctr.push(n_linfo_ios.toFixed(2));

              let n_dtj = (total_clicks_dtjNative / total_impressions_dtjNative) * 100;
              native_dtj_ctr.push(n_dtj.toFixed(2));

              let n_antenne = (total_clicks_antenneNative / total_impressions_antenneNative) * 100;
              native_antenne_ctr.push(n_antenne.toFixed(2));

              let n_orange = (total_clicks_orangeNative / total_impressions_orangeNative) * 100;
              native_orange_ctr.push(n_orange.toFixed(2));

              let n_tf1 = (total_clicks_tf1Native / total_impressions_tf1Native) * 100;
              native_tf1_ctr.push(n_tf1.toFixed(2));

              let n_m6 = (total_clicks_m6Native / total_impressions_m6Native) * 100;
              native_m6_ctr.push(n_m6.toFixed(2));

              let n_dailymotion = (total_clicks_dailymotionNative / total_impressions_dailymotionNative) * 100;
              native_dailymotion_ctr.push(n_dailymotion.toFixed(2));

              let n_actu_ios = (total_clicks_actu_iosNative / total_impressions_actu_iosNative) * 100;
              native_actu_ios_ctr.push(n_actu_ios.toFixed(2));

              let n_actu_android = (total_clicks_actu_androidNative / total_impressions_actu_androidNative) * 100;
              native_actu_android_ctr.push(n_actu_android.toFixed(2));
              //////////////////


              let v_linfo = (total_clicks_linfoVideo / total_impressions_linfoVideo) * 100;
              video_linfo_ctr.push(v_linfo.toFixed(2));

              let v_linfo_android = (total_clicks_linfo_androidVideo / total_impressions_linfo_androidVideo) * 100;
              video_linfo_android_ctr.push(v_linfo_android.toFixed(2));

              let v_linfo_ios = (total_clicks_linfo_iosVideo / total_impressions_linfo_iosVideo) * 100;
              video_linfo_ios_ctr.push(v_linfo_ios.toFixed(2));

              let v_dtj = (total_clicks_dtjVideo / total_impressions_dtjVideo) * 100;
              video_dtj_ctr.push(v_dtj.toFixed(2));

              let v_antenne = (total_clicks_antenneVideo / total_impressions_antenneVideo) * 100;
              video_antenne_ctr.push(v_antenne.toFixed(2));

              let v_orange = (total_clicks_orangeVideo / total_impressions_orangeVideo) * 100;
              video_orange_ctr.push(v_orange.toFixed(2));

              let v_tf1 = (total_clicks_tf1Video / total_impressions_tf1Video) * 100;
              video_tf1_ctr.push(v_tf1.toFixed(2));

              let v_m6 = (total_clicks_m6Video / total_impressions_m6Video) * 100;
              video_m6_ctr.push(v_m6.toFixed(2));

              let v_dailymotion = (total_clicks_dailymotionVideo / total_impressions_dailymotionVideo) * 100;
              video_dailymotion_ctr.push(v_dailymotion.toFixed(2));

              let v_actu_ios = (total_clicks_actu_iosVideo / total_impressions_actu_iosVideo) * 100;
              video_actu_ios_ctr.push(v_actu_ios.toFixed(2));

              let v_actu_android = (total_clicks_actu_androidVideo / total_impressions_actu_androidVideo) * 100;
              video_actu_android_ctr.push(v_actu_android.toFixed(2));


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

            video_linfo_siteName = video_linfo_siteName[0];
            video_linfo_android_siteName = video_linfo_android_siteName[0];
            video_linfo_ios_siteName = video_linfo_ios_siteName[0];
            video_dtj_siteName = video_dtj_siteName[0];
            video_antenne_siteName = video_antenne_siteName[0];
            video_orange_siteName = video_orange_siteName[0];
            video_tf1_siteName = video_tf1_siteName[0];
            video_m6_siteName = video_m6_siteName[0];
            video_dailymotion_siteName = video_dailymotion_siteName[0];
            video_actu_ios_siteName = video_actu_ios_siteName[0];
            video_actu_android_siteName = video_actu_android_siteName[0];


            var data_video = {

              videoImpressions,
              /*videoClicks,
              videoSitename,
              videoFormatName,
              videoCTR,*/
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

              total_impressions_dtjVideo,
              total_clicks_dtjVideo,
              video_dtj_siteName,
              video_dtj_ctr,

              total_impressions_antenneVideo,
              total_clicks_antenneVideo,
              video_antenne_siteName,
              video_antenne_ctr,

              total_impressions_orangeVideo,
              total_clicks_orangeVideo,
              video_orange_siteName,
              video_orange_ctr,

              total_impressions_tf1Video,
              total_clicks_tf1Video,
              video_tf1_siteName,
              video_tf1_ctr,


              total_impressions_m6Video,
              total_clicks_m6Video,
              video_m6_siteName,
              video_m6_ctr,

              total_impressions_dailymotionVideo,
              total_clicks_dailymotionVideo,
              video_dailymotion_siteName,
              video_dailymotion_ctr,

              total_impressions_actu_iosVideo,
              total_clicks_actu_iosVideo,
              video_actu_ios_siteName,
              video_actu_ios_ctr,

              total_impressions_actu_androidVideo,
              total_clicks_actu_androidVideo,
              video_actu_android_siteName,
              video_actu_android_ctr,
            };


            habillage_linfo_siteName = habillage_linfo_siteName[0];
            habillage_linfo_android_siteName = habillage_linfo_android_siteName[0];
            habillage_linfo_ios_siteName = habillage_linfo_ios_siteName[0];
            habillage_dtj_siteName = habillage_dtj_siteName[0];
            habillage_antenne_siteName = habillage_antenne_siteName[0];
            habillage_orange_siteName = habillage_orange_siteName[0];
            habillage_tf1_siteName = habillage_tf1_siteName[0];
            habillage_m6_siteName = habillage_m6_siteName[0];
            habillage_dailymotion_siteName = habillage_dailymotion_siteName[0];
            habillage_actu_ios_siteName = habillage_actu_ios_siteName[0];
            habillage_actu_android_siteName = habillage_actu_android_siteName[0];


            var data_habillage = {

              habillageImpressions,
              /*habillageSitename,
              habillageClicks,
              habillageCTR,*/
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

              total_impressions_dtjHabillage,
              total_clicks_dtjHabillage,
              habillage_dtj_siteName,
              habillage_dtj_ctr,

              total_impressions_antenneHabillage,
              total_clicks_antenneHabillage,
              habillage_antenne_siteName,
              habillage_antenne_ctr,

              total_impressions_orangeHabillage,
              total_clicks_orangeHabillage,
              habillage_orange_siteName,
              habillage_orange_ctr,

              total_impressions_tf1Habillage,
              total_clicks_tf1Habillage,
              habillage_tf1_siteName,
              habillage_tf1_ctr,

              total_impressions_m6Habillage,
              total_clicks_m6Habillage,
              habillage_m6_siteName,
              habillage_m6_ctr,

              total_impressions_dailymotionHabillage,
              total_clicks_dailymotionHabillage,
              habillage_dailymotion_siteName,
              habillage_dailymotion_ctr,

              total_impressions_actu_iosHabillage,
              total_clicks_actu_iosHabillage,
              habillage_actu_ios_siteName,
              habillage_actu_ios_ctr,

              total_impressions_actu_androidHabillage,
              total_clicks_actu_androidHabillage,
              habillage_actu_android_siteName,
              habillage_actu_android_ctr,

            };

            interstitiel_linfo_siteName = interstitiel_linfo_siteName[0];
            interstitiel_linfo_android_siteName = interstitiel_linfo_android_siteName[0];
            interstitiel_linfo_ios_siteName = interstitiel_linfo_ios_siteName[0];
            interstitiel_dtj_siteName = interstitiel_dtj_siteName[0];
            interstitiel_antenne_siteName = interstitiel_antenne_siteName[0];
            interstitiel_orange_siteName = interstitiel_orange_siteName[0];
            interstitiel_tf1_siteName = interstitiel_tf1_siteName[0];
            interstitiel_m6_siteName = interstitiel_m6_siteName[0];
            interstitiel_dailymotion_siteName = interstitiel_dailymotion_siteName[0];
            interstitiel_actu_ios_siteName = interstitiel_actu_ios_siteName[0];
            interstitiel_actu_android_siteName = interstitiel_actu_android_siteName[0];


            var data_interstitiel = {

              interstitielImpressions,
              /*interstitielClicks,
              interstitielFormatName,
              interstitielSitename,
              interstitielCTR,*/
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


              total_impressions_dtjInterstitiel,
              total_clicks_dtjInterstitiel,
              interstitiel_dtj_siteName,
              interstitiel_dtj_ctr,

              total_impressions_antenneInterstitiel,
              total_clicks_antenneInterstitiel,
              interstitiel_antenne_siteName,
              interstitiel_antenne_ctr,

              total_impressions_orangeInterstitiel,
              total_clicks_orangeInterstitiel,
              interstitiel_orange_siteName,
              interstitiel_orange_ctr,

              total_impressions_tf1Interstitiel,
              total_clicks_tf1Interstitiel,
              interstitiel_tf1_siteName,
              interstitiel_tf1_ctr,

              total_impressions_m6Interstitiel,
              total_clicks_m6Interstitiel,
              interstitiel_m6_siteName,
              interstitiel_m6_ctr,

              total_impressions_dailymotionInterstitiel,
              total_clicks_dailymotionInterstitiel,
              interstitiel_dailymotion_siteName,
              interstitiel_dailymotion_ctr,

              total_impressions_actu_iosInterstitiel,
              total_clicks_actu_iosInterstitiel,
              interstitiel_actu_ios_siteName,
              interstitiel_actu_ios_ctr,

              total_impressions_actu_androidInterstitiel,
              total_clicks_actu_androidInterstitiel,
              interstitiel_actu_android_siteName,
              interstitiel_actu_android_ctr,

            };

            masthead_linfo_siteName = masthead_linfo_siteName[0];
            masthead_linfo_android_siteName = masthead_linfo_android_siteName[0];
            masthead_linfo_ios_siteName = masthead_linfo_ios_siteName[0];
            masthead_dtj_siteName = masthead_dtj_siteName[0];
            masthead_antenne_siteName = masthead_antenne_siteName[0];
            masthead_orange_siteName = masthead_orange_siteName[0];
            masthead_tf1_siteName = masthead_tf1_siteName[0];
            masthead_m6_siteName = masthead_m6_siteName[0];
            masthead_dailymotion_siteName = masthead_dailymotion_siteName[0];
            masthead_actu_ios_siteName = masthead_actu_ios_siteName[0];
            masthead_actu_android_siteName = masthead_actu_android_siteName[0];


            var data_masthead = {

              mastheadImpressions,
              /*mastheadClicks,
              mastheadFormatName,
              mastheadSitename,
              mastheadCTR,*/
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

              total_impressions_dtjMasthead,
              total_clicks_dtjMasthead,
              masthead_dtj_siteName,
              masthead_dtj_ctr,

              total_impressions_antenneMasthead,
              total_clicks_antenneMasthead,
              masthead_antenne_siteName,
              masthead_antenne_ctr,

              total_impressions_orangeMasthead,
              total_clicks_orangeMasthead,
              masthead_orange_siteName,
              masthead_orange_ctr,


              total_impressions_tf1Masthead,
              total_clicks_tf1Masthead,
              masthead_tf1_siteName,
              masthead_tf1_ctr,

              total_impressions_m6Masthead,
              total_clicks_m6Masthead,
              masthead_m6_siteName,
              masthead_m6_ctr,

              total_impressions_dailymotionMasthead,
              total_clicks_dailymotionMasthead,
              masthead_dailymotion_siteName,
              masthead_dailymotion_ctr,

              total_impressions_actu_iosMasthead,
              total_clicks_actu_iosMasthead,
              masthead_actu_ios_siteName,
              masthead_actu_ios_ctr,

              total_impressions_actu_androidMasthead,
              total_clicks_actu_androidMasthead,
              masthead_actu_android_siteName,
              masthead_actu_android_ctr,

            };

            grandAngle_linfo_siteName = grandAngle_linfo_siteName[0];
            grandAngle_linfo_android_siteName = grandAngle_linfo_android_siteName[0];
            grandAngle_linfo_ios_siteName = grandAngle_linfo_ios_siteName[0];
            grandAngle_dtj_siteName = grandAngle_dtj_siteName[0];
            grandAngle_antenne_siteName = grandAngle_antenne_siteName[0];
            grandAngle_orange_siteName = grandAngle_orange_siteName[0];
            grandAngle_tf1_siteName = grandAngle_tf1_siteName[0];
            grandAngle_m6_siteName = grandAngle_m6_siteName[0];
            grandAngle_dailymotion_siteName = grandAngle_dailymotion_siteName[0];
            grandAngle_actu_ios_siteName = grandAngle_actu_ios_siteName[0];
            grandAngle_actu_android_siteName = grandAngle_actu_android_siteName[0];


            var data_grand_angle = {

              grand_angleImpressions,
              /*grand_angleClicks,
              grand_angleFormatName,
              grand_angleSitename,
              grand_angleCTR,*/
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

              total_impressions_dtjGrandAngle,
              total_clicks_dtjGrandAngle,
              grandAngle_dtj_siteName,
              grandAngle_dtj_ctr,

              total_impressions_antenneGrandAngle,
              total_clicks_antenneGrandAngle,
              grandAngle_antenne_siteName,
              grandAngle_antenne_ctr,

              total_impressions_orangeGrandAngle,
              total_clicks_orangeGrandAngle,
              grandAngle_orange_siteName,
              grandAngle_orange_ctr,

              total_impressions_tf1GrandAngle,
              total_clicks_tf1GrandAngle,
              grandAngle_tf1_siteName,
              grandAngle_tf1_ctr,

              total_impressions_m6GrandAngle,
              total_clicks_m6GrandAngle,
              grandAngle_m6_siteName,
              grandAngle_m6_ctr,

              total_impressions_dailymotionGrandAngle,
              total_clicks_dailymotionGrandAngle,
              grandAngle_dailymotion_siteName,
              grandAngle_dailymotion_ctr,

              total_impressions_actu_iosGrandAngle,
              total_clicks_actu_iosGrandAngle,
              grandAngle_actu_ios_siteName,
              grandAngle_actu_ios_ctr,

              total_impressions_actu_androidGrandAngle,
              total_clicks_actu_androidGrandAngle,
              grandAngle_actu_android_siteName,
              grandAngle_actu_android_ctr,
            };

            native_linfo_siteName = native_linfo_siteName[0];
            native_linfo_android_siteName = native_linfo_android_siteName[0];
            native_linfo_ios_siteName = native_linfo_ios_siteName[0];
            native_dtj_siteName = native_dtj_siteName[0];
            native_antenne_siteName = native_antenne_siteName[0];
            native_orange_siteName = native_orange_siteName[0];
            native_tf1_siteName = native_tf1_siteName[0];
            native_m6_siteName = native_m6_siteName[0];
            native_dailymotion_siteName = native_dailymotion_siteName[0];
            native_actu_ios_siteName = native_actu_ios_siteName[0];
            native_actu_android_siteName = native_actu_android_siteName[0];


            var data_native = {

              nativeImpressions,
              /* nativeClicks,
               nativeFormatName,
               nativeSitename,
               nativeCTR,*/
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

              total_impressions_dtjNative,
              total_clicks_dtjNative,
              native_dtj_siteName,
              native_dtj_ctr,

              total_impressions_antenneNative,
              total_clicks_antenneNative,
              native_antenne_siteName,
              native_antenne_ctr,

              total_impressions_orangeNative,
              total_clicks_orangeNative,
              native_orange_siteName,
              native_orange_ctr,

              total_impressions_tf1Native,
              total_clicks_tf1Native,
              native_tf1_siteName,
              native_tf1_ctr,

              total_impressions_m6Native,
              total_clicks_m6Native,
              native_m6_siteName,
              native_m6_ctr,

              total_impressions_dailymotionNative,
              total_clicks_dailymotionNative,
              native_dailymotion_siteName,
              native_dailymotion_ctr,

              total_impressions_actu_iosNative,
              total_clicks_actu_iosNative,
              native_actu_ios_siteName,
              native_actu_ios_ctr,

              total_impressions_actu_androidNative,
              total_clicks_actu_androidNative,
              native_actu_android_siteName,
              native_actu_android_ctr,

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
      endDate: EndtDate,
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
      startDate: startDate,

    })


  }
}