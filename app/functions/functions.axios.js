const axios = require(`axios`);
const dbApi = require("../config/config.api");
const Utilities = require('../functions/functions.utilities');
/**
 * Requête API FORECAST
 * @constructor
 * @param {string} method - POST ou GET
 * @param {string} urlForecast - URL API.
 * @param {string} data - Obj data

 */
exports.getForecastData = async (method, urlForecast, data = null) => {
  var test;
  if (method == 'GET') {

    test = await axios({
      method: method,
      url: urlForecast,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json"
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password
      }
    });

  } else if (method == 'POST') {
    test = await axios({
      method: 'POST',
      url: 'https://forecast.smartadserverapis.com/2044/forecast',
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json"
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password
      },
      data
    });
  }
  return test;
}

exports.getReportingData = async (method, urlReporting, data = null) => {

  var return_data;
  if (method == 'POST') {
    return_data = await axios({
      method: method,
      url: 'https://reporting.smartadserverapis.com/2044/reports',
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json"
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password
      },
      data: data
    }).catch(function (error) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.log('------------');
        //  console.log('data : ', data);
        console.log('response.data : ', error.response.data);
        console.log('response.status : ', error.response.status);
        console.log('response.headers : ', error.response.headers);

        /* log_err =  Utilities.logs('error')
         log_err.error('Requête Reporting erreur : ' + error.response.status + " - " + error.response.statusText);
         log_err.error(error.response.data.Message);*/

        console.log('------------');
        return return_data = null;
      } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.log('request', error.request);
      } else {
        // Something happened in setting up the request that triggered an Error
        console.log('Error', error.message);
      }
      console.log(error.config);
    });
  } else if (method == 'GET') {

    return_data = await axios({
      method: method,
      url: urlReporting,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json"
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password
      }
    })


  }


  return return_data


}

/**
 * Fonction pour l'affichage des données pour le front
 * @param {Array} dataArrayFromReq 
 * @returns les valeurs pour faire la table
 */

exports.dataFormatingForForecast = async (dataArrayFromReq) => {

  var TotalImpressions = []
  var OccupiedImpressions = []
  var SiteID = []
  var SiteName = []
  var FormatID = []
  var FormatName = []

  for (let i = 0; i < dataArrayFromReq.length; i++) {
    if (dataArrayFromReq[i]) {
      var data = dataArrayFromReq[i];

      //delete les ; et delete les blanc
      line = data.split(';');
      let dataTotalImpression = line[6].split('\r\n')[1];
      // let dataAvailableImpression = line[12].split('\r\n')[0];

      //push la donnéé splité dans un tab vide
      TotalImpressions.push(dataTotalImpression);
      OccupiedImpressions.push(line[7]);
      SiteID.push(line[8]);
      SiteName.push(line[9]);
      FormatID.push(line[10]);
      FormatName.push(line[11]);
    }
  }


  var sommeImpressions = 0
  var sommeOccupied = 0

  for (let k = 0; k < TotalImpressions.length; k++) {
    if (TotalImpressions[k] != '') {
      sommeImpressions += parseInt(TotalImpressions[k])
      sommeOccupied += parseInt(OccupiedImpressions[k])
    }
  }

  var volumeDispo = sommeImpressions - sommeOccupied;

  //SEPARATEUR DE MILLIER universel 
  sommeImpressions = Utilities.numStr(sommeImpressions);
  sommeOccupied = Utilities.numStr(sommeOccupied);
  volumeDispo = Utilities.numStr(volumeDispo);

  var tableData = {
    TotalImpressions,
    OccupiedImpressions,
    SiteID,
    SiteName,
    FormatID,
    FormatName,
    sommeImpressions,
    sommeOccupied,
    volumeDispo
  }
  return tableData;
}

exports.getManageData = async (method) => {

  try {
    var format_data;

    if (method == 'GET') {

      format_data = await axios({
        method: method,
        url: 'https://manage.smartadserverapis.com/2044/formats',
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "Application/json"
        },
        auth: {
          username: dbApi.SMART_login,
          password: dbApi.SMART_password
        },

      })


    }

    return format_data
  } catch (error) {
    /* log_err = await Utilities.logs('error')
     log_err.error('Requête GET API errreur : ' + error.response.status + " - " + error.response.statusText);
     log_err.error(error.response.data.Message);*/

  }

}



exports.postManage = async (method, data = null) => {

  try {
    var test;

    console.log('method' + method)
    console.log('data' + data)

    switch (method) {
      case 'agencies':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/agencies';
        break;
      case 'advertisers':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/advertisers';
        break;
      case 'campaigns':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/campaigns';
        break;
      case 'insertions':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/insertions';
        break;
      case 'creatives':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/imagecreatives';
        break;

      default:

        break;
    }

    test = await axios({
      method: 'POST',
      url: configApiUrl,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json"
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password
      },
      data
    })


    return test;
  } catch (error) {
    /*log_err = await Utilities.logs('error')
    log_err.error('Requête POST API errreur : ' + error.response.status + " - " + error.response.statusText);
    log_err.error(error.response.data.Message);*/

  }


}


