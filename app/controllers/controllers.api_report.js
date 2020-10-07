// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');

const asyncly = require('async');

var fs = require('fs');



// Initiliase le module axios
const axios = require(`axios`);
const {
  check,
  query
} = require('express-validator');

// Initialisation de la connexion à la bdd
const db = require("../models/index.js");
db.sequelize.sync();
sequelize = db.sequelize;
Sequelize = db.Sequelize;

// Attribue le model annonceur à une constante
const Advertiser = db.advertiser;
// Attribue le model campagne à une constante
const Campaign = db.campaign;


// Charge l'ensemble des functions de l'API Report
let SmartApiReport = require('../functions/functions.api_report');
let AxiosFunction = require('../functions/functions.axios');
const {
  response
} = require("express");

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});


exports.index = (req, res) => {
  console.log('api_report/index');
  // Définie l'ensemble des requêtes pour le reporting
  requestData = {
    "startDate": "2020-07-07T20:00:00",
    "endDate": "2020-07-31T19:59:00",
    "fields": [{
        "CampaignName": {}
      },
      {
        "CampaignId": {}
      },
      {
        "FormatName": {}
      },
      {
        "Impressions": {}
      }, {
        "Clicks": {}
      }, {
        "ClickRate": {}
      }
    ],

    "advancedfilter": [
      [{
        "campaignId": {
          "operator": "in",
          "values": [
            "1749501"
          ]
        }
      }]
    ]


  };


  try {
    // Charge la fonction reportCreate
    var task = SmartApiReport.reportCreate(requestData);

    /*
      var taskId = `278F01B4-1712-4E13-B3B3-52907D52BE6C`;
     // SmartApiReport.reportTaskIdFile(taskId);
      SmartApiReport.reportTaskSplit();
       */
    res.status(200).send({
      message: task
    });

  } catch (error) {
    res.status(500).send({
      message: error.message || "Some error occurred while retrieving tutorials."
    });
  }




  /*
  var taskId = `278F01B4-1712-4E13-B3B3-52907D52BE6C`;
  let url = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`;
  console.log(url);

  
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
    data = response.data;
    console.log(data);

    
  })
  .catch(function (error) {
    console.log(error);
  });

*/

  /* axios({
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
    data = response.data;
    console.log(data);

  })
  .catch(function (error) {
    console.log(error);
  });




  let url = `https://reporting.smartadserverapis.com/2044/reports`;

  axios({
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
    data: {
      "startDate": "2020-07-17T00:00:00",
      "endDate": "2020-08-07T23:59:59",
      "fields": [{ "Impressions": {} }, { "SiteName": {} }] 
    }
  }).then(function (response) {
    
    if(response.data) {
      console.log(response.data);
      console.log(response.data.taskId);
      let taskId = response.data.taskId;

      let url = 'https://reporting.smartadserverapis.com/2044/reports/${taskId}/file';
      
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
        data = response.data;
        console.log(data);

        data.forEach(obj => {

        });

      })
      .catch(function (error) {
        console.log(error);
      });



    }

   

  });
*/


}

exports.campaign = (req, res) => {

  Campaign.findOne({
      where: {
        'campaign_id': req.params.id,
      },
      include: [{
        model: Advertiser,
        as: 'advertisers'
      }]
    }).then(data => {
      // Attribue l'Id cmapaign à une variable
      var campaign_id = data.campaign_id;
      var start_date = data.campaign_start_date;
      var end_date = data.campaign_end_date;

      requestData = {
        "startDate": start_date,
        "endDate": end_date,
        "fields": [{
          "Impressions": {}
        }, {
          "SiteName": {}
        }]
      };


      try {
        // Charge la fonction reportCreate
        // SmartApiReport.reportCreate(requestData);
        //console.log(requestData);
      } catch (error) {
        res.status(500).send({
          message: error.message || "Some error occurred while retrieving tutorials."
        });
      }
      /*
            // Affiche le template 
            res.render('campaigns/findOne', {
              info: data
            });
      */




    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving tutorials."
      });
    });



}

