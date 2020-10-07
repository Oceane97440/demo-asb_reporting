// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');

const asyncly = require('async');

// Initiliase le module axios
const axios = require(`axios`);
const {
  check,
  query
} = require('express-validator');

// Charge l'ensemble des functions de l'API
let SmartApiCampaign = require('../functions/functions.api_manager.campaign');
let AxiosFunction = require('../functions/functions.axios');

// let SmartApiInsertion = require('../functions/functions.api_manager.insertion');
// let SmartApiSite = require("../functions/functions.api_manager.site");
// let SmartApiFormat = require("../functions/functions.api_manager.format");
// let SmartApiCountry = require("../functions/functions.api_manager.country");

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




exports.campaign = async (req, res) => {

  await ModelCampaign.findAll({
    attributes: ['campaign_id', 'campaign_name', 'campaign_start_date', 'campaign_end_date'],
    order: [
      ['campaign_name', 'ASC']
    ],
  }).then(campaigns => {
    //  res.send(campaigns)
    res.render('campaigns/list_campaigns', {
      campaigns: campaigns,
    });
  });

}
exports.campaign_form = async (req, res) => {

  await ModelAdvertiser.findAll({
    attributes: ['advertiser_id', 'advertiser_name'],
    order: [
      ['advertiser_name', 'ASC']
    ],
  }).then(advertiser => {
    //  res.send(campaigns)
    res.render('campaigns/form', {
      advertiser: advertiser,
    });
  });

}




//Create campaign
exports.add_campaign = async (req, res) => {

  var campaign_name = req.body.campaign_name;
  var advertiserIds = req.body.advertiserIds;
  var date_start = req.body.date_start;
  var date_end = req.body.date_end;

  var request = {

    "name": campaign_name,
    "advertiserId": advertiserIds,
    "agencyId": 0,
    "campaignStatusId": 3,
    "description": "",
    "externalCampaignId": "",
    "traffickedBy": 0,
    "startDate": date_start,
    "endDate": date_end,
    "globalCapping": 0,
    "visitCapping": 0,
    "isArchived": false
  }

  // await axios({
  //     method: 'post',
  //     url: 'https://manage.smartadserverapis.com/2044/campaigns',
  //     headers: {
  //       'Authorization': 'Basic',
  //       "Access-Control-Allow-Origin": "*",
  //       'Content-Type': 'application/json'
  //     },
  //     auth: {
  //       username: dbApi.SMART_login,
  //       password: dbApi.SMART_password
  //     },
  //     data: request
  //   })
  //   .then(function (response) {
  //     console.log(response)
  //     res.send("La campagne a bien était ajouter")
  //   })
  //   .catch(function (error) {
  //     console.log(error);
  //   });

  let firstReq = await AxiosFunction.getManageData('POST', '', request);
  console.log(firstReq)


}

//listing des annonceurs
exports.advertiser = async (req, res) => {

  await ModelAdvertiser.findAll({
    attributes: ['advertiser_id', 'advertiser_name'],
    order: [
      ['advertiser_name', 'DESC']
    ],
  }).then(advertiser => {
    //  res.send(campaigns)
    res.render('advertisers/list_advertiser', {
      advertiser: advertiser,
    });
  });

}



//Create advertiser
exports.add_advertiser = async (req, res) => {

  var advertiser_name = req.body.advertiser_name;

  try {
    var request = {

      "name": advertiser_name,
      "isDirectAdvertiser": true,
      "isHouseAds": false,
      "isArchived": false,
      "userGroupId": 12958
    }


    let firstReq = await AxiosFunction.getManageData('POST', '', request);
    console.log(firstReq)

    await ModelAdvertiser.create({
        advertiser_name: advertiser_name

      })
      // .then((response) => {
      //   console.log(response)
      //   res.send("L'annonceur  a bien était ajouter")
      // })
      // .catch(function (error) {
      //   console.log(error);
      // });
      return res.send("L'annonceur  a bien était ajouter")


  } catch (error) {
    console.error(error)




  }




}

//Update un annonceur
exports.edit_advertiser = async (req, res) => {

  var id = req.params.id;

  await ModelAdvertiser.findOne({
    where: {
      advertiser_id: id
    }

  }).then(advertiser => {

    res.render('advertisers/form', {
      advertiser: advertiser,
    })
  })

}

exports.update_advertiser = async (req, res) => {
  var id = req.params.id;
  var advertiser_name = req.body.advertiser_name;

  var request = {

    "id": id,
    "name": advertiser_name,
    "isDirectAdvertiser": true,
    "isHouseAds": false,
    "isArchived": false,
    "userGroupId": 12958

  }


  await axios({
    method: 'put',
    url: 'https://manage.smartadserverapis.com/2440/advertisers/',
    headers: {
      'Authorization': 'Basic',
      "Access-Control-Allow-Origin": "*",
      'Content-Type': 'application/json'
    },
    auth: {
      username: dbApi.SMART_login,
      password: dbApi.SMART_password
    },
    data: request
  })
  try {


    await ModelAdvertiser.findOne({
      where: {
        advertiser_id: id
      }

    }).then(() => {
      ModelAdvertiser.update({
        advertiser_name: advertiser_name,

      }, {
        where: {
          advertiser_id: id
        }

      }).then(
        res.redirect('/api/manager/crud/advertiser')
        // res.send('Update' + id)

      ).catch(function (error) {
        console.log(error);
      });

    })
  } catch (error) {
    console.error(error)




  }

}



//Delete un annonceur dans la bdd et smart
exports.delete = async (req, res) => {
  var id = req.params.id;

  let url = `https://manage.smartadserverapis.com/2044/advertisers/${id}`;
  console.log(url)

  await axios({
    method: 'delete',
    url,
    headers: {
      'Authorization': 'Basic',
      "Access-Control-Allow-Origin": "*",
      'Content-Type': 'application/json'
    },
    auth: {
      username: dbApi.SMART_login,
      password: dbApi.SMART_password
    },
  })

  try {

    await ModelAdvertiser.destroy({
        where: {
          advertiser_id: id
        }
      }).then(() => {
        // console.log(response)
        res.send("L'annonceur a bien était supprimé")
      })
      .catch(function (error) {
        console.log(error);
      });

  } catch (error) {
    console.error(error)




  }


}



















// exports.test = async (req, res) => {

//   var request = {
//     "name": "Requête brut api",
//     "advertiserId": 409707,
//     "agencyId": 0,
//     "campaignStatusId": 3,
//     "description": "",
//     "externalCampaignId": "",
//     "traffickedBy": 0,
//     "startDate": "2020-09-17T00:00:00",
//     "endDate": "2020-09-17T00:00:00",
//     "globalCapping": 0,
//     "visitCapping": 0,
//     "isArchived": false
//   };

//   await axios({
//     method: 'post',
//     url: 'https://manage.smartadserverapis.com/2044/campaigns',
//     headers: {
//       'Authorization': 'Basic',
//       "Access-Control-Allow-Origin": "*",
//       'Content-Type': 'application/json'
//     },
//     auth: {
//       username: dbApi.SMART_login,
//       password: dbApi.SMART_password
//     },
//     data: request
//   })
//   .then(function (response) {
//     console.log(response)
//     console.log(JSON.stringify(response.data));
//   })
//   .catch(function (error) {
//     console.log(error);
//   });

// }