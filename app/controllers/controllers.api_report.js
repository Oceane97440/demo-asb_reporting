// Initialise le module
const http = require('http');
const https = require('https');
const fs = require('fs')
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
const ModelAdvertiser = require("../models/models.advertiser")
const ModelCampaigns = require("../models/models.campaigns")

exports.test = async (req, res) => {
  /* let advertiserid = req.params.advertiserid;
   let campaignid = req.params.campaignid;
   let startDate = req.params.startdate

   res.redirect(`/api/reporting/generate/${advertiserid}/${campaignid}/${startDate}`)*/
  let time = 0;

  let timer = setInterval(function () {

    time += 1;
    console.log('count' + time);


    if (time >= 5) {
      console.log('timeclear');
      clearInterval(timer);
    }
  }, 1000);

  let timer = setInterval(function() {
      console.log('counter :   '+ counter) ;
  
      counter += 1000;
  
      if (counter >= 10000) {
          clearInterval(timer);
      }
  }, 1000);
  

}



exports.index = async (req, res) => {

  if (req.session.user.role == 1) {



    res.render("reporting/dasbord_report.ejs")

  }
}



exports.generate = async (req, res) => {

  //recupÃ¨re en parametre get id annonceur / id campagne / date de debut
  let advertiserid = req.params.advertiserid;
  let campaignid = req.params.campaignid;
  let startDate = req.params.startdate

  const timestamp_startdate = Date.parse(startDate);
  const date_now = Date.now()
  //console.log(timestamp_startdate);
 // console.log(date_now);


  if (date_now < timestamp_startdate) {
    console.log("message")
  }

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
    campaign: campaign,
    timestamp_startdate: timestamp_startdate,
    date_now: date_now
  })




}

