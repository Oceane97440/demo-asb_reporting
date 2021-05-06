// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');

//let csvToJson = require('convert-csv-to-json');


const axios = require(`axios`);

//const asyncly = require('async');

const fileGetContents = require('file-get-contents');

// Initiliase le module axios
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
//const AxiosFunction = require('../functions/functions.axios');

// Initialise les models
//const ModelSite = require("../models/models.site");
//const ModelFormat = require("../models/models.format");
//const ModelCountry = require("../models/models.country")
//const ModelCampaign_epilot = require("../models/models.campaing_epilot")
//const ModelPack = require("../models/models.pack")
//const ModelPack_Site = require("../models/models.pack_site")
const ModelRole = require("../models/models.roles")
const ModelUser = require("../models/models.users")
const ModelUser_Role = require("../models/models.users_roles")



exports.login_add = async (req, res) => {




  const email = req.body.email;
  const password = req.body.mdp;

  console.log(email)

  
    try {

      if (!email || !password) {


        console.log("Incorrect")

      }

      let user = await ModelUser.findOne({

        where: {

          email: email,
          password: password
        }

      })
      // console.log(user)
      if (user.email !== email && user.password !== password) {


        console.log("Incorrect")


      } else {
        req.session.user = user

      // var message = ['success',true];

        res.status(200).json({
          success: true,
         
      });
      
      /*  console.log("Correcte") 
        console.log(res.json(message))
        return res.json(message);*/

      }
    } catch (error) {
      console.log(error)

      console.log("Erreur")
    }
  
}

exports.logout = async (req, res) => {
  req.session = null
  res.redirect('/login')
}