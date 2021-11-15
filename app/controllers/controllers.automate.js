// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);
var crypto = require('crypto');
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
const moment = require('moment');
const {
    check,
    query
} = require('express-validator');

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const SmartFunction = require("../functions/functions.smartadserver.api");
const Utilities = require("../functions/functions.utilities");

// Initialise les models const ModelSite = require("../models/models.sites");
const ModelAgencies = require("../models/models.agencies");
const ModelFormats = require("../models/models.formats");
const ModelFormatsGroupsTypes = require(
    "../models/models.formats_groups_types"
);
const ModelFormatsGroups = require("../models/models.formats_groups");
const ModelCampaigns = require("../models/models.campaigns");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelSites = require("../models/models.sites");
const ModelTemplates = require("../models/models.templates");
const ModelPlatforms = require("../models/models.platforms");
const ModelDeliverytypes = require("../models/models.deliverytypes");
const ModelInsertionsStatus = require("../models/models.insertions_status");

const ModelCountries = require("../models/models.countries");
const ModelInsertions = require("../models/models.insertions");
const ModelInsertionsPriorities = require(
    "../models/models.insertions_priorities"
);
const ModelInsertionsTemplates = require(
    "../models/models.insertions_templates"
);
const ModelCreatives = require("../models/models.creatives");

const ModelEpilotCampaigns = require("../models/models.epilot_campaigns");
const ModelEpilotInsertions = require("../models/models.epilot_insertions");

const ModelUsers = require("../models/models.users");
const ModelPacks_Smart = require("../models/models.packs_smart");

const {
    resolve
} = require('path');
const {
    cpuUsage
} = require('process');

// Initialise le module
var LocalStorage = require('node-localstorage').LocalStorage;
// localStorage = new LocalStorage('data/reporting/'+moment().format('YYYY/MM/DD'));
// localStorageTasks = new LocalStorage('data/taskID/'+moment().format('YYYY/MM/DD/H'));
// localStorageAutomate = new LocalStorage('data/automate/'+moment().format('YYYY/MM/DD'));
localStorage = new LocalStorage('data/reporting/');
localStorageTasks = new LocalStorage('data/taskID/');
localStorageAutomate = new LocalStorage('data/automate/');

exports.agencies = async (req, res) => {
    try {
        var config = SmartFunction.config('agencies');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round((number_total_count / 100) + 1);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page <= number_pages; page++) {
                    let offset = page * 100;
                    var config2 = SmartFunction.config('agencies', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {
                            console.log(dataValue);

                            var agency_id = dataValue[i].id;
                            var agency_name = dataValue[i].name;
                            var agency_archived = dataValue[i].isArchived;

                            const agencies = ModelAgencies.create({
                                agency_id,
                                agency_name,
                                agency_archived
                            });
                        }

                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);
    }
}

exports.advertisers = async (req, res) => {
    try {
        var config = SmartFunction.config('advertisers');
        var nbr_add = new Array()
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round((number_total_count / 100));
            console.log(number_total_count);
            nbr_add.push(number_total_count)
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page <= (number_pages - 1); page++) {
                    let offset = page * 100;
                    var params = {
                        limit: 100,
                        offset: offset
                    }
                    console.log('params.offset ' + params.offset)
                    console.log('params.limit ' + params.limit)

                    var config2 = SmartFunction.config('advertisers', params);
                    await axios(config2).then(function (response) {
                        if (!Utilities.empty(response.data)) {

                            console.log(dataValue)
                            var dataValue = response.data;
                            var number_line_offset = dataValue.length;


                            Utilities
                                .updateOrCreate(ModelAdvertisers, {
                                    advertiser_id: advertiser_id
                                }, {
                                    advertiser_id,
                                    advertiser_name,
                                    advertiser_archived,
                                    agency_id
                                })
                                .then(function (result) {
                                    //  console.log(result['created']='true')

                                    for (i = 0; i < number_line_offset; i++) {
                                        var advertiser_id = dataValue[i].id;
                                        var advertiser_name = dataValue[i].name;
                                        var advertiser_archived = dataValue[i].isArchived;
                                        var agency_id = dataValue[i].agencyIds



                                        // console.log(dataValue);

                                        Utilities
                                            .updateOrCreate(ModelAdvertisers, {
                                                advertiser_id: advertiser_id
                                            }, {
                                                advertiser_id,
                                                advertiser_name,
                                                advertiser_archived,
                                                agency_id
                                            })
                                            .then(function (result) {
                                                //  console.log(result['created']='true')

                                                result.item; // the model
                                                result.created; // bool, if a new item was created.
                                            });

                                        /*
                                        const advertiserDb = ModelFormats.findByPk(advertiser_id);
                                        if (advertiserDb === null) {
                                          console.log('Not found!');
                                          const advertiser = ModelFormats.create({advertiser_id, advertiser_name});
                                        } else {
                                          console.log('Else : '+advertiserDb instanceof ModelFormats); // true
                                          // Its primary key is 123
                                        }
                                        */
                                    }

                                })

                        }
                    })
                }

            }
            addItem();

        });

        res.json('La liste des annonceurs a été mise à jour (total : ' + nbr_add + ')');

    } catch (error) {
        console.error('Error : ' + error);
    }
}

exports.advertiser = async (req, res) => {
    try {
        let advertiser_id = req.query.advertiser_id;
        console.log(advertiser_id)

        if (advertiser_id) {
            advertiserObject = {
                "advertiser_id": req.query.advertiser_id
            };
            var config = SmartFunction.config('advertiser', advertiserObject);

            await axios(config).then(function (result) {

                if (!Utilities.empty(result.data)) {
                    var dataValue = result.data;
                    var advertiser_id = dataValue.id;
                    var advertiser_name = dataValue.name;
                    var advertiser_archived = dataValue.isArchived;
                    // var agency_id = dataValue.agencyIds
                    // console.log(dataValue)


                    Utilities
                        .updateOrCreate(ModelAdvertisers, {
                            advertiser_id: advertiser_id
                        }, {
                            advertiser_id,
                            advertiser_name,
                            advertiser_archived,
                            // agency_id
                            advertiser_archived
                        })
                        .then(function (result) {
                            result.item; // the model
                            result.created; // bool, if a new item was created.
                            res.redirect(`/manager/advertisers/${advertiser_id}`)
                            /*return res.json({
                                type: 'success',
                                message: 'L\'annonceur <strong>' + advertiser_id + '</strong> a bien été ajouté.'
                            });*/
                        });
                }

            });

        } else {
            return res.json({
                type: 'error',
                message: 'Veuillez saisir l\'identifiant de l\'annonceur.'
            });
        }
    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }
}

exports.advertisersCampaigns = async (req, res) => {
    try {
        let advertiser_id = req.query.advertiser_id;

        if (advertiser_id) {
            advertiserObject = {
                "advertiser_id": req.query.advertiser_id
            };
            var config = SmartFunction.config('advertisersCampaigns', advertiserObject);

            await axios(config).then(function (result) {
                if (!Utilities.empty(result.data)) {
                    var dataValue = result.data;
                    //  console.log(dataValue);

                    var number_line_offset = dataValue.length;
                    if (number_line_offset >= 0) {
                        for (i = 0; i < number_line_offset; i++) {

                            var campaign_id = dataValue[i].id;
                            var campaign_name = dataValue[i].name;
                            var advertiser_id = dataValue[i].advertiserId;
                            var agency_id = dataValue[i].agencyId;
                            var campaign_start_date = dataValue[i].startDate;
                            var campaign_end_date = dataValue[i].endDate;
                            var campaign_status_id = dataValue[i].campaignStatusId;
                            var campaign_archived = dataValue[i].isArchived;

                            var campaign_crypt = crypto
                                .createHash('md5')
                                .update(campaign_id.toString())
                                .digest("hex");

                            // console.log(campaign_crypt)

                            Utilities
                                .updateOrCreate(ModelCampaigns, {
                                    campaign_id: campaign_id
                                }, {
                                    campaign_id,
                                    campaign_name,
                                    campaign_crypt,
                                    advertiser_id,
                                    agency_id,
                                    campaign_start_date,
                                    campaign_end_date,
                                    campaign_status_id,
                                    campaign_archived
                                })
                                .then(function (result) {
                                    result.item; // the model
                                    result.created; // bool, if a new item was created.
                                });

                        }

                        return res.json({
                            type: 'success',
                            message: 'Les <strong>' + number_line_offset + '</strong> campagnes de l\'annonceur <str' +
                                'ong>' + advertiser_id + '</strong> ont bien été ajoutées.'
                        });

                    }
                } else {
                    return res.json({
                        type: 'error',
                        message: 'Error : Aucune donnée disponible'
                    });
                }
            });

        } else {
            return res.json({
                type: 'error',
                message: 'Veuillez saisir l\'identifiant de l\'annonceur.'
            });
        }
    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }

}

