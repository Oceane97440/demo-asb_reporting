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
const AxiosFunction = require('../functions/functions.axios');


// Initialise les models
//const ModelSite = require("../models/models.site");
const ModelFormat = require("../models/models.format");
const ModelCountry = require("../models/models.country")
const ModelCampaign_epilot = require("../models/models.campaing_epilot")
const ModelPack = require("../models/models.pack")
const ModelPack_Site = require("../models/models.pack_site")
const ModelRole = require("../models/models.role")
const ModelUser = require("../models/models.user")
const ModelUser_Role = require("../models/models.user_role")


exports.index = async (req, res) => {

 

    try {

     
     
        if (req.session.user.role == 2 || req.session.user.role == 3) {

            var formats = await ModelFormat.findAll({
                attributes: ['format_id', 'format_name', 'format_group'],
                group: ['format_group'],
                where: {
                    format_group: {
                        [Op.not]: null
                    }
                },
                order: [
                    ['format_group', 'ASC']
                ],
            })
    
            var packs = await ModelPack.findAll({
                attributes: ['pack_id', 'pack_name'],
                order: [
                    ['pack_name', 'ASC']
                ],
            })
    
    
            var countrys = await ModelCountry.findAll({
                attributes: ['country_id', 'country_name'],
                where: {
                    country_id: [61, 125, 184]
                },
                order: [
                    ['country_name', 'DESC']
                ],
            })
    
            res.render('forecast/users/form.ejs', {
                formats: formats,
                // sites: sites,
                packs: packs,
                countrys: countrys
            });
    
        
        }
    
       

    } catch (err) {
        res.status(500).json({
            'error': 'cannot fetch country'
        });
    }

};


