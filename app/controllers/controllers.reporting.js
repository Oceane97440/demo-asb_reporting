// Initialise le module
const excel = require('node-excel-export');

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
const SmartFunction = require("../functions/functions.smartadserver.api");
const Utilities = require('../functions/functions.utilities');

// Initialise les models
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelFormats = require("../models/models.formats");
const ModelSites = require("../models/models.sites");

var LocalStorage = require('node-localstorage').LocalStorage;
// localStorage = new LocalStorage('data/reporting/' + moment().format('YYYY/MM/DD'));
// localStorageTasks = new LocalStorage('data/taskID/' + moment().format('YYYY/MM/DD/H'));
localStorage = new LocalStorage('data/reporting/');
localStorageTasks = new LocalStorage('data/taskID/');


exports.index = async (req, res) => {
    if (req.session.user.user_role == 1) {
        res.render("reporting/dasbord_report.ejs");
    }
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

            var start_date = new Date(campaign.campaign_start_date);
            var end_date = new Date(campaign.campaign_end_date);
            var diff = Utilities.nbr_jours(start_date, end_date);

            const nombre_diff_day = diff.day

            var campaign_id = campaign.campaign_id;

            // Gestion du cache
            let cacheStorageID = 'campaignID-' + campaign_id;
            // Affiche le dernier rapport existant
            var reportingDataStorage = localStorage.getItem(
                cacheStorageID
            );
            var reportingData = JSON.parse(reportingDataStorage);

            console.log(reportingData);
            if (reportingDataStorage && (reportingData.reporting_end_date < date_now)) {


                res.render('report/template.ejs', {
                    reporting: reportingData,
                    moment: moment,
                    utilities: Utilities,
                    timestamp_startdate: timestamp_startdate,
                    date_now: Date.now(),
                    moment: moment,
                    nombre_diff_day: nombre_diff_day
                });
            } else {

                localStorageTasks.removeItem(
                    cacheStorageID + '-taskGlobal'
                );
                localStorageTasks.removeItem(
                    cacheStorageID + '-taskGlobalVU'
                );

                res.render("report/generate.ejs", {
                    advertiser_id: campaign.advertiser_id,
                    campaign_id: campaign_id,
                    campaign_crypt: campaign.campaign_crypt,
                    campaign: campaign,
                    timestamp_startdate: timestamp_startdate,
                    date_now: date_now,
                    moment: moment,
                    nombre_diff_day: nombre_diff_day
                });
            }


        });
}

