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

// Initialise les models const ModelSite = require("../models/models.sites");
const ModelAgencies = require("../models/models.agencies");
const Modelformats = require("../models/models.format");
const ModelCampaigns = require("../models/models.campaigns");
const ModelAdvertisers = require("../models/models.advertiser");
const ModelSites = require("../models/models.site");
const ModelTemplates = require("../models/models.template");
const ModelPlatforms = require("../models/models.platform");


const ModelGroupsFormatsTypes = require("../models/models.format_group_type");
const ModelGroupsFormats = require("../models/models.group_format");
const ModelInsertions = require("../models/models.insertion");



const {
    resolve
} = require('path');

/*
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
*/

async function updateOrCreate(model, where, newItem) {
    // First try to find the record
    const foundItem = await model.findOne({
        where
    });
    if (!foundItem) {
        // Item not found, create a new one
        const item = await model.create(newItem)
        return {
            item,
            created: true
        };
    }
    // Found an item, update it
    const item = await model.update(newItem, {
        where
    });
    return {
        item,
        created: false
    };
}

exports.agencies = async (req, res) => {
    try {
        var config = SmartFunction.config('agencies');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round(number_total_count / 100);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
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


                             const agencies =   ModelAgencies.create({
                                agency_id,
                                agency_name,
                                agency_archived,
                            });



                        
                        }

                        // Sleep pendant 10s
                        //  await new Promise(r => setTimeout(r, 10000));
                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);
        // console.log(error); var statusCoded = error.response.status;
        // res.render("error_log.ejs", {statusCoded: statusCoded});
    }
}

exports.advertisers = async (req, res) => {
    try {
        var config = SmartFunction.config('advertisers');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round(number_total_count / 100);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
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
                                advertiser_archived,
                            });



                            /*
                                                     
                            const advertiserDb = Modelformats.findByPk(advertiser_id);
                            if (advertiserDb === null) {
                              console.log('Not found!');
                              const advertiser = Modelformats.create({advertiser_id, advertiser_name});
                            } else {
                              console.log('Else : '+advertiserDb instanceof Modelformats); // true
                              // Its primary key is 123
                            } */     
                        }

                        // Sleep pendant 10s
                        //  await new Promise(r => setTimeout(r, 10000));
                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);
        // console.log(error); var statusCoded = error.response.status;
        // res.render("error_log.ejs", {statusCoded: statusCoded});
    }
}

exports.campaigns = async (req, res) => {
    try {
        var config = SmartFunction.config('campaigns');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round(number_total_count / 100);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
                    let offset = 0; // page*100;
                    var config2 = SmartFunction.config('campaigns', offset);

                    await axios(config2).then(function (response) {
                        var dataValue = response.data;

                        for (i = 0; i < number_line; i++) {
                            var campaign_id = dataValue[i].id;
                            var campaign_name = dataValue[i].name;
                            var advertiser_id = data[i].advertiserId;
                            var agency_id = dataValue[i].agencyId;
                            var campaign_start_date = dataValue[i].startDate;
                            var campaign_end_date = dataValue[i].endDate;
                            var campaign_status_id = dataValue[i].campaignStatusId;
                            var campaign_archived = dataValue[i].isArchived;


                            // console.log({campaign_id, campaign_name, advertiser_id, start_date, end_date});

                            //console.log(dataValue)
                            ModelCampaigns.create({
                                campaign_id,
                                campaign_name,
                                advertiser_id,
                                agency_id,
                                campaign_start_date,
                                campaign_end_date,
                                campaign_status_id,
                                campaign_archived
                            });
                         

                        }

                        // Sleep pendant 10s
                        //  await new Promise(r => setTimeout(r, 10000));
                    });
                }
            }

            addItem();

            //  return false;
        });

    } catch (error) {
        console.error('Error : ' + error);
        // console.log(error); var statusCoded = error.response.status;
        // res.render("error_log.ejs", {statusCoded: statusCoded});
    }
}


