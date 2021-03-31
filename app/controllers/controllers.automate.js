// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);
const {Op} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

const {QueryTypes} = require('sequelize');

const {check, query} = require('express-validator');

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const SmartFunction = require("../functions/functions.smartadserver.api");

// Initialise les models const ModelSite = require("../models/models.sites");
//const ModelFormat = require("../models/models.formats");
const Modelformats = require("../models/models.format");
const ModelCampaigns = require("../models/models.campaigns");
const ModelAdvertisers = require("../models/models.advertiser");

const ModelGroupsFormatsTypes = require("../models/models.format_group_type");
const ModelGroupsFormats = require("../models/models.group_format");
const ModelInsertions = require("../models/models.insertion");



const { resolve } = require('path');

/*
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
*/

async function updateOrCreate (model, where, newItem) {
    // First try to find the record
   const foundItem = await model.findOne({where});
   if (!foundItem) {
        // Item not found, create a new one
        const item = await model.create(newItem)
        return  {item, created: true};
    }
    // Found an item, update it
    const item = await model.update(newItem, {where});
    return {item, created: false};
}

exports.advertisers = async (req, res) => {
    try {
        var config = SmartFunction.config('advertisers');
        await axios(config).then(function (res) {
            var data = res.data;
            var number_line = data.length;
            var number_total_count = res.headers['x-pagination-total-count'];
            var number_pages = Math.round(number_total_count/100);
            console.log(number_total_count);
            console.log('Number Pages :'+number_pages);
          
           const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
                    let offset = page*100;
                    var config2 = SmartFunction.config('advertisers',offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {
                            var advertiser_id = dataValue[i].id;
                            var advertiser_name = dataValue[i].name;

                            console.log(dataValue);
                            const advertiser = ModelAdvertisers.create({advertiser_id, advertiser_name});
                           
                           
                           
                            /*
                                                     
                            const advertiserDb = Modelformats.findByPk(advertiser_id);
                            if (advertiserDb === null) {
                              console.log('Not found!');
                              const advertiser = Modelformats.create({advertiser_id, advertiser_name});
                            } else {
                              console.log('Else : '+advertiserDb instanceof Modelformats); // true
                              // Its primary key is 123
                            }      */
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
        console.error('Error : '+error);
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
            var number_pages = Math.round(number_total_count/100);
            console.log(number_total_count);
            console.log('Number Pages :'+number_pages);
          
           const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
                    let offset = 0; // page*100;
                    var config2 = SmartFunction.config('campaigns',offset);

                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        
                        for (i = 0; i < number_line; i++) {                           
                            var campaign_id = dataValue[i].id;
                            var campaign_name = dataValue[i].name;
                            var advertiser_id = data[i].advertiserId;
                            var start_date = dataValue[i].startDate;
                            var end_date = dataValue[i].endDate;
                            console.log({campaign_id, campaign_name, advertiser_id, start_date, end_date});

                            updateOrCreate(ModelCampaigns, {campaign_id: campaign_id}, {campaign_id, campaign_name, advertiser_id, start_date, end_date}).then(function(result) {
                                result.item;  // the model
                                result.created; // bool, if a new item was created.
                            });

                           // const tableDb = ModelCampaigns.findByPk(campaign_id);
                           // console.log(tableDb);

                            /*
                            const tableDb = ModelCampaigns.findByPk(campaign_id);
                            if (tableDb === null) {
                              console.log('Not found!');
                              const campaigns = ModelCampaigns.create({campaign_id, campaign_name, advertiser_id, start_date, end_date});
                            } else {
                              console.log('Else : '+tableDb instanceof ModelCampaigns); // true
                              // Its primary key is 123
                            }    
                            */  
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
        console.error('Error : '+error);
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
            var number_pages = Math.round(number_total_count/100);
            console.log(number_total_count);
            console.log('Number Pages :'+number_pages);
          
           const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
                    let offset = page*100;
                    var config2 = SmartFunction.config('formats',offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {

                            console.log(dataValue)
                            var format_id = dataValue[i].id;
                            var format_name = dataValue[i].name;

                            /*
                            voir les relation
                            const user_role = ModelGroupsFormatsTypes.create({
                                group_format_id	: ,
                                format_id: format_id
                            })*/
                          // var group_format_id = 0;
                            var format_width = data[i].width;
                            var format_height = dataValue[i].height;
                            var format_type_id = dataValue[i].formatTypeId;
                            var format_is_archived = dataValue[i].isArchived;
                            var format_resource_url	 = dataValue[i].resourceUrl;


                            updateOrCreate(Modelformats, 
                                {format_id: format_id}, 
                                {format_id, format_name, format_width, format_height, format_type_id,format_is_archived,format_resource_url})
                                
                                .then(function(result) {
                                result.item;  // the model
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
        console.error('Error : '+error);
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
            var number_pages = Math.round(number_total_count/100);
            console.log(number_total_count);
            console.log('Number Pages :'+number_pages);
          
           const addItem = async () => {
                for (let page = 0; page < number_pages; page++) {
                    let offset = page*100;
                    var config2 = SmartFunction.config('insertions',offset);
                    await axios(config2).then(function (response) {
                        var dataValue = response.data;
                        var number_line_offset = data.length;

                        for (i = 0; i < number_line_offset; i++) {

                         //   console.log(dataValue)
                            var insertion_id = dataValue[i].id;
                            var delivery_regulated = dataValue[i].isDeliveryRegulated;
                            var used_guaranteed_deal = dataValue[i].isUsedByGuaranteedDeal;
                            var used_non_guaranteed_deal = dataValue[i].heigisUsedByNonGuaranteedDealht;
                            var voice_share = dataValue[i].voiceShare;
                            var event_id	 = dataValue[i].eventId;
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
                            var event_impression = dataValue[i].eventImpressions;
                            var holistic_yield_enabled = dataValue[i].isHolisticYieldEnabled;
                            var deliver_left_volume_after_end_date = dataValue[i].deliverLeftVolumeAfterEndDate;
                            var global_capping = dataValue[i].globalCapping;
                            var capping_per_visit = dataValue[i].cappingPerVisit;
                            var capping_per_click = dataValue[i].cappingPerClick;
                            var auto_capping = dataValue[i].autoCapping;
                            var periodic_capping_impression = dataValue[i].periodicCappingImpressions;
                            var periodic_capping_period = dataValue[i].periodicCappingPeriod;
                            var obaIcon_enabled = dataValue[i].isObaIconEnabled;
                            var format_id = dataValue[i].formatId;
                            var external_id = dataValue[i].externalId;
                            var external_description = dataValue[i].externalDescription;
                            var insertion_updated_at = dataValue[i].updatedAt;
                            var insertion_created_at = dataValue[i].createdAt;
                            var insertion_is_archived = dataValue[i].isArchived;
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
                                insertion_id ,
                                delivery_regulated ,
                                used_guaranteed_deal ,
                                used_non_guaranteed_deal ,
                                voice_share ,
                                event_id	 ,
                                insertion_name ,
                                insertion_description ,
                                site_id ,
                                pack_id ,
                                insertion_status_id ,
                                insertion_start_date ,
                                insertion_end_date ,
                                campaign_id ,
                                insertion_type_id ,
                                delivery_type_id ,
                                timezone_id ,
                                priority_id ,
                                periodic_capping_id ,
                                group_capping_id ,
                                max_impression ,
                                weight ,
                                max_click ,
                                max_impression_perday ,
                                max_click_perday ,
                                event_impression ,
                                holistic_yield_enabled ,
                                deliver_left_volume_after_end_date ,
                                global_capping ,
                                capping_per_visit ,
                                capping_per_click ,
                                auto_capping ,
                                periodic_capping_impression ,
                                periodic_capping_period ,
                                obaIcon_enabled ,
                                format_id ,
                                external_id ,
                                external_description ,
                                insertion_updated_at ,
                                insertion_created_at ,
                                insertion_is_archived ,
                                rate_type_id ,
                                rate ,
                                rate_net ,
                                discount ,
                                currency_id ,
                                insertion_link_id ,
                                insertion_exclusion_id ,
                                customized_script ,
                                sale_channel_id ,});


                            /*updateOrCreate(ModelInsertions, 
                                {insertion_id: insertion_id}, 
                                {
                                
                                    insertion_id ,
                                    delivery_regulated ,
                                    used_guaranteed_deal ,
                                    used_non_guaranteed_deal ,
                                    voice_share ,
                                    event_id	 ,
                                    insertion_name ,
                                    insertion_description ,
                                    site_id ,
                                    pack_id ,
                                    insertion_status_id ,
                                    insertion_start_date ,
                                    insertion_end_date ,
                                    campaign_id ,
                                    insertion_type_id ,
                                    delivery_type_id ,
                                    timezone_id ,
                                    priority_id ,
                                    periodic_capping_id ,
                                    group_capping_id ,
                                    max_impression ,
                                    weight ,
                                    max_click ,
                                    max_impression_perday ,
                                    max_click_perday ,
                                    event_impression ,
                                    holistic_yield_enabled ,
                                    deliver_left_volume_after_end_date ,
                                    global_capping ,
                                    capping_per_visit ,
                                    capping_per_click ,
                                    auto_capping ,
                                    periodic_capping_impression ,
                                    periodic_capping_period ,
                                    obaIcon_enabled ,
                                    format_id ,
                                    external_id ,
                                    external_description ,
                                    insertion_updated_at ,
                                    insertion_created_at ,
                                    insertion_is_archived ,
                                    rate_type_id ,
                                    rate ,
                                    rate_net ,
                                    discount ,
                                    currency_id ,
                                    insertion_link_id ,
                                    insertion_exclusion_id ,
                                    customized_script ,
                                    sale_channel_id ,
                                
                                })
                                
                                .then(function(result) {
                                result.item;  // the model
                                result.created; // bool, if a new item was created.
                            });*/













                           


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
        console.error('Error : '+error);
        // console.log(error); var statusCoded = error.response.status;
        // res.render("error_log.ejs", {statusCoded: statusCoded});
    }
}