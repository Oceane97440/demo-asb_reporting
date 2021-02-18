// Initialise le module
const http = require('http');
const https = require('https');
const fs = require('fs')

//const NodeCache = require("node-cache");
//const LocalStorage = require('node-localstorage').LocalStorage,
//localStorage = new LocalStorage('./scratch');
//const axios = require(`axios`);




const {
  Op
} = require("sequelize");

process.on('unhandledRejection', error => {
  // Will print "unhandledRejection err is not defined"
  console.log('unhandledRejection', error.message);
});



const {
  QueryTypes
} = require('sequelize');

const {
  check,
  query
} = require('express-validator');



// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');


// Initialise les models
const ModelAdvertiser = require("../models/models.advertiser")
const ModelCampaigns = require("../models/models.campaigns")



exports.index = async (req, res) => {

  if (req.session.user.role == 1) {



    res.render("reporting/dasbord_report.ejs")

  }
}


/*
exports.json_report = async (req, res) => {

  //requête qui recupère tout la liste des rapport
  var tasksId = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/`, '')
  var data = tasksId.data
  var liste_obj = new Array()

  var number_line = data.length
  //convertie obj en json
  JSON.stringify(data);

  for (i = 0; i < number_line; i++) {

    var obj = {};

    obj.id = i

    obj.taskId = [data[i].taskId]
    obj.status = [data[i].status]

    var date_format = new Date([data[i].creationDateUTC]).toLocaleString();
    obj.creationDateUTC = date_format

    liste_obj.push(obj)

  }

  res.json(liste_obj)

}
exports.liste_report = async (req, res) => {

  if ((req.session.user.role == 4) || (req.session.user.role == 1)) {



    res.render("reporting/list_report.ejs")

  }

}
exports.view_report = async (req, res) => {

  let taskId = req.params.taskId;

  let dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');

  res.send(dataFile.data)

}*/
exports.generate = async (req, res) => {

  //recupère en parametre get id annonceur / id campagne / date de debut
  //api/reporting/generate/416446/1853590/2021-02-15T00:00:00

  let advertiserid = req.params.advertiserid;
  let campaignid = req.params.campaignid;
  let startDate = req.params.startdate



  var campaign = await ModelCampaigns.findOne({
    attributes: ['campaign_id', 'campaign_name', 'advertiser_id', 'start_date', 'end_date'],

    where: {
      campaign_id :req.params.campaignid,
      advertiser_id: req.params.advertiserid

    },
    include: [{
      model: ModelAdvertiser
    }],

  })

  res.render("reporting/generate.ejs",{
    advertiserid:advertiserid,
    campaignid:campaignid,
    startDate:startDate,
    campaign:campaign
  })




}
exports.report = async (req, res) => {
  // display http://127.0.0.1:3000/api/reporting/4455418/1839404 
  //      "startDate": "2021-01-18T00:00:00",

  //video http://127.0.0.1:3000/api/reporting/443863/1850009
  //      "startDate": "2021-02-02T00:00:00",

  let advertiserid = req.params.advertiserid;
  let campaignid = req.params.campaignid;
  let startDate = req.params.startdate


  try {

    //initialisation des requêtes

    var requestReporting = {

      "startDate": startDate,

      "endDate": "CURRENT_DAY",

      "fields": [{
          "CampaignStartDate": {}
        },
        {
          "CampaignEndDate": {}
        },
        {
          "CampaignName": {}
        },

        {
          "InsertionName": {}
        },

        {
          "FormatName": {}
        },

        {
          "SiteName": {}
        },

        {
          "Impressions": {}
        },

        {
          "ClickRate": {}
        },
        {
          "Clicks": {}
        },

        {
          "VideoCount": {
            "Id": "17",
            "OutputName": "Nbr_Complete"
          }
        }

      ],

      "filter": [

        {

          "AdvertiserId": [

            advertiserid

          ],

          "CampaignId": [

            campaignid

          ]

        }

      ]

    }


    //Requête visitor unique
    var requestVisitor_unique = {

      "startDate": startDate,

      "endDate": "CURRENT_DAY",

      "fields": [

        {
          "UniqueVisitors": {}
        }

      ],

      "filter": [{
          "AdvertiserId": [advertiserid],

          "CampaignId": [campaignid]

        }

      ]

    }




    let firstLink = await AxiosFunction.getReportingData('POST', '', requestReporting)
    let threeLink = await AxiosFunction.getReportingData('POST', '', requestVisitor_unique)



    if (firstLink.data.taskId || threeLink.data.taskId) {
      var taskId = firstLink.data.taskId;
      var taskId2 = threeLink.data.taskId;




   
      
          let requête1 = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`
          let requête2 = `https://reporting.smartadserverapis.com/2044/reports/${taskId2}`



          let timerFile = setInterval(async () => {
            let fourLink = await AxiosFunction.getReportingData('GET', requête2, '');
    
            let secondLink = await AxiosFunction.getReportingData('GET', requête1, '');
    
            if ((fourLink.data.lastTaskInstance.jobProgress == '1.0') && (secondLink.data.lastTaskInstance.jobProgress == '1.0')) {
    
              clearInterval(timerFile);
    
              var dataFile = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`, '');
              var dataFile2 = await AxiosFunction.getReportingData('GET', `https://reporting.smartadserverapis.com/2044/reports/${taskId2}/file`, '');
    
              console.log(dataFile.data)

    
            }
    
          }, 60000)











        

     





     







    



    
















    }




  } catch (error) { console.log(error)
    var statusCoded = error.response.status;

    res.render("error_log.ejs",{
      statusCoded:statusCoded,
     
    })
  }




   /*
      fs.readFile("tasksID.json", async(err, file) => {
        if (err) throw err;
        let data = JSON.parse(file);
        console.log(data);

        console.log('TaskId : ' + taskId)
        console.log('TaskId2 : ' + taskId2)
        console.log('-------------------')

        var data_taskId = data[0].taskid1
        console.log('TaskId save : ' + data_taskId)

        var data_taskId2 = data[1].taskid2
        console.log('TaskId2 save : ' + data_taskId2)

           var date_creation = new Date().toLocaleString();


          let data = [{
              "taskid1": taskId,
              "date_create": date_creation,

            },
            {
              "taskid2": taskId2,
              "date_create": date_creation
            }
          ]

          let donnees = JSON.stringify(data)
          console.log(donnees)
          console.log(data)

            
          obj = JSON.parse(data); //now it an object
          obj.table.push({id: 2, square:3}); //add some data
          json = JSON.stringify(obj); //convert it back to json
          fs.writeFile('myjsonfile.json', json, 'utf8', callback); // write it back */

        /*  fs.writeFile('tasksID.json', donnees, function (erreur) {
            if (erreur) {
              console.log(erreur)
            }
          }) 
        
        });*/



}