exports.formats = async (req, res) => {
    try {
        var config = SmartFunction.config('formats');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round(number_total_count / 100);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
                    let offset = page * 100;
                    var config2 = SmartFunction.config('formats', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;




                        for (i = 0; i < number_line_offset; i++) {

                            //console.log(dataValue)
                            var format_id = dataValue[i].id;
                            var format_name = dataValue[i].name;

                            //solution provisoire 
                            switch (dataValue[i].id) {
                                case 44149 || 79637:
                                    //si c habillage -> web_habillage / app_mban_atf
                                    var format_group = 2
                                    break;

                                case 44152 || 79633:
                                    //si grand angle ->web_mban  app_mpave_atf0 
                                    var format_group = 1
                                    break;
                                case 79637 ||
                                79638 ||
                                79642 ||
                                79643 ||
                                79644 ||
                                79645 ||
                                84652 ||
                                84653 ||
                                84654 ||
                                84655 ||
                                84656 ||
                                79421 ||
                                79646:
                                    //si masthead -> web_mban / app_mban
                                    var format_group = 4
                                    break;
                                case 79425 ||
                                84657 ||
                                84658 ||
                                84659 ||
                                84660 ||
                                84661 ||
                                79431:
                                    //si instream -> linear 
                                    var format_group = 5
                                    break;
                                case 85016 ||
                                96472:
                                    var format_group = 3
                                    break;

                                case 43791:
                                    var format_group = 6
                                    break;
                               
                                default:
                                    var format_group = 0

                                    break;
                            }




                            //console.log(Array_FormatsName)


                            //voir les relation
                            const groups_formats_types = ModelGroupsFormatsTypes.create({
                                group_format_id: format_group,
                                format_id: format_id
                            })
                            var format_width = data[i].width;
                            var format_height = dataValue[i].height;
                            var format_type_id = dataValue[i].formatTypeId;
                            var format_archived = dataValue[i].isArchived;
                            var format_resource_url = dataValue[i].resourceUrl;


                            updateOrCreate(Modelformats, {
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
                            //  console.log(formats)


                        }


                        // Sleep pendant 10s
                        //  await new Promise(r => setTimeout(r, 10000));
                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);
        // console.log(error); var statusCoded = error.response.status;
        // res.render("error_log.ejs", {statusCoded: statusCoded});
    }
}


exports.sites = async (req, res) => {
    try {
        var config = SmartFunction.config('sites');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round(number_total_count / 100);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
                    let offset = page * 100;
                    var config2 = SmartFunction.config('sites', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {
                            console.log(dataValue);

                            var site_id= dataValue[i].id;
                            var site_is_child_directed= dataValue[i].isChildDirected;
                            var site_name= dataValue[i].name;
                            var site_archived= dataValue[i].isArchived;
                            var user_group_id= dataValue[i].userGroupId;
                            var site_url= dataValue[i].url;
                            var language_id= dataValue[i].languageId;
                            var site_business_model_type_id= dataValue[i].siteApplicationId;
                            var site_business_model_value= dataValue[i].siteApplicationId;
                            var site_application_id= dataValue[i].siteApplicationId;
                            var site_updated_at= dataValue[i].updatedAt


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

                        // Sleep pendant 10s
                        //  await new Promise(r => setTimeout(r, 10000));
                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);
        // console.log(error); var statusCoded = error.response.status;
        // res.render("error_log.ejs", {statusCoded: statusCoded});
    }
}


exports.templates = async (req, res) => {
    try {
        var config = SmartFunction.config('templates');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round(number_total_count / 100);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
                    let offset = 0; // page*100;
                    var config2 = SmartFunction.config('templates', offset);

                    await axios(config2).then(function (response) {
                        var dataValue = response.data;

                        for (i = 0; i < number_line; i++) {
                            var template_id = dataValue[i].id;
                            var template_name = dataValue[i].name;
                            var template_description = data[i].advertiserId;
                            var template_official = dataValue[i].agencyId;
                            var template_archived = dataValue[i].startDate;
                            var parameter_default_values = dataValue[i].endDate;
                            var template_original_id = dataValue[i].campaignStatusId;
                            var template_original = dataValue[i].isArchived;
                            var documentation_url = dataValue[i].isArchived;
                            var type  = dataValue[i].isArchived;
                            var draft_script_id = dataValue[i].isArchived;
                            var replaced_by = dataValue[i].isArchived;
                            var editable = dataValue[i].isArchived;
                            var published = dataValue[i].isArchived;
                            var deprecated =  dataValue[i].isArchived;

                            // console.log({campaign_id, campaign_name, advertiser_id, start_date, end_date});

                            //console.log(dataValue)
                            ModelTemplates.create({
                                campaign_id,
                                campaign_name,
                                advertiser_id,
                                agency_id,
                                campaign_start_date,
                                campaign_end_date,
                                campaign_status_id,
                                campaign_archived
                            });
                         

                            // const tableDb = ModelCampaigns.findByPk(campaign_id);
                            // console.log(tableDb);

                          
                        }

                        // Sleep pendant 10s
                        //  await new Promise(r => setTimeout(r, 10000));
                    });
                }
            }

            addItem();

            //  return false;
        });

    } catch (error) {
        console.error('Error : ' + error);
        // console.log(error); var statusCoded = error.response.status;
        // res.render("error_log.ejs", {statusCoded: statusCoded});
    }
}

exports.platforms = async (req, res) => {
    try {
        var config = SmartFunction.config('platforms');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round(number_total_count / 100);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
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
                                platform_name,
                             
                            });



                       
                        }

                        // Sleep pendant 10s
                        //  await new Promise(r => setTimeout(r, 10000));
                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);
        // console.log(error); var statusCoded = error.response.status;
        // res.render("error_log.ejs", {statusCoded: statusCoded});
    }
}









exports.insertions = async (req, res) => {
    try {
        var config = SmartFunction.config('insertions');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round(number_total_count / 100);
            console.log(number_total_count);
            console.log('Number Pages :' + number_pages);

            const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
                    let offset = page * 100;
                    var config2 = SmartFunction.config('insertions', offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

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
                            var site_id = dataValue[i].siteIds;
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
                            var created_at = 0
                            var updated_at = 0

                            const insertions = ModelInsertions.create({
                                insertion_id,
                                delivery_regulated,
                                used_guaranteed_deal,
                                used_non_guaranteed_deal,
                                voice_share,
                                event_id,
                                insertion_name,
                                insertion_description,
                                site_id,
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
                                sale_channel_id,
                                created_at,
                                updated_at
                            });


                           


                        }

                        // Sleep pendant 10s
                        //  await new Promise(r => setTimeout(r, 10000));
                    });
                }
            }

            addItem();

            return false;
        });

    } catch (error) {
        console.error('Error : ' + error);
        // console.log(error); var statusCoded = error.response.status;
        // res.render("error_log.ejs", {statusCoded: statusCoded});
    }
}