exports.test_reporting = async (req, res) => {

  var date_start = "2020-09-17T00:00:00"
  var date_end = "2020-09-17T23:59:00"


  try {
    requestReporting = {

      "startDate": date_start,
      "endDate": date_end,
      "fields": [{
          "CampaignName": {}
        },
        {
          "CampaignId": {}
        },
        {
          "FormatName": {}
        },
        {
          "Impressions": {}
        }, {
          "Clicks": {}
        }, {
          "ClickRate": {}
        }
      ]

    }

    //console.log(requestReporting)
    // First step
    let firstLink = await AxiosFunction.getReportingData('POST', '', requestReporting)
    // console.log(firstLink)
    if (firstLink.data.taskId) {
      taskId = firstLink.data.taskId;

     // console.log('TaskID', taskId)


      //   let secondLink= await AxiosFunction.getReportingData('GET',url,'')

      //  console.log(secondLink)

      //excute le script interval de temps
      let timerFile = setInterval(async () => {

        let url = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`


        let secondLink = await AxiosFunction.getReportingData('GET', url, '');

        if (secondLink.data.lastTaskInstance.jobProgress == '1.0') {

          clearInterval(timerFile);
          let dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');

          //console.log(dataFile);

          //split 
          var CampaignName = []
          var CampaignId = []
          var FormatName = []
          var Impressions = []
          var Clicks = []
          var ClickRate = []

          var data_reporting = dataFile.data

          var data_split = data_reporting.split(/\r?\n/);

          //compte le nbr ligne 
          var number_line = data_split.length;

          //boucle sur les ligne
          for (i = 0; i < number_line; i++) {

            //delete les ; et delete les blanc
            line = data_split[i].split(';');

            //push la donnéé splité dans un tab vide
            CampaignName.push(line[0]);
            CampaignId.push(line[1]);
            FormatName.push(line[2])
            Impressions.push(line[3]);
            Clicks.push(line[4]);
            ClickRate.push(line[5]);



            //console.log(line);


          }
          var table = {
            CampaignName,
            CampaignId,
            FormatName,
            Impressions,
            Clicks,
            ClickRate,

          }
          console.log(table)

          res.render('reporting/data.ejs', {
            table: table

          });


        }


      }, 5000);





      // if (secondLink.data.lastTaskInstance.jobProgress == '1.0') {
      //   data_response = secondLink.data.taskId;

      //   console.log(data_response)

      // }
      // else{
      //   document.location.reload(true);
      // }

    }






  } catch (error) {
    console.log(error);
  }





}


exports.test = (req, res) => {
  //res.render('test.ejs')
  var date_start = "2020-09-08T00:00:00"
  var date_end = "2020-09-08T23:59:00"

  requestReporting = {

    "startDate": date_start,
    "endDate": date_end,
    "fields": [{
        "CampaignName": {}
      },
      {
        "CampaignId": {}
      },
      {
        "FormatName": {}
      },
      {
        "Impressions": {}
      }, {
        "Clicks": {}
      }, {
        "ClickRate": {}
      }
    ]


  }
  //console.log(requestReporting)

  asyncly.waterfall(

    [
      function (callback) {
        // Créer une requête
        const reportCreateValue = SmartApiReport.reportCreate(requestReporting);
        reportCreateValue.then(function (result) {
          //  console.log(result)
          caption = result + ' - ';
          callback(null, result);
        })
      },
      function (reportCreateValue, callback) {

        // Récupére le status
        const reportStatusValue = SmartApiReport.reportTaskId(reportCreateValue);

        reportStatusValue.then(function (result) {
          //console.log(result)
          callback(null, result);
        })
      },
      function (reportStatusValue, callback) {
        //Récupère taskId crée le file
        const reportTaskId = SmartApiReport.reportTaskIdFile(reportStatusValue)
        reportTaskId.then(function (result) {
          console.log(result)
          callback(null, result);
        })


      },
      function (reportTaskId, callback) {
        callback(null, reportTaskId);
      }
    ],
    function (err, caption) {
      console.log(caption);


    }
  )





  // let url = `https://reporting.smartadserverapis.com/2044/reports`;

  // axios({
  //   method: 'post',
  //   url,
  //   headers: {
  //     "Access-Control-Allow-Origin": "*",
  //     "Content-type": "Application/json"
  //   },
  //   auth: {
  //     username: dbApi.SMART_login,
  //     password: dbApi.SMART_password
  //   },
  //   data: requestReporting
  // }).then(function (response) {

  //   if (response.data && response.data.taskId) {
  //     try {
  //       let taskId = response.data.taskId;
  //       console.log('taskId :' + taskId);
  //       // Appel la function TaskId si taskId existe
  //       // reportTaskId(taskId);
  //       //  return taskId;
  //       // resolve(taskId);
  //       return JSON.stringify({
  //         taskId
  //       });
  //     } catch (error) {
  //       console.error('reportTaskId :' + error);
  //       return false;
  //     }

  //   }

  // })

}