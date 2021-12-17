
// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');
const Utilities = require('../functions/functions.utilities');

//let csvToJson = require('convert-csv-to-json');
const bcrypt = require('bcrypt');
const validator = require('validator');

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

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/function.app.axios');

// Initialise les models
const ModelFormat = require("../models/models.formats");
const ModelCountry = require("../models/models.countries")
const ModelPack = require("../models/models.packs")
const ModelPackSite = require("../models/models.packs_sites")
const ModelRole = require("../models/models.roles")
const ModelUser = require("../models/models.users")
const ModelUser_Role = require("../models/models.roles_users")
const ModelCampaigns = require("../models/models.campaigns")
const ModelCreativesTypesFormats =  require("../models/models.creatives_types_formats")
const ModelFormatsGroups=   require("../models/models.formats_groups")
const ModelCreativesTypes =  require("../models/models.creatives_types")

exports.login_add = async (req, res) => {
    const user_email = req.body.user_email;
    const user_password = req.body.user_password;

    console.log('user_email : ',user_email,'user_password : ',user_password);

    try {
        if (user_email == '' || user_password == '') {
            message = {
                type: 'danger',
                intro: 'Erreur',
                message: 'Saisissez votre email ou mot passe est incorrect'
            }

            return res.json({success: false, message: message})
        }

        ModelUser
            .findOne({
                where: {
                    user_email: user_email
                }
            })
            .then(async function (user) {

                //si email trouvé
                if (user) {

                    //on verifie si l'utilisateur à utiliser le bon mot de passe avec bycrypt

                    const isEqual = await bcrypt.compare(user_password, user.user_password);

                    //Si le mot de passe correpond au caratère hashé
                    if (isEqual) {

                        if (user.user_email !== user_email && user.user_password !== user_password) {
                            return res.json({success: false});
                        } else {
                            // use session for user connected
                            req.session.user = user;
                            return res.json({success: true})
                        }

                    } else {
                        message = {
                            type: 'danger',
                            intro: 'Erreur',
                            message: 'Email ou mot passe est incorrect'
                        }
                        return res.json({success: false, message: message})
                    }

                } else {
                    message = {
                        type: 'danger',
                        intro: 'Erreur',
                        message: 'Email ou mot passe est incorrect'
                    }
                    return res.json({success: false, message: message})

                }

            })

    } catch (error) {
        console.log(error);
        return res.json({'success': false});
    }

}

exports.logout = async (req, res) => {
    req.session = null;
    return res.json({success: true});
}

