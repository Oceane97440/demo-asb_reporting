// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');

//let csvToJson = require('convert-csv-to-json');
const bcrypt = require('bcrypt');
const validator = require('validator');

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
const PASSWORD_REGEX = /^(?=.*\d).{4,12}$/;


exports.home_page = async (req, res) => {

  if (req.session.user.role === 1) {

    res.send("Home page")

  }else {
    res.status(404).render("error-status.ejs", {
        statusCoded,

    });
}  
}

exports.signup = async (req, res) => {


  try {
    if (req.session.user.role === 1) {
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


    } else {
      var statusCoded = 404;

      res.status(404).render("error-status.ejs", {
        statusCoded,

      });

    }

  } catch (err) {
    res.status(500).render("error-status.ejs", {
      statusCoded,

    });
  }

}
exports.signup_add = async (req, res) => {

  const email = req.body.email;
  const password = req.body.mdp;
  const role = req.body.role;

  try {
    if (req.session.user.role === 1) {
      /**verifier si les champs ne son pas vide*/
      if (email === '' || password === '' || role === '') {

        req.session.message = {
          type: 'danger',
          intro: 'Erreur',
          message: 'Les champs ne doivents pas être vide'
        }
        return res.redirect('/signup')
        // return res.render('users/signup.ejs')
      }

      /**verifie si email est valide avec le regex*/
      if (!EMAIL_REGEX.test(email)) {
        req.session.message = {
          type: 'danger',
          intro: 'Erreur',
          message: 'Email invalide'
        }
        return res.redirect('/signup')
      }
      /**verifie si le password contien entre min 4 et max 8 caratère + un number*/
      if (!PASSWORD_REGEX.test(password)) {
        req.session.message = {
          type: 'danger',
          intro: 'Erreur',
          message: 'Le mot de passe doit être compris entre 4 et 12 caratères avec 1 chiffre et un caratère spécial'
        }
        return res.redirect('/signup')


      }

      /**search si email exsite déjà dans le bdd*/

      await ModelUser.findOne({
        attributes: ['email'],
        where: {
          email: email
        }
      }).then(async function (userFound) {


        if (!userFound) {


          //validator + bycrypt
          const hashedPwd = await bcrypt.hash(password, 12);

          const user = await ModelUser.create({

            email: validator.normalizeEmail(email),
            password: hashedPwd,
            role
          })


          await ModelUser_Role.create({
            role_id: role,
            user_id: user.id
          })



          res.redirect('/manager')

        } else {

          req.session.message = {
            type: 'danger',
            intro: 'Erreur',
            message: 'Email est déjà utilisé'
          }
          return res.redirect('/signup')
        }

      })



    } else {

      res.status(404).render("error-status.ejs", {
        statusCoded,

      });

    }




  } catch (error) {
    console.log(error)
    res.status(500).render("error-status.ejs", {
      statusCoded,

    });
  }


}

exports.signup_edit = async (req, res) => {

  ModelUser.findOne({
    where: {
      id: req.params.id
    }

  }).then(async function (user) {


    var roles = await ModelRole.findAll({
      where: {
        role_id: [2, 3]
      },
      attributes: ['role_id', 'label'],
      order: [
        ['role_id', 'ASC']
      ],
    })


    res.render('users/edit', {
      user: user,
      roles: roles
    })

  })
}

exports.update = async (req, res) => {

  const email = req.body.email
  const mdp =  req.body.mdp


  ModelUser.findOne({
    where: {
      id: req.params.id
    }
  }).then(user => {
    ModelUser.update({

      email:email ,
      password:mdp,

    }, {
      where: {
        id: req.params.id
      }
    }).then(res.redirect('/manager'))
  })
}

exports.signup_delete = async (req, res) => {

  ModelUser.destroy({
    where: {
      id: req.params.id
    }
  }).then(() => {
    res.redirect('/manager')
  })
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
      req.session.message = {
        type: 'danger',
        intro: 'Erreur',
        message: 'Email ou mot passe est incorrect'
      }
      return res.redirect('/login')
    }

    /**verifie si le email est présent dans la base*/
    ModelUser.findOne({
      where: {
        email: email
      }
    }).then(async function (user) {



      //si email trouvé
      if (user) {

        /**on verifie si l'utilisateur à utiliser le bon mot de passe avec bycrypt*/

        const isEqual = await bcrypt.compare(password, user.password);

        //Si le mot de passe correpond au caratère hashé
        if (isEqual) {

          if (user.email !== email && user.password !== password) {

            res.redirect('/login')
          } else {
            // use session for user connected
            req.session.user = user


            if (req.session.user.role === 1) {
              return res.redirect('/manager');


            }
            if (req.session.user.role === 2 || req.session.user.role === 3) {
              return res.redirect('/utilisateur')

            }
          }

        } else {
          req.session.message = {
            type: 'danger',
            intro: 'Erreur',
            message: 'Adresse email ou mot de passe invalide"'
          }
          return res.redirect('/login')
        }

      } else {
        req.session.message = {
          type: 'danger',
          intro: 'Erreur',
          message: 'Adresse email ou mot de passe invalide"'
        }
        return res.redirect('/login')

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


/*
exports.index = async (req, res) => {



  try {


    if (req.session.user.role === 1) {
      res.render('home-page.ejs');
    }else {

      res.status(404).render("error-status.ejs", {
        statusCoded,

      });

    }





  } catch (error) {
    console.log(error)
    var statusCoded = error.response.status;

    res.status(500).render("error-status.ejs", {
      statusCoded,

    });
  }





}*/