exports.report = async (req, res) => {
    let campaigncrypt = req.params.campaigncrypt;

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
                let campaign_crypt = campaign.campaign_crypt
                let advertiser_id = campaign.advertiser_id;
                let campaign_id = campaign.campaign_id;
                var campaign_start_date = campaign.campaign_start_date;
                var campaign_end_date = campaign.campaign_end_date;

                // Gestion du cache
                let cacheStorageID = 'campaignID-' + campaign_id;
                // Initialise la date
                let date = new Date();
                let cacheStorageIDHour = moment().format('YYYYMMDD');

                try {
                    var data_localStorage = localStorage.getItem(cacheStorageID);
                    // Si le localStorage existe -> affiche la data du localstorage
                    if (data_localStorage) {
                        // Si le localStorage exsite -> affiche la data du localstorage Convertie la
                        // date JSON en objet
                        var reportingData = JSON.parse(data_localStorage);

                        var reporting_requete_date = moment().format('YYYY-MM-DD HH:mm:ss');
                        var reporting_start_date = reportingData.reporting_start_date;
                        var reporting_end_date = reportingData.reporting_end_date;

                        var campaign_end_date = reportingData.campaign.campaign_end_date;
                        var campaign_start_date = reportingData.campaign.campaign_start_date;

                        // si la date d'expiration est < au moment de la requête on garde la cache
                        if ((reporting_requete_date < reporting_end_date) || (campaign_end_date > reporting_start_date)) {

                            if (reporting_requete_date > reporting_end_date) {
                                localStorage.removeItem(cacheStorageID);
                                console.log('Supprime le localStorage de la task general')
                                // Supprime les tasks IDs
                                localStorageTasks.removeItem(
                                    cacheStorageID + '-taskGlobal'
                                );
                                localStorageTasks.removeItem(
                                    cacheStorageID + '-taskGlobalVU'
                                );
                                res.redirect('/r/' + campaign_crypt);
                            }

                            if (reporting_requete_date < reporting_end_date) {
                                res.render('report/template.ejs', {
                                    reporting: reportingData,
                                    moment: moment,
                                    utilities: Utilities
                                });
                            }

                        } else {
                            // génération de rapport si aucune de ses conditions n'est correct
                            // - La campagne n'est pas terminée
                            if (reporting_requete_date < campaign_end_date) {
                                // si le local storage expire; on supprime les precedents cache et les taskid
                                localStorage.removeItem(cacheStorageID);
                                localStorageTasks.removeItem(
                                    cacheStorageID + '-taskGlobal'
                                );
                                localStorageTasks.removeItem(
                                    cacheStorageID + '-taskGlobalVU'
                                );

                                res.redirect('/r/' + campaign_crypt);
                            } else {
                                res.render('report/template.ejs', {
                                    reporting: reportingData,
                                    moment: moment,
                                    utilities: Utilities
                                });
                            }

                        }

                    } else {

                        insertion_start_date = await ModelInsertions.max('insertion_start_date', {
                            where: {
                                campaign_id: campaign_id
                            }
                        });
                        insertion_end_date = await ModelInsertions.max('insertion_end_date', {
                            where: {
                                campaign_id: campaign_id
                            }
                        });

                        insertion_format = await ModelInsertions.findOne({
                            where: {
                                campaign_id: campaign_id,
                                format_id: {
                                    [Op.in]: [79633, 79637]
                                }
                            }
                        });

                        // console.log('insertion_start_date : ', insertion_start_date);
                        // console.log('insertion_end_date : ', insertion_end_date);

                        const now = new Date();
                        const timestamp_datenow = now.getTime();
                        // Déclare la date du moment  var timestamp_datenow =
                        // moment().format("DD/MM/YYYY HH:mm:ss"); recup la date de début de la campagne
                        // -4 heures pour règler le prob du décalage horaire
                        const campaign_start_date_yesterday = new Date(campaign_start_date);
                        var start_date_timezone = campaign_start_date_yesterday.setHours(-4);

                        // Teste pour récupérer la date la plus tôt si les insertions existe pour la
                        // campagne

                        if ((insertion_start_date) && (start_date_timezone > insertion_start_date)) {
                            start_date_timezone = insertion_start_date;
                        } else {
                            start_date_timezone = start_date_timezone
                        }
                        // console.log('start_date_timezone :', start_date_timezone); recup la date de
                        // fin de la campagne ajoute +1jour
                        var endDate_day = new Date(campaign_end_date);
                        var endDate_last = endDate_day.setDate(endDate_day.getDate() + 1);

                        // Teste pour récupérer la date la plus tardive si les insertions existe pour la
                        // campagne

                        if ((insertion_end_date) && (insertion_end_date > endDate_last)) {
                            endDate_last = insertion_end_date;
                        } else {
                            endDate_last = endDate_last
                        }

                        // Mettre la date de début à 00:00:00 - les minutes lancent des erreurs
                        const StartDate_timezone = moment(start_date_timezone).format(
                            'YYYY-MM-DDT00:00:00'
                        );

                        // Ajoute un jou en plus et mets les horaires à 00:00:00
                        const EndDate = moment(endDate_last)
                            .add('1', 'd')
                            .format('YYYY-MM-DDT00:00:00'); // 'YYYY-MM-DDTHH:mm:ss'

                        // si la date du jour est > à la date de fin on prend la date de fin sinon la date du jour 
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
                            },

                            {
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
                            }, {
                                "ViewableImpressions": {}
                            },
                            {
                                "ImageName": {}
                            },
                            ],
                            "filter": [{
                                "CampaignId": [campaign_id]
                            }]
                        }

                        // - date du jour = nbr jour Requête visitor unique On calcule le nombre de jour
                        // entre la date de fin campagne et date aujourd'hui  var date_now = Date.now();
                        var start_date = new Date(campaign_start_date);
                        var end_date_time = new Date(campaign_end_date);
                        var date_now = Date.now();
                        var diff_start = Utilities.nbr_jours(start_date, date_now);
                        var diff = Utilities.nbr_jours(start_date, end_date_time);
                        if (diff_start.day < diff.day) {
                            var NbDayCampaign = diff_start.day;
                        } else {
                            var NbDayCampaign = diff.day;
                        }

                        console.log(
                            'campaign_id : ',
                            campaign_id,
                            ' - ',
                            'diff_start.day : ',
                            diff_start.day,
                            ' - diff.day : ',
                            diff.day,
                            ' - endate : ',
                            end_date_time,
                            'NbDayCampaign : ',
                            NbDayCampaign
                        )

                        console.log(
                            'campaign_id : ',
                            campaign_id,
                            ' - ',
                            "startDate : ",
                            StartDate_timezone,
                            ' - ',
                            "endDate : ",
                            end_date,
                        )

                        var requestVisitor_unique = {
                            "startDate": StartDate_timezone,
                            "endDate": end_date,
                            "fields": [{
                                "UniqueVisitors": {}
                            }],
                            "filter": [{
                                "CampaignId": [campaign_id]
                            }]
                        }

                        // console.log('requestVisitor_unique.startDate :
                        // ',requestVisitor_unique.startDate);
                        // console.log('requestVisitor_unique.endDate :
                        // ',requestVisitor_unique.endDate); 1) Requête POST
                        var dataLSTaskGlobal = localStorageTasks.getItem(
                            cacheStorageID + '-taskGlobal'
                        );

                        var dataLSTaskGlobalVU = localStorageTasks.getItem(
                            cacheStorageID + '-taskGlobalVU'
                        );

                        // firstLink - Récupére la taskID de la requête reporting
                        let firstLinkTaskId = localStorageTasks.getItem(
                            cacheStorageID + '-firstLink-' + cacheStorageIDHour
                        );

                        if (!firstLinkTaskId) {
                            let firstLink = await AxiosFunction.getReportingData(
                                'POST',
                                '',
                                requestReporting
                            );

                            console.log('firstLink : Lancement de la requete')

                            // si firstLink existe (!= de null) on save la taskId dans le localStorage sinon
                            // firstLinkTaskId = vide
                            if (firstLink) {
                                if (firstLink.status == 201) {
                                    /*log_reporting = await Utilities.logs('info')
                                    log_reporting.info("Task id global : "+firstLink);*/

                                    localStorageTasks.setItem(
                                        cacheStorageID + '-firstLink-' + cacheStorageIDHour,
                                        firstLink.data.taskId
                                    );
                                    firstLinkTaskId = firstLink.data.taskId;
                                }
                            } else {
                                firstLinkTaskId = null;
                                /*log_reporting.info("Task id global null: "+firstLinkTaskId);*/

                            }
                        }


                        // twoLink - Récupére la taskID de la requête reporting
                        let twoLinkTaskId = localStorageTasks.getItem(
                            cacheStorageID + '-twoLink-' + cacheStorageIDHour
                        );

                        if ((!twoLinkTaskId) && (NbDayCampaign < 31) && (requestVisitor_unique)) {
                            let twoLink = await AxiosFunction.getReportingData(
                                'POST',
                                '',
                                requestVisitor_unique
                            );

                            // si twoLink existe (!= de null) on save la taskId dans le localStorage sinon
                            // twoLinkTaskId = vide
                            if (twoLink) {
                                if (twoLink.status == 201) {
                                    /*log_reporting.info("Task id vu : "+twoLink);*/

                                    localStorageTasks.setItem(
                                        cacheStorageID + '-twoLink-' + cacheStorageIDHour,
                                        twoLink.data.taskId
                                    );
                                    twoLinkTaskId = twoLink.data.taskId;
                                }
                            }
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

                            // 2) Requete GET boucle jusqu'a que le rapport generer 100% delais 1min on
                            // commence à 10sec
                            var time = 5000;
                            let timerFile = setInterval(async () => {

                                var dataLSTaskGlobal = localStorageTasks.getItem(
                                    cacheStorageID + '-taskGlobal'
                                );

                                var dataLSTaskGlobalVU = localStorageTasks.getItem(
                                    cacheStorageID + '-taskGlobalVU'
                                );

                                // Vérifie que dataLSTaskGlobal -> existe OU (dataLSTaskGlobalVU -> existe &&
                                // taskID_uu -> not null)
                                if (!dataLSTaskGlobal || (!dataLSTaskGlobalVU && !Utilities.empty(taskId_uu))) {
                                    if (!dataLSTaskGlobal && !Utilities.empty(taskId)) {
                                        time += 10000;
                                        let requete_global = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`;

                                        let threeLink = await AxiosFunction.getReportingData('GET', requete_global, '');
                                        if ((threeLink.data.lastTaskInstance.jobProgress == '1.0') && (threeLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {
                                            // 3) Récupère la date de chaque requête
                                            let dataLSTaskGlobal = localStorageTasks.getItem(
                                                cacheStorageID + '-taskGlobal'
                                            );
                                            if (!dataLSTaskGlobal) {
                                                dataFile = await AxiosFunction.getReportingData(
                                                    'GET',
                                                    `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`,
                                                    ''
                                                );
                                                /*log_reporting.info("Data global crée : "+taskId);*/

                                                // save la data requête 1 dans le local storage
                                                dataLSTaskGlobal = {
                                                    'datafile': dataFile.data
                                                };
                                                localStorageTasks.setItem(
                                                    cacheStorageID + '-taskGlobal',
                                                    JSON.stringify(dataLSTaskGlobal)
                                                );
                                            }
                                        }
                                    }

                                    // Request task2
                                    if (!dataLSTaskGlobalVU && !Utilities.empty(taskId_uu)) {
                                        time += 15000;
                                        let requete_vu = `https://reporting.smartadserverapis.com/2044/reports/${taskId_uu}`;

                                        let fourLink = await AxiosFunction.getReportingData('GET', requete_vu, '');
                                        // console.log('fourLink : ', fourLink.data.lastTaskInstance.jobProgress)

                                        if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (fourLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {

                                            // 3) Récupère la date de chaque requête
                                            dataLSTaskGlobalVU = localStorageTasks.getItem(
                                                cacheStorageID + '-taskGlobalVU'
                                            );
                                            if (!dataLSTaskGlobalVU) {
                                                dataFile2 = await AxiosFunction.getReportingData(
                                                    'GET',
                                                    `https://reporting.smartadserverapis.com/2044/reports/${taskId_uu}/file`,
                                                    ''
                                                );
                                                /*log_reporting.info("Data vu crée : "+taskId_uu);*/

                                                // save la data requête 2 dans le local storage
                                                dataLSTaskGlobalVU = {
                                                    'datafile': dataFile2.data
                                                };
                                                localStorageTasks.setItem(
                                                    cacheStorageID + '-taskGlobalVU',
                                                    JSON.stringify(dataLSTaskGlobalVU)
                                                );
                                            }
                                        }
                                    }

                                } else {
                                    // Stoppe l'intervalle timerFile
                                    clearInterval(timerFile);
                                    console.log('Stop clearInterval timerFile - else');

                                    // On récupére le dataLSTaskGlobal
                                    const objDefault = JSON.parse(dataLSTaskGlobal);
                                    var dataSplitGlobal = objDefault.datafile;


                                    //   console.log(dataSplitGlobal)

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
                                    const ViewableImpressions = [];
                                    const ImageCreative = [];


                                    const dataList = new Object();
                                    const dataListCreative = new Array()

                                    var dataSplitGlobal = dataSplitGlobal.split(/\r?\n/);
                                    if (dataSplitGlobal && (dataSplitGlobal.length > 0)) {
                                        var numberLine = dataSplitGlobal.length;




                                        if (numberLine > 1) {
                                            for (i = 1; i < numberLine; i++) {

                                                // split push les données dans chaque colone
                                                line = dataSplitGlobal[i].split(';');


                                                if (!Utilities.empty(line[0])) {
                                                    insertion_type = line[5];

                                                    InsertionName.push(line[5]);
                                                    Impressions.push(parseInt(line[10]));
                                                    Clicks.push(parseInt(line[12]));
                                                    Complete.push(parseInt(line[13]));
                                                    ViewableImpressions.push(parseInt(line[14]));
                                                    ImageCreative.push(line[15]);

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
                                                        'image_creative': line[15],

                                                        // 'impressions': parseInt(line[10]),
                                                        'click_rate': parseInt(line[11]),
                                                        'clicks': parseInt(line[12]),
                                                        //'complete': parseInt(line[13]),
                                                        // 'viewable_impressions': parseInt(line[14])
                                                    }

                                                    if (insertion_type.match(/SLIDER{1}/igm)) {
                                                        dataList[i]['impressions'] = parseInt(line[10]);
                                                    } else {
                                                        //  dataList[i]['impressions'] = parseInt(line[10]);
                                                        dataList[i]['impressions'] = parseInt(line[10]);

                                                    }
                                                    if (insertion_type.match(/PREROLL|MIDROLL{1}/igm)) {
                                                        dataList[i]['complete'] = parseInt(line[13]);

                                                    } else {
                                                        dataList[i]['complete'] = 0;

                                                    }



                                                    //regex qui regroupe les insertions creatives (PREROLL - DAILYMOTION - CORDONS BLEUS)
                                                    var regex_string = insertion_type.match(/(.*)-(.*)- (?:.(?!-))+$/igm)

                                                    if (regex_string) {


                                                        const string_crea = (regex_string[0]).split('- ')
                                                        var lastElement = string_crea.slice(-1);


                                                        //si dans le nom de l'insertion il se termine par 'POSITION' on ne crée pas dataObjCreatives 
                                                        if (!(lastElement[0]).match(/POSITION{1}/gim)) {
                                                           

                                                            var dataObjCreatives = {
                                                                'creative': lastElement[0],
                                                                'insertion_name': line[5],
                                                                'impressions': parseInt(line[10]),
                                                                'clicks': parseInt(line[12]),
                                                            }

                                                            dataListCreative.push(dataObjCreatives)

                                                            if (insertion_type.match(/PREROLL|MIDROLL{1}/igm)) {
                                                                dataObjCreatives['complete'] = parseInt(line[13]);

                                                            } else {
                                                                dataObjCreatives['complete'] = 0;

                                                            }
                                                        }
                                                    }


                                                }
                                            }
                                        }
                                    }




                                    var formatObjects = new Object();
                                    if (dataList && (Object.keys(dataList).length > 0)) {
                                        // Initialise les formats
                                        var formatHabillage = new Array();
                                        var formatInterstitiel = new Array();
                                        var formatInterstitielVideo = new Array();
                                        var formatGrandAngle = new Array();
                                        var formatMasthead = new Array();
                                        var formatInstream = new Array();
                                        var formatRectangle = new Array();
                                        var formatRectangleVideo = new Array();
                                        var formatLogo = new Array();
                                        var formatNative = new Array();
                                        var formatSlider = new Array();
                                        var formatMea = new Array();
                                        var formatSliderVideo = new Array();
                                        var formatClickCommand = new Array();

                                        // initialise les sites
                                        var siteObjects = new Object();

                                        var siteLINFO = new Array();
                                        var siteLINFO_ANDROID = new Array();
                                        var siteLINFO_IOS = new Array();
                                        var siteANTENNEREUNION = new Array();
                                        //admanager App AR
                                        var siteAPP_ANTENNEREUNION = new Array();

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



                                        var creaGrandAngleDesktop = new Array();
                                        var creaGrandAngleTab = new Array();
                                        var creaGrandAngleMobile = new Array();
                                        var creaGrandAngleMobileApp = new Array();

                                        var creaInterstitielDesktop = new Array();
                                        var creaInterstitielTab = new Array();
                                        var creaInterstitielMobile = new Array();
                                        var creaInterstitielMobileApp = new Array();


                                        for (var index = 1; index <= Object.keys(dataList).length; index++) {
                                            var insertion_name = dataList[index].insertion_name;
                                            var site_id = dataList[index].site_id;
                                            var site_name = dataList[index].site_name;
                                            var image_crea = dataList[index].image_creative;

                                            /*console.log(insertion_name)
                                            console.log(site_name)
                                          
                                            console.log("---------------")*/



                                            // Créer les tableaux des formats
                                            switch (true) {
                                                case (/HABILLAGE{1}/igm).test(insertion_name):
                                                    formatHabillage.push(index);

                                                    break;

                                                case (/INTERSTITIEL|INTERSTITIEL VIDEO{1}/igm).test(insertion_name):
                                                    if (insertion_name.match(/INTERSTITIEL VIDEO{1}/igm)) {
                                                        formatInterstitielVideo.push(index);
                                                    } else {
                                                        formatInterstitiel.push(index);

                                                    }

                                                    break;

                                                case (/MASTHEAD{1}/igm).test(insertion_name):
                                                    formatMasthead.push(index);

                                                    break;

                                                case (/GRAND ANGLE{1}/igm).test(insertion_name):
                                                    formatGrandAngle.push(index);

                                                    break;

                                                case (/PREROLL|MIDROLL{1}/igm).test(insertion_name):
                                                    formatInstream.push(index);

                                                    break;

                                                case (/RECTANGLE|RECTANGLE VIDEO{1}/igm).test(insertion_name):
                                                    if (insertion_name.match(/RECTANGLE VIDEO{1}/igm)) {
                                                        formatRectangleVideo.push(index);
                                                    } else {
                                                        formatRectangle.push(index);

                                                    }
                                                    break;


                                                case (/LOGO{1}/igm).test(insertion_name):
                                                    formatLogo.push(index);

                                                    break;

                                                case (/NATIVE{1}/igm).test(insertion_name):
                                                    formatNative.push(index);

                                                    break;

                                                case (/SLIDER|SLIDER VIDEO{1}/igm).test(insertion_name):
                                                    if (insertion_name.match(/SLIDER VIDEO{1}/igm)) {
                                                        formatSliderVideo.push(index);
                                                    } else {
                                                        formatSlider.push(index);

                                                    }

                                                    break;
                                                case (/^\MEA{1}/igm).test(insertion_name):
                                                    formatMea.push(index);

                                                    break;

                                                case (/CLICK COMMAND{1}|CC/igm).test(insertion_name):
                                                    formatClickCommand.push(index);

                                                    break;
                                                default:
                                                    console.log("Aucune data")
                                                    break;
                                            }

                                            // Créer les tableaux des sites
                                            switch (true) {
                                                case (/^\SM_LINFO.re{1}/igm).test(site_name):
                                                    siteLINFO.push(index);

                                                    break;

                                                case (/^\SM_LINFO-ANDROID{1}/igm).test(site_name):
                                                    siteLINFO_ANDROID.push(index);

                                                    break;

                                                case (/^\SM_LINFO-IOS{1}/igm).test(site_name):
                                                    siteLINFO_IOS.push(index);

                                                    break;

                                                case (/^\SM_ANTENNEREUNION{1}/igm).test(site_name):
                                                    siteANTENNEREUNION.push(index);

                                                    break;

                                                case (/^\SM_DOMTOMJOB{1}/igm).test(site_name):
                                                    siteDOMTOMJOB.push(index);

                                                    break;

                                                case (/^\SM_IMMO974{1}/igm).test(site_name):
                                                    siteIMMO974.push(index);

                                                    break;

                                                case (/^\SM_RODZAFER_LP{1}/igm).test(site_name):
                                                    siteRODZAFER_LP.push(index);

                                                    break;

                                                case (/^\SM_RODZAFER_ANDROID{1}/igm).test(site_name):
                                                    siteRODZAFER_ANDROID.push(index);

                                                    break;

                                                case (/^\SM_RODZAFER_IOS{1}/igm).test(site_name):
                                                    siteRODZAFER_ANDROID.push(index);

                                                    break;

                                                case (/^\SM_ORANGE_REUNION{1}/igm).test(site_name):
                                                    siteORANGE_REUNION.push(index);

                                                    break;

                                                case (/^\SM_TF1{1}/igm).test(site_name):
                                                    siteTF1.push(index);

                                                    break;

                                                case (/^\SM_M6{1}/igm).test(site_name):
                                                    siteM6.push(index);

                                                    break;

                                                case (/^\SM_DAILYMOTION{1}/igm).test(site_name):
                                                    siteDAILYMOTION.push(index);

                                                    break;

                                                case (/^\SM_RODALI{1}/igm).test(site_name):
                                                    siteRODALI.push(index);

                                                    break;

                                                default:
                                                    console.log("Aucune data")

                                                    break;
                                            }

                                            // Créer les tableaux des créative formats
                                            /* switch (true) {
                                                 case (/1024x768|2048x153/igm).test(image_crea):
                                                     creaInterstitielDesktop.push(index);
 
                                                     break;
                                                 case (/320x480|720x1280/igm).test(image_crea):
                                                     creaInterstitielMobile.push(index);
 
                                                     break;
 
                                                 case (/1536x2048/igm).test(image_crea):
                                                     creaInterstitielTab.push(index);
 
                                                     break;
 
                                                 case (/300x600/igm).test(image_crea):
                                                     creaGrandAngleDesktop.push(index);
 
                                                     break;
                                                 case (/300x250|300x250 APPLI/igm).test(image_crea):
                                                     creaGrandAngleMobile.push(index);
 
                                                     break;
 
 
                                                 default:
                                                     break;
                                             }*/

                                        }

                                        // console.log(Object.keys(dataList).length)

                                        // Trie les formats et compatibilise les insertions et autres clics
                                        if (!Utilities.empty(formatHabillage)) {
                                            formatObjects.habillage = SmartFunction.sortDataReport(
                                                formatHabillage,
                                                dataList
                                            );
                                        }
                                        if (!Utilities.empty(formatInterstitiel)) {
                                            formatObjects.interstitiel = SmartFunction.sortDataReport(
                                                formatInterstitiel,
                                                dataList
                                            );
                                        }
                                        if (!Utilities.empty(formatInterstitielVideo)) {
                                            formatObjects.interstitielvideo = SmartFunction.sortDataReport(
                                                formatInterstitielVideo,
                                                dataList
                                            );
                                        }
                                        if (!Utilities.empty(formatMasthead)) {
                                            formatObjects.masthead = SmartFunction.sortDataReport(formatMasthead, dataList);
                                        }
                                        if (!Utilities.empty(formatGrandAngle)) {
                                            formatObjects.grandangle = SmartFunction.sortDataReport(
                                                formatGrandAngle,
                                                dataList
                                            );
                                        }
                                        if (!Utilities.empty(formatInstream)) {
                                            formatObjects.instream = SmartFunction.sortDataReport(formatInstream, dataList);
                                        }
                                        if (!Utilities.empty(formatRectangle)) {
                                            formatObjects.rectangle = SmartFunction.sortDataReport(
                                                formatRectangle,
                                                dataList
                                            );
                                        }
                                        if (!Utilities.empty(formatRectangleVideo)) {
                                            formatObjects.rectanglevideo = SmartFunction.sortDataReport(
                                                formatRectangleVideo,
                                                dataList
                                            );
                                        }
                                        if (!Utilities.empty(formatLogo)) {
                                            formatObjects.logo = SmartFunction.sortDataReport(formatLogo, dataList);
                                        }
                                        if (!Utilities.empty(formatNative)) {
                                            formatObjects.native = SmartFunction.sortDataReport(formatNative, dataList);
                                        }
                                        if (!Utilities.empty(formatSlider)) {
                                            formatObjects.slider = SmartFunction.sortDataReport(formatSlider, dataList);
                                        }
                                        if (!Utilities.empty(formatMea)) {
                                            formatObjects.mea = SmartFunction.sortDataReport(formatMea, dataList);
                                        }
                                        if (!Utilities.empty(formatSliderVideo)) {
                                            formatObjects.slidervideo = SmartFunction.sortDataReport(
                                                formatSliderVideo,
                                                dataList
                                            );
                                        }

                                        if (!Utilities.empty(formatClickCommand)) {
                                            formatObjects.clickcommand = SmartFunction.sortDataReport(
                                                formatClickCommand,
                                                dataList
                                            );
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
                                        campaignCtr = parseFloat((campaignClicks / campaignImpressions) * 100).toFixed(
                                            2
                                        );
                                    } else {
                                        campaignCtr = null;
                                    }
                                    if (Complete.length > 0) {
                                        campaignComplete = Complete.reduce(reducer);
                                    } else {
                                        campaignComplete = null;
                                    }

                                    if (!Utilities.empty(campaignComplete) && !Utilities.empty(campaignImpressions)) {
                                        campaignCtrComplete = parseFloat(
                                            (campaignComplete / campaignImpressions) * 100
                                        ).toFixed(2);
                                    } else {
                                        campaignCtrComplete = null;
                                    }

                                    formatObjects.campaign = {
                                        campaign_id: campaign.campaign_id,
                                        campaign_name: campaign.campaign_name,
                                        campaign_start_date: campaign.campaign_start_date,
                                        campaign_end_date: campaign.campaign_end_date,
                                        campaign_crypt: campaign.campaign_crypt,
                                        advertiser_id: campaign.advertiser.advertiser_id,
                                        advertiser_name: campaign.advertiser.advertiser_name,
                                        impressions: campaignImpressions,
                                        clicks: campaignClicks,
                                        ctr: campaignCtr,
                                        complete: campaignComplete,
                                        ctrComplete: campaignCtrComplete
                                    }

                                    // Récupére les infos des VU s'il existe
                                    if (!Utilities.empty(dataLSTaskGlobalVU)) {
                                        const objDefaultVU = JSON.parse(dataLSTaskGlobalVU);
                                        var dataSplitGlobalVU = objDefaultVU.datafile;

                                        var dataSplitGlobalVU = dataSplitGlobalVU.split(/\r?\n/);
                                        if (dataSplitGlobalVU) {
                                            var numberLine = dataSplitGlobalVU.length;
                                            for (i = 1; i < numberLine; i++) {
                                                // split push les données dans chaque colone
                                                line = dataSplitGlobalVU[i].split(';');
                                                if (!Utilities.empty(line[0])) {
                                                    unique_visitor = parseInt(line[0]);
                                                    formatObjects.campaign.vu = parseInt(unique_visitor);
                                                    repetition = parseFloat((campaignImpressions / parseInt(unique_visitor))).toFixed(
                                                        2
                                                    );
                                                    formatObjects.campaign.repetition = repetition;
                                                }
                                            }
                                        }
                                    } else {
                                        unique_visitor = 0;
                                        formatObjects.campaign.vu = parseInt(unique_visitor);
                                        repetition = 0
                                        formatObjects.campaign.repetition = repetition;
                                    }
                                    //Si la campagne possède un masthead ou interstitiel , on recupère le localstorage de GAM
                                    if (!Utilities.empty(insertion_format)) {
                                        var admanager = await AxiosFunction.getAdManager(campaign_id);

                                        if (admanager) {
                                            if (admanager.status == 201 || admanager.status == 200) {
                                                const data_admanager = admanager.data
                                                // test si le localstorage admanager existe 
                                                if (!Utilities.empty(data_admanager)) {

                                                    // console.log(data_admanager)

                                                    if (!Utilities.empty(formatObjects.interstitiel)) {

                                                        var key_i = Object.keys(formatObjects.interstitiel.siteList).length

                                                        formatObjects.interstitiel.siteList[key_i] = data_admanager.interstitiel.siteList

                                                        var sommeInterstitiel = formatObjects.interstitiel.impressions + data_admanager.interstitiel.impressions

                                                        var sommeclicksInterstitiel = formatObjects.interstitiel.clicks + data_admanager.interstitiel.clicks


                                                        formatObjects.interstitiel.impressions = sommeInterstitiel
                                                        formatObjects.interstitiel.clicks = sommeclicksInterstitiel

                                                    }

                                                    if (!Utilities.empty(formatObjects.masthead)) {

                                                        var key_m = Object.keys(formatObjects.masthead.siteList).length

                                                        formatObjects.masthead.siteList[key_m] = data_admanager.masthead.siteList

                                                        var sommemasthead = formatObjects.masthead.impressions + data_admanager.masthead.impressions
                                                        var sommeclicksmasthead = formatObjects.masthead.clicks + data_admanager.masthead.clicks

                                                        formatObjects.masthead.impressions = sommemasthead
                                                        formatObjects.masthead.clicks = sommeclicksmasthead


                                                    }


                                                    //Push les impression,click,ctr total (admanager + smart)
                                                    var impression = formatObjects.campaign.impressions + data_admanager.campaign.impressions
                                                    var clicks = formatObjects.campaign.clicks + data_admanager.campaign.clicks

                                                    formatObjects.campaign.impressions = impression
                                                    formatObjects.campaign.clicks = clicks

                                                    ctr = parseFloat((clicks / impression) * 100).toFixed(
                                                        2
                                                    );
                                                    formatObjects.campaign.ctr = ctr

                                                }
                                            } else {
                                                admanager = null;
                                            }


                                        } else {
                                            admanager = null;
                                        }




                                    }


                                    if (!Utilities.empty(dataListCreative)) {
                                        const ImpressionCrea = []
                                        const ClicksCrea = []
                                        const CompleteCrea = []

                                        //fonction qui regrouge les obj qui porte le même nom de la creative
                                        //le fonction fait la somme des impressions,clic ect...par créative
                                        const groupCreatives = Object.values(dataListCreative.reduce((r, o) => (r[o.creative]
                                            ? (r[o.creative].impressions += o.impressions, r[o.creative].clicks += o.clicks, r[o.creative].ctr = parseFloat((r[o.creative].clicks / r[o.creative].impressions) * 100).toFixed(2),
                                                r[o.creative].complete += o.complete,
                                                r[o.creative].ctrComplete = parseFloat((r[o.creative].complete / r[o.creative].impressions) * 100).toFixed(2)

                                            )
                                            : (r[o.creative] = { ...o }), r), {}));



                                        for (let i = 0; i < groupCreatives.length; i++) {
                                            ImpressionCrea.push(groupCreatives[i].impressions)
                                            ClicksCrea.push(groupCreatives[i].clicks)
                                            CompleteCrea.push(groupCreatives[i].complete)


                                        }

                                        if ((ImpressionCrea.length > 0) || (ClicCrea.length > 0) || (CompleteCrea.length > 0)) {
                                            var creativeImpressions = ImpressionCrea.reduce(reducer);
                                            var creativeClicks = ClicksCrea.reduce(reducer);
                                            var creativeComplete = CompleteCrea.reduce(reducer);

                                            var creativeCtr = parseFloat((creativeClicks / creativeImpressions) * 100).toFixed(
                                                2
                                            );

                                            var creativeCtrComplete = parseFloat(
                                                (creativeComplete / creativeImpressions) * 100
                                            ).toFixed(2);

                                            formatObjects.creatives = {
                                                'impressions': creativeImpressions,
                                                'clicks': creativeClicks,
                                                'ctr': creativeCtr,
                                                'ctrComplete': creativeCtrComplete,
                                            }
                                        }
                                        formatObjects.creative = groupCreatives

                                    }


                                    formatObjects.reporting_start_date = moment().format('YYYY-MM-DD HH:m:s');
                                    formatObjects.reporting_end_date = moment()
                                        .add(2, 'hours')
                                        .format('YYYY-MM-DD HH:m:s');

                                    // Supprimer le localStorage précédent
                                    if (localStorage.getItem(cacheStorageID)) {
                                        localStorage.removeItem(cacheStorageID);
                                    }
                                    if (localStorage.getItem(cacheStorageID)) {
                                        localStorage.removeItem(cacheStorageID);
                                    }

                                    // Créer le localStorage
                                    localStorage.setItem(cacheStorageID, JSON.stringify(formatObjects));
                                    res.redirect('/r/' + campaign_crypt);
                                    console.log(formatObjects)

                                }

                            }, time);
                        }

                    }

                } catch (error) {
                    /*log_err =  Utilities.logs('error')
                    log_err.error('Un problème est survenu lors de la génération reporting ' + error.response.status +' - ' +error.response.headers);*/
                    var statusCoded = error.response;

                    res.render("error.ejs", {
                        statusCoded: statusCoded,
                        campaigncrypt: campaigncrypt
                    });
                }

                // Affiche le json campaign res.json(formatObjects);
            });

    } catch (error) {
        console.log(error)
        /* log_err =  Utilities.logs('error')
             log_err.error('Un problème est survenu lors de la génération reporting ' + error.response.status +' - ' +error.response.headers);*/

        var statusCoded = error.response;
        res.render("error.ejs", {
            statusCoded: statusCoded,
            campaigncrypt: campaigncrypt
        })
    }

}

