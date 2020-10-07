// Récupére les données de configuration de l`API
const dbApi = require("../config/config.api");
// Initialise le module request
const request = require('request');
// Initialise le module
const bodyParser = require('body-parser');
let csvToJson = require('convert-csv-to-json');
//parse fichier csv

//const asyncly = require('async');

const fileGetContents = require('file-get-contents');
0

// Initiliase le module axios
const axios = require(`axios`);
const {
    check,
    query
} = require('express-validator');

// require csvtojson module


// Charge l'ensemble des functions de l'API
let AxiosFunction = require('../functions/functions.axios');

// Initialise les models
const db = require("../models/index");
const {
    format
} = require("../models/index");
const ModelCampaign = db.campaign;
const ModelCampaignStatus = db.campaignstatus;
const ModelAdvertiser = db.advertiser;
const ModelInsertion = db.insertion;
const ModelSite = db.site;
const ModelFormat = db.format;
const ModelCountry = db.country
const {
    Op
} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

exports.index =  (req, res) => {




        var formats =  ModelFormat.findAll({
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

        var sites =  ModelSite.findAll({
            attributes: ['site_id', 'site_name'],
            order: [
                ['site_name', 'ASC']
            ],
        })
        var countrys =  ModelCountry.findAll({
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

    try {

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

                var volumeDispo = sommeImpressions - sommeOccupied;

                var table = {
                    TotalImpressions,
                    OccupiedImpressions,
                    SiteID,
                    SiteName,
                    FormatID,
                    FormatName,
                    sommeImpressions,
                    sommeOccupied,
                    volumeDispo
                }
                // console.log(table)

                return res.render('forecast/data.ejs', {
                    table: table

                });

            }
        }

        // if (firstLink.headers.location) {

        //     headerlocation = firstLink.headers.location;

        //     let secondLink = await AxiosFunction.getForecastData('GET', headerlocation);

        //     if (secondLink.data.progress == '100') {

        //         headerlocation = secondLink.headers.location;

        //         let csvLink = await AxiosFunction.getForecastData('GET', headerlocation);

        //         dataArrayFromReq.push(csvLink.data);
        //       //  console.log(csvLink)

        //     }

        // }
        //     table = await AxiosFunction.dataFormatingForForecast(dataArrayFromReq);
        //    // console.log('render',table)
        //     return res.render('forecast/data.ejs', {
        //         table: table
        //     });


    } catch (error) {
        console.log(error)
    }
}