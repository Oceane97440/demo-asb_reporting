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
const ModelRole = require("../models/models.role")
const ModelUser = require("../models/models.user")
const ModelUser_Role = require("../models/models.user_role")

exports.signup = async (req, res) => {


  try {
      var roles = await ModelRole.findAll({
          where: {
              role_id: [2, 3]
          },
          attributes: ['role_id', 'label'],
          order: [
              ['role_id', 'ASC']
          ],
      })




      res.render('users/signup.ejs', {
          roles: roles
      });


  } catch (err) {
      res.status(500).json({
          'error': 'cannot fetch country'
      });
  }

}
exports.signup_add = async (req, res) => {

  const email = req.body.email;
  const password = req.body.mdp;
  const role = req.body.role;
  try {




      const user = await ModelUser.create({
          email,
          password,
          role,

      })
      //console.log(user.id)


      const user_role = ModelUser_Role.create({
          role_id: role,
          user_id: user.id
      })
      //  console.log(user_role)

      res.redirect('/')



  } catch (error) { 
    console.log(error)
    var statusCoded = error.response.status;

    res.render("error_log.ejs",{
      statusCoded:statusCoded,
     
    })
  }


}

exports.login = async (req, res) => {


  res.render('users/login.ejs');


}

exports.login_add = async (req, res) => {

  const email = req.body.email;
  const password = req.body.mdp;

  if (!email || !password) {

      return res.redirect('/')

  } else {
      try {

          let user = await ModelUser.findOne({

              where: {

                  email: email,
                  password: password
              }

          })
          // console.log(user)
          if (user.email !== email && user.password !== password) {

              res.redirect('/')
          } else {
              req.session.user = user
               // use session for user connected
               //console.log(req.session.user.role)
               
              if (req.session.user.role === 1){
                return res.redirect('/home_page')

              }
              if (req.session.user.role === 4){
                return res.redirect('/reporting/dasbord_report')

              }
              return res.redirect('/utilisateur')
          }
      } catch (error) { 
        console.log(error)

          res.redirect('/')
      }
  }
}

exports.logout = async (req, res) => {
  req.session = null
  res.redirect('/')
}



exports.index = async (req, res) => {



  try {


 

    res.render('home-page.ejs');



  } catch (error) { 
    console.log(error)
    var statusCoded = error.response.status;

    res.render("error_log.ejs",{
      statusCoded:statusCoded,
     
    })
  }





}