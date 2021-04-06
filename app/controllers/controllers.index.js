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

// Initiliase le module axios const axios = require(`axios`);

const {Op} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

const {QueryTypes} = require('sequelize');

const {check, query} = require('express-validator');
/* // Charge l'ensemble des functions de l'API
const AxiosFunction =
 * require('../functions/functions.axios');
// Initialise les models
const
 * ModelSites = require("../models/models.sites");
const ModelFormats =
 * require("../models/models.formats");
const ModelCountries =
 * require("../models/models.countries");
const ModelCampaignsEpilot =
 * require("../models/models.campaings_epilot");
const ModelPacks =
 * require("../models/models.packs");
const ModelPacksSites =
 * require("../models/models.packs_sitesd")
 */
const ModelRoles = require("../models/models.roles")
const ModelUsers = require("../models/models.users")
const ModelUsersRoles = require("../models/models.users_roles")

exports.signup = async (req, res) => {

    try {
        var roles = await ModelRoles.findAll({
            where: {
                role_id: [2, 3]
            },
            attributes: [
                'role_id', 'label'
            ],
            order: [
                ['role_id', 'ASC']
            ]
        });

        res.render('users/signup.ejs', {roles: roles});

    } catch (err) {
        res
            .status(500)
            .json({'error': 'cannot fetch country'});
    }

}
exports.signup_add = async (req, res) => {

    const email = req.body.email;
    const password = req.body.mdp;
    const role = req.body.role;
    try {

        const user = await ModelUsers.create({email, password, role});
        //console.log(user.id)

        const user_role = ModelUsersRoles.create({role_id: role, user_id: user.id});
        //  console.log(user_role)

        res.redirect('/');

    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("error_log.ejs", {statusCoded: statusCoded});
    }

}

exports.login = async (req, res) => {
    res.render('users/login.ejs');

}

exports.login_add = async (req, res) => {

    const email = req.body.email;
    const password = req.body.mdp;

    if (!email || !password) {
        return res.redirect('/');
    } else {
        try {
            let user = await ModelUsers.findOne({
                where: {
                    email: email,
                    password: password
                }

            });
            // console.log(user)
            if (user.email !== email && user.password !== password) {
                res.redirect('/');
            } else {
                req.session.user = user
                // use session for user connected console.log(req.session.user.role)
                if (req.session.user.role === 1) {
                    return res.redirect('/home_page');
                }
                if (req.session.user.role === 2 || req.session.user.role === 3) {
                    return res.redirect('/users');
                }
            }
        } catch (error) {
            console.log(error);
            res.redirect('/');
        }
    }
}

exports.logout = async (req, res) => {
    req.session = null;
    res.redirect('/');
}

exports.index = async (req, res) => {
    try {
        res.render('home-page.ejs');
    } catch (error) {
        console.log(error)
        var statusCoded = error.response.status;
        res.render("error_log.ejs", {statusCoded: statusCoded})
    }

}