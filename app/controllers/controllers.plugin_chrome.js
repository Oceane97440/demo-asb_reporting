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



exports.advertiser = async (req, res) => {
    try {
        let advertiser_id = req.query.advertiser_id;
        const advertiser = await ModelAdvertisers.findOne({
            where: {
                advertiser_id: advertiser_id
            }
        })

        if (!advertiser) {
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

                    Utilities
                        .updateOrCreate(ModelAdvertisers, {
                            advertiser_id: advertiser_id
                        }, {
                            advertiser_id,
                            advertiser_name,
                            advertiser_archived
                        })
                        .then(function (result) {
                            result.item; // the model
                            result.created; // bool, if a new item was created.
                            res.redirect(`/manager/advertisers/${advertiser_id}`)

                        });
                }

            });

        } else {
            res.redirect(`/manager/advertisers/${advertiser_id}`)

        }
    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }
}
exports.campaign = async (req, res) => {
    try {
        let campaign_id = req.query.campaign_id;


        var campaign = await ModelCampaigns.findOne({
            where: {
                campaign_id: campaign_id
            }
        })

        //Si il n'existe pas on ajoute l'annonceur dans le BI puis on redirige vers celui-ci


        if (!campaign) {
            campaignObject = {
                "campaign_id": req.query.campaign_id
            };
            console.log("campaign_id  " + campaign_id)

            var config = SmartFunction.config('campaign', campaignObject);

            await axios(config).then( async function (result) {

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

                    //Cherche si l'annonceur liée à la campagne exsite
                    const advertiser = await ModelAdvertisers.findOne({
                        where: {
                            advertiser_id: advertiser_id
                        }
                    })

                    //Si il n'existe pas on ajoute l'annonceur dans le BI puis on redirige vers celui-ci
                    if (!advertiser) {

                        console.log("redirection annonceur")
                        res.redirect(`/manager/advertisers/${advertiser_id}`)


                    } else {

                        //si l'annonceur existe on ajoute la campagne dans le BI
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
                                console.log("redirection campagne")
                            });

                    }




                }

            });

        } else {
            res.redirect(`/manager/campaigns/${campaign_id}`)

        }
    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }
}

exports.insertion = async (req, res) => {
    try {
        let insertion_id = req.query.insertion_id;

        console.log(insertion_id)

        const insertion = await ModelInsertions.findOne({
            where: {
                insertion_id: insertion_id
            }
        })

        if (!insertion) {
         
            
            insertionObject = {
                "insertion_id": insertion_id
            };
            console.log("insertion_id  " + insertion_id)

            var config = SmartFunction.config('insertion', insertionObject);

            await axios(config).then(async function (result) {

                if (!Utilities.empty(result.data)) {
                    var dataValue = result.data;


                    var insertion_id = dataValue.id;
                    var delivery_regulated = dataValue.isDeliveryRegulated;
                    var used_guaranteed_deal = dataValue.isUsedByGuaranteedDeal;
                    var used_non_guaranteed_deal = dataValue.heigisUsedByNonGuaranteedDealht;
                    var voice_share = dataValue.voiceShare;
                    var event_id = dataValue.eventId;
                    var insertion_name = dataValue.name;
                    var insertion_description = dataValue.description;
                    var pack_id = dataValue.packIds;
                    var insertion_status_id = dataValue.insertions_statusId;
                    var insertion_start_date = dataValue.startDate;
                    var insertion_end_date = dataValue.endDate;
                    var campaign_id = dataValue.campaignId;
                    var insertion_type_id = dataValue.insertionTypeId;
                    var delivery_type_id = dataValue.deliveryTypeId;
                    var timezone_id = dataValue.timezoneId;
                    var priority_id = dataValue.priorityId;
                    var periodic_capping_id = dataValue.periodicCappingId;
                    var group_capping_id = dataValue.groupCappingId;
                    var max_impression = dataValue.maxImpressions;
                    var weight = dataValue.weight;
                    var max_click = dataValue.maxClicks;
                    var max_impression_perday = dataValue.maxImpressionsPerDay;
                    var max_click_perday = dataValue.maxClicksPerDay;
                    var insertion_groupe_volume = dataValue.insertionGroupedVolumeId
                    var event_impression = dataValue.eventImpressions;
                    var holistic_yield_enabled = dataValue.isHolisticYieldEnabled;
                    var deliver_left_volume_after_end_date = dataValue.deliverLeftVolumeAfterEndDate;
                    var global_capping = dataValue.globalCapping;
                    var capping_per_visit = dataValue.cappingPerVisit;
                    var capping_per_click = dataValue.cappingPerClick;
                    var auto_capping = dataValue.autoCapping;
                    var periodic_capping_impression = dataValue.periodicCappingImpressions;
                    var periodic_capping_period = dataValue.periodicCappingPeriod;
                    var oba_icon_enabled = dataValue.isObaIconEnabled;
                    if (dataValue.formatId === 0) {
                        var format_id = "NULL"
                    }
                    var format_id = dataValue.formatId;
                    var external_id = dataValue.externalId;
                    var external_description = dataValue.externalDescription;
                    var insertion_updated_at = dataValue.updatedAt;
                    var insertion_created_at = dataValue.createdAt;
                    var insertion_archived = dataValue.isArchived;
                    var rate_type_id = dataValue.rateTypeId;
                    var rate = dataValue.rate;
                    var rate_net = dataValue.rateNet;
                    var discount = dataValue.discount;
                    var currency_id = dataValue.currencyId;
                    var insertion_link_id = dataValue.insertionLinkId;
                    var insertion_exclusion_id = dataValue.insertionExclusionIds;
                    var customized_script = dataValue.customizedScript;
                    var sale_channel_id = dataValue.salesChannelId;

                    //Cherche si la campagne liée à l'insertion exsite
                    const campaign = await ModelCampaigns.findOne({
                        where: {
                            campaign_id: campaign_id
                        }
                    })

                    //Si il n'existe pas on ajoute l'annonceur dans le BI puis on redirige vers celui-ci
                    if (!campaign) {

                        console.log("redirection campaign")
                        res.redirect(`/extension-chrome/campaign?campaign_id=${campaign_id}`)


                    } else {

                        //si l'annonceur existe on ajoute la campagne dans le BI

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
                                res.redirect(`/manager/campaigns/${campaign_id}/insertions/${insertion_id}`)
                                console.log("redirection insertion campagne")
                            });


                    }





                }

            });

        } else {
            res.redirect(`/manager/campaigns/${insertion.campaign_id}/insertions/${insertion_id}`)

           /* return res.json({
                type: 'error',
                message: 'Veuillez saisir l\'identifiant de la campagne.'
            });*/
        }
    } catch (error) {
        return res.json({
            type: 'error',
            message: error
        });
    }
}