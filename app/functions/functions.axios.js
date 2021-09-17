const axios = require(`axios`);
const dbApi = require("../config/config.api");
const Utilities = require('../functions/functions.utilities');

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

    // .then(function (res) {

    //   console.log(JSON.stringify(res.data));

    // })

  }

  return format_data
}



exports.postManage = async (method, data = null) => {

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
}


exports.getManage = async (url_location) => {

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

exports.putManage = async (method, data = null) => {

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
}

exports.getAdManager = async (campaign_id) => {

  var test;

  console.log('campaign_id' + campaign_id)


  test = await axios({
    method: 'GET',
    url: 'http://localhost/api_google-manager/taskId/json/campaignID-'+campaign_id+'.json',
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-type": "Application/json"
    }
 
  })


  return test;
}