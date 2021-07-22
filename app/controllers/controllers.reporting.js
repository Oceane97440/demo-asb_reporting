// Initialise le module
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('data/reporting');
localStorageTasks = new LocalStorage('data/taskID');

const {
    Op,
    and
} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

const {
    QueryTypes
} = require('sequelize');
const moment = require('moment');
moment.locale('fr');
const {
    check,
    query
} = require('express-validator');

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const Utilities = require('../functions/functions.utilities');

// Initialise les models
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelFormats = require("../models/models.formats");
const ModelSites = require("../models/models.sites");

exports.index = async (req, res) => {
    if (req.session.user.user_role == 1) {
        res.render("reporting/dasbord_report.ejs");
    }
}

exports.test = async (req, res) => {
    campaigncrypt = req.params.campaigncrypt;
    // Convertie le fichier localStorage task_global en objet
    filetasKID = 'campaignID-1914252-taskGlobalVU';
    var dataLSTaskGlobalVU = localStorageTasks.getItem(filetasKID);
    const objDefault = JSON.parse(dataLSTaskGlobalVU);
    var dataSplitGlobalVU = objDefault.datafile;

    var dataSplitGlobalVU = dataSplitGlobalVU.split(/\r?\n/);
    if (dataSplitGlobalVU) {
        var numberLine = dataSplitGlobalVU.length;
        for (i = 1; i < numberLine; i++) {
            // split push les données dans chaque colone
            line = dataSplitGlobalVU[i].split(';');
            if (!Utilities.empty(line[0])) {
                console.log({
                    vu: line[0]
                });
            }
        }
    }

    // Permet de faire l'addition
    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    // res.json(dataList);
    /*
        var impressions = new Array();
        var clicks = new Array();
        var complete = new Array();

        const CampaignStartDate = [];
        const CampaignEndtDate = [];
        const CampaignId = [];
        const CampaignName = [];
        const InsertionId = [];
        const InsertionName = [];
        const FormatId = [];
        const FormatName = [];
        const SiteId = [];
        const SiteName = [];
        const Impressions = [];
        const ClickRate = [];
        const Clicks = [];
        const Complete = [];

        const dataList = new Object();
        const formatObjects = new Object();

        var dataSplitGlobal = dataSplitGlobal.split(/\r?\n/);
        if (dataSplitGlobal) {
            var numberLine = dataSplitGlobal.length;
            for (i = 1; i < numberLine; i++) {
                // split push les données dans chaque colone
                line = dataSplitGlobal[i].split(';');
                if (!Utilities.empty(line[0])) {
                    InsertionName.push(line[5]);
                    dataList[i] = {
                        'campaign_start_date': line[0],
                        'campaign_end_date': line[1],
                        'campaign_id': line[2],
                        'campaign_name': line[3],
                        'insertion_id': line[4],
                        'insertion_name': line[5],
                        'format_id': line[6],
                        'format_name': line[7],
                        'site_id': line[8],
                        'site_name': line[9],
                        'impressions': line[10],
                        'click_rate': line[11],
                        'clicks': line[12],
                        'complete': line[13]
                    }
                }
            }
        }

        //
        if (dataList) {
            // console.log('Nombre object : ',Object.keys(dataList).length) Initialise les
            // formats
          
            var formatHabillage = new Array();
            var formatInterstitiel = new Array();
            var formatGrandAngle = new Array();
            var formatMasthead = new Array();
            var formatInstream = new Array();
            var formatRectangleVideo = new Array();
            var formatLogo = new Array();
            var formatNative = new Array();
            var formatSlider = new Array();
            var formatMea = new Array();
            var formatSliderVideo = new Array();

            // initialise les sites

            var siteObjects = new Object();

            var siteLINFO = new Array();
            var siteLINFO_ANDROID = new Array();
            var siteLINFO_IOS = new Array();
            var siteANTENNEREUNION = new Array();
            var siteDOMTOMJOB = new Array();
            var siteIMMO974 = new Array();
            var siteRODZAFER_LP = new Array();
            var siteRODZAFER_ANDROID = new Array();
            var siteRODZAFER_IOS = new Array();
            var siteRODALI = new Array();
            var siteORANGE_REUNION = new Array();
            var siteTF1 = new Array();
            var siteM6 = new Array();
            var siteDAILYMOTION = new Array();

            for (var index = 1; index <= Object.keys(dataList).length; index++) {
                var insertion_name = dataList[index].insertion_name;
                var site_id = dataList[index].site_id;
                var site_name = dataList[index].site_name;

                // Créer les tableaux des formats
                if (insertion_name.match(/^\HABILLAGE{1}/igm)) {
                    formatHabillage.push(index);
                }
                if (insertion_name.match(/^\INTERSTITIEL{1}/igm)) {
                    formatInterstitiel.push(index);
                }
                if (insertion_name.match(/^\MASTHEAD{1}/igm)) {
                    formatMasthead.push(index);
                }
                if (insertion_name.match(/^\GRAND ANGLE{1}/igm)) {
                    formatGrandAngle.push(index);
                }
                if (insertion_name.match(/^\PREROLL|MIDROLL{1}/igm)) {
                    formatInstream.push(index);
                }
                if (insertion_name.match(/^\RECTANGLE VIDEO{1}/igm)) {
                    formatRectangleVideo.push(index);
                }
                if (insertion_name.match(/^\LOGO{1}/igm)) {
                    formatLogo.push(index);
                }
                if (insertion_name.match(/^\NATIVE{1}/igm)) {
                    formatNative.push(index);
                }
                if (insertion_name.match(/^\SLIDER{1}/igm)) {
                    formatSlider.push(index);
                }
                if (insertion_name.match(/^\MEA{1}/igm)) {
                    formatMea.push(index);
                }
                if (insertion_name.match(/^\SLIDER VIDEO{1}/igm)) {
                    formatSliderVideo.push(index);
                }

                // Créer les tableaux des sites
                if (site_name.match(/^\SM_LINFO.re{1}/igm)) {
                    siteLINFO.push(index);
                }
                if (site_name.match(/^\SM_LINFO_ANDROID{1}/igm)) {
                    siteLINFO_ANDROID.push(index);
                }
                if (site_name.match(/^\SM_LINFO_IOS{1}/igm)) {
                    siteLINFO_IOS.push(index);
                }
                if (site_name.match(/^\SM_ANTENNEREUNION{1}/igm)) {
                    siteANTENNEREUNION.push(index);
                }
                if (site_name.match(/^\SM_DOMTOMJOB{1}/igm)) {
                    siteDOMTOMJOB.push(index);
                }
                if (site_name.match(/^\SM_IMMO974{1}/igm)) {
                    siteIMMO974.push(index);
                }
                if (site_name.match(/^\SM_RODZAFER_LP{1}/igm)) {
                    siteRODZAFER_LP.push(index);
                }
                if (site_name.match(/^\SM_RODZAFER_ANDROID{1}/igm)) {
                    siteRODZAFER_ANDROID.push(index);
                }
                if (site_name.match(/^\SM_RODZAFER_IOS{1}/igm)) {
                    siteRODZAFER_IOS.push(index);
                }
                if (site_name.match(/^\SM_ORANGE_REUNION{1}/igm)) {
                    siteORANGE_REUNION.push(index);
                }
                if (site_name.match(/^\SM_TF1{1}/igm)) {
                    siteTF1.push(index);
                }
                if (site_name.match(/^\SM_M6{1}/igm)) {
                    siteM6.push(index);
                }
                if (site_name.match(/^\SM_DAILYMOTION{1}/igm)) {
                    siteDAILYMOTION.push(index);
                }
                if (site_name.match(/^\SM_RODALI{1}/igm)) {
                    siteRODALI.push(index);
                }
            }

            // Function de trie et de récupération de données
            function sortDataReport(formatSearch, dataObject) {
                insertions = new Array();
                impressions = new Array();
                clicks = new Array();
                complete = new Array();
                sites = new Array();
                sites_rename = new Array();

                for (var jn = 0; jn < formatSearch.length; jn++) {
                    key = formatSearch[jn];
                    site_name = dataObject[key].site_name;
                    insertion_name = dataObject[key].insertion_name;

                    insertions.push(insertion_name);
                    impressions.push(parseInt(dataObject[key].impressions));
                    clicks.push(parseInt(dataObject[key].clicks));
                    complete.push(parseInt(dataObject[key].complete));
                    sites_rename.push(site_name);

                    // Récupére le nom des sites et les classes Créer les tableaux des sites
                    if (site_name.match(/^\SM_LINFO.re{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_LINFO-ANDROID{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_LINFO-IOS{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_ANTENNEREUNION{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_DOMTOMJOB{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_IMMO974{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_RODZAFER_LP{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_RODZAFER_ANDROID{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_RODZAFER_IOS{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_ORANGE_REUNION{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_TF1{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_M6{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_DAILYMOTION{1}/igm)) {
                        sites.push(site_name);
                    }
                    if (site_name.match(/^\SM_RODALI{1}/igm)) {
                        sites.push(site_name);
                    }

                    if (site_name.match(/^\N\/A{1}/i)) {
                        // Si N/A
                        if (insertion_name.match(/^\DOMTOMJOB{1}/igm)) {
                            sites.push('SM_DOMTOMJOB');
                        }
                        if (insertion_name.match(/^\APPLI LINFO{1}/igm)) {
                            sites.push('SM_LINFO-ANDROID');
                        }
                        if (insertion_name.match(/^\LINFO{1}/igm)) {
                            sites.push('SM_LINFO.re');
                        }
                        if (insertion_name.match(/^\ANTENNE REUNION{1}/igm)) {
                            sites.push('SM_ANTENNEREUNION');
                        }
                        if (insertion_name.match(/^\ORANGE REUNION{1}/igm)) {
                            sites.push('SM_ANTENNEREUNION');
                        }
                        if (insertion_name.match(/^\RODZAFER{1}/igm)) {
                            sites.push('SM_ANTENNEREUNION');
                        }
                        if (insertion_name.match(/^\RODALI{1}/igm)) {
                            sites.push('SM_ANTENNEREUNION');
                        }
                        if (insertion_name.match(/^\IMMO974{1}/igm)) {
                            sites.push('SM_IMMO974');
                        }
                        if (insertion_name.match(/^\TF1{1}/igm)) {
                            sites.push('SM_TF1');
                        }
                        if (insertion_name.match(/^\M6{1}/igm)) {
                            sites.push('SM_M6');
                        }
                        if (insertion_name.match(/^\DAILYMOTION{1}/igm)) {
                            sites.push('SM_DAILYMOTION');
                        }

                        sites.push('SM_LINFO.re');
                    }
                }

                // Gestion des sites
                if (sites && (sites.length > 0)) {
                    var siteUnique = new Array();
                    var siteUniqueKey = new Array();
                    var SiteUniqueCount = new Array();
                    var siteImpressions = new Array();
                    var siteClicks = new Array();
                    var siteComplete = new Array();

                    for (var kn = 0; kn < sites.length; kn++) {
                        key = formatSearch[kn];
                        impressionsSite = parseInt(dataObject[key].impressions);
                        clicksSite = parseInt(dataObject[key].clicks);
                        completeSite = parseInt(dataObject[key].complet);
                        var nameSite = sites[kn];

                        // Rentre les impressions
                        if (siteUnique[nameSite]) {
                            siteUnique[nameSite].splice(siteImpressions[nameSite].length, 1, key);
                        } else {
                            siteUnique[nameSite] = new Array();
                            siteUnique[nameSite][0] = key;
                            SiteUniqueCount.push(nameSite);
                        }

                        // Rentre les impressions
                        if (siteImpressions[nameSite]) {
                            siteImpressions[nameSite].splice(
                                siteImpressions[nameSite].length,
                                1,
                                impressionsSite
                            );
                        } else {
                            siteImpressions[nameSite] = new Array();
                            siteImpressions[nameSite][0] = impressionsSite;
                        }

                        // Rentre les Clicks
                        if (siteClicks[nameSite]) {
                            siteClicks[nameSite].splice(siteClicks[nameSite].length, 1, clicksSite);
                        } else {
                            siteClicks[nameSite] = new Array();
                            siteClicks[nameSite][0] = clicksSite;
                        }

                        // Rentre les Complete
                        if (siteComplete[nameSite]) {
                            siteComplete[nameSite].splice(siteComplete[nameSite].length, 1, completeSite);
                        } else {
                            siteComplete[nameSite] = new Array();
                            siteComplete[nameSite][0] = completeSite;
                        }
                    }

                    // Trie les données de sites
                    if (siteUnique && (SiteUniqueCount.length > 0)) {
                        siteList = new Object();
                        for (var ln = 0; ln < SiteUniqueCount.length; ln++) {
                            sN = SiteUniqueCount[ln];
                            siteImpressionsSUM = siteImpressions[sN].reduce(reducer);
                            siteClicksSUM = siteClicks[sN].reduce(reducer);
                            siteCompleteSUM = siteComplete[sN].reduce(reducer);
                            var itemSite = {
                                site: sN,
                                impressions: siteImpressionsSUM,
                                clicks: siteClicksSUM,
                                complete: siteCompleteSUM
                            };
                            siteList[ln] = itemSite;
                        }

                    }

                }

                resultDateReport = {
                    formatKey: formatSearch,
                    // insertions : insertions, sites_rename : sites_rename, sites : sites,
                    // siteUniqueCount : SiteUniqueCount, siteUnique : siteUnique, siteImpressions :
                    // siteImpressions, siteClicks : siteClicks, siteComplete : siteComplete,
                    siteList: siteList,
                    // impressions : impressions,
                    impressionsSUM: impressions.reduce(reducer),
                    // clicks : clicks,
                    clicksSUM: clicks.reduce(reducer),
                    // complete : complete,
                    completeSUM: complete.reduce(reducer)
                };
                return resultDateReport;
            }

            // Trie les formats et compatibilise les insertions et autres clics
            if (!Utilities.empty(formatHabillage)) {
                formatObjects.habillage = sortDataReport(formatHabillage, dataList);
            }
            if (!Utilities.empty(formatInterstitiel)) {
                formatObjects.interstitiel = sortDataReport(formatInterstitiel, dataList);
            }
            if (!Utilities.empty(formatMasthead)) {
                formatObjects.masthead = sortDataReport(formatMasthead, dataList);
            }
            if (!Utilities.empty(formatGrandAngle)) {
                formatObjects.grandangle = sortDataReport(formatGrandAngle, dataList);
            }
            if (!Utilities.empty(formatInstream)) {
                formatObjects.instream = sortDataReport(formatInstream, dataList);
            }
            if (!Utilities.empty(formatRectangleVideo)) {
                formatObjects.rectanglevideo = sortDataReport(formatRectangleVideo, dataList);
            }
            if (!Utilities.empty(formatLogo)) {
                formatObjects.logo = sortDataReport(formatLogo, dataList);
            }
            if (!Utilities.empty(formatNative)) {
                formatObjects.native = sortDataReport(formatNative, dataList);
            }
            if (!Utilities.empty(formatSlider)) {
                formatObjects.slider = sortDataReport(formatSlider, dataList);
            }
            if (!Utilities.empty(formatMea)) {
                formatObjects.mea = sortDataReport(formatMea, dataList);
            }
            if (!Utilities.empty(formatSliderVideo)) {
                formatObjects.slidervideo = sortDataReport(formatSliderVideo, dataList);
            }
        }

        res.json(formatObjects);
        */
}

