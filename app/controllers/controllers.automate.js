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
                            var advertiser_id = dataValue[i].id;
                            var advertiser_name = dataValue[i].name;

                            console.log(dataValue);
                            const advertiser = Modelformats.create({advertiser_id, advertiser_name});
                           
                           
                           
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
                          ///  qgqfdg
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