exports.copyManage = async (method, data = null, id) => {

  try {

    var test;



    switch (method) {

      case 'insertions':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/insertions/' + id + '/copy/';
        break;
      case 'creatives':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/imagecreatives';
        break;

      default:

        break;
    }

    test = await axios({
      method: 'POST',
      url: configApiUrl,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json"
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password
      },
      data
    })


    return test;
  } catch (error) {
    /*log_err = await Utilities.logs('error')
    log_err.error("Erreur lors de la duplication d'une insertion insertion_id :" + id + '-' + error.response.status + " - " + error.response.statusText);
    log_err.error(error.response.data.Message);*/

  }

}


exports.getManage = async (url_location, id) => {

  var test;

  console.log('url_location' + url_location)


  test = await axios({
    method: 'GET',
    url: url_location,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-type": "Application/json"
    },
    auth: {
      username: dbApi.SMART_login,
      password: dbApi.SMART_password
    },
  })


  return test;
}


exports.getManageCopy = async (method, id) => {

  try {
    var test;

    console.log('method' + method)
    console.log('method' + id)

    switch (method) {

      case 'creatives':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/insertions/' + id + '/creatives';
        break;
      case 'scriptcreatives':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/scriptcreatives/' + id;
        break;

      default:

        break;
    }

    test = await axios({
      method: 'GET',
      url: configApiUrl,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json"
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password
      },
    })


    return test;
  } catch (error) {
    /*log_err = await Utilities.logs('error')
     log_err.error('Erreur GET API créative : ' + id + '-' + error.response.status + " - " + error.response.statusText);
     log_err.error(error.response.data.Message);*/
  }


}

exports.putManage = async (method, data = null) => {

  try {
    var test;

    console.log('method' + method)
    console.log('data' + data)

    switch (method) {
      case 'insertiontargetings':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/insertiontargetings';
        break;
      case 'insertiontemplates':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/insertiontemplates';
        break;
      case 'imagecreatives':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/imagecreatives/';
        break;
      case 'videocreatives':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/videocreatives/';
        break;
      case 'scriptcreatives':
        var configApiUrl = 'https://manage.smartadserverapis.com/2044/scriptcreatives/';
        break;

      default:

        break;
    }

    test = await axios({
      method: 'PUT',
      url: configApiUrl,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json"
      },
      auth: {
        username: dbApi.SMART_login,
        password: dbApi.SMART_password
      },
      data
    })


    return test;
  } catch (error) {

    /* log_err = await Utilities.logs('error')
     log_err.error(error.response.status + " - " + error.response.statusText);
     log_err.error(error.response.data.Message);*/


  }


}

exports.getAdManager = async (campaign_id) => {
  console.log('campaign_id' + campaign_id)

  var test;

  try {
    test = await axios({
      method: 'GET',
      url: 'https://reporting.antennesb.fr/api_google-manager/data/json/campaignID-' + campaign_id + '.json',
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Content-type": "Application/json"
      }

    })
    return test

  } catch (error) {

    /* log_err = await Utilities.logs('error')
     log_err.error('Erreur campagne GAM ' + error.response);*/

  }


  /*test = await axios({
     method: 'GET',
     url: 'https://reporting.antennesb.fr/api_google-manager/data/json/campaignID-'+campaign_id+ '.json',
     headers: {
       "Access-Control-Allow-Origin": "*",
       "Content-type": "Application/json"
     }
  
   }).catch(error => {
       console.log(error.response)
   });

   return test*/



}


//fonction qui génère la requete global du forecast , prévision sur les 5prochains jours
exports.RequestForecastGlobal = async function requestForecast(startDate, endDate) {

  var RequestForecastGlobal = {

    "startDate": startDate,
    "endDate": endDate,
    "timeZoneId": "Arabian Standard Time",
    "filter": [
      {
        "CountryID": [
          61
        ]
      },
      /*{
        "SiteID": [
          299244,
          299245,
          299248,
          299249,
          299252,
          299253,
          299254,
          299263,
          322433,
          323124,
          337707
        ]
      },*/
      {
        "FormatID": [
          "79633",
          "79637",
          "79638",
          "79642",
          "79643",
          "79644",
          "79645",
          "79956",
          "79650",
          "79651",
          "79652",
          "79653",
          "79654",
          "79634",
          "79635",
          "79636",
          "79639",
          "79640",
          "79641",
          "87301",
          "87302",
          "87303",
          "87304",
          "87305",
          "87314",
          "87307",
          "87308",
          "87309",
          "87310",
          "87306",
          "87311",
          "87312",
          "87313",
          "43791",
          "44149",
          "44152",
          "79433",
          "79409",
          "84652",
          "84653",
          "84654",
          "84655",
          "84656",
          "79421",
          "84966",
          "84967",
          "84968",
          "86087",
          "86088",
          "79425",
          "84657",
          "84658",
          "84659",
          "84660",
          "84661",
          "79431"
        ]
      }
    ],
    "fields": [
      "Day",
      "CampaignID",
      "CampaignName",
      "InsertionId",
      "InsertionName",
      "FormatName",
      "InsertionBookedVolume",
      "InsertionForecastedDeliveredVolume",
      "InsertionForecastedDeliveredPercentage"
    ]
  }

  let sendRequest = await axios({
    method: 'POST',
    url: 'https://forecast.smartadserverapis.com/2044/forecast',
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-type": "Application/json"
    },
    auth: {
      username: dbApi.SMART_login,
      password: dbApi.SMART_password
    },
    data: RequestForecastGlobal
  });


  return sendRequest
}