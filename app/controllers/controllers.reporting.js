// Initialise le module
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('data/reporting');
localStorageTasks = new LocalStorage('data/taskID');
const excel = require('node-excel-export');


const {Op, and} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

const {QueryTypes} = require('sequelize');
const moment = require('moment');
moment.locale('fr');
const {check, query} = require('express-validator');

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

exports.index = async (req, res) => {
    if (req.session.user.user_role == 1) {
        res.render("reporting/dasbord_report.ejs");
    }
}


/*

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
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
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

            const nombre_diff_day = diff
                .day


                
                res
                .render("report/generate.ejs", {
                    advertiserid: campaign.advertiser_id,
                    campaignid: campaign.campaign_id,
                    campaigncrypt: campaign.campaign_crypt,
                    campaign: campaign,
                    timestamp_startdate: timestamp_startdate,
                    date_now: date_now,
                    moment: moment,
                    nombre_diff_day: nombre_diff_day
                });

        });
}
*/

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
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
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

            const nombre_diff_day = diff
                .day
            
            var campaignid = campaign.campaign_id;

                // Affiche le dernier rapport existant
                var reportingDataStorage = localStorage.getItem('campaignID-' + campaignid);
                
                if(reportingDataStorage) {
                   var reportingData = JSON.parse(reportingDataStorage);
                
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
                    res
                    .render("report/generate.ejs", {
                        advertiserid: campaign.advertiser_id,
                        campaignid: campaignid,
                        campaigncrypt: campaign.campaign_crypt,
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
                include: [
                    {
                        model: ModelAdvertisers
                    }
                ]
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
                        //
                        
                        var data_localStorage = localStorage.getItem('campaignID-' + campaignid);
                        /*
                        // Supprimer le cache si on force la regénération du rapport
                        let mode = req.query.mode;                       
                        if(mode) {
                            console.log('Force le recalcul de la génartion du rapport');
                            localStorage.removeItem('campaignID-' + campaignid);
                            // Supprime les tasks IDs
                            localStorageTasks.removeItem('campaignID-' + campaignid + '-taskGlobal');
                            localStorageTasks.removeItem('campaignID-' + campaignid + '-taskGlobalVU');
                        }
                        */

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
                               localStorage.removeItem('campaignID-' + campaignid);
                               console.log('Supprime le localStorage de la task general')
                                // Supprime les tasks IDs
                                localStorageTasks.removeItem(
                                    'campaignID-' + campaignid + '-taskGlobal'
                                );
                                localStorageTasks.removeItem(
                                    'campaignID-' + campaignid + '-taskGlobalVU'
                                );
                                res.redirect('/r/'+campaign_crypt);
                            }

                            if (reporting_requete_date < reporting_end_date) {
                                res.render('report/template.ejs', {
                                    reporting: reportingData,
                                    moment: moment,
                                    utilities: Utilities
                                });
                            }

                            // campaign_end_date > reporting_start_date

                        } else {
                            // génération de rapport si aucune de ses conditions n'est correct
                            // - La campagne n'est pas terminée
                            if (reporting_requete_date < campaign_end_date) {
                                // si le local storage expire; on supprime les precedents cache et les taskid
                                localStorage.removeItem('campaignID-' + campaignid);
                                localStorageTasks.removeItem(
                                    'campaignID-' + campaignid + '-taskGlobal'
                                );
                                localStorageTasks.removeItem(
                                    'campaignID-' + campaignid + '-taskGlobalVU'
                                );

                                res.redirect('/r/'+campaign_crypt);
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
                                campaign_id: campaignid
                            }
                        });
                        insertion_end_date = await ModelInsertions.max('insertion_end_date', {
                            where: {
                                campaign_id: campaignid
                            }
                        });
                       // console.log('insertion_start_date : ', insertion_start_date);

                      //  console.log('insertion_end_date : ', insertion_end_date);

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
                        const EndDate = moment(endDate_last).add('1','d').format('YYYY-MM-DDT00:00:00'); // 'YYYY-MM-DDTHH:mm:ss'

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
                            "fields": [
                                {
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
                                }
                            ],
                            "filter": [
                                {
                                    "CampaignId": [campaignid]
                                }
                            ]
                        }

                        //console.log('REQUEST GLOBAL : ', requestReporting)

                        // - date du jour = nbr jour Requête visitor unique On calcule le nombre de jour
                        // entre la date de fin campagne et date aujourd'hui  var date_now = Date.now();
                        var start_date = new Date(campaign_start_date);
                        var end_date_time = new Date(campaign_end_date);
                        var date_now = Date.now();
                        var diff_start = Utilities.nbr_jours(start_date, date_now);
                        var diff = Utilities.nbr_jours(start_date, end_date_time);                        
                        if(diff_start.day < diff.day) { var NbDayCampaign = diff_start.day; } else { var NbDayCampaign = diff.day; }

                        console.log(
                            'campaign_id : ',
                            campaignid, ' - ',
                            'diff_start.day : ',
                            diff_start.day,
                            ' - diff.day : ',
                            diff.day,
                            ' - endate : ',
                            end_date_time,
                            'NbDayCampaign : ',NbDayCampaign
                        )

                         console.log(
                            'campaign_id : ', campaignid, ' - ',
                            "startDate : ", StartDate_timezone, ' - ',
                            "endDate : " ,end_date,
                        )

                        var requestVisitor_unique = {
                            "startDate": StartDate_timezone,
                            "endDate": end_date,
                            "fields": [
                                {
                                    "UniqueVisitors": {}
                                }
                            ],
                            "filter": [
                                {
                                    "CampaignId": [campaignid]
                                }
                            ]
                        }

                       // console.log('requestVisitor_unique.startDate : ',requestVisitor_unique.startDate);
                      //  console.log('requestVisitor_unique.endDate : ',requestVisitor_unique.endDate);

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

                        //console.log( 'campaignID-' + campaignid + '-firstLink-' + cacheStorageIDHour)

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
                               //---- console.log('firstLink : ',firstLink)

                                if (firstLink.status == 201) {
                                    localStorageTasks.setItem(
                                        'campaignID-' + campaignid + '-firstLink-' + cacheStorageIDHour,
                                        firstLink.data.taskId
                                    );
                                    firstLinkTaskId = firstLink.data.taskId;
                                    //console.log('firstLink.data.taskId : ',firstLink.data.taskId)
                                }
                            } else {
                                firstLinkTaskId = null;
                            }
                        } else {
                            firstLinkTaskId = null;
                        }

                        // twoLink - Récupére la taskID de la requête reporting
                        let twoLinkTaskId = localStorageTasks.getItem(
                            'campaignID-' + campaignid + '-twoLink-' + cacheStorageIDHour
                        );

                        //console.log('twoLinkTaskId : ',twoLinkTaskId);

                        if ((!twoLinkTaskId) && (NbDayCampaign < 31) && (requestVisitor_unique)) {
                            //console.log('twoLinkTaskId :', twoLinkTaskId)
                           // console.log('requestVisitor_unique :', requestVisitor_unique)

                            let twoLink = await AxiosFunction.getReportingData(
                                'POST',
                                '',
                                requestVisitor_unique
                            );

                            // si twoLink existe (!= de null) on save la taskId dans le localStorage sinon twoLinkTaskId = vide
                            if (twoLink) {
                                if (twoLink.status == 201) {
                                    localStorageTasks.setItem(
                                        'campaignID-' + campaignid + '-twoLink-' + cacheStorageIDHour,
                                        twoLink.data.taskId
                                    );
                                    twoLinkTaskId = twoLink.data.taskId;
                                }
                            } else {
                                twoLinkTaskId = null
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
                                    'campaignID-' + campaignid + '-taskGlobal'
                                );

                                var dataLSTaskGlobalVU = localStorageTasks.getItem(
                                    'campaignID-' + campaignid + '-taskGlobalVU'
                                );

                                // Vérifie que dataLSTaskGlobal -> existe OU (dataLSTaskGlobalVU -> existe &&
                                // taskID_uu -> not null)
                                if (!dataLSTaskGlobal || (!dataLSTaskGlobalVU && !Utilities.empty(taskId_uu))) {
                                    //  console.log('!dataLSTaskGlobal || !dataLSTaskGlobalVU')

                                    if (!dataLSTaskGlobal && !Utilities.empty(taskId)) {
                                        //   console.log('dataLSTaskGlobal')
                                        time += 10000;
                                        let requete_global = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`;

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
                                               // console.log('Creation de dataLSTaskGlobal');
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
                                                'campaignID-' + campaignid + '-taskGlobalVU'
                                            );
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
                                                    'campaignID-' + campaignid + '-taskGlobalVU',
                                                    JSON.stringify(dataLSTaskGlobalVU)
                                                );
                                                // console.log('Creation de dataLSTaskGlobalVU');
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
                                        //console.log('numberLine :', numberLine);
                                        //console.log('dataSplitGlobal :', dataSplitGlobal);
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
                                                       // 'impressions': parseInt(line[10]),
                                                        'click_rate': parseInt(line[11]),
                                                        'clicks': parseInt(line[12]),
                                                        'complete': parseInt(line[13]),
                                                       // 'viewable_impressions': parseInt(line[14])
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
                                        var formatGrandAngle = new Array();
                                        var formatMasthead = new Array();
                                        var formatInstream = new Array();
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

                                  /*  if (ViewableImpressions.length > 0) {
                                        campaignViewableImpressions = ViewableImpressions.reduce(reducer);
                                    } else {
                                        campaignViewableImpressions = null;
                                    }*/

                                    if (!Utilities.empty(campaignComplete) && !Utilities.empty(campaignImpressions)) {
                                        campaignCtrComplete = parseFloat(
                                            (campaignComplete / campaignImpressions) * 100
                                        ).toFixed(2);
                                    } else {
                                        campaignCtrComplete = null;
                                    }

                                    // si il y a le slider et d'autre format on fait la somme des 2 (impression
                                    // total + viewable impression) et le CTR sur la somme des 2
                                  /*  if ((!Utilities.empty(formatSlider) && !Utilities.empty(formatHabillage)) || (!Utilities.empty(formatSlider) && !Utilities.empty(formatInterstitiel)) || (!Utilities.empty(formatSlider) && !Utilities.empty(formatGrandAngle)) || (!Utilities.empty(formatSlider) && !Utilities.empty(formatMasthead)) || (!Utilities.empty(formatSlider) && !Utilities.empty(formatInstream)) || (!Utilities.empty(formatSlider) && !Utilities.empty(formatRectangleVideo))) {
                                        campaignImpressions_Viewable = campaignImpressions +
                                                campaignViewableImpressions
                                       
                                        campaignCtrImpressions_Viewable = parseFloat(
                                            (campaignClicks / campaignImpressions_Viewable) * 100
                                        ).toFixed(2);
                                    } else {
                                        campaignImpressions_Viewable = null;
                                        campaignCtrImpressions_Viewable = null
                                    }*/

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
                                        ctrComplete: campaignCtrComplete,
                                        //viewable_impressions: campaignViewableImpressions,
                                       // viewable_impressions_sum: campaignImpressions_Viewable,
                                       // ctr_viewable_impressions: campaignCtrImpressions_Viewable
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

                                    formatObjects.reporting_start_date = moment().format('YYYY-MM-DD HH:m:s');
                                    formatObjects.reporting_end_date = moment()
                                        .add(2, 'hours')
                                        .format('YYYY-MM-DD HH:m:s');

                                    // Supprimer le localStorage précédent
                                    if(localStorage.getItem('campaignID-' + campaignid)) { localStorage.removeItem('campaignID-' + campaignid); }

                                    // Créer le localStorage
                                    localStorage.setItem('campaignID-' + campaignid, JSON.stringify(formatObjects));
                                    res.redirect('/r/'+campaign_crypt);


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

                // Affiche le json campaign res.json(formatObjects);
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
                    // campaign_id: req.params.campaignid, advertiser_id: req.params.advertiserid

                    campaign_crypt: campaigncrypt

                },
                include: [
                    {
                        model: ModelAdvertisers
                    }
                ]
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
                console.log(campaignid)


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

                var reporting = JSON.parse(data_localStorage);

                console.log(reporting)


                var reporting_requete_date = moment().format('YYYY-MM-DD HH:mm:ss');
                var reporting_start_date = reporting.reporting_start_date;
                var reporting_end_date = reporting.reporting_end_date;

                var campaign_end_date = reporting.campaign.campaign_end_date;
                var campaign_start_date = reporting.campaign.campaign_start_date;
                var campaign_name = reporting.campaign.campaign_name;
                var advertiser_name = reporting.campaign.advertiser_name;
            

                var impressions = reporting.campaign.impressions;
                var clicks = reporting.campaign.clicks;
                var ctr = reporting.campaign.ctr;
                var vu = reporting.campaign.vu;
                var repetition = reporting.campaign.repetition;
                var complete = reporting.campaign.ctrComplete;

                var interstitiel = reporting.interstitiel;
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
                    [
                        {
                            value: 'Rapport de la campagne : ' + campaign_name,
                            style: styles.headerDark
                        }

                    ],
                    ['Annonceur : ' + advertiser_name],
                    ['Campagne  : ' + campaign_name],

                    ['Date de génération : ' + reporting_start_date],
                    ['Période de diffusion : Du ' + campaign_start_date + ' au ' + campaign_end_date],
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

                            return (value === "TOTAL")
                                ? styles.cellTotal
                                : styles.cellNone // <- Inline cell style is possible
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

              /*  const bilan_sites = {
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
*/
                // The data set should have the following shape (Array of Objects) The order of
                // the keys is irrelevant, it is also irrelevant if the dataset contains more
                // fields as the report is build based on the specification provided above. But
                // you should have all the fields that are listed in the report specification
                const dataset_global = [
                    {
                        impressions: impressions,
                        clics: clicks,
                        ctr_clics: ctr,
                        vu: vu,
                        repetions: repetition

                    }
                ];
              const dataset_format = []

              /* if (interstitiel !== '0') {
                    dataset_format[0] = {
                        Formats: 'INTERSTITIEL',
                        Impressions: reporting.interstitiel.impressions,
                        Clics: reporting.interstitiel.clics,
                        Ctr_clics: reporting.interstitiel.ctr
                    }
                }*/

                if (habillage !== '0') {
                    dataset_format[1] = {

                        Formats: 'HABILLAGE',
                        Impressions: reporting.habillage.impressions,
                        Clics: reporting.habillage.clicks,
                        Ctr_clics: reporting.habillage.ctr
                    }
                }
               /* if (masthead !== '0') {
                    dataset_format[2] = {

                        Formats: 'MASTHEAD',
                        Impressions: reporting.masthead.impressions,
                        Clics: reporting.masthead.clicks,
                        Ctr_clics: reporting.masthead.ctr
                    }
                }*/

                if (grandangle !== '0') {
                    dataset_format[3] = {

                        Formats: 'GRAND ANGLE',
                        Impressions: reporting.grandangle.impressions,
                        Clics: reporting.grandangle.clicks,
                        Ctr_clics: reporting.grandangle.ctr

                    }
                }
/*
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
                }*/

/*
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

                }*/
                // Define an array of merges. 1-1 = A:1 The merges are independent of the data.
                // A merge will overwrite all data _not_ in the top-left cell.
                const merges = [
                    {
                        start: {
                            row: 1,
                            column: 1
                        },
                        end: {
                            row: 1,
                            column: 5
                        }
                    }
                ];

                // Create the excel report. This function will return Buffer
                const report = excel.buildExport([
                    { // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
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
                    }, /*{
                        name: 'Sites',
                        // heading : headingsites,
                        specification: bilan_sites, // <- Report specification
                        data: dataset_site // <-- Report data
                    }*/
                ]);

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