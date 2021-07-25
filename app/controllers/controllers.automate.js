// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);
var crypto = require('crypto');
const {Op} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

const {QueryTypes} = require('sequelize');
const moment = require('moment');
const {check, query} = require('express-validator');

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
const ModelGroupsFormats = require("../models/models.groups_formats");
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

const {resolve} = require('path');
const {cpuUsage} = require('process');

// Initialise le module
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('data/reporting');
localStorage_tasks = new LocalStorage('data/taskID');
localStorageAutomate = new LocalStorage('data/automate');

exports.json = async (req, res) => {
    try {
        return res.json({'lol': 'lol'});
    } catch (error) {
        return res.json({'error': 'lol'});
    }
}

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

                            const agencies = ModelAgencies.create(
                                {agency_id, agency_name, agency_archived}
                            );
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
                    var config2 = SmartFunction.config('advertisers', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {
                            var advertiser_id = dataValue[i].id;
                            var advertiser_name = dataValue[i].name;
                            var advertiser_archived = dataValue[i].isArchived;

                            //  console.log(dataValue);

                            Utilities
                                .updateOrCreate(ModelAdvertisers, {
                                    advertiser_id: advertiser_id
                                }, {advertiser_id, advertiser_name, advertiser_archived})
                                .then(function (result) {
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

                    });
                }
            }

            addItem();

        });

        res.json('automate advertisers');

    } catch (error) {
        console.error('Error : ' + error);

    }
}