exports.forcast = async (req, res) => {
    // Définition des variables

    var headerlocation,
        table,
        requestForecast;
    var date_start = await req.body.date_start;
    var date_end = await req.body.date_end;
    var format = await req.body.format;
    var packs = await req.body.packs;
    var countries = await req.body.countries;

    const formatIdsArray = [];
    const sites = [];
    const dataArrayFromReq = [];

    try {

        date_start = date_start + 'T00:00:00.000Z'
        date_end = date_end + 'T23:59:00.000Z'

        //si l'un des champs sont vide
        if (date_start == '' || date_start == '' || format == null || packs == null || countries == '') {
            message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Les champs doivent être complétés'
            }
            return res.json({success: false, message: message});
        }

        //date aujourd'hui en timestamp
        const date_now = Date.now();

        const timstasp_start = Date.parse(date_start);
        const timstasp_end = Date.parse(date_end);

        // si date aujourd'hui est >= à la date selectionné envoie une erreur ou la date
        // de fin < à la date de début

        if (date_now >= timstasp_end || timstasp_start >= timstasp_end) {
            message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'La date de fin doit être supérieur à la date du jour'
            }
            return res.json({success: false, message: message});
        }

        // si date aujourd'hui est >= à la date selectionné envoie une erreur ou date
        // debut > à la date de fin
        if (timstasp_start <= date_now || timstasp_start >= timstasp_end) {
            message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'La date de début doit être supérieur à la date du jour'
            }
            return res.json({success: false, message: message});
        }
        const campaign_StartDate = await date_start;
        var startDate_split = await campaign_StartDate.split('T');
        const start_Date = await startDate_split[0];

        var campaign_EndDate = await date_end;
        var endDate_split = await campaign_EndDate.split('T');
        const end_Date = await endDate_split[0];

        const dateStart = new Date(start_Date);
        JJ = ('0' + (
            dateStart.getDate()
        )).slice(-2);
        MM = ('0' + (
            dateStart.getMonth() + 1
        )).slice(-2);
        AAAA = dateStart.getFullYear();
        const StartDate = await JJ + '/' + MM + '/' + AAAA;

        const dateEnd = new Date(end_Date);
        JJ = ('0' + (
            dateEnd.getDate()
        )).slice(-2);
        MM = ('0' + (
            dateStart.getMonth() + 1
        )).slice(-2);
        AAAA = dateEnd.getFullYear();
        const EndDate = await JJ + '/' + MM + '/' + AAAA;

        //recupération des site d'un pack
        const sitesdb = await ModelPackSite.findAll({
            attributes: [
                'pack_id', 'site_id'
            ],
            where: {
                pack_id: {
                    [Op.eq]: packs
                }
            }
        });

        for (let l = 0; l < sitesdb.length; l++) {
            sites.push(sitesdb[l].site_id);
        }

        // Si c'est un string on met en tableau pour respecter l'api
        if (typeof sites == 'string') {
            sites = [sites];
        }

        // si format site countrie ne sont pas vide selectionne le groupe format
        if (format.length != 0 && sites.length != 0 && countries.length != 0) {

            // select groupe format + format id
            const formatIds = await ModelFormat.findAll({
                attributes: ['format_id'],
                where: {
                    format_group: {
                        [Op.eq]: format
                    }
                }
            });

            // Create formatIdsArray's variable to handler more later
            for (let l = 0; l < formatIds.length; l++) {
                formatIdsArray.push(formatIds[l].format_id);
            }
        }

        // Si on a le format intertistiel : On va faire du cumul site par site avec
        // l'ajout d'un capping
        if (format === "INTERSTITIEL") {

            for (let xyz = 0; xyz < sites.length; xyz++) {
                requestForecast = {
                    "startDate": date_start,
                    "endDate": date_end,
                    "timeZoneId": "Arabian Standard Time",
                    "filter": [
                        {
                            "CountryID": [countries]
                        }, {
                            "SiteID": [sites[xyz]]
                        }, {
                            "FormatID": formatIdsArray // new Array(79633,44152) formats
                        }
                    ],
                    "fields": [
                        "TotalImpressions",
                        "OccupiedImpressions",
                        "SiteID",
                        "SiteName",
                        "FormatID",
                        "FormatName",
                        "AvailableImpressions"
                    ]
                };

                requestForecast.filter[3] = {
                    "acceptCookie": ["True"]
                }

                requestForecast.capping = {
                    "global": 0,
                    "visit": 0,
                    "periodic": 1,
                    "periodInMinutes": 120
                }

                if (format == "INTERSTITIEL") {
                    requestForecast.filter[2] = {
                        "FormatID": ["44152", "79633"]
                    }
                }

                //si RG-DESKTOP est seletionner add ciblage desktop
                if (packs == "2") {
                    requestForecast.filter[4] = {
                        "platformID": ["1"]
                    }
                }

                //si RG mob/tab est selectionner ciblage mob/tab
                if (packs == "4") {
                    requestForecast.filter[3] = {
                        "platformID": ["3", "2"]
                    }
                }

                // On fait les 3 steps pour récupérer l'informations du csv puis on push dans un
                // tableau
                let firstReq = await AxiosFunction.getForecastData('POST', '', requestForecast);

                if (firstReq.headers.location) {
                    headerlocation = firstReq.headers.location;
                    let secondReq = await AxiosFunction.getForecastData('GET', headerlocation);

                    if (secondReq.data.progress == '100') {
                        headerlocation = secondReq.headers.location;
                        let csvLinkReq = await AxiosFunction.getForecastData('GET', headerlocation);
                        dataArrayFromReq.push(csvLinkReq.data);
                        table = await AxiosFunction.dataFormatingForForecast(
                            dataArrayFromReq,
                            StartDate,
                            EndDate,
                            format
                        );
                    }
                }
            }

            return res.json({table: table});

        }

        // initialise la requête pour les cas hors intertistiel + habillage
        requestForecast = {
            "startDate": date_start,
            "endDate": date_end,
            "timeZoneId": "Arabian Standard Time",
            "filter": [
                {
                    "CountryID": [countries]
                }, {
                    "SiteID": sites
                }, {
                    "FormatID": formatIdsArray // new Array(79633,44152) formats
                }
            ],
            "fields": [

                "TotalImpressions",
                "OccupiedImpressions",
                "SiteID",
                "SiteName",
                "FormatID",
                "FormatName"
            ]
        };

        //si RG-DESKTOP est seletionner add ciblage desktop
        if (packs == "2") {
            requestForecast.filter[3] = {
                "platformID": ["1"]
            }
        }

        //si RG mob/tab est selectionner ciblage mob/tab
        if (packs == "4") {

            requestForecast.filter[3] = {
                "platformID": ["3", "2"]
            }
        }

        //AUTO ELARGISEMENT DES FORMATS
        if (format == "GRAND ANGLE") {
            requestForecast.filter[2] = {
                "FormatID": [

                    //App_mban / Web_mban et Web_mpave / App_mpave
                    "79638",
                    "79642",
                    "79643",
                    "79644",
                    "79645",
                    "79646",
                    "84657",
                    "84658",
                    "84656",
                    "84659",
                    "84660",
                    "84661",
                    "84652",
                    "84653",
                    "84654",
                    "84655"

                ]
            }
        }

        if (format == "MASTHEAD") {
            requestForecast.filter[2] = {
                "FormatID": [

                    //App_mban / Web_mban et Web_mpave / App_mpave
                    "79638",
                    "79642",
                    "79643",
                    "79644",
                    "79645",
                    "79646",
                    "84657",
                    "84658",
                    "84656",
                    "84659",
                    "84660",
                    "84661",
                    "84652",
                    "84653",
                    "84654",
                    "84655"

                ]
            }
        }

        if (format == "HABILLAGE") {
            requestForecast.filter[2] = {
                "FormatID": [

                    //Masthead / Grand_angle
                    "79638",
                    "79642",
                    "79643",
                    "79644",
                    "79645",
                    "79646",
                    "84657",
                    "84658",
                    "84656",
                    "84659",
                    "84660",
                    "84661",
                    "84652",
                    "84653",
                    "84654",
                    "84655",
                    //Habilage
                    "44149"

                ]
            }
        }

        //ELARGIR SI Pack=mobile et format Habillage ou format=Masthead ou format=gran
        if (packs == "4") {

            if (format == "HABILLAGE" || format == "MASTHEAD" || format == "GRAND ANGLE") {

                requestForecast.filter[2] = {
                    "FormatID": [

                        //Masthead / Grand_angle
                        "79425",
                        "79431",
                        "79409",
                        "79421",
                        "79637"

                    ]
                }

            }

        }

        // console.log(requestForecast.filter[2]) On fait les 3 steps pour récupérer
        // l'informations du csv puis on push dans un tableau
        let firstLink = await AxiosFunction.getForecastData(
            'POST',
            '',
            requestForecast
        );

        if (firstLink.headers.location) {
            headerlocation = firstLink.headers.location;

            let secondLink = await AxiosFunction.getForecastData('GET', headerlocation);

            if (secondLink.data.progress == '100') {
                headerlocation = secondLink.headers.location;

                let csvLink = await AxiosFunction.getForecastData('GET', headerlocation);

                var TotalImpressions = []
                var OccupiedImpressions = []
                var SiteID = []
                var SiteName = []
                var FormatID = []
                var FormatName = []

                var data_forecast = csvLink.data

                var data_split = data_forecast.split(/\r?\n/);

                //compte le nbr ligne
                var number_line = data_split.length;

                //boucle sur les ligne
                for (i = 0; i < number_line; i++) {

                    //delete les ; et delete les blanc
                    line = data_split[i].split(';');

                    //push la donnéé splité dans un tab vide
                    TotalImpressions.push(line[0]);
                    OccupiedImpressions.push(line[1]);
                    SiteID.push(line[2]);
                    SiteName.push(line[3]);
                    FormatID.push(line[4]);
                    FormatName.push(line[5]);

                }

                var sommeImpressions = 0
                var sommeOccupied = 0

                for (let i = 1; i < TotalImpressions.length; i++) {
                    if (TotalImpressions[i] != '') {
                        sommeImpressions += parseInt(TotalImpressions[i])
                        sommeOccupied += parseInt(OccupiedImpressions[i])
                    }
                }

                var volumeDispo = sommeImpressions - sommeOccupied;

                //SEPARATEUR DE MILLIER universel

                sommeImpressions = Utilities.numStr(sommeImpressions);
                sommeOccupied = Utilities.numStr(sommeOccupied);
                volumeDispo = Utilities.numStr(volumeDispo);

                var table = {
                    StartDate,
                    EndDate,
                    format,
                    sommeImpressions,
                    sommeOccupied,
                    volumeDispo
                }

                return res.json({table: table, success: true});

            }
        }

    } catch (error) {
        console.log(error)
        var statusCoded = error.response;

        res.render("error.ejs", {statusCoded: statusCoded})
    }
}

