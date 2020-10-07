// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
const bodyParser = require('body-parser');

// Initiliase le module axios
const axios = require(`axios`);
const {
  check,
  query
} = require('express-validator');

const db = require("../models/index");
const ModelCampaign = db.campaign;
const ModelCampaignStatus = db.campaignstatus;
const ModelAdvertiser = db.advertiser;


exports.index = (req, res) => {
  res.status(400).send({
    message: "index api"
  });
};

// 
exports.campaigns = (req, res) => {
  // 
  /* //const { check } = validator(['query', 'limit']);
   var limit = req.query.limit;
  var offset = req.query.offset;

  query('limit')
  .isNumeric()
  .withMessage('Must be only numeric chars');
*/

  let url = `https://manage.smartadserverapis.com/2044/campaigns/?limit=100&offset=0`;
  console.log(url);

  process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
  });


  async function loadUrl(url) {
    
    await axios({
      method: 'get',
      url,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json"
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password
      }
    }).then(function (responseAs) {
      dataHouse = responseAs.data;

      if (dataHouse) {
        console.log('DataHouse : ' + dataHouse.length);
        //  newArray.push(dataHouse);
        var newArray = [];
        dataHouse.forEach(obj => {

          // Create a Campaign
          var campaignData = {
            campaign_id: `${obj.id}`,
            campaign_name: `${obj.name}`,
            advertiser_id: `${obj.advertiserId}` != "0" ? `${obj.advertiserId}` : null,
            agency_id: `${obj.agencyId}` != "0" ? `${obj.agencyId}` : null,
            campaign_status_id: `${obj.advertiserstatusId}` != "" ? `${obj.advertiserstatusId}` : null,
            campaign_description: `${obj.description}`,
            campaign_external_id: `${obj.externalCampaignId}`,
            campaign_trafficked_by: `${obj.traffickedBy}`,
            campaign_traded_by: `${obj.tradedBy}`,
            campaign_start_date: `${obj.startDate}`,
            campaign_end_date: `${obj.endDate}`,
            campaign_global_capping: `${obj.globalCapping}`,
            campaign_visit_capping: `${obj.visitCapping}`,
            campaign_isarchived: `${obj.isArchived}`
          };

          newArray.push(campaignData);

        });


      }

      return newArray;

    });
    

  }


  async function fonctionAsynchroneOk(url) {
    
    axios({
      method: 'get',
      url,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json",
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password,
      }
    })
    .then(function (response) {
      var newArrayTab = []; 
      data = response.data;
      console.log(data.length);

      // Récupére le nb d'items 
      var total_count_data = response.headers['x-pagination-total-count'];
      var limit = 100;
      var offset = total_count_data - 100;
      var number_of_pages = parseInt(total_count_data / 100) + 2;
      console.log('number_of_pages:' + number_of_pages);

      console.log('Total:' + total_count_data);
      console.log(total_count_data - 100);

      if(number_of_pages) {
        for (i = 0; i < number_of_pages; i++) {
          console.log('Page:' + i);
          var offset = limit * i;
          var url_next = `https://manage.smartadserverapis.com/2044/campaigns/?limit=100&offset=${offset}`;
          console.log(url_next);

          var tabArray = loadUrl(url_next);
          newArrayTab.push(tabArray);

          


          /*
          axios({
            method: 'get',
            url,
            headers: {
              "Access-Control-Allow-Origin": "*",
              "Content-type": "Application/json"
            },
            auth: {
              username: dbApi.SMART_login,
              password: dbApi.SMART_password
            }
          }).then(function (responseAs) {
            dataHouse = responseAs.data;
  
            if (dataHouse) {
              console.log('DataHouse : ' + dataHouse.length);
              //  newArray.push(dataHouse);
  
              dataHouse.forEach(obj => {
  
                // Create a Campaign
                var campaignData = {
                  campaign_id: `${obj.id}`,
                  campaign_name: `${obj.name}`,
                  advertiser_id: `${obj.advertiserId}` != "0" ? `${obj.advertiserId}` : null,
                  agency_id: `${obj.agencyId}` != "0" ? `${obj.agencyId}` : null,
                  campaign_status_id: `${obj.advertiserstatusId}` != "" ? `${obj.advertiserstatusId}` : null,
                  campaign_description: `${obj.description}`,
                  campaign_external_id: `${obj.externalCampaignId}`,
                  campaign_trafficked_by: `${obj.traffickedBy}`,
                  campaign_traded_by: `${obj.tradedBy}`,
                  campaign_start_date: `${obj.startDate}`,
                  campaign_end_date: `${obj.endDate}`,
                  campaign_global_capping: `${obj.globalCapping}`,
                  campaign_visit_capping: `${obj.visitCapping}`,
                  campaign_isarchived: `${obj.isArchived}`
                };
  
                newArray.push(campaignData);
  
              });
  
  
            }
          });
          */

        }
    }

   

    }).catch(function (error) {
      console.log(error);
    });



   }


   fonctionAsynchroneOk(url);