exports.report = async (req, res) => {

  //fonctionnalitÃ© gÃ©nÃ©ration du rapport

  let advertiserid = req.params.advertiserid;
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

      //si la date expiration est < Ã  la date du jour on garde la cache
      if (timestamp_now < date_expire) {


        //  console.log('cache');

        //interval de temps <2h
        var dts_campaignid = data_report_view.ls_campaignid
        var dts_table = data_report_view.table
        var dts_data_habillage = data_report_view.data_habillage
        var dts_data_interstitiel = data_report_view.data_interstitiel
        var dts_data_masthead = data_report_view.data_masthead
        var dts_data_grand_angle = data_report_view.data_grand_angle
        var dts_data_native = data_report_view.data_native
        var dts_data_video = data_report_view.data_video
        var dts_date_expirer = data_report_view.date_expirer

        res.render('reporting/data-reporting-template.ejs', {
          table: dts_table,
          data_habillage: dts_data_habillage,
          data_interstitiel: dts_data_interstitiel,
          data_masthead: dts_data_masthead,
          data_grand_angle: dts_data_grand_angle,
          data_native: dts_data_native,
          data_video: dts_data_video,
          data_expirer: dts_date_expirer
        });



      } else {
        //si le local storage est expire supprime item precedent et les taskid
        localStorage.removeItem('campagneId' + '-' + campaignid);
        localStorage_tasks.removeItem('campagneId' + '-' + campaignid + '-' + "task_global");
        localStorage_tasks.removeItem('campagneId' + '-' + campaignid + '-' + "task_global_vu");

        res.redirect(`/api/reporting/generate/${advertiserid}/${campaignid}/${startDate}`)

      }


    } else {




      //initialisation des requÃªtes
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


      //RequÃªte visitor unique
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


      // 1) RequÃªte POST 
      let firstLink = await AxiosFunction.getReportingData('POST', '', requestReporting);
      let threeLink = await AxiosFunction.getReportingData('POST', '', requestVisitor_unique);



      if (firstLink.data.taskId || threeLink.data.taskId) {
        var taskId = firstLink.data.taskId;
        var taskId2 = threeLink.data.taskId;



        let requete1 = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`
        let requete2 = `https://reporting.smartadserverapis.com/2044/reports/${taskId2}`

        //2) RequÃªte GET boucle jusqu'a que le rapport gÃ©nÃ¨re 100% delais 1min
        //on commence à 10sec
        var time = 10000
        let timerFile = setInterval(async () => {

          //on incremente + 10sec
          time += 10000;
          // console.log('count'+time);

          // DATA STORAGE - TASK 1 et 2
          var dataLSTaskGlobal = localStorage_tasks.getItem('campagneId' + '-' + campaignid + '-' + "task_global");
          var dataLSTaskGlobalVU = localStorage_tasks.getItem('campagneId' + '-' + campaignid + '-' + "task_global_vu");

          if (!dataLSTaskGlobal || !dataLSTaskGlobalVU) {

            let secondLink = await AxiosFunction.getReportingData('GET', requete1, '');
            let fourLink = await AxiosFunction.getReportingData('GET', requete2, '');
            // console.log('secondLink  '+secondLink)
            // console.log('fourLink  '+ fourLink)


            //si le job progresse des 2 taskId est = 100% ou SUCCESS on arrête le fonction setInterval
            if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (secondLink.data.lastTaskInstance.jobProgress == '1.0') &&
              (fourLink.data.lastTaskInstance.instanceStatus == 'SUCCESS') && (secondLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')
            ) {

              clearInterval(timerFile);

              // Request task1
              if ((secondLink.data.lastTaskInstance.jobProgress == '1.0') && (secondLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {
                //3) Récupère la date de chaque requÃªte
                dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '')

                //save la data requête 1 dans le local storage
                var obj_dataFile = {
                  'datafile': dataFile.data
                };

                localStorage_tasks.setItem('campagneId' + '-' + campaignid + '-' + "task_global", JSON.stringify(obj_dataFile));
              }

              // Request task2
              if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (fourLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {
                //3) Récupère la date de chaque requÃªte
                dataFile2 = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId2}/file`, '');

                //save la data requête 2 dans le local storage
                var obj_dateFile2 = {
                  'datafile': dataFile2.data
                }

                localStorage_tasks.setItem('campagneId' + '-' + campaignid + '-' + "task_global_vu", JSON.stringify(obj_dateFile2));
              }

            }

          } else {

            //on arrête la fonction setInterval si il y a les 2 taskID en cache
            clearInterval(timerFile);


            const obj_default = JSON.parse(dataLSTaskGlobal);
            var data_split_global = obj_default.datafile
            const UniqueVisitors = []

            var data_split2 = data_split_vu.split(/\r?\n/);
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

            var data_split = data_split_global.split(/\r?\n/);
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
              var habillageSiteId = new Array()
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
                habillageSiteId.push(Array_SiteID[element]);
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










              var habillage_linfo_impression = new Array()
              var habillage_linfo_clic = new Array()
              var habillage_linfo_ctr = new Array()





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



              async function habillage_siteArrayElements(element, index, array) {

                // Rajouter les immpresions  et clics des formats
                habillage_linfo_impression.push(eval(habillageImpressions[element]));
                habillage_linfo_clic.push(eval(habillageClicks[element]));
                habillageSitename.push(habillageSitename[element]);
                habillage_linfo_ctr.push(habillageCTR[element]);

              }

              sm_linfo.forEach(habillage_siteArrayElements);




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

            // var ttl = 7200 //2h
            const now = new Date()
            var timestamp_now = now.getTime()
            var timestamp_expire = now.setHours(now.getHours() + 2);
            //console.log(timestamp_expire)


            function getDateTimeTimestamp(refrechTimeStamp) {
              let dates = new Date(refrechTimeStamp);
              return ('0' + dates.getDate()).slice(-2) + '/' + ('0' + (dates.getMonth() + 1)).slice(-2) + '/' + dates.getFullYear() + ' ' + ('0' + dates.getHours()).slice(-2) + ':' + ('0' + dates.getMinutes()).slice(-2);
            }
            var t3 = parseInt(timestamp_expire)

            var date_expirer = getDateTimeTimestamp(t3);

            //  console.log(date_expirer)

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
   /* var statusCoded = error.response.status;

    res.render("error.ejs", {
      statusCoded: statusCoded,
      advertiserid: advertiserid,
      campaignid: campaignid,
      startDate: startDate,
    })*/


  }



}

exports.automatisation = async (req, res) => {



  let campaignid = req.params.campaignid;


  try {



    var data_localStorage = localStorage.getItem('campagneId' + '-' + campaignid);



    res.json(data_localStorage)



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