exports.campaigns = async (req, res) => {
    try {
        console.log("SmartFunction.config('campaigns')")
        var config = SmartFunction.config('campaigns');

        var nbr_add = new Array()
        await axios(config).then(function (res) {

            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round((number_total_count / 100)); //+1
            console.log(number_total_count);
            nbr_add.push(number_total_count);

            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page <= (number_pages - 1); page++) {
                    let offset = page * 100;

                    var params = {
                        limit: 100,
                        offset: offset
                    }

                    console.log('params.offset ' + params.offset)
                    console.log('params.limit ' + params.limit)

                    console.log("2 SmartFunction.config('campaigns')")
                    var config2 = SmartFunction.config('campaigns', params);
                    await axios(config2).then(function (res) {
                        if (!Utilities.empty(res.data)) {
                            var dataValue = res.data;
                            var number_line_offset = dataValue.length;

                            // var number_line2 = dataValue.length;
                            var number_total_count2 = res.headers['x-pagination-total-count'];
                            var number_pages2 = Math.round((number_total_count2 / 100)); // + 1
                            // console.log(number_total_count2);
                            console.log(
                                'Number Pages : ',
                                number_pages2,
                                ' - number_total_count2 : ',
                                number_total_count2,
                                ' - number_line_offset : ',
                                number_line_offset,
                                ' - page : ',
                                page
                            )

                            if (number_line_offset >= 0) {
                                for (i = 0; i < number_line_offset; i++) {
                                    var campaign_id = dataValue[i].id;
                                    console.log(i, '. Campaign_id : ', campaign_id)

                                    var campaign_name = dataValue[i].name;
                                    var advertiser_id = dataValue[i].advertiserId;
                                    var agency_id = dataValue[i].agencyId;
                                    var campaign_start_date = dataValue[i].startDate;
                                    var campaign_end_date = dataValue[i].endDate;
                                    var campaign_status_id = dataValue[i].campaignStatusId;
                                    var campaign_archived = dataValue[i].isArchived;

                                    var campaign_crypt = crypto
                                        .createHash('md5')
                                        .update(campaign_id.toString())
                                        .digest("hex");

                                    // console.log(campaign_crypt)

                                    Utilities
                                        .updateOrCreate(ModelCampaigns, {
                                            campaign_id: campaign_id
                                        }, {
                                            campaign_id,
                                            campaign_name,
                                            campaign_crypt,
                                            advertiser_id,
                                            agency_id,
                                            campaign_start_date,
                                            campaign_end_date,
                                            campaign_status_id,
                                            campaign_archived
                                        })
                                        .then(function (result) {

                                            result.item; // the model
                                            result.created; // bool, if a new item was created.

                                        });
                                }
                            }
                        } else {
                            console.error('Error : Aucune donnée disponible');
                        }

                    })
                }

            }
            addItem();

            // return false; res.status(201).send('Les campagnes ont bien été ajoutées')
            // return res.json(     {type: 'success', message: 'Les campagnes ont bien été
            // ajoutées.'} );

        });

        res.json('La liste des campagnes a été mise à jour (total : ' + nbr_add + ')');

    } catch (error) {
        console.error('Error : ' + error);
    }
}

exports.campaign = async (req, res) => {
    try {
        let campaign_id = req.query.campaign_id;


        if (campaign_id) {
            campaignObject = {
                "campaign_id": req.query.campaign_id
            };
            console.log("campaign_id  " + campaign_id)

            var config = SmartFunction.config('campaign', campaignObject);

            await axios(config).then(async function (result) {

                if (!Utilities.empty(result.data)) {
                    var dataValue = result.data;


                    var campaign_id = dataValue.id;
                    var campaign_name = dataValue.name;
                    var advertiser_id = dataValue.advertiserId;
                    var agency_id = dataValue.agencyId;
                    var campaign_start_date = dataValue.startDate;
                    var campaign_end_date = dataValue.endDate;
                    var campaign_status_id = dataValue.campaignStatusId;
                    var campaign_archived = dataValue.isArchived;

                    var campaign_crypt = crypto
                        .createHash('md5')
                        .update(campaign_id.toString())
                        .digest("hex");

                    Utilities
                        .updateOrCreate(ModelCampaigns, {
                            campaign_id: campaign_id
                        }, {
                            campaign_id,
                            campaign_name,
                            campaign_crypt,
                            advertiser_id,
                            agency_id,
                            campaign_start_date,
                            campaign_end_date,
                            campaign_status_id,
                            campaign_archived
                        })
                        .then(function (result) {
                            result.item; // the model
                            result.created; // bool, if a new item was created.

                            res.redirect(`/manager/campaigns/${campaign_id}`)
                        });






                }

            });

        } else {
            return res.json({
                type: 'error',
                message: 'Veuillez saisir l\'identifiant de la campagne.'
            });
        }
    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }
}

