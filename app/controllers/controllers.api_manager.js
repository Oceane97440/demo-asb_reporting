// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');

// Initiliase le module axios
const axios = require(`axios`);
const {
  check,
  query
} = require('express-validator');

// Charge l'ensemble des functions de l'API
let SmartApiCampaign = require('../functions/functions.api_manager.campaign');
let SmartApiInsertion = require('../functions/functions.api_manager.insertion');
let SmartApiSite = require("../functions/functions.api_manager.site");
let SmartApiFormat = require("../functions/functions.api_manager.format");
let SmartApiCountry = require("../functions/functions.api_manager.country");

// Initialise les models
const db = require("../models/index");
const ModelCampaign = db.campaign;
const ModelCampaignStatus = db.campaignstatus;
const ModelAdvertiser = db.advertiser;
const ModelInsertion = db.insertion;
const ModelSite = db.site;
const ModelFormat = db.format;
const ModelCountry = db.country

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});

exports.index = (req, res) => {
  res.status(400).send({
    message: "index api"
  });
};

// 
exports.campaigns = (req, res) => {
  // Validate request
  if (req.query.isArchived) {
    var isArchived = 'both';
  } else {
    var isArchived = 'false';
  }

  let url = `https://manage.smartadserverapis.com/2044/campaigns/?isArchived=` + isArchived;

  // Charge la fonction campaignAll
  try {

    SmartApiCampaign.campaignAll(url);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving tutorials."
    });
  }

};

// Récupére toutes les insertions dans la base de donnée
exports.insertions = (req, res) => {

  let url = `https://manage.smartadserverapis.com/2044/insertions/`;

  // Charge la fonction insertionAll
  try {
    // console.log(url);
    SmartApiInsertion.insertionAll(url);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving tutorials."
    });
  }
};


// Ajoute les status des campagnes 
exports.campaignsstatus = (req, res) => {
  let url = `https://manage.smartadserverapis.com/2044/campaignstatus/`;
  console.log(url);

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


exports.advertisers = async(req, res) => {
  let url = `https://manage.smartadserverapis.com/2044/advertisers/`;

  await axios({
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

        // Créer un annonceur dans la bdd
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



  async function AdvertiserData(url) {

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
        var newArray = [];
        dataHouse.forEach(obj => {

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

          try {
            ModelAdvertiser.create(advertiserData);
          } catch (error) {
            console.log('N°' + advertiserData[advertiser_id]);
          }

        });

      }

    });


  }



  // Recherche les annonceurs
  async function adverstiserAsync(url) {

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

        if (number_of_pages) {
          for (i = 0; i < number_of_pages; i++) {
            console.log('Page:' + i);
            var offset = limit * i;
            var url_next = `https://manage.smartadserverapis.com/2044/advertisers/?limit=100&offset=${offset}`;
            console.log(url_next);

            try {
              // Recherche les prochains résultats
              AdvertiserData(url_next);
            } catch (error) {
              console.error(error);
            }


          }
        }

      }).catch(function (error) {
        console.log(error);
      });

  }


  // Recherche et insére les annoncerurs 
   adverstiserAsync(url);


};


//REQ GET SITES
exports.sites = (req, res) => {

  let url = `https://manage.smartadserverapis.com/2044/sites/`;

  // Charge la fonction insertionAll
  try {
    // console.log(url);
    SmartApiSite.sitesAll(url);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving tutorials."
    });
  }
};

//REQ GET FORMATS
exports.formats = (req, res) => {

  let url = `https://manage.smartadserverapis.com/2044/formats/`;

  // Charge la fonction formatAll
  try {
    // console.log(url);
    SmartApiFormat.formatAll(url);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving tutorials."
    });
  }
};

//REQ GET PAYS
exports.countries = (req, res) => {

  let url = `https://manage.smartadserverapis.com/2044/countries/`;

  // Charge la fonction insertionAll
  try {
    // console.log(url);
    SmartApiCountry.countryAll(url);
  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving tutorials."
    });
  }
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