exports.forecast_user = async (req, res, next) => {
  

    // Définition des variables
    var headerlocation, table, requestForecast;
    var date_start = req.body.date_start;
    var date_end = req.body.date_end;
    var format = req.body.format;
    var packs = req.body.packs;
    var countries = req.body.countries;

    option = req.body.case

  
    //si la case n'est pas coché renvoie false sinon true
    if (option == undefined) {

        var option = false

    } else {

        var option = true

    }


    const formatIdsArray = [];
    const sites = [];
    const dataArrayFromReq = [];

    try {

        date_start = date_start + 'T00:00:00.000Z'
        date_end = date_end + 'T23:59:00.000Z'


        //recupération des site d'un pack
        const sitesdb = await ModelPack_Site.findAll({
            attributes: ['pack_id', 'site_id'],
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
                if (packs == "7") {
                    requestForecast.filter[4] = {
                        "platformID": ["1"]
                    }
                }

                //si RG mob/tab est selectionner ciblage mob/tab 
                if (packs == "2") {
                    requestForecast.filter[3] = {
                        "platformID": ["3", "2"]
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

            //Requête sql campagne epilot
            const requete = await sequelize.query(
                'SELECT * FROM asb_campaign_epilot WHERE ((campaign_start_date BETWEEN ? AND ?) OR (campaign_end_date BETWEEN ? AND ?)) AND format_name = ? ORDER BY asb_campaign_epilot.format_name ASC', {
                    replacements: [date_start, date_end, date_start, date_end, format],
                    type: QueryTypes.SELECT
                }
            );

            console.log(requete)
            console.log(typeof requete)



            //Initialisation du tableau

            var array_reserver = [];


            for (let i = 0; i < requete.length; i++) {



                // Calculer l'intervalle de date sur la période
                const campaign_start_date = requete[i].campaign_start_date

                const campaign_end_date = requete[i].campaign_end_date

                const volumes_prevue = requete[i].volume_prevue

                const campaign_date_start = campaign_start_date.split(' ')[0] + 'T00:00:00.000Z'

                const campaign_date_end = campaign_end_date.split(' ')[0] + 'T23:59:00.000Z'

                date_interval = new Date(campaign_end_date) - new Date(campaign_start_date);

                const nb_jour_interval = (date_interval / 86400000)

                // Calculer le nombre de jour à cheval en fonction des dates du forecast
                const date_start_forecast = date_start
                const date_end_forecast = date_end

                if ((campaign_date_end > date_start_forecast)) {

                    //si le date début forecast (09/10/2020)< date début campagne (12/10/2020)

                    if (date_start_forecast < campaign_date_start) {

                        //alors la date début à cheval = date de début campagne 
                        var date_start_cheval = campaign_date_start

                    } else {
                        var date_start_cheval = date_start_forecast
                    }

                    // si la date fin forecats (19/10/2020)> date de fin de la campagne (12/10/2020)
                    if (date_end_forecast > campaign_date_end) {
                        //alors le date de fin a cheval = date de fin campagne 
                        var date_end_cheval = campaign_date_end

                    } else {
                        var date_end_cheval = date_end_forecast
                    }
                }

                //calcul du nombre de jour à cheval
                const periode_a_cheval = new Date(date_end_cheval) - new Date(date_start_cheval);

                //arrondie pour un nombre entier
                const nb_jour_cheval = Math.round(periode_a_cheval / 86400000)

                //   Calcul le volume prévu diffusé : Valeur du ( volume prevu / nombre de jour de diff de la campagne ) * nombre de jour a cheval = volume
                const volumes_prevu_diffuse = Math.round((volumes_prevue / nb_jour_interval) * nb_jour_cheval)



                if (requete[i].etat == "2") {
                    if ((campaign_date_start <= date_start_forecast) || (campaign_date_end >= date_end_forecast) || (campaign_date_start > date_start_forecast) || (campaign_date_end < date_end_forecast)) {

                        array_reserver.push(0);

                    } else {
                        array_reserver.push(volumes_prevu_diffuse);

                    }

                }

                var sommeReserver = 0

                //total des réserver
                for (let i = 0; i < array_reserver.length; i++) {
                    if (array_reserver[i] != '') {
                        sommeReserver += parseInt(array_reserver[i])
                    }
                }

                var Volume_dispo_forecast = table.volumeDispo

                // Calcule du volume dispo reserer  
                var reserver_reel = Volume_dispo_forecast - sommeReserver;


                if (reserver_reel == Volume_dispo_forecast || sommeReserver == 0) {
                    reserver_reel = 0;
                    sommeReserver = 0
                }

                var reserver = {
                    //RESERVER//
                    sommeReserver,
                    reserver_reel,

                }

                console.log(reserver)
                console.log(reserver.sommeReserver)
                console.log(reserver.reserver_reel)




            }

            var insertions = {


                date_start,
                date_end,
                format,

            }

            if (reserver_reel === undefined) {
                console.log("aucun requête")
                return res.render('forecast/users/data1_user.ejs', {
                    table: table,
                    insertions: insertions,
                    // reserver: reserver
                });

            }


            return res.render('forecast/users/data_user.ejs', {
                table: table,
                insertions: insertions,
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

            ]
        };

        //si la case "élargir la propo" est coché les web et ap mban son add de la requête
        if (option == true && format == "GRAND ANGLE") {
            requestForecast.filter[2] = {
                "FormatID": [

                    //Masthead
                    "79409", "84652", "84653", "84654", "84655", "84656", "79421",
                    "79637", "79638", "79642", "79643", "79644", "79645", "79646",
                    //Grand angle
                    "79956", "79650", "79651", "79652", "79653", "79654", "79655",
                    "79425", "84657", "84658", "84659", "84660", "84661", "79431"


                ]
            }
        }

        //si la case "élargir la propo" est coché les web et ap pave son add de la requête

        if (option == true && format == "MASTHEAD") {
            requestForecast.filter[2] = {
                "FormatID": [

                    //Masthead
                    "79409", "84652", "84653", "84654", "84655", "84656", "79421",
                    "79637", "79638", "79642", "79643", "79644", "79645", "79646",
                    //Grand angle
                    "79956", "79650", "79651", "79652", "79653", "79654", "79655",
                    "79425", "84657", "84658", "84659", "84660", "84661", "79431"


                ]
            }
        }

        //si la case "élargir la propo" est coché les web et ap mban et pave son add de la requête

        if (option == true && format == "HABILLAGE") {
            requestForecast.filter[2] = {
                "FormatID": [

                    //Masthead
                    "79409", "84652", "84653", "84654", "84655", "84656", "79421",
                    "79637", "79638", "79642", "79643", "79644", "79645", "79646",
                    //Grand angle
                    "79956", "79650", "79651", "79652", "79653", "79654", "79655",
                    "79425", "84657", "84658", "84659", "84660", "84661", "79431",
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

        //si RG-DESKTOP est seletionner add ciblage desktop
        if (packs == "7") {
            requestForecast.filter[3] = {
                "platformID": ["1"]
            }
        }

        //si RG mob/tab est selectionner ciblage mob/tab 
        if (packs == "2") {

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

                //Requête sql campagne epilot
                const requete = await sequelize.query(
                    'SELECT * FROM asb_campaign_epilot WHERE ((campaign_start_date BETWEEN ? AND ?) OR (campaign_end_date BETWEEN ? AND ?)) AND format_name = ? ORDER BY asb_campaign_epilot.format_name ASC', {
                        replacements: [date_start, date_end, date_start, date_end, format],
                        type: QueryTypes.SELECT
                    }
                );

                    console.log(requete)

                //Initialisation du tableau

                var array_reserver = [];



                for (let i = 0; i < requete.length; i++) {


                    // Calculer l'intervalle de date sur la période
                    const campaign_start_date = requete[i].campaign_start_date

                    const campaign_end_date = requete[i].campaign_end_date

                    const volumes_prevue = requete[i].volume_prevue

                    const campaign_date_start = campaign_start_date.split(' ')[0] + 'T00:00:00.000Z'

                    const campaign_date_end = campaign_end_date.split(' ')[0] + 'T23:59:00.000Z'

                    date_interval = new Date(campaign_end_date) - new Date(campaign_start_date);

                    const nb_jour_interval = (date_interval / 86400000)

                    // Calculer le nombre de jour à cheval en fonction des dates du forecast
                    const date_start_forecast = date_start
                    const date_end_forecast = date_end




                    if ((campaign_date_end > date_start_forecast)) {

                        //si le date début forecast (09/10/2020)< date début campagne (12/10/2020)
                        if (date_start_forecast < campaign_date_start) {

                            //alors la date début à cheval = date de début campagne 
                            var date_start_cheval = campaign_date_start

                        } else {

                            var date_start_cheval = date_start_forecast

                        }

                        // si la date fin forecats (19/10/2020)> date de fin de la campagne (12/10/2020)
                        if (date_end_forecast > campaign_date_end) {

                            //alors le date de fin a cheval = date de fin campagne 
                            var date_end_cheval = campaign_date_end

                        } else {

                            var date_end_cheval = date_end_forecast

                        }
                    }


                    const periode_a_cheval = new Date(date_end_cheval) - new Date(date_start_cheval);

                    const nb_jour_cheval = Math.round(periode_a_cheval / 86400000)

                    const volumes_prevu_diffuse = Math.round((volumes_prevue / nb_jour_interval) * nb_jour_cheval)

                    //Exclure des campagnes confirmées ou réservées qui sont égales ou inf. à la date de début du forecast
                    //Exclure des campagnes confirmées ou réservées qui sont sup. ou égales à la date de fin du forecast



                    if (requete[i].etat == "2") {

                        if ((campaign_date_start <= date_start_forecast) || (campaign_date_end >= date_end_forecast) || (campaign_date_start > date_start_forecast) || (campaign_date_end < date_end_forecast)) {

                            array_reserver.push(0);


                        } else {

                            array_reserver.push(volumes_prevu_diffuse);

                        }

                    }


                }


                var sommeReserver = 0



                for (let i = 0; i < array_reserver.length; i++) {
                    if (array_reserver[i] != '') {

                        sommeReserver += parseInt(array_reserver[i])
                    }
                }




                var reserver_reel = volumeDispo - sommeReserver;

                if (reserver_reel == volumeDispo || sommeReserver == 0) {
                    reserver_reel = 0;
                    sommeReserver = 0
                }

                sommeImpressions = new Number(sommeImpressions).toLocaleString("fi-FI");
                sommeOccupied = new Number(sommeOccupied).toLocaleString("fi-FI");
                volumeDispo = new Number(volumeDispo).toLocaleString("fi-FI");

                var table = {

                    sommeImpressions,
                    sommeOccupied,
                    volumeDispo,
                    option,
                }


                var reserver = {
                    //RESERVER//
                    sommeReserver,
                    reserver_reel,

                }

                var insertions = {

                    date_start,
                    date_end,
                    format,

                }

            

                return res.render('forecast/users/data_user.ejs', {
                    table: table,
                    insertions: insertions,
                    reserver: reserver
                });


            }
        }

    } catch (error) {
        console.log(error)
    }
}



/*
exports.campaign_epilot = async (req, res, next) => {

    var campaign_name = req.body.campaign_name
    var format_name = req.body.format
    var etat = req.body.etat
    var campaign_start_date = req.body.campaign_start_date;
    var campaign_end_date = req.body.campaign_end_date
    var volume_prevue = req.body.volume_prevue

    //console.log(req.body)


    var campaign_debut = campaign_start_date + 'T00:00:00.000Z'
    var campaign_fin = campaign_end_date + 'T00:00:00.000Z'


    try {

        if (campaign_debut > campaign_fin || campaign_fin < campaign_debut)

        {
            return res.send("La date debut et fin est invalide")
        } else {

            var campagne_search = await ModelCampaign_epilot.findOne({
                attributes: ['campaign_name', 'format_name', 'campaign_start_date', 'campaign_end_date'],
                where: {
                    campaign_name: campaign_name,
                    format_name: format_name,
                    campaign_start_date: campaign_debut,
                    campaign_end_date: campaign_fin
                }

            })

        }


        if (!campagne_search) {

            ModelCampaign_epilot.create({
                    campaign_name: campaign_name,
                    format_name: format_name,
                    etat: etat,
                    campaign_start_date: campaign_debut,
                    campaign_end_date: campaign_fin,
                    volume_prevue: volume_prevue

                })
                .then(campagne => {
                    return res.send("OK: le campagne est ajouté à la bdd")
                })

        } else {
            return res.send("la données exsite, verifier que le nom de campagne, le formar, la date de debut et fin ne soit pas identique")
        }





    } catch (error) {
        console.log(error)
    }

}*/