exports.campaignReport = async (req, res) => {
    try {
        let campaign_id = req.query.campaign_id;
        if (campaign_id) {
            campaignObject = {
                "campaign_id": req.query.campaign_id
            };

            var campaign = await ModelCampaigns
                .findOne({
                    where: {
                        campaign_id: campaign_id
                    },
                    include: [{
                        model: ModelAdvertisers
                    }]
                })
                .then(async function (campaign) {
                    if (!campaign) {
                        return res.json({
                            type: 'error',
                            message: 'Cette campagne n\'existe pas.'
                        });
                    }

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
                    let cacheStorageIDHour = moment().format('YYYYMMDD-HH');
                    try {
                        var data_localStorage = localStorage.getItem('campaignID-' + campaignid);
                        // Si le localStorage existe -> affiche la data du localstorage
                        if (data_localStorage) {
                            var data_localStorage = localStorage.getItem('campaignID-' + campaignid);

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
                                    localStorageTasks.removeItem(
                                        'campaignID-' + campaignid + '-taskGlobal'
                                    );
                                    localStorageTasks.removeItem(
                                        'campaignID-' + campaignid + '-taskGlobalVU'
                                    );
                                    res.redirect('/r/${campaigncrypt}');
                                }

                                if (reporting_requete_date < reporting_end_date) {
                                    return res.json({
                                        type: 'success',
                                        message: 'Le rapport de campagne a été généré'
                                    });

                                }

                                // campaign_end_date > reporting_start_date

                            } else {
                                // console.log('Supprime et relance la génération du rapport') On relance la
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

                                    // res.redirect('/r/${campaigncrypt}');
                                } else {

                                    return res.json({
                                        type: 'success',
                                        message: 'Le rapport de campagne a été généré'
                                    });

                                }

                            }

                        } else {
                            // console.log('data_localStorage no existe'); Récupére les dates des insertions
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

                            const now = new Date();
                            const timestamp_datenow = now.getTime();
                            // Déclare la date du moment  var timestamp_datenow =
                            // moment().format("DD/MM/YYYY HH:mm:ss"); recup la date de début de la campagne
                            // -4 heures pour règler le prob du décalage horaire
                            const campaign_start_date_yesterday = new Date(campaign_start_date);
                            var start_date_timezone = campaign_start_date_yesterday.setHours(-4);

                            // Teste pour récupérer la date la plus tôt
                            if (start_date_timezone > insertion_start_date) {
                                start_date_timezone = insertion_start_date;
                            }
                            // console.log('start_date_timezone :', start_date_timezone); recup la date de
                            // fin de la campagne ajoute +1jour
                            var endDate_day = new Date(campaign_end_date);
                            var endDate_last = endDate_day.setDate(endDate_day.getDate() + 1);
                            if (insertion_end_date > endDate_last) {
                                endDate_last = insertion_end_date;
                            }

                            const StartDate_timezone = moment(start_date_timezone).format(
                                'YYYY-MM-DDTHH:mm:ss'
                            );
                            const EndDate = moment(endDate_last).format('YYYY-MM-DDTHH:mm:ss');

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
                                }],
                                "filter": [{
                                    "CampaignId": [campaignid]
                                }]
                            }

                            // - date du jour = nbr jour Requête visitor unique On calcule le nombre de jour
                            // entre la date de fin campagne et date aujourd'hui  var date_now = Date.now();
                            var start_date = new Date(campaign_start_date);
                            var end_date_time = new Date(campaign_end_date);
                            var date_now = Date.now();
                            var diff_start = Utilities.nbr_jours(start_date, date_now);
                            var diff = Utilities.nbr_jours(start_date, end_date_time);

                            console.log(
                                'diff_start.day :',
                                diff_start.day,
                                ' - diff.day :',
                                diff.day,
                                ' - endate : ',
                                end_date_time
                            )

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

                            console.log(requestVisitor_unique.startDate)
                            console.log(requestVisitor_unique.endDate)

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

                            if (!twoLinkTaskId && (diff.day < 31)) {
                                console.log('twoLinkTaskId :', twoLinkTaskId)

                                console.log('requestVisitor_unique :', requestVisitor_unique)

                                let twoLink = await AxiosFunction.getReportingData(
                                    'POST',
                                    '',
                                    requestVisitor_unique
                                );
                                if (twoLink.status == 201) {
                                    localStorageTasks.setItem(
                                        'campaignID-' + campaignid + '-twoLink-' + cacheStorageIDHour,
                                        twoLink.data.taskId
                                    );
                                    twoLinkTaskId = twoLink.data.taskId;
                                } else {
                                    console.log("NOOOON OK")
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
                                                    //console.log('Creation de dataLSTaskGlobal');
                                                }
                                            }
                                        }

                                        // Request task2
                                        if (!dataLSTaskGlobalVU && !Utilities.empty(taskId_uu)) {
                                            // console.log('dataLSTaskGlobalVU')
                                            time += 5000;
                                            let requete_vu = `https://reporting.smartadserverapis.com/2044/reports/${taskId_uu}`;
                                            // console.log('requete_vu : ', requete_vu)

                                            let fourLink = await AxiosFunction.getReportingData('GET', requete_vu, '');

                                            // console.log('fourLink : ', fourLink)

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

                                        /*--- if (dataLSTaskGlobal && dataLSTaskGlobalVU) {
                                        //console.log('Creation de clearInterval(timerFile)');
                                    }*/

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
                                                console.log(insertion_name);

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
                                        }

                                        formatObjects.reporting_start_date = moment().format('YYYY-MM-DD HH:m:s');
                                        formatObjects.reporting_end_date = moment()
                                            .add(2, 'hours')
                                            .format('YYYY-MM-DD HH:m:s');

                                        localStorage.setItem('campaignID-' + campaignid, JSON.stringify(formatObjects));

                                        return res.json({
                                            type: 'success',
                                            message: 'Le rapport de campagne a été généré'
                                        });

                                    }

                                }, time);
                            }
                        }

                    } catch (error) {
                        return res.json({
                            type: 'error',
                            message: 'Un probléme est survenu sur cette campagne'
                        });
                    }
                });

        } else {
            return res.json({
                type: 'error',
                message: 'Veuillez saisir l\'identifiant de la campagne.'
            });
        }
    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }
}

exports.campaignsDays = async (req, res) => {
    // 1 - Charge la requête pour récupérer les campagnes du jour (+ Annonceur)
    let dateYesterday = moment()
        .subtract(1, 'days')
        .format('YYYY-MM-DD') + 'T00:00:00';
    let dateToday = moment().format('YYYY-MM-DD') + 'T00:00:00';
    let cacheStorageID = 'campaignsToday-' + moment().format('YYYYMMDD');

    // Initialise les valeurs
    var campaignsIds = new Array();
    var campaignsName = new Array();
    var campaignsStartDate = new Array();
    var campaignsEndDate = new Array();

    var campaignsIdsBdd = new Array();
    var advertisersIds = new Array();
    var advertisersIdsBdd = new Array();

    // Récupére l'ensemble des annonceurs dans la bdd
    var advertisersList = await ModelAdvertisers.findAll({
        attributes: ['advertiser_id']
    });
    if (advertisersList) {
        var linesAdvertisers = advertisersList.length;
        // Boucle sur les lignes
        for (a = 1; a < linesAdvertisers; a++) {
            advertisersIdsBdd.push(advertisersList[a].advertiser_id);
        }
    }

    // Récupére l'ensemble des campagnes dans la bdd
    var campaignsList = await ModelCampaigns.findAll({
        attributes: ['campaign_id']
    });
    if (campaignsList) {
        var linescampaigns = campaignsList.length;
        // Boucle sur les lignes
        for (a = 1; a < linescampaigns; a++) {
            campaignsIdsBdd.push(campaignsList[a].campaign_id);
        }
    }

    // récupére la task Campaigns Days
    var taskCampaignsDays = localStorageAutomate.getItem(cacheStorageID);

    if (!taskCampaignsDays) {
        // Requête sur les campagnes
        var requestCampaignToday = {
            "startDate": dateYesterday,
            "endDate": dateToday,
            "fields": [{
                "AdvertiserId": {}
            }, {
                "AdvertiserName": {}
            }, {
                "CampaignId": {}
            }, {
                "CampaignName": {}
            }, {
                "CampaignStartDate": {}
            }, {
                "CampaignEndDate": {}
            }, {
                "Impressions": {}
            }]
        }
        console.log('Request :', requestCampaignToday);
        let link = await AxiosFunction
            .getReportingData(
                'POST',
                '',
                requestCampaignToday
            )
            .then(async function (link) {
                if (link.status == 201) {
                    linkTaskId = link.data.taskId;
                    return linkTaskId;
                }
            })
            .then(async function (linkTaskId) {
                console.log('linkTaskId :', linkTaskId);
                var file = 'https://reporting.smartadserverapis.com/2044/reports/' +
                    linkTaskId;
                console.log('file :', file)

                var time = 10000;
                let timerFile = setInterval(async () => {
                    time += 10000;
                    var dataTask = await AxiosFunction.getReportingData('GET', file, '');

                    if ((dataTask.data.lastTaskInstance.jobProgress == '1.0') && (dataTask.data.lastTaskInstance.instanceStatus == 'SUCCESS') && (dataTask.data.lastTaskInstance.nbOutputLines > 0)) {
                        var linkTaskFile = 'https://reporting.smartadserverapis.com/2044/reports/' +
                            linkTaskId + '/file';
                        clearInterval(timerFile);
                    }

                    // Si la task est OK
                    if (linkTaskFile) {
                        dataFile = await AxiosFunction.getReportingData('GET', linkTaskFile, '');
                        var dataSplit = dataFile.data;
                        localStorageAutomate.setItem(cacheStorageID, JSON.stringify(dataSplit));
                    }

                }, time);

            });
    }

    // Récupére les données du forecast
    var dataSplit = taskCampaignsDays;

    if (dataSplit) {
        data_splinter = dataSplit.split(/\r?\\n/);
        var lines = data_splinter.length;

        // Boucle sur les lignes
        for (i = 0; i < lines; i++) {
            line = data_splinter[i].split(';');
            if (!Utilities.empty(line[0])) {
                campaignsIds.push(line[0]);
            }
            if (!Utilities.empty(line[2])) {
                advertisersIds.push(line[2]);
            }
            if (!Utilities.empty(line[3])) {
                campaignsName.push(line[3]);
            }
            if (!Utilities.empty(line[4])) {
                campaignsStartDate.push(line[4]);
            }
            if (!Utilities.empty(line[5])) {
                campaignsEndDate.push((line[5] / 100));
            } //    var Dday = moment().format('YYYY-MM-DD');
        }

        // Teste si les annonceurs existent
        console.log(campaignsName);
        console.log(campaignsName.length);
        console.log(campaignsEndDate);
        // console.log(advertisersIds.toString());  var myAdvertiser =
        // Utilities.arrayDiff(advertisersIds,advertisersIdsBdd);  var myCampaign =
        // Utilities.arrayDiff(campaignsIds,campaignsIdsBdd);
    }

    // res.json(myCampaign);
}