exports.formast_json = async (req, res) => {
    //renvoie du json les info campagnes
    try {
        await ModelFormat
            .findAll({
                attributes: ['format_group'],
                group: "format_group",
                where: {
                    format_group: {
                        [Op.not]: null
                    }
                },
                order: [
                    ['format_group', 'ASC']
                ]
            })
            .then(campagnes => {
                res.json(campagnes)

            })
    } catch (error) {
        console.log(error)

    }
}

exports.packs_json = async (req, res) => {
    //renvoie du json les info campagnes
    try {
        await ModelPack
            .findAll({
                attributes: [
                    'pack_id', 'pack_name'
                ],
                order: [
                    ['pack_name', 'ASC']
                ]
            })
            .then(packs => {
                res.json(packs)

            })
    } catch (error) {
        console.log(error)

    }
}

exports.countrys_json = async (req, res) => {
    //renvoie du json les info campagnes
    try {
        await ModelCountry
            .findAll({
                attributes: [
                    'country_id', 'country_name'
                ],
                where: {
                    country_id: [61, 125, 184]
                },
                order: [
                    ['country_name', 'DESC']
                ]
            })
            .then(countrys => {
                res.json(countrys)

            })
    } catch (error) {
        console.log(error)

    }
}

exports.packs_sites_json = async (req, res) => {
    //renvoie du json les info campagnes
    try {
        await ModelPackSite
            .findAll({
                attributes: ['pack_id', 'site_id']
            })
            .then(packs_sites => {
                res.json(packs_sites)

            })
    } catch (error) {
        console.log(error)

    }
}

