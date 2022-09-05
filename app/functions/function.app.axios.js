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

/**
 * Fonction pour l'affichage des données pour le front
 * @param {Array} dataArrayFromReq 
 * @returns les valeurs pour faire la table
 */

exports.dataFormatingForForecast = async (dataArrayFromReq, StartDate, EndDate, format) => {

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
        success: true,
        StartDate,
        EndDate,
        format,
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


