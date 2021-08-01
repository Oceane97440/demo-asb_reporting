// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');

//let csvToJson = require('convert-csv-to-json');
const Utilities = require('../functions/functions.utilities');

const axios = require(`axios`);

const fileGetContents = require('file-get-contents');

// Initiliase le module axios

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
//const ModelSite = require("../models/models.site");
const ModelFormat = require("../models/models.formats");
const ModelCountry = require("../models/models.countries")
const ModelEpilotCampaigns = require("../models/models.epilot_campaigns")
const ModelPacks = require("../models/models.packs")
const ModelPacksSites = require("../models/models.packs_sites")

exports.index = async (req, res) => {
    try {
        const formats = await ModelFormat.findAll({
            attributes: ['format_group'],
            group: "format_group",
            where: {
                format_group: {
                    [Op.not]: null
                }
            },
            order: [
                ['format_group', 'ASC']
            ],
        })

        const packs = await ModelPacks.findAll({
            attributes: ['pack_id', 'pack_name'],
            order: [
                ['pack_name', 'ASC']
            ],
        })

        const countrys = await ModelCountry.findAll({
            attributes: ['country_id', 'country_name'],
            where: {
                country_id: [61, 125, 184]
            },
            order: [
                ['country_name', 'DESC']
            ],
        })

        res.render('manager/forecast/index.ejs', {
            formats: formats,
            packs: packs,
            countrys: countrys
        });


    } catch (error) {
        console.log(error)
        var statusCoded = error.response;
        res.render("error.ejs", {
            statusCoded: statusCoded,
        });
    }

};