exports.campaign_json = async (req, res) => {
    //renvoie du json les info campagnes
    var advertiser_id = req.params.advertiser_id
    try {
        const advertiserExclus = new Array(
            418935,
            //427952,
          //  409707,
            425912,
            425914,
            438979,
            439470,
            439506,
            439511,
            439512,
            439513,
            439514,
            439515,
            440117,
            440118,
            440121,
            440122,
            440124,
            440126,
            445117,
            455371,
            455384,
            320778,
            417243,
            414097,
            411820,
            320778
        );
        await ModelCampaigns
            .findAll({
                where: {
                    advertiser_id: advertiser_id,
                    campaign_archived:0,
                    [Op.and]: [{
                        advertiser_id: {
                            [Op.notIn]: advertiserExclus
                        }
                    }],
                    
                },
                order: [
                    ['campaign_id', 'ASC']
                ]
            })
            .then(campagnes => {
                res.json(campagnes)

            })
    } catch (error) {
        console.log(error)

    }
}

exports.creativeType_json = async (req, res) => {
    //renvoie du json les info campagnes
    var format_group_id = req.params.format_group_id
    try {
     
        await ModelCreativesTypesFormats
            .findAll({
                where: {
                    format_group_id: format_group_id,
                    creative_type_id:[1,2]
                    
                },
                include: [{
                    model: ModelCreativesTypes,
                    attributes: ['creative_type_id', 'creative_type_name']
                    
                }],
                
                order: [
                    ['creative_type_id', 'ASC']
                ]
            })
            .then(campagnes => {
                res.json(campagnes)

            })
    } catch (error) {
        console.log(error)

    }
}