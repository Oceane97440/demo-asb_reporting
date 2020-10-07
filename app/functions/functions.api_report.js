// Charge les identifiants de l'api SMART
const dbApi = require("../config/config.api");

// Charge le module axios 
const axios = require(`axios`);
// const { json } = require("sequelize/types");

/*
 * @function reportCreate
 * @description : Créer un rapport via l'api report
 * @request : 
 *         - request : charge l'ensemble des requêtes
 *
 * @return 
 */
async function reportCreate(request) {
  console.log(request)
  /*
   Exemple : 
   request = {
    "startDate": "2020-07-17T00:00:00",
    "endDate": "2020-08-07T23:59:59",
    "fields": [{
      "Impressions": {}
    }, {
      "SiteName": {}
    }]
  }
  
  Exemple 2 : 

  {
      "startDate": "2020-07-07T20:00:00",
      "endDate": "2020-07-31T19:59:00",
   "advancedfilter":[
       [
         {
            "campaignId":{
               "operator":"in",
               "values":[
                  "1749501"
               ]
            }
         }
      ]
   ],   
  "fields": [        
          {
          "CampaignName": {}
        },
        {
          "CampaignId": {}
        }, {
          "FormatName": {}
        },
        {
        "Impressions": {}
      }, {
        "Clicks": {}
      }, {
        "ClickRate": {}
      }]
    }
  
  
  */

  let url = `https://reporting.smartadserverapis.com/2044/reports`;

  let res = await axios({
    method: 'post',
    url,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Content-type": "Application/json"
    },
    auth: {
      username: dbApi.SMART_login,
      password: dbApi.SMART_password
    },
    data: request
  }).then(function (response) {

    if (response.data && response.data.taskId) {
      try {
        let taskId = response.data.taskId;
        //  console.log('taskId :' + taskId);
        return taskId;
      } catch (error) {
        console.error('reportTaskId :' + error);
      }
    }
  }).catch(function (error) {
    console.log('Error:' + error);
  });

  return res;




}


/*
 * @function reportTaskId
 * @description : Récupére les infos de la tâche créée
 * @request : 
 *         - taskId : L'identifiant de la TaskId
 *
 * @return 
 */
// async function reportTaskId(taskId) {
//   if (taskId) {
//     let url = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`;

//     axios({
//       method: 'get',
//       url,
//       headers: {
//         "Access-Control-Allow-Origin": "*",
//         "Content-type": "Application/json"
//       },
//       auth: {
//         username: dbApi.SMART_login,
//         password: dbApi.SMART_password
//       }
//     }).then(function (response) {
//       console.log(response)
//       // Récupére la réponse de l'api
//       if (response.data) {
//         console.log(response.data)
//         if (response.data.lastTaskInstance.instanceStatus != 'SUCCESS') {

//           const timeoutObj = setTimeout(() => {
//             console.log(response.data.taskId);         
//             reportTaskId(taskId);
//           }, 2000);
//           clearTimeout(timeoutObj);

//         } else {
//            // reportTaskIdFile
//           console.log('reportTaskIdFile');
//         }

//       }


//     });

//   }

// }
async function reportTaskId(taskId) {
  if (taskId) {
    // console.log("taskid function:"+taskId)
    let url = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`;

    let res = await axios({
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
    }).then(function (response) {
      //console.log(response)
      // Récupére la réponse de l'api
      if (response.data.lastTaskInstance.jobProgress != '1.0') {


        setTimeout(() => {
          console.log("Refrech de 60sec");
          reportTaskId(taskId);
        }, 60000);


      } else {
        //console.log('taskId :' + taskId);
        return taskId;

      }
    });

    return res;
  }

}

/*
 * @function reportTaskIdFile
 * @description : Télécharge le fichier du taskId
 * @request : 
 *         - taskId : L'identifiant de la TaskId
 *
 * @return 
 */
async function reportTaskIdFile(taskId) {
  if (taskId) {

    let url = `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`;
    console.log('reportTaskIdFile' + taskId);
    console.log(url)
    let res = await axios({
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
    }).then(function (response) {
      console.log(response);

    });

    return res;

  }


}



/*
 * @function reportTaskSplit
 * @description : Traitement des données *
 * @return 
 */
async function reportTaskSplit() {

  data = `Impressions;SiteName
  332093;SM_M6  
  176449;SM_TF1  
  618483;SM_LINFO-IOS  
  1716743;SM_LINFO-ANDROID  
  172089;SM_ORANGE_REUNION  
  2941;SM_ACTU_REUNION-IOS  
  6357;SM_ACTU_REUNION-ANDROID  
  863539;SM_ANTENNEREUNION  
  30;SM_GENERATION_RUNSTAR  
  1360553;SM_LINFO.re  
  22552;SM_DOMTOMJOB  
  3796552;SM_RODZAFER_IOS  
  368931;SM_RODZAFER_ANDROID  
  985587;SM_DAILYMOTION`;

  var impressions = [];
  var siteName = [];

  try {
    var dataVirgule = data.split(/\r?\n/);
    // var dataN = dataVirgule.split('\\n');

    var countdataVirgule = dataVirgule.length;
    for (i = 0; i < countdataVirgule; i++) {
      line = dataVirgule[i].trim().split(';');

      impressions.push(line[0]);
      siteName.push(line[1]);

      console.log(line);
      //   var item = line.split(';');
      // console.log(item);
    }

    console.log(impressions);
    // console.log('Total:'+impressions.sum());
    console.log('---------------------------------------------------');
    console.log(siteName);


  } catch (error) {
    console.error('reportTaskSplit :' + error);
  }



}


// exports the variables and functions ci-dessous afin que d'autres modules puissent les utiliser
module.exports.reportCreate = reportCreate;
module.exports.reportTaskId = reportTaskId;
module.exports.reportTaskIdFile = reportTaskIdFile;
module.exports.reportTaskSplit = reportTaskSplit;