exports.export_excel = async (req, res) => {

    var campaigncrypt = req.params.campaigncrypt;

    console.log(campaigncrypt)
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

                let campaign_id = campaign.campaign_id;
                console.log(campaign_id);
                // Gestion du cache
                let cacheStorageID = 'campaignID-' + campaign_id;

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

                var data_localStorage = localStorage.getItem(cacheStorageID);

                var reporting = JSON.parse(data_localStorage);

                console.log(reporting)

                var reporting_start_date = moment(reporting.reporting_start_date).format(
                    'DD/MM/YYYY - HH:mm'
                );
                var campaign_start_date = moment(reporting.campaign.campaign_start_date).format(
                    'DD/MM/YYYY'
                );
                var campaign_end_date = moment(reporting.campaign.campaign_end_date).format(
                    'DD/MM/YYYY'
                );
                var campaign_name = reporting.campaign.campaign_name;
                var advertiser_name = reporting.campaign.advertiser_name;

                var impressions = reporting.campaign.impressions;
                var clicks = reporting.campaign.clicks;
                var ctr = reporting.campaign.ctr;


                var vu = reporting.campaign.vu;


                var repetition = reporting.campaign.repetition;
                var complete = reporting.campaign.ctrComplete;

                var interstitiel = reporting.interstitiel;
                var interstitielvideo = reporting.interstitielvideo;
                var habillage = reporting.habillage;
                var instream = reporting.instream;
                var masthead = reporting.masthead;
                var grandangle = reporting.grandangle;
                var rectanglevideo = reporting.rectanglevideo;
                var native = reporting.native;
                var slider = reporting.slider;
                var mea = reporting.mea;
                var slidervideo = reporting.slidervideo;
                var logo = reporting.logo;
                var clickcommand = reporting.clickcommand;

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
                    cellNone: {

                        numFmt: "0",

                    },

                    cellTc: {
                        numFmt: "0",

                    }
                };

                //

                //Array of objects representing heading rows (very top)
                //création du header de la feuille excel
                const heading = [
                    [{
                        value: 'Rapport de la campagne : ' + campaign_name,
                        style: styles.headerDark
                    }

                    ],
                    ['Annonceur : ' + advertiser_name],
                    ['Campagne  : ' + campaign_name],

                    ['Date de génération : ' + reporting_start_date],
                    ['Période de diffusion : Du ' + campaign_start_date + ' au ' +
                        campaign_end_date
                    ],
                    ['                ']
                ];

                //Here you specify the export structure
                //creation des colonnes (feuil 1)
                const bilan_global = {

                    impressions: { // <- the key should match the actual data key
                        displayName: 'Impressions', // <- Here you specify the column header
                        headerStyle: styles.headerDark, // <- Header style
                        width: 400, // <- width in pixels
                        cellStyle: styles.cellNone,
                    },
                    clics: {
                        displayName: 'Clics',
                        headerStyle: styles.headerDark,
                        width: 220, // <- width in chars (when the number is passed as string)
                        cellStyle: styles.cellNone,

                    },
                    ctr_clics: {
                        displayName: 'Taux de clics',
                        headerStyle: styles.headerDark,
                        width: 220, // <- width in pixels
                        cellStyle: styles.cellNone,

                    },
                    vu: {
                        displayName: 'Visiteurs Uniques',
                        headerStyle: styles.headerDark,
                        width: 220, // <- width in pixels
                        cellStyle: styles.cellNone,

                    },
                    repetions: {
                        displayName: 'Répétition',
                        headerStyle: styles.headerDark,
                        width: 220 // <- width in pixels
                    }

                };

                //creation des colonnes (feuil 2)

                const bilan_formats = {

                    Formats: { // <- the key should match the actual data key
                        displayName: 'Format', // <- Here you specify the column header
                        headerStyle: styles.headerDark, // <- Header style
                        width: 220 // <- width in pixels
                    },
                    Impressions: {
                        displayName: 'Impressions',
                        headerStyle: styles.headerDark,
                        width: 120,
                        cellStyle: styles.cellNone,
                        // <- width in chars (when the number is passed as string)

                    },
                    Clics: {
                        displayName: 'Clics',
                        headerStyle: styles.headerDark,
                        width: 120,
                        cellStyle: styles.cellNone,
                        // <- width in chars (when the number is passed as string)

                    },
                    Ctr_clics: {
                        displayName: 'Taux de clics',
                        headerStyle: styles.headerDark,
                        width: 120, // <- width in pixels
                        cellStyle: styles.cellTc,


                    }
                };

                //creation des colonnes (feuil 3)

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
                        width: 120, // <- width in chars (when the number is passed as string)
                        cellStyle: styles.cellNone,

                    },
                    clics: {
                        displayName: 'Clics',
                        headerStyle: styles.headerDark,
                        width: 120, // <- width in chars (when the number is passed as string)
                        cellStyle: styles.cellNone,

                    },
                    ctr_clics: {
                        displayName: 'Taux de clics',
                        headerStyle: styles.headerDark,
                        width: 120, // <- width in pixels
                        cellStyle: styles.cellTc,

                    }
                };

                if (!Utilities.empty(instream)) {
                    bilan_sites['vtr'] = {
                        Formats: 'VIDEO',
                        displayName: 'VTR',
                        headerStyle: styles.headerDark,
                        width: 120, // <- width in pixels
                        cellStyle: styles.cellTc,


                    }
                }
                const dataset_global = [{
                    impressions: impressions,
                    clics: clicks,
                    ctr_clics: ctr.replace('.', ',') + '%',
                    vu: vu,
                    repetions: repetition

                }];

                //recupère les données du localstorage et regroupe par formats

                const dataset_format = []


                if (!Utilities.empty(interstitiel)) {
                    dataset_format[0] = {
                        Formats: 'INTERSTITIEL',
                        Impressions: reporting.interstitiel.impressions,
                        Clics: reporting.interstitiel.clicks,
                        Ctr_clics: reporting.interstitiel.ctr.replace('.', ',') + '%',

                    }
                }

                if (!Utilities.empty(habillage)) {
                    dataset_format[1] = {

                        Formats: 'HABILLAGE',
                        Impressions: reporting.habillage.impressions,
                        Clics: reporting.habillage.clicks,
                        Ctr_clics: reporting.habillage.ctr.replace('.', ',') + '%'
                    }
                }
                if (!Utilities.empty(masthead)) {
                    dataset_format[2] = {

                        Formats: 'MASTHEAD',
                        Impressions: reporting.masthead.impressions,
                        Clics: reporting.masthead.clicks,
                        Ctr_clics: reporting.masthead.ctr.replace('.', ',') + '%'
                    }
                }

                if (!Utilities.empty(grandangle)) {
                    dataset_format[3] = {

                        Formats: 'GRAND ANGLE',
                        Impressions: reporting.grandangle.impressions,
                        Clics: reporting.grandangle.clicks,
                        Ctr_clics: reporting.grandangle.ctr.replace('.', ',') + '%'

                    }
                }

                if (!Utilities.empty(native)) {
                    dataset_format[4] = {
                        Formats: 'NATIVE',
                        Impressions: reporting.native.impressions,
                        Clics: reporting.native.clicks,
                        Ctr_clics: reporting.native.ctr.replace('.', ',') + '%'

                    }
                }
                if (!Utilities.empty(instream)) {
                    dataset_format[5] = {
                        Formats: 'INSTREAM',
                        Impressions: reporting.instream.impressions,
                        Clics: reporting.instream.clicks,
                        Ctr_clics: reporting.instream.ctr.replace('.', ',') + '%'
                    }
                }
                if (!Utilities.empty(slider)) {

                    dataset_format[6] = {
                        Formats: 'SLIDER',
                        Impressions: reporting.slider.impressions,
                        Clics: reporting.slider.clicks,
                        Ctr_clics: reporting.slider.ctr.replace('.', ',') + '%'
                    }
                }

                if (!Utilities.empty(rectanglevideo)) {

                    dataset_format[7] = {
                        Formats: 'RECTANGLE VIDEO',
                        Impressions: reporting.rectanglevideo.impressions,
                        Clics: reporting.rectanglevideo.clicks,
                        Ctr_clics: reporting.rectanglevideo.ctr.replace('.', ',') + '%'
                    }
                }

                if (!Utilities.empty(mea)) {

                    dataset_format[8] = {
                        Formats: 'MISE EN AVANT',
                        Impressions: reporting.mea.impressions,
                        Clics: reporting.mea.clicks,
                        Ctr_clics: reporting.mea.ctr.replace('.', ',') + '%'
                    }
                }
                if (!Utilities.empty(slidervideo)) {

                    dataset_format[9] = {
                        Formats: 'SLIDER VIDEO',
                        Impressions: reporting.slidervideo.impressions,
                        Clics: reporting.slidervideo.clicks,
                        Ctr_clics: reporting.slidervideo.ctr.replace('.', ',') + '%'
                    }
                }
                if (!Utilities.empty(logo)) {

                    dataset_format[10] = {
                        Formats: 'LOGO',
                        Impressions: reporting.logo.impressions,
                        Clics: reporting.logo.clicks,
                        Ctr_clics: reporting.logo.ctr.replace('.', ',') + '%'
                    }
                }
                if (!Utilities.empty(clickcommand)) {

                    dataset_format[11] = {
                        Formats: 'CLICK COMMAND',
                        Impressions: '-',
                        Clics: reporting.clickcommand.clicks,
                        Ctr_clics: '-'
                    }
                }


                if (!Utilities.empty(interstitielvideo)) {

                    dataset_format[12] = {
                        Formats: 'INTERSTITIEL VIDEO',
                        Impressions: reporting.interstitielvideo.impressions,
                        Clics: reporting.interstitielvideo.clicks,
                        Ctr_clics: reporting.interstitielvideo.ctr.replace('.', ',') + '%'
                    }
                }

                //recupère les données du localstorage et regroupe par formats/sites

                const dataset_site = []

                if (!Utilities.empty(habillage)) {
                    for (i = 0; i < Object.keys(reporting.habillage.siteList).length; i++) {

                        dataset_site.push({
                            formats: 'HABILLAGE',
                            sites: reporting
                                .habillage
                                .siteList[i]
                                .site,
                            impressions: reporting.habillage.siteList[i].impressions,
                            clics: reporting.habillage.siteList[i].clicks,
                            ctr_clics: reporting
                                .habillage
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '
                        });

                    }
                }

                if (!Utilities.empty(interstitiel)) {
                    for (i = 0; i < Object.keys(reporting.interstitiel.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'INTERSTITIEL',
                            sites: reporting
                                .interstitiel
                                .siteList[i]
                                .site,
                            impressions: reporting.interstitiel.siteList[i].impressions,
                            clics: reporting.interstitiel.siteList[i].clicks,
                            ctr_clics: reporting
                                .interstitiel
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '
                        })

                    }
                }

                if (!Utilities.empty(interstitielvideo)) {
                    for (i = 0; i < Object.keys(reporting.interstitielvideo.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'INTERSTITIEL VIDEO',
                            sites: reporting
                                .interstitielvideo
                                .siteList[i]
                                .site,
                            impressions: reporting.interstitielvideo.siteList[i].impressions,
                            clics: reporting.interstitielvideo.siteList[i].clicks,
                            ctr_clics: reporting
                                .interstitielvideo
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '
                        })

                    }
                }



                if (!Utilities.empty(masthead)) {
                    for (i = 0; i < Object.keys(reporting.masthead.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'MASTHEAD',
                            sites: reporting
                                .masthead
                                .siteList[i]
                                .site,
                            impressions: reporting.masthead.siteList[i].impressions,
                            clics: reporting.masthead.siteList[i].clicks,
                            ctr_clics: reporting
                                .masthead
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '
                        })

                    }
                }
                if (!Utilities.empty(grandangle)) {
                    for (i = 0; i < Object.keys(reporting.grandangle.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'GRAND ANGLE',
                            sites: reporting
                                .grandangle
                                .siteList[i]
                                .site,
                            impressions: reporting.grandangle.siteList[i].impressions,
                            clics: reporting.grandangle.siteList[i].clicks,
                            ctr_clics: reporting
                                .grandangle
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '
                        })

                    }
                }
                if (!Utilities.empty(instream)) {
                    for (i = 0; i < Object.keys(reporting.instream.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'INSTREAM',
                            sites: reporting
                                .instream
                                .siteList[i]
                                .site,
                            impressions: reporting.instream.siteList[i].impressions,
                            clics: reporting.instream.siteList[i].clicks,
                            ctr_clics: reporting
                                .instream
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: reporting
                                .instream
                                .siteList[i]
                                .ctrComplete.replace('.', ',') + '%'
                        })

                    }
                }
                if (!Utilities.empty(native)) {

                    for (i = 0; i < Object.keys(reporting.native.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'NATIVE',
                            sites: reporting
                                .native
                                .siteList[i]
                                .site,
                            impressions: reporting.native.siteList[i].impressions,
                            clics: reporting.native.siteList[i].clicks,
                            ctr_clics: reporting
                                .native
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '


                        })

                    }
                }
                if (!Utilities.empty(rectanglevideo)) {
                    for (i = 0; i < Object.keys(reporting.rectanglevideo.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'RECTANGLE VIDEO',
                            sites: reporting
                                .rectanglevideo
                                .siteList[i]
                                .site,
                            impressions: reporting.rectanglevideo.siteList[i].impressions,
                            clics: reporting.rectanglevideo.siteList[i].clicks,
                            ctr_clics: reporting
                                .rectanglevideo
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '


                        })

                    }
                }
                if (!Utilities.empty(slider)) {
                    for (i = 0; i < Object.keys(reporting.slider.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'SLIDER',
                            sites: reporting
                                .slider
                                .siteList[i]
                                .site,
                            impressions: reporting.slider.siteList[i].impressions,
                            clics: reporting.slider.siteList[i].clicks,
                            ctr_clics: reporting
                                .slider
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '


                        })

                    }
                }

                if (!Utilities.empty(slidervideo)) {
                    for (i = 0; i < Object.keys(reporting.slidervideo.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'SLIDER VIDEO',
                            sites: reporting
                                .slidervideo
                                .siteList[i]
                                .site,
                            impressions: reporting.slidervideo.siteList[i].impressions,
                            clics: reporting.slidervideo.siteList[i].clicks,
                            ctr_clics: reporting
                                .slidervideo
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '

                        })

                    }
                }

                if (!Utilities.empty(logo)) {
                    for (i = 0; i < Object.keys(reporting.logo.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'LOGO',
                            sites: reporting
                                .logo
                                .siteList[i]
                                .site,
                            impressions: reporting.logo.siteList[i].impressions,
                            clics: reporting.logo.siteList[i].clicks,
                            ctr_clics: reporting
                                .logo
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '

                        })

                    }
                }

                if (!Utilities.empty(mea)) {
                    for (i = 0; i < Object.keys(reporting.mea.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'MISE EN AVANT',
                            sites: reporting
                                .mea
                                .siteList[i]
                                .site,
                            impressions: reporting.mea.siteList[i].impressions,
                            clics: reporting.mea.siteList[i].clicks,
                            ctr_clics: reporting
                                .mea
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '

                        })

                    }
                }
                if (!Utilities.empty(clickcommand)) {
                    for (i = 0; i < Object.keys(reporting.clickcommand.siteList).length; i++) {
                        dataset_site.push({
                            formats: 'CLICK COMMAND',
                            sites: reporting
                                .clickcommand
                                .siteList[i]
                                .site,
                            impressions: reporting.clickcommand.siteList[i].impressions,
                            clics: reporting.clickcommand.siteList[i].clicks,
                            ctr_clics: reporting
                                .clickcommand
                                .siteList[i]
                                .ctr.replace('.', ',') + '%',
                            vtr: ' - '


                        })

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
                    'rapport_antennesb-' + label_now + '-' + campaign_name + '.xlsx',

                ); // This is sails.js specific (in general you need to set headers)

                return res.send(report);

                // OR you can save this buffer to the disk by creating a file.

            });

    } catch (error) {
        console.log(error)

    }

};

