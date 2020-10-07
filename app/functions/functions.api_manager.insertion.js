// Charge les identifiants de l'api SMART
const dbApi = require("../config/config.api");

// Charge le module axios 
const axios = require(`axios`);

// Charge les modules de la base de données
const db = require("../models/index");
const ModelInsertion = db.insertion;

/*
 * @function insertionAll
 * @description
 *             - Récupére le nombre total des insertions. 
 *             - Ensuite, on crée une pagination pour récupérer toutes les insertions
 * @request : 
 *         - url : l'appel de l'api en direct
 *
 * @return 
 */
async function insertionAll(url) {
 //init id autorisation api
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
        console.log(response.headers['x-pagination-total-count'])
        // Récupére le nb d'items 
        var total_count_data = response.headers['x-pagination-total-count'];
        var limit = 100;
        var offset = total_count_data - limit;
        //parseInit convertie en nbr
        var number_of_pages = parseInt(total_count_data / 100) + 1;

        console.log('number_of_pages:' + number_of_pages);
        console.log('Total:' + total_count_data);
        console.log(total_count_data - 100);

        if (number_of_pages) {
          for (i = 0; i <= number_of_pages; i++) { 
            console.log('Page:' + i);
            var offset = limit * i;
            var url_next = `${url}?limit=${limit}&offset=${offset}`;
            console.log(url_next);
            try {
              // Recherche les prochains résultats
              insertionForEach(url_next);
            } catch (error) {
              console.error('insertionForEach :' + error);
            }

          }
        }

      } // end response.data

    }).catch(function (error) {
      console.log(error);
    });

}


/*
 * @function insertionForEach
 * @descritption Charge l'ensemble des insertions
 * @request : 
 *         - url : l'appel de l'api en direct
 *
 * @return 
 */
async function insertionForEach(url) {

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
        var insertionsData = {
        insertion_id: `${obj.id}`,
        insertion_is_used_by_guaranteed_deal: `${obj.isUsedByGuaranteedDeal}` ,
        insertion_is_used_by_non_guaranteed_deal: `${obj.IsUsedByNonGuaranteedDeal}`,
        insertion_voice_share: `${obj.voiceShare}`,
        insertion_event_id: `${obj.eventId}`,
        insertion_name: `${obj.name}`,
        insertion_description: `${obj.description}`,
        insertion_is_personalize_ad: `${obj.isPersonalizeAd}`,
        insertion_status_id:`${obj.insertionsstatusId}` != "" ? `${obj.insertionsstatusId}` : null,
        insertion_start_date: `${obj.starDate}`,
        insertion_end_date: `${obj.endDate}`,
        //index
        campaign_id:`${obj.campaignId}`,
        insertion_type_id:`${obj.insertionTypeId}`,
        insertion_delivery_type_id:`${obj.isDeliveryRegulated}`,
        insertion_timezone_id:`${obj.timezoneId}`,
        insertion_priority_id:`${obj.priorityId}`,
        insertion_group_capping_id:`${obj.groupCappingId}`,
        insertion_max_impressions:`${obj.maxImpressions}`,
        insertion_weight:`${obj.weight}`,
        insertion_max_clicks:`${obj.maxClicks}`,
        insertion_max_impressions_per_day:`${obj.maxImpressionsPerDay}`,
        insertion_max_clicks_per_day:`${obj.maxClicksPerDay}`,
        insertion_grouped_volume_id:`${obj.maxClicksPerDay}`,
        insertion_event_impressions:`${obj.eventImpressions}`,
        insertion_is_holistic_yield_enabled: `${obj.isHolisticYieldEnabled}`,
        insertion_deliver_left_volume_after_end_date: `${obj.deliverLeftVolumeAfterEndDate}`,
        insertion_global_capping:`${obj.globalCapping}`,
        insertion_capping_per_visit:`${obj.cappingPerVisit}`,
        insertion_capping_per_click:`${obj.cappingPerClick}`,
        insertion_auto_capping:`${obj.autoCapping}`,
        insertion_periodic_capping_impressions:`${obj.periodicCappingImpressions}`,
        insertion_periodic_capping_period:`${obj.periodicCappingPeriod}`,
        insertion_is_oba_icon_enabled: `${obj.isObaIconEnabled}`,
        //index
        format_id:`${obj.formatId}`,
        insertion_external_id:`${obj.externalId}`,
        insertion_external_description: `${obj.externalDescription}`,
        insertion_update_at: `${obj.updateAt}`,
        insertion_created_at: `${obj.createdAt}`,
        insertion_is_archived: `${obj.isArchived}`,
        insertion_rate_type_id:`${obj.rateTypeId}`,
        insertion_rate: `${obj.rate}`,
        insertion_rate_net: `${obj.rateNet}`,
        insertion_discount: `${obj.discount}`,
        insertion_audience_data_cpm: `${obj.audienceDataCpm}`,
        insertion_semantic_data_cpm: `${obj.semanticDataCpm}`,
        insertion_currency_id:`${obj.currencyId}`,
        //index
        insertion_link_id:`${obj.linkId}`,
        insertion_customized_script: `${obj.customizedScript}`,
        insertion_sales_channel_id:`${obj.salesChannelId}`,
        };

        try {
          // Ajoute les données dans la table insertion
          ModelInsertion.create(insertionsData).then(function (insertion) {
            console.log('Add insertions success');
          });
        } catch (error) {
          console.error('insertionsAll :' + error);
        }

      });

    }

  });

}


// exports the variables and functions ci-dessous afin que d'autres modules puissent les utiliser
module.exports.insertionForEach = insertionForEach;
module.exports.insertionAll = insertionAll;