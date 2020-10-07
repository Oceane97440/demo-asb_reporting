// Charge les identifiants de l'api SMART
const dbApi = require("../config/config.api");

// Charge le module axios 
const axios = require(`axios`);

// Charge les modules de la base de données
const db = require("../models/index");
const ModelSite = db.site;
//const ModelSiteStatus = db.campaignstatus;
//const ModelAdvertiser = db.advertiser;

/*
 * @function sitesAll
 * @description
 *             - Récupére le nombre total des campagnes. 
 *             - Ensuite, on crée une pagination pour récupérer toutes les campagnes
 * @request : 
 *         - url : l'appel de l'api en direct
 *
 * @return 
 */
async function sitesAll(url) {

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
              sitesForEach(url_next);              
            } catch (error) {
              console.error('sitesForEach :'+error);
            }

          }
        }
      
      } // end response.data

    }).catch(function (error) {
      console.log(error);
    });

}


/*
 * @function sitesForEach
 * @descritption Charge l'ensemble des campagnes
 * @request : 
 *         - url : l'appel de l'api en direct
 *
 * @return 
 */
async function sitesForEach(url) {

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
        var sitesData = {
          site_id: `${obj.id}`,
          site_is_child_directed: `${obj.isChildDirected}`,
          country_id:`${obj.countryId}` != "0" ? `${obj.countryId}` : null,
          site_name:`${obj.name}`,
          site_is_archived: `${obj.isArchived}`,
          site_extrenal_id:`${obj.extrenalId}`,
          user_group_id:`${obj.groupId}` != "0" ? `${obj.groupId}` : null,
          site_url:`${obj.url}`,
          language_id:`${obj.languageId}` != "0" ? `${obj.languageId}` : null,
          site_updated_at:`${obj.updatedAt}`,
          site_business_model_type_id:`${obj.businessModelTypeId}`,
          site_businessModelValue:`${obj.businessModelValue}`,
          site_application_id:`${obj.applicationId}`,
        };

        try {
         // Ajoute les données dans la table format
          ModelSite.findOrCreate({
                where: {
                  site_id: sitesData.site_id,
                  site_name: sitesData.site_name
                },
                defaults: sitesData
              }

            )
            .then(function (sites) {
              console.log('Add site success');
            });
          }
          catch (error) {
            console.error('siteAll :' + error);
          }
      });

    }

  });

}


// exports the variables and functions ci-dessous afin que d'autres modules puissent les utiliser
module.exports.sitesForEach = sitesForEach;
module.exports.sitesAll = sitesAll;