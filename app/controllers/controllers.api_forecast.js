// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');
//parse fichier csv

//const asyncly = require('async');


// Initiliase le module axios
const axios = require(`axios`);
const {
    check,
    query
} = require('express-validator');

// require csvtojson module


// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');

// Initialise les models


const ModelSite = require("../models/models.site");
const ModelFormat = require("../models/models.format");
const ModelCountry = require("../models/models.country")
const ModelCampaign_epilot = require("../models/models.country")

const {
    Op
} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

exports.index = async (req, res) => {



    try {

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

        var sites = await ModelSite.findAll({
            attributes: ['site_id', 'site_name'],
            order: [
                ['site_name', 'ASC']
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
        res.render('forecast/form.ejs', {
            formats: formats,
            sites: sites,
            countrys: countrys
        });

    } catch (err) {
        res.status(500).json({
            'error': 'cannot fetch country'
        });
    }

};



exports.forecast = async (req, res, next) => {

    // Définition des variables
    var headerlocation, table, requestForecast;
    var date_start = req.body.date_start;
    var date_end = req.body.date_end;
    var format = req.body.format;
    var sites = req.body.sites;
    var countries = req.body.countries;
    const formatIdsArray = [];
    const dataArrayFromReq = [];
    console.log(req.body)
    try {

         date_start = date_start + 'T00:00:00.000Z'
         date_end = date_end + 'T23:59:00.000Z'
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
            for (let m = 0; m < sites.length; m++) {

                // Construction de la requete vers l'api dans le format intertistiel
                requestForecast = {
                    "startDate": date_start,
                    "endDate": date_end,
                    "timeZoneId": "Arabian Standard Time",
                    "filter": [{
                            "CountryID": [countries]
                        },
                        {
                            "SiteID": [sites[m]]
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

                // On fait les 3 steps pour récupérer l'informations du csv puis on push dans un tableau
                let firstReq = await AxiosFunction.getForecastData('POST', '', requestForecast);

                if (firstReq.headers.location) {
                    headerlocation = firstReq.headers.location;
                    let secondReq = await AxiosFunction.getForecastData('GET', headerlocation);

                    if (secondReq.data.progress == '100') {
                        headerlocation = secondReq.headers.location;
                        let csvLinkReq = await AxiosFunction.getForecastData('GET', headerlocation);
                        dataArrayFromReq.push(csvLinkReq.data);
                    }
                }
            }

            // Contient les données formatter pour l'affichage
            table = await AxiosFunction.dataFormatingForForecast(dataArrayFromReq);


            return res.render('forecast/data.ejs', {
                table: table
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
            "fields": ["TotalImpressions", "OccupiedImpressions", "SiteID", "SiteName", "FormatID", "FormatName", "AvailableImpressions"]
        };


        // si le format habillage est choisi on ajoute App_man_atf0
        if (format === "HABILLAGE") {
            requestForecast.filter[2] = {
                "FormatID": ["79637", "44149"]
            }
        }

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

                const volumeDispo = sommeImpressions - sommeOccupied;



                //Requête sql campagne epilot
                const requete = await sequelize.query(
                    'SELECT * FROM asb_campaign_epilot WHERE ((campaign_start_date BETWEEN ? AND ?) OR (campaign_end_date BETWEEN ? AND ?)) AND format_name = ? ORDER BY asb_campaign_epilot.format_name ASC', {
                        replacements: [date_start, date_end, date_start, date_end, format],
                        type: QueryTypes.SELECT
                    }
                );

             //   const volumes_prevue1 = requete[i].volume_prevue

                // Récupére les résultats de la requete
                //   console.log(requete)



                //Initialisation du tableau
                var array_confirmer = [];
                var array_reserver = [];
                var Campagnes_confirmer = []
                var Campagne_start = []
                var Campagne_end = []
                var Interval__confirmer = []
                var Date_start_cheval_confirmer = []
                var Date_end_cheval_confirmer = []
                var Nbr_cheval__confirmer = []
                var Volume_confirmer = []


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
                            date_start_cheval = campaign_date_start

                        } else {

                            date_start_cheval = date_start_forecast

                        }

                        // si la date fin forecats (19/10/2020)> date de fin de la campagne (12/10/2020)
                        if (date_end_forecast > campaign_date_end) {

                            //alors le date de fin a cheval = date de fin campagne 
                            date_end_cheval = campaign_date_end

                        } else {

                            date_end_cheval = date_end_forecast

                        }
                    }

                    //calcul du nombre de jour à cheval

                    const periode_a_cheval = new Date(date_end_cheval) - new Date(date_start_cheval);
                    //arrondie pour un nombre entier
                    const nb_jour_cheval = Math.round(periode_a_cheval / 86400000)


                    //   Calcul le volume prévu diffusé : Valeur du ( volume prevu / nombre de jour de diff de la campagne ) * nombre de jour a cheval = volume

                    const volumes_prevu_diffuse = Math.round((volumes_prevue / nb_jour_interval) * nb_jour_cheval)
                    // console.log('Total de volume prévu diffuser= ' + volumes_prevu_diffuse)


                    // console.log('*******************')



                    if (requete[i].etat == "1") {

                        array_confirmer.push(volumes_prevu_diffuse);

                        Campagnes_confirmer.push(requete[i].campaign_name)

                        Interval__confirmer.push(nb_jour_interval)

                        Campagne_start.push(campaign_start_date)
                        Campagne_end.push(campaign_end_date)

                        Date_start_cheval_confirmer.push(date_start_cheval)
                        Date_end_cheval_confirmer.push(date_end_cheval)
                        Nbr_cheval__confirmer.push(nb_jour_cheval)

                        Volume_confirmer.push(requete[i].volume_prevue)



                    }
                    if (requete[i].etat == "2") {

                        array_reserver.push(volumes_prevu_diffuse);
                    }


                }

console.log(array_confirmer)


                var sommeConfirmer = 0
                var sommeReserver = 0

                for (let i = 0; i < array_confirmer.length; i++) {
                    if (array_confirmer[i] != '') {
                        sommeConfirmer += parseInt(array_confirmer[i])


                    }
                }

                for (let i = 0; i < array_reserver.length; i++) {
                    if (array_reserver[i] != '') {

                        sommeReserver += parseInt(array_reserver[i])
                    }
                }

                //  console.log('nbr line tab reserver' + array_reserver.length)

                // console.log('tab reserver' + array_reserver)



                //total tab confirmé 
                //console.log(sommeConfirmer)

                // Calcule du volume dispo confirmer 
                const confirme_reel = volumeDispo - sommeConfirmer;
                // console.log('total confirmer' + confirme_reel)

                //total tab reserver

                //total tab reserver 
                // console.log(sommeReserver)

                // Calcule du volume dispo reserer  
                const reserver_reel = volumeDispo - sommeReserver;
                // console.log('total reserver' + reserver_reel)


                //  console.log('volume dispo forecats' + volumeDispo)



                var table = {
                    date_start,
                    date_end,
                    TotalImpressions,
                    OccupiedImpressions,
                    SiteID,
                    SiteName,
                    FormatID,
                    FormatName,
                    sommeImpressions,
                    sommeOccupied,
                    volumeDispo,

                    //CONFIRMER//
                    array_confirmer,
                    sommeConfirmer,
                    confirme_reel,
                    Campagnes_confirmer,
                    Campagne_start,
                    Campagne_end,
                    Interval__confirmer,
                    Date_start_cheval_confirmer,
                    Date_end_cheval_confirmer,
                    Nbr_cheval__confirmer,
                    Volume_confirmer,


                    //RESERVER//
                    array_reserver,
                    sommeReserver,
                    reserver_reel,

                }

                return res.render('forecast/data.ejs', {
                    table: table
                });

            }
        }


    } catch (error) {
        console.log(error)
    }
}



exports.epilot = async (req, res, next) => {
    try {

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


        res.render('forecast/form_epilot.ejs', {
            formats: formats,

        });

    } catch (err) {
        res.status(500).json({
            'error': 'cannot fetch country'
        });
    }

}



exports.campaign_epilot = async (req, res, next) => {


    const campaign_name = req.body.campaign_name
    const format_name = req.body.format
    const etat = req.body.etat
    const campaign_start_date = req.body.campaign_start_date;
    const campaign_end_date = req.body.campaign_end_date
    const volume_prevue = req.body.volume_prevue

    console.log(req.body)

    try {


        var test = await ModelCampaign_epilot.create({
            campaign_name: campaign_name,
            format_name: format_name,
            etat: etat,
            campaign_start_date: campaign_start_date,
            campaign_end_date: campaign_end_date,
            volume_prevue: volume_prevue

        }).then(res.send("Add entité"))
        console.log(test)

    } catch (error) {
        console.log(error)
    }

}