exports.campaigns = async (req, res) => {
    try {
        var config = SmartFunction.config('campaigns');
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
                        var config2 = SmartFunction.config('campaigns', offset);
                        await axios(config2).then(function (response) {
                            if (!Utilities.empty(response.data)) {
                                var dataValue = response.data;
                                var number_line_offset = data.length;
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
                                }
                            } else {
                                console.error('Error : Aucune donnée disponible');
                            }

                        });
                    }
                }

                addItem();
                return res.json(
                    {type: 'success', message: 'Les campagnes ont bien été ajoutées.'}
                );

            } else {
                console.error('Error : Aucune donnée disponible');
            }
        });
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
            var config = SmartFunction.config('campaign', campaignObject);

            await axios(config).then(function (result) {

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
                            return res.json({
                                type: 'success',
                                message: 'La campagne <strong>' + campaign_id + '</strong> a bien été ajouté.'
                            });
                        });

                }

            });

        } else {
            return res.json(
                {type: 'error', message: 'Veuillez saisir l\'identifiant de la campagne.'}
            );
        }
    } catch (error) {
        return res.json({type: 'error', message: error});
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
    var advertisersList = await ModelAdvertisers.findAll(
        {attributes: ['advertiser_id']}
    );
    if (advertisersList) {
        var linesAdvertisers = advertisersList.length;
        // Boucle sur les lignes
        for (a = 1; a < linesAdvertisers; a++) {
            advertisersIdsBdd.push(advertisersList[a].advertiser_id);
        }
    }

    // Récupére l'ensemble des campagnes dans la bdd
    var campaignsList = await ModelCampaigns.findAll({attributes: ['campaign_id']});
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
            "fields": [
                {
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
                }
            ]
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
                                "offset": offset
                            };

                            var config2 = SmartFunction.config('campaignsInsertions', campaignObject2);
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
                                                        message: 'Les insertions de la campagne "' + campaignObject.campaign_id + '" ont bien ét' +
                                                                'é ajoutées.'
                                                    });
                                                });
                                        }
                                    }
                                } else {
                                    return res.json({type: 'error', message: 'Error : Aucune donnée disponible'});
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
            return res.json(
                {type: 'error', message: 'Veuillez saisir l\'identifiant de la campagne.'}
            );
        }
    } catch (error) {
        return res.json({type: 'error', message: error});
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
                                                return res.json({
                                                    type: 'success',
                                                    message: 'Les creatives de la campagne "' + campaignID + '" ont bien été ajoutées.'
                                                });
                                            });

                                    }
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
            return res.json(
                {type: 'error', message: 'Veuillez saisir l\'identifiant de la campagne.'}
            );
        }
    } catch (error) {
        return res.json({type: 'error', message: error});
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
                            ModelPlatforms.create({platform_id, platform_name});

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
                            ModelDeliverytypes.create({priority_id, priority_name});

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
                            ModelInsertionsStatus.create({insertion_status_id, insertion_status_name});
                        }

                    });
                }
            }

            addItem();

            return res.json({status: 'lol'});
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
        var insertionTemplatesDB = await ModelInsertionsTemplates.findAll(
            {attributes: ['insertion_id']}
        );
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
                            }, {insertion_id, parameter_value, template_id})
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
        var insertionCreativesDB = await ModelCreatives.findAll(
            {attributes: ['insertion_id']}
        );

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

                            ModelInsertionsPriorities.create({priority_id, priority_name});
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
        // Récupére les campagnes en lignes qui sont archivé et à l'exception de
        // certaine annonceurs SELECT *  FROM `asb_campaigns` WHERE `campaign_end_date`
        // > '2021-05-15' And campaign_archived = "1" AND advertiser_id NOT
        // IN(320778,409707,425914,417243,417716)
        var yearMonth = moment().format('YYYY-MM');
        var Dday = moment().format('YYYY-MM-DD');
        var DdayTime = moment().format('YYYY-MM-DDTHH:mm:ss');
        var DateNow = new Date().getTime();

        campaigns = await ModelCampaigns
            .findAll({
                where: {
                    campaign_start_date: {
                        [Op.gte]: yearMonth + "-01",
                        [Op.lte]: Dday
                    },
                    campaign_end_date: {
                        [Op.gte]: Dday
                    },
                    campaign_archived: "0",
                    advertiser_id: {
                        [Op.notIn]: [320778, 409707, 425914, 417243, 417716]
                    }
                }
            })
            .then(async function (campaigns) {

                if (!campaigns) 
                    return res
                        .status(404)
                        .render("error.ejs", {statusCoded: 404});
                
                var campaigns_count = campaigns.length;
                console.log('campaigns_count :', campaigns_count);
                //  process.exit(1);

                for (c = 0; c < campaigns_count; c++) {
                    campaign = campaigns[c];

                    // Vérifie que les campagnes ne font pas plus de 31 jours
                    var campaign_date_start = new Date(campaign.campaign_start_date);
                    var campaign_date_end = new Date(campaign.campaign_end_date);
                    // console.log("Date de fin", campaign.campaign_end_date)   console.log("Date du
                    // jour", DdayTime) Vérifier pour prendre la date la plus proche.
                    var campaign_new_end_date = (campaign.campaign_end_date > DdayTime)
                        ? DdayTime
                        : campaign.campaign_end_date;
                    // Le mettre en timestamp
                    var campaign_new_end_date = new Date(campaign_new_end_date);
                    // Calcule la différence entre les 2 dates
                    var Difference_In_Time = campaign_new_end_date.getTime() - campaign_date_start.getTime();
                    // Arrondie au supérieur
                    var Difference_In_Days = Math.round(Difference_In_Time / (1000 * 3600 * 24));

                    if (campaign && (Difference_In_Days < 30) && (campaign.campaign_start_date < Dday)) {
                        // fonctionnalité generation du rapport
                        let campaigncrypt = campaign.campaign_crypt
                        let advertiserid = campaign.advertiser_id;
                        let campaignid = campaign.campaign_id;
                        let startDate = campaign.campaign_start_date;
                        let EndtDate = campaign.campaign_end_date;
                        console.log('CampaignID :' + campaignid, campaign.campaign_name);
                        // console.log('-----------------------------');

                        let cacheStorageID = 'campagneId-' + campaignid;

                        // Initialise la date
                        let date = new Date();
                        let cacheStorageIDHour = moment().format('YYYYMMDD-H');

                        // Vérifie si un cache existe pas
                        let dataLocalStorage = localStorage.getItem('campagneId-' + campaignid);
                        if (dataLocalStorage) {
                            // Si oui vérifie que la date d'expiration est inf. à date du moment
                            var data_report_view = JSON.parse(dataLocalStorage);
                            var date_expiry = data_report_view.date_expiry;

                            if (date_expiry < DateNow) {
                                var campaignCrypt = campaign.campaign_crypt;
                                break;
                            }
                        } else {
                            var campaignCrypt = campaign.campaign_crypt;
                            break;
                        }
                    }
                }

                // Récupére l'ID de la camapagne
                if (campaignCrypt) {
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
                                // campaign_id: req.params.campaignid, advertiser_id: req.params.advertiserid
                                campaign_crypt: campaignCrypt
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
                            
                            //fonctionnalité generation du rapport

                            let campaigncrypt = campaign.campaign_crypt
                            let advertiserid = campaign.advertiser_id;
                            let campaignid = campaign.campaign_id;
                            let startDate = campaign.campaign_start_date;
                            let EndtDate = campaign.campaign_end_date;

                            //
                            let cacheStorageID = 'campagneId-' + campaignid;
                            // Initialise la date
                            let date = new Date();
                            let cacheStorageIDHour = moment().format('YYYYMMDD-H');
                            try {
                                var data_localStorage = localStorage.getItem('campagneId-' + campaignid);

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
                                        /*
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
                                    */

                                    } else {
                                        //si le local storage est expire supprime item precedent et les taskid
                                        console.log('Date du début ', startDate);
                                        console.log('EndDate', EndtDate);

                                        localStorage.removeItem('campagneId-' + campaignid);
                                        localStorage_tasks.removeItem(
                                            'campagneId-' + campaignid + '-task_global'
                                        );
                                        localStorage_tasks.removeItem(
                                            'campagneId-' + campaignid + '-task_global_vu'
                                        );

                                        res.redirect(`/r/${campaigncrypt}`);
                                    }

                                } else {

                                    const now = new Date();
                                    const timestamp_datenow = now.getTime();

                                    // recup la date de début de la campagne -3heure pour règler le prob du décalage
                                    // horraire
                                    const startDate_yesterday = new Date(startDate);
                                    const start_date_timezone = startDate_yesterday.setHours(-4);

                                    //recup la date de fin de la campagne ajoute +1jour
                                    const endDate_day = new Date(EndtDate);
                                    const endDate_last = endDate_day.setDate(endDate_day.getDate() + 1);

                                    var s = parseInt(start_date_timezone);
                                    var t3 = parseInt(endDate_last)

                                    const StartDate_timezone = Utilities.getDateTimezone(s);
                                    const EndDate = Utilities.getDateTimezone(t3);

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
                                            }
                                        ],
                                        "filter": [
                                            {
                                                "CampaignId": [campaignid]
                                            }
                                        ]
                                    }

                                    // console.log(requestReporting) test si la date de fin de la campagne est =>
                                    // date au jourd'hui = 31j ne pas effectuer la requête date_fin - date du jour =
                                    // nbr jour Requête visitor unique
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

                                    // 1) Requête POST
                                    var dataLSTaskGlobal = localStorage_tasks.getItem(
                                        'campagneId-' + campaignid + '-task_global'
                                    );

                                    // firstLink - Récupére la taskID de la requête reporting
                                    let firstLinkTaskId = localStorage_tasks.getItem(
                                        'campagneId-' + campaignid + '-firstLink-' + cacheStorageIDHour
                                    );

                                    if (!firstLinkTaskId) {
                                        let firstLink = await AxiosFunction.getReportingData(
                                            'POST',
                                            '',
                                            requestReporting
                                        );
                                        if (firstLink.status == 201) {
                                            localStorage_tasks.setItem(
                                                'campagneId-' + campaignid + '-firstLink-' + cacheStorageIDHour,
                                                firstLink.data.taskId
                                            );
                                            firstLinkTaskId = firstLink.data.taskId;
                                        }
                                    }

                                    // twoLink - Récupére la taskID de la requête reporting
                                    let twoLinkTaskId = localStorage_tasks.getItem(
                                        'campagneId-' + campaignid + '-twoLink-' + cacheStorageIDHour
                                    );
                                    if (!twoLinkTaskId) {
                                        let twoLink = await AxiosFunction.getReportingData(
                                            'POST',
                                            '',
                                            requestVisitor_unique
                                        );
                                        if (twoLink.status == 201) {
                                            localStorage_tasks.setItem(
                                                'campagneId-' + campaignid + '-twoLink-' + cacheStorageIDHour,
                                                twoLink.data.taskId
                                            );
                                            twoLinkTaskId = twoLink.data.taskId;
                                        }
                                    }

                                    if (firstLinkTaskId || twoLinkTaskId) {
                                        var taskId = firstLinkTaskId;
                                        var taskId_uu = twoLinkTaskId;

                                        console.log('taskId', taskId);
                                        console.log("taskId_uu", taskId_uu);

                                        let requete_global = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`;
                                        let requete_vu = `https://reporting.smartadserverapis.com/2044/reports/${taskId_uu}`;

                                        // 2) Requete GET boucle jusqu'a que le rapport generer 100% delais 1min on
                                        // commence à 10sec
                                        var time = 10000;
                                        let timerFile = setInterval(async () => {

                                            // DATA STORAGE - TASK 1 et 2
                                            var dataLSTaskGlobal = localStorage_tasks.getItem(
                                                'campagneId-' + campaignid + '-task_global'
                                            );

                                            var dataLSTaskGlobalVU = localStorage_tasks.getItem(
                                                'campagneId-' + campaignid + '-task_global_vu'
                                            );

                                            if (!dataLSTaskGlobal || !dataLSTaskGlobalVU) {

                                                if (!dataLSTaskGlobal) {
                                                    time += 5000;
                                                    let threeLink = await AxiosFunction.getReportingData('GET', requete_global, '');
                                                    if ((threeLink.data.lastTaskInstance.jobProgress == '1.0') && (threeLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {
                                                        // 3) Récupère la date de chaque requête
                                                        let dataLSTaskGlobal = localStorage_tasks.getItem(
                                                            'campagneId-' + campaignid + '-task_global'
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
                                                            localStorage_tasks.setItem(
                                                                'campagneId-' + campaignid + '-task_global',
                                                                JSON.stringify(dataLSTaskGlobal)
                                                            );
                                                            console.log('Creation de dataLSTaskGlobal');

                                                        }
                                                    }
                                                }

                                                // Request task2
                                                if (!dataLSTaskGlobalVU) {
                                                    time += 5000;
                                                    let fourLink = await AxiosFunction.getReportingData('GET', requete_vu, '');
                                                    if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (fourLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {
                                                        //3) Récupère la date de chaque requête

                                                        dataLSTaskGlobalVU = localStorage_tasks.getItem(
                                                            'campagneId-' + campaignid + '-task_global_vu'
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
                                                            localStorage_tasks.setItem(
                                                                'campagneId-' + campaignid + '-task_global_vu',
                                                                JSON.stringify(dataLSTaskGlobalVU)
                                                            );
                                                            console.log('Creation de dataLSTaskGlobalVU');
                                                        }
                                                    }
                                                }

                                                if (dataLSTaskGlobal && dataLSTaskGlobalVU) {
                                                    //  clearInterval(timerFile);
                                                    console.log('Creation de clearInterval(timerFile)');
                                                }

                                            } else {

                                                //on arrête la fonction setInterval si il y a les 2 taskID en cache
                                                clearInterval(timerFile);
                                                console.log(
                                                    'on arrête la fonction setInterval si il y a les 2 taskID en cache'
                                                );

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

                                                var data_splinter_global = data_split_global.split(/\r?\n/);
                                                var number_line = data_splinter_global.length;

                                                for (i = 1; i < number_line; i++) {
                                                    //split push les données dans chaque colone
                                                    line = data_splinter_global[i].split(';');
                                                    if (!Utilities.empty(line[0])) {
                                                        CampaignStartDate.push(line[0]);
                                                        CampaignEndtDate.push(line[1]);
                                                        CampaignId.push(line[2]);
                                                        CampaignName.push(line[3]);
                                                        InsertionId.push(line[4]);
                                                        InsertionName.push(line[5]);
                                                        FormatId.push(line[6])
                                                        FormatName.push(line[7])
                                                        SiteId.push(line[8])
                                                        SiteName.push(line[9])
                                                        Impressions.push(line[10]);
                                                        ClickRate.push(line[11]);
                                                        Clicks.push(line[12]);
                                                        Complete.push(line[13]);
                                                    }

                                                }

                                                var t1 = parseInt(CampaignStartDate[0]);
                                                var t2 = parseInt(CampaignEndtDate[0]);
                                                const timeElapsed = Date.now();
                                                const Date_rapport = Utilities.getDateTimeFromTimestamp(timeElapsed);

                                                const StartDate = Utilities.getDateTimeFromTimestamp(t1);
                                                const EndDate = Utilities.getDateTimeFromTimestamp(t2);

                                                //filte les array exclure les valeur undefined qui empêche le calcule des somme

                                                const Array_Impressions = [];
                                                const Array_Clicks = [];
                                                const Array_InsertionName = [];
                                                const Array_SiteID = [];
                                                const Array_SiteName = [];
                                                const Array_FormatName = [];
                                                const Array_ClickRate = [];
                                                const Array_Complete = [];

                                                const Remove_undefined = undefined;

                                                //exclure les valeurs undefined des array
                                                for (let i = 0; i < Impressions.length; i++) {
                                                    if (Impressions[i] !== Remove_undefined) {
                                                        Array_Impressions.push(Impressions[i]);
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
                                                    var rectangle_video = new Array();
                                                    var slider = new Array();

                                                    //////////////////FORMAT INTERSTITIEL//////////////////////
                                                    var interstitielImpressions = new Array();
                                                    var interstitielClicks = new Array();
                                                    var interstitielSitename = new Array();
                                                    var interstitielFormatName = new Array();
                                                    var interstitielCTR = new Array();

                                                    var interstitiel_linfo_impression = new Array();
                                                    var interstitiel_linfo_click = new Array();
                                                    var interstitiel_linfo_siteId = new Array();
                                                    var interstitiel_linfo_siteName = new Array();
                                                    var interstitiel_linfo_ctr = new Array();

                                                    var interstitiel_linfo_android_impression = new Array();
                                                    var interstitiel_linfo_android_click = new Array();
                                                    var interstitiel_linfo_android_siteId = new Array();
                                                    var interstitiel_linfo_android_siteName = new Array();
                                                    var interstitiel_linfo_android_ctr = new Array();

                                                    var interstitiel_linfo_ios_impression = new Array();
                                                    var interstitiel_linfo_ios_click = new Array();
                                                    var interstitiel_linfo_ios_siteId = new Array();
                                                    var interstitiel_linfo_ios_siteName = new Array();
                                                    var interstitiel_linfo_ios_ctr = new Array();

                                                    var interstitiel_dtj_impression = new Array();
                                                    var interstitiel_dtj_click = new Array();
                                                    var interstitiel_dtj_siteId = new Array();
                                                    var interstitiel_dtj_siteName = new Array();
                                                    var interstitiel_dtj_ctr = new Array();

                                                    var interstitiel_antenne_impression = new Array();
                                                    var interstitiel_antenne_click = new Array();
                                                    var interstitiel_antenne_siteId = new Array();
                                                    var interstitiel_antenne_siteName = new Array();
                                                    var interstitiel_antenne_ctr = new Array();

                                                    var interstitiel_orange_impression = new Array();
                                                    var interstitiel_orange_click = new Array();
                                                    var interstitiel_orange_siteId = new Array();
                                                    var interstitiel_orange_siteName = new Array();
                                                    var interstitiel_orange_ctr = new Array();

                                                    var interstitiel_tf1_impression = new Array();
                                                    var interstitiel_tf1_click = new Array();
                                                    var interstitiel_tf1_siteId = new Array();
                                                    var interstitiel_tf1_siteName = new Array();
                                                    var interstitiel_tf1_ctr = new Array();

                                                    var interstitiel_m6_impression = new Array();
                                                    var interstitiel_m6_click = new Array();
                                                    var interstitiel_m6_siteId = new Array();
                                                    var interstitiel_m6_siteName = new Array();
                                                    var interstitiel_m6_ctr = new Array();

                                                    var interstitiel_dailymotion_impression = new Array();
                                                    var interstitiel_dailymotion_click = new Array();
                                                    var interstitiel_dailymotion_siteId = new Array();
                                                    var interstitiel_dailymotion_siteName = new Array();
                                                    var interstitiel_dailymotion_ctr = new Array();

                                                    var interstitiel_actu_ios_impression = new Array();
                                                    var interstitiel_actu_ios_click = new Array();
                                                    var interstitiel_actu_ios_siteId = new Array();
                                                    var interstitiel_actu_ios_siteName = new Array();
                                                    var interstitiel_actu_ios_ctr = new Array();

                                                    var interstitiel_actu_android_impression = new Array();
                                                    var interstitiel_actu_android_click = new Array();
                                                    var interstitiel_actu_android_siteId = new Array();
                                                    var interstitiel_actu_android_siteName = new Array();
                                                    var interstitiel_actu_android_ctr = new Array();

                                                    var interstitiel_rodzafer_impression = new Array();
                                                    var interstitiel_rodzafer_click = new Array();
                                                    var interstitiel_rodzafer_siteId = new Array();
                                                    var interstitiel_rodzafer_siteName = new Array();
                                                    var interstitiel_rodzafer_ctr = new Array();

                                                    var interstitiel_rodzafer_ios_impression = new Array();
                                                    var interstitiel_rodzafer_ios_click = new Array();
                                                    var interstitiel_rodzafer_ios_siteId = new Array();
                                                    var interstitiel_rodzafer_ios_siteName = new Array();
                                                    var interstitiel_rodzafer_ios_ctr = new Array();

                                                    var interstitiel_rodzafer_android_impression = new Array();
                                                    var interstitiel_rodzafer_android_click = new Array();
                                                    var interstitiel_rodzafer_android_siteId = new Array();
                                                    var interstitiel_rodzafer_android_siteName = new Array();
                                                    var interstitiel_rodzafer_android_ctr = new Array();

                                                    //////////////////FORMAT HABILLAGE//////////////////////

                                                    var habillageImpressions = new Array();
                                                    var habillageClicks = new Array();
                                                    var habillageSiteId = new Array();
                                                    var habillageSitename = new Array();
                                                    var habillageFormatName = new Array();
                                                    var habillageCTR = new Array();

                                                    var habillage_linfo_impression = new Array();
                                                    var habillage_linfo_click = new Array();
                                                    var habillage_linfo_siteId = new Array();
                                                    var habillage_linfo_siteName = new Array();
                                                    var habillage_linfo_ctr = new Array();

                                                    var habillage_linfo_android_impression = new Array();
                                                    var habillage_linfo_android_click = new Array();
                                                    var habillage_linfo_android_siteId = new Array();
                                                    var habillage_linfo_android_siteName = new Array();
                                                    var habillage_linfo_android_ctr = new Array();

                                                    var habillage_linfo_ios_impression = new Array();
                                                    var habillage_linfo_ios_click = new Array();
                                                    var habillage_linfo_ios_siteId = new Array();
                                                    var habillage_linfo_ios_siteName = new Array();
                                                    var habillage_linfo_ios_ctr = new Array();

                                                    var habillage_dtj_impression = new Array();
                                                    var habillage_dtj_click = new Array();
                                                    var habillage_dtj_siteId = new Array();
                                                    var habillage_dtj_siteName = new Array();
                                                    var habillage_dtj_ctr = new Array();

                                                    var habillage_antenne_impression = new Array();
                                                    var habillage_antenne_click = new Array();
                                                    var habillage_antenne_siteId = new Array();
                                                    var habillage_antenne_siteName = new Array();
                                                    var habillage_antenne_ctr = new Array();

                                                    var habillage_orange_impression = new Array();
                                                    var habillage_orange_click = new Array();
                                                    var habillage_orange_siteId = new Array();
                                                    var habillage_orange_siteName = new Array();
                                                    var habillage_orange_ctr = new Array();

                                                    var habillage_tf1_impression = new Array();
                                                    var habillage_tf1_click = new Array();
                                                    var habillage_tf1_siteId = new Array();
                                                    var habillage_tf1_siteName = new Array();
                                                    var habillage_tf1_ctr = new Array();

                                                    var habillage_m6_impression = new Array();
                                                    var habillage_m6_click = new Array();
                                                    var habillage_m6_siteId = new Array();
                                                    var habillage_m6_siteName = new Array();
                                                    var habillage_m6_ctr = new Array();

                                                    var habillage_dailymotion_impression = new Array();
                                                    var habillage_dailymotion_click = new Array();
                                                    var habillage_dailymotion_siteId = new Array();
                                                    var habillage_dailymotion_siteName = new Array();
                                                    var habillage_dailymotion_ctr = new Array();

                                                    var habillage_actu_ios_impression = new Array();
                                                    var habillage_actu_ios_click = new Array();
                                                    var habillage_actu_ios_siteId = new Array();
                                                    var habillage_actu_ios_siteName = new Array();
                                                    var habillage_actu_ios_ctr = new Array();

                                                    var habillage_actu_android_impression = new Array();
                                                    var habillage_actu_android_click = new Array();
                                                    var habillage_actu_android_siteId = new Array();
                                                    var habillage_actu_android_siteName = new Array();
                                                    var habillage_actu_android_ctr = new Array();

                                                    var habillage_rodzafer_impression = new Array();
                                                    var habillage_rodzafer_click = new Array();
                                                    var habillage_rodzafer_siteId = new Array();
                                                    var habillage_rodzafer_siteName = new Array();
                                                    var habillage_rodzafer_ctr = new Array();

                                                    var habillage_rodzafer_ios_impression = new Array();
                                                    var habillage_rodzafer_ios_click = new Array();
                                                    var habillage_rodzafer_ios_siteId = new Array();
                                                    var habillage_rodzafer_ios_siteName = new Array();
                                                    var habillage_rodzafer_ios_ctr = new Array();

                                                    var habillage_rodzafer_android_impression = new Array();
                                                    var habillage_rodzafer_android_click = new Array();
                                                    var habillage_rodzafer_android_siteId = new Array();
                                                    var habillage_rodzafer_android_siteName = new Array();
                                                    var habillage_rodzafer_android_ctr = new Array();

                                                    //////////////////FORMAT MASTHEAD//////////////////////

                                                    var mastheadImpressions = new Array();
                                                    var mastheadClicks = new Array();
                                                    var mastheadSitename = new Array();
                                                    var mastheadFormatName = new Array();
                                                    var mastheadCTR = new Array();

                                                    var masthead_linfo_impression = new Array();
                                                    var masthead_linfo_click = new Array();
                                                    var masthead_linfo_siteId = new Array();
                                                    var masthead_linfo_siteName = new Array();
                                                    var masthead_linfo_ctr = new Array();

                                                    var masthead_linfo_android_impression = new Array();
                                                    var masthead_linfo_android_click = new Array();
                                                    var masthead_linfo_android_siteId = new Array();
                                                    var masthead_linfo_android_siteName = new Array();
                                                    var masthead_linfo_android_ctr = new Array();

                                                    var masthead_linfo_ios_impression = new Array();
                                                    var masthead_linfo_ios_click = new Array();
                                                    var masthead_linfo_ios_siteId = new Array();
                                                    var masthead_linfo_ios_siteName = new Array();
                                                    var masthead_linfo_ios_ctr = new Array();

                                                    var masthead_dtj_impression = new Array();
                                                    var masthead_dtj_click = new Array();
                                                    var masthead_dtj_siteId = new Array();
                                                    var masthead_dtj_siteName = new Array();
                                                    var masthead_dtj_ctr = new Array();

                                                    var masthead_antenne_impression = new Array();
                                                    var masthead_antenne_click = new Array();
                                                    var masthead_antenne_siteId = new Array();
                                                    var masthead_antenne_siteName = new Array();
                                                    var masthead_antenne_ctr = new Array();

                                                    var masthead_orange_impression = new Array();
                                                    var masthead_orange_click = new Array();
                                                    var masthead_orange_siteId = new Array();
                                                    var masthead_orange_siteName = new Array();
                                                    var masthead_orange_ctr = new Array();

                                                    var masthead_tf1_impression = new Array();
                                                    var masthead_tf1_click = new Array();
                                                    var masthead_tf1_siteId = new Array();
                                                    var masthead_tf1_siteName = new Array();
                                                    var masthead_tf1_ctr = new Array();

                                                    var masthead_m6_impression = new Array();
                                                    var masthead_m6_click = new Array();
                                                    var masthead_m6_siteId = new Array();
                                                    var masthead_m6_siteName = new Array();
                                                    var masthead_m6_ctr = new Array();

                                                    var masthead_dailymotion_impression = new Array();
                                                    var masthead_dailymotion_click = new Array();
                                                    var masthead_dailymotion_siteId = new Array();
                                                    var masthead_dailymotion_siteName = new Array();
                                                    var masthead_dailymotion_ctr = new Array();

                                                    var masthead_actu_ios_impression = new Array();
                                                    var masthead_actu_ios_click = new Array();
                                                    var masthead_actu_ios_siteId = new Array();
                                                    var masthead_actu_ios_siteName = new Array();
                                                    var masthead_actu_ios_ctr = new Array();

                                                    var masthead_actu_android_impression = new Array();
                                                    var masthead_actu_android_click = new Array();
                                                    var masthead_actu_android_siteId = new Array();
                                                    var masthead_actu_android_siteName = new Array();
                                                    var masthead_actu_android_ctr = new Array();

                                                    var masthead_rodzafer_impression = new Array();
                                                    var masthead_rodzafer_click = new Array();
                                                    var masthead_rodzafer_siteId = new Array();
                                                    var masthead_rodzafer_siteName = new Array();
                                                    var masthead_rodzafer_ctr = new Array();

                                                    var masthead_rodzafer_ios_impression = new Array();
                                                    var masthead_rodzafer_ios_click = new Array();
                                                    var masthead_rodzafer_ios_siteId = new Array();
                                                    var masthead_rodzafer_ios_siteName = new Array();
                                                    var masthead_rodzafer_ios_ctr = new Array();

                                                    var masthead_rodzafer_android_impression = new Array();
                                                    var masthead_rodzafer_android_click = new Array();
                                                    var masthead_rodzafer_android_siteId = new Array();
                                                    var masthead_rodzafer_android_siteName = new Array();
                                                    var masthead_rodzafer_android_ctr = new Array();

                                                    //////////////////FORMAT GRAND-ANGLE//////////////////////

                                                    var grand_angleImpressions = new Array();
                                                    var grand_angleClicks = new Array();
                                                    var grand_angleSitename = new Array();
                                                    var grand_angleFormatName = new Array();
                                                    var grand_angleCTR = new Array();

                                                    var grand_angle_linfo_impression = new Array();
                                                    var grand_angle_linfo_click = new Array();
                                                    var grand_angle_linfo_siteId = new Array();
                                                    var grand_angle_linfo_siteName = new Array();
                                                    var grand_angle_linfo_ctr = new Array();

                                                    var grand_angle_linfo_android_impression = new Array();
                                                    var grand_angle_linfo_android_click = new Array();
                                                    var grand_angle_linfo_android_siteId = new Array();
                                                    var grand_angle_linfo_android_siteName = new Array();
                                                    var grand_angle_linfo_android_ctr = new Array();

                                                    var grand_angle_linfo_ios_impression = new Array();
                                                    var grand_angle_linfo_ios_click = new Array();
                                                    var grand_angle_linfo_ios_siteId = new Array();
                                                    var grand_angle_linfo_ios_siteName = new Array();
                                                    var grand_angle_linfo_ios_ctr = new Array();

                                                    var grand_angle_dtj_impression = new Array();
                                                    var grand_angle_dtj_click = new Array();
                                                    var grand_angle_dtj_siteId = new Array();
                                                    var grand_angle_dtj_siteName = new Array();
                                                    var grand_angle_dtj_ctr = new Array();

                                                    var grand_angle_antenne_impression = new Array();
                                                    var grand_angle_antenne_click = new Array();
                                                    var grand_angle_antenne_siteId = new Array();
                                                    var grand_angle_antenne_siteName = new Array();
                                                    var grand_angle_antenne_ctr = new Array();

                                                    var grand_angle_orange_impression = new Array();
                                                    var grand_angle_orange_click = new Array();
                                                    var grand_angle_orange_siteId = new Array();
                                                    var grand_angle_orange_siteName = new Array();
                                                    var grand_angle_orange_ctr = new Array();

                                                    var grand_angle_tf1_impression = new Array();
                                                    var grand_angle_tf1_click = new Array();
                                                    var grand_angle_tf1_siteId = new Array();
                                                    var grand_angle_tf1_siteName = new Array();
                                                    var grand_angle_tf1_ctr = new Array();

                                                    var grand_angle_m6_impression = new Array();
                                                    var grand_angle_m6_click = new Array();
                                                    var grand_angle_m6_siteId = new Array();
                                                    var grand_angle_m6_siteName = new Array();
                                                    var grand_angle_m6_ctr = new Array();

                                                    var grand_angle_dailymotion_impression = new Array();
                                                    var grand_angle_dailymotion_click = new Array();
                                                    var grand_angle_dailymotion_siteId = new Array();
                                                    var grand_angle_dailymotion_siteName = new Array();
                                                    var grand_angle_dailymotion_ctr = new Array();

                                                    var grand_angle_actu_ios_impression = new Array();
                                                    var grand_angle_actu_ios_click = new Array();
                                                    var grand_angle_actu_ios_siteId = new Array();
                                                    var grand_angle_actu_ios_siteName = new Array();
                                                    var grand_angle_actu_ios_ctr = new Array();

                                                    var grand_angle_actu_android_impression = new Array();
                                                    var grand_angle_actu_android_click = new Array();
                                                    var grand_angle_actu_android_siteId = new Array();
                                                    var grand_angle_actu_android_siteName = new Array();
                                                    var grand_angle_actu_android_ctr = new Array();

                                                    var grand_angle_rodzafer_impression = new Array();
                                                    var grand_angle_rodzafer_click = new Array();
                                                    var grand_angle_rodzafer_siteId = new Array();
                                                    var grand_angle_rodzafer_siteName = new Array();
                                                    var grand_angle_rodzafer_ctr = new Array();

                                                    var grand_angle_rodzafer_ios_impression = new Array();
                                                    var grand_angle_rodzafer_ios_click = new Array();
                                                    var grand_angle_rodzafer_ios_siteId = new Array();
                                                    var grand_angle_rodzafer_ios_siteName = new Array();
                                                    var grand_angle_rodzafer_ios_ctr = new Array();

                                                    var grand_angle_rodzafer_android_impression = new Array();
                                                    var grand_angle_rodzafer_android_click = new Array();
                                                    var grand_angle_rodzafer_android_siteId = new Array();
                                                    var grand_angle_rodzafer_android_siteName = new Array();
                                                    var grand_angle_rodzafer_android_ctr = new Array();

                                                    //////////////////FORMAT NATIVE//////////////////////

                                                    var nativeImpressions = new Array();
                                                    var nativeClicks = new Array();
                                                    var nativeSitename = new Array();
                                                    var nativeFormatName = new Array();
                                                    var nativeCTR = new Array();

                                                    var native_linfo_impression = new Array();
                                                    var native_linfo_click = new Array();
                                                    var native_linfo_siteId = new Array();
                                                    var native_linfo_siteName = new Array();
                                                    var native_linfo_ctr = new Array();

                                                    var native_linfo_android_impression = new Array();
                                                    var native_linfo_android_click = new Array();
                                                    var native_linfo_android_siteId = new Array();
                                                    var native_linfo_android_siteName = new Array();
                                                    var native_linfo_android_ctr = new Array();

                                                    var native_linfo_ios_impression = new Array();
                                                    var native_linfo_ios_click = new Array();
                                                    var native_linfo_ios_siteId = new Array();
                                                    var native_linfo_ios_siteName = new Array();
                                                    var native_linfo_ios_ctr = new Array();

                                                    var native_dtj_impression = new Array();
                                                    var native_dtj_click = new Array();
                                                    var native_dtj_siteId = new Array();
                                                    var native_dtj_siteName = new Array();
                                                    var native_dtj_ctr = new Array();

                                                    var native_antenne_impression = new Array();
                                                    var native_antenne_click = new Array();
                                                    var native_antenne_siteId = new Array();
                                                    var native_antenne_siteName = new Array();
                                                    var native_antenne_ctr = new Array();

                                                    var native_orange_impression = new Array();
                                                    var native_orange_click = new Array();
                                                    var native_orange_siteId = new Array();
                                                    var native_orange_siteName = new Array();
                                                    var native_orange_ctr = new Array();

                                                    var native_tf1_impression = new Array();
                                                    var native_tf1_click = new Array();
                                                    var native_tf1_siteId = new Array();
                                                    var native_tf1_siteName = new Array();
                                                    var native_tf1_ctr = new Array();

                                                    var native_m6_impression = new Array();
                                                    var native_m6_click = new Array();
                                                    var native_m6_siteId = new Array();
                                                    var native_m6_siteName = new Array();
                                                    var native_m6_ctr = new Array();

                                                    var native_dailymotion_impression = new Array();
                                                    var native_dailymotion_click = new Array();
                                                    var native_dailymotion_siteId = new Array();
                                                    var native_dailymotion_siteName = new Array();
                                                    var native_dailymotion_ctr = new Array();

                                                    var native_actu_ios_impression = new Array();
                                                    var native_actu_ios_click = new Array();
                                                    var native_actu_ios_siteId = new Array();
                                                    var native_actu_ios_siteName = new Array();
                                                    var native_actu_ios_ctr = new Array();

                                                    var native_actu_android_impression = new Array();
                                                    var native_actu_android_click = new Array();
                                                    var native_actu_android_siteId = new Array();
                                                    var native_actu_android_siteName = new Array();
                                                    var native_actu_android_ctr = new Array();

                                                    var native_rodzafer_impression = new Array();
                                                    var native_rodzafer_click = new Array();
                                                    var native_rodzafer_siteId = new Array();
                                                    var native_rodzafer_siteName = new Array();
                                                    var native_rodzafer_ctr = new Array();

                                                    var native_rodzafer_ios_impression = new Array();
                                                    var native_rodzafer_ios_click = new Array();
                                                    var native_rodzafer_ios_siteId = new Array();
                                                    var native_rodzafer_ios_siteName = new Array();
                                                    var native_rodzafer_ios_ctr = new Array();

                                                    var native_rodzafer_android_impression = new Array();
                                                    var native_rodzafer_android_click = new Array();
                                                    var native_rodzafer_android_siteId = new Array();
                                                    var native_rodzafer_android_siteName = new Array();
                                                    var native_rodzafer_android_ctr = new Array();

                                                    //////////////////FORMAT rectangle_video//////////////////////

                                                    var rectanglevideoImpressions = new Array();
                                                    var rectanglevideoClicks = new Array();
                                                    var rectanglevideoSitename = new Array();
                                                    var rectanglevideoFormatName = new Array();
                                                    var rectanglevideoCTR = new Array();

                                                    var rectangle_video_linfo_impression = new Array();
                                                    var rectangle_video_linfo_click = new Array();
                                                    var rectangle_video_linfo_siteId = new Array();
                                                    var rectangle_video_linfo_siteName = new Array();
                                                    var rectangle_video_linfo_ctr = new Array();

                                                    var rectangle_video_linfo_android_impression = new Array();
                                                    var rectangle_video_linfo_android_click = new Array();
                                                    var rectangle_video_linfo_android_siteId = new Array();
                                                    var rectangle_video_linfo_android_siteName = new Array();
                                                    var rectangle_video_linfo_android_ctr = new Array();

                                                    var rectangle_video_linfo_ios_impression = new Array();
                                                    var rectangle_video_linfo_ios_click = new Array();
                                                    var rectangle_video_linfo_ios_siteId = new Array();
                                                    var rectangle_video_linfo_ios_siteName = new Array();
                                                    var rectangle_video_linfo_ios_ctr = new Array();

                                                    var rectangle_video_dtj_impression = new Array();
                                                    var rectangle_video_dtj_click = new Array();
                                                    var rectangle_video_dtj_siteId = new Array();
                                                    var rectangle_video_dtj_siteName = new Array();
                                                    var rectangle_video_dtj_ctr = new Array();

                                                    var rectangle_video_antenne_impression = new Array();
                                                    var rectangle_video_antenne_click = new Array();
                                                    var rectangle_video_antenne_siteId = new Array();
                                                    var rectangle_video_antenne_siteName = new Array();
                                                    var rectangle_video_antenne_ctr = new Array();

                                                    var rectangle_video_orange_impression = new Array();
                                                    var rectangle_video_orange_click = new Array();
                                                    var rectangle_video_orange_siteId = new Array();
                                                    var rectangle_video_orange_siteName = new Array();
                                                    var rectangle_video_orange_ctr = new Array();

                                                    var rectangle_video_tf1_impression = new Array();
                                                    var rectangle_video_tf1_click = new Array();
                                                    var rectangle_video_tf1_siteId = new Array();
                                                    var rectangle_video_tf1_siteName = new Array();
                                                    var rectangle_video_tf1_ctr = new Array();

                                                    var rectangle_video_m6_impression = new Array();
                                                    var rectangle_video_m6_click = new Array();
                                                    var rectangle_video_m6_siteId = new Array();
                                                    var rectangle_video_m6_siteName = new Array();
                                                    var rectangle_video_m6_ctr = new Array();

                                                    var rectangle_video_dailymotion_impression = new Array();
                                                    var rectangle_video_dailymotion_click = new Array();
                                                    var rectangle_video_dailymotion_siteId = new Array();
                                                    var rectangle_video_dailymotion_siteName = new Array();
                                                    var rectangle_video_dailymotion_ctr = new Array();

                                                    var rectangle_video_actu_ios_impression = new Array();
                                                    var rectangle_video_actu_ios_click = new Array();
                                                    var rectangle_video_actu_ios_siteId = new Array();
                                                    var rectangle_video_actu_ios_siteName = new Array();
                                                    var rectangle_video_actu_ios_ctr = new Array();

                                                    var rectangle_video_actu_android_impression = new Array();
                                                    var rectangle_video_actu_android_click = new Array();
                                                    var rectangle_video_actu_android_siteId = new Array();
                                                    var rectangle_video_actu_android_siteName = new Array();
                                                    var rectangle_video_actu_android_ctr = new Array();

                                                    var rectangle_video_rodzafer_impression = new Array();
                                                    var rectangle_video_rodzafer_click = new Array();
                                                    var rectangle_video_rodzafer_siteId = new Array();
                                                    var rectangle_video_rodzafer_siteName = new Array();
                                                    var rectangle_video_rodzafer_ctr = new Array();

                                                    var rectangle_video_rodzafer_ios_impression = new Array();
                                                    var rectangle_video_rodzafer_ios_click = new Array();
                                                    var rectangle_video_rodzafer_ios_siteId = new Array();
                                                    var rectangle_video_rodzafer_ios_siteName = new Array();
                                                    var rectangle_video_rodzafer_ios_ctr = new Array();

                                                    var rectangle_video_rodzafer_android_impression = new Array();
                                                    var rectangle_video_rodzafer_android_click = new Array();
                                                    var rectangle_video_rodzafer_android_siteId = new Array();
                                                    var rectangle_video_rodzafer_android_siteName = new Array();
                                                    var rectangle_video_rodzafer_android_ctr = new Array();

                                                    //////////////////FORMAT slider//////////////////////

                                                    var sliderImpressions = new Array();
                                                    var sliderClicks = new Array();
                                                    var sliderSitename = new Array();
                                                    var sliderFormatName = new Array();
                                                    var sliderCTR = new Array();

                                                    var slider_linfo_impression = new Array();
                                                    var slider_linfo_click = new Array();
                                                    var slider_linfo_siteId = new Array();
                                                    var slider_linfo_siteName = new Array();
                                                    var slider_linfo_ctr = new Array();

                                                    var slider_linfo_android_impression = new Array();
                                                    var slider_linfo_android_click = new Array();
                                                    var slider_linfo_android_siteId = new Array();
                                                    var slider_linfo_android_siteName = new Array();
                                                    var slider_linfo_android_ctr = new Array();

                                                    var slider_linfo_ios_impression = new Array();
                                                    var slider_linfo_ios_click = new Array();
                                                    var slider_linfo_ios_siteId = new Array();
                                                    var slider_linfo_ios_siteName = new Array();
                                                    var slider_linfo_ios_ctr = new Array();

                                                    var slider_dtj_impression = new Array();
                                                    var slider_dtj_click = new Array();
                                                    var slider_dtj_siteId = new Array();
                                                    var slider_dtj_siteName = new Array();
                                                    var slider_dtj_ctr = new Array();

                                                    var slider_antenne_impression = new Array();
                                                    var slider_antenne_click = new Array();
                                                    var slider_antenne_siteId = new Array();
                                                    var slider_antenne_siteName = new Array();
                                                    var slider_antenne_ctr = new Array();

                                                    var slider_orange_impression = new Array();
                                                    var slider_orange_click = new Array();
                                                    var slider_orange_siteId = new Array();
                                                    var slider_orange_siteName = new Array();
                                                    var slider_orange_ctr = new Array();

                                                    var slider_tf1_impression = new Array();
                                                    var slider_tf1_click = new Array();
                                                    var slider_tf1_siteId = new Array();
                                                    var slider_tf1_siteName = new Array();
                                                    var slider_tf1_ctr = new Array();

                                                    var slider_m6_impression = new Array();
                                                    var slider_m6_click = new Array();
                                                    var slider_m6_siteId = new Array();
                                                    var slider_m6_siteName = new Array();
                                                    var slider_m6_ctr = new Array();

                                                    var slider_dailymotion_impression = new Array();
                                                    var slider_dailymotion_click = new Array();
                                                    var slider_dailymotion_siteId = new Array();
                                                    var slider_dailymotion_siteName = new Array();
                                                    var slider_dailymotion_ctr = new Array();

                                                    var slider_actu_ios_impression = new Array();
                                                    var slider_actu_ios_click = new Array();
                                                    var slider_actu_ios_siteId = new Array();
                                                    var slider_actu_ios_siteName = new Array();
                                                    var slider_actu_ios_ctr = new Array();

                                                    var slider_actu_android_impression = new Array();
                                                    var slider_actu_android_click = new Array();
                                                    var slider_actu_android_siteId = new Array();
                                                    var slider_actu_android_siteName = new Array();
                                                    var slider_actu_android_ctr = new Array();

                                                    var slider_rodzafer_impression = new Array();
                                                    var slider_rodzafer_click = new Array();
                                                    var slider_rodzafer_siteId = new Array();
                                                    var slider_rodzafer_siteName = new Array();
                                                    var slider_rodzafer_ctr = new Array();

                                                    var slider_rodzafer_ios_impression = new Array();
                                                    var slider_rodzafer_ios_click = new Array();
                                                    var slider_rodzafer_ios_siteId = new Array();
                                                    var slider_rodzafer_ios_siteName = new Array();
                                                    var slider_rodzafer_ios_ctr = new Array();

                                                    var slider_rodzafer_android_impression = new Array();
                                                    var slider_rodzafer_android_click = new Array();
                                                    var slider_rodzafer_android_siteId = new Array();
                                                    var slider_rodzafer_android_siteName = new Array();
                                                    var slider_rodzafer_android_ctr = new Array();

                                                    //////////////////FORMAT logo//////////////////////

                                                    var logoImpressions = new Array();
                                                    var logoClicks = new Array();
                                                    var logoSitename = new Array();
                                                    var logoFormatName = new Array();
                                                    var logoCTR = new Array();

                                                    var logo_linfo_impression = new Array();
                                                    var logo_linfo_click = new Array();
                                                    var logo_linfo_siteId = new Array();
                                                    var logo_linfo_siteName = new Array();
                                                    var logo_linfo_ctr = new Array();

                                                    var logo_linfo_android_impression = new Array();
                                                    var logo_linfo_android_click = new Array();
                                                    var logo_linfo_android_siteId = new Array();
                                                    var logo_linfo_android_siteName = new Array();
                                                    var logo_linfo_android_ctr = new Array();

                                                    var logo_linfo_ios_impression = new Array();
                                                    var logo_linfo_ios_click = new Array();
                                                    var logo_linfo_ios_siteId = new Array();
                                                    var logo_linfo_ios_siteName = new Array();
                                                    var logo_linfo_ios_ctr = new Array();

                                                    var logo_dtj_impression = new Array();
                                                    var logo_dtj_click = new Array();
                                                    var logo_dtj_siteId = new Array();
                                                    var logo_dtj_siteName = new Array();
                                                    var logo_dtj_ctr = new Array();

                                                    var logo_antenne_impression = new Array();
                                                    var logo_antenne_click = new Array();
                                                    var logo_antenne_siteId = new Array();
                                                    var logo_antenne_siteName = new Array();
                                                    var logo_antenne_ctr = new Array();

                                                    var logo_orange_impression = new Array();
                                                    var logo_orange_click = new Array();
                                                    var logo_orange_siteId = new Array();
                                                    var logo_orange_siteName = new Array();
                                                    var logo_orange_ctr = new Array();

                                                    var logo_tf1_impression = new Array();
                                                    var logo_tf1_click = new Array();
                                                    var logo_tf1_siteId = new Array();
                                                    var logo_tf1_siteName = new Array();
                                                    var logo_tf1_ctr = new Array();

                                                    var logo_m6_impression = new Array();
                                                    var logo_m6_click = new Array();
                                                    var logo_m6_siteId = new Array();
                                                    var logo_m6_siteName = new Array();
                                                    var logo_m6_ctr = new Array();

                                                    var logo_dailymotion_impression = new Array();
                                                    var logo_dailymotion_click = new Array();
                                                    var logo_dailymotion_siteId = new Array();
                                                    var logo_dailymotion_siteName = new Array();
                                                    var logo_dailymotion_ctr = new Array();

                                                    var logo_actu_ios_impression = new Array();
                                                    var logo_actu_ios_click = new Array();
                                                    var logo_actu_ios_siteId = new Array();
                                                    var logo_actu_ios_siteName = new Array();
                                                    var logo_actu_ios_ctr = new Array();

                                                    var logo_actu_android_impression = new Array();
                                                    var logo_actu_android_click = new Array();
                                                    var logo_actu_android_siteId = new Array();
                                                    var logo_actu_android_siteName = new Array();
                                                    var logo_actu_android_ctr = new Array();

                                                    var logo_rodzafer_impression = new Array();
                                                    var logo_rodzafer_click = new Array();
                                                    var logo_rodzafer_siteId = new Array();
                                                    var logo_rodzafer_siteName = new Array();
                                                    var logo_rodzafer_ctr = new Array();

                                                    var logo_rodzafer_ios_impression = new Array();
                                                    var logo_rodzafer_ios_click = new Array();
                                                    var logo_rodzafer_ios_siteId = new Array();
                                                    var logo_rodzafer_ios_siteName = new Array();
                                                    var logo_rodzafer_ios_ctr = new Array();

                                                    var logo_rodzafer_android_impression = new Array();
                                                    var logo_rodzafer_android_click = new Array();
                                                    var logo_rodzafer_android_siteId = new Array();
                                                    var logo_rodzafer_android_siteName = new Array();
                                                    var logo_rodzafer_android_ctr = new Array();

                                                    //////////////////FORMAT VIDEO//////////////////////

                                                    var videoImpressions = new Array();
                                                    var videoClicks = new Array();
                                                    var videoSiteId = new Array();
                                                    var videoSitename = new Array();
                                                    var videoFormatName = new Array();
                                                    var videoCTR = new Array();
                                                    var videoComplete = new Array();

                                                    var video_linfo_impression = new Array();
                                                    var video_linfo_click = new Array();
                                                    var video_linfo_siteId = new Array();
                                                    var video_linfo_siteName = new Array();
                                                    var video_linfo_ctr = new Array();
                                                    var video_linfo_complete = new Array();

                                                    var video_linfo_android_impression = new Array();
                                                    var video_linfo_android_click = new Array();
                                                    var video_linfo_android_siteId = new Array();
                                                    var video_linfo_android_siteName = new Array();
                                                    var video_linfo_android_ctr = new Array();
                                                    var video_linfo_android_complete = new Array();

                                                    var video_linfo_ios_impression = new Array();
                                                    var video_linfo_ios_click = new Array();
                                                    var video_linfo_ios_siteId = new Array();
                                                    var video_linfo_ios_siteName = new Array();
                                                    var video_linfo_ios_ctr = new Array();
                                                    var video_linfo_ios_complete = new Array();

                                                    var video_dtj_impression = new Array();
                                                    var video_dtj_click = new Array();
                                                    var video_dtj_siteId = new Array();
                                                    var video_dtj_siteName = new Array();
                                                    var video_dtj_ctr = new Array();
                                                    var video_dtj_complete = new Array();

                                                    var video_antenne_impression = new Array();
                                                    var video_antenne_click = new Array();
                                                    var video_antenne_siteId = new Array();
                                                    var video_antenne_siteName = new Array();
                                                    var video_antenne_ctr = new Array();
                                                    var video_antenne_complete = new Array();

                                                    var video_orange_impression = new Array();
                                                    var video_orange_click = new Array();
                                                    var video_orange_siteId = new Array();
                                                    var video_orange_siteName = new Array();
                                                    var video_orange_ctr = new Array();
                                                    var video_orange_complete = new Array();

                                                    var video_tf1_impression = new Array();
                                                    var video_tf1_click = new Array();
                                                    var video_tf1_siteId = new Array();
                                                    var video_tf1_siteName = new Array();
                                                    var video_tf1_ctr = new Array();
                                                    var video_tf1_complete = new Array();

                                                    var video_m6_impression = new Array();
                                                    var video_m6_click = new Array();
                                                    var video_m6_siteId = new Array();
                                                    var video_m6_siteName = new Array();
                                                    var video_m6_ctr = new Array();
                                                    var video_m6_complete = new Array();

                                                    var video_dailymotion_impression = new Array();
                                                    var video_dailymotion_click = new Array();
                                                    var video_dailymotion_siteId = new Array();
                                                    var video_dailymotion_siteName = new Array();
                                                    var video_dailymotion_ctr = new Array();
                                                    var video_dailymotion_complete = new Array();

                                                    var video_actu_ios_impression = new Array();
                                                    var video_actu_ios_click = new Array();
                                                    var video_actu_ios_siteId = new Array();
                                                    var video_actu_ios_siteName = new Array();
                                                    var video_actu_ios_ctr = new Array();
                                                    var video_actu_ios_complete = new Array();

                                                    var video_actu_android_impression = new Array();
                                                    var video_actu_android_click = new Array();
                                                    var video_actu_android_siteId = new Array();
                                                    var video_actu_android_siteName = new Array();
                                                    var video_actu_android_ctr = new Array();
                                                    var video_actu_android_complete = new Array();

                                                    var video_rodzafer_impression = new Array();
                                                    var video_rodzafer_click = new Array();
                                                    var video_rodzafer_siteId = new Array();
                                                    var video_rodzafer_siteName = new Array();
                                                    var video_rodzafer_ctr = new Array();
                                                    var video_rodzafer_complete = new Array();

                                                    var video_rodzafer_ios_impression = new Array();
                                                    var video_rodzafer_ios_click = new Array();
                                                    var video_rodzafer_ios_siteId = new Array();
                                                    var video_rodzafer_ios_siteName = new Array();
                                                    var video_rodzafer_ios_ctr = new Array();
                                                    var video_rodzafer_ios_complete = new Array();

                                                    var video_rodzafer_android_impression = new Array();
                                                    var video_rodzafer_android_click = new Array();
                                                    var video_rodzafer_android_siteId = new Array();
                                                    var video_rodzafer_android_siteName = new Array();
                                                    var video_rodzafer_android_ctr = new Array();
                                                    var video_rodzafer_android_complete = new Array();

                                                    // ////////////FORMAT rectangle_video////////////////////// regex sur les
                                                    // insertions name si il y a match push dans le tableau qui correspond au format
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
                                                        if (word.match(/^\RECTANGLE VIDEO{1}/gim)) {
                                                            rectangle_video.push(index);
                                                        }
                                                        if (word.match(/^\\SLIDER{1}/gim)) {
                                                            slider.push(index);
                                                        }
                                                    });

                                                    async function videoArrayElements(element, index, array) {

                                                        videoImpressions.push(eval(Array_Impressions[element]));
                                                        videoClicks.push(eval(Array_Clicks[element]));
                                                        videoSiteId.push(Array_SiteID[element]);
                                                        videoSitename.push(Array_SiteName[element]);
                                                        videoFormatName.push(Array_FormatName[element]);
                                                        videoComplete.push(eval(Array_Complete[element]));
                                                        let v = Math.round(Array_ClickRate[element] * 100) / 100
                                                        videoCTR.push(v);

                                                        //sous traitement des array / filtre par format et par site LINFO.re
                                                        if (Array_SiteID[element] === "322433") {
                                                            video_linfo_impression.push(eval(Array_Impressions[element]));
                                                            video_linfo_click.push(eval(Array_Clicks[element]));
                                                            video_linfo_siteId.push(Array_SiteID[element]);
                                                            video_linfo_siteName.push(Array_SiteName[element]);
                                                            video_linfo_complete.push(eval(Array_Complete[element]));

                                                        }
                                                        //LINFO_android
                                                        if (Array_SiteID[element] === "299249") {

                                                            video_linfo_android_impression.push(eval(Array_Impressions[element]));
                                                            video_linfo_android_click.push(eval(Array_Clicks[element]));
                                                            video_linfo_android_siteId.push(Array_SiteID[element]);
                                                            video_linfo_android_siteName.push(Array_SiteName[element]);
                                                            video_linfo_android_complete.push(eval(Array_Complete[element]));

                                                        }
                                                        //LINFO_ios

                                                        if (Array_SiteID[element] === "299248") {

                                                            video_linfo_ios_impression.push(eval(Array_Impressions[element]));
                                                            video_linfo_ios_click.push(eval(Array_Clicks[element]));
                                                            video_linfo_ios_siteId.push(Array_SiteID[element]);
                                                            video_linfo_ios_siteName.push(Array_SiteName[element]);
                                                            video_linfo_ios_complete.push(eval(Array_Complete[element]));

                                                        }

                                                        if (Array_SiteID[element] === "323124") {

                                                            video_dtj_impression.push(eval(Array_Impressions[element]));
                                                            video_dtj_click.push(eval(Array_Clicks[element]));
                                                            video_dtj_siteId.push(Array_SiteID[element]);
                                                            video_dtj_siteName.push(Array_SiteName[element]);
                                                            video_dtj_complete.push(eval(Array_Complete[element]));

                                                        }

                                                        if (Array_SiteID[element] === "299263") {

                                                            video_antenne_impression.push(eval(Array_Impressions[element]));
                                                            video_antenne_click.push(eval(Array_Clicks[element]));
                                                            video_antenne_siteId.push(Array_SiteID[element]);
                                                            video_antenne_siteName.push(Array_SiteName[element]);
                                                            video_antenne_complete.push(eval(Array_Complete[element]));

                                                        }
                                                        if (Array_SiteID[element] === "299252") {
                                                            video_orange_impression.push(eval(Array_Impressions[element]));
                                                            video_orange_click.push(eval(Array_Clicks[element]));
                                                            video_orange_siteId.push(Array_SiteID[element]);
                                                            video_orange_siteName.push(Array_SiteName[element]);
                                                            video_orange_complete.push(eval(Array_Complete[element]));

                                                        }
                                                        if (Array_SiteID[element] === "299245") {
                                                            video_tf1_impression.push(eval(Array_Impressions[element]));
                                                            video_tf1_click.push(eval(Array_Clicks[element]));
                                                            video_tf1_siteId.push(Array_SiteID[element]);
                                                            video_tf1_siteName.push(Array_SiteName[element]);
                                                            video_tf1_complete.push(eval(Array_Complete[element]));

                                                        }
                                                        if (Array_SiteID[element] === "299244") {

                                                            video_m6_impression.push(eval(Array_Impressions[element]));
                                                            video_m6_click.push(eval(Array_Clicks[element]));
                                                            video_m6_siteId.push(Array_SiteID[element]);
                                                            video_m6_siteName.push(Array_SiteName[element]);
                                                            video_m6_complete.push(eval(Array_Complete[element]));

                                                        }
                                                        if (Array_SiteID[element] === "337707") {
                                                            video_dailymotion_impression.push(eval(Array_Impressions[element]));
                                                            video_dailymotion_click.push(eval(Array_Clicks[element]));
                                                            video_dailymotion_siteId.push(Array_SiteID[element]);
                                                            video_dailymotion_siteName.push(Array_SiteName[element]);
                                                            video_dailymotion_complete.push(eval(Array_Complete[element]));

                                                        }
                                                        if (Array_SiteID[element] === "299253") {
                                                            video_actu_ios_impression.push(eval(Array_Impressions[element]));
                                                            video_actu_ios_click.push(eval(Array_Clicks[element]));
                                                            video_actu_ios_siteId.push(Array_SiteID[element]);
                                                            video_actu_ios_siteName.push(Array_SiteName[element]);
                                                            video_actu_ios_complete.push(eval(Array_Complete[element]));

                                                        }
                                                        if (Array_SiteID[element] === "299254") {
                                                            video_actu_android_impression.push(eval(Array_Impressions[element]));
                                                            video_actu_android_click.push(eval(Array_Clicks[element]));
                                                            video_actu_android_siteId.push(Array_SiteID[element]);
                                                            video_actu_android_siteName.push(Array_SiteName[element]);
                                                            video_actu_android_complete.push(eval(Array_Complete[element]));

                                                        }

                                                    }

                                                    // Function foreach qui met dans un tableau les impressions correspondant au
                                                    // format
                                                    async function interstitielArrayElements(element, index, array) {
                                                        // Rajouter les immpresions  et clics des formats
                                                        interstitielImpressions.push(eval(Array_Impressions[element]));
                                                        interstitielClicks.push(eval(Array_Clicks[element]));
                                                        interstitielSitename.push(Array_SiteName[element]);
                                                        interstitielFormatName.push(Array_FormatName[element]);
                                                        let i = Math.round(Array_ClickRate[element] * 100) / 100
                                                        interstitielCTR.push(i);

                                                        //sous traitement des array / filtre par format et par site
                                                        if (Array_SiteID[element] === "322433") {
                                                            interstitiel_linfo_impression.push(eval(Array_Impressions[element]));
                                                            interstitiel_linfo_click.push(eval(Array_Clicks[element]));
                                                            interstitiel_linfo_siteId.push(Array_SiteID[element]);
                                                            interstitiel_linfo_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299249") {

                                                            interstitiel_linfo_android_impression.push(eval(Array_Impressions[element]));
                                                            interstitiel_linfo_android_click.push(eval(Array_Clicks[element]));
                                                            interstitiel_linfo_android_siteId.push(Array_SiteID[element]);
                                                            interstitiel_linfo_android_siteName.push(Array_SiteName[element]);

                                                        }

                                                        if (Array_SiteID[element] === "299248") {

                                                            interstitiel_linfo_ios_impression.push(eval(Array_Impressions[element]));
                                                            interstitiel_linfo_ios_click.push(eval(Array_Clicks[element]));
                                                            interstitiel_linfo_ios_siteId.push(Array_SiteID[element]);
                                                            interstitiel_linfo_ios_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "323124") {

                                                            interstitiel_dtj_impression.push(eval(Array_Impressions[element]));
                                                            interstitiel_dtj_click.push(eval(Array_Clicks[element]));
                                                            interstitiel_dtj_siteId.push(Array_SiteID[element]);
                                                            interstitiel_dtj_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299263") {

                                                            interstitiel_antenne_impression.push(eval(Array_Impressions[element]));
                                                            interstitiel_antenne_click.push(eval(Array_Clicks[element]));
                                                            interstitiel_antenne_siteId.push(Array_SiteID[element]);
                                                            interstitiel_antenne_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299252") {
                                                            interstitiel_orange_impression.push(eval(Array_Impressions[element]));
                                                            interstitiel_orange_click.push(eval(Array_Clicks[element]));
                                                            interstitiel_orange_siteId.push(Array_SiteID[element]);
                                                            interstitiel_orange_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299245") {
                                                            interstitiel_tf1_impression.push(eval(Array_Impressions[element]));
                                                            interstitiel_tf1_click.push(eval(Array_Clicks[element]));
                                                            interstitiel_tf1_siteId.push(Array_SiteID[element]);
                                                            interstitiel_tf1_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299244") {
                                                            interstitiel_m6_impression.push(eval(Array_Impressions[element]));
                                                            interstitiel_m6_click.push(eval(Array_Clicks[element]));
                                                            interstitiel_m6_siteId.push(Array_SiteID[element]);
                                                            interstitiel_m6_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "337707") {
                                                            interstitiel_dailymotion_impression.push(eval(Array_Impressions[element]));
                                                            interstitiel_dailymotion_click.push(eval(Array_Clicks[element]));
                                                            interstitiel_dailymotion_siteId.push(Array_SiteID[element]);
                                                            interstitiel_dailymotion_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299253") {
                                                            interstitiel_actu_ios_impression.push(eval(Array_Impressions[element]));
                                                            interstitiel_actu_ios_click.push(eval(Array_Clicks[element]));
                                                            interstitiel_actu_ios_siteId.push(Array_SiteID[element]);
                                                            interstitiel_actu_ios_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299254") {
                                                            interstitiel_actu_android_impression.push(eval(Array_Impressions[element]));
                                                            interstitiel_actu_android_click.push(eval(Array_Clicks[element]));
                                                            interstitiel_actu_android_siteId.push(Array_SiteID[element]);
                                                            interstitiel_actu_android_siteName.push(Array_SiteName[element]);
                                                        }

                                                    }
                                                    // Function foreach qui met dans un tableau les impressions correspondant au
                                                    // format
                                                    async function habillageArrayElements(element, index, array) {

                                                        // Rajouter les immpresions  et clics des formats
                                                        habillageImpressions.push(eval(Array_Impressions[element]));
                                                        habillageClicks.push(eval(Array_Clicks[element]));
                                                        habillageSiteId.push(Array_SiteID[element]);
                                                        habillageSitename.push(Array_SiteName[element]);
                                                        habillageFormatName.push(Array_FormatName[element]);
                                                        let h = Math.round(Array_ClickRate[element] * 100) / 100;
                                                        habillageCTR.push(h);

                                                        //sous traitement des array / filtre par format et par site
                                                        if (Array_SiteID[element] === "322433") {
                                                            habillage_linfo_impression.push(eval(Array_Impressions[element]));
                                                            habillage_linfo_click.push(eval(Array_Clicks[element]));
                                                            habillage_linfo_siteId.push(Array_SiteID[element]);
                                                            habillage_linfo_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299249") {

                                                            habillage_linfo_android_impression.push(eval(Array_Impressions[element]));
                                                            habillage_linfo_android_click.push(eval(Array_Clicks[element]));
                                                            habillage_linfo_android_siteId.push(Array_SiteID[element]);
                                                            habillage_linfo_android_siteName.push(Array_SiteName[element]);

                                                        }

                                                        if (Array_SiteID[element] === "299248") {

                                                            habillage_linfo_ios_impression.push(eval(Array_Impressions[element]));
                                                            habillage_linfo_ios_click.push(eval(Array_Clicks[element]));
                                                            habillage_linfo_ios_siteId.push(Array_SiteID[element]);
                                                            habillage_linfo_ios_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "323124") {

                                                            habillage_dtj_impression.push(eval(Array_Impressions[element]));
                                                            habillage_dtj_click.push(eval(Array_Clicks[element]));
                                                            habillage_dtj_siteId.push(Array_SiteID[element]);
                                                            habillage_dtj_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299263") {
                                                            habillage_antenne_impression.push(eval(Array_Impressions[element]));
                                                            habillage_antenne_click.push(eval(Array_Clicks[element]));
                                                            habillage_antenne_siteId.push(Array_SiteID[element]);
                                                            habillage_antenne_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299252") {

                                                            habillage_orange_impression.push(eval(Array_Impressions[element]));
                                                            habillage_orange_click.push(eval(Array_Clicks[element]));
                                                            habillage_orange_siteId.push(Array_SiteID[element]);
                                                            habillage_orange_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299245") {
                                                            habillage_tf1_impression.push(eval(Array_Impressions[element]));
                                                            habillage_tf1_click.push(eval(Array_Clicks[element]));
                                                            habillage_tf1_siteId.push(Array_SiteID[element]);
                                                            habillage_tf1_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299244") {
                                                            habillage_m6_impression.push(eval(Array_Impressions[element]));
                                                            habillage_m6_click.push(eval(Array_Clicks[element]));
                                                            habillage_m6_siteId.push(Array_SiteID[element]);
                                                            habillage_m6_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "337707") {
                                                            habillage_dailymotion_impression.push(eval(Array_Impressions[element]));
                                                            habillage_dailymotion_click.push(eval(Array_Clicks[element]));
                                                            habillage_dailymotion_siteId.push(Array_SiteID[element]);
                                                            habillage_dailymotion_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299253") {
                                                            habillage_actu_ios_impression.push(eval(Array_Impressions[element]));
                                                            habillage_actu_ios_click.push(eval(Array_Clicks[element]));
                                                            habillage_actu_ios_siteId.push(Array_SiteID[element]);
                                                            habillage_actu_ios_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299254") {
                                                            habillage_actu_android_impression.push(eval(Array_Impressions[element]));
                                                            habillage_actu_android_click.push(eval(Array_Clicks[element]));
                                                            habillage_actu_android_siteId.push(Array_SiteID[element]);
                                                            habillage_actu_android_siteName.push(Array_SiteName[element]);
                                                        }
                                                    }
                                                    async function mastheadArrayElements(element, index, array) {
                                                        mastheadImpressions.push(eval(Array_Impressions[element]));
                                                        mastheadClicks.push(eval(Array_Clicks[element]));
                                                        mastheadSitename.push(Array_SiteName[element]);
                                                        mastheadFormatName.push(Array_FormatName[element]);
                                                        let m = Math.round(Array_ClickRate[element] * 100) / 100
                                                        mastheadCTR.push(m);

                                                        //sous traitement des array / filtre par format et par site
                                                        if (Array_SiteID[element] === "322433") {
                                                            masthead_linfo_impression.push(eval(Array_Impressions[element]));
                                                            masthead_linfo_click.push(eval(Array_Clicks[element]));
                                                            masthead_linfo_siteId.push(Array_SiteID[element]);
                                                            masthead_linfo_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299249") {

                                                            masthead_linfo_android_impression.push(eval(Array_Impressions[element]));
                                                            masthead_linfo_android_click.push(eval(Array_Clicks[element]));
                                                            masthead_linfo_android_siteId.push(Array_SiteID[element]);
                                                            masthead_linfo_android_siteName.push(Array_SiteName[element]);

                                                        }

                                                        if (Array_SiteID[element] === "299248") {

                                                            masthead_linfo_ios_impression.push(eval(Array_Impressions[element]));
                                                            masthead_linfo_ios_click.push(eval(Array_Clicks[element]));
                                                            masthead_linfo_ios_siteId.push(Array_SiteID[element]);
                                                            masthead_linfo_ios_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "323124") {

                                                            masthead_dtj_impression.push(eval(Array_Impressions[element]));
                                                            masthead_dtj_click.push(eval(Array_Clicks[element]));
                                                            masthead_dtj_siteId.push(Array_SiteID[element]);
                                                            masthead_dtj_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299263") {
                                                            masthead_antenne_impression.push(eval(Array_Impressions[element]));
                                                            masthead_antenne_click.push(eval(Array_Clicks[element]));
                                                            masthead_antenne_siteId.push(Array_SiteID[element]);
                                                            masthead_antenne_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299252") {
                                                            masthead_orange_impression.push(eval(Array_Impressions[element]));
                                                            masthead_orange_click.push(eval(Array_Clicks[element]));
                                                            masthead_orange_siteId.push(Array_SiteID[element]);
                                                            masthead_orange_siteName.push(Array_SiteName[element]);
                                                        }

                                                        if (Array_SiteID[element] === "299245") {
                                                            masthead_tf1_impression.push(eval(Array_Impressions[element]));
                                                            masthead_tf1_click.push(eval(Array_Clicks[element]));
                                                            masthead_tf1_siteId.push(Array_SiteID[element]);
                                                            masthead_tf1_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299244") {
                                                            masthead_m6_impression.push(eval(Array_Impressions[element]));
                                                            masthead_m6_click.push(eval(Array_Clicks[element]));
                                                            masthead_m6_siteId.push(Array_SiteID[element]);
                                                            masthead_m6_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "337707") {
                                                            masthead_dailymotion_impression.push(eval(Array_Impressions[element]));
                                                            masthead_dailymotion_click.push(eval(Array_Clicks[element]));
                                                            masthead_dailymotion_siteId.push(Array_SiteID[element]);
                                                            masthead_dailymotion_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299253") {
                                                            masthead_actu_ios_impression.push(eval(Array_Impressions[element]));
                                                            masthead_actu_ios_click.push(eval(Array_Clicks[element]));
                                                            masthead_actu_ios_siteId.push(Array_SiteID[element]);
                                                            masthead_actu_ios_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299254") {
                                                            masthead_actu_android_impression.push(eval(Array_Impressions[element]));
                                                            masthead_actu_android_click.push(eval(Array_Clicks[element]));
                                                            masthead_actu_android_siteId.push(Array_SiteID[element]);
                                                            masthead_actu_android_siteName.push(Array_SiteName[element]);
                                                        }

                                                    }
                                                    async function grand_angleArrayElements(element, index, array) {
                                                        // Rajouter les immpresions  et clics des formats
                                                        grand_angleImpressions.push(eval(Array_Impressions[element]));
                                                        grand_angleClicks.push(eval(Array_Clicks[element]));
                                                        grand_angleSitename.push(Array_SiteName[element]);
                                                        grand_angleFormatName.push(Array_FormatName[element]);
                                                        let g = Math.round(Array_ClickRate[element] * 100) / 100;
                                                        grand_angleCTR.push(g);

                                                        //sous traitement des array / filtre par format et par site
                                                        if (Array_SiteID[element] === "322433") {

                                                            grand_angle_linfo_impression.push(eval(Array_Impressions[element]));
                                                            grand_angle_linfo_click.push(eval(Array_Clicks[element]));
                                                            grand_angle_linfo_siteId.push(Array_SiteID[element]);
                                                            grand_angle_linfo_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299249") {

                                                            grand_angle_linfo_android_impression.push(eval(Array_Impressions[element]));
                                                            grand_angle_linfo_android_click.push(eval(Array_Clicks[element]));
                                                            grand_angle_linfo_android_siteId.push(Array_SiteID[element]);
                                                            grand_angle_linfo_android_siteName.push(Array_SiteName[element]);

                                                        }

                                                        if (Array_SiteID[element] === "299248") {

                                                            grand_angle_linfo_ios_impression.push(eval(Array_Impressions[element]));
                                                            grand_angle_linfo_ios_click.push(eval(Array_Clicks[element]));
                                                            grand_angle_linfo_ios_siteId.push(Array_SiteID[element]);
                                                            grand_angle_linfo_ios_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "323124") {

                                                            grand_angle_dtj_impression.push(eval(Array_Impressions[element]));
                                                            grand_angle_dtj_click.push(eval(Array_Clicks[element]));
                                                            grand_angle_dtj_siteId.push(Array_SiteID[element]);
                                                            grand_angle_dtj_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299263") {

                                                            grand_angle_antenne_impression.push(eval(Array_Impressions[element]));
                                                            grand_angle_antenne_click.push(eval(Array_Clicks[element]));
                                                            grand_angle_antenne_siteId.push(Array_SiteID[element]);
                                                            grand_angle_antenne_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299252") {
                                                            grand_angle_orange_impression.push(eval(Array_Impressions[element]));
                                                            grand_angle_orange_click.push(eval(Array_Clicks[element]));
                                                            grand_angle_orange_siteId.push(Array_SiteID[element]);
                                                            grand_angle_orange_siteName.push(Array_SiteName[element]);

                                                        }

                                                        if (Array_SiteID[element] === "299245") {
                                                            grand_angle_tf1_impression.push(eval(Array_Impressions[element]));
                                                            grand_angle_tf1_click.push(eval(Array_Clicks[element]));
                                                            grand_angle_tf1_siteId.push(Array_SiteID[element]);
                                                            grand_angle_tf1_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299244") {
                                                            grand_angle_m6_impression.push(eval(Array_Impressions[element]));
                                                            grand_angle_m6_click.push(eval(Array_Clicks[element]));
                                                            grand_angle_m6_siteId.push(Array_SiteID[element]);
                                                            grand_angle_m6_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "337707") {
                                                            grand_angle_dailymotion_impression.push(eval(Array_Impressions[element]));
                                                            grand_angle_dailymotion_click.push(eval(Array_Clicks[element]));
                                                            grand_angle_dailymotion_siteId.push(Array_SiteID[element]);
                                                            grand_angle_dailymotion_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299253") {
                                                            grand_angle_actu_ios_impression.push(eval(Array_Impressions[element]));
                                                            grand_angle_actu_ios_click.push(eval(Array_Clicks[element]));
                                                            grand_angle_actu_ios_siteId.push(Array_SiteID[element]);
                                                            grand_angle_actu_ios_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299254") {
                                                            grand_angle_actu_android_impression.push(eval(Array_Impressions[element]));
                                                            grand_angle_actu_android_click.push(eval(Array_Clicks[element]));
                                                            grand_angle_actu_android_siteId.push(Array_SiteID[element]);
                                                            grand_angle_actu_android_siteName.push(Array_SiteName[element]);

                                                        }

                                                    }

                                                    async function nativeArrayElements(element, index, array) {
                                                        nativeImpressions.push(eval(Array_Impressions[element]));
                                                        nativeClicks.push(eval(Array_Clicks[element]));
                                                        nativeSitename.push(Array_SiteName[element]);
                                                        nativeFormatName.push(Array_FormatName[element]);
                                                        let n = Math.round(Array_ClickRate[element] * 100) / 100;
                                                        nativeCTR.push(n);

                                                        //sous traitement des array / filtre par format et par site

                                                        if (Array_SiteID[element] === "322433") {
                                                            native_linfo_impression.push(eval(Array_Impressions[element]));
                                                            native_linfo_click.push(eval(Array_Clicks[element]));
                                                            native_linfo_siteId.push(Array_SiteID[element]);
                                                            native_linfo_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299249") {

                                                            native_linfo_android_impression.push(eval(Array_Impressions[element]));
                                                            native_linfo_android_click.push(eval(Array_Clicks[element]));
                                                            native_linfo_android_siteId.push(Array_SiteID[element]);
                                                            native_linfo_android_siteName.push(Array_SiteName[element]);

                                                        }

                                                        if (Array_SiteID[element] === "299248") {

                                                            native_linfo_ios_impression.push(eval(Array_Impressions[element]));
                                                            native_linfo_ios_click.push(eval(Array_Clicks[element]));
                                                            native_linfo_ios_siteId.push(Array_SiteID[element]);
                                                            native_linfo_ios_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "323124") {

                                                            native_dtj_impression.push(eval(Array_Impressions[element]));
                                                            native_dtj_click.push(eval(Array_Clicks[element]));
                                                            native_dtj_siteId.push(Array_SiteID[element]);
                                                            native_dtj_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299263") {
                                                            native_antenne_impression.push(eval(Array_Impressions[element]));
                                                            native_antenne_click.push(eval(Array_Clicks[element]));
                                                            native_antenne_siteId.push(Array_SiteID[element]);
                                                            native_antenne_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299252") {
                                                            native_orange_impression.push(eval(Array_Impressions[element]));
                                                            native_orange_click.push(eval(Array_Clicks[element]));
                                                            native_orange_siteId.push(Array_SiteID[element]);
                                                            native_orange_siteName.push(Array_SiteName[element]);

                                                        }
                                                        if (Array_SiteID[element] === "299245") {
                                                            native_tf1_impression.push(eval(Array_Impressions[element]));
                                                            native_tf1_click.push(eval(Array_Clicks[element]));
                                                            native_tf1_siteId.push(Array_SiteID[element]);
                                                            native_tf1_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299244") {
                                                            native_m6_impression.push(eval(Array_Impressions[element]));
                                                            native_m6_click.push(eval(Array_Clicks[element]));
                                                            native_m6_siteId.push(Array_SiteID[element]);
                                                            native_m6_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "337707") {
                                                            native_dailymotion_impression.push(eval(Array_Impressions[element]));
                                                            native_dailymotion_click.push(eval(Array_Clicks[element]));
                                                            native_dailymotion_siteId.push(Array_SiteID[element]);
                                                            native_dailymotion_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299253") {
                                                            native_actu_ios_impression.push(eval(Array_Impressions[element]));
                                                            native_actu_ios_click.push(eval(Array_Clicks[element]));
                                                            native_actu_ios_siteId.push(Array_SiteID[element]);
                                                            native_actu_ios_siteName.push(Array_SiteName[element]);
                                                        }
                                                        if (Array_SiteID[element] === "299254") {
                                                            native_actu_android_impression.push(eval(Array_Impressions[element]));
                                                            native_actu_android_click.push(eval(Array_Clicks[element]));
                                                            native_actu_android_siteId.push(Array_SiteID[element]);
                                                            native_actu_android_siteName.push(Array_SiteName[element]);

                                                        }

                                                    }
                                                    async function rectangle_videoArrayElements(element, index, array) {
                                                        rectanglevideoImpressions.push(eval(Array_Impressions[element]));
                                                        rectanglevideoClicks.push(eval(Array_Clicks[element]));
                                                        rectanglevideoSitename.push(Array_SiteName[element]);
                                                        rectanglevideoFormatName.push(Array_FormatName[element]);
                                                        let m = Math.round(Array_ClickRate[element] * 100) / 100
                                                        rectanglevideoCTR.push(m);

                                                        switch (Array_SiteID[element]) {
                                                                //sous traitement des array / filtre par format et par site
                                                            case "322433":
                                                                rectangle_video_linfo_impression.push(eval(Array_Impressions[element]));
                                                                rectangle_video_linfo_click.push(eval(Array_Clicks[element]));
                                                                rectangle_video_linfo_siteId.push(Array_SiteID[element]);
                                                                rectangle_video_linfo_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299249":
                                                                rectangle_video_linfo_android_impression.push(eval(Array_Impressions[element]));
                                                                rectangle_video_linfo_android_click.push(eval(Array_Clicks[element]));
                                                                rectangle_video_linfo_android_siteId.push(Array_SiteID[element]);
                                                                rectangle_video_linfo_android_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299248":
                                                                rectangle_video_linfo_ios_impression.push(eval(Array_Impressions[element]));
                                                                rectangle_video_linfo_ios_click.push(eval(Array_Clicks[element]));
                                                                rectangle_video_linfo_ios_siteId.push(Array_SiteID[element]);
                                                                rectangle_video_linfo_ios_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "323124":
                                                                rectangle_video_dtj_impression.push(eval(Array_Impressions[element]));
                                                                rectangle_video_dtj_click.push(eval(Array_Clicks[element]));
                                                                rectangle_video_dtj_siteId.push(Array_SiteID[element]);
                                                                rectangle_video_dtj_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299263":
                                                                rectangle_video_antenne_impression.push(eval(Array_Impressions[element]));
                                                                rectangle_video_antenne_click.push(eval(Array_Clicks[element]));
                                                                rectangle_video_antenne_siteId.push(Array_SiteID[element]);
                                                                rectangle_video_antenne_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299252":
                                                                rectangle_video_orange_impression.push(eval(Array_Impressions[element]));
                                                                rectangle_video_orange_click.push(eval(Array_Clicks[element]));
                                                                rectangle_video_orange_siteId.push(Array_SiteID[element]);
                                                                rectangle_video_orange_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299245":
                                                                rectangle_video_tf1_impression.push(eval(Array_Impressions[element]));
                                                                rectangle_video_tf1_click.push(eval(Array_Clicks[element]));
                                                                rectangle_video_tf1_siteId.push(Array_SiteID[element]);
                                                                rectangle_video_tf1_siteName.push(Array_SiteName[element]);

                                                                break;
                                                            case "299244":
                                                                rectangle_video_m6_impression.push(eval(Array_Impressions[element]));
                                                                rectangle_video_m6_click.push(eval(Array_Clicks[element]));
                                                                rectangle_video_m6_siteId.push(Array_SiteID[element]);
                                                                rectangle_video_m6_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "337707":
                                                                rectangle_video_dailymotion_impression.push(eval(Array_Impressions[element]));
                                                                rectangle_video_dailymotion_click.push(eval(Array_Clicks[element]));
                                                                rectangle_video_dailymotion_siteId.push(Array_SiteID[element]);
                                                                rectangle_video_dailymotion_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299253":
                                                                rectangle_video_actu_ios_impression.push(eval(Array_Impressions[element]));
                                                                rectangle_video_actu_ios_click.push(eval(Array_Clicks[element]));
                                                                rectangle_video_actu_ios_siteId.push(Array_SiteID[element]);
                                                                rectangle_video_actu_ios_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299254":
                                                                rectangle_video_actu_android_impression.push(eval(Array_Impressions[element]));
                                                                rectangle_video_actu_android_click.push(eval(Array_Clicks[element]));
                                                                rectangle_video_actu_android_siteId.push(Array_SiteID[element]);
                                                                rectangle_video_actu_android_siteName.push(Array_SiteName[element]);
                                                                break;

                                                        }

                                                    }

                                                    async function sliderArrayElements(element, index, array) {
                                                        sliderImpressions.push(eval(Array_Impressions[element]));
                                                        sliderClicks.push(eval(Array_Clicks[element]));
                                                        sliderSitename.push(Array_SiteName[element]);
                                                        sliderFormatName.push(Array_FormatName[element]);
                                                        let m = Math.round(Array_ClickRate[element] * 100) / 100
                                                        sliderCTR.push(m);

                                                        switch (Array_SiteID[element]) {
                                                                //sous traitement des array / filtre par format et par site
                                                            case "322433":
                                                                slider_linfo_impression.push(eval(Array_Impressions[element]));
                                                                slider_linfo_click.push(eval(Array_Clicks[element]));
                                                                slider_linfo_siteId.push(Array_SiteID[element]);
                                                                slider_linfo_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299249":
                                                                slider_linfo_android_impression.push(eval(Array_Impressions[element]));
                                                                slider_linfo_android_click.push(eval(Array_Clicks[element]));
                                                                slider_linfo_android_siteId.push(Array_SiteID[element]);
                                                                slider_linfo_android_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299248":
                                                                slider_linfo_ios_impression.push(eval(Array_Impressions[element]));
                                                                slider_linfo_ios_click.push(eval(Array_Clicks[element]));
                                                                slider_linfo_ios_siteId.push(Array_SiteID[element]);
                                                                slider_linfo_ios_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "323124":
                                                                slider_dtj_impression.push(eval(Array_Impressions[element]));
                                                                slider_dtj_click.push(eval(Array_Clicks[element]));
                                                                slider_dtj_siteId.push(Array_SiteID[element]);
                                                                slider_dtj_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299263":
                                                                slider_antenne_impression.push(eval(Array_Impressions[element]));
                                                                slider_antenne_click.push(eval(Array_Clicks[element]));
                                                                slider_antenne_siteId.push(Array_SiteID[element]);
                                                                slider_antenne_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299252":
                                                                slider_orange_impression.push(eval(Array_Impressions[element]));
                                                                slider_orange_click.push(eval(Array_Clicks[element]));
                                                                slider_orange_siteId.push(Array_SiteID[element]);
                                                                slider_orange_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299245":
                                                                slider_tf1_impression.push(eval(Array_Impressions[element]));
                                                                slider_tf1_click.push(eval(Array_Clicks[element]));
                                                                slider_tf1_siteId.push(Array_SiteID[element]);
                                                                slider_tf1_siteName.push(Array_SiteName[element]);

                                                                break;
                                                            case "299244":
                                                                slider_m6_impression.push(eval(Array_Impressions[element]));
                                                                slider_m6_click.push(eval(Array_Clicks[element]));
                                                                slider_m6_siteId.push(Array_SiteID[element]);
                                                                slider_m6_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "337707":
                                                                slider_dailymotion_impression.push(eval(Array_Impressions[element]));
                                                                slider_dailymotion_click.push(eval(Array_Clicks[element]));
                                                                slider_dailymotion_siteId.push(Array_SiteID[element]);
                                                                slider_dailymotion_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299253":
                                                                slider_actu_ios_impression.push(eval(Array_Impressions[element]));
                                                                slider_actu_ios_click.push(eval(Array_Clicks[element]));
                                                                slider_actu_ios_siteId.push(Array_SiteID[element]);
                                                                slider_actu_ios_siteName.push(Array_SiteName[element]);
                                                                break;
                                                            case "299254":
                                                                slider_actu_android_impression.push(eval(Array_Impressions[element]));
                                                                slider_actu_android_click.push(eval(Array_Clicks[element]));
                                                                slider_actu_android_siteId.push(Array_SiteID[element]);
                                                                slider_actu_android_siteName.push(Array_SiteName[element]);
                                                                break;

                                                        }

                                                    }

                                                    // Récupére les données pour chaque format
                                                    interstitiel.forEach(interstitielArrayElements);
                                                    habillage.forEach(habillageArrayElements);
                                                    masthead.forEach(mastheadArrayElements);
                                                    grand_angle.forEach(grand_angleArrayElements);
                                                    native.forEach(nativeArrayElements);
                                                    video.forEach(videoArrayElements);
                                                    rectangle_video.forEach(rectangle_videoArrayElements);
                                                    slider.forEach(sliderArrayElements);

                                                    //calcule la somme total par format et site
                                                    const somme_array = (accumulator, currentValue) => accumulator + currentValue;

                                                    var total_impressions_linfoHabillage = habillage_linfo_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfoHabillage = habillage_linfo_click.reduce(somme_array, 0);

                                                    var total_impressions_linfo_androidHabillage = habillage_linfo_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_androidHabillage = habillage_linfo_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_iosHabillage = habillage_linfo_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_iosHabillage = habillage_linfo_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_dtjHabillage = habillage_dtj_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dtjHabillage = habillage_dtj_click.reduce(somme_array, 0);

                                                    var total_impressions_antenneHabillage = habillage_antenne_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_antenneHabillage = habillage_antenne_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_orangeHabillage = habillage_orange_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_orangeHabillage = habillage_orange_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_tf1Habillage = habillage_tf1_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_tf1Habillage = habillage_tf1_click.reduce(somme_array, 0);

                                                    var total_impressions_m6Habillage = habillage_m6_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_m6Habillage = habillage_m6_click.reduce(somme_array, 0);

                                                    var total_impressions_dailymotionHabillage = habillage_dailymotion_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dailymotionHabillage = habillage_dailymotion_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_iosHabillage = habillage_actu_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_iosHabillage = habillage_actu_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_androidHabillage = habillage_actu_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_androidHabillage = habillage_actu_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    ///////////////////////////

                                                    var total_impressions_linfoGrandAngle = grand_angle_linfo_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfoGrandAngle = grand_angle_linfo_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_androidGrandAngle = grand_angle_linfo_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_androidGrandAngle = grand_angle_linfo_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_iosGrandAngle = grand_angle_linfo_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_iosGrandAngle = grand_angle_linfo_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_dtjGrandAngle = grand_angle_dtj_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dtjGrandAngle = grand_angle_dtj_click.reduce(somme_array, 0)

                                                    var total_impressions_antenneGrandAngle = grand_angle_antenne_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_antenneGrandAngle = grand_angle_antenne_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_orangeGrandAngle = grand_angle_orange_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_orangeGrandAngle = grand_angle_orange_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_tf1GrandAngle = grand_angle_tf1_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_tf1GrandAngle = grand_angle_tf1_click.reduce(somme_array, 0);

                                                    var total_impressions_m6GrandAngle = grand_angle_m6_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_m6GrandAngle = grand_angle_m6_click.reduce(somme_array, 0);

                                                    var total_impressions_dailymotionGrandAngle = grand_angle_dailymotion_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dailymotionGrandAngle = grand_angle_dailymotion_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_iosGrandAngle = grand_angle_actu_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_iosGrandAngle = grand_angle_actu_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_androidGrandAngle = grand_angle_actu_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_androidGrandAngle = grand_angle_actu_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    /////////////////////////
                                                    var total_impressions_linfoVideo = video_linfo_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfoVideo = video_linfo_click.reduce(somme_array, 0);
                                                    var total_complete_linfoVideo = video_linfo_complete.reduce(somme_array, 0);

                                                    var total_impressions_linfo_androidVideo = video_linfo_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_androidVideo = video_linfo_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_complete_linfo_androidVideo = video_linfo_android_complete.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_iosVideo = video_linfo_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_iosVideo = video_linfo_ios_click.reduce(somme_array, 0);
                                                    var total_complete_linfo_iosVideo = video_linfo_ios_complete.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_dtjVideo = video_dtj_impression.reduce(somme_array, 0);
                                                    var total_clicks_dtjVideo = video_dtj_click.reduce(somme_array, 0);
                                                    var total_complete_dtjVideo = video_dtj_complete.reduce(somme_array, 0);

                                                    var total_impressions_antenneVideo = video_antenne_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_antenneVideo = video_antenne_click.reduce(somme_array, 0);
                                                    var total_complete_antenneVideo = video_antenne_complete.reduce(somme_array, 0);

                                                    var total_impressions_orangeVideo = video_orange_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_orangeVideo = video_orange_click.reduce(somme_array, 0);
                                                    var total_complete_orangeVideo = video_orange_complete.reduce(somme_array, 0);

                                                    var total_impressions_tf1Video = video_tf1_impression.reduce(somme_array, 0);
                                                    var total_clicks_tf1Video = video_tf1_click.reduce(somme_array, 0);
                                                    var total_complete_tf1Video = video_tf1_complete.reduce(somme_array, 0);

                                                    var total_impressions_m6Video = video_m6_impression.reduce(somme_array, 0);
                                                    var total_clicks_m6Video = video_m6_click.reduce(somme_array, 0);
                                                    var total_complete_m6Video = video_m6_complete.reduce(somme_array, 0);

                                                    var total_impressions_dailymotionVideo = video_dailymotion_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dailymotionVideo = video_dailymotion_click.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_complete_dailymotionVideo = video_dailymotion_complete.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_iosVideo = video_actu_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_iosVideo = video_actu_ios_click.reduce(somme_array, 0);
                                                    var total_complete_actu_iosVideo = video_actu_ios_complete.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_androidVideo = video_actu_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_androidVideo = video_actu_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_complete_actu_androidVideo = video_actu_android_complete.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    /////////////////////
                                                    var total_impressions_linfoInterstitiel = interstitiel_linfo_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfoInterstitiel = interstitiel_linfo_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_androidInterstitiel = interstitiel_linfo_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_androidInterstitiel = interstitiel_linfo_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_iosInterstitiel = interstitiel_linfo_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_iosInterstitiel = interstitiel_linfo_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_dtjInterstitiel = interstitiel_dtj_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dtjInterstitiel = interstitiel_dtj_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_antenneInterstitiel = interstitiel_antenne_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_antenneInterstitiel = interstitiel_antenne_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_orangeInterstitiel = interstitiel_orange_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_orangeInterstitiel = interstitiel_orange_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_tf1Interstitiel = interstitiel_tf1_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_tf1Interstitiel = interstitiel_tf1_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_m6Interstitiel = interstitiel_m6_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_m6Interstitiel = interstitiel_m6_click.reduce(somme_array, 0);

                                                    var total_impressions_dailymotionInterstitiel = interstitiel_dailymotion_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dailymotionInterstitiel = interstitiel_dailymotion_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_iosInterstitiel = interstitiel_actu_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_iosInterstitiel = interstitiel_actu_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_androidInterstitiel = interstitiel_actu_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_androidInterstitiel = interstitiel_actu_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    /////////////////
                                                    var total_impressions_linfoMasthead = masthead_linfo_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfoMasthead = masthead_linfo_click.reduce(somme_array, 0);

                                                    var total_impressions_linfo_androidMasthead = masthead_linfo_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_androidMasthead = masthead_linfo_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_iosMasthead = masthead_linfo_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_iosMasthead = masthead_linfo_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_dtjMasthead = masthead_dtj_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dtjMasthead = masthead_dtj_click.reduce(somme_array, 0);

                                                    var total_impressions_antenneMasthead = masthead_antenne_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_antenneMasthead = masthead_antenne_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_orangeMasthead = masthead_orange_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_orangeMasthead = masthead_orange_click.reduce(somme_array, 0);

                                                    var total_impressions_tf1Masthead = masthead_tf1_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_tf1Masthead = masthead_tf1_click.reduce(somme_array, 0);

                                                    var total_impressions_m6Masthead = masthead_m6_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_m6Masthead = masthead_m6_click.reduce(somme_array, 0);

                                                    var total_impressions_dailymotionMasthead = masthead_dailymotion_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dailymotionMasthead = masthead_dailymotion_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_iosMasthead = masthead_actu_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_iosMasthead = masthead_actu_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_androidMasthead = masthead_actu_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_androidMasthead = masthead_actu_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    //////////////////////
                                                    var total_impressions_linfoNative = native_linfo_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfoNative = native_linfo_click.reduce(somme_array, 0);

                                                    var total_impressions_linfo_androidNative = native_linfo_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_androidNative = native_linfo_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_iosNative = native_linfo_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_iosNative = native_linfo_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_dtjNative = native_dtj_impression.reduce(somme_array, 0);
                                                    var total_clicks_dtjNative = native_dtj_click.reduce(somme_array, 0);

                                                    var total_impressions_antenneNative = native_antenne_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_antenneNative = native_antenne_click.reduce(somme_array, 0);

                                                    var total_impressions_orangeNative = native_orange_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_orangeNative = native_orange_click.reduce(somme_array, 0);

                                                    var total_impressions_tf1Native = native_tf1_impression.reduce(somme_array, 0);
                                                    var total_clicks_tf1Native = native_tf1_click.reduce(somme_array, 0);

                                                    var total_impressions_m6Native = native_m6_impression.reduce(somme_array, 0);
                                                    var total_clicks_m6Native = native_m6_click.reduce(somme_array, 0);

                                                    var total_impressions_dailymotionNative = native_dailymotion_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dailymotionNative = native_dailymotion_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_iosNative = native_actu_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_iosNative = native_actu_ios_click.reduce(somme_array, 0);

                                                    var total_impressions_actu_androidNative = native_actu_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_androidNative = native_actu_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    ////////////////////////////////
                                                    var total_impressions_linfoRectangleVideo = rectangle_video_linfo_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfoRectangleVideo = rectangle_video_linfo_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_androidRectangleVideo = rectangle_video_linfo_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_androidRectangleVideo = rectangle_video_linfo_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_iosRectangleVideo = rectangle_video_linfo_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_iosRectangleVideo = rectangle_video_linfo_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_dtjRectangleVideo = rectangle_video_dtj_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dtjRectangleVideo = rectangle_video_dtj_click.reduce(
                                                        somme_array,
                                                        0
                                                    )

                                                    var total_impressions_antenneRectangleVideo = rectangle_video_antenne_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_antenneRectangleVideo = rectangle_video_antenne_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_orangeRectangleVideo = rectangle_video_orange_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_orangeRectangleVideo = rectangle_video_orange_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_tf1RectangleVideo = rectangle_video_tf1_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_tf1RectangleVideo = rectangle_video_tf1_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_m6RectangleVideo = rectangle_video_m6_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_m6RectangleVideo = rectangle_video_m6_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_dailymotionRectangleVideo = rectangle_video_dailymotion_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dailymotionRectangleVideo = rectangle_video_dailymotion_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_iosRectangleVideo = rectangle_video_actu_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_iosRectangleVideo = rectangle_video_actu_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_androidRectangleVideo = rectangle_video_actu_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_androidRectangleVideo = rectangle_video_actu_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    //////////////////////////////////////////

                                                    var total_impressions_linfoSlider = slider_linfo_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfoSlider = slider_linfo_click.reduce(somme_array, 0);

                                                    var total_impressions_linfo_androidSlider = slider_linfo_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_androidSlider = slider_linfo_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_iosSlider = slider_linfo_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_iosSlider = slider_linfo_ios_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_dtjSlider = slider_dtj_impression.reduce(somme_array, 0);
                                                    var total_clicks_dtjSlider = slider_dtj_click.reduce(somme_array, 0)

                                                    var total_impressions_antenneSlider = slider_antenne_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_antenneSlider = slider_antenne_click.reduce(somme_array, 0);

                                                    var total_impressions_orangeSlider = slider_orange_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_orangeSlider = slider_orange_click.reduce(somme_array, 0);

                                                    var total_impressions_tf1Slider = slider_tf1_impression.reduce(somme_array, 0);
                                                    var total_clicks_tf1Slider = slider_tf1_click.reduce(somme_array, 0);

                                                    var total_impressions_m6Slider = slider_m6_impression.reduce(somme_array, 0);
                                                    var total_clicks_m6Slider = slider_m6_click.reduce(somme_array, 0);

                                                    var total_impressions_dailymotionSlider = slider_dailymotion_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dailymotionSlider = slider_dailymotion_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_iosSlider = slider_actu_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_iosSlider = slider_actu_ios_click.reduce(somme_array, 0);

                                                    var total_impressions_actu_androidSlider = slider_actu_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_androidSlider = slider_actu_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    //////////////////////////////////////////

                                                    var total_impressions_linfoLogo = logo_linfo_impression.reduce(somme_array, 0);
                                                    var total_clicks_linfoLogo = logo_linfo_click.reduce(somme_array, 0);

                                                    var total_impressions_linfo_androidLogo = logo_linfo_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_androidLogo = logo_linfo_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_linfo_iosLogo = logo_linfo_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_linfo_iosLogo = logo_linfo_ios_click.reduce(somme_array, 0);

                                                    var total_impressions_dtjLogo = logo_dtj_impression.reduce(somme_array, 0);
                                                    var total_clicks_dtjLogo = logo_dtj_click.reduce(somme_array, 0)

                                                    var total_impressions_antenneLogo = logo_antenne_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_antenneLogo = logo_antenne_click.reduce(somme_array, 0);

                                                    var total_impressions_orangeLogo = logo_orange_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_orangeLogo = logo_orange_click.reduce(somme_array, 0);

                                                    var total_impressions_tf1Logo = logo_tf1_impression.reduce(somme_array, 0);
                                                    var total_clicks_tf1Logo = logo_tf1_click.reduce(somme_array, 0);

                                                    var total_impressions_m6Logo = logo_m6_impression.reduce(somme_array, 0);
                                                    var total_clicks_m6Logo = logo_m6_click.reduce(somme_array, 0);

                                                    var total_impressions_dailymotionLogo = logo_dailymotion_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_dailymotionLogo = logo_dailymotion_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    var total_impressions_actu_iosLogo = logo_actu_ios_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_iosLogo = logo_actu_ios_click.reduce(somme_array, 0);

                                                    var total_impressions_actu_androidLogo = logo_actu_android_impression.reduce(
                                                        somme_array,
                                                        0
                                                    );
                                                    var total_clicks_actu_androidLogo = logo_actu_android_click.reduce(
                                                        somme_array,
                                                        0
                                                    );

                                                    // ///////////////////////////////////////////// calcule le ctr total par format
                                                    // et site
                                                    let h_linfo = (total_clicks_linfoHabillage / total_impressions_linfoHabillage) * 100;
                                                    habillage_linfo_ctr.push(h_linfo.toFixed(2));

                                                    let h_linfo_android = (
                                                        total_clicks_linfo_androidHabillage / total_impressions_linfo_androidHabillage
                                                    ) * 100;
                                                    habillage_linfo_android_ctr.push(h_linfo_android.toFixed(2));

                                                    let h_linfo_ios = (
                                                        total_clicks_linfo_iosHabillage / total_impressions_linfo_iosHabillage
                                                    ) * 100;
                                                    habillage_linfo_ios_ctr.push(h_linfo_ios.toFixed(2));

                                                    let h_dtj = (total_clicks_dtjHabillage / total_impressions_dtjHabillage) * 100;
                                                    habillage_dtj_ctr.push(h_dtj.toFixed(2));

                                                    let h_antenne = (
                                                        total_clicks_antenneHabillage / total_impressions_antenneHabillage
                                                    ) * 100;
                                                    habillage_antenne_ctr.push(h_antenne.toFixed(2));

                                                    let h_orange = (
                                                        total_clicks_orangeHabillage / total_impressions_orangeHabillage
                                                    ) * 100;
                                                    habillage_orange_ctr.push(h_orange.toFixed(2));

                                                    let h_tf1 = (total_clicks_tf1Habillage / total_impressions_tf1Habillage) * 100;
                                                    habillage_tf1_ctr.push(h_tf1.toFixed(2));

                                                    let h_m6 = (total_clicks_m6Habillage / total_impressions_m6Habillage) * 100;
                                                    habillage_m6_ctr.push(h_m6.toFixed(2));

                                                    let h_dailymotion = (
                                                        total_clicks_dailymotionHabillage / total_impressions_dailymotionHabillage
                                                    ) * 100;
                                                    habillage_dailymotion_ctr.push(h_dailymotion.toFixed(2));

                                                    let h_actu_ios = (
                                                        total_clicks_actu_iosHabillage / total_impressions_actu_iosHabillage
                                                    ) * 100;
                                                    habillage_actu_ios_ctr.push(h_actu_ios.toFixed(2));

                                                    let h_actu_android = (
                                                        total_clicks_actu_androidHabillage / total_impressions_actu_androidHabillage
                                                    ) * 100;
                                                    habillage_actu_android_ctr.push(h_actu_android.toFixed(2));
                                                    //////////////////
                                                    let ga_linfo = (
                                                        total_clicks_linfoGrandAngle / total_impressions_linfoGrandAngle
                                                    ) * 100;
                                                    grand_angle_linfo_ctr.push(ga_linfo.toFixed(2));

                                                    let ga_linfo_android = (
                                                        total_clicks_linfo_androidGrandAngle / total_impressions_linfo_androidGrandAngle
                                                    ) * 100;
                                                    grand_angle_linfo_android_ctr.push(ga_linfo_android.toFixed(2));

                                                    let ga_linfo_ios = (
                                                        total_clicks_linfo_iosGrandAngle / total_impressions_linfo_iosGrandAngle
                                                    ) * 100;
                                                    grand_angle_linfo_ios_ctr.push(ga_linfo_ios.toFixed(2));

                                                    let ga_dtj = (total_clicks_dtjGrandAngle / total_impressions_dtjGrandAngle) * 100;
                                                    grand_angle_dtj_ctr.push(ga_dtj.toFixed(2));

                                                    let ga_antenne = (
                                                        total_clicks_antenneGrandAngle / total_impressions_antenneGrandAngle
                                                    ) * 100;
                                                    grand_angle_antenne_ctr.push(ga_antenne.toFixed(2));

                                                    let ga_orange = (
                                                        total_clicks_orangeGrandAngle / total_impressions_orangeGrandAngle
                                                    ) * 100;
                                                    grand_angle_orange_ctr.push(ga_orange.toFixed(2));

                                                    let ga_tf1 = (total_clicks_tf1GrandAngle / total_impressions_tf1GrandAngle) * 100;
                                                    grand_angle_tf1_ctr.push(ga_tf1.toFixed(2));

                                                    let ga_m6 = (total_clicks_m6GrandAngle / total_impressions_m6GrandAngle) * 100;
                                                    grand_angle_m6_ctr.push(ga_m6.toFixed(2));

                                                    let ga_dailymotion = (
                                                        total_clicks_dailymotionGrandAngle / total_impressions_dailymotionGrandAngle
                                                    ) * 100;
                                                    grand_angle_dailymotion_ctr.push(ga_dailymotion.toFixed(2));

                                                    let ga_actu_ios = (
                                                        total_clicks_actu_iosGrandAngle / total_impressions_actu_iosGrandAngle
                                                    ) * 100;
                                                    grand_angle_actu_ios_ctr.push(ga_actu_ios.toFixed(2));

                                                    let ga_actu_android = (
                                                        total_clicks_actu_androidGrandAngle / total_impressions_actu_androidGrandAngle
                                                    ) * 100;
                                                    grand_angle_actu_android_ctr.push(ga_actu_android.toFixed(2));
                                                    //////////////////

                                                    let i_linfo = (
                                                        total_clicks_linfoInterstitiel / total_impressions_linfoInterstitiel
                                                    ) * 100;
                                                    interstitiel_linfo_ctr.push(i_linfo.toFixed(2));

                                                    let i_linfo_android = (
                                                        total_clicks_linfo_androidInterstitiel / total_impressions_linfo_androidInterstitiel
                                                    ) * 100;
                                                    interstitiel_linfo_android_ctr.push(i_linfo_android.toFixed(2));

                                                    let i_linfo_ios = (
                                                        total_clicks_linfo_iosInterstitiel / total_impressions_linfo_iosInterstitiel
                                                    ) * 100;
                                                    interstitiel_linfo_ios_ctr.push(i_linfo_ios.toFixed(2));

                                                    let i_dtj = (total_clicks_dtjInterstitiel / total_impressions_dtjInterstitiel) * 100;
                                                    interstitiel_dtj_ctr.push(i_dtj.toFixed(2));

                                                    let i_antenne = (
                                                        total_clicks_antenneInterstitiel / total_impressions_antenneInterstitiel
                                                    ) * 100;
                                                    interstitiel_antenne_ctr.push(i_antenne.toFixed(2));

                                                    let i_orange = (
                                                        total_clicks_orangeInterstitiel / total_impressions_orangeInterstitiel
                                                    ) * 100;
                                                    interstitiel_orange_ctr.push(i_orange.toFixed(2));

                                                    let i_tf1 = (total_clicks_tf1Interstitiel / total_impressions_tf1Interstitiel) * 100;
                                                    interstitiel_tf1_ctr.push(i_tf1.toFixed(2));

                                                    let i_m6 = (total_clicks_m6Interstitiel / total_impressions_m6Interstitiel) * 100;
                                                    interstitiel_m6_ctr.push(i_m6.toFixed(2));

                                                    let i_dailymotion = (
                                                        total_clicks_dailymotionInterstitiel / total_impressions_dailymotionInterstitiel
                                                    ) * 100;
                                                    interstitiel_dailymotion_ctr.push(i_dailymotion.toFixed(2));

                                                    let i_actu_ios = (
                                                        total_clicks_actu_iosInterstitiel / total_impressions_actu_iosInterstitiel
                                                    ) * 100;
                                                    interstitiel_actu_ios_ctr.push(i_actu_ios.toFixed(2));

                                                    let i_actu_android = (
                                                        total_clicks_actu_androidInterstitiel / total_impressions_actu_androidInterstitiel
                                                    ) * 100;
                                                    interstitiel_actu_android_ctr.push(i_actu_android.toFixed(2));
                                                    //////////////////

                                                    let m_linfo = (total_clicks_linfoMasthead / total_impressions_linfoMasthead) * 100;
                                                    masthead_linfo_ctr.push(m_linfo.toFixed(2));

                                                    let m_linfo_android = (
                                                        total_clicks_linfo_androidMasthead / total_impressions_linfo_androidMasthead
                                                    ) * 100;
                                                    masthead_linfo_android_ctr.push(m_linfo_android.toFixed(2));

                                                    let m_linfo_ios = (
                                                        total_clicks_linfo_iosMasthead / total_impressions_linfo_iosMasthead
                                                    ) * 100;
                                                    masthead_linfo_ios_ctr.push(m_linfo_ios.toFixed(2));

                                                    let m_dtj = (total_clicks_dtjMasthead / total_impressions_dtjMasthead) * 100;
                                                    masthead_dtj_ctr.push(m_dtj.toFixed(2));

                                                    let m_antenne = (
                                                        total_clicks_antenneMasthead / total_impressions_antenneMasthead
                                                    ) * 100;
                                                    masthead_antenne_ctr.push(m_antenne.toFixed(2));

                                                    let m_orange = (total_clicks_orangeMasthead / total_impressions_orangeMasthead) * 100;
                                                    masthead_orange_ctr.push(m_orange.toFixed(2));

                                                    let m_tf1 = (total_clicks_tf1Masthead / total_impressions_tf1Masthead) * 100;
                                                    masthead_tf1_ctr.push(m_tf1.toFixed(2));

                                                    let m_m6 = (total_clicks_m6Masthead / total_impressions_m6Masthead) * 100;
                                                    masthead_m6_ctr.push(m_m6.toFixed(2));

                                                    let m_dailymotion = (
                                                        total_clicks_dailymotionMasthead / total_impressions_dailymotionMasthead
                                                    ) * 100;
                                                    masthead_dailymotion_ctr.push(m_dailymotion.toFixed(2));

                                                    let m_actu_ios = (
                                                        total_clicks_actu_iosMasthead / total_impressions_actu_iosMasthead
                                                    ) * 100;
                                                    masthead_actu_ios_ctr.push(m_actu_ios.toFixed(2));

                                                    let m_actu_android = (
                                                        total_clicks_actu_androidMasthead / total_impressions_actu_androidMasthead
                                                    ) * 100;
                                                    masthead_actu_android_ctr.push(m_actu_android.toFixed(2));
                                                    //////////////////

                                                    let n_linfo = (total_clicks_linfoNative / total_impressions_linfoNative) * 100;
                                                    native_linfo_ctr.push(n_linfo.toFixed(2));

                                                    let n_linfo_android = (
                                                        total_clicks_linfo_androidNative / total_impressions_linfo_androidNative
                                                    ) * 100;
                                                    native_linfo_android_ctr.push(n_linfo_android.toFixed(2));

                                                    let n_linfo_ios = (
                                                        total_clicks_linfo_iosNative / total_impressions_linfo_iosNative
                                                    ) * 100;
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

                                                    let n_dailymotion = (
                                                        total_clicks_dailymotionNative / total_impressions_dailymotionNative
                                                    ) * 100;
                                                    native_dailymotion_ctr.push(n_dailymotion.toFixed(2));

                                                    let n_actu_ios = (
                                                        total_clicks_actu_iosNative / total_impressions_actu_iosNative
                                                    ) * 100;
                                                    native_actu_ios_ctr.push(n_actu_ios.toFixed(2));

                                                    let n_actu_android = (
                                                        total_clicks_actu_androidNative / total_impressions_actu_androidNative
                                                    ) * 100;
                                                    native_actu_android_ctr.push(n_actu_android.toFixed(2));
                                                    //////////////////

                                                    let v_linfo = (total_clicks_linfoVideo / total_impressions_linfoVideo) * 100;
                                                    video_linfo_ctr.push(v_linfo.toFixed(2));

                                                    let v_linfo_android = (
                                                        total_clicks_linfo_androidVideo / total_impressions_linfo_androidVideo
                                                    ) * 100;
                                                    video_linfo_android_ctr.push(v_linfo_android.toFixed(2));

                                                    let v_linfo_ios = (
                                                        total_clicks_linfo_iosVideo / total_impressions_linfo_iosVideo
                                                    ) * 100;
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

                                                    let v_dailymotion = (
                                                        total_clicks_dailymotionVideo / total_impressions_dailymotionVideo
                                                    ) * 100;
                                                    video_dailymotion_ctr.push(v_dailymotion.toFixed(2));

                                                    let v_actu_ios = (total_clicks_actu_iosVideo / total_impressions_actu_iosVideo) * 100;
                                                    video_actu_ios_ctr.push(v_actu_ios.toFixed(2));

                                                    let v_actu_android = (
                                                        total_clicks_actu_androidVideo / total_impressions_actu_androidVideo
                                                    ) * 100;
                                                    video_actu_android_ctr.push(v_actu_android.toFixed(2));

                                                    ////////////////////////////// ////////////////
                                                    let rv_linfo = (
                                                        total_clicks_linfoRectangleVideo / total_impressions_linfoRectangleVideo
                                                    ) * 100;
                                                    rectangle_video_linfo_ctr.push(rv_linfo.toFixed(2));

                                                    let rv_linfo_android = (
                                                        total_clicks_linfo_androidRectangleVideo / total_impressions_linfo_androidRectangleVideo
                                                    ) * 100;
                                                    rectangle_video_linfo_android_ctr.push(rv_linfo_android.toFixed(2));

                                                    let rv_linfo_ios = (
                                                        total_clicks_linfo_iosRectangleVideo / total_impressions_linfo_iosRectangleVideo
                                                    ) * 100;
                                                    rectangle_video_linfo_ios_ctr.push(rv_linfo_ios.toFixed(2));

                                                    let rv_dtj = (
                                                        total_clicks_dtjRectangleVideo / total_impressions_dtjRectangleVideo
                                                    ) * 100;
                                                    rectangle_video_dtj_ctr.push(rv_dtj.toFixed(2));

                                                    let rv_antenne = (
                                                        total_clicks_antenneRectangleVideo / total_impressions_antenneRectangleVideo
                                                    ) * 100;
                                                    rectangle_video_antenne_ctr.push(rv_antenne.toFixed(2));

                                                    let rv_orange = (
                                                        total_clicks_orangeRectangleVideo / total_impressions_orangeRectangleVideo
                                                    ) * 100;
                                                    rectangle_video_orange_ctr.push(rv_orange.toFixed(2));

                                                    let rv_tf1 = (
                                                        total_clicks_tf1RectangleVideo / total_impressions_tf1RectangleVideo
                                                    ) * 100;
                                                    rectangle_video_tf1_ctr.push(rv_tf1.toFixed(2));

                                                    let rv_m6 = (
                                                        total_clicks_m6RectangleVideo / total_impressions_m6RectangleVideo
                                                    ) * 100;
                                                    rectangle_video_m6_ctr.push(rv_m6.toFixed(2));

                                                    let rv_dailymotion = (
                                                        total_clicks_dailymotionRectangleVideo / total_impressions_dailymotionRectangleVideo
                                                    ) * 100;
                                                    rectangle_video_dailymotion_ctr.push(rv_dailymotion.toFixed(2));

                                                    let rv_actu_ios = (
                                                        total_clicks_actu_iosRectangleVideo / total_impressions_actu_iosRectangleVideo
                                                    ) * 100;
                                                    rectangle_video_actu_ios_ctr.push(rv_actu_ios.toFixed(2));

                                                    let rv_actu_android = (
                                                        total_clicks_actu_androidRectangleVideo / total_impressions_actu_androidRectangleVideo
                                                    ) * 100;
                                                    rectangle_video_actu_android_ctr.push(rv_actu_android.toFixed(2));

                                                    //////////////////
                                                    let sl_linfo = (total_clicks_linfoSlider / total_impressions_linfoSlider) * 100;
                                                    slider_linfo_ctr.push(sl_linfo.toFixed(2));

                                                    let sl_linfo_android = (
                                                        total_clicks_linfo_androidSlider / total_impressions_linfo_androidSlider
                                                    ) * 100;
                                                    slider_linfo_android_ctr.push(sl_linfo_android.toFixed(2));

                                                    let sl_linfo_ios = (
                                                        total_clicks_linfo_iosSlider / total_impressions_linfo_iosSlider
                                                    ) * 100;
                                                    slider_linfo_ios_ctr.push(sl_linfo_ios.toFixed(2));

                                                    let sl_dtj = (total_clicks_dtjSlider / total_impressions_dtjSlider) * 100;
                                                    slider_dtj_ctr.push(sl_dtj.toFixed(2));

                                                    let sl_antenne = (total_clicks_antenneSlider / total_impressions_antenneSlider) * 100;
                                                    slider_antenne_ctr.push(sl_antenne.toFixed(2));

                                                    let sl_orange = (total_clicks_orangeSlider / total_impressions_orangeSlider) * 100;
                                                    slider_orange_ctr.push(sl_orange.toFixed(2));

                                                    let sl_tf1 = (total_clicks_tf1Slider / total_impressions_tf1Slider) * 100;
                                                    slider_tf1_ctr.push(sl_tf1.toFixed(2));

                                                    let sl_m6 = (total_clicks_m6Slider / total_impressions_m6Slider) * 100;
                                                    slider_m6_ctr.push(sl_m6.toFixed(2));

                                                    let sl_dailymotion = (
                                                        total_clicks_dailymotionSlider / total_impressions_dailymotionSlider
                                                    ) * 100;
                                                    slider_dailymotion_ctr.push(sl_dailymotion.toFixed(2));

                                                    let sl_actu_ios = (
                                                        total_clicks_actu_iosSlider / total_impressions_actu_iosSlider
                                                    ) * 100;
                                                    slider_actu_ios_ctr.push(sl_actu_ios.toFixed(2));

                                                    let sl_actu_android = (
                                                        total_clicks_actu_androidSlider / total_impressions_actu_androidSlider
                                                    ) * 100;
                                                    slider_actu_android_ctr.push(sl_actu_android.toFixed(2));

                                                    //////////////////
                                                    let lo_linfo = (total_clicks_linfoLogo / total_impressions_linfoLogo) * 100;
                                                    logo_linfo_ctr.push(lo_linfo.toFixed(2));

                                                    let lo_linfo_android = (
                                                        total_clicks_linfo_androidLogo / total_impressions_linfo_androidLogo
                                                    ) * 100;
                                                    logo_linfo_android_ctr.push(lo_linfo_android.toFixed(2));

                                                    let lo_linfo_ios = (
                                                        total_clicks_linfo_iosLogo / total_impressions_linfo_iosLogo
                                                    ) * 100;
                                                    logo_linfo_ios_ctr.push(lo_linfo_ios.toFixed(2));

                                                    let lo_dtj = (total_clicks_dtjLogo / total_impressions_dtjLogo) * 100;
                                                    logo_dtj_ctr.push(lo_dtj.toFixed(2));

                                                    let lo_antenne = (total_clicks_antenneLogo / total_impressions_antenneLogo) * 100;
                                                    logo_antenne_ctr.push(lo_antenne.toFixed(2));

                                                    let lo_orange = (total_clicks_orangeLogo / total_impressions_orangeLogo) * 100;
                                                    logo_orange_ctr.push(lo_orange.toFixed(2));

                                                    let lo_tf1 = (total_clicks_tf1Logo / total_impressions_tf1Logo) * 100;
                                                    logo_tf1_ctr.push(lo_tf1.toFixed(2));

                                                    let lo_m6 = (total_clicks_m6Logo / total_impressions_m6Logo) * 100;
                                                    logo_m6_ctr.push(lo_m6.toFixed(2));

                                                    let lo_dailymotion = (
                                                        total_clicks_dailymotionLogo / total_impressions_dailymotionLogo
                                                    ) * 100;
                                                    logo_dailymotion_ctr.push(lo_dailymotion.toFixed(2));

                                                    let lo_actu_ios = (total_clicks_actu_iosLogo / total_impressions_actu_iosLogo) * 100;
                                                    logo_actu_ios_ctr.push(lo_actu_ios.toFixed(2));

                                                    let lo_actu_android = (
                                                        total_clicks_actu_androidLogo / total_impressions_actu_androidLogo
                                                    ) * 100;
                                                    logo_actu_android_ctr.push(lo_actu_android.toFixed(2));

                                                    // Function qui permet de calculer les éléments du tableau (calcul somme
                                                    // impression/clic par format)
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
                                                    var sommeRectangle_VideoImpression = rectanglevideoImpressions.reduce(
                                                        reducer,
                                                        0
                                                    );
                                                    var sommeRectangle_VideoClicks = rectanglevideoClicks.reduce(reducer, 0);
                                                    var sommeSliderImpression = sliderImpressions.reduce(reducer, 0);
                                                    var sommeSliderClicks = sliderClicks.reduce(reducer, 0);
                                                    var sommeLogoImpression = logoImpressions.reduce(reducer, 0);
                                                    var sommeLogoClicks = logoClicks.reduce(reducer, 0);
                                                }

                                                var total_impression_format = sommeHabillageImpression +
                                                        sommeGrand_AngleImpression +
                                                        sommeInterstitielImpression + sommeMastheadImpression +
                                                        sommeNativeImpression + sommeVideoImpression +
                                                        sommeRectangle_VideoImpression + sommeSliderImpression +
                                                        sommeLogoImpression;
                                                var total_click_format = sommeHabillageClicks +
                                                        sommeGrand_AngleClicks + sommeInterstitielClicks +
                                                        sommeMastheadClicks + sommeNativeClicks + sommeVideoClicks +
                                                        sommeRectangle_VideoClicks + sommeSliderClicks + sommeLogoClicks;

                                                //var TotalImpressions = 0 var TotalCliks = 0
                                                var TotalComplete = 0;
                                                //somme impression clic complete
                                                for (let i = 0; i < Array_Impressions.length; i++) {
                                                    if (Array_Impressions[i] != '') {
                                                        // TotalImpressions += parseInt(Array_Impressions[i]) TotalCliks +=
                                                        // parseInt(Array_Clicks[i])
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

                                                CTR_rectangle_video = (
                                                    sommeRectangle_VideoClicks / sommeRectangle_VideoImpression
                                                ) * 100;
                                                CTR_rectangle_video = CTR_rectangle_video.toFixed(2);

                                                CTR_slider = (sommeSliderClicks / sommeSliderImpression) * 100;
                                                CTR_slider = CTR_slider.toFixed(2);

                                                CTR_logo = (sommeLogoClicks / sommeLogoImpression) * 100;
                                                CTR_logo = CTR_logo.toFixed(2);

                                                // ///////////////////// Calcul des chiffre global %Taux clic Repetition %VTR
                                                Taux_VTR = (TotalComplete / sommeVideoImpression) * 100;
                                                VTR = Taux_VTR.toFixed(2);

                                                //Calcul du VTR par site pour le format VIDEO
                                                Taux_VTR_linfo = (total_complete_linfoVideo / total_impressions_linfoVideo) * 100;
                                                VTR_linfo = Taux_VTR_linfo.toFixed(2);
                                                // console.log(VTR_linfo)

                                                Taux_VTR_linfo_android = (
                                                    total_complete_linfo_androidVideo / total_impressions_linfo_androidVideo
                                                ) * 100;
                                                VTR_linfo_android = Taux_VTR_linfo_android.toFixed(2);
                                                // console.log(VTR_linfo_android)

                                                Taux_VTR_linfo_ios = (
                                                    total_complete_linfo_iosVideo / total_impressions_linfo_iosVideo
                                                ) * 100;
                                                VTR_linfo_ios = Taux_VTR_linfo_ios.toFixed(2);

                                                Taux_VTR_dtj = (total_complete_dtjVideo / total_impressions_dtjVideo) * 100;
                                                VTR_dtj = Taux_VTR_dtj.toFixed(2);

                                                Taux_VTR_antenne = (
                                                    total_complete_antenneVideo / total_impressions_antenneVideo
                                                ) * 100;
                                                VTR_antenne = Taux_VTR_antenne.toFixed(2);

                                                Taux_VTR_orange = (total_complete_orangeVideo / total_impressions_orangeVideo) * 100;
                                                VTR_orange = Taux_VTR_orange.toFixed(2);
                                                // console.log(VTR_orange)

                                                Taux_VTR_tf1 = (total_complete_tf1Video / total_impressions_tf1Video) * 100;
                                                VTR_tf1 = Taux_VTR_tf1.toFixed(2);
                                                //console.log(VTR_tf1)

                                                Taux_VTR_m6 = (total_complete_m6Video / total_impressions_m6Video) * 100;
                                                VTR_m6 = Taux_VTR_m6.toFixed(2);
                                                // console.log(VTR_m6)

                                                Taux_VTR_dailymotion = (
                                                    total_complete_dailymotionVideo / total_impressions_dailymotionVideo
                                                ) * 100;
                                                VTR_dailymotion = Taux_VTR_dailymotion.toFixed(2);
                                                //console.log(VTR_dailymotion)

                                                Taux_VTR_actu_ios = (
                                                    total_complete_actu_iosVideo / total_impressions_actu_iosVideo
                                                ) * 100;
                                                VTR_actu_ios = Taux_VTR_actu_ios.toFixed(2);
                                                //console.log(VTR_actu_ios)

                                                Taux_VTR_actu_android = (
                                                    total_complete_actu_androidVideo / total_impressions_actu_androidVideo
                                                ) * 100;
                                                VTR_actu_android = Taux_VTR_actu_android.toFixed(2);
                                                //console.log(VTR_actu_android)

                                                /*var Taux_clics = (TotalCliks / TotalImpressions) * 100
                          CTR = Taux_clics.toFixed(2);*/
                                                var Taux_clics = (total_click_format / total_impression_format) * 100;
                                                CTR = Taux_clics.toFixed(2);

                                                var Impression_vu = (total_impression_format / Total_VU);
                                                Repetition = Impression_vu.toFixed(2);

                                                // total impression / total clic / CTR par Video par site
                                                const reducer = (accumulator, currentValue) => accumulator + currentValue;
                                                var sommevideoImpressions = videoImpressions.reduce(reducer, 0);
                                                var sommevideoClics = videoClicks.reduce(reducer, 0);
                                                var videoCTR_clics = (videoClicks / videoImpressions) * 100;
                                                videoCTR_clics = videoCTR_clics.toFixed(2);

                                                // total impression / total clic / CTR par Habillage par site

                                                var sommehabillageImpressions = habillageImpressions.reduce(reducer, 0);
                                                var sommehabillageClics = habillageClicks.reduce(reducer, 0);
                                                var habillageCTR_clics = (sommehabillageClics / sommehabillageImpressions) * 100;
                                                habillageCTR_clics = habillageCTR_clics.toFixed(2);

                                                // total impression / total clic / CTR par Interstitiel par site
                                                var sommeinterstitielImpressions = interstitielImpressions.reduce(reducer, 0);
                                                var sommeinterstitielClics = interstitielClicks.reduce(reducer, 0);
                                                var interstitielCTR_clics = (
                                                    sommeinterstitielClics / sommeinterstitielImpressions
                                                ) * 100;
                                                interstitielCTR_clics = interstitielCTR_clics.toFixed(2);

                                                // total impression / total clic / CTR par Masthead par site
                                                var sommemastheadImpressions = mastheadImpressions.reduce(reducer, 0);
                                                var sommemastheadClics = mastheadClicks.reduce(reducer, 0);
                                                var mastheadCTR_clics = (sommemastheadClics / sommemastheadImpressions) * 100;
                                                mastheadCTR_clics = mastheadCTR_clics.toFixed(2);

                                                // total impression / total clic / CTR par grand_angle par site
                                                var sommegrand_angleImpressions = grand_angleImpressions.reduce(reducer, 0);
                                                var sommegrand_angleClics = grand_angleClicks.reduce(reducer, 0);
                                                var grand_angleCTR_clics = (
                                                    sommegrand_angleClics / sommegrand_angleImpressions
                                                ) * 100;
                                                grand_angleCTR_clics = grand_angleCTR_clics.toFixed(2);

                                                // total impression / total clic / CTR par native par site
                                                var sommenativeImpressions = nativeImpressions.reduce(reducer, 0);
                                                var sommenativeClics = nativeClicks.reduce(reducer, 0);
                                                var nativeCTR_clics = (sommenativeClics / sommenativeImpressions) * 100;
                                                nativeCTR_clics = nativeCTR_clics.toFixed(2);

                                                // total impression / total clic / CTR par rectangle_video par site
                                                var sommerectangle_videoImpressions = rectanglevideoImpressions.reduce(
                                                    reducer,
                                                    0
                                                );
                                                var sommerectangle_videoClics = rectanglevideoClicks.reduce(reducer, 0);
                                                var rectangle_videoCTR_clics = (
                                                    sommerectangle_videoClics / sommerectangle_videoImpressions
                                                ) * 100;
                                                rectangle_videoCTR_clics = rectangle_videoCTR_clics.toFixed(2);

                                                // total impression / total clic / CTR par slider par site
                                                var sommesliderImpressions = sliderImpressions.reduce(reducer, 0);
                                                var sommesliderClics = sliderClicks.reduce(reducer, 0);
                                                var sliderCTR_clics = (sommesliderClics / sommesliderImpressions) * 100;
                                                sliderCTR_clics = sliderCTR_clics.toFixed(2);

                                                // total impression / total clic / CTR par logo par site
                                                var sommelogoImpressions = logoImpressions.reduce(reducer, 0);
                                                var sommelogoClics = logoClicks.reduce(reducer, 0);
                                                var logoCTR_clics = (sommelogoClics / sommelogoImpressions) * 100;
                                                logoCTR_clics = logoCTR_clics.toFixed(2);

                                                total_impression_format = Utilities.numStr(total_impression_format);
                                                total_click_format = Utilities.numStr(total_click_format);
                                                Total_VU = Utilities.numStr(Total_VU);

                                                sommeVideoImpression = Utilities.numStr(sommeVideoImpression);
                                                sommeHabillageImpression = Utilities.numStr(sommeHabillageImpression);
                                                sommeInterstitielImpression = Utilities.numStr(sommeInterstitielImpression);
                                                sommeGrand_AngleImpression = Utilities.numStr(sommeGrand_AngleImpression);
                                                sommeMastheadImpression = Utilities.numStr(sommeMastheadImpression);
                                                sommeNativeImpression = Utilities.numStr(sommeNativeImpression);
                                                sommeRectangle_VideoImpression = Utilities.numStr(
                                                    sommeRectangle_VideoImpression
                                                );
                                                sommeSliderImpression = Utilities.numStr(sommeSliderImpression);
                                                sommeLogoImpression = Utilities.numStr(sommeLogoImpression);

                                                sommeVideoClicks = Utilities.numStr(sommeVideoClicks);
                                                sommeHabillageClicks = Utilities.numStr(sommeHabillageClicks);
                                                sommeInterstitielClicks = Utilities.numStr(sommeInterstitielClicks);
                                                sommeGrand_AngleClicks = Utilities.numStr(sommeGrand_AngleClicks);
                                                sommeMastheadClicks = Utilities.numStr(sommeMastheadClicks);
                                                sommeNativeClicks = Utilities.numStr(sommeNativeClicks);
                                                sommeRectangle_VideoClicks = Utilities.numStr(sommeRectangle_VideoClicks);
                                                sommeSliderClicks = Utilities.numStr(sommeSliderClicks);
                                                sommeLogoClicks = Utilities.numStr(sommeLogoClicks);
                                                TotalComplete = Utilities.numStr(TotalComplete);

                                                //SEPARATEUR DE MILLIER par format site

                                                total_impressions_linfoVideo = Utilities.numStr(total_impressions_linfoVideo);
                                                total_clicks_linfoVideo = Utilities.numStr(total_clicks_linfoVideo);
                                                total_impressions_linfo_androidVideo = Utilities.numStr(
                                                    total_impressions_linfo_androidVideo
                                                );
                                                total_clicks_linfo_androidVideo = Utilities.numStr(
                                                    total_clicks_linfo_androidVideo
                                                );
                                                total_impressions_linfo_iosVideo = Utilities.numStr(
                                                    total_impressions_linfo_iosVideo
                                                );
                                                total_clicks_linfo_iosVideo = Utilities.numStr(total_clicks_linfo_iosVideo);
                                                total_impressions_dtjVideo = Utilities.numStr(total_impressions_dtjVideo);
                                                total_clicks_dtjVideo = Utilities.numStr(total_clicks_dtjVideo);
                                                total_impressions_antenneVideo = Utilities.numStr(
                                                    total_impressions_antenneVideo
                                                );
                                                total_clicks_antenneVideo = Utilities.numStr(total_clicks_antenneVideo);
                                                total_impressions_orangeVideo = Utilities.numStr(total_impressions_orangeVideo);
                                                total_clicks_orangeVideo = Utilities.numStr(total_clicks_orangeVideo);
                                                total_impressions_tf1Video = Utilities.numStr(total_impressions_tf1Video);
                                                total_clicks_tf1Video = Utilities.numStr(total_clicks_tf1Video);
                                                total_impressions_m6Video = Utilities.numStr(total_impressions_m6Video);
                                                total_clicks_m6Video = Utilities.numStr(total_clicks_m6Video);
                                                total_impressions_dailymotionVideo = Utilities.numStr(
                                                    total_impressions_dailymotionVideo
                                                );
                                                total_clicks_dailymotionVideo = Utilities.numStr(total_clicks_dailymotionVideo);
                                                total_impressions_actu_iosVideo = Utilities.numStr(
                                                    total_impressions_actu_iosVideo
                                                );
                                                total_clicks_actu_iosVideo = Utilities.numStr(total_clicks_actu_iosVideo);
                                                total_impressions_actu_androidVideo = Utilities.numStr(
                                                    total_impressions_actu_androidVideo
                                                );
                                                total_clicks_actu_androidVideo = Utilities.numStr(
                                                    total_clicks_actu_androidVideo
                                                );

                                                total_impressions_linfoHabillage = Utilities.numStr(
                                                    total_impressions_linfoHabillage
                                                );
                                                total_clicks_linfoHabillage = Utilities.numStr(total_clicks_linfoHabillage);
                                                total_impressions_linfo_androidHabillage = Utilities.numStr(
                                                    total_impressions_linfo_androidHabillage
                                                );
                                                total_clicks_linfo_androidHabillage = Utilities.numStr(
                                                    total_clicks_linfo_androidHabillage
                                                );
                                                total_impressions_linfo_iosHabillage = Utilities.numStr(
                                                    total_impressions_linfo_iosHabillage
                                                );
                                                total_clicks_linfo_iosHabillage = Utilities.numStr(
                                                    total_clicks_linfo_iosHabillage
                                                );
                                                total_impressions_dtjHabillage = Utilities.numStr(
                                                    total_impressions_dtjHabillage
                                                );
                                                total_clicks_dtjHabillage = Utilities.numStr(total_clicks_dtjHabillage);
                                                total_impressions_antenneHabillage = Utilities.numStr(
                                                    total_impressions_antenneHabillage
                                                );
                                                total_clicks_antenneHabillage = Utilities.numStr(total_clicks_antenneHabillage);
                                                total_impressions_orangeHabillage = Utilities.numStr(
                                                    total_impressions_orangeHabillage
                                                );
                                                total_clicks_orangeHabillage = Utilities.numStr(total_clicks_orangeHabillage);
                                                total_impressions_tf1Habillage = Utilities.numStr(
                                                    total_impressions_tf1Habillage
                                                );
                                                total_clicks_tf1Habillage = Utilities.numStr(total_clicks_tf1Habillage);
                                                total_impressions_m6Habillage = Utilities.numStr(total_impressions_m6Habillage);
                                                total_clicks_m6Habillage = Utilities.numStr(total_clicks_m6Habillage);
                                                total_impressions_dailymotionHabillage = Utilities.numStr(
                                                    total_impressions_dailymotionHabillage
                                                );
                                                total_clicks_dailymotionHabillage = Utilities.numStr(
                                                    total_clicks_dailymotionHabillage
                                                );
                                                total_impressions_actu_iosHabillage = Utilities.numStr(
                                                    total_impressions_actu_iosHabillage
                                                );
                                                total_clicks_actu_iosHabillage = Utilities.numStr(
                                                    total_clicks_actu_iosHabillage
                                                );
                                                total_impressions_actu_androidHabillage = Utilities.numStr(
                                                    total_impressions_actu_androidHabillage
                                                );
                                                total_clicks_actu_androidHabillage = Utilities.numStr(
                                                    total_clicks_actu_androidHabillage
                                                );

                                                total_impressions_linfoInterstitiel = Utilities.numStr(
                                                    total_impressions_linfoInterstitiel
                                                );
                                                total_clicks_linfoInterstitiel = Utilities.numStr(
                                                    total_clicks_linfoInterstitiel
                                                );
                                                total_impressions_linfo_androidInterstitiel = Utilities.numStr(
                                                    total_impressions_linfo_androidInterstitiel
                                                );
                                                total_clicks_linfo_androidInterstitiel = Utilities.numStr(
                                                    total_clicks_linfo_androidInterstitiel
                                                );
                                                total_impressions_linfo_iosInterstitiel = Utilities.numStr(
                                                    total_impressions_linfo_iosInterstitiel
                                                );
                                                total_clicks_linfo_iosInterstitiel = Utilities.numStr(
                                                    total_clicks_linfo_iosInterstitiel
                                                );
                                                total_impressions_dtjInterstitiel = Utilities.numStr(
                                                    total_impressions_dtjInterstitiel
                                                );
                                                total_clicks_dtjInterstitiel = Utilities.numStr(total_clicks_dtjInterstitiel);
                                                total_impressions_antenneInterstitiel = Utilities.numStr(
                                                    total_impressions_antenneInterstitiel
                                                );
                                                total_clicks_antenneInterstitiel = Utilities.numStr(
                                                    total_clicks_antenneInterstitiel
                                                );
                                                total_impressions_orangeInterstitiel = Utilities.numStr(
                                                    total_impressions_orangeInterstitiel
                                                );
                                                total_clicks_orangeInterstitiel = Utilities.numStr(
                                                    total_clicks_orangeInterstitiel
                                                );
                                                total_impressions_tf1Interstitiel = Utilities.numStr(
                                                    total_impressions_tf1Interstitiel
                                                );
                                                total_clicks_tf1Interstitiel = Utilities.numStr(total_clicks_tf1Interstitiel);
                                                total_impressions_m6Interstitiel = Utilities.numStr(
                                                    total_impressions_m6Interstitiel
                                                );
                                                total_clicks_m6Interstitiel = Utilities.numStr(total_clicks_m6Interstitiel);
                                                total_impressions_dailymotionInterstitiel = Utilities.numStr(
                                                    total_impressions_dailymotionInterstitiel
                                                );
                                                total_clicks_dailymotionInterstitiel = Utilities.numStr(
                                                    total_clicks_dailymotionInterstitiel
                                                );
                                                total_impressions_actu_iosInterstitiel = Utilities.numStr(
                                                    total_impressions_actu_iosInterstitiel
                                                );
                                                total_clicks_actu_iosInterstitiel = Utilities.numStr(
                                                    total_clicks_actu_iosInterstitiel
                                                );
                                                total_impressions_actu_androidInterstitiel = Utilities.numStr(
                                                    total_impressions_actu_androidInterstitiel
                                                );
                                                total_clicks_actu_androidInterstitiel = Utilities.numStr(
                                                    total_clicks_actu_androidInterstitiel
                                                );

                                                total_impressions_linfoMasthead = Utilities.numStr(
                                                    total_impressions_linfoMasthead
                                                );
                                                total_clicks_linfoMasthead = Utilities.numStr(total_clicks_linfoMasthead);
                                                total_impressions_linfo_androidMasthead = Utilities.numStr(
                                                    total_impressions_linfo_androidMasthead
                                                );
                                                total_clicks_linfo_androidMasthead = Utilities.numStr(
                                                    total_clicks_linfo_androidMasthead
                                                );
                                                total_impressions_linfo_iosMasthead = Utilities.numStr(
                                                    total_impressions_linfo_iosMasthead
                                                );
                                                total_clicks_linfo_iosMasthead = Utilities.numStr(
                                                    total_clicks_linfo_iosMasthead
                                                );
                                                total_impressions_dtjMasthead = Utilities.numStr(total_impressions_dtjMasthead);
                                                total_clicks_dtjMasthead = Utilities.numStr(total_clicks_dtjMasthead);
                                                total_impressions_antenneMasthead = Utilities.numStr(
                                                    total_impressions_antenneMasthead
                                                );
                                                total_clicks_antenneMasthead = Utilities.numStr(total_clicks_antenneMasthead);
                                                total_impressions_orangeMasthead = Utilities.numStr(
                                                    total_impressions_orangeMasthead
                                                );
                                                total_clicks_orangeMasthead = Utilities.numStr(total_clicks_orangeMasthead);
                                                total_impressions_tf1Masthead = Utilities.numStr(total_impressions_tf1Masthead);
                                                total_clicks_tf1Masthead = Utilities.numStr(total_clicks_tf1Masthead);
                                                total_impressions_m6Masthead = Utilities.numStr(total_impressions_m6Masthead);
                                                total_clicks_m6Masthead = Utilities.numStr(total_clicks_m6Masthead);
                                                total_impressions_dailymotionMasthead = Utilities.numStr(
                                                    total_impressions_dailymotionMasthead
                                                );
                                                total_clicks_dailymotionMasthead = Utilities.numStr(
                                                    total_clicks_dailymotionMasthead
                                                );
                                                total_impressions_actu_iosMasthead = Utilities.numStr(
                                                    total_impressions_actu_iosMasthead
                                                );
                                                total_clicks_actu_iosMasthead = Utilities.numStr(total_clicks_actu_iosMasthead);
                                                total_impressions_actu_androidMasthead = Utilities.numStr(
                                                    total_impressions_actu_androidMasthead
                                                );
                                                total_clicks_actu_androidMasthead = Utilities.numStr(
                                                    total_clicks_actu_androidMasthead
                                                );

                                                total_impressions_linfoGrandAngle = Utilities.numStr(
                                                    total_impressions_linfoGrandAngle
                                                );
                                                total_clicks_linfoGrandAngle = Utilities.numStr(total_clicks_linfoGrandAngle);
                                                total_impressions_linfo_androidGrandAngle = Utilities.numStr(
                                                    total_impressions_linfo_androidGrandAngle
                                                );
                                                total_clicks_linfo_androidGrandAngle = Utilities.numStr(
                                                    total_clicks_linfo_androidGrandAngle
                                                );
                                                total_impressions_linfo_iosGrandAngle = Utilities.numStr(
                                                    total_impressions_linfo_iosGrandAngle
                                                );
                                                total_clicks_linfo_iosGrandAngle = Utilities.numStr(
                                                    total_clicks_linfo_iosGrandAngle
                                                );
                                                total_impressions_dtjGrandAngle = Utilities.numStr(
                                                    total_impressions_dtjGrandAngle
                                                );
                                                total_clicks_dtjGrandAngle = Utilities.numStr(total_clicks_dtjGrandAngle);
                                                total_impressions_antenneGrandAngle = Utilities.numStr(
                                                    total_impressions_antenneGrandAngle
                                                );
                                                total_clicks_antenneGrandAngle = Utilities.numStr(
                                                    total_clicks_antenneGrandAngle
                                                );
                                                total_impressions_orangeGrandAngle = Utilities.numStr(
                                                    total_impressions_orangeGrandAngle
                                                );
                                                total_clicks_orangeGrandAngle = Utilities.numStr(total_clicks_orangeGrandAngle);
                                                total_impressions_tf1GrandAngle = Utilities.numStr(
                                                    total_impressions_tf1GrandAngle
                                                );
                                                total_clicks_tf1GrandAngle = Utilities.numStr(total_clicks_tf1GrandAngle);
                                                total_impressions_m6GrandAngle = Utilities.numStr(
                                                    total_impressions_m6GrandAngle
                                                );
                                                total_clicks_m6GrandAngle = Utilities.numStr(total_clicks_m6GrandAngle);
                                                total_impressions_dailymotionGrandAngle = Utilities.numStr(
                                                    total_impressions_dailymotionGrandAngle
                                                );
                                                total_clicks_dailymotionGrandAngle = Utilities.numStr(
                                                    total_clicks_dailymotionGrandAngle
                                                );
                                                total_impressions_actu_iosGrandAngle = Utilities.numStr(
                                                    total_impressions_actu_iosGrandAngle
                                                );
                                                total_clicks_actu_iosGrandAngle = Utilities.numStr(
                                                    total_clicks_actu_iosGrandAngle
                                                );
                                                total_impressions_actu_androidGrandAngle = Utilities.numStr(
                                                    total_impressions_actu_androidGrandAngle
                                                );
                                                total_clicks_actu_androidGrandAngle = Utilities.numStr(
                                                    total_clicks_actu_androidGrandAngle
                                                );

                                                total_impressions_linfoRectangleVideo = Utilities.numStr(
                                                    total_impressions_linfoRectangleVideo
                                                );
                                                total_clicks_linfoRectangleVideo = Utilities.numStr(
                                                    total_clicks_linfoRectangleVideo
                                                );
                                                total_impressions_linfo_androidRectangleVideo = Utilities.numStr(
                                                    total_impressions_linfo_androidRectangleVideo
                                                );
                                                total_clicks_linfo_androidRectangleVideo = Utilities.numStr(
                                                    total_clicks_linfo_androidRectangleVideo
                                                );
                                                total_impressions_linfo_iosRectangleVideo = Utilities.numStr(
                                                    total_impressions_linfo_iosRectangleVideo
                                                );
                                                total_clicks_linfo_iosRectangleVideo = Utilities.numStr(
                                                    total_clicks_linfo_iosRectangleVideo
                                                );
                                                total_impressions_dtjRectangleVideo = Utilities.numStr(
                                                    total_impressions_dtjRectangleVideo
                                                );
                                                total_clicks_dtjRectangleVideo = Utilities.numStr(
                                                    total_clicks_dtjRectangleVideo
                                                );
                                                total_impressions_antenneRectangleVideo = Utilities.numStr(
                                                    total_impressions_antenneRectangleVideo
                                                );
                                                total_clicks_antenneRectangleVideo = Utilities.numStr(
                                                    total_clicks_antenneRectangleVideo
                                                );
                                                total_impressions_orangeRectangleVideo = Utilities.numStr(
                                                    total_impressions_orangeRectangleVideo
                                                );
                                                total_clicks_orangeRectangleVideo = Utilities.numStr(
                                                    total_clicks_orangeRectangleVideo
                                                );
                                                total_impressions_tf1RectangleVideo = Utilities.numStr(
                                                    total_impressions_tf1RectangleVideo
                                                );
                                                total_clicks_tf1RectangleVideo = Utilities.numStr(
                                                    total_clicks_tf1RectangleVideo
                                                );
                                                total_impressions_m6RectangleVideo = Utilities.numStr(
                                                    total_impressions_m6RectangleVideo
                                                );
                                                total_clicks_m6RectangleVideo = Utilities.numStr(total_clicks_m6RectangleVideo);
                                                total_impressions_dailymotionRectangleVideo = Utilities.numStr(
                                                    total_impressions_dailymotionRectangleVideo
                                                );
                                                total_clicks_dailymotionRectangleVideo = Utilities.numStr(
                                                    total_clicks_dailymotionRectangleVideo
                                                );
                                                total_impressions_actu_iosRectangleVideo = Utilities.numStr(
                                                    total_impressions_actu_iosRectangleVideo
                                                );
                                                total_clicks_actu_iosRectangleVideo = Utilities.numStr(
                                                    total_clicks_actu_iosRectangleVideo
                                                );
                                                total_impressions_actu_androidRectangleVideo = Utilities.numStr(
                                                    total_impressions_actu_androidRectangleVideo
                                                );
                                                total_clicks_actu_androidRectangleVideo = Utilities.numStr(
                                                    total_clicks_actu_androidRectangleVideo
                                                );

                                                total_impressions_linfoSlider = Utilities.numStr(total_impressions_linfoSlider);
                                                total_clicks_linfoSlider = Utilities.numStr(total_clicks_linfoSlider);
                                                total_impressions_linfo_androidSlider = Utilities.numStr(
                                                    total_impressions_linfo_androidSlider
                                                );
                                                total_clicks_linfo_androidSlider = Utilities.numStr(
                                                    total_clicks_linfo_androidSlider
                                                );
                                                total_impressions_linfo_iosSlider = Utilities.numStr(
                                                    total_impressions_linfo_iosSlider
                                                );
                                                total_clicks_linfo_iosSlider = Utilities.numStr(total_clicks_linfo_iosSlider);
                                                total_impressions_dtjSlider = Utilities.numStr(total_impressions_dtjSlider);
                                                total_clicks_dtjSlider = Utilities.numStr(total_clicks_dtjSlider);
                                                total_impressions_antenneSlider = Utilities.numStr(
                                                    total_impressions_antenneSlider
                                                );
                                                total_clicks_antenneSlider = Utilities.numStr(total_clicks_antenneSlider);
                                                total_impressions_orangeSlider = Utilities.numStr(
                                                    total_impressions_orangeSlider
                                                );
                                                total_clicks_orangeSlider = Utilities.numStr(total_clicks_orangeSlider);
                                                total_impressions_tf1Slider = Utilities.numStr(total_impressions_tf1Slider);
                                                total_clicks_tf1Slider = Utilities.numStr(total_clicks_tf1Slider);
                                                total_impressions_m6Slider = Utilities.numStr(total_impressions_m6Slider);
                                                total_clicks_m6Slider = Utilities.numStr(total_clicks_m6Slider);
                                                total_impressions_dailymotionSlider = Utilities.numStr(
                                                    total_impressions_dailymotionSlider
                                                );
                                                total_clicks_dailymotionSlider = Utilities.numStr(
                                                    total_clicks_dailymotionSlider
                                                );
                                                total_impressions_actu_iosSlider = Utilities.numStr(
                                                    total_impressions_actu_iosSlider
                                                );
                                                total_clicks_actu_iosSlider = Utilities.numStr(total_clicks_actu_iosSlider);
                                                total_impressions_actu_androidSlider = Utilities.numStr(
                                                    total_impressions_actu_androidSlider
                                                );
                                                total_clicks_actu_androidSlider = Utilities.numStr(
                                                    total_clicks_actu_androidSlider
                                                );

                                                total_impressions_linfoNative = Utilities.numStr(total_impressions_linfoNative);
                                                total_clicks_linfoNative = Utilities.numStr(total_clicks_linfoNative);
                                                total_impressions_linfo_androidNative = Utilities.numStr(
                                                    total_impressions_linfo_androidNative
                                                );
                                                total_clicks_linfo_androidNative = Utilities.numStr(
                                                    total_clicks_linfo_androidNative
                                                );
                                                total_impressions_linfo_iosNative = Utilities.numStr(
                                                    total_impressions_linfo_iosNative
                                                );
                                                total_clicks_linfo_iosNative = Utilities.numStr(total_clicks_linfo_iosNative);
                                                total_impressions_dtjNative = Utilities.numStr(total_impressions_dtjNative);
                                                total_clicks_dtjNative = Utilities.numStr(total_clicks_dtjNative);
                                                total_impressions_antenneNative = Utilities.numStr(
                                                    total_impressions_antenneNative
                                                );
                                                total_clicks_antenneNative = Utilities.numStr(total_clicks_antenneNative);
                                                total_impressions_orangeNative = Utilities.numStr(
                                                    total_impressions_orangeNative
                                                );
                                                total_clicks_orangeNative = Utilities.numStr(total_clicks_orangeNative);
                                                total_impressions_tf1Native = Utilities.numStr(total_impressions_tf1Native);
                                                total_clicks_tf1Native = Utilities.numStr(total_clicks_tf1Native);
                                                total_impressions_m6Native = Utilities.numStr(total_impressions_m6Native);
                                                total_clicks_m6Native = Utilities.numStr(total_clicks_m6Native);
                                                total_impressions_dailymotionNative = Utilities.numStr(
                                                    total_impressions_dailymotionNative
                                                );
                                                total_clicks_dailymotionNative = Utilities.numStr(
                                                    total_clicks_dailymotionNative
                                                );
                                                total_impressions_actu_iosNative = Utilities.numStr(
                                                    total_impressions_actu_iosNative
                                                );
                                                total_clicks_actu_iosNative = Utilities.numStr(total_clicks_actu_iosNative);
                                                total_impressions_actu_androidNative = Utilities.numStr(
                                                    total_impressions_actu_androidNative
                                                );
                                                total_clicks_actu_androidNative = Utilities.numStr(
                                                    total_clicks_actu_androidNative
                                                );

                                                total_impressions_linfoSlider = Utilities.numStr(total_impressions_linfoSlider);
                                                total_clicks_linfoSlider = Utilities.numStr(total_clicks_linfoSlider);
                                                total_impressions_linfo_androidSlider = Utilities.numStr(
                                                    total_impressions_linfo_androidSlider
                                                );
                                                total_clicks_linfo_androidSlider = Utilities.numStr(
                                                    total_clicks_linfo_androidSlider
                                                );
                                                total_impressions_linfo_iosSlider = Utilities.numStr(
                                                    total_impressions_linfo_iosSlider
                                                );
                                                total_clicks_linfo_iosSlider = Utilities.numStr(total_clicks_linfo_iosSlider);
                                                total_impressions_dtjSlider = Utilities.numStr(total_impressions_dtjSlider);
                                                total_clicks_dtjSlider = Utilities.numStr(total_clicks_dtjSlider);
                                                total_impressions_antenneSlider = Utilities.numStr(
                                                    total_impressions_antenneSlider
                                                );
                                                total_clicks_antenneSlider = Utilities.numStr(total_clicks_antenneSlider);
                                                total_impressions_orangeSlider = Utilities.numStr(
                                                    total_impressions_orangeSlider
                                                );
                                                total_clicks_orangeSlider = Utilities.numStr(total_clicks_orangeSlider);
                                                total_impressions_tf1Slider = Utilities.numStr(total_impressions_tf1Slider);
                                                total_clicks_tf1Slider = Utilities.numStr(total_clicks_tf1Slider);
                                                total_impressions_m6Slider = Utilities.numStr(total_impressions_m6Slider);
                                                total_clicks_m6Slider = Utilities.numStr(total_clicks_m6Slider);
                                                total_impressions_dailymotionSlider = Utilities.numStr(
                                                    total_impressions_dailymotionSlider
                                                );
                                                total_clicks_dailymotionSlider = Utilities.numStr(
                                                    total_clicks_dailymotionSlider
                                                );
                                                total_impressions_actu_iosSlider = Utilities.numStr(
                                                    total_impressions_actu_iosSlider
                                                );
                                                total_clicks_actu_iosSlider = Utilities.numStr(total_clicks_actu_iosSlider);
                                                total_impressions_actu_androidSlider = Utilities.numStr(
                                                    total_impressions_actu_androidSlider
                                                );
                                                total_clicks_actu_androidSlider = Utilities.numStr(
                                                    total_clicks_actu_androidSlider
                                                );

                                                var Campagne_name = CampaignName[0];
                                                var table = {

                                                    //info rapport
                                                    campaigncrypt,
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
                                                    sommeRectangle_VideoImpression,
                                                    sommeSliderImpression,
                                                    sommeLogoImpression,

                                                    sommeHabillageClicks,
                                                    sommeInterstitielClicks,
                                                    sommeGrand_AngleClicks,
                                                    sommeMastheadClicks,
                                                    sommeNativeClicks,
                                                    sommeVideoClicks,
                                                    sommeRectangle_VideoClicks,
                                                    sommeSliderClicks,
                                                    sommeLogoClicks,

                                                    CTR_habillage,
                                                    CTR_interstitiel,
                                                    CTR_grand_angle,
                                                    CTR_masthead,
                                                    CTR_native,
                                                    CTR_video,
                                                    CTR_rectangle_video,
                                                    CTR_slider,
                                                    CTR_logo
                                                }

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
                                                    videoComplete,
                                                    sommevideoImpressions,
                                                    sommevideoClics,
                                                    videoCTR_clics,

                                                    total_impressions_linfoVideo,
                                                    total_clicks_linfoVideo,
                                                    video_linfo_siteName,
                                                    video_linfo_ctr,
                                                    VTR_linfo,

                                                    total_impressions_linfo_androidVideo,
                                                    total_clicks_linfo_androidVideo,
                                                    video_linfo_android_siteName,
                                                    video_linfo_android_ctr,
                                                    VTR_linfo_android,

                                                    total_impressions_linfo_iosVideo,
                                                    total_clicks_linfo_iosVideo,
                                                    video_linfo_ios_siteName,
                                                    video_linfo_ios_ctr,
                                                    VTR_linfo_ios,

                                                    total_impressions_dtjVideo,
                                                    total_clicks_dtjVideo,
                                                    video_dtj_siteName,
                                                    video_dtj_ctr,
                                                    VTR_dtj,

                                                    total_impressions_antenneVideo,
                                                    total_clicks_antenneVideo,
                                                    video_antenne_siteName,
                                                    video_antenne_ctr,
                                                    VTR_antenne,

                                                    total_impressions_orangeVideo,
                                                    total_clicks_orangeVideo,
                                                    video_orange_siteName,
                                                    video_orange_ctr,
                                                    VTR_orange,

                                                    total_impressions_tf1Video,
                                                    total_clicks_tf1Video,
                                                    video_tf1_siteName,
                                                    video_tf1_ctr,
                                                    VTR_tf1,

                                                    total_impressions_m6Video,
                                                    total_clicks_m6Video,
                                                    video_m6_siteName,
                                                    video_m6_ctr,
                                                    VTR_m6,

                                                    total_impressions_dailymotionVideo,
                                                    total_clicks_dailymotionVideo,
                                                    video_dailymotion_siteName,
                                                    video_dailymotion_ctr,
                                                    VTR_dailymotion,

                                                    total_impressions_actu_iosVideo,
                                                    total_clicks_actu_iosVideo,
                                                    video_actu_ios_siteName,
                                                    video_actu_ios_ctr,
                                                    VTR_actu_ios,

                                                    total_impressions_actu_androidVideo,
                                                    total_clicks_actu_androidVideo,
                                                    video_actu_android_siteName,
                                                    video_actu_android_ctr,
                                                    VTR_actu_android
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
                                                    habillage_actu_android_ctr
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
                                                    interstitiel_actu_android_ctr
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
                                                    masthead_actu_android_ctr
                                                };

                                                grand_angle_linfo_siteName = grand_angle_linfo_siteName[0];
                                                grand_angle_linfo_android_siteName = grand_angle_linfo_android_siteName[0];
                                                grand_angle_linfo_ios_siteName = grand_angle_linfo_ios_siteName[0];
                                                grand_angle_dtj_siteName = grand_angle_dtj_siteName[0];
                                                grand_angle_antenne_siteName = grand_angle_antenne_siteName[0];
                                                grand_angle_orange_siteName = grand_angle_orange_siteName[0];
                                                grand_angle_tf1_siteName = grand_angle_tf1_siteName[0];
                                                grand_angle_m6_siteName = grand_angle_m6_siteName[0];
                                                grand_angle_dailymotion_siteName = grand_angle_dailymotion_siteName[0];
                                                grand_angle_actu_ios_siteName = grand_angle_actu_ios_siteName[0];
                                                grand_angle_actu_android_siteName = grand_angle_actu_android_siteName[0];

                                                var data_grand_angle = {

                                                    grand_angleImpressions,
                                                    sommegrand_angleImpressions,
                                                    sommegrand_angleClics,
                                                    grand_angleCTR_clics,

                                                    total_impressions_linfoGrandAngle,
                                                    total_clicks_linfoGrandAngle,
                                                    grand_angle_linfo_siteName,
                                                    grand_angle_linfo_ctr,

                                                    total_impressions_linfo_androidGrandAngle,
                                                    total_clicks_linfo_androidGrandAngle,
                                                    grand_angle_linfo_android_siteName,
                                                    grand_angle_linfo_android_ctr,

                                                    total_impressions_linfo_iosGrandAngle,
                                                    total_clicks_linfo_iosGrandAngle,
                                                    grand_angle_linfo_ios_siteName,
                                                    grand_angle_linfo_ios_ctr,

                                                    total_impressions_dtjGrandAngle,
                                                    total_clicks_dtjGrandAngle,
                                                    grand_angle_dtj_siteName,
                                                    grand_angle_dtj_ctr,

                                                    total_impressions_antenneGrandAngle,
                                                    total_clicks_antenneGrandAngle,
                                                    grand_angle_antenne_siteName,
                                                    grand_angle_antenne_ctr,

                                                    total_impressions_orangeGrandAngle,
                                                    total_clicks_orangeGrandAngle,
                                                    grand_angle_orange_siteName,
                                                    grand_angle_orange_ctr,

                                                    total_impressions_tf1GrandAngle,
                                                    total_clicks_tf1GrandAngle,
                                                    grand_angle_tf1_siteName,
                                                    grand_angle_tf1_ctr,

                                                    total_impressions_m6GrandAngle,
                                                    total_clicks_m6GrandAngle,
                                                    grand_angle_m6_siteName,
                                                    grand_angle_m6_ctr,

                                                    total_impressions_dailymotionGrandAngle,
                                                    total_clicks_dailymotionGrandAngle,
                                                    grand_angle_dailymotion_siteName,
                                                    grand_angle_dailymotion_ctr,

                                                    total_impressions_actu_iosGrandAngle,
                                                    total_clicks_actu_iosGrandAngle,
                                                    grand_angle_actu_ios_siteName,
                                                    grand_angle_actu_ios_ctr,

                                                    total_impressions_actu_androidGrandAngle,
                                                    total_clicks_actu_androidGrandAngle,
                                                    grand_angle_actu_android_siteName,
                                                    grand_angle_actu_android_ctr
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
                                                    native_actu_android_ctr
                                                };

                                                rectangle_video_linfo_siteName = rectangle_video_linfo_siteName[0];
                                                rectangle_video_linfo_android_siteName = rectangle_video_linfo_android_siteName[0];
                                                rectangle_video_linfo_ios_siteName = rectangle_video_linfo_ios_siteName[0];
                                                rectangle_video_dtj_siteName = rectangle_video_dtj_siteName[0];
                                                rectangle_video_antenne_siteName = rectangle_video_antenne_siteName[0];
                                                rectangle_video_orange_siteName = rectangle_video_orange_siteName[0];
                                                rectangle_video_tf1_siteName = rectangle_video_tf1_siteName[0];
                                                rectangle_video_m6_siteName = rectangle_video_m6_siteName[0];
                                                rectangle_video_dailymotion_siteName = rectangle_video_dailymotion_siteName[0];
                                                rectangle_video_actu_ios_siteName = rectangle_video_actu_ios_siteName[0];
                                                rectangle_video_actu_android_siteName = rectangle_video_actu_android_siteName[0];

                                                var data_rectangle_video = {

                                                    rectanglevideoImpressions,
                                                    sommerectangle_videoImpressions,
                                                    sommerectangle_videoClics,
                                                    rectangle_videoCTR_clics,

                                                    total_impressions_linfoRectangleVideo,
                                                    total_clicks_linfoRectangleVideo,
                                                    rectangle_video_linfo_siteName,
                                                    rectangle_video_linfo_ctr,

                                                    total_impressions_linfo_androidRectangleVideo,
                                                    total_clicks_linfo_androidRectangleVideo,
                                                    rectangle_video_linfo_android_siteName,
                                                    rectangle_video_linfo_android_ctr,

                                                    total_impressions_linfo_iosRectangleVideo,
                                                    total_clicks_linfo_iosRectangleVideo,
                                                    rectangle_video_linfo_ios_siteName,
                                                    rectangle_video_linfo_ios_ctr,

                                                    total_impressions_dtjRectangleVideo,
                                                    total_clicks_dtjRectangleVideo,
                                                    rectangle_video_dtj_siteName,
                                                    rectangle_video_dtj_ctr,

                                                    total_impressions_antenneRectangleVideo,
                                                    total_clicks_antenneRectangleVideo,
                                                    rectangle_video_antenne_siteName,
                                                    rectangle_video_antenne_ctr,

                                                    total_impressions_orangeRectangleVideo,
                                                    total_clicks_orangeRectangleVideo,
                                                    rectangle_video_orange_siteName,
                                                    rectangle_video_orange_ctr,

                                                    total_impressions_tf1RectangleVideo,
                                                    total_clicks_tf1RectangleVideo,
                                                    rectangle_video_tf1_siteName,
                                                    rectangle_video_tf1_ctr,

                                                    total_impressions_m6RectangleVideo,
                                                    total_clicks_m6RectangleVideo,
                                                    rectangle_video_m6_siteName,
                                                    rectangle_video_m6_ctr,

                                                    total_impressions_dailymotionRectangleVideo,
                                                    total_clicks_dailymotionRectangleVideo,
                                                    rectangle_video_dailymotion_siteName,
                                                    rectangle_video_dailymotion_ctr,

                                                    total_impressions_actu_iosRectangleVideo,
                                                    total_clicks_actu_iosRectangleVideo,
                                                    rectangle_video_actu_ios_siteName,
                                                    rectangle_video_actu_ios_ctr,

                                                    total_impressions_actu_androidRectangleVideo,
                                                    total_clicks_actu_androidRectangleVideo,
                                                    rectangle_video_actu_android_siteName,
                                                    rectangle_video_actu_android_ctr
                                                };

                                                slider_linfo_siteName = slider_linfo_siteName[0];
                                                slider_linfo_android_siteName = slider_linfo_android_siteName[0];
                                                slider_linfo_ios_siteName = slider_linfo_ios_siteName[0];
                                                slider_dtj_siteName = slider_dtj_siteName[0];
                                                slider_antenne_siteName = slider_antenne_siteName[0];
                                                slider_orange_siteName = slider_orange_siteName[0];
                                                slider_tf1_siteName = slider_tf1_siteName[0];
                                                slider_m6_siteName = slider_m6_siteName[0];
                                                slider_dailymotion_siteName = slider_dailymotion_siteName[0];
                                                slider_actu_ios_siteName = slider_actu_ios_siteName[0];
                                                slider_actu_android_siteName = slider_actu_android_siteName[0];

                                                var data_slider = {

                                                    sliderImpressions,
                                                    sommesliderImpressions,
                                                    sommesliderClics,
                                                    sliderCTR_clics,

                                                    total_impressions_linfoSlider,
                                                    total_clicks_linfoSlider,
                                                    slider_linfo_siteName,
                                                    slider_linfo_ctr,

                                                    total_impressions_linfo_androidSlider,
                                                    total_clicks_linfo_androidSlider,
                                                    slider_linfo_android_siteName,
                                                    slider_linfo_android_ctr,

                                                    total_impressions_linfo_iosSlider,
                                                    total_clicks_linfo_iosSlider,
                                                    slider_linfo_ios_siteName,
                                                    slider_linfo_ios_ctr,

                                                    total_impressions_dtjSlider,
                                                    total_clicks_dtjSlider,
                                                    slider_dtj_siteName,
                                                    slider_dtj_ctr,

                                                    total_impressions_antenneSlider,
                                                    total_clicks_antenneSlider,
                                                    slider_antenne_siteName,
                                                    slider_antenne_ctr,

                                                    total_impressions_orangeSlider,
                                                    total_clicks_orangeSlider,
                                                    slider_orange_siteName,
                                                    slider_orange_ctr,

                                                    total_impressions_tf1Slider,
                                                    total_clicks_tf1Slider,
                                                    slider_tf1_siteName,
                                                    slider_tf1_ctr,

                                                    total_impressions_m6Slider,
                                                    total_clicks_m6Slider,
                                                    slider_m6_siteName,
                                                    slider_m6_ctr,

                                                    total_impressions_dailymotionSlider,
                                                    total_clicks_dailymotionSlider,
                                                    slider_dailymotion_siteName,
                                                    slider_dailymotion_ctr,

                                                    total_impressions_actu_iosSlider,
                                                    total_clicks_actu_iosSlider,
                                                    slider_actu_ios_siteName,
                                                    slider_actu_ios_ctr,

                                                    total_impressions_actu_androidSlider,
                                                    total_clicks_actu_androidSlider,
                                                    slider_actu_android_siteName,
                                                    slider_actu_android_ctr
                                                };

                                                logo_linfo_siteName = logo_linfo_siteName[0];
                                                logo_linfo_android_siteName = logo_linfo_android_siteName[0];
                                                logo_linfo_ios_siteName = logo_linfo_ios_siteName[0];
                                                logo_dtj_siteName = logo_dtj_siteName[0];
                                                logo_antenne_siteName = logo_antenne_siteName[0];
                                                logo_orange_siteName = logo_orange_siteName[0];
                                                logo_tf1_siteName = logo_tf1_siteName[0];
                                                logo_m6_siteName = logo_m6_siteName[0];
                                                logo_dailymotion_siteName = logo_dailymotion_siteName[0];
                                                logo_actu_ios_siteName = logo_actu_ios_siteName[0];
                                                logo_actu_android_siteName = logo_actu_android_siteName[0];

                                                var data_logo = {

                                                    logoImpressions,
                                                    sommelogoImpressions,
                                                    sommelogoClics,
                                                    logoCTR_clics,

                                                    total_impressions_linfoSlider,
                                                    total_clicks_linfoSlider,
                                                    logo_linfo_siteName,
                                                    logo_linfo_ctr,

                                                    total_impressions_linfo_androidSlider,
                                                    total_clicks_linfo_androidSlider,
                                                    logo_linfo_android_siteName,
                                                    logo_linfo_android_ctr,

                                                    total_impressions_linfo_iosSlider,
                                                    total_clicks_linfo_iosSlider,
                                                    logo_linfo_ios_siteName,
                                                    logo_linfo_ios_ctr,

                                                    total_impressions_dtjSlider,
                                                    total_clicks_dtjSlider,
                                                    logo_dtj_siteName,
                                                    logo_dtj_ctr,

                                                    total_impressions_antenneSlider,
                                                    total_clicks_antenneSlider,
                                                    logo_antenne_siteName,
                                                    logo_antenne_ctr,

                                                    total_impressions_orangeSlider,
                                                    total_clicks_orangeSlider,
                                                    logo_orange_siteName,
                                                    logo_orange_ctr,

                                                    total_impressions_tf1Slider,
                                                    total_clicks_tf1Slider,
                                                    logo_tf1_siteName,
                                                    logo_tf1_ctr,

                                                    total_impressions_m6Slider,
                                                    total_clicks_m6Slider,
                                                    logo_m6_siteName,
                                                    logo_m6_ctr,

                                                    total_impressions_dailymotionSlider,
                                                    total_clicks_dailymotionSlider,
                                                    logo_dailymotion_siteName,
                                                    logo_dailymotion_ctr,

                                                    total_impressions_actu_iosSlider,
                                                    total_clicks_actu_iosSlider,
                                                    logo_actu_ios_siteName,
                                                    logo_actu_ios_ctr,

                                                    total_impressions_actu_androidSlider,
                                                    total_clicks_actu_androidSlider,
                                                    logo_actu_android_siteName,
                                                    logo_actu_android_ctr
                                                };

                                                // var ttl = 7200 2h
                                                const now = new Date();
                                                var timestamp_now = now.getTime();
                                                var timestamp_expire = now.setHours(now.getHours() + 2);

                                                var t3 = parseInt(timestamp_expire);

                                                var date_expirer = Utilities.getDateTimeTimestamp(t3);

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
                                                    'data_video': data_video,
                                                    'data_rectangle_video': data_rectangle_video,
                                                    'data_slider': data_slider,
                                                    'data_logo': data_logo
                                                };

                                                localStorage.setItem('campagneId-' + campaignid, JSON.stringify(testObject));
                                                res.json(200, 'Load Storage : campagneId-' + campaignid);
                                            }

                                        }, time);
                                    }

                                }

                            } catch (error) {
                                console.log(error)
                                var statusCoded = error.response;

                                res.render("error.ejs", {
                                    statusCoded: statusCoded,
                                    campaigncrypt: campaigncrypt
                                })

                            }
                        });

                } //end campaignCrypt

                //     res.json(campaigns);

            });

    } catch (error) {
        console.error('Error : ' + error);
    }
}