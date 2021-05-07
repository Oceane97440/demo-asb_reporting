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


const ModelRole = require("../models/models.roles")
const ModelUser = require("../models/models.users")
const ModelUser_Role = require("../models/models.users_roles")
const EMAIL_REGEX = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX = /^(?=.*\d).{4,8}$/;


exports.home_page = async (req, res) => {

  if (req.session.user.role === 1) {

    res.send("Home page")

  }
}

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
    /**verifier si les champs ne son pas vide*/
    if (email === '' || password === '' || role === '') {
      return res.render('users/signup.ejs')
    }

    /**verifie si email est valide avec le regex*/
    if (!EMAIL_REGEX.test(email)) {
      return res.send('mail pas valide')
    }
    /**verifie si le password contien entre min 4 et max 8 caratère + un number*/
    if (!PASSWORD_REGEX.test(password)) {

      return res.send('il faut au un mot de passe compris entre 4 et 8 caratère avec 1 chiffre')

    }

    /**search si email exsite déjà dans le bdd*/

    await ModelUser.findOne({
      attributes: ['email'],
      where: {
        email: email
      }
    }).then(userFound => {

      if (!userFound) {


        //validator + bycrypt


        const user = ModelUser.create({
          email,
          password,
          role,

        })


        const user_role = ModelUser_Role.create({
          role_id: role,
          user_id: user.id
        })



        res.redirect('/login')

      } else {

        res.send("email est déjà utilisé")
      }

    })


    //process.exit(1)
    /*if (userFound) {
      console.log('userFound' ,userFound)
     
      const user = await ModelUser.create({
        email,
        password,
        role,
  
      })
  
  
      const user_role = ModelUser_Role.create({
        role_id: role,
        user_id: user.id
      })
     
         
      
     res.redirect('/login')

    } */






  } catch (error) {
    console.log(error)
    var statusCoded = error.response.status;

    res.render("error.ejs", {
      statusCoded: statusCoded,

    })
  }


}

exports.login = async (req, res) => {


  res.render('users/login.ejs');


}

exports.login_add = async (req, res) => {

  const email = req.body.email;
  const password = req.body.mdp;




  try {

    /**verifie si les donnée son correcte et non null */
    if (email == '' || password == '') {
      return res.status(400).json({
        'error': 'parametre manquante'
      })
    }

    /**verifie si le email est présent dans la base*/
    ModelUser.findOne({
      where: {
        email: email
      }
    }).then(user => {



      //si email trouvé
      if (user) {

        /**on verifie si l'utilisateur à utiliser le bon mot de passe avec bycrypt*/



        if (user.email !== email && user.password !== password) {

          res.redirect('/login')
        } else {
          req.session.user = user
          // use session for user connected
          //console.log(req.session.user.role)

          if (req.session.user.role === 1) {
            return res.redirect('/home_page')

          }
          if (req.session.user.role === 2 || req.session.user.role === 3) {
            return res.redirect('/utilisateur')

          }
        }
      } else {
        res.send("utilisateur non trouvé")
      }



    })



  } catch (error) {
    console.log(error)

    res.redirect('/login')
  }

}

exports.logout = async (req, res) => {
  req.session = null
  res.redirect('/login')
}



exports.index = async (req, res) => {



  try {


    if (req.session.user.role === 1) {
      res.render('home-page.ejs');
    }





  } catch (error) {
    console.log(error)
    var statusCoded = error.response.status;

    res.render("error.ejs", {
      statusCoded: statusCoded,

    })
  }





}