exports.generate = async (req, res) => {
    let campaigncrypt = req.params.campaigncrypt;

    await ModelCampaigns
        .findOne({
            attributes: [
                'campaign_id',
                'campaign_name',
                'campaign_crypt',
                'advertiser_id',
                'campaign_start_date',
                'campaign_end_date'
            ],
            where: {
                campaign_crypt: campaigncrypt
            },
            include: [{
                model: ModelAdvertisers
            }]
        })
        .then(async function (campaign) {
            if (!campaign)
                return res
                    .status(404)
                    .render("error.ejs", {
                        statusCoded: 404,
                        campaigncrypt: campaigncrypt
                    });

            const timestamp_startdate = Date.parse(campaign.campaign_start_date);
            const date_now = Date.now();

            res.render("report/generate.ejs", {
                advertiserid: campaign.advertiser_id,
                campaignid: campaign.campaign_id,
                campaigncrypt: campaign.campaign_crypt,
                campaign: campaign,
                timestamp_startdate: timestamp_startdate,
                date_now: date_now,
                moment: moment
            });

        });
}

exports.report = async (req, res) => {
    let campaigncrypt = req.params.campaigncrypt;
    // console.log(campaigncrypt)

    try {
        // Réinitialise l'objet Format
        let formatObjects = new Object();

        var campaign = await ModelCampaigns
            .findOne({
                attributes: [
                    'campaign_id',
                    'campaign_name',
                    'campaign_crypt',
                    'advertiser_id',
                    'campaign_start_date',
                    'campaign_end_date'
                ],
                where: {
                    campaign_crypt: campaigncrypt
                },
                include: [{
                    model: ModelAdvertisers
                }]
            })
            .then(async function (campaign) {

                if (!campaign)
                    return res
                        .status(403)
                        .render("error.ejs", {
                            statusCoded: 403,
                            campaigncrypt: campaigncrypt
                        });

                // fonctionnalité de géneration du rapport
                let campaigncrypt = campaign.campaign_crypt
                let advertiserid = campaign.advertiser_id;
                let campaignid = campaign.campaign_id;
                var campaign_start_date = campaign.campaign_start_date;
                var campaign_end_date = campaign.campaign_end_date;

                // Gestion du cache
                let cacheStorageID = 'campaignID-' + campaignid;
                // Initialise la date
                let date = new Date();
                let cacheStorageIDHour = moment().format('YYYYMMDD-H');

                try {
                    var data_localStorage = localStorage.getItem('campaignID-' + campaignid);
                    // Si le localStorage existe -> affiche la data du localstorage
                    if (data_localStorage) {
                        var data_localStorage = localStorage.getItem('campaignID-' + campaignid);

                        // Si le localStorage exsite -> affiche la data du localstorage
                        // Convertie la date JSON en objet
                        var reportingData = JSON.parse(data_localStorage);

                        var reporting_requete_date = moment().format('YYYY-MM-DD h:m:s');
                        var reporting_start_date = reportingData.reporting_start_date;
                        var reporting_end_date = reportingData.reporting_end_date;

                        var campaign_end_date = reportingData.campaign.campaign_end_date;
                        var campaign_start_date = reportingData.campaign.campaign_start_date;

                        /*  console.log('Date reporting_start_date :', reporting_start_date);
                          console.log('Date reporting_end_date :', reporting_end_date);

                          console.log('campaign_start_date :', campaign_start_date);
                          console.log('campaign_end_date :', campaign_end_date);*/

                        // si la date d'expiration est < au moment de la requête on garde la cache
                        if ((reporting_requete_date < reporting_end_date) || (campaign_end_date < reporting_start_date)) {
                            res.render('report/template.ejs', {
                                reporting: reportingData,
                                moment: moment,
                                utilities: Utilities
                            });
                        } else {
                            //console.log('Supprime et relance la generation du rapport')

                            // si le local storage expire; on supprime les precedents cache et les taskid                           
                            localStorage.removeItem('campaignID-' + campaignid);
                            localStorageTasks.removeItem(
                                'campaignID-' + campaignid + '-taskGlobal'
                            );
                            localStorageTasks.removeItem(
                                'campaignID-' + campaignid + '-taskGlobalVU'
                            );

                            res.redirect('/rs/${campaigncrypt}');
                        }

                    } else {
                        //  console.log('data_localStorage no existe');

                        // Récupére les dates des insertions
                        insertion_start_date = await ModelInsertions.max('insertion_start_date', {
                            where: {
                                campaign_id: campaignid
                            }
                        });
                        insertion_end_date = await ModelInsertions.max('insertion_end_date', {
                            where: {
                                campaign_id: campaignid
                            }
                        });
                        // console.log('insertion_end_date : ', insertion_end_date);

                        // const now = new Date();
                        // const timestamp_datenow = now.getTime();

                        // Déclare la date du moment
                        var timestamp_datenow = moment().format("DD/MM/YYYY HH:mm:ss");


                        // recup la date de début de la campagne -4 heures pour règler le prob du décalage horaire
                        const campaign_start_date_yesterday = new Date(campaign_start_date);
                        var start_date_timezone = campaign_start_date_yesterday.setHours(-4);

                        // Teste pour récupérer la date la plus tôt
                        if (start_date_timezone > insertion_start_date) {
                            start_date_timezone = insertion_start_date;
                        }
                        //console.log('start_date_timezone :', start_date_timezone);

                        // recup la date de fin de la campagne ajoute +1jour
                        var endDate_day = new Date(campaign_end_date);
                        var endDate_last = endDate_day.setDate(endDate_day.getDate() + 1);



                        if (insertion_end_date > endDate_last) {
                            endDate_last = insertion_end_date;
                        }
                        // console.log('insertion_end_date : ', insertion_end_date, ' - end_date_timezone :', endDate_last);
                        /*
                        var s = parseInt(start_date_timezone);
                        var t3 = parseInt(endDate_last);
                        var t4  = moment(endDate_last).format("X");
                        console.log('t3 : ',t3,' - t4 :',t4);



                        const StartDate_timezone = Utilities.getDateTimezone(s);
                        const EndDate = Utilities.getDateTimezone(t3);
                        var t5  = moment(start_date_timezone).format("X");
                        console.log(' t5 :',t5, ' - StartDate_timezone : ',StartDate_timezone,' - EndDate :',EndDate);
                       
                        */

                        const StartDate_timezone = moment(start_date_timezone).format('YYYY-MM-DDTHH:mm:ss');
                        const EndDate = moment(endDate_last).format('YYYY-MM-DDTHH:mm:ss');

                        // si la date du jour est > à la date de fin on prend la date de fin sinon la
                        // date du jour
                        if (endDate_last < timestamp_datenow) {
                            var end_date = EndDate;
                        } else {
                            var end_date = "CURRENT_DAY+1";
                        }

                        // initialisation des requêtes
                        var requestReporting = {
                            "startDate": StartDate_timezone,
                            "endDate": end_date,
                            "fields": [{
                                "CampaignStartDate": {}
                            }, {
                                "CampaignEndDate": {}
                            }, {
                                "CampaignId": {}
                            }, {
                                "CampaignName": {}
                            }, {
                                "InsertionId": {}
                            }, {
                                "InsertionName": {}
                            }, {
                                "FormatId": {}
                            }, {
                                "FormatName": {}
                            }, {
                                "SiteId": {}
                            }, {
                                "SiteName": {}
                            }, {
                                "Impressions": {}
                            }, {
                                "ClickRate": {}
                            }, {
                                "Clicks": {}
                            }, {
                                "VideoCount": {
                                    "Id": "17",
                                    "OutputName": "Nbr_complete"
                                }
                            }],
                            "filter": [{
                                "CampaignId": [campaignid]
                            }]
                        }





                        //    On calcule le nombre de jour entre la date de début et de fin la date de fin campagne
                        //      ou et date aujourd'hui et la date de fin

                        var Start_date = new Date(campaign_start_date);
                        var End_date = new Date(campaign_end_date);
                        var Date_now = Date.now();

                        var start_end_day = Utilities.nbr_jours(Start_date, End_date);
                        var endday = Utilities.nbr_jours(Date_now, End_date);

                        const diff_start_end_day = start_end_day.day
                        const diff_end_now_day = endday.day


                        var requestVisitor_unique = ''

                        // si la différence de jour est <= à 31 , on exécute pas la requête
                        if (diff_start_end_day <= 31 || diff_end_now_day <= 31) {

                            /*var requestVisitor_unique = {
                                "startDate": StartDate_timezone,
                                "endDate": "2021-06-09T23:00:00",
                                "fields": [{
                                    "UniqueVisitors": {}
                                }],
                                "filter": [{
                                    "CampaignId": [campaignid]
                                }]
                            }
                            var requestVisitor_unique = {}



                        } else {*/
                            var requestVisitor_unique = {
                                "startDate": StartDate_timezone,
                                "endDate": end_date,
                                "fields": [{
                                    "UniqueVisitors": {}
                                }],
                                "filter": [{
                                    "CampaignId": [campaignid]
                                }]
                            }


                        }



                        // 1) Requête POST
                        var dataLSTaskGlobal = localStorageTasks.getItem(
                            'campaignID-' + campaignid + '-taskGlobal'
                        );

                        var dataLSTaskGlobalVU = localStorageTasks.getItem(
                            'campaignID-' + campaignid + '-taskGlobalVU'
                        );

                        // firstLink - Récupére la taskID de la requête reporting
                        let firstLinkTaskId = localStorageTasks.getItem(
                            'campaignID-' + campaignid + '-firstLink-' + cacheStorageIDHour
                        );

                        if (!firstLinkTaskId) {
                            let firstLink = await AxiosFunction.getReportingData(
                                'POST',
                                '',
                                requestReporting
                            );
                            if (firstLink.status == 201) {
                                localStorageTasks.setItem(
                                    'campaignID-' + campaignid + '-firstLink-' + cacheStorageIDHour,
                                    firstLink.data.taskId
                                );
                                firstLinkTaskId = firstLink.data.taskId;
                            }
                        }





                        // twoLink - Récupére la taskID de la requête reporting
                        let twoLinkTaskId = localStorageTasks.getItem(
                            'campaignID-' + campaignid + '-twoLink-' + cacheStorageIDHour
                        );






                        if ((!twoLinkTaskId) && (!Utilities.empty(requestVisitor_unique))) {
                            let twoLink = await AxiosFunction.getReportingData(
                                'POST',
                                '',
                                requestVisitor_unique
                            );
                            console.log('twoLink' + twoLink)
                            if (twoLink.status == 201) {
                                localStorageTasks.setItem(
                                    'campaignID-' + campaignid + '-twoLink-' + cacheStorageIDHour,
                                    twoLink.data.taskId
                                );
                                twoLinkTaskId = twoLink.data.taskId;
                            }
                        } else {
                            twoLinkTaskId = ''
                        }


                        console.log(
                            'firstLinkTaskId :',
                            firstLinkTaskId,
                            ' - twoLinkTaskId: ',
                            twoLinkTaskId
                        );


                        if (firstLinkTaskId || twoLinkTaskId) {
                            var taskId = firstLinkTaskId;
                            var taskId_uu = twoLinkTaskId;

                            console.log('taskId', taskId);
                            console.log("taskId_uu", taskId_uu);


                            let requete_global = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`;

                            // si taskId_uu existe on exécute la requête sinon initialisation des varibales
                            if ((!taskId_uu) && (!Utilities.empty(twoLinkTaskId))) {
                                let requete_vu = `https://reporting.smartadserverapis.com/2044/reports/${taskId_uu}`;

                            } else {
                                requete_vu = ''
                                console.log("Requete_vu vide")
                            }


                            // 2) Requete GET boucle jusqu'a que le rapport generer 100% delais 1min on
                            // commence à 10sec
                            var time = 10000;
                            let timerFile = setInterval(async () => {
                                // DATA STORAGE - TASK 1 et 2
                                var dataLSTaskGlobal = localStorageTasks.getItem(
                                    'campaignID-' + campaignid + '-taskGlobal'
                                );

                                // si dataLSTaskGlobalVU existe on recupère le localstorage sinon initialisation des varibales
                                if ((!requete_vu) && (!Utilities.empty(dataLSTaskGlobalVU))) {
                                    var dataLSTaskGlobalVU = localStorageTasks.getItem(
                                        'campaignID-' + campaignid + '-taskGlobalVU'
                                    );
                                } else {
                                    dataLSTaskGlobalVU = '';

                                    console.log('LocalStorage Vu est vide')
                                }



                                if (!dataLSTaskGlobal || !dataLSTaskGlobalVU) {

                                    if (!dataLSTaskGlobal) {
                                        time += 5000;

                                        //test Utiliis.empty

                                        let threeLink = await AxiosFunction.getReportingData('GET', requete_global, '');

                                        if ((threeLink.data.lastTaskInstance.jobProgress == '1.0') && (threeLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {
                                            // 3) Récupère la date de chaque requête
                                            let dataLSTaskGlobal = localStorageTasks.getItem(
                                                'campaignID-' + campaignid + '-taskGlobal'
                                            );
                                            if (!dataLSTaskGlobal) {
                                                dataFile = await AxiosFunction.getReportingData(
                                                    'GET',
                                                    `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`,
                                                    ''
                                                );
                                                // save la data requête 1 dans le local storage
                                                dataLSTaskGlobal = {
                                                    'datafile': dataFile.data
                                                };
                                                localStorageTasks.setItem(
                                                    'campaignID-' + campaignid + '-taskGlobal',
                                                    JSON.stringify(dataLSTaskGlobal)
                                                );
                                                console.log('Creation de dataLSTaskGlobal');
                                            }
                                        }
                                    }

                                    // Request task2

                                    // si dataLSTaskGlobalVU ou requete_vu existe on exécute les requête sinon initialisation des varibales
                                    if (!dataLSTaskGlobalVU && Utilities.empty(requete_vu)) {
                                        time += 5000;

                                        let fourLink = await AxiosFunction.getReportingData('GET', requete_vu, '');

                                   
                                            if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (fourLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {

                                                // 3) Récupère la date de chaque requête
                                                dataLSTaskGlobalVU = localStorageTasks.getItem(
                                                    'campaignID-' + campaignid + '-taskGlobalVU'
                                                );
                                                if (!dataLSTaskGlobalVU && Utilities.empty(fourLink)) {
                                                    dataFile2 = await AxiosFunction.getReportingData(
                                                        'GET',
                                                        `https://reporting.smartadserverapis.com/2044/reports/${taskId_uu}/file`,
                                                        ''
                                                    );
                                                    // save la data requête 2 dans le local storage
                                                    dataLSTaskGlobalVU = {
                                                        'datafile': dataFile2.data
                                                    };
                                                    localStorageTasks.setItem(
                                                        'campaignID-' + campaignid + '-taskGlobalVU',
                                                        JSON.stringify(dataLSTaskGlobalVU)
                                                    );
                                                    console.log('Creation de dataLSTaskGlobalVU');
                                                }else{
                                                      // save la data requête 2 dans le local storage
                                                      dataLSTaskGlobalVU = {
                                                        'datafile': 0
                                                    };
                                                    localStorageTasks.setItem(
                                                        'campaignID-' + campaignid + '-taskGlobalVU',
                                                        JSON.stringify(dataLSTaskGlobalVU)
                                                    );
                                                    console.log('Creation de dataLSTaskGlobalVU');
                                                }
                                            }
                                      




                                    }

                                    if (dataLSTaskGlobal && dataLSTaskGlobalVU) {
                                        console.log('Creation de clearInterval(timerFile)');
                                    }

                                } else {
                                    // Stoppe l'intervalle timerFile
                                    clearInterval(timerFile);
                                    console.log('Stop clearInterval timerFile');

                                    // On récupére le dataLSTaskGlobal                     
                                    const objDefault = JSON.parse(dataLSTaskGlobal);
                                    var dataSplitGlobal = objDefault.datafile;

                                    // Permet de faire l'addition
                                    const reducer = (accumulator, currentValue) => accumulator + currentValue;

                                    var impressions = new Array();
                                    var clicks = new Array();
                                    var complete = new Array();

                                    const CampaignStartDate = [];
                                    const CampaignEndtDate = [];
                                    const CampaignId = [];
                                    const CampaignName = [];
                                    const InsertionId = [];
                                    const InsertionName = [];
                                    const FormatId = [];
                                    const FormatName = [];
                                    const SiteId = [];
                                    const SiteName = [];
                                    const Impressions = [];
                                    const ClickRate = [];
                                    const Clicks = [];
                                    const Complete = [];

                                    const dataList = new Object();

                                    var dataSplitGlobal = dataSplitGlobal.split(/\r?\n/);
                                    if (dataSplitGlobal && (dataSplitGlobal.length > 0)) {
                                        var numberLine = dataSplitGlobal.length;
                                        console.log('numberLine :', numberLine);
                                        console.log('dataSplitGlobal :', dataSplitGlobal);
                                        if (numberLine > 1) {
                                            for (i = 1; i < numberLine; i++) {
                                                // split push les données dans chaque colone
                                                line = dataSplitGlobal[i].split(';');
                                                if (!Utilities.empty(line[0])) {
                                                    InsertionName.push(line[5]);
                                                    Impressions.push(parseInt(line[10]));
                                                    Clicks.push(parseInt(line[12]));
                                                    Complete.push(parseInt(line[13]));

                                                    dataList[i] = {
                                                        'campaign_start_date': line[0],
                                                        'campaign_end_date': line[1],
                                                        'campaign_id': line[2],
                                                        'campaign_name': line[3],
                                                        'insertion_id': line[4],
                                                        'insertion_name': line[5],
                                                        'format_id': line[6],
                                                        'format_name': line[7],
                                                        'site_id': line[8],
                                                        'site_name': line[9],
                                                        'impressions': parseInt(line[10]),
                                                        'click_rate': parseInt(line[11]),
                                                        'clicks': parseInt(line[12]),
                                                        'complete': parseInt(line[13])
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    //
                                    var formatObjects = new Object();
                                    if (dataList && (Object.keys(dataList).length > 0)) {
                                        console.log('Nombre object : ', Object.keys(dataList).length);
                                        // Initialise les formats
                                        var formatHabillage = new Array();
                                        var formatInterstitiel = new Array();
                                        var formatGrandAngle = new Array();
                                        var formatMasthead = new Array();
                                        var formatInstream = new Array();
                                        var formatRectangleVideo = new Array();
                                        var formatLogo = new Array();
                                        var formatNative = new Array();
                                        var formatSlider = new Array();
                                        var formatMea = new Array();
                                        var formatSliderVideo = new Array();

                                        // initialise les sites                            
                                        var siteObjects = new Object();

                                        var siteLINFO = new Array();
                                        var siteLINFO_ANDROID = new Array();
                                        var siteLINFO_IOS = new Array();
                                        var siteANTENNEREUNION = new Array();
                                        var siteDOMTOMJOB = new Array();
                                        var siteIMMO974 = new Array();
                                        var siteRODZAFER_LP = new Array();
                                        var siteRODZAFER_ANDROID = new Array();
                                        var siteRODZAFER_IOS = new Array();
                                        var siteRODALI = new Array();
                                        var siteORANGE_REUNION = new Array();
                                        var siteTF1 = new Array();
                                        var siteM6 = new Array();
                                        var siteDAILYMOTION = new Array();

                                        for (var index = 1; index <= Object.keys(dataList).length; index++) {
                                            var insertion_name = dataList[index].insertion_name;
                                            var site_id = dataList[index].site_id;
                                            var site_name = dataList[index].site_name;
                                            console.log(insertion_name)
                                            // Créer les tableaux des formats
                                            if (insertion_name.match(/HABILLAGE{1}/igm)) {
                                                formatHabillage.push(index);
                                            }
                                            if (insertion_name.match(/INTERSTITIEL{1}/igm)) {
                                                formatInterstitiel.push(index);
                                            }
                                            if (insertion_name.match(/MASTHEAD{1}/igm)) {
                                                formatMasthead.push(index);
                                            }
                                            if (insertion_name.match(/GRAND ANGLE{1}/igm)) {
                                                formatGrandAngle.push(index);
                                            }
                                            if (insertion_name.match(/PREROLL|MIDROLL{1}/igm)) {
                                                formatInstream.push(index);
                                            }
                                            if (insertion_name.match(/RECTANGLE VIDEO{1}/igm)) {
                                                formatRectangleVideo.push(index);
                                            }
                                            if (insertion_name.match(/LOGO{1}/igm)) {
                                                formatLogo.push(index);
                                            }
                                            if (insertion_name.match(/NATIVE{1}/igm)) {
                                                formatNative.push(index);
                                            }
                                            if (insertion_name.match(/SLIDER{1}/igm)) {
                                                formatSlider.push(index);
                                            }
                                            if (insertion_name.match(/^\MEA{1}/igm)) {
                                                formatMea.push(index);
                                            }
                                            if (insertion_name.match(/SLIDER VIDEO{1}/igm)) {
                                                formatSliderVideo.push(index);
                                            }

                                            // Créer les tableaux des sites
                                            if (site_name.match(/^\SM_LINFO.re{1}/igm)) {
                                                siteLINFO.push(index);
                                            }
                                            if (site_name.match(/^\SM_LINFO_ANDROID{1}/igm)) {
                                                siteLINFO_ANDROID.push(index);
                                            }
                                            if (site_name.match(/^\SM_LINFO_IOS{1}/igm)) {
                                                siteLINFO_IOS.push(index);
                                            }
                                            if (site_name.match(/^\SM_ANTENNEREUNION{1}/igm)) {
                                                siteANTENNEREUNION.push(index);
                                            }
                                            if (site_name.match(/^\SM_DOMTOMJOB{1}/igm)) {
                                                siteDOMTOMJOB.push(index);
                                            }
                                            if (site_name.match(/^\SM_IMMO974{1}/igm)) {
                                                siteIMMO974.push(index);
                                            }
                                            if (site_name.match(/^\SM_RODZAFER_LP{1}/igm)) {
                                                siteRODZAFER_LP.push(index);
                                            }
                                            if (site_name.match(/^\SM_RODZAFER_ANDROID{1}/igm)) {
                                                siteRODZAFER_ANDROID.push(index);
                                            }
                                            if (site_name.match(/^\SM_RODZAFER_IOS{1}/igm)) {
                                                siteRODZAFER_IOS.push(index);
                                            }
                                            if (site_name.match(/^\SM_ORANGE_REUNION{1}/igm)) {
                                                siteORANGE_REUNION.push(index);
                                            }
                                            if (site_name.match(/^\SM_TF1{1}/igm)) {
                                                siteTF1.push(index);
                                            }
                                            if (site_name.match(/^\SM_M6{1}/igm)) {
                                                siteM6.push(index);
                                            }
                                            if (site_name.match(/^\SM_DAILYMOTION{1}/igm)) {
                                                siteDAILYMOTION.push(index);
                                            }
                                            if (site_name.match(/^\SM_RODALI{1}/igm)) {
                                                siteRODALI.push(index);
                                            }
                                        }

                                        // Function de trie et de récupération de données
                                        function sortDataReport(formatSearch, dataObject) {
                                            insertions = new Array();
                                            impressions = new Array();
                                            clicks = new Array();
                                            complete = new Array();
                                            sites = new Array();
                                            sites_rename = new Array();

                                            for (var jn = 0; jn < formatSearch.length; jn++) {
                                                key = formatSearch[jn];
                                                site_name = dataObject[key].site_name;
                                                insertion_name = dataObject[key].insertion_name;

                                                insertions.push(insertion_name);
                                                impressions.push(parseInt(dataObject[key].impressions));
                                                clicks.push(parseInt(dataObject[key].clicks));
                                                complete.push(parseInt(dataObject[key].complete));
                                                sites_rename.push(site_name);

                                                // Récupére le nom des sites et les classes Créer les tableaux des sites
                                                if (site_name.match(/^\SM_LINFO.re{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_LINFO-ANDROID{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_LINFO-IOS{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_ANTENNEREUNION{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_DOMTOMJOB{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_IMMO974{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_RODZAFER_LP{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_RODZAFER_ANDROID{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_RODZAFER_IOS{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_ORANGE_REUNION{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_TF1{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_M6{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_DAILYMOTION{1}/igm)) {
                                                    sites.push(site_name);
                                                }
                                                if (site_name.match(/^\SM_RODALI{1}/igm)) {
                                                    sites.push(site_name);
                                                }

                                                if (site_name.match(/^\N\/A{1}/i)) {
                                                    // Si N/A
                                                    if (insertion_name.match(/^\DOMTOMJOB{1}/igm)) {
                                                        sites.push('SM_DOMTOMJOB');
                                                    }
                                                    if (insertion_name.match(/^\APPLI LINFO{1}/igm)) {
                                                        sites.push('SM_LINFO-ANDROID');
                                                    }
                                                    if (insertion_name.match(/^\LINFO{1}/igm)) {
                                                        sites.push('SM_LINFO.re');
                                                    }
                                                    if (insertion_name.match(/^\ANTENNE REUNION{1}/igm)) {
                                                        sites.push('SM_ANTENNEREUNION');
                                                    }
                                                    if (insertion_name.match(/^\ORANGE REUNION{1}/igm)) {
                                                        sites.push('SM_ANTENNEREUNION');
                                                    }
                                                    if (insertion_name.match(/^\RODZAFER{1}/igm)) {
                                                        sites.push('SM_ANTENNEREUNION');
                                                    }
                                                    if (insertion_name.match(/^\RODALI{1}/igm)) {
                                                        sites.push('SM_ANTENNEREUNION');
                                                    }
                                                    if (insertion_name.match(/^\IMMO974{1}/igm)) {
                                                        sites.push('SM_IMMO974');
                                                    }
                                                    if (insertion_name.match(/^\TF1{1}/igm)) {
                                                        sites.push('SM_TF1');
                                                    }
                                                    if (insertion_name.match(/^\M6{1}/igm)) {
                                                        sites.push('SM_M6');
                                                    }
                                                    if (insertion_name.match(/^\DAILYMOTION{1}/igm)) {
                                                        sites.push('SM_DAILYMOTION');
                                                    }

                                                    sites.push('SM_LINFO.re');
                                                }
                                            }

                                            // Gestion des sites
                                            if (sites && (sites.length > 0)) {
                                                var siteUnique = new Array();
                                                var siteUniqueKey = new Array();
                                                var SiteUniqueCount = new Array();
                                                var siteImpressions = new Array();
                                                var siteClicks = new Array();
                                                var siteComplete = new Array();

                                                for (var kn = 0; kn < sites.length; kn++) {
                                                    key = formatSearch[kn];
                                                    impressionsSite = parseInt(dataObject[key].impressions);
                                                    clicksSite = parseInt(dataObject[key].clicks);
                                                    completeSite = parseInt(dataObject[key].complete);
                                                    var nameSite = sites[kn];

                                                    // Rentre les impressions
                                                    if (siteUnique[nameSite]) {
                                                        siteUnique[nameSite].splice(siteImpressions[nameSite].length, 1, key);
                                                    } else {
                                                        siteUnique[nameSite] = new Array();
                                                        siteUnique[nameSite][0] = key;
                                                        SiteUniqueCount.push(nameSite);
                                                    }

                                                    // Rentre les impressions
                                                    if (siteImpressions[nameSite]) {
                                                        siteImpressions[nameSite].splice(
                                                            siteImpressions[nameSite].length,
                                                            1,
                                                            impressionsSite
                                                        );
                                                    } else {
                                                        siteImpressions[nameSite] = new Array();
                                                        siteImpressions[nameSite][0] = impressionsSite;
                                                    }

                                                    // Rentre les Clicks
                                                    if (siteClicks[nameSite]) {
                                                        siteClicks[nameSite].splice(siteClicks[nameSite].length, 1, clicksSite);
                                                    } else {
                                                        siteClicks[nameSite] = new Array();
                                                        siteClicks[nameSite][0] = clicksSite;
                                                    }

                                                    // Rentre les Complete
                                                    if (siteComplete[nameSite]) {
                                                        siteComplete[nameSite].splice(siteComplete[nameSite].length, 1, completeSite);
                                                    } else {
                                                        siteComplete[nameSite] = new Array();
                                                        siteComplete[nameSite][0] = completeSite;
                                                    }
                                                }

                                                // Trie les données de sites
                                                if (siteUnique && (SiteUniqueCount.length > 0)) {
                                                    siteList = new Object();
                                                    for (var ln = 0; ln < SiteUniqueCount.length; ln++) {
                                                        sN = SiteUniqueCount[ln];
                                                        siteImpressionsSUM = siteImpressions[sN].reduce(reducer);
                                                        siteClicksSUM = siteClicks[sN].reduce(reducer);
                                                        siteCompleteSUM = siteComplete[sN].reduce(reducer);
                                                        siteCtrSUM = parseFloat((siteClicksSUM / siteImpressionsSUM) * 100).toFixed(2);
                                                        siteCtrComplete = parseFloat((siteCompleteSUM / siteImpressionsSUM) * 100).toFixed(2);

                                                        var itemSite = {
                                                            site: sN,
                                                            impressions: siteImpressionsSUM,
                                                            clicks: siteClicksSUM,
                                                            ctr: siteCtrSUM,
                                                            complete: siteCompleteSUM,
                                                            ctrComplete: siteCtrComplete
                                                        };
                                                        siteList[ln] = itemSite;
                                                    }

                                                }
                                            }

                                            // Fais le calcul
                                            impressionsSUM = impressions.reduce(reducer);
                                            clicksSUM = clicks.reduce(reducer);
                                            ctrSUM = eval((clicksSUM / impressionsSUM) * 100).toFixed(2);
                                            completeSUM = complete.reduce(reducer);
                                            ctrComplete = eval((completeSUM / impressionsSUM) * 100).toFixed(2);

                                            resultDateReport = {
                                                formatKey: formatSearch,
                                                // insertions : insertions, sites_rename : sites_rename, sites : sites,
                                                // siteUniqueCount : SiteUniqueCount, siteUnique : siteUnique, siteImpressions :
                                                // siteImpressions, siteClicks : siteClicks, siteComplete : siteComplete,
                                                siteList: siteList,
                                                // impressions : impressions,
                                                impressions: impressions.reduce(reducer),
                                                // clicks : clicks,
                                                clicks: clicks.reduce(reducer),
                                                ctr: ctrSUM,
                                                // complete : complete,
                                                complete: completeSUM,
                                                ctrComplete: ctrComplete
                                            };

                                            return resultDateReport;
                                        }

                                        // Trie les formats et compatibilise les insertions et autres clics
                                        if (!Utilities.empty(formatHabillage)) {
                                            formatObjects.habillage = sortDataReport(formatHabillage, dataList);
                                        }
                                        if (!Utilities.empty(formatInterstitiel)) {
                                            formatObjects.interstitiel = sortDataReport(formatInterstitiel, dataList);
                                        }
                                        if (!Utilities.empty(formatMasthead)) {
                                            formatObjects.masthead = sortDataReport(formatMasthead, dataList);
                                        }
                                        if (!Utilities.empty(formatGrandAngle)) {
                                            formatObjects.grandangle = sortDataReport(formatGrandAngle, dataList);
                                        }
                                        if (!Utilities.empty(formatInstream)) {
                                            formatObjects.instream = sortDataReport(formatInstream, dataList);
                                        }
                                        if (!Utilities.empty(formatRectangleVideo)) {
                                            formatObjects.rectanglevideo = sortDataReport(formatRectangleVideo, dataList);
                                        }
                                        if (!Utilities.empty(formatLogo)) {
                                            formatObjects.logo = sortDataReport(formatLogo, dataList);
                                        }
                                        if (!Utilities.empty(formatNative)) {
                                            formatObjects.native = sortDataReport(formatNative, dataList);
                                        }
                                        if (!Utilities.empty(formatSlider)) {
                                            formatObjects.slider = sortDataReport(formatSlider, dataList);
                                        }
                                        if (!Utilities.empty(formatMea)) {
                                            formatObjects.mea = sortDataReport(formatMea, dataList);
                                        }
                                        if (!Utilities.empty(formatSliderVideo)) {
                                            formatObjects.slidervideo = sortDataReport(formatSliderVideo, dataList);
                                        }
                                    }

                                    // Ajoute les infos de la campagne
                                    if (Impressions.length > 0) {
                                        campaignImpressions = Impressions.reduce(reducer);
                                    } else {
                                        campaignImpressions = null;
                                    }
                                    if (Clicks.length > 0) {
                                        campaignClicks = Clicks.reduce(reducer);
                                    } else {
                                        campaignClicks = null;
                                    }
                                    if (!Utilities.empty(campaignClicks) && !Utilities.empty(campaignImpressions)) {
                                        campaignCtr = parseFloat((campaignClicks / campaignImpressions) * 100).toFixed(2);
                                    } else {
                                        campaignCtr = null;
                                    }
                                    if (Complete.length > 0) {
                                        campaignComplete = Complete.reduce(reducer);
                                    } else {
                                        campaignComplete = null;
                                    }
                                    if (!Utilities.empty(campaignComplete) && !Utilities.empty(campaignImpressions)) {
                                        campaignCtrComplete = parseFloat((campaignComplete / campaignImpressions) * 100).toFixed(2);
                                    } else {
                                        campaignCtrComplete = null;
                                    }
                                    console.log('Campaign :', formatObjects.campaign);
                                    formatObjects.campaign = {
                                        campaign_id: campaign.campaign_id,
                                        campaign_name: campaign.campaign_name,
                                        campaign_start_date: campaign.campaign_start_date,
                                        campaign_end_date: campaign.campaign_end_date,
                                        campaigncrypt: campaign.campaigncrypt,
                                        advertiser_id: campaign.advertiser.advertiser_id,
                                        advertiser_name: campaign.advertiser.advertiser_name,
                                        impressions: campaignImpressions,
                                        clicks: campaignClicks,
                                        ctr: campaignCtr,
                                        complete: campaignComplete,
                                        ctrComplete: campaignCtrComplete
                                    }
                                    console.log('formatObjects :', formatObjects.campaign);
                                    // Récupére les infos des VU
                                    const objDefaultVU = JSON.parse(dataLSTaskGlobalVU);
                                    console.log(objDefaultVU)
                                    var dataSplitGlobalVU = objDefaultVU.datafile;

                                    var dataSplitGlobalVU = dataSplitGlobalVU.split(/\r?\n/);
                                    if (dataSplitGlobalVU) {
                                        var numberLine = dataSplitGlobalVU.length;
                                        for (i = 1; i < numberLine; i++) {
                                            // split push les données dans chaque colone
                                            line = dataSplitGlobalVU[i].split(';');
                                            if (!Utilities.empty(line[0])) {
                                                unique_visitor = parseInt(line[0]);
                                                if (diff_start_end_day >= 31) {
                                                    formatObjects.campaign.vu = parseInt(0)
                                                } else {
                                                    formatObjects.campaign.vu = parseInt(unique_visitor);

                                                }
                                                repetition = parseFloat((campaignImpressions / parseInt(unique_visitor))).toFixed(2);
                                                formatObjects.campaign.repetition = repetition;
                                            }
                                        }
                                    }

                                    formatObjects.reporting_start_date = moment().format('YYYY-MM-DD HH:m:s');
                                    formatObjects.reporting_end_date = moment().add(2, 'hours').format('YYYY-MM-DD HH:m:s');

                                    localStorage.setItem('campaignID-' + campaignid, JSON.stringify(formatObjects));
                                    res.redirect('/rs/${campaigncrypt}');
                                }

                            }, time);
                        }

                    }

                } catch (error) {
                    console.log(error);
                    var statusCoded = error.response;

                    res.render("error.ejs", {
                        statusCoded: statusCoded,
                        campaigncrypt: campaigncrypt
                    });
                }

                // Affiche le json campaign
                // res.json(formatObjects);
            });


    } catch (error) {
        console.log(error)
        var statusCoded = error.response;
        res.render("error.ejs", {
            statusCoded: statusCoded,
            campaigncrypt: campaigncrypt
        })
    }

}


exports.export_excel = async (req, res) => {

    var campaigncrypt = req.params.campaigncrypt;

    try {

        await ModelCampaigns
            .findOne({
                attributes: [
                    'campaign_id',
                    'campaign_name',
                    'campaign_crypt',
                    'advertiser_id',
                    'campaign_start_date',
                    'campaign_end_date'
                ],

                where: {
                    // campaign_id: req.params.campaignid, advertiser_id: req.params.advertiserid

                    campaign_crypt: campaigncrypt

                },
                include: [{
                    model: ModelAdvertisers
                }]
            })
            .then(async function (campaign) {
                if (!campaign)
                    return res
                        .status(404)
                        .render("error.ejs", {

                            statusCoded: 404,
                            campaigncrypt: campaigncrypt
                        });

                let campaignid = campaign.campaign_id;

                // crée label avec le date du jour ex : 20210403
                const date = new Date();
                const JJ = ('0' + (
                    date.getDate()
                )).slice(-2);

                const MM = ('0' + (
                    date.getMonth()
                )).slice(-2);
                const AAAA = date.getFullYear();

                const label_now = AAAA + MM + JJ;

                //recherche dans le local storage id qui correspond à la campagne

                var data_localStorage = localStorage.getItem('campaignID-' + campaignid);

                var data_report_view = JSON.parse(data_localStorage);

                var dts_table = data_report_view.table;

                var campaign_name = dts_table.Campagne_name;
                var date_now = dts_table.Date_rapport;
                var StartDate = dts_table.StartDate;
                var EndDate = dts_table.EndDate;

                var table = data_report_view.table;
                var data_interstitiel = data_report_view.data_interstitiel;
                var data_habillage = data_report_view.data_habillage;
                var data_masthead = data_report_view.data_masthead;
                var data_grand_angle = data_report_view.data_grand_angle;
                var data_native = data_report_view.data_native;
                var data_video = data_report_view.data_video;

                // You can define styles as json object
                const styles = {
                    headerDark: {
                        fill: {
                            fgColor: {
                                rgb: 'FF000000'
                            }
                        },
                        font: {
                            color: {
                                rgb: 'FFFFFFFF'
                            },
                            sz: 14,
                            bold: false,
                            underline: false
                        }
                    },
                    cellTotal: {

                        font: {
                            color: {
                                rgb: 'FF000000'
                            },
                            bold: true,
                            underline: false
                        }

                    },

                    cellNone: {
                        font: {
                            color: {
                                rgb: 'FF000000'
                            }
                        }
                    }
                };

                //

                //Array of objects representing heading rows (very top)
                const heading = [
                    [{
                            value: 'Rapport : ' + campaign_name,
                            style: styles.headerDark
                        }

                    ],

                    ['Date de génération : ' + date_now],
                    ['Période diffusion : Du ' + StartDate + ' au ' + EndDate],
                    ['                ']
                ];

                //Here you specify the export structure
                const bilan_global = {

                    impressions: { // <- the key should match the actual data key
                        displayName: 'Impressions', // <- Here you specify the column header
                        headerStyle: styles.headerDark, // <- Header style
                        width: 400 // <- width in pixels
                    },
                    clics: {
                        displayName: 'Clics',
                        headerStyle: styles.headerDark,
                        width: 220 // <- width in chars (when the number is passed as string)
                    },
                    ctr_clics: {
                        displayName: 'Taux de clics',
                        headerStyle: styles.headerDark,
                        width: 220 // <- width in pixels
                    },
                    vu: {
                        displayName: 'Visiteurs Uniques',
                        headerStyle: styles.headerDark,
                        width: 220 // <- width in pixels
                    },
                    repetions: {
                        displayName: 'Répétition',
                        headerStyle: styles.headerDark,
                        width: 220 // <- width in pixels
                    }

                };

                const bilan_formats = {

                    Formats: { // <- the key should match the actual data key
                        displayName: 'Format', // <- Here you specify the column header
                        headerStyle: styles.headerDark, // <- Header style
                        cellStyle: function (value, row) { // <- style renderer function
                            // if the status is 1 then color in green else color in red Notice how we use
                            // another cell value to style the current one

                            return (value === "TOTAL") ?
                                styles.cellTotal :
                                styles.cellNone // <- Inline cell style is possible
                        },
                        width: 220 // <- width in pixels
                    },
                    Impressions: {
                        displayName: 'Impressions',
                        headerStyle: styles.headerDark,
                        width: 120 // <- width in chars (when the number is passed as string)
                    },
                    Clics: {
                        displayName: 'Clics',
                        headerStyle: styles.headerDark,
                        width: 120 // <- width in chars (when the number is passed as string)
                    },
                    Ctr_clics: {
                        displayName: 'Taux de clics',
                        headerStyle: styles.headerDark,
                        width: 120 // <- width in pixels
                    }
                };

                const bilan_sites = {
                    formats: { // <- the key should match the actual data key
                        displayName: 'Formats', // <- Here you specify the column header
                        headerStyle: styles.headerDark, // <- Header style
                        width: 220 // <- width in pixels
                    },
                    sites: { // <- the key should match the actual data key
                        displayName: 'Sites', // <- Here you specify the column header
                        headerStyle: styles.headerDark, // <- Header style
                        width: 220 // <- width in pixels
                    },

                    impressions: {
                        displayName: 'Impressions',
                        headerStyle: styles.headerDark,
                        width: 120 // <- width in chars (when the number is passed as string)
                    },
                    clics: {
                        displayName: 'Clics',
                        headerStyle: styles.headerDark,
                        width: 120 // <- width in chars (when the number is passed as string)
                    },
                    ctr_clics: {
                        displayName: 'Taux de clics',
                        headerStyle: styles.headerDark,
                        width: 120 // <- width in pixels
                    },
                    vtr: {
                        displayName: 'VTR',
                        headerStyle: styles.headerDark,
                        width: 220 // <- width in pixels
                    }

                };

                // The data set should have the following shape (Array of Objects) The order of
                // the keys is irrelevant, it is also irrelevant if the dataset contains more
                // fields as the report is build based on the specification provided above. But
                // you should have all the fields that are listed in the report specification
                const dataset_global = [{
                    impressions: table.total_impression_format,
                    clics: table.total_click_format,
                    ctr_clics: table.CTR,
                    vu: table.Total_VU,
                    repetions: table.Repetition

                }];
                const dataset_format = []

                if (table.sommeInterstitielImpression !== '0') {
                    dataset_format[0] = {
                        Formats: 'INTERSTITIEL',
                        Impressions: table.sommeInterstitielImpression,
                        Clics: table.sommeInterstitielClicks,
                        Ctr_clics: table.CTR_interstitiel
                    }
                }

                if (table.sommeHabillageImpression !== '0') {
                    dataset_format[1] = {

                        Formats: 'HABILLAGE',
                        Impressions: table.sommeHabillageImpression,
                        Clics: table.sommeHabillageClicks,
                        Ctr_clics: table.CTR_habillage
                    }
                }
                if (table.sommeMastheadImpression !== '0') {
                    dataset_format[2] = {

                        Formats: 'MASTHEAD',
                        Impressions: table.sommeMastheadImpression,
                        Clics: table.sommeMastheadClicks,
                        Ctr_clics: table.CTR_masthead
                    }
                }

                if (table.sommeGrand_AngleImpression !== '0') {
                    dataset_format[3] = {

                        Formats: 'GRAND ANGLE',
                        Impressions: table.sommeGrand_AngleImpression,
                        Clics: table.sommeGrand_AngleClicks,
                        Ctr_clics: table.CTR_grand_angle

                    }
                }

                if (table.sommeNativeImpression !== '0') {
                    dataset_format[4] = {
                        Formats: 'NATIVE',
                        Impressions: table.sommeNativeImpression,
                        Clics: table.sommeNativeClicks,
                        Ctr_clics: table.CTR_native

                    }
                }
                if (table.sommeVideoImpression !== '0') {
                    dataset_format[5] = {
                        Formats: 'VIDEO',
                        Impressions: table.sommeVideoImpression,
                        Clics: table.sommeVideoClicks,
                        Ctr_clics: table.CTR_video
                    }
                }
                dataset_format[6] = {
                    Formats: 'TOTAL',
                    Impressions: table.total_impression_format,
                    Clics: table.total_click_format,
                    Ctr_clics: table.CTR
                }

                const dataset_site = []

                if (data_interstitiel.interstitielImpressions.length > 0) {

                    if (data_interstitiel.total_impressions_linfoInterstitiel !== "0") {

                        dataset_site[0] = {

                            formats: 'INTERSTITIEL',
                            sites: data_interstitiel.interstitiel_linfo_siteName,
                            impressions: data_interstitiel.total_impressions_linfoInterstitiel,
                            clics: data_interstitiel.total_clicks_linfoInterstitiel,
                            ctr_clics: data_interstitiel.interstitiel_linfo_ctr,
                            vtr: '-'
                        }

                    }
                    if (data_interstitiel.total_impressions_linfo_androidInterstitiel !== "0") {
                        dataset_site[1] = {
                            formats: 'INTERSTITIEL',
                            sites: data_interstitiel.interstitiel_linfo_android_siteName,
                            impressions: data_interstitiel.total_impressions_linfo_androidInterstitiel,
                            clics: data_interstitiel.total_clicks_linfo_androidInterstitiel,
                            ctr_clics: data_interstitiel.interstitiel_linfo_android_ctr,
                            vtr: '-'
                        }
                    }
                    if (data_interstitiel.total_impressions_linfo_iosInterstitiel !== "0") {
                        dataset_site[2] = {
                            formats: 'INTERSTITIEL',
                            sites: data_interstitiel.interstitiel_linfo_ios_siteName,
                            impressions: data_interstitiel.total_impressions_linfo_iosInterstitiel,
                            clics: data_interstitiel.total_clicks_linfo_iosInterstitiel,
                            ctr_clics: data_interstitiel.interstitiel_linfo_ios_ctr,
                            vtr: '-'
                        }
                    }

                    if (data_interstitiel.total_impressions_dtjInterstitiel !== "0") {

                        dataset_site[3] = {
                            formats: 'INTERSTITIEL',
                            sites: data_interstitiel.interstitiel_dtj_siteName,
                            impressions: data_interstitiel.total_impressions_dtjInterstitiel,
                            clics: data_interstitiel.total_clicks_dtjInterstitiel,
                            ctr_clics: data_interstitiel.interstitiel_dtj_ctr,
                            vtr: '-'
                        }

                    }
                    if (data_interstitiel.total_impressions_antenneInterstitiel !== "0") {

                        dataset_site[4] = {
                            formats: 'INTERSTITIEL',
                            sites: data_interstitiel.interstitiel_antenne_siteName,
                            impressions: data_interstitiel.total_impressions_antenneInterstitiel,
                            clics: data_interstitiel.total_clicks_antenneInterstitiel,
                            ctr_clics: data_interstitiel.interstitiel_antenne_ctr,
                            vtr: '-'
                        }

                    }

                }

                if (data_habillage.habillageImpressions.length > 0) {

                    if (data_habillage.total_impressions_linfoHabillage !== "0") {

                        dataset_site[5] = {

                            formats: 'HABILLAGE',
                            sites: data_habillage.habillage_linfo_siteName,
                            impressions: data_habillage.total_impressions_linfoHabillage,
                            clics: data_habillage.total_clicks_linfoHabillage,
                            ctr_clics: data_habillage.habillage_linfo_ctr,
                            vtr: '-'
                        }

                    }
                    if (data_habillage.total_impressions_linfo_androidHabillage !== "0") {
                        dataset_site[6] = {
                            formats: 'HABILLAGE',
                            sites: data_habillage.habillage_linfo_android_siteName,
                            impressions: data_habillage.total_impressions_linfo_androidHabillage,
                            clics: data_habillage.total_clicks_linfo_androidHabillage,
                            ctr_clics: data_habillage.habillage_linfo_android_ctr,
                            vtr: '-'
                        }
                    }
                    if (data_habillage.total_impressions_linfo_iosHabillage !== "0") {
                        dataset_site[7] = {
                            formats: 'HABILLAGE',
                            sites: data_habillage.habillage_linfo_ios_siteName,
                            impressions: data_habillage.total_impressions_linfo_iosHabillage,
                            clics: data_habillage.total_clicks_linfo_iosHabillage,
                            ctr_clics: data_habillage.habillage_linfo_ios_ctr,
                            vtr: '-'
                        }
                    }

                    if (data_habillage.total_impressions_dtjHabillage !== "0") {

                        dataset_site[8] = {
                            formats: 'HABILLAGE',
                            sites: data_habillage.habillage_dtj_siteName,
                            impressions: data_habillage.total_impressions_dtjHabillage,
                            clics: data_habillage.total_clicks_dtjHabillage,
                            ctr_clics: data_habillage.habillage_dtj_ctr,
                            vtr: '-'
                        }

                    }
                    if (data_habillage.total_impressions_antenneHabillage !== "0") {

                        dataset_site[9] = {
                            formats: 'HABILLAGE',
                            sites: data_habillage.habillage_antenne_siteName,
                            impressions: data_habillage.total_impressions_antenneHabillage,
                            clics: data_habillage.total_clicks_antenneHabillage,
                            ctr_clics: data_habillage.habillage_antenne_ctr,
                            vtr: '-'
                        }

                    }

                }

                if (data_masthead.mastheadImpressions.length > 0) {

                    if (data_masthead.total_impressions_linfoMasthead !== "0") {

                        dataset_site[10] = {

                            formats: 'MASTHEAD',
                            sites: data_masthead.masthead_linfo_siteName,
                            impressions: data_masthead.total_impressions_linfoMasthead,
                            clics: data_masthead.total_clicks_linfoMasthead,
                            ctr_clics: data_masthead.masthead_linfo_ctr,
                            vtr: '-'
                        }

                    }
                    if (data_masthead.total_impressions_linfo_androidMasthead !== "0") {
                        dataset_site[11] = {
                            formats: 'MASTHEAD',
                            sites: data_masthead.masthead_linfo_android_siteName,
                            impressions: data_masthead.total_impressions_linfo_androidMasthead,
                            clics: data_masthead.total_clicks_linfo_androidMasthead,
                            ctr_clics: data_masthead.masthead_linfo_android_ctr,
                            vtr: '-'
                        }
                    }
                    if (data_masthead.total_impressions_linfo_iosMasthead !== "0") {
                        dataset_site[12] = {
                            formats: 'MASTHEAD',
                            sites: data_masthead.masthead_linfo_ios_siteName,
                            impressions: data_masthead.total_impressions_linfo_iosMasthead,
                            clics: data_masthead.total_clicks_linfo_iosMasthead,
                            ctr_clics: data_masthead.masthead_linfo_ios_ctr,
                            vtr: '-'
                        }
                    }

                    if (data_masthead.total_impressions_dtjMasthead !== "0") {

                        dataset_site[13] = {
                            formats: 'MASTHEAD',
                            sites: data_masthead.masthead_dtj_siteName,
                            impressions: data_masthead.total_impressions_dtjMasthead,
                            clics: data_masthead.total_clicks_dtjMasthead,
                            ctr_clics: data_masthead.masthead_dtj_ctr,
                            vtr: '-'
                        }

                    }
                    if (data_masthead.total_impressions_antenneMasthead !== "0") {

                        dataset_site[14] = {
                            formats: 'MASTHEAD',
                            sites: data_masthead.masthead_antenne_siteName,
                            impressions: data_masthead.total_impressions_antenneMasthead,
                            clics: data_masthead.total_clicks_antenneMasthead,
                            ctr_clics: data_masthead.masthead_antenne_ctr,
                            vtr: '-'
                        }

                    }

                }

                if (data_grand_angle.grand_angleImpressions.length > 0) {

                    if (data_grand_angle.total_impressions_linfoGrandAngle !== "0") {

                        dataset_site[15] = {

                            formats: 'GRAND ANGLE',
                            sites: data_grand_angle.grand_angle_linfo_siteName,
                            impressions: data_grand_angle.total_impressions_linfoGrandAngle,
                            clics: data_grand_angle.total_clicks_linfoGrandAngle,
                            ctr_clics: data_grand_angle.grand_angle_linfo_ctr,
                            vtr: '-'
                        }

                    }
                    if (data_grand_angle.total_impressions_linfo_androidGrandAngle !== "0") {
                        dataset_site[12] = {
                            formats: 'GRAND ANGLE',
                            sites: data_grand_angle.grand_angle_linfo_android_siteName,
                            impressions: data_grand_angle.total_impressions_linfo_androidGrandAngle,
                            clics: data_grand_angle.total_clicks_linfo_androidGrandAngle,
                            ctr_clics: data_grand_angle.grand_angle_linfo_android_ctr,
                            vtr: '-'
                        }
                    }
                    if (data_grand_angle.total_impressions_linfo_iosGrandAngle !== "0") {
                        dataset_site[16] = {
                            formats: 'GRAND ANGLE',
                            sites: data_grand_angle.grand_angle_linfo_ios_siteName,
                            impressions: data_grand_angle.total_impressions_linfo_iosGrandAngle,
                            clics: data_grand_angle.total_clicks_linfo_iosGrandAngle,
                            ctr_clics: data_grand_angle.grand_angle_linfo_ios_ctr,
                            vtr: '-'
                        }
                    }

                    if (data_grand_angle.total_impressions_dtjGrandAngle !== "0") {

                        dataset_site[17] = {
                            formats: 'GRAND ANGLE',
                            sites: data_grand_angle.grand_angle_dtj_siteName,
                            impressions: data_grand_angle.total_impressions_dtjGrandAngle,
                            clics: data_grand_angle.total_clicks_dtjGrandAngle,
                            ctr_clics: data_grand_angle.grand_angle_dtj_ctr,
                            vtr: '-'
                        }

                    }
                    if (data_grand_angle.total_impressions_antenneGrandAngle !== "0") {

                        dataset_site[18] = {
                            formats: 'GRAND ANGLE',
                            sites: data_grand_angle.grand_angle_antenne_siteName,
                            impressions: data_grand_angle.total_impressions_antenneGrandAngle,
                            clics: data_grand_angle.total_clicks_antenneGrandAngle,
                            ctr_clics: data_grand_angle.grand_angle_antenne_ctr,
                            vtr: '-'
                        }

                    }

                }

                if (data_video.videoImpressions.length > 0) {

                    if (data_video.total_impressions_linfoVideo !== "0") {

                        dataset_site[19] = {

                            formats: 'VIDEO',
                            sites: data_video.video_linfo_siteName,
                            impressions: data_video.total_impressions_linfoVideo,
                            clics: data_video.total_clicks_linfoVideo,
                            ctr_clics: data_video.video_linfo_ctr,
                            vtr: data_video.VTR_linfo
                        }

                    }
                    if (data_video.total_impressions_linfo_androidVideo !== "0") {
                        dataset_site[20] = {
                            formats: 'VIDEO',
                            sites: data_video.video_linfo_android_siteName,
                            impressions: data_video.total_impressions_linfo_androidVideo,
                            clics: data_video.total_clicks_linfo_androidVideo,
                            ctr_clics: data_video.video_linfo_android_ctr,
                            vtr: data_video.VTR_linfo_android
                        }
                    }
                    if (data_video.total_impressions_linfo_iosVideo !== "0") {
                        dataset_site[21] = {
                            formats: 'VIDEO',
                            sites: data_video.video_linfo_ios_siteName,
                            impressions: data_video.total_impressions_linfo_iosVideo,
                            clics: data_video.total_clicks_linfo_iosVideo,
                            ctr_clics: data_video.video_linfo_ios_ctr,
                            vtr: data_video.VTR_linfo_ios
                        }
                    }

                    if (data_video.total_impressions_dtjVideo !== "0") {

                        dataset_site[22] = {
                            formats: 'VIDEO',
                            sites: data_video.video_antenne_siteName,
                            impressions: data_video.total_impressions_antenneVideo,
                            clics: data_video.total_clicks_antenneVideo,
                            ctr_clics: data_video.video_antenne_ctr,
                            vtr: data_video.VTR_antenne
                        }

                    }
                    if (data_video.total_impressions_antenneVideo !== "0") {

                        dataset_site[23] = {
                            formats: 'VIDEO',
                            sites: data_video.video_antenne_siteName,
                            impressions: data_video.total_impressions_antenneVideo,
                            clics: data_video.total_clicks_antenneVideo,
                            ctr_clics: data_video.video_antenne_ctr,
                            vtr: data_video.VTR_antenne
                        }

                    }

                    if (data_video.total_impressions_tf1Video !== "0") {

                        dataset_site[24] = {
                            formats: 'VIDEO',
                            sites: data_video.video_tf1_siteName,
                            impressions: data_video.total_impressions_tf1Video,
                            clics: data_video.total_clicks_tf1Video,
                            ctr_clics: data_video.video_tf1_ctr,
                            vtr: data_video.VTR_tf1
                        }
                    }

                    if (data_video.total_impressions_m6Video !== "0") {

                        dataset_site[25] = {
                            formats: 'VIDEO',
                            sites: data_video.video_m6_siteName,
                            impressions: data_video.total_impressions_m6Video,
                            clics: data_video.total_clicks_m6Video,
                            ctr_clics: data_video.video_m6_ctr,
                            vtr: data_video.VTR_m6
                        }
                    }

                    if (data_video.total_impressions_dailymotionVideo !== "0") {

                        dataset_site[26] = {
                            formats: 'VIDEO',
                            sites: data_video.video_dailymotion_siteName,
                            impressions: data_video.total_impressions_dailymotionVideo,
                            clics: data_video.total_clicks_dailymotionVideo,
                            ctr_clics: data_video.video_dailymotion_ctr,
                            vtr: data_video.VTR_dailymotion
                        }
                    }

                }

                if (data_native.nativeImpressions.length > 0) {

                    if (data_native.total_impressions_linfoNative !== "0") {

                        dataset_site[27] = {

                            formats: 'NATIVE',
                            sites: data_native.native_linfo_siteName,
                            impressions: data_native.total_impressions_linfoNative,
                            clics: data_native.total_clicks_linfoNative,
                            ctr_clics: data_native.native_linfo_ctr,
                            vtr: '-'
                        }

                    }
                    if (data_native.total_impressions_linfo_androidNative !== "0") {
                        dataset_site[28] = {
                            formats: 'NATIVE',
                            sites: data_native.native_linfo_android_siteName,
                            impressions: data_native.total_impressions_linfo_androidNative,
                            clics: data_native.total_clicks_linfo_androidNative,
                            ctr_clics: data_native.native_linfo_android_ctr,
                            vtr: '-'
                        }
                    }
                    if (data_native.total_impressions_linfo_iosNative !== "0") {
                        dataset_site[29] = {
                            formats: 'NATIVE',
                            sites: data_native.native_linfo_ios_siteName,
                            impressions: data_native.total_impressions_linfo_iosNative,
                            clics: data_native.total_clicks_linfo_iosNative,
                            ctr_clics: data_native.native_linfo_ios_ctr,
                            vtr: '-'
                        }
                    }

                    if (data_native.total_impressions_dtjNative !== "0") {

                        dataset_site[30] = {
                            formats: 'NATIVE',
                            sites: data_native.native_dtj_siteName,
                            impressions: data_native.total_impressions_dtjNative,
                            clics: data_native.total_clicks_dtjNative,
                            ctr_clics: data_native.native_dtj_ctr,
                            vtr: '-'
                        }

                    }
                    if (data_native.total_impressions_antenneNative !== "0") {

                        dataset_site[31] = {
                            formats: 'NATIVE',
                            sites: data_native.native_antenne_siteName,
                            impressions: data_native.total_impressions_antenneNative,
                            clics: data_native.total_clicks_antenneNative,
                            ctr_clics: data_native.native_antenne_ctr,
                            vtr: '-'
                        }

                    }

                }
                // Define an array of merges. 1-1 = A:1 The merges are independent of the data.
                // A merge will overwrite all data _not_ in the top-left cell.
                const merges = [{
                    start: {
                        row: 1,
                        column: 1
                    },
                    end: {
                        row: 1,
                        column: 5
                    }
                }];

                // Create the excel report. This function will return Buffer
                const report = excel.buildExport([{ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                    name: 'Bilan', // <- Specify sheet name (optional)
                    heading: heading, // <- Raw heading array (optional)
                    merges: merges, // <- Merge cell ranges
                    specification: bilan_global, // <- Report specification
                    data: dataset_global // <-- Report data
                }, {
                    name: 'Formats',
                    // heading : headingformats,
                    specification: bilan_formats,
                    data: dataset_format
                }, {
                    name: 'Sites',
                    // heading : headingsites,
                    specification: bilan_sites, // <- Report specification
                    data: dataset_site // <-- Report data
                }]);

                // You can then return this straight
                // rapport_antennesb-202105031152-ESPACE_DECO-67590.xls
                res.attachment(
                    'rapport_antennesb-' + label_now + '-' + campaign_name + '.xlsx'
                ); // This is sails.js specific (in general you need to set headers)

                return res.send(report);

                // OR you can save this buffer to the disk by creating a file.

            });

    } catch (error) {
        console.log(error)

    }

};

exports.automatisation = async (req, res) => {

    let campaignid = req.params.campaignid;

    try {

        var data_localStorage = localStorage.getItem('campaignID-' + campaignid);

        res.json(data_localStorage);

    } catch (error) {
        console.log(error)
        var statusCoded = error.response;

        res.render("error.ejs", {
            statusCoded: statusCoded,
            advertiserid: advertiserid,
            campaignid: campaignid,
            startDate: startDate,
            startDate: startDate
        })

    }
}