exports.automate = async (req, res) => {

    let campaign_id = req.params.campaignid;

    try {
        // Réinitialise l'objet Format
        let formatObjects = new Object();
        let cacheStorageIDHour = moment().format('YYYYMMDD');

        let mode = req.query.mode;
        if (!Utilities.empty(mode) && (mode === 'delete')) {
            // si le local storage expire; on supprime les precedents cache et les taskid                           
            localStorage.removeItem('campaignID-' + campaign_id);

            //suppression des task_id
            localStorageTasks.removeItem(
                'campaignID-' + campaign_id + '-firstLink-' + cacheStorageIDHour
            );
            localStorageTasks.removeItem(
                'campaignID-' + campaign_id + '-twoLink-' + cacheStorageIDHour
            );

            //supression data global et vu
            localStorageTasks.removeItem(
                'campaignID-' + campaign_id + '-firstLink-' + cacheStorageIDHour
            );
            localStorageTasks.removeItem(
                'campaignID-' + campaign_id + '-taskGlobal'
            );
            localStorageTasks.removeItem(
                'campaignID-' + campaign_id + '-taskGlobalVU'
            );

            console.log('mode = delete');
            return res
                .status(200).json({
                    'message': 'Les caches de cette campagne <strong>' + campaign_id + '</strong> sont supprimés.'
                });
        }

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
                    campaign_id: campaign_id
                },
                include: [{
                    model: ModelAdvertisers
                }]
            })
            .then(async function (campaign) {
                if (!campaign)
                    return res
                        .status(403).json({
                            'message': 'Cette campagne n\'existe pas'
                        });

                // fonctionnalité de géneration du rapport
                let campaign_crypt = campaign.campaign_crypt;
                let advertiser_id = campaign.advertiser_id;
                let campaign_id = campaign.campaign_id;
                var campaign_start_date = campaign.campaign_start_date;
                var campaign_end_date = campaign.campaign_end_date;

                // Gestion du cache
                var cacheStorageID = 'campaignID-' + campaign_id;

                // Initialise la date
                let date = new Date();
                // let cacheStorageIDHour = moment().format('YYYYMMDD');

                var localStorageAll = localStorage.getItem(cacheStorageID);
                let localStorageGlobal = localStorageTasks.getItem(
                    cacheStorageID + '-firstLink-' + cacheStorageIDHour
                );

                // Vérifie si les localstorage de la campagne existe
                if ((!localStorageAll) || (!localStorageGlobal)) {

                    insertion_start_date = await ModelInsertions.max('insertion_start_date', {
                        where: {
                            campaign_id: campaign_id
                        }
                    });
                    insertion_end_date = await ModelInsertions.max('insertion_end_date', {
                        where: {
                            campaign_id: campaign_id
                        }
                    });

                    const now = new Date();
                    const timestamp_datenow = now.getTime();
                    // Déclare la date du moment  var timestamp_datenow =
                    // moment().format("DD/MM/YYYY HH:mm:ss"); recup la date de début de la campagne
                    // -4 heures pour règler le prob du décalage horaire
                    const campaign_start_date_yesterday = new Date(campaign_start_date);
                    var start_date_timezone = campaign_start_date_yesterday.setHours(-4);

                    // Teste pour récupérer la date la plus tôt si les insertions existe pour la
                    // campagne

                    if ((insertion_start_date) && (start_date_timezone > insertion_start_date)) {
                        start_date_timezone = insertion_start_date;
                    } else {
                        start_date_timezone = start_date_timezone
                    }
                    // console.log('start_date_timezone :', start_date_timezone); recup la date de
                    // fin de la campagne ajoute +1jour
                    var endDate_day = new Date(campaign_end_date);
                    var endDate_last = endDate_day.setDate(endDate_day.getDate() + 1);

                    // Teste pour récupérer la date la plus tardive si les insertions existe pour la
                    // campagne

                    if ((insertion_end_date) && (insertion_end_date > endDate_last)) {
                        endDate_last = insertion_end_date;
                    } else {
                        endDate_last = endDate_last
                    }

                    // Mettre la date de début à 00:00:00 - les minutes lancent des erreurs
                    const StartDate_timezone = moment(start_date_timezone).format(
                        'YYYY-MM-DDT00:00:00'
                    );

                    // Ajoute un jou en plus et mets les horaires à 00:00:00
                    const EndDate = moment(endDate_last)
                        .add('1', 'd')
                        .format('YYYY-MM-DDT00:00:00'); // 'YYYY-MM-DDTHH:mm:ss'

                    // si la date du jour est > à la date de fin on prend la date de fin sinon la
                    // date du jour console.log('endDate_last' + endDate_last)
                    // console.log('timestamp_datenow' + timestamp_datenow)

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
                        }, {
                            "ViewableImpressions": {}
                        }],
                        "filter": [{
                            "CampaignId": [campaign_id]
                        }]
                    }

                    // - date du jour = nbr jour Requête visitor unique On calcule le nombre de jour
                    // entre la date de fin campagne et date aujourd'hui  var date_now = Date.now();
                    var start_date = new Date(campaign_start_date);
                    var end_date_time = new Date(campaign_end_date);
                    var date_now = Date.now();
                    var diff_start = Utilities.nbr_jours(start_date, date_now);
                    var diff = Utilities.nbr_jours(start_date, end_date_time);
                    if (diff_start.day < diff.day) {
                        var NbDayCampaign = diff_start.day;
                    } else {
                        var NbDayCampaign = diff.day;
                    }

                    var requestVisitor_unique = {
                        "startDate": StartDate_timezone,
                        "endDate": end_date,
                        "fields": [{
                            "UniqueVisitors": {}
                        }],
                        "filter": [{
                            "CampaignId": [campaign_id]
                        }]
                    }

                    var dataLSTaskGlobal = localStorageTasks.getItem(
                        cacheStorageID + '-taskGlobal'
                    );

                    var dataLSTaskGlobalVU = localStorageTasks.getItem(
                        cacheStorageID + '-taskGlobalVU'
                    );

                    // firstLink - Récupére la taskID de la requête reporting
                    let firstLinkTaskId = localStorageTasks.getItem(
                        cacheStorageID + '-firstLink-' + cacheStorageIDHour
                    );

                    if (!firstLinkTaskId) {
                        let firstLink = await AxiosFunction.getReportingData(
                            'POST',
                            '',
                            requestReporting
                        );

                        console.log('firstLink : Lancement de la requête');

                        // si firstLink existe (!= de null) on save la taskId dans le localStorage sinon
                        // firstLinkTaskId = vide
                        if (firstLink) {
                            if (firstLink.status == 201) {
                                localStorageTasks.setItem(
                                    cacheStorageID + '-firstLink-' + cacheStorageIDHour,
                                    firstLink.data.taskId
                                );
                                firstLinkTaskId = firstLink.data.taskId;
                            }
                        } else {
                            firstLinkTaskId = null;
                        }
                    }

                    // twoLink - Récupére la taskID de la requête reporting
                    let twoLinkTaskId = localStorageTasks.getItem(
                        cacheStorageID + '-twoLink-' + cacheStorageIDHour
                    );

                    if ((!twoLinkTaskId) && (NbDayCampaign < 31) && (requestVisitor_unique)) {

                        let twoLink = await AxiosFunction.getReportingData(
                            'POST',
                            '',
                            requestVisitor_unique
                        );

                        // si twoLink existe (!= de null) on save la taskId dans le localStorage sinon
                        // twoLinkTaskId = vide
                        if (twoLink) {
                            if (twoLink.status == 201) {
                                localStorageTasks.setItem(
                                    cacheStorageID + '-twoLink-' + cacheStorageIDHour,
                                    twoLink.data.taskId
                                );
                                twoLinkTaskId = twoLink.data.taskId;
                            }
                        }
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

                        // 2) Requete GET boucle jusqu'a que le rapport generer 100% delais 1min on
                        // commence à 10sec
                        var time = 5000;
                        let timerFile = setInterval(async () => {

                            // console.log('setInterval begin') DATA STORAGE - TASK 1 et 2
                            var dataLSTaskGlobal = localStorageTasks.getItem(
                                cacheStorageID + '-taskGlobal'
                            );

                            var dataLSTaskGlobalVU = localStorageTasks.getItem(
                                cacheStorageID + '-taskGlobalVU'
                            );

                            // Vérifie que dataLSTaskGlobal -> existe OU (dataLSTaskGlobalVU -> existe && taskID_uu -> not null)
                            if (!dataLSTaskGlobal || (!dataLSTaskGlobalVU && !Utilities.empty(taskId_uu))) {

                                if (!dataLSTaskGlobal && !Utilities.empty(taskId)) {
                                    time += 10000;
                                    let requete_global = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`;

                                    let threeLink = await AxiosFunction.getReportingData('GET', requete_global, '');
                                    if ((threeLink.data.lastTaskInstance.jobProgress == '1.0') && (threeLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {
                                        // 3) Récupère la date de chaque requête
                                        let dataLSTaskGlobal = localStorageTasks.getItem(
                                            cacheStorageID + '-taskGlobal'
                                        );
                                        console.log('1979 : ' + cacheStorageID);
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
                                                cacheStorageID + '-taskGlobal',
                                                JSON.stringify(dataLSTaskGlobal)
                                            );

                                        }
                                    }
                                }

                                // Request task2
                                if (!dataLSTaskGlobalVU && !Utilities.empty(taskId_uu)) {
                                    // console.log('dataLSTaskGlobalVU')
                                    time += 15000;
                                    let requete_vu = `https://reporting.smartadserverapis.com/2044/reports/${taskId_uu}`;
                                    // console.log('requete_vu : ', requete_vu)

                                    let fourLink = await AxiosFunction.getReportingData('GET', requete_vu, '');

                                    // console.log('fourLink : ', fourLink.data.lastTaskInstance.jobProgress)

                                    if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (fourLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {

                                        // 3) Récupère la date de chaque requête
                                        dataLSTaskGlobalVU = localStorageTasks.getItem(
                                            cacheStorageID + '-taskGlobalVU'
                                        );
                                        console.log('1957 : ' + cacheStorageID);
                                        if (!dataLSTaskGlobalVU) {
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
                                                cacheStorageID + '-taskGlobalVU',
                                                JSON.stringify(dataLSTaskGlobalVU)
                                            );
                                            console.log('2029 : ' + cacheStorageID);
                                        }
                                    }
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
                                const ViewableImpressions = [];

                                const dataList = new Object();

                                var dataSplitGlobal = dataSplitGlobal.split(/\r?\n/);
                                if (dataSplitGlobal && (dataSplitGlobal.length > 0)) {
                                    var numberLine = dataSplitGlobal.length;

                                    // dataSplitGlobal);
                                    if (numberLine > 1) {
                                        for (i = 1; i < numberLine; i++) {
                                            // split push les données dans chaque colone
                                            line = dataSplitGlobal[i].split(';');
                                            if (!Utilities.empty(line[0])) {
                                                insertion_type = line[5];

                                                InsertionName.push(line[5]);
                                                Impressions.push(parseInt(line[10]));
                                                Clicks.push(parseInt(line[12]));
                                                Complete.push(parseInt(line[13]));
                                                ViewableImpressions.push(parseInt(line[14]));
                                                var insertions_type = line[5]

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
                                                    'click_rate': parseInt(line[11]),
                                                    'clicks': parseInt(line[12]),
                                                    'complete': parseInt(line[13])
                                                }

                                                if (insertion_type.match(/SLIDER{1}/igm)) {
                                                    dataList[i]['impressions'] = parseInt(line[14]);
                                                } else {
                                                    dataList[i]['impressions'] = parseInt(line[10]);
                                                }

                                            }
                                        }
                                    }
                                }

                                var formatObjects = new Object();
                                if (dataList && (Object.keys(dataList).length > 0)) {
                                    // Initialise les formats
                                    var formatHabillage = new Array();
                                    var formatInterstitiel = new Array();
                                    var formatInterstitielVideo = new Array();
                                    var formatGrandAngle = new Array();
                                    var formatMasthead = new Array();
                                    var formatInstream = new Array();
                                    var formatRectangle = new Array();
                                    var formatRectangleVideo = new Array();
                                    var formatLogo = new Array();
                                    var formatNative = new Array();
                                    var formatSlider = new Array();
                                    var formatMea = new Array();
                                    var formatSliderVideo = new Array();
                                    var formatClickCommand = new Array();

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
                                        if (insertion_name.match(/HABILLAGE{1}/igm)) {
                                            formatHabillage.push(index);
                                        }
                                        if (insertion_name.match(/INTERSTITIEL|INTERSTITIEL VIDEO{1}/igm)) {
                                            if (insertion_name.match(/INTERSTITIEL VIDEO{1}/igm)) {
                                                formatInterstitielVideo.push(index);
                                            } else {
                                                formatInterstitiel.push(index);

                                            }
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
                                        if (insertion_name.match(/RECTANGLE|RECTANGLE VIDEO{1}/igm)) {

                                            if (insertion_name.match(/RECTANGLE VIDEO{1}/igm)) {
                                                formatRectangleVideo.push(index);
                                            } else {
                                                formatRectangle.push(index);

                                            }
                                        }

                                        if (insertion_name.match(/LOGO{1}/igm)) {
                                            formatLogo.push(index);
                                        }
                                        if (insertion_name.match(/NATIVE{1}/igm)) {
                                            formatNative.push(index);
                                        }
                                        if (insertion_name.match(/SLIDER|SLIDER VIDEO{1}/igm)) {
                                            if (insertion_name.match(/SLIDER VIDEO{1}/igm)) {
                                                formatSliderVideo.push(index);
                                            } else {
                                                formatSlider.push(index);

                                            }

                                        }

                                        if (insertion_name.match(/^\MEA{1}/igm)) {
                                            formatMea.push(index);
                                        }

                                        if (insertion_name.match(/CLICK COMMAND{1}/igm)) {
                                            formatClickCommand.push(index);
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

                                    // Trie les formats et compatibilise les insertions et autres clics
                                    if (!Utilities.empty(formatHabillage)) {
                                        formatObjects.habillage = SmartFunction.sortDataReport(
                                            formatHabillage,
                                            dataList
                                        );
                                    }
                                    if (!Utilities.empty(formatInterstitiel)) {
                                        formatObjects.interstitiel = SmartFunction.sortDataReport(
                                            formatInterstitiel,
                                            dataList
                                        );
                                    }

                                    if (!Utilities.empty(formatInterstitielVideo)) {
                                        formatObjects.interstitielvideo = SmartFunction.sortDataReport(
                                            formatInterstitielVideo,
                                            dataList
                                        );
                                    }

                                    if (!Utilities.empty(formatMasthead)) {
                                        formatObjects.masthead = SmartFunction.sortDataReport(formatMasthead, dataList);
                                    }
                                    if (!Utilities.empty(formatGrandAngle)) {
                                        formatObjects.grandangle = SmartFunction.sortDataReport(
                                            formatGrandAngle,
                                            dataList
                                        );
                                    }
                                    if (!Utilities.empty(formatInstream)) {
                                        formatObjects.instream = SmartFunction.sortDataReport(formatInstream, dataList);
                                    }
                                    if (!Utilities.empty(formatRectangle)) {
                                        formatObjects.rectangle = SmartFunction.sortDataReport(
                                            formatRectangle,
                                            dataList
                                        );
                                    }
                                    if (!Utilities.empty(formatRectangleVideo)) {
                                        formatObjects.rectanglevideo = SmartFunction.sortDataReport(
                                            formatRectangleVideo,
                                            dataList
                                        );
                                    }
                                    if (!Utilities.empty(formatLogo)) {
                                        formatObjects.logo = SmartFunction.sortDataReport(formatLogo, dataList);
                                    }
                                    if (!Utilities.empty(formatNative)) {
                                        formatObjects.native = SmartFunction.sortDataReport(formatNative, dataList);
                                    }
                                    if (!Utilities.empty(formatSlider)) {
                                        formatObjects.slider = SmartFunction.sortDataReport(formatSlider, dataList);
                                    }
                                    if (!Utilities.empty(formatMea)) {
                                        formatObjects.mea = SmartFunction.sortDataReport(formatMea, dataList);
                                    }
                                    if (!Utilities.empty(formatSliderVideo)) {
                                        formatObjects.slidervideo = SmartFunction.sortDataReport(
                                            formatSliderVideo,
                                            dataList
                                        );
                                    }

                                    if (!Utilities.empty(formatClickCommand)) {
                                        formatObjects.clickcommand = SmartFunction.sortDataReport(
                                            formatClickCommand,
                                            dataList
                                        );
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
                                    campaignCtr = parseFloat((campaignClicks / campaignImpressions) * 100).toFixed(
                                        2
                                    );
                                } else {
                                    campaignCtr = null;
                                }
                                if (Complete.length > 0) {
                                    campaignComplete = Complete.reduce(reducer);
                                } else {
                                    campaignComplete = null;
                                }

                                if (!Utilities.empty(campaignComplete) && !Utilities.empty(campaignImpressions)) {
                                    campaignCtrComplete = parseFloat(
                                        (campaignComplete / campaignImpressions) * 100
                                    ).toFixed(2);
                                } else {
                                    campaignCtrComplete = null;
                                }

                                formatObjects.campaign = {
                                    campaign_id: campaign.campaign_id,
                                    campaign_name: campaign.campaign_name,
                                    campaign_start_date: campaign.campaign_start_date,
                                    campaign_end_date: campaign.campaign_end_date,
                                    campaign_crypt: campaign.campaign_crypt,
                                    advertiser_id: campaign.advertiser.advertiser_id,
                                    advertiser_name: campaign.advertiser.advertiser_name,
                                    impressions: campaignImpressions,
                                    clicks: campaignClicks,
                                    ctr: campaignCtr,
                                    complete: campaignComplete,
                                    ctrComplete: campaignCtrComplete
                                }

                                // Récupére les infos des VU s'il existe
                                if (!Utilities.empty(dataLSTaskGlobalVU)) {
                                    const objDefaultVU = JSON.parse(dataLSTaskGlobalVU);
                                    var dataSplitGlobalVU = objDefaultVU.datafile;

                                    var dataSplitGlobalVU = dataSplitGlobalVU.split(/\r?\n/);
                                    if (dataSplitGlobalVU) {
                                        var numberLine = dataSplitGlobalVU.length;
                                        for (i = 1; i < numberLine; i++) {
                                            // split push les données dans chaque colone
                                            line = dataSplitGlobalVU[i].split(';');
                                            if (!Utilities.empty(line[0])) {
                                                unique_visitor = parseInt(line[0]);
                                                formatObjects.campaign.vu = parseInt(unique_visitor);
                                                repetition = parseFloat((campaignImpressions / parseInt(unique_visitor))).toFixed(
                                                    2
                                                );
                                                formatObjects.campaign.repetition = repetition;
                                            }
                                        }
                                    }
                                } else {
                                    unique_visitor = 0;
                                    formatObjects.campaign.vu = parseInt(unique_visitor);
                                    repetition = 0;
                                    formatObjects.campaign.repetition = repetition;
                                }

                                formatObjects.reporting_start_date = moment().format('YYYY-MM-DD HH:m:s');
                                formatObjects.reporting_end_date = moment()
                                    .add(2, 'hours')
                                    .format('YYYY-MM-DD HH:m:s');

                                var reportingData = JSON.stringify(formatObjects);
                                // Créer le localStorage
                                localStorage.setItem(cacheStorageID, reportingData);
                                res.status(200).json(reportingData);
                            }

                        }, time);
                    }

                } else {
                    //   res.status(404).json({'message': 'La task globale n\'existe pas.'});
                    // Si le localStorage exsite -> affiche la data du localstorage Convertie la
                    // date JSON en objet
                    var reportingData = JSON.parse(localStorageAll);
                    res.status(200).json(reportingData);
                }


            });

    } catch (error) {
        var statusCoded = error.response;

        res.render("error.ejs", {
            statusCoded: statusCoded
        })

    }
}