exports.campaignsInsertions = async (req, res) => {
    try {
        let campaign_id = req.query.campaign_id;
        campaignObject = {
            "campaign_id": req.query.campaign_id
        };

        if (campaign_id) {
            var config = SmartFunction.config('campaignsInsertions', campaignObject);
            await axios(config).then(function (result) {

                if (!Utilities.empty(result.data)) {
                    var data = result.data;

                    var number_line = data.length;
                    var number_total_count = result.headers['x-pagination-total-count'];
                    var number_pages = Math.round((number_total_count / 100) + 1);

                    const addItem = async () => {
                        for (let page = 0; page <= number_pages; page++) {
                            let offset = page * 100;
                            campaignObject2 = {
                                "campaign_id": req.query.campaign_id,
                                "limit": 100,
                                "offset": offset
                            };

                            var config2 = SmartFunction.config('campaignsInsertions', campaignObject2);
                            console.log('Config2 : ', config2);
                            await axios(config2).then(function (response) {
                                if (!Utilities.empty(response.data)) {
                                    var dataValue = response.data;
                                    var number_line_offset = data.length;
                                    if (number_line_offset >= 0) {
                                        for (i = 0; i < number_line_offset; i++) {

                                            // console.log(dataValue)
                                            var insertion_id = dataValue[i].id;
                                            var delivery_regulated = dataValue[i].isDeliveryRegulated;
                                            var used_guaranteed_deal = dataValue[i].isUsedByGuaranteedDeal;
                                            var used_non_guaranteed_deal = dataValue[i].heigisUsedByNonGuaranteedDealht;
                                            var voice_share = dataValue[i].voiceShare;
                                            var event_id = dataValue[i].eventId;
                                            var insertion_name = dataValue[i].name;
                                            var insertion_description = dataValue[i].description;
                                            //  var site_id = dataValue[i].siteIds;

                                            var pack_id = dataValue[i].packIds;
                                            var insertion_status_id = dataValue[i].insertions_statusId;
                                            var insertion_start_date = dataValue[i].startDate;
                                            var insertion_end_date = dataValue[i].endDate;
                                            var campaign_id = dataValue[i].campaignId;
                                            var insertion_type_id = dataValue[i].insertionTypeId;
                                            var delivery_type_id = dataValue[i].deliveryTypeId;
                                            var timezone_id = dataValue[i].timezoneId;
                                            var priority_id = dataValue[i].priorityId;
                                            var periodic_capping_id = dataValue[i].periodicCappingId;
                                            var group_capping_id = dataValue[i].groupCappingId;
                                            var max_impression = dataValue[i].maxImpressions;
                                            var weight = dataValue[i].weight;
                                            var max_click = dataValue[i].maxClicks;
                                            var max_impression_perday = dataValue[i].maxImpressionsPerDay;
                                            var max_click_perday = dataValue[i].maxClicksPerDay;
                                            var insertion_groupe_volume = dataValue[i].insertionGroupedVolumeId
                                            var event_impression = dataValue[i].eventImpressions;
                                            var holistic_yield_enabled = dataValue[i].isHolisticYieldEnabled;
                                            var deliver_left_volume_after_end_date = dataValue[i].deliverLeftVolumeAfterEndDate;
                                            var global_capping = dataValue[i].globalCapping;
                                            var capping_per_visit = dataValue[i].cappingPerVisit;
                                            var capping_per_click = dataValue[i].cappingPerClick;
                                            var auto_capping = dataValue[i].autoCapping;
                                            var periodic_capping_impression = dataValue[i].periodicCappingImpressions;
                                            var periodic_capping_period = dataValue[i].periodicCappingPeriod;
                                            var oba_icon_enabled = dataValue[i].isObaIconEnabled;

                                            if (dataValue[i].formatId === 0) {
                                                var format_id = "NULL"
                                            } else {
                                                var format_id = dataValue[i].formatId;
                                            }
                                            var external_id = dataValue[i].externalId;
                                            var external_description = dataValue[i].externalDescription;
                                            var insertion_updated_at = dataValue[i].updatedAt;
                                            var insertion_created_at = dataValue[i].createdAt;
                                            var insertion_archived = dataValue[i].isArchived;
                                            var rate_type_id = dataValue[i].rateTypeId;
                                            var rate = dataValue[i].rate;
                                            var rate_net = dataValue[i].rateNet;
                                            var discount = dataValue[i].discount;
                                            var currency_id = dataValue[i].currencyId;
                                            var insertion_link_id = dataValue[i].insertionLinkId;
                                            var insertion_exclusion_id = dataValue[i].insertionExclusionIds;
                                            var customized_script = dataValue[i].customizedScript;
                                            var sale_channel_id = dataValue[i].salesChannelId;

                                            Utilities
                                                .updateOrCreate(ModelInsertions, {
                                                    insertion_id: insertion_id
                                                }, {
                                                    insertion_id,
                                                    delivery_regulated,
                                                    used_guaranteed_deal,
                                                    used_non_guaranteed_deal,
                                                    voice_share,
                                                    event_id,
                                                    insertion_name,
                                                    insertion_description,
                                                    pack_id,
                                                    insertion_status_id,
                                                    insertion_start_date,
                                                    insertion_end_date,
                                                    campaign_id,
                                                    insertion_type_id,
                                                    delivery_type_id,
                                                    timezone_id,
                                                    priority_id,
                                                    periodic_capping_id,
                                                    group_capping_id,
                                                    max_impression,
                                                    weight,
                                                    max_click,
                                                    max_impression_perday,
                                                    max_click_perday,
                                                    insertion_groupe_volume,
                                                    event_impression,
                                                    holistic_yield_enabled,
                                                    deliver_left_volume_after_end_date,
                                                    global_capping,
                                                    capping_per_visit,
                                                    capping_per_click,
                                                    auto_capping,
                                                    periodic_capping_impression,
                                                    periodic_capping_period,
                                                    oba_icon_enabled,
                                                    format_id,
                                                    external_id,
                                                    external_description,
                                                    insertion_updated_at,
                                                    insertion_created_at,
                                                    insertion_archived,
                                                    rate_type_id,
                                                    rate,
                                                    rate_net,
                                                    discount,
                                                    currency_id,
                                                    insertion_link_id,
                                                    insertion_exclusion_id,
                                                    customized_script,
                                                    sale_channel_id
                                                })
                                                .then(function (result) {
                                                    result.item; // the model
                                                    result.created; // bool, if a new item was created.
                                                    return res.json({
                                                        type: 'success',
                                                        message: 'Les insertions de la campagne <strong>' + campaignObject.campaign_id + '</stro' +
                                                            'ng> ont bien été ajoutées.'
                                                    });
                                                });
                                        }
                                    }
                                } else {
                                    return res.json({
                                        type: 'error',
                                        message: 'Error : Aucune donnée disponible'
                                    });
                                }
                            });
                        }
                    }

                    addItem();
                } else {
                    return res.json({
                        type: 'error',
                        message: 'Aucune insertion pour la campagne "' + campaignObject.campaign_id + '"'
                    });
                }

            });
        } else {
            return res.json({
                type: 'error',
                message: 'Veuillez saisir l\'identifiant de la campagne.'
            });
        }
    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }
}

exports.campaignsCreatives = async (req, res) => {
    try {
        let campaignID = req.query.campaign_id;

        if (campaignID) {
            const insertions = await ModelInsertions.findAll({
                where: {
                    campaign_id: campaignID
                }
            });

            if (insertions.length > 0) {
                for (let i = 0; i < insertions.length; i++) {
                    insertionObject = {
                        "insertion_id": insertions[i].insertion_id
                    };

                    var config = SmartFunction.config('creatives', insertionObject);
                    await axios(config)
                        .then(function (response) {
                            if (!Utilities.empty(response.data)) {
                                return creativesData = response.data;
                            }
                            // creatives = result.data;
                        })
                        .then(creativesData => {
                            if (!Utilities.empty(creativesData)) {
                                var number_line_offset = creativesData.length;

                                if (number_line_offset > 0) {
                                    for (m = 0; m < number_line_offset; m++) {
                                        var creative_id = creativesData[m].id;
                                        var creative_name = creativesData[m].name;
                                        var file_name = creativesData[m].fileName;
                                        var insertion_id = creativesData[m].insertionId;
                                        var creative_resource_url = creativesData[m].resourceUrl;
                                        var creative_url = creativesData[m].url;
                                        var creative_click_url = creativesData[m].clickUrl;
                                        var creative_width = creativesData[m].width;
                                        var creative_height = creativesData[m].height;
                                        var creative_mime_type = creativesData[m].mimeType;
                                        var creative_percentage_delivery = creativesData[m].percentageOfDelivery;
                                        var creatives_type_id = creativesData[m].creativeTypeId;
                                        var creatives_activated = creativesData[m].isActivated;
                                        var creatives_archived = creativesData[m].isArchived;

                                        var result = Utilities
                                            .updateOrCreate(ModelCreatives, {
                                                creative_id: creative_id
                                            }, {
                                                creative_id,
                                                creative_name,
                                                file_name,
                                                insertion_id,
                                                creative_resource_url,
                                                creative_url,
                                                creative_click_url,
                                                creative_width,
                                                creative_height,
                                                creative_mime_type,
                                                creative_percentage_delivery,
                                                creatives_type_id,
                                                creatives_activated,
                                                creatives_archived
                                            })
                                            .then(function (result) {
                                                result.item; // the model
                                                result.created; // bool, if a new item was created.
                                            });

                                    }

                                    return res.json({
                                        type: 'success',
                                        message: 'Les créatives de la campagne <strong>' + campaignID + '</strong> ont bien été ' +
                                            'ajoutées.'
                                    });
                                }

                            }

                        });

                }

            } else {
                return res.json({
                    type: 'error',
                    message: 'Aucune créative pour la campagne "' + campaignObject.campaign_id + '"'
                });
            }

        } else {
            return res.json({
                type: 'error',
                message: 'Veuillez saisir l\'identifiant de la campagne.'
            });
        }
    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }
}

