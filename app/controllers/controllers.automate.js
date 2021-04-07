// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);
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
const SmartFunction = require("../functions/functions.smartadserver.api");
const Utilities = require("../functions/functions.utilities");

// Initialise les models const ModelSite = require("../models/models.sites");
const ModelAgencies = require("../models/models.agencies");
const ModelFormats = require("../models/models.formats");
const ModelCampaigns = require("../models/models.campaigns");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelSites = require("../models/models.sites");
const ModelTemplates = require("../models/models.templates");
const ModelPlatforms = require("../models/models.platforms");
const ModelDeliverytypes = require("../models/models.deliverytypes");
const ModelCountries = require("../models/models.countries");

const ModelGroupsFormatsTypes = require(
    "../models/models.formats_groups_types"
);
const ModelGroupsFormats = require("../models/models.groups_formats");
const ModelInsertions = require("../models/models.insertions");

const {
    resolve
} = require('path');
const {
    cpuUsage
} = require('process');

/*
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
*/
/*
async function updateOrCreate(model, where, newItem) {
    // First try to find the record
    const foundItem = await model.findOne({where});
    if (!foundItem) {
        // Item not found, create a new one
        const item = await model.create(newItem)
        return {item, created: true};
    }
    // Found an item, update it
    const item = await model.update(newItem, {where});
    return {item, created: false};
}
*/
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

                        // Sleep pendant 10s  await new Promise(r => setTimeout(r, 10000));
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
                            const advertiser = ModelAdvertisers.create({
                                advertiser_id,
                                advertiser_name,
                                advertiser_archived
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

                        // Sleep pendant 10s  await new Promise(r => setTimeout(r, 10000));
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

                                        Utilities.updateOrCreate(ModelCampaigns, {
                                            campaign_id: campaign_id
                                        }, {
                                            campaign_id,
                                            campaign_name,
                                            advertiser_id,
                                            agency_id,
                                            campaign_start_date,
                                            campaign_end_date,
                                            campaign_status_id,
                                            campaign_archived
                                        }).then(function (result) {
                                            result.item; // the model
                                            result.created; // bool, if a new item was created.
                                        });


                                    }
                                }
                            } else {
                                console.error('Error : Aucune donnée disponible');
                            }

                            // Sleep pendant 10s  await new Promise(r => setTimeout(r, 10000));
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

                            Utilities.updateOrCreate(ModelFormats, {
                                format_id: format_id
                            }, {
                                format_id,
                                format_name,
                                format_width,
                                format_height,
                                format_type_id,
                                format_archived,
                                format_resource_url
                            }).then(function (result) {
                                result.item; // the model
                                result.created; // bool, if a new item was created.
                            });
                            //  console.log(formats)

                        }

                        // Sleep pendant 10s  await new Promise(r => setTimeout(r, 10000));
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
            
                                        Utilities.updateOrCreate(ModelTemplates, {
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
                                        }).then(function (result) {
                                            result.item; // the model
                                            result.created; // bool, if a new item was created.
                                        });
                                      
            
                                        // const tableDb = ModelCampaigns.findByPk(campaign_id); console.log(tableDb);
            
                                    }
                               
                                }
                            } else {
                                console.error('Error : Aucune donnée disponible');
                            }

                            // Sleep pendant 10s  await new Promise(r => setTimeout(r, 10000));
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

                        // Sleep pendant 10s  await new Promise(r => setTimeout(r, 10000));
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
                            var deliverytype_id = dataValue[i].id;
                            var deliverytype_name = dataValue[i].name;

                            //  console.log(dataValue);
                            ModelDeliverytypes.create({
                                deliverytype_id,
                                deliverytype_name
                            });

                        }

                        // Sleep pendant 10s  await new Promise(r => setTimeout(r, 10000));
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

                        // Sleep pendant 10s  await new Promise(r => setTimeout(r, 10000));
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



exports.insertions = async (req, res) => {
    var insertion= await ModelInsertions.findAll({
        attributes: [
            'insertion_id'
        ],
       
        limit: 10
    })
    console.log(insertion)
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
                        var config2 = SmartFunction.config('insertions', offset);
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
                                        var insertion_status_id = dataValue[i].insertionStatusId;
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
                                        var format_id = dataValue[i].formatId;
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
            
                                        const insertions = ModelInsertions.create({
                                            insertion_id,
                                            delivery_regulated,
                                            used_guaranteed_deal,
                                            used_non_guaranteed_deal,
                                            voice_share,
                                            event_id,
                                            insertion_name,
                                            insertion_description,
                                            // site_id,
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
                                        }).then(function (result) {
                                            result.item; // the model
                                            result.created; // bool, if a new item was created.
                                        });
            
                                    }
            
                                }
                            } else {
                                console.error('Error : Aucune donnée disponible');
                            }

                            // Sleep pendant 10s  await new Promise(r => setTimeout(r, 10000));
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