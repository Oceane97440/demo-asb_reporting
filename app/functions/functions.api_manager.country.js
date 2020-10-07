// Charge les identifiants de l'api SMART
const dbApi = require("../config/config.api");

// Charge le module axios 
const axios = require(`axios`);

// Charge les modules de la base de données
const db = require("../models/index");
const ModelCountry = db.country;

/*
 * @function countryAll
 * @description
 *             - Récupére le nombre total des campagnes. 
 *             - Ensuite, on crée une pagination pour récupérer toutes les campagnes
 * @request : 
 *         - url : l'appel de l'api en direct
 *
 * @return 
 */
async function countryAll(url) {

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
              countryForEach(url_next);
            } catch (error) {
              console.error('countryForEach :' + error);
            }

          }
        }

      } // end response.data

    }).catch(function (error) {
      console.log(error);
    });

}


/*
 * @function countryForEach
 * @descritption Charge l'ensemble des campagnes
 * @request : 
 *         - url : l'appel de l'api en direct
 *
 * @return 
 */
async function countryForEach(url) {

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
        var countryData = {
          country_id:`${obj.id}`,
          country_iso3166:`${obj.iso3166}`,
          country_name:`${obj.name}`,
          country_is_archived:`${obj.isArchived}`,
          continent_id:`${obj.continentId}`,
          country_extended_name:`${obj.extendedName}`
        };

        try {
          // Ajoute les données dans la table campaign
          console.log(countryData);
          ModelCountry.create(countryData).then(function (pays) {
            console.log('Add country success');
          });
        } catch (error) {
          console.error('countryAll :' + error);
        }

      });

    }

  });

}


// exports the variables and functions ci-dessous afin que d'autres modules puissent les utiliser
module.exports.countryForEach = countryForEach;
module.exports.countryAll = countryAll;