exports.epilotCampaigns = async (req, res) => {
    try {

        // Mettre à jour les campagnes
        const campaigns = await ModelCampaigns
            .findAll()
            .then(async function (campaigns) {
                campaigns.forEach(function (item) {

                    const regexCampaignCode = /([0-9]{5})/g;

                    const campaign_id = item.campaign_id;
                    const epilot_campaign_name = item.campaign_name;

                    regexCampaignCodeResult = epilot_campaign_name.match(regexCampaignCode);
                    if (regexCampaignCodeResult) {
                        var epilot_campaign_code = regexCampaignCodeResult[0];
                        console.log(epilot_campaign_name, ' - ', epilot_campaign_code);

                        ModelEpilotCampaigns.update({
                            campaign_id: campaign_id
                        }, {
                            where: {
                                epilot_campaign_code: epilot_campaign_code
                            }
                        });

                    } else {
                        console.log('No campaign')
                    }

                });
            });

        // Mettre à jour les annonceurs
        const advertisers = await ModelAdvertisers
            .findAll()
            .then(async function (advertisers) {
                advertisers.forEach(function (item) {
                    const advertiser_id = item.advertiser_id;
                    const advertiser_name = item.advertiser_name;

                    ModelEpilotCampaigns.update({
                        advertiser_id: advertiser_id
                    }, {
                        where: {
                            epilot_advertiser_name: advertiser_name
                        }
                    });

                });
            });

        /*
         // Mettre à jour les campagnes
         const campaigns = await ModelCampaigns.findAll()
         .then(async function (campaigns) {
             campaigns.forEach(function(item){
                const campaign_id = item.campaign_id;
                const campaign_name = item.campaign_name;

                 ModelEpilotCampaigns
                 .update({ campaign_id: campaign_id}, {
                     where: {
                         epilot_campaign_name : campaign_name
                     }
                 });

             });
         });
*/
        // Mettre à jour les utilisateurs
        const users = await ModelUsers
            .findAll()
            .then(async function (users) {
                users.forEach(function (item) {
                    const user_id = item.user_id;
                    const user_initial = item.user_initial;
                    console.log('user_initial :', user_initial);
                    ModelEpilotCampaigns.update({
                        user_id: user_id
                    }, {
                        where: {
                            epilot_campaign_commercial: user_initial
                        }
                    });

                });
            });

        return res.json({
            type: 'success',
            message: "Les annonceurs, les campagnes et les utilisateurs sont MAJ"
        });

        /*// Campagnes
        const campaigns = await ModelEpilotCampaigns
            .findAll({
                where: {
                    advertiser_id: {
                        [Op.eq]: null
                    }
                }
            })
            .then(async function (campaigns) {
                campaigns.forEach(function(item){
                    // copie.push(item);
                    console.log(campaigns.length);
                });
            });
      */
    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }
}

exports.epilotInsertions = async (req, res) => {
    try {

        // Mettre à jour les campagnes
        const campaigns = await ModelEpilotCampaigns.findAll()
            .then(async function (campaigns) {
                campaigns.forEach(function (item) {
                    const epilot_campaign_id = item.epilot_campaign_id;
                    const epilot_campaign_name = item.epilot_campaign_name;

                    ModelEpilotInsertions
                        .update({
                            epilot_campaign_id: epilot_campaign_id
                        }, {
                            where: {
                                epilot_campaign_name: epilot_campaign_name
                            }
                        });

                });
            });

        // Mettre à jour les formats
        const groupFormats = await ModelFormatsGroups
            .findAll()
            .then(async function (groupFormats) {
                groupFormats.forEach(function (item) {
                    const format_group_id = item.format_group_id;
                    const format_group_name = item.format_group_name;
                    console.log('group_format_name : ', format_group_name, ' - format_group_id : ', format_group_id);

                    ModelEpilotInsertions.update({
                        format_group_id: format_group_id
                    }, {
                        where: {
                            epilot_insertion_name: {
                                [Op.like]: "%" + format_group_name + "%"
                            }
                        }
                    });

                });
            });


        // Mettre à jour les utilisateurs
        const users = await ModelUsers
            .findAll()
            .then(async function (users) {
                users.forEach(function (item) {
                    const user_id = item.user_id;
                    const user_initial = item.user_initial;
                    const user_name = item.user_lastname + ' ' + item.user_firstname;

                    ModelEpilotInsertions.update({
                        user_id: user_id
                    }, {
                        where: {
                            epilot_insertion_commercial: user_name
                        }
                    });

                });
            });

        return res.json({
            type: 'success',
            message: "Les insertions, les campagnes et les utilisateurs sont MAJ"
        });

    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }
}

exports.formats = async (req, res) => {
    try {
        var config = SmartFunction.config('formats');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round((number_total_count / 100) + 1);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page <= number_pages; page++) {
                    let offset = page * 100;
                    var config2 = SmartFunction.config('formats', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {

                            //console.log(dataValue)
                            var format_id = dataValue[i].id;
                            var format_name = dataValue[i].name;
                            var format_width = data[i].width;
                            var format_height = dataValue[i].height;
                            var format_type_id = dataValue[i].formatTypeId;
                            var format_archived = dataValue[i].isArchived;
                            var format_resource_url = dataValue[i].resourceUrl;

                            Utilities
                                .updateOrCreate(ModelFormats, {
                                    format_id: format_id
                                }, {
                                    format_id,
                                    format_name,
                                    format_width,
                                    format_height,
                                    format_type_id,
                                    format_archived,
                                    format_resource_url
                                })
                                .then(function (result) {
                                    result.item; // the model
                                    result.created; // bool, if a new item was created.
                                });
                        }
                    });
                }
            }

            addItem();
            res.json('Les formats ont été chargés.');
        });

    } catch (error) {
        console.error('Error : ' + error);

    }
}

exports.sites = async (req, res) => {
    try {
        var config = SmartFunction.config('sites');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round((number_total_count / 100) + 1);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page <= number_pages; page++) {
                    let offset = page * 100;
                    var config2 = SmartFunction.config('sites', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {

                            var site_id = dataValue[i].id;
                            var site_is_child_directed = dataValue[i].isChildDirected;
                            var site_name = dataValue[i].name;
                            var site_archived = dataValue[i].isArchived;
                            var user_group_id = dataValue[i].userGroupId;
                            var site_url = dataValue[i].url;
                            var language_id = dataValue[i].languageId;
                            var site_business_model_type_id = dataValue[i].siteApplicationId;
                            var site_business_model_value = dataValue[i].siteApplicationId;
                            var site_application_id = dataValue[i].siteApplicationId;
                            var site_updated_at = dataValue[i].updatedAt

                            const sites = ModelSites.create({
                                site_id,
                                site_is_child_directed,
                                site_name,
                                site_archived,
                                user_group_id,
                                site_url,
                                language_id,
                                site_business_model_type_id,
                                site_business_model_value,
                                site_application_id,
                                site_updated_at
                            });

                        }

                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);

    }
}

