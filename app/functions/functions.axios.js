const axios = require(`axios`);
const dbApi = require("../config/config.api");

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

    } else if(method == 'POST') {
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
         
          console.log('response.data',error.response.data);
          console.log('response.status',error.response.status);
          console.log('response.headers',error.response.headers);
          return return_data = null
        } else if (error.request) {
          // The request was made but no response was received
          // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
          // http.ClientRequest in node.js
          console.log('request',error.request);
        } else {
          // Something happened in setting up the request that triggered an Error
          console.log('Error', error.message);
        }
        console.log(error.config);
      });
    }
    else if(method == 'GET'){

        return_data =  await axios({
            method: method,
            url:urlReporting,
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
      if(dataArrayFromReq[i]) {
          var data = dataArrayFromReq[i];
        
          //delete les ; et delete les blanc
          line = data.split(';');
          let dataTotalImpression     = line[6].split('\r\n')[1];
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
  
  sommeImpressions = new Number(sommeImpressions).toLocaleString("fi-FI");
  sommeOccupied = new Number(sommeOccupied).toLocaleString("fi-FI");
  //volumeDispo = new Number(volumeDispo).toLocaleString("fi-FI");
  
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

exports.getManage_AdvertiserData = async (method, urlManage,data=null) => {

    if (method == 'GET') {

      var advertiser_data = await axios({
        method: method,
        url: urlManage,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json"
        },
        auth: {
          username: dbApi.SMART_login,
          password: dbApi.SMART_password
        },
        data:data
      
      }).then(function (response) {
        console.log(JSON.stringify(response.data));
      })
    }
    console.log(advertiser_data)

    return advertiser_data
}


