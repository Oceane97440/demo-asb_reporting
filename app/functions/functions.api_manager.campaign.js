// Charge les identifiants de l'api SMART
const dbApi = require("../config/config.api");

// Charge le module axios 
const axios = require(`axios`);

// Charge les modules de la base de données
const db = require("../models/index");
const ModelCampaign = db.campaign;
const ModelCampaignStatus = db.campaignstatus;
const ModelAdvertiser = db.advertiser;

/*
 * @function campaignAll
 * @description
 *             - Récupére le nombre total des campagnes. 
 *             - Ensuite, on crée une pagination pour récupérer toutes les campagnes
 * @request : 
 *         - url : l'appel de l'api en direct
 *
 * @return 
 */
async function campaignAll(url) {

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
     
      // Récupére toutes les données
      if(data = response.data) {

        console.log(data.length);

        // Récupére le nb d'items 
        var total_count_data = response.headers['x-pagination-total-count'];
        console.log(response.headers['x-pagination-total-count'])

        var limit = 100;
        var offset = total_count_data - limit;
        var number_of_pages = parseInt(total_count_data / 100) + 1;

        console.log('number_of_pages:' + number_of_pages);
        console.log('Total:' + total_count_data);
        console.log(total_count_data - 100);

        if (number_of_pages) {
          for (i = 0; i <= number_of_pages; i++) {
            console.log('Page:' + i);
            var offset = limit * i;
            var url_next = `${url}?limit=${limit}&offset=${offset}`;

            try {
              // Recherche les prochains résultats
              campaignForEach(url_next);              
            } catch (error) {
              console.error('campaignForEach :'+error);
            }

          }
        }
      
      } // end response.data

    }).catch(function (error) {
      console.log(error);
    });

}


/*
 * @function campaignForEach
 * @descritption Charge l'ensemble des campagnes
 * @request : 
 *         - url : l'appel de l'api en direct
 *
 * @return 
 */
async function campaignForEach(url) {

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
    
    // Récupére les données 
    if (dataHouse = responseAs.data) {
      dataHouse.forEach(obj => {

        // Créer le tableau de données
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

        try {
          // Ajoute les données dans la table campaign
          console.log(campaignData);
          ModelCampaign.create(campaignData).then(function(campaign){
            console.log('Add campaign success');
          });
        } catch (error) {
           console.error('campaignAll :'+error);
        }

      });

    }

  });

}

 function campaignCreate(request) {
//   console.log('functioncreate'+request)
  
//   let url = `https://manage.smartadserverapis.com/2044/campaigns`;

//   let res=  axios({
//     method: 'post',
//     url,
//     headers: {
//       'Authorization': 'Basic',
//       "Access-Control-Allow-Origin": "*",
//       "Content-type": "Application/json"
//     },
//     auth: {
//       username: dbApi.SMART_login,
//       password: dbApi.SMART_password
//     },
//     data: request
//   }).then(function (response) {
//     console.log(response)
//     if (response.headers && response.headers.location) {
//       try {
//          var location = response.headers.location;
//          console.log(location)
//         return location;
//       } catch (error) {
//        console.error('forecast :' + error);
//       }
//     }

//   }).catch(function (error) {
//     console.log('Error:' + error);
//   });
// console.log(axios)
//   return res;

}
// exports the variables and functions ci-dessous afin que d'autres modules puissent les utiliser
module.exports.campaignCreate=campaignCreate;
module.exports.campaignForEach = campaignForEach;
module.exports.campaignAll = campaignAll;