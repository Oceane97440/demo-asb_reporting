// Charge les identifiants de l'api SMART
const dbApi = require("../config/config.api");

// Charge le module axios 
const axios = require(`axios`);

// Charge les modules de la base de données
const db = require("../models/index");
const ModelFormat = db.format;
//const ModelFormatStatus = db.campaignstatus;
//const ModelAdvertiser = db.advertiser;

/*
 * @function formatAll
 * @description
 *             - Récupére le nombre total des campagnes. 
 *             - Ensuite, on crée une pagination pour récupérer toutes les campagnes
 * @request : 
 *         - url : l'appel de l'api en direct
 *
 * @return 
 */
async function formatAll(url) {

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
      if (data = response.data) {

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
              formatForEach(url_next);
            } catch (error) {
              console.error('formatForEach :' + error);
            }

          }
        }

      } // end response.data

    }).catch(function (error) {
      console.log(error);
    });

}


/*
 * @function formatForEach
 * @descritption Charge l'ensemble des campagnes
 * @request : 
 *         - url : l'appel de l'api en direct
 *
 * @return 
 */
async function formatForEach(url) {

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
        formatsData = {
          format_id: `${obj.id}`,
          format_name: `${obj.name}`,
          format_width:`${obj.width}`,
          format_height:`${obj.height}`,
          format_type_id:`${obj.formatTypeId}`,
          format_is_archived: `${obj.isArchived}`,
          format_resource_url:`${obj.resourceUrl}`
        };

        try {
			// Ajoute les données dans la table format
			ModelFormat.findOrCreate({
                where: {
                  format_id: formatsData.format_id,
                  format_name: formatsData.format_name
                },
                defaults: formatsData
            })
          }
          catch (error) {
            console.error('formatAll :' + error);
          }

      });

    }

  });

}


// exports the variables and functions ci-dessous afin que d'autres modules puissent les utiliser
module.exports.formatForEach = formatForEach;
module.exports.formatAll = formatAll;