exports.forecast = async (req, res, next) => {


    const formats = await ModelFormat.findAll({
        attributes: ['format_group'],
        group: "format_group",
        where: {
            format_group: {
                [Op.not]: null
            }
        },
        order: [
            ['format_group', 'ASC']
        ],
    })

    const packsDB = await ModelPacks.findAll({
        attributes: ['pack_id', 'pack_name'],
        order: [
            ['pack_name', 'ASC']
        ],
    })

    const countrys = await ModelCountry.findAll({
        attributes: ['country_id', 'country_name'],
        where: {
            country_id: [61, 125, 184]
        },
        order: [
            ['country_name', 'DESC']
        ],
    })




    // Définition des variables
    var headerlocation, table, requestForecast;
    var date_start = await req.body.date_start;
    var date_end = await req.body.date_end;
    var format = await req.body.format;
    var packs = await req.body.packs;
    var countries = await req.body.countries;
    var option = await req.body.case
    //si la case n'est pas coché renvoie false sinon true
    if (option == undefined) {
        var option = false;
    } else {
        var option = true;
    }

    const formatIdsArray = [];
    const sites = [];
    const dataArrayFromReq = [];

    try {
        // si l'un des champs sont vide
        if (date_start == '' || date_start == '' || format == '' || packs == '' || countries == '') {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Les champs doivent être complétés'
            }
            return res.redirect('/forecast');
        }

        //date aujourd'hui en timestamp 
        const date_now = Date.now();
        const timstasp_start = Date.parse(date_start);
        const timstasp_end = Date.parse(date_end);

        // si date aujourd'hui est >= à la date selectionné envoie une erreur ou date debut > à la date de fin
        if (timstasp_start <= date_now || timstasp_start >= timstasp_end) {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'La date de début doit être J+1 à la date du jour'
            }
            return res.redirect('manager/forecast');
        }

        // si date aujourd'hui est >= à la date selectionné envoie une erreur ou la date de fin < à la date de début
        if (timstasp_end <= date_now || timstasp_end <= timstasp_start) {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'La date de fin doit être supérieur à la date du jour'
            }
            return res.redirect('manager/forecast');
        }

        date_start = date_start + 'T00:00:00.000Z';
        date_end = date_end + 'T23:59:00.000Z';

        const campaign_StartDate = await date_start;
        var startDate_split = await campaign_StartDate.split('T');
        const start_Date = await startDate_split[0];

        const campaign_EndDate = await date_end;
        var endDate_split = await campaign_EndDate.split('T');
        const end_Date = await endDate_split[0];

        const dateStart = new Date(start_Date);
        JJ = ('0' + (dateStart.getDate())).slice(-2);
        MM = ('0' + (dateStart.getMonth() + 1)).slice(-2);
        AAAA = dateStart.getFullYear();
        const StartDate = await JJ + '/' + MM + '/' + AAAA;

        const dateEnd = new Date(end_Date);
        JJ = ('0' + (dateEnd.getDate())).slice(-2);
        MM = ('0' + (dateEnd.getMonth() + 1)).slice(-2);
        AAAA = dateEnd.getFullYear();
        const EndDate = await JJ + '/' + MM + '/' + AAAA;

        // recupération des site d'un pack
        const sitesdb = await ModelPacksSites.findAll({
            attributes: ['pack_id', 'site_id'],
            where: {
                pack_id: {
                    [Op.eq]: packs
                }
            }
        });

        if (sitesdb.length > 0) {
            for (let l = 0; l < sitesdb.length; l++) {
                sites.push(sitesdb[l].site_id);
            }

            // Si c'est un string on met en tableau pour respecter l'api
            if (typeof sites == 'string') {
                sites = [sites];
            }
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

        var requestInsertions = {
            "startDate": date_start,
            "endDate": date_end,
            "timeZoneId": "Arabian Standard Time",
            "filter": [{
                    "CountryID": [countries]
                },
                {
                    "SiteID": sites
                },
                {
                    "FormatID": formatIdsArray // new Array(79633,44152) //formats
                }
            ],
            "fields": [
                "InsertionName",
                "InsertionBookedVolume",
                "InsertionForecastedDeliveredVolume",
                "InsertionForecastedDeliveredPercentage",
                "TotalImpressions",
                "OccupiedImpressions",
            ]
        };

        // si le packs choisi "Rotation Générale" / "Rotation Générale-DESKTOP"
        if (packs == "1" || packs == "2" || packs == "7") {

        }
        if (format == "VIDEOS" || SiteID == 322433 || SiteID == 299263) {

            //liste des campagne_id video Linfo.re / antenne
            var requestCampaign_video = {
                "startDate": date_start,
                "endDate": date_end,
                "timeZoneId": "Arabian Standard Time",
                "filter": [{
                        "CountryID": [countries]
                    },
                    {
                        "SiteID": ["322433", "299263"]
                    },
                    {
                        "FormatID": formatIdsArray // new Array(79633,44152) //formats
                    }
                ],
                "fields": [
                    "CampaignID",
                    //  "CampaignName",
                ]
            };

            //liste des insertion video adbreak 1 Linfo.re / antenne

            var requestForecast_video = {

                "startDate": date_start,
                "endDate": date_end,
                "timeZoneId": "Arabian Standard Time",
                "filter": [

                    {
                        "formatID": formatIdsArray
                    },
                    {
                        "SiteID": ["322433", "299263"]

                    },
                    {
                        "countryID": [countries]
                    },
                    {
                        "adBreakID": ["1"]

                    }

                ],

                "fields": [

                    "InsertionID",

                    "InsertionName",

                    "TotalImpressions",

                    "OccupiedImpressions",

                    "InsertionBookedVolume",

                    "InsertionForecastedDeliveredVolume",


                ],



            }

            // traitement et envoie des 2 requêtes video
            let LinkCampaign_adbreak = await AxiosFunction.getForecastData('POST', '', requestCampaign_video);
            let LinkForecast_adbreak = await AxiosFunction.getForecastData('POST', '', requestForecast_video);

            if (LinkCampaign_adbreak.headers.location || LinkForecast_adbreak.headers.location) {

                headerlocationVideo_campaign = LinkCampaign_adbreak.headers.location;
                headerlocationVideo_forecast = LinkForecast_adbreak.headers.location;

                let campaignLink = await AxiosFunction.getForecastData('GET', headerlocationVideo_campaign);
                let forecastLink = await AxiosFunction.getForecastData('GET', headerlocationVideo_forecast);

                if (campaignLink.data.progress == '100') {
                    headerlocationVideo_campaign = campaignLink.headers.location;
                    headerlocationVideo_forecast = forecastLink.headers.location;


                    let csvLink_campaign = await AxiosFunction.getForecastData('GET', headerlocationVideo_campaign);
                    let csvLink_forecast = await AxiosFunction.getForecastData('GET', headerlocationVideo_forecast);


                    //  console.log(csvLink_campaign.data)
                    //  console.log( csvLink_forecast.data)


                    const campaigns = [];

                    var data_campaignid = await csvLink_campaign.data;
                    var data_split = await data_campaignid.split(/\r?\n/);
                    var number_line = await data_split.length;

                    for (i = 1; i < number_line; i++) {
                        line = await data_split[i].split(';');
                        campaigns.push(line[0]);

                    }
                    //exclure les doublon campagne_id
                    const campaignUnique = Utilities.array_unique(campaigns);
                    console.log('number_line', number_line)
                    console.log('all campaign_id ', campaigns)
                    console.log('all campaign_unique ', campaignUnique)


                    console.log('-----------------------------------')

                    var InsertionId = [];
                    var InsertionName = [];
                    var InsertionImpression = [];
                    var InsertionOccupied = [];
                    var InsertionVolume = [];
                    var InsertionDeliveredVolume = [];




                    var data_insertions = await csvLink_forecast.data;
                    var data_split = await data_insertions.split(/\r?\n/);
                    var number_line = await data_split.length;

                    for (i = 1; i < number_line; i++) {
                        line = await data_split[i].split(';');
                        InsertionId.push(line[0]);
                        InsertionName.push(line[1]);
                        InsertionImpression.push(line[2]);
                        InsertionOccupied.push(line[3]);
                        InsertionVolume.push(line[4]);
                        InsertionDeliveredVolume.push(line[5]);



                    }
                    console.log('number_line', number_line)
                    console.log(InsertionVolume)

                    console.log('-----------------------------------')


                    var insertionId = new Array();
                    var sommeVolumeCampaign = new Array();


                    for (i = 0; i < campaignUnique.length; i++) {
                        for (j = 0; j < campaigns.length; j++) {
                            if (campaignUnique[i] === campaigns[j]) {
                                sommeVolumeCampaign[i] = InsertionVolume[j]
                                insertionId[i] = InsertionId[j]


                            }
                        }
                    }

                    for (i = 0; i < campaignUnique.length; i++) {
                        sommeVolumeCampaign[i] = sommeVolumeCampaign[i]
                    }


                    console.log("---------------------")
                    console.log(insertionId)
                    console.log(sommeVolumeCampaign)


                }

            }

        }

        let threeLink = await AxiosFunction.getForecastData('POST', '', requestInsertions);



        if (threeLink.headers.location) {
            headerlocation = threeLink.headers.location;
            let insertionLink = await AxiosFunction.getForecastData('GET', headerlocation);
            if (insertionLink.data.progress == '100') {
                headerlocation = insertionLink.headers.location;

                let csvLink = await AxiosFunction.getForecastData('GET', headerlocation);

                // liste des insertions
                var InsertionName = [];
                var InsertionBookedVolume = [];
                var InsertionForecastedDeliveredVolume = [];
                var InsertionForecastedDeliveredPercentage = [];

                var data_forecast = await csvLink.data;

                var data_split = await data_forecast.split(/\r?\n/);
                //compte le nbr ligne 
                var number_line = await data_split.length;

                //boucle sur les lignes
                for (i = 0; i < number_line; i++) {
                    //delete les ; et delete les blanc
                    line = await data_split[i].split(';');

                    //push la donnéé splité dans un tab vide
                    //liste des insertions
                    InsertionName.push(line[0]);
                    InsertionBookedVolume.push(line[1]);
                    InsertionForecastedDeliveredVolume.push(line[2]);
                    InsertionForecastedDeliveredPercentage.push(line[3]);
                }

                var insertions = {
                    //liste des insertions

                    InsertionName,
                    InsertionBookedVolume,
                    InsertionForecastedDeliveredVolume,
                    InsertionForecastedDeliveredPercentage,

                }
            }

        }

        // Si on a le format intertistiel : On va faire du cumul site par site avec l'ajout d'un capping
        if (format === "INTERSTITIEL") {
            for (let xyz = 0; xyz < sites.length; xyz++) {
                requestForecast = {
                    "startDate": date_start,
                    "endDate": date_end,
                    "timeZoneId": "Arabian Standard Time",
                    "filter": [{
                            "CountryID": [countries]
                        },
                        {
                            "SiteID": [sites[xyz]]
                        },
                        {
                            "FormatID": formatIdsArray // new Array(79633,44152) //formats
                        }
                    ],
                    "fields": ["TotalImpressions", "OccupiedImpressions", "SiteID", "SiteName", "FormatID", "FormatName", "AvailableImpressions"]
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

                if (format == "INTERSTITIEL") {
                    requestForecast.filter[2] = {
                        "FormatID": [
                            "44152", "79633"

                        ]
                    }
                }
                // On fait les 3 steps pour récupérer l'informations du csv puis on push dans un tableau
                let firstReq = await AxiosFunction.getForecastData('POST', '', requestForecast);

                if (firstReq.headers.location) {
                    headerlocation = firstReq.headers.location;
                    let secondReq = await AxiosFunction.getForecastData('GET', headerlocation);

                    if (secondReq.data.progress == '100') {
                        headerlocation = secondReq.headers.location;
                        let csvLinkReq = await AxiosFunction.getForecastData('GET', headerlocation);
                        dataArrayFromReq.push(csvLinkReq.data);
                        table = await AxiosFunction.dataFormatingForForecast(dataArrayFromReq);
                    }
                }
            }

            switch (format) {
                case "INTERSTITIEL":
                    //si interstitiel -> web_interstitiel / app_interstitiel
                    format_filtre = new Array("WEB_INTERSTITIEL", "APP_INTERSTITIEL", "INTERSTITIEL")
                    break;
                default:
                    break;
            }

            //Requête sql campagne epilot
            const requete = await sequelize.query(
                'SELECT * FROM asb_epilot_campaigns WHERE ((asb_epilot_campaigns.campaign_epilot_start_date BETWEEN ? AND ?) OR (asb_epilot_campaigns.campaign_epilot_end_date BETWEEN ? AND ?))', {
                    /*AND format_name IN(?) ORDER BY asb_epilot_campaigns.format_name ASC*/
                    replacements: [date_start, date_end, date_start, date_end /*, format_filtre*/ ],
                    type: QueryTypes.SELECT
                }
            );

            //Initialisation du tableau
            var array_reserver = [];
            var Campagnes_reserver = [];
            var Campagne_start_reserver = [];
            var Campagne_end_reserver = [];
            var Interval_reserver = [];
            var Nbr_cheval_reserver = [];

            if (requete.length > 0) {
                for (let i = 0; i < requete.length; i++) {
                    // Calculer l'intervalle de date sur la période
                    const campaign_epilot_start_date = requete[i].campaign_epilot_start_date;
                    const campaign_epilot_end_date = requete[i].campaign_epilot_end_date;
                    const volumes_prevue = requete[i].volume_prevue;

                    const campaign_date_start = await campaign_epilot_start_date.split(' ')[0] + 'T00:00:00.000Z';
                    const campaign_date_end = await campaign_epilot_end_date.split(' ')[0] + 'T23:59:00.000Z';
                    date_interval = new Date(campaign_epilot_end_date) - new Date(campaign_epilot_start_date);

                    const nb_jour_interval = (date_interval / 86400000);

                    // Calculer le nombre de jour à cheval en fonction des dates du forecast
                    const date_start_forecast = date_start;
                    const date_end_forecast = date_end;

                    if ((campaign_date_end > date_start_forecast)) {
                        //si le date début forecast (09/10/2020)< date début campagne (12/10/2020)
                        if (date_start_forecast < campaign_date_start) {
                            //alors la date début à cheval = date de début campagne 
                            var date_start_cheval = campaign_date_start;
                        } else {
                            var date_start_cheval = date_start_forecast;
                        }

                        // si la date fin forecats (19/10/2020)> date de fin de la campagne (12/10/2020)
                        if (date_end_forecast > campaign_date_end) {
                            //alors le date de fin a cheval = date de fin campagne 
                            var date_end_cheval = campaign_date_end;
                        } else {
                            var date_end_cheval = date_end_forecast;
                        }
                    }

                    //calcul du nombre de jour à cheval
                    const periode_a_cheval = new Date(date_end_cheval) - new Date(date_start_cheval);

                    //arrondie pour un nombre entier
                    const nb_jour_cheval = Math.round(periode_a_cheval / 86400000);

                    //   Calcul le volume prévu diffusé : Valeur du ( volume prevu / nombre de jour de diff de la campagne ) * nombre de jour a cheval = volume
                    const volumes_prevu_diffuse = Math.round((volumes_prevue / nb_jour_interval) * nb_jour_cheval)

                    if (requete[i].etat == "2") {
                        if ((campaign_date_start < date_start_forecast) || (campaign_date_end > date_end_forecast)) {} else {
                            array_reserver.push(volumes_prevu_diffuse);
                            Campagnes_reserver.push(requete[i].campaign_name);
                            Campagne_start_reserver.push(campaign_epilot_start_date);
                            Campagne_end_reserver.push(campaign_epilot_end_date);
                            Interval_reserver.push(nb_jour_interval);
                            Nbr_cheval_reserver.push(nb_jour_cheval);
                        }
                    }
                }
            }

            var sommeReserver = 0;

            //total des réserver
            for (let i = 0; i < array_reserver.length; i++) {
                if (array_reserver[i] != '') {
                    sommeReserver += parseInt(array_reserver[i])
                }
            }

            var Volume_dispo_forecast = table.volumeDispo;

            // Calcule du volume dispo reserer  
            var reserver_reel = Volume_dispo_forecast - sommeReserver;
            if (reserver_reel == Volume_dispo_forecast || sommeReserver == 0) {
                reserver_reel = 0;
                sommeReserver = 0;
            }

            var reserver = {
                //RESERVER//
                array_reserver,
                sommeReserver,
                reserver_reel,
                Campagnes_reserver,
                Campagne_start_reserver,
                Campagne_end_reserver,
                Interval_reserver,
                Nbr_cheval_reserver,
            }

            const infos = {
                StartDate,
                EndDate,
                format,
            }

            return res.render('manager/forecast/view.ejs', {
                formats: formats,
                packs: packsDB,
                countrys: countrys,
                table: table,
                insertions: insertions,
                infos: infos,
                reserver: reserver
            });
        }

        // initialise la requête pour les cas hors intertistiel + habillage
        requestForecast = {
            "startDate": date_start,
            "endDate": date_end,
            "timeZoneId": "Arabian Standard Time",
            "filter": [{
                    "CountryID": [countries]
                },
                {
                    "SiteID": sites
                },
                {
                    "FormatID": formatIdsArray // new Array(79633,44152) //formats
                }
            ],
            "fields": [
                "TotalImpressions",
                "OccupiedImpressions",
                "SiteID",
                "SiteName",
                "FormatID",
                "FormatName",
                "pageID",
                "PageName",
            ]
        };



        //si la case "élargir la propo" est coché les web et ap mban son add de la requête
        if (format == "GRAND ANGLE") {
            requestForecast.filter[2] = {
                "FormatID": [
                    //App_mban / Web_mban et Web_mpave / App_mpave
                    //App_mban
                    "79638", "79642", "79643", "79644", "79645", "79646", "79647", "79648", "79649",

                    "84657", "84658", "84656",
                    //web_mban
                    "84659", "84660", "84661", "84652", "84653", "84654", "84655",

                    //App_mpave
                    "79956", "79650", "79651", "79652", "79653", "79654", "79655",
                ]
            }
        }

        //si la case "élargir la propo" est coché les web et ap pave son add de la requête
        if (format == "MASTHEAD") {
            requestForecast.filter[2] = {
                "FormatID": [
                    // App_mban / Web_mban et Web_mpave / App_mpave

                    //Web_mban
                    "79409", "84652", "84653", "84654", "84655", "79421",

                    //App_mban
                    "79638", "79642", "79643", "79644", "79645", "79646",

                    "84657", "84658", "84656",

                    //Web_mpave
                    "84659", "84660", "84661", "84652", "84653", "84654", "84655"
                ]
            }
        }

        //si le format choisi est Linear
        if (format == "VIDEOS") {

            //site m6 et tf1

            // tous les preroll et midroll de tf1 /m6
            requestForecast.filter[3] = {
                "pageID": [
                    //midroll m6
                    "1108384",
                    "1108386",
                    "1108389",
                    "1108390",
                    "1108392",
                    "1108393",
                    "1108394",
                    //preroll m6
                    "1108371",
                    "1108373",
                    "1108375",
                    "1108377",
                    // midroll tf1 ici
                    "1108365",
                    "1108366",
                    "1108367",
                    "1108368",
                    "1108369",
                    "1108370",
                    // preroll tf1 ici
                    "1108360",
                    "1108361",
                    "1108362",
                    "1108363",
                    //midroll tf1 mytf1
                    "1107007",
                    "1107008",
                    "1107009",
                    "1108354",
                    "1108355",
                    "1108356",
                    "1108357",
                    // preroll tf1 mytf1    
                    "1107003",
                    "1107004",
                    "1107005",
                    "1107006"
                ]
            }

        }



        //si la case "élargir la propo" est coché les web et ap mban et pave son add de la requête
        if (option == true && format == "HABILLAGE") {
            requestForecast.filter[2] = {
                "FormatID": [
                    //Masthead / Grand_angle
                    "79638", "79642", "79643", "79644", "79645", "79646", "84657", "84658", "84656",
                    "84659", "84660", "84661", "84652", "84653", "84654", "84655",
                    //Habilage
                    "44149"
                ]
            }
        } else {
            // si le format habillage est choisi on ajoute App_man_atf0
            if (format === "HABILLAGE") {
                requestForecast.filter[2] = {
                    "FormatID": ["79637", "44149"]
                }
            }
        }

        if (packs == "4") {
            if (format == "HABILLAGE" || format == "MASTHEAD" || format == "GRAND ANGLE") {
                requestForecast.filter[2] = {
                    "FormatID": [
                        //Masthead / Grand_angle
                        "79425", "79431", "79409", "79421", "79637"
                    ]
                }
            }
        }

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

        //console.log(requestForecast.filter[2])
        // On fait les 3 steps pour récupérer l'informations du csv puis on push dans un tableau
        let firstLink = await AxiosFunction.getForecastData('POST', '', requestForecast);

        if (firstLink.headers.location) {
            headerlocation = firstLink.headers.location;
            let secondLink = await AxiosFunction.getForecastData('GET', headerlocation);

            if (secondLink.data.progress == '100') {
                headerlocation = secondLink.headers.location;
                let csvLink = await AxiosFunction.getForecastData('GET', headerlocation);
                var TotalImpressions = [];
                var OccupiedImpressions = [];
                var SiteID = [];
                var SiteName = [];
                var FormatID = [];
                var FormatName = [];
                var PageID = [];
                var PageName = [];

                var data_forecast = await csvLink.data;

                var data_split = data_forecast.split(/\r?\n/);
                //console.log(data_split)
                //compte le nbr ligne 
                var number_line = data_split.length;

                //boucle sur les ligne
                for (i = 0; i < number_line; i++) {
                    //delete les ; et delete les blanc
                    line = await data_split[i].split(';');
                    //test d'exclusion (ex; si habillage -> exclu les app_mban atf0)
                    //push la donnéé splité dans un tab vide
                    TotalImpressions.push(line[0]);
                    OccupiedImpressions.push(line[1]);
                    //test exclusion (site : actu reunion )
                    SiteID.push(line[2]);
                    SiteName.push(line[3]);
                    FormatID.push(line[4]);
                    FormatName.push(line[5]);
                    PageID.push(line[6]);
                    PageName.push(line[7]);
                }

                var sommeImpressions = 0;
                var sommeOccupied = 0;

                for (let i = 1; i < TotalImpressions.length; i++) {
                    if (TotalImpressions[i] != '') {
                        sommeImpressions += parseInt(TotalImpressions[i])
                        sommeOccupied += parseInt(OccupiedImpressions[i])
                    }
                }

                var volumeDispo = sommeImpressions - sommeOccupied;

                switch (format) {
                    case "HABILLAGE":
                        //si c habillage -> web_habillage / app_mban_atf
                        format_filtre = new Array("WEB_HABILLAGE", "APP_MBAN_ATF0", "HABILLAGE")
                        break;
                    case "GRAND ANGLE":
                        //si grand angle ->web_mban  app_mpave_atf0 
                        format_filtre = new Array("WEB_MPAVE_ATF0", "APP_MPAVE_ATF0", "GRAND ANGLE")
                        break;
                    case "MASTHEAD":
                        //si masthead -> web_mban / app_mban
                        format_filtre = new Array("WEB_MBAN_ATF0", "APP_MBAN_ATF0", "MASTHEAD")
                        break;
                    case "VIDEOS":
                        //si instream -> linear 
                        format_filtre = new Array("VIDEOS", "Linear")
                        break;
                    case "LOGO":
                        format_filtre = new Array("LOGO", "WEB_LOGO")
                        break;
                    case "NATIVE":
                        format_filtre = new Array("NATIVE", "WEB_NATIVE", "WEB_NATIVE_MBAN_ATF")
                        break;
                    case "SLIDE":
                        format_filtre = new Array("SLIDE", "APP_SLIDE")
                        break;
                    default:
                        break;
                }

                const requete = await sequelize.query(
                    'SELECT * FROM asb_epilot_campaigns WHERE ((campaign_epilot_start_date BETWEEN ? AND ?) OR (campaign_epilot_end_date BETWEEN ? AND ?))', {
                        //  AND format_name  IN (?) ORDER BY asb_epilot_campaigns.format_name ASC// format_filtre
                        replacements: [date_start, date_end, date_start, date_end],
                        type: QueryTypes.SELECT
                    }
                );

                //Initialisation du tableau
                var array_reserver = [];
                var Campagnes_reserver = [];
                var Campagne_start_reserver = [];
                var Campagne_end_reserver = [];
                var Interval_reserver = [];
                var Nbr_cheval_reserver = [];

                for (let i = 0; i < requete.length; i++) {
                    // Calculer l'intervalle de date sur la période
                    const campaign_epilot_start_date = requete[i].campaign_epilot_start_date;
                    const campaign_epilot_end_date = requete[i].campaign_epilot_end_date;
                    const volumes_prevue = requete[i].volume_prevue;
                    const campaign_date_start = await campaign_epilot_start_date.split(' ')[0] + 'T00:00:00.000Z';
                    const campaign_date_end = await campaign_epilot_end_date.split(' ')[0] + 'T23:59:00.000Z';
                    date_interval = new Date(campaign_epilot_end_date) - new Date(campaign_epilot_start_date);

                    const nb_jour_interval = (date_interval / 86400000);

                    // Calculer le nombre de jour à cheval en fonction des dates du forecast
                    const date_start_forecast = date_start;
                    const date_end_forecast = date_end;

                    if ((campaign_date_end > date_start_forecast)) {
                        //si le date début forecast (09/10/2020)< date début campagne (12/10/2020)
                        if (date_start_forecast < campaign_date_start) {
                            //alors la date début à cheval = date de début campagne 
                            var date_start_cheval = campaign_date_start;
                        } else {
                            var date_start_cheval = date_start_forecast;
                        }

                        // si la date fin forecats (19/10/2020)> date de fin de la campagne (12/10/2020)
                        if (date_end_forecast > campaign_date_end) {
                            //alors le date de fin a cheval = date de fin campagne 
                            var date_end_cheval = campaign_date_end;
                        } else {
                            var date_end_cheval = date_end_forecast;
                        }
                    }

                    const periode_a_cheval = new Date(date_end_cheval) - new Date(date_start_cheval);
                    const nb_jour_cheval = Math.round(periode_a_cheval / 86400000);
                    const volumes_prevu_diffuse = Math.round((volumes_prevue / nb_jour_interval) * nb_jour_cheval);

                    //Exclure des campagnes confirmées ou réservées qui sont égales ou inf. à la date de début du forecast
                    //Exclure des campagnes confirmées ou réservées qui sont sup. ou égales à la date de fin du forecast

                    if (requete[i].etat == "2") {
                        if ((campaign_date_start < date_start_forecast) || (campaign_date_end > date_end_forecast)) {

                        } else {
                            array_reserver.push(volumes_prevu_diffuse);
                            Campagnes_reserver.push(requete[i].campaign_name);
                            Campagne_start_reserver.push(campaign_epilot_start_date);
                            Campagne_end_reserver.push(campaign_date_end);
                            Interval_reserver.push(nb_jour_interval);
                            Nbr_cheval_reserver.push(nb_jour_cheval);
                        }
                    }

                }

                var sommeReserver = 0;

                for (let i = 0; i < array_reserver.length; i++) {
                    if (array_reserver[i] != '') {
                        sommeReserver += parseInt(array_reserver[i]);
                    }
                }

                var reserver_reel = volumeDispo - sommeReserver;

                if (reserver_reel == volumeDispo || sommeReserver == 0) {
                    // confirme_reel = 0;
                    reserver_reel = 0;
                    sommeReserver = 0;
                }

                //SEPARATEUR DE MILLIER universel 
                sommeImpressions = Utilities.numStr(sommeImpressions);
                sommeOccupied = Utilities.numStr(sommeOccupied);
                volumeDispo = Utilities.numStr(volumeDispo);

                var table = {
                    TotalImpressions,
                    OccupiedImpressions,
                    SiteID,
                    SiteName,
                    FormatID,
                    FormatName,
                    //add page
                    PageID,
                    PageName,
                    sommeImpressions,
                    sommeOccupied,
                    volumeDispo,
                    option
                }

                var reserver = {
                    //RESERVER//
                    array_reserver,
                    sommeReserver,
                    reserver_reel,
                    Campagnes_reserver,
                    Campagne_start_reserver,
                    Campagne_end_reserver,
                    Interval_reserver,
                    Nbr_cheval_reserver,
                }

                const infos = {
                    StartDate,
                    EndDate,
                    format
                }

                if (req.session.user.user_role == 1) {



                    return res.render('manager/forecast/view.ejs', {
                        table: table,
                        insertions: insertions,
                        reserver: reserver,
                        infos: infos,
                        formats: formats,
                        packs: packsDB,
                        countrys: countrys
                    });
                }

                if (req.session.user.user_role == 2 || req.session.user.user_role == 3) {


                    var insertions = {

                        StartDate,
                        EndDate,
                        format,

                    }

                    return res.render('forecast/users/data_user.ejs', {
                        table: table,
                        insertions: insertions,
                        reserver: reserver
                    });
                }

            }



        }

    } catch (error) {
        console.log(error);
    }
}