exports.packs = async (req, res) => {
    try {
        var config = SmartFunction.config('packs');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round((number_total_count / 100) + 1);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page <= number_pages; page++) {
                    let offset = page * 100;
                    var config2 = SmartFunction.config('packs', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {

                            var packs_smart_id = dataValue[i].id;
                            var packs_smart_name = dataValue[i].name;
                            var packs_smart_is_archived = dataValue[i].isArchived;
                            var updated_at = dataValue[i].updatedAt

                            const packs = ModelPacks_Smart.create({
                                packs_smart_id,
                                packs_smart_name,
                                packs_smart_is_archived,
                                updated_at
                            });

                        }

                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);

    }
}

exports.templates = async (req, res) => {
    try {
        var config = SmartFunction.config('templates');
        await axios(config).then(function (res) {
            if (!Utilities.empty(res.data)) {
                var data = res.data;
                var number_line = data.length;
                var number_total_count = res.headers['x-pagination-total-count'];
                var number_pages = Math.round((number_total_count / 100) + 1);
                console.log(number_total_count);
                console.log('Number Pages :' + number_pages);

                const addItem = async () => {
                    for (let page = 0; page <= number_pages; page++) {
                        let offset = page * 100;
                        var config2 = SmartFunction.config('templates', offset);
                        await axios(config2).then(function (response) {
                            if (!Utilities.empty(response.data)) {
                                var dataValue = response.data;
                                var number_line_offset = data.length;
                                if (number_line_offset >= 0) {
                                    for (i = 0; i < number_line_offset; i++) {

                                        var template_id = dataValue[i].id;
                                        var template_name = dataValue[i].name;
                                        var template_description = data[i].description;
                                        var template_official = dataValue[i].isOfficial;
                                        var template_archived = dataValue[i].isArchived;
                                        var parameter_default_values = dataValue[i].parameterDefaultValues;
                                        var template_original_id = dataValue[i].originalId;
                                        var documentation_url = dataValue[i].documentationURL;
                                        var type = dataValue[i].type;
                                        var draft_script_id = dataValue[i].draftScriptId;
                                        var replaced_by = dataValue[i].replacedBy;
                                        var editable = dataValue[i].isEditable;
                                        var published = dataValue[i].isPublished;
                                        var deprecated = dataValue[i].isDeprecated;
                                        var hidden = dataValue[i].isHidden;
                                        var template_updated_at = dataValue[i].updatedAt;
                                        var major_version = dataValue[i].majorVersion;
                                        var minor_version = dataValue[i].minorVersion;
                                        var release_note = dataValue[i].isArchived;
                                        var recommendation = dataValue[i].releaseNote;
                                        var sale_channel_id = dataValue[i].salesChannelId;
                                        var fixed_image_url = dataValue[i].previewImageUrls.fixedImageUrl;
                                        var dynamic_image_url = dataValue[i].previewImageUrls.dynamicImageUrl;
                                        var gallery_url = dataValue[i].galleryUrl;

                                        Utilities
                                            .updateOrCreate(ModelTemplates, {
                                                template_id: template_id
                                            }, {
                                                template_id,
                                                template_name,
                                                template_description,
                                                template_official,
                                                template_archived,
                                                parameter_default_values,
                                                template_original_id,
                                                documentation_url,
                                                type,
                                                draft_script_id,
                                                replaced_by,
                                                editable,
                                                published,
                                                deprecated,
                                                hidden,
                                                template_updated_at,
                                                major_version,
                                                minor_version,
                                                release_note,
                                                recommendation,
                                                sale_channel_id,
                                                fixed_image_url,
                                                dynamic_image_url,
                                                gallery_url
                                            })
                                            .then(function (result) {

                                                result.item; // the model
                                                result.created; // bool, if a new item was created.
                                            });

                                        // const tableDb = ModelCampaigns.findByPk(campaign_id); console.log(tableDb);

                                    }

                                }
                            } else {
                                console.error('Error : Aucune donnée disponible');
                            }

                        });
                    }
                }

                addItem();

            } else {
                console.error('Error : Aucune donnée disponible');
            }
        });
    } catch (error) {
        console.error('Error : ' + error);
    }
}