/*

  axios({
      method: 'get',
      url,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json",
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password,
      }
    })
    .then(function (response) {
     
      data = response.data;
      console.log(data.length);

      // Récupére le nb d'items 
      var total_count_data = response.headers['x-pagination-total-count'];
      var limit = 100;
      var offset = total_count_data - 100;
      var number_of_pages = parseInt(total_count_data / 100) + 2;
      console.log('number_of_pages:' + number_of_pages);


      console.log('Total:' + total_count_data);
      console.log(total_count_data - 100);

      var newArray = []
      data.forEach(obj => {

        // Create a Campaign
        var campaignData = {
          campaign_id: `${obj.id}`,
          campaign_name: `${obj.name}`,
          advertiser_id: `${obj.advertiserId}` != "0" ? `${obj.advertiserId}` : null,
          agency_id: `${obj.agencyId}` != "0" ? `${obj.agencyId}` : null,
          campaign_status_id: `${obj.advertiserstatusId}` != "" ? `${obj.advertiserstatusId}` : null,
          campaign_description: `${obj.description}`,
          campaign_external_id: `${obj.externalCampaignId}`,
          campaign_trafficked_by: `${obj.traffickedBy}`,
          campaign_traded_by: `${obj.tradedBy}`,
          campaign_start_date: `${obj.startDate}`,
          campaign_end_date: `${obj.endDate}`,
          campaign_global_capping: `${obj.globalCapping}`,
          campaign_visit_capping: `${obj.visitCapping}`,
          campaign_isarchived: `${obj.isArchived}`
        };

        newArray.push(campaignData);

      });


      for (i = 0; i < number_of_pages; i++) {
        console.log('Page:' + i);
        var offset = limit * i;
        let url = `https://manage.smartadserverapis.com/2044/campaigns/?limit=100&offset=${offset}`;
        console.log(url);
        console.log('----------------------------------');

        axios({
          method: 'get',
          url,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Content-type": "Application/json"
          },
          auth: {
            username: dbApi.SMART_login,
            password: dbApi.SMART_password
          }
        }).then(function (responseAs) {
          dataHouse = responseAs.data;

          if (dataHouse) {
            console.log('DataHouse : ' + dataHouse.length);
            //  newArray.push(dataHouse);

            dataHouse.forEach(obj => {

              // Create a Campaign
              var campaignData = {
                campaign_id: `${obj.id}`,
                campaign_name: `${obj.name}`,
                advertiser_id: `${obj.advertiserId}` != "0" ? `${obj.advertiserId}` : null,
                agency_id: `${obj.agencyId}` != "0" ? `${obj.agencyId}` : null,
                campaign_status_id: `${obj.advertiserstatusId}` != "" ? `${obj.advertiserstatusId}` : null,
                campaign_description: `${obj.description}`,
                campaign_external_id: `${obj.externalCampaignId}`,
                campaign_trafficked_by: `${obj.traffickedBy}`,
                campaign_traded_by: `${obj.tradedBy}`,
                campaign_start_date: `${obj.startDate}`,
                campaign_end_date: `${obj.endDate}`,
                campaign_global_capping: `${obj.globalCapping}`,
                campaign_visit_capping: `${obj.visitCapping}`,
                campaign_isarchived: `${obj.isArchived}`
              };

              newArray.push(campaignData);

            });


          }

        });


      }

      console.log('Total foreach nb:' + newArray.length);
     
    }).catch(function (error) {
      console.log(error);
    });
*/

};

// Ajoute les status des campagnes 
exports.campaignsstatus = (req, res) => {
  let url = `https://manage.smartadserverapis.com/2044/campaignstatus/`;

  axios({
      method: 'get',
      url,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json",
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password,
      }
    })
    .then(function (response) {
      data = response.data;
      console.log(data);

      data.forEach(obj => {

        // Create a Campaign
        const dataStatus = {
          campaign_status_id: `${obj.id}`,
          campaign_status_name: `${obj.name}`
        };

        // Save Campaign in the database
        ModelCampaignStatus.create(dataStatus)
          .then(success => {
            return res.status(404).send({
              message: "Nombre de status campagne:" + data.length
            });
          })
          .catch(err => {
            return res.status(500).send({
              message: err.message || "Some error occurred while creating the campaign."
            });
          });

      });

    })
    .catch(function (error) {
      console.log(error);
    });

};


exports.advertisers = (req, res) => {
  let url = `https://manage.smartadserverapis.com/2044/advertisers/`;

  axios({
      method: `get`,
      url,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json",
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password,
      }
    })
    .then(function (response) {
      data = response.data;

      data.forEach(obj => {

        // Create a Campaign
        const advertiserData = {
          advertiser_id: `${obj.id}`,
          advertiser_name: `${obj.name}`,
          advertiser_description: `${obj.description}`,
          advertiser_is_direct_advertiser: `${obj.isDirectAdvertiser}`,
          advertiser_is_house_ads: `${obj.isHouseAds}`,
          advertiser_address: `${obj.address}`,
          advertiser_contact_name: `${obj.ContactName}`,
          advertiser_contact_email: `${obj.ContactEmail}`,
          advertiser_contact_phone_number: `${obj.contactPhoneNumber}`,
          advertiser_is_archived: `${obj.isArchived}`,
          advertiser_user_group_id: `${obj.userGroupId}`
        };

        // Save Advertiser in the database
        ModelAdvertiser.create(advertiserData)
          .then(success => {
            return res.status(404).send({
              message: "Nombre d'annonceurs:" + data.length
            });
          })
          .catch(err => {
            return res.status(500).send({
              message: err.message || "Some error occurred while creating the campaign."
            });
          });

      });


    })
    .catch(function (error) {
      console.log(error);
    });

};





// Retrieve all advertisers from the database.
exports.findAll = (req, res) => {

};

// Find a single Campaign with an id
exports.findOne = (req, res) => {

};

// Update a Campaign by the id in the request
exports.update = (req, res) => {

};

// Delete a Campaign with the specified id in the request
exports.delete = (req, res) => {

};

// Delete all advertisers from the database.
exports.deleteAll = (req, res) => {

};

// Find all published advertisers
exports.findAllPublished = (req, res) => {

};