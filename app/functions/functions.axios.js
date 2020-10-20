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
            console.log(line)
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
console.log(tableData)
  return tableData;
}


exports.getManageData = async (method, urlManage, data = null) => {
  console.log(data)
  var return_data;
    if (method == 'POST') {

     return_data = await axios({
        method: method,
        url: 'https://manage.smartadserverapis.com/2044/advertisers',
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Content-type": "Application/json"
        },
        auth: {
          username: dbApi.SMART_login,
          password: dbApi.SMART_password
        },
        data: data
      })  
    }
    // else if(method == 'GET'){

    //     return_data =  await axios({
    //         method: method,
    //         url:urlManage,
    //         headers: {
    //           "Access-Control-Allow-Origin": "*",
    //           "Content-type": "Application/json"
    //         },
    //         auth: {
    //           username: dbApi.SMART_login,
    //           password: dbApi.SMART_password
    //         }
    //       })


    // }
    return return_data
}