exports.platforms = async (req, res) => {
    try {
        var config = SmartFunction.config('platforms');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round((number_total_count / 100) + 1);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {

                // <= car si le nombre de page est = 0 et que page = 0 la condiction ne
                // fonctionne pas
                for (let page = 0; page <= number_pages; page++) {
                    //  page = 0
                    let offset = page * 100;
                    var config2 = SmartFunction.config('platforms', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {
                            var platform_id = dataValue[i].id;
                            var platform_name = dataValue[i].name;

                            console.log(dataValue);
                            ModelPlatforms.create({
                                platform_id,
                                platform_name
                            });

                        }

                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);

    }
}

exports.deliverytypes = async (req, res) => {
    try {
        var config = SmartFunction.config('deliverytypes');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round((number_total_count / 100) + 1);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {

                // <= car si le nombre de page est = 0 et que page = 0 la condiction ne
                // fonctionne pas
                for (let page = 0; page <= number_pages; page++) {
                    //  page = 0
                    let offset = page * 100;
                    var config2 = SmartFunction.config('deliverytypes', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {
                            var priority_id = dataValue[i].id;
                            var priority_name = dataValue[i].name;

                            //  console.log(dataValue);
                            ModelDeliverytypes.create({
                                priority_id,
                                priority_name
                            });

                        }

                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);
    }
}

exports.insertions_status = async (req, res) => {
    try {
        var config = SmartFunction.config('insertions_status');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round((number_total_count / 100) + 1);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {

                // <= car si le nombre de page est = 0 et que page = 0 la condiction ne
                // fonctionne pas
                for (let page = 0; page <= number_pages; page++) {
                    //  page = 0
                    let offset = page * 100;
                    var config2 = SmartFunction.config('insertions_status', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {
                            var insertion_status_id = dataValue[i].id;
                            var insertion_status_name = dataValue[i].name;
                            ModelInsertionsStatus.create({
                                insertion_status_id,
                                insertion_status_name
                            });
                        }

                    });
                }
            }

            addItem();

            return res.json({
                status: 'lol'
            });
        });

    } catch (error) {
        console.error('Error : ' + error);

    }
}

exports.countries = async (req, res) => {
    try {
        var config = SmartFunction.config('countries');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round((number_total_count / 100) + 1);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page <= number_pages; page++) {
                    let offset = page * 100;
                    var config2 = SmartFunction.config('countries', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {
                            var country_id = dataValue[i].id;
                            var country_name = dataValue[i].name;
                            var country_archived = dataValue[i].isArchived;
                            var country_iso3166 = dataValue[i].countryIso3166;
                            var continent_id = dataValue[i].continentId;
                            var country_extended_name = dataValue[i].extendedName;
                            //  console.log(dataValue);
                            const countries = ModelCountries.create({
                                country_id,
                                country_name,
                                country_archived,
                                country_iso3166,
                                continent_id,
                                country_extended_name
                            });

                            /*

                            const advertiserDb = ModelFormats.findByPk(advertiser_id);
                            if (advertiserDb === null) {
                              console.log('Not found!');
                              const advertiser = ModelFormats.create({advertiser_id, advertiser_name});
                            } else {
                              console.log('Else : '+advertiserDb instanceof ModelFormats); // true
                              // Its primary key is 123
                            } */
                        }

                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);

    }
}

exports.insertions_templates = async (req, res) => {
    // Délai d'attente
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {
        // Listes toutes les données de insertions_templates
        var insertionTemplatesDB = await ModelInsertionsTemplates.findAll({
            attributes: ['insertion_id']
        });
        insertionTemplatesDBIds = new Array();
        for (o = 0; o < insertionTemplatesDB.length; o++) {
            insertionTemplatesDBIds[o] = insertionTemplatesDB[o].insertion_id;
        }

        // Liste toutes les données de Insertions
        var insertionDB = await ModelInsertions.findAll({
            where: {
                'insertion_id': {
                    [Op.notIn]: insertionTemplatesDBIds
                },
                'insertion_archived': '0',
                'insertion_created_at': {
                    [Op.between]: ['2021-01-01', '2021-04-30']
                }
            },
            attributes: ['insertion_id']
        });

        var number_total_count = insertionDB.length;
        var number_pages = Math.round((number_total_count / 20) + 1);
        console.log('number_total_count', number_total_count);
        console.log('number_pages', number_pages);

        if (number_total_count > 0) {
            j = 0;
            for (i = 0; i < number_total_count; i++) {
                console.log(insertionDB[i].insertion_id)
                insertionObject = {
                    "insertion_id": insertionDB[i].insertion_id
                };
                console.log(j++);

                var config = SmartFunction.config(
                    'insertions_templates',
                    '',
                    '',
                    insertionObject
                );

                await axios(config).then(function (res) {
                    //console.log(res.data); process.exit(1);

                    if (!Utilities.empty(res.data)) {
                        //  return res.json(resa.data);
                        var dataValue = res.data;
                        //      console.log(dataValue);

                        var insertion_id = dataValue.insertionId;
                        var parameter_value = dataValue.parameterValues;
                        var template_id = dataValue.templateId;

                        Utilities
                            .updateOrCreate(ModelInsertionsTemplates, {
                                insertion_id: insertion_id
                            }, {
                                insertion_id,
                                parameter_value,
                                template_id
                            })
                            .then(function (result) {
                                result.item; // the model
                                result.created; // bool, if a new item was created.
                            });

                    }
                });
            }

        }

    } catch (error) {
        console.error('Error : ', error);
    }
}

exports.creatives = async (req, res) => {
    // Délai d'attente
    const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

    try {
        // Listes toutes les données de insertions_templates
        var insertionCreativesDB = await ModelCreatives.findAll({
            attributes: ['insertion_id']
        });

        insertionCreativesDBIds = new Array();
        for (o = 0; o < insertionCreativesDB.length; o++) {
            insertionCreativesDBIds[o] = insertionCreativesDB[o].insertion_id;
        }

        // Liste toutes les données de Insertions
        var insertionDB = await ModelInsertions.findAll({
            where: {
                'insertion_id': {
                    [Op.notIn]: insertionCreativesDBIds
                },
                'insertion_archived': '0',
                'insertion_created_at': {
                    [Op.between]: ['2021-01-01', '2021-04-30']
                }
            },
            attributes: ['insertion_id']
        });

        var number_total_count = insertionDB.length;
        var number_pages = Math.round((number_total_count / 20) + 1);
        console.log('number_total_count', number_total_count);
        console.log('number_pages', number_pages);
        // await delay(10000); process.exit(1);

        if (number_total_count > 0) {
            j = 0;
            for (i = 0; i < number_total_count; i++) {
                console.log('insertionDB  ', insertionDB[i].insertion_id)
                insertionObject = {
                    "insertion_id": insertionDB[i].insertion_id
                };

                // var config = SmartFunction.config('creatives', '', '', insertionObject);
                var config = SmartFunction.config('creatives', insertionObject);

                await axios(config).then(function (res) {
                    //console.log(res.data); process.exit(1);

                    if (!Utilities.empty(res.data)) {
                        //  return res.json(resa.data);
                        var dataValue = res.data;

                        var number_line_offset = dataValue.length;

                        console.log('dataValue  ', dataValue)

                        if (number_line_offset >= 0) {
                            for (m = 0; m < number_line_offset; m++) {

                                var creative_id = dataValue[m].id;
                                var creative_name = dataValue[m].name;
                                var file_name = dataValue[m].fileName;
                                var insertion_id = dataValue[m].insertionId;
                                var creative_resource_url = dataValue[m].resourceUrl;
                                var creative_url = dataValue[m].url;
                                var creative_click_url = dataValue[m].clickUrl;
                                var creative_width = dataValue[m].width;
                                var creative_height = dataValue[m].height;
                                var creative_mime_type = dataValue[m].mimeType;
                                var creative_percentage_delivery = dataValue[m].percentageOfDelivery;
                                var creatives_type_id = dataValue[m].creativeTypeId;
                                var creatives_activated = dataValue[m].isActivated;
                                var creatives_archived = dataValue[m].isArchived;

                                Utilities
                                    .updateOrCreate(ModelCreatives, {
                                        creative_id: creative_id
                                    }, {
                                        creative_id,
                                        creative_name,
                                        file_name,
                                        insertion_id,
                                        creative_resource_url,
                                        creative_url,
                                        creative_click_url,
                                        creative_width,
                                        creative_height,
                                        creative_mime_type,
                                        creative_percentage_delivery,
                                        creatives_type_id,
                                        creatives_activated,
                                        creatives_archived
                                    })
                                    .then(function (result) {
                                        result.item; // the model
                                        result.created; // bool, if a new item was created.
                                    });

                            }
                        }

                    }
                });
            }

        }

    } catch (error) {
        console.error('Error : ', error);
    }
}


exports.insertions = async (req, res) => {
    try {
        var config = SmartFunction.config('insertions');
        await axios(config).then(function (res) {
            if (!Utilities.empty(res.data)) {
                var data = res.data;
                var number_line = data.length;
                var number_total_count = res.headers['x-pagination-total-count'];
                var number_pages = Math.round((number_total_count / 100) + 1);
                console.log(number_total_count);
                console.log('Number Pages :' + number_pages);

                const addItem = async () => {
                    for (let page = 0; page <= number_pages; page++) {
                        let offset = page * 100;

                        paramsObject = {
                            "offset": offset
                        };
                        // var config = SmartFunction.config('creatives', '', '', insertionObject);
                        var config = SmartFunction.config('creatives', paramsObject);

                        var config2 = SmartFunction.config('insertions', paramsObject);
                        await axios(config2).then(function (response) {
                            if (!Utilities.empty(response.data)) {
                                var dataValue = response.data;
                                var number_line_offset = data.length;
                                if (number_line_offset >= 0) {
                                    for (i = 0; i < number_line_offset; i++) {

                                        // console.log(dataValue)
                                        var insertion_id = dataValue[i].id;
                                        var delivery_regulated = dataValue[i].isDeliveryRegulated;
                                        var used_guaranteed_deal = dataValue[i].isUsedByGuaranteedDeal;
                                        var used_non_guaranteed_deal = dataValue[i].heigisUsedByNonGuaranteedDealht;
                                        var voice_share = dataValue[i].voiceShare;
                                        var event_id = dataValue[i].eventId;
                                        var insertion_name = dataValue[i].name;
                                        var insertion_description = dataValue[i].description;
                                        //  var site_id = dataValue[i].siteIds;

                                        var pack_id = dataValue[i].packIds;
                                        var insertion_status_id = dataValue[i].insertions_statusId;
                                        var insertion_start_date = dataValue[i].startDate;
                                        var insertion_end_date = dataValue[i].endDate;
                                        var campaign_id = dataValue[i].campaignId;
                                        var insertion_type_id = dataValue[i].insertionTypeId;
                                        var delivery_type_id = dataValue[i].deliveryTypeId;
                                        var timezone_id = dataValue[i].timezoneId;
                                        var priority_id = dataValue[i].priorityId;
                                        var periodic_capping_id = dataValue[i].periodicCappingId;
                                        var group_capping_id = dataValue[i].groupCappingId;
                                        var max_impression = dataValue[i].maxImpressions;
                                        var weight = dataValue[i].weight;
                                        var max_click = dataValue[i].maxClicks;
                                        var max_impression_perday = dataValue[i].maxImpressionsPerDay;
                                        var max_click_perday = dataValue[i].maxClicksPerDay;
                                        var insertion_groupe_volume = dataValue[i].insertionGroupedVolumeId
                                        var event_impression = dataValue[i].eventImpressions;
                                        var holistic_yield_enabled = dataValue[i].isHolisticYieldEnabled;
                                        var deliver_left_volume_after_end_date = dataValue[i].deliverLeftVolumeAfterEndDate;
                                        var global_capping = dataValue[i].globalCapping;
                                        var capping_per_visit = dataValue[i].cappingPerVisit;
                                        var capping_per_click = dataValue[i].cappingPerClick;
                                        var auto_capping = dataValue[i].autoCapping;
                                        var periodic_capping_impression = dataValue[i].periodicCappingImpressions;
                                        var periodic_capping_period = dataValue[i].periodicCappingPeriod;
                                        var oba_icon_enabled = dataValue[i].isObaIconEnabled;
                                        //test
                                        if (dataValue[i].formatId === 0) {
                                            var format_id = "NULL"
                                        } else {
                                            var format_id = dataValue[i].formatId;
                                        }
                                        var external_id = dataValue[i].externalId;
                                        var external_description = dataValue[i].externalDescription;
                                        var insertion_updated_at = dataValue[i].updatedAt;
                                        var insertion_created_at = dataValue[i].createdAt;
                                        var insertion_archived = dataValue[i].isArchived;
                                        var rate_type_id = dataValue[i].rateTypeId;
                                        var rate = dataValue[i].rate;
                                        var rate_net = dataValue[i].rateNet;
                                        var discount = dataValue[i].discount;
                                        var currency_id = dataValue[i].currencyId;
                                        var insertion_link_id = dataValue[i].insertionLinkId;
                                        var insertion_exclusion_id = dataValue[i].insertionExclusionIds;
                                        var customized_script = dataValue[i].customizedScript;
                                        var sale_channel_id = dataValue[i].salesChannelId;

                                        Utilities
                                            .updateOrCreate(ModelInsertions, {
                                                insertion_id: insertion_id
                                            }, {
                                                insertion_id,
                                                delivery_regulated,
                                                used_guaranteed_deal,
                                                used_non_guaranteed_deal,
                                                voice_share,
                                                event_id,
                                                insertion_name,
                                                insertion_description,
                                                pack_id,
                                                insertion_status_id,
                                                insertion_start_date,
                                                insertion_end_date,
                                                campaign_id,
                                                insertion_type_id,
                                                delivery_type_id,
                                                timezone_id,
                                                priority_id,
                                                periodic_capping_id,
                                                group_capping_id,
                                                max_impression,
                                                weight,
                                                max_click,
                                                max_impression_perday,
                                                max_click_perday,
                                                insertion_groupe_volume,
                                                event_impression,
                                                holistic_yield_enabled,
                                                deliver_left_volume_after_end_date,
                                                global_capping,
                                                capping_per_visit,
                                                capping_per_click,
                                                auto_capping,
                                                periodic_capping_impression,
                                                periodic_capping_period,
                                                oba_icon_enabled,
                                                format_id,
                                                external_id,
                                                external_description,
                                                insertion_updated_at,
                                                insertion_created_at,
                                                insertion_archived,
                                                rate_type_id,
                                                rate,
                                                rate_net,
                                                discount,
                                                currency_id,
                                                insertion_link_id,
                                                insertion_exclusion_id,
                                                customized_script,
                                                sale_channel_id
                                            })
                                            .then(function (result) {
                                                result.item; // the model
                                                result.created; // bool, if a new item was created.
                                            });
                                    }
                                }
                            } else {
                                console.error('Error : Aucune donnée disponible');
                            }

                        });
                    }
                }

                addItem();

            } else {
                console.error('Error : Aucune donnée disponible');
            }
        });
    } catch (error) {
        console.error('Error : ' + error);
    }
}

exports.insertions_priorities = async (req, res) => {

    try {
        var config = SmartFunction.config('insertions_priorities');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round((number_total_count / 100) + 1);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {

                // <= car si le nombre de page est = 0 et que page = 0 la condiction ne
                // fonctionne pas
                for (let page = 0; page <= number_pages; page++) {
                    //  page = 0
                    let offset = page * 100;
                    var config2 = SmartFunction.config('insertions_priorities', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {
                            var priority_id = dataValue[i].id;
                            var priority_name = dataValue[i].name;

                            ModelInsertionsPriorities.create({
                                priority_id,
                                priority_name
                            });
                        }
                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);
    }
}

exports.reports = async (req, res) => {
    try {
        // 1- Liste les campagnes en lignes Affiche les campagnes se terminant
        // aujourd'hui
        var dateNow = moment().format('YYYY-MM-DD');
        var dateTomorrow = moment()
            .add(1, 'days')
            .format('YYYY-MM-DD');
        var date5Days = moment()
            .add(5, 'days')
            .format('YYYY-MM-DD');

        // Affiche les annonceurs à exclure
        const advertiserExclus = new Array(
            418935,
            427952,
            409707,
            425912,
            425914,
            438979,
            439470,
            439506,
            439511,
            439512,
            439513,
            439514,
            439515,
            440117,
            440118,
            440121,
            440122,
            440124,
            440126,
            445117,
            455371,
            455384,
            320778,
            417243,
            414097,
            411820,
            320778,
            417716,
            421871,
            459132
        );

        // Affiche les campagnes en ligne
        let campaigns = await ModelCampaigns
            .findAll({
                    where: {
                        [Op.and]: [{
                            advertiser_id: {
                                [Op.notIn]: advertiserExclus
                            }
                        }, {
                            campaign_name: {
                                [Op.notLike]: '% PARR %'
                            }
                        }, {
                            campaign_start_date: {
                                [Op.lte]: dateNow
                            }
                        }, {
                            campaign_end_date: {
                                [Op.gte]: dateNow
                            }
                        }],
        
                    [Op.or]: [{
                        campaign_start_date: {
                            [Op.between]: [dateNow, '2040-12-31 23:59:00']
                        }
                    }, {
                        campaign_end_date: {
                            [Op.between]: [dateNow, '2040-12-31 23:59:00']
                        }
                    }]
                },
                order: [
                    ['campaign_start_date', 'ASC']
                ],
                include: [{
                    model: ModelAdvertisers
                }]
            })
    .then(async function (campaigns) {
        if (!campaigns) {
            return res.json(404, 'Aucune campagne existante');
        }

        campaignsList = new Object();
        var campaignsReports = [];
        // 2- Recherche et vérifie si les campagnes ont un rapport
        var nbCampaigns = campaigns.length;
        console.log('nbCampaigns :', nbCampaigns)
        a = 0;
        for (i = 0; i < nbCampaigns; i++) {
            campaign_id = campaigns[i].campaign_id;
            campaign_crypt = campaigns[i].campaign_crypt;
            campaign_name = campaigns[i].campaign_name;
            campaign_start_date = campaigns[i].campaign_start_date;
            campaign_end_date = campaigns[i].campaign_end_date;
            advertiser_id = campaigns[i].advertiser.advertiser_id;
            advertiser_name = campaigns[i].advertiser.advertiser_name;




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




            /** Recupère les campagne en ligne uniquement < 31j */
            if (NbDayCampaign < 31) {
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



            }

            /*

             var reportLocalStorage = localStorage.getItem(
                 'campaignID-' + campaign_id
             )
             if (reportLocalStorage) {
                 var reportingData = JSON.parse(reportLocalStorage);
                 var reporting_end_date = reportingData.reporting_end_date;
                 // var t = moment.duration(reportingData.reporting_end_date, "minutes");

                 campaignsList = {
                     'campaign_id': campaign_id,
                     'advertiser_id': advertiser_id,
                     'advertiser_name': advertiser_name,
                     'campaign_name': campaign_name,
                     'campaign_crypt': campaign_crypt,
                     'campaign_start_date': campaign_start_date,
                     'campaign_end_date': campaign_end_date,
                     'report': '1',
                     'timestamp_expiration': moment(reporting_end_date).unix(),
                     'date_expiration': reporting_end_date
                 }
             } else {
                 campaignsList = {
                     'campaign_id': campaign_id,
                     'advertiser_id': advertiser_id,
                     'advertiser_name': advertiser_name,
                     'campaign_name': campaign_name,
                     'campaign_crypt': campaign_crypt,
                     'campaign_start_date': campaign_start_date,
                     'campaign_end_date': campaign_end_date,
                     'report': '0',
                     'timestamp_expiration': moment().unix(),
                     'date_expiration': moment().format('YYYY-MM-DD HH:mm:ss')
                 }
             }

             // Si la date de fin est sup. à la date du jour
             if (moment().format('YYYY-MM-DD HH:mm:ss') < campaign_end_date) {
                 campaignsReports.push(campaignsList);
             }


             if (campaignsReports.length > 0) {
                 // Trie les campagnes selon la date d'expiration
                 campaignsReports.sort(function (a, b) {
                     return a.timestamp_expiration - b.timestamp_expiration;
                 });

                 var format = req.query.format;
                 if (!Utilities.empty(format) && (format === 'json')) {
                     return res
                         .status(200)
                         .json(campaignsReports);
                 } else {
                     campaign_crypt = campaignsReports[0].campaign_crypt;
                     campaign_id = campaignsReports[0].campaign_id;
                     res.redirect('/r/automate/' + campaign_id);
                 }

             } else {
                 return res
                     .status(200)
                     .json('Aucune campagne existante');
             }


             */
        }
        //   console.log(campaignsReports)


    });

} catch (error) {
    console.error('Error : ' + error);
}
}