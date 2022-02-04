const {
    Op,
    and
} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});
var crypto = require('crypto');

const {
    QueryTypes
} = require('sequelize');
const moment = require('moment');
moment.locale('fr');
const path = require('path');
const {
    check,
    query
} = require('express-validator');
const fs = require('fs');

// Module ExcelJS
const ExcelJS = require('exceljs');
const excel = require('node-excel-export');

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const SmartFunction = require("../functions/functions.smartadserver.api");
const Utilities = require('../functions/functions.utilities');

// Initialise les models
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelFormats = require("../models/models.formats");
const ModelSites = require("../models/models.sites");
const ModelCampaignsTv = require("../models/models.campaigns_tv")
const ModelAdvertisersTV = require("../models/models.advertisers_tv")

var LocalStorage = require('node-localstorage').LocalStorage;
localStorageTV = new LocalStorage('data/tv/reporting');

exports.list = async (req, res) => {
    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'insertions'
        }, {
            'name': 'Liste des planmedia',
            'link': '/manager/campaigns/tv/list'
        }, {
            'name': 'Ajouter un planmedia',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        var dirDateNOW = moment().format('YYYY/MM/DD');
        data.moment = moment;

        // Créer un dossier si celui-ci n'existe pas
        fs.mkdir('data/tv/' + dirDateNOW + '/', {
            recursive: true

        }, (err) => {
            if (err)
                throw err;
        });

        // // Récupére l'ensemble des annonceurs
        await ModelCampaignsTv
            .findAll({
                order: [
                    ['campaign_tv_name', 'ASC']
                ],
                include: [{
                    model: ModelAdvertisersTV
                }]
            })
            .then(async function (campaignsTv) {
                data.campaignsTv = campaignsTv;
            });

     //   console.log(data.campaignsTv)

        res.render('manager/campaigns-tv/create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.edit = async (req, res) => {

    var campaign_tv_id = req.params.campaigntv
    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'insertions'
        }, {
            'name': 'Liste des campagnes TV',
            'link': '/manager/campaigns/tv/list'
        }, {
            'name': 'Ajouter une campagne',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        var dirDateNOW = moment().format('YYYY/MM/DD');
        data.moment = moment;

        // // Récupére l'annonceur
        await ModelCampaignsTv
            .findOne({
                where: {
                    campaign_tv_id: campaign_tv_id
                },
                include: [{
                    model: ModelAdvertisersTV
                }]
            })
            .then(async function (campaignsTv) {
                data.campaignsTv = campaignsTv;
            });

        console.log(data.campaignsTv)

        res.render('manager/campaigns-tv/edit.ejs', data);

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.update = async (req, res) => {

    const campaign_tv_id = req.params.campaigntv

    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'insertions'
        }, {
            'name': 'Liste des campagnes TV',
            'link': '/manager/campaigns/tv/list'
        }, {
            'name': 'Modifier une campagne',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

       // const campaign_tv_name = req.body.campaign_tv_name;
        const file = req.files.planmedia_file;

        console.log(req.files)
        console.log(req.body)

        data.moment = moment;

        // // Récupére l'ensemble des annonceurs
        await ModelCampaignsTv
            .findOne({
                where: {
                    campaign_tv_id: campaign_tv_id
                },
                include: [{
                    model: ModelAdvertisersTV
                }]
            })
            .then(async function (campaignsTv) {

                var dirDateNOW = moment().format('YYYY/MM/DD');

                if ((file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/octet-stream') || (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {

                    var dirDateNOW = moment().format('YYYY/MM/DD');

                    // Déplace le fichier de l'upload vers le dossier
                    file.mv('data/tv/' + dirDateNOW + '/' + file.name, async err => {
                        if (err) {
                            req.session.message = {
                                type: 'danger',
                                intro: 'Erreur',
                                message: 'Un problème est survenu lors de la création du dossier'
                            }
                            return res.redirect('/manager/campaigns/tv/list');

                        }

                        var path_file = 'data/tv/' + dirDateNOW + '/' + file.name
                        console.log(path_file)

                        await ModelCampaignsTv.update({
                            campaign_tv_file: path_file
                        }, {
                            where: {
                                campaign_tv_id: campaign_tv_id
                            }
                        }).then(async function () {

                            // Suppression du fichier local storage associé à l'ID de la campagne ??
                            let cacheStorageID = 'campaign_tv_ID-' + campaignsTv.campaign_tv_id;
                            LocalStorageTVDATA = localStorageTV.removeItem(cacheStorageID);
                            // Création du nouveau fichier local storage associé à l'ID  avec nouvelle url

                            file.mv('data/tv/' + dirDateNOW + '/' + file.name, err => {
                                if (err) {
                                    req.session.message = {
                                        type: 'danger',
                                        intro: 'Erreur',
                                        message: 'Un problème est survenu lors de la création du dossier'
                                    }
                                    return res.redirect('/manager/campaigns/tv/list');

                                }

                                const alpha = Array.from(Array(26)).map((e, i) => i + 65);
                                const alphabet = alpha.map((x) => String.fromCharCode(x));
                                console.log(alphabet);

                                var path_file = 'data/tv/' + dirDateNOW + '/' + file.name
                                console.log(path_file)

                                var fileXLS = path_file;

                                var workbook = new ExcelJS.Workbook();
                                workbook
                                    .xlsx
                                    .readFile(fileXLS)
                                    .then(function () {
                                        cacheStorageID = path.basename(fileXLS, '.xlsx');

                                        const campaignObjects = new Object();

                                        // Note: workbook.worksheets.forEach will still work but this is better
                                        workbook.eachSheet(async function (worksheet, sheetId) {
                                            const regexEnsemble = /Ensemble/gi;

                                            // Récupére le nom de la feuille
                                            var worksheetName = worksheet.name;

                                            // Récupére la feuille Ensemble 
                                            if (worksheetName.match(regexEnsemble)) {

                                                const campaignName = worksheet.getCell('C3').value;
                                                const campaignPeriod = worksheet.getCell('C4').value;
                                                const campaignUser = worksheet.getCell('C5').value;
                                                const campaignCurrency = worksheet.getCell('C7').value;
                                                const campaignBudget = worksheet.getCell('C8').value;
                                                const campaignWeightedNumber = worksheet.getCell('C9').value;

                                                const campaignAdvertiser = worksheet.getCell('H3').value;
                                                const campaignFormat = worksheet.getCell('H6').value;

                                                campaignObjects[worksheetName] = {
                                                    'campaignName': campaignName,
                                                    'campaignPeriod': campaignPeriod,
                                                    'campaignCurrency': campaignCurrency,
                                                    'campaignBudget': campaignBudget,
                                                    'campaignWeightedNumber': campaignWeightedNumber,
                                                    'campaignAdvertiser': campaignAdvertiser,
                                                    'campaignFormat': campaignFormat
                                                }

                                               /* console.log('Campagne : ', campaignName);
                                                console.log('Période : ', campaignPeriod);
                                                console.log('Monnaie : ', campaignCurrency);
                                                console.log('Budget : ', campaignBudget);
                                                console.log('Effectif pondéré : ', campaignWeightedNumber);
                                                console.log('Annonceur : ', campaignAdvertiser);
                                                console.log('Formats : ', campaignFormat);
                                                console.log('------------------------------------------');*/

                                                // Initialisation des tableaux
                                                dataLines = new Array();
                                                dataLinesName = new Object();
                                                dataItemsLinesSelect = new Array();

                                                // Itérer sur toutes les lignes qui ont des valeurs dans une feuille de calcul.
                                                // Etape 1 : On récupére les lignes débutant chaque tableau
                                                worksheet.eachRow(function (row, rowNumber) {
                                                    // Récupére la ligne
                                                    dataRow = row.values;
                                                    // Mets la ligne dans un tableau
                                                    dataLines.push(row.values);
                                                    // Retourne le nombre de colonne
                                                    numberCols = dataRow.length;

                                                    // Récupére le numéro de la ligne où se trouve : "Chaine" et le mets dans un tableau
                                                    if (dataRow[1] === "Chaîne") {
                                                        var channelLineBegin = rowNumber;
                                                        dataItemsLinesSelect['channelLineBegin'] = rowNumber;
                                                        // console.log('[x] Chaîne - Begin :' + channelLineBegin);
                                                    }

                                                    // Récupére le numéro de la ligne où se trouve : "Montée en charge / Jour" et le mets dans un tableau
                                                    if (dataRow[1] === "Montée en charge / Jour") {
                                                        var increaseInLoadPerDayLineBegin = rowNumber;
                                                        dataItemsLinesSelect['increaseInLoadPerDayLineBegin'] = rowNumber;
                                                        /* console.log(
                                                             '[x] Montée en charge / Jour - Begin :' + increaseInLoadPerDayLineBegin
                                                         );*/
                                                    }

                                                    // Récupére le numéro de la ligne où se trouve : "Journal tranches horaires" et le mets dans un tableau
                                                    if (dataRow[1] === "Journal tranches horaires") {
                                                        var timeSlotDiaryLineBegin = rowNumber;
                                                        dataItemsLinesSelect['timeSlotDiaryLineBegin'] = rowNumber;
                                                        /*  console.log(
                                                              '[x] Journal tranches horaires - End : ' + timeSlotDiaryLineBegin
                                                          );*/
                                                    }

                                                    // Récupére le numéro de la ligne où se trouve : "Jour nommé" et le mets dans un tableau
                                                    if (dataRow[1] === "Jour nommé") {
                                                        var nameDayLineBegin = rowNumber;
                                                        dataItemsLinesSelect['nameDayLineBegin'] = rowNumber;
                                                        //  console.log('[x] Jour nommé - Begin : ' + nameDayLineBegin);
                                                    }
                                                })

                                                // Etape 2 : Parcours le tableau 
                                                IncreaseILPDAArray = new Array();
                                                timeSlotDiaryArray = new Array();
                                                nameDayArray = new Array();
                                                worksheet.eachRow(function (row, rowNumber) {
                                                    // Récupére la ligne
                                                    dataRow = row.values;
                                                    // Mets la ligne dans un tableau
                                                    dataLines.push(row.values);
                                                    // Retourne le nombre de colonne
                                                    numberCols = dataRow.length;

                                                    // Récupére le 1er élément de la ligne
                                                    dataRowOne = dataRow[1];

                                                    // Listing des regex
                                                    const regexChannel = /Antenne Réunion/gi;
                                                    // Récupére les formats date                        
                                                    const regexIncreaseInLoadPerDay = /([0-9]{2}\/[0-9]{2}\/[0-9]{2})/gi;
                                                    // Récupére les tranches Horaires
                                                    const regexTimeSlotDiary = /([0-9]{2}h[0-9]{2}( || - )[0-9]{2}h[0-9]{2})/gi
                                                    // Récupére les Jours de la semaine
                                                    const regexNameDay = /(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)/gi;

                                                    const labels = worksheet.getRow((rowNumber - 1)).values;

                                                    // Récupération des données de la chaîne
                                                    if ((rowNumber > dataItemsLinesSelect['channelLineBegin']) && dataRowOne.match(regexChannel) && (numberCols > 2)) {
                                                        // Récupére les libellés
                                                        var ChannelArray = new Object();
                                                        for (i = 0; i < (numberCols - 1); i++) {
                                                            var cellKey = alphabet[i].concat(dataItemsLinesSelect['channelLineBegin']);
                                                            var cellValue = alphabet[i].concat(rowNumber);

                                                            var label = worksheet.getCell(cellKey).value;
                                                            var value = worksheet.getCell(cellValue).value;

                                                            if (label === 'GRP') {
                                                                var grp = worksheet.getCell(cellValue).value;
                                                                var value = grp.toFixed(2);
                                                            }

                                                            if (label === 'Répétition') {
                                                                var repetition = worksheet
                                                                    .getCell(cellValue)
                                                                    .value;
                                                                var value = repetition.toFixed(2);
                                                            }

                                                            if (label === 'Ct GRP') {
                                                                var ct_GRP = worksheet
                                                                    .getCell(cellValue)
                                                                    .value;
                                                                var value = ct_GRP.toFixed(2);
                                                            }

                                                            if (label === 'CPM contacts Net') {
                                                                var CPM_contacts_Brut = worksheet
                                                                    .getCell(cellValue)
                                                                    .value;
                                                                var value = CPM_contacts_Brut.toFixed(2);
                                                            }

                                                            ChannelArray[label] = value;
                                                        }

                                                        // Mets la chaine dans l'object campagne
                                                        campaignObjects[worksheetName].campaignChannel = ChannelArray;
                                                    }

                                                    // Récupération des données de la Montée en charge
                                                    if ((rowNumber > dataItemsLinesSelect['increaseInLoadPerDayLineBegin']) && dataRowOne.match(regexIncreaseInLoadPerDay) && (numberCols > 2)) {
                                                        // Récupére les libellés
                                                        var IncreaseInLoadPerDayObject = new Object();
                                                        for (i1 = 0; i1 < (numberCols - 1); i1++) {
                                                            var cellKey = alphabet[i1].concat(dataItemsLinesSelect['increaseInLoadPerDayLineBegin']);
                                                            var cellValue = alphabet[i1].concat(rowNumber);

                                                            var label = worksheet.getCell(cellKey).value;
                                                            var value = worksheet.getCell(cellValue).value;
                                                            console.log('col : ', i1, ' -> ', cellValue, ' = ', worksheet.getCell(cellKey).value, ' => ', worksheet.getCell(cellValue).value);
                                                            IncreaseInLoadPerDayObject[label] = value;
                                                        }

                                                        IncreaseILPDAArray.push(IncreaseInLoadPerDayObject);

                                                        // Mets des données de la Montée en charge l'object campagne
                                                        campaignObjects[worksheetName].campaignIncreaseInLoadPerDay = IncreaseILPDAArray;
                                                    }

                                                    // Récupération des données des tranches horaires
                                                    if ((rowNumber > dataItemsLinesSelect['timeSlotDiaryLineBegin']) && dataRowOne.match(regexTimeSlotDiary) && (numberCols > 2)) {
                                                        // Récupére les libellés
                                                        var timeSlotDiaryObject = new Object();
                                                        for (i2 = 0; i2 < (numberCols - 1); i2++) {
                                                            var cellKey = alphabet[i2].concat(dataItemsLinesSelect['timeSlotDiaryLineBegin']);
                                                            var cellValue = alphabet[i2].concat(rowNumber);

                                                            var label = worksheet.getCell(cellKey).value;
                                                            var value = worksheet.getCell(cellValue).value;
                                                            console.log('col : ', i2, ' -> ', cellValue, ' = ', worksheet.getCell(cellKey).value, ' => ', worksheet.getCell(cellValue).value);
                                                            timeSlotDiaryObject[label] = value;
                                                        }

                                                        //console.log(IncreaseInLoadPerDayArray);
                                                        timeSlotDiaryArray.push(timeSlotDiaryObject);

                                                        // Mets des données des données des tranches horaires
                                                        campaignObjects[worksheetName].campaigntimeSlotDiary = timeSlotDiaryArray;


                                                    }

                                                    // Récupération des données des jours de la semaine
                                                    if ((rowNumber > dataItemsLinesSelect['nameDayLineBegin']) && dataRowOne.match(regexNameDay) && (numberCols > 2)) {
                                                        // Récupére les libellés
                                                        var nameDayObject = new Object();
                                                        for (i3 = 0; i3 < (numberCols - 1); i3++) {
                                                            // Récup data
                                                            var cellKey = alphabet[i3].concat(dataItemsLinesSelect['nameDayLineBegin']);
                                                            var cellValue = alphabet[i3].concat(rowNumber);

                                                            var label = worksheet.getCell(cellKey).value;
                                                            var value = worksheet.getCell(cellValue).value;
                                                            console.log('col : ', i3, ' -> ', cellValue, ' = ', worksheet.getCell(cellKey).value, ' => ', worksheet.getCell(cellValue).value);
                                                            nameDayObject[label] = value;

                                                            if (label === 'Répétition') {
                                                                var repetition = worksheet
                                                                    .getCell(cellValue)
                                                                    .value;
                                                                var value = repetition.toFixed(2);
                                                            }

                                                        }

                                                        nameDayArray.push(nameDayObject);

                                                        // Mets es données des données des tranches horaires
                                                        campaignObjects[worksheetName].campaignNameDay = nameDayArray;


                                                    }

                                                })

                                                var regexnPeriod = /([0-9]{2}\/[0-9]{2}\/[0-9]{4})/gi
                                                var regexnBudget = /([0-9])/gi
        
                                                var PeriodCampaign = campaignPeriod.match(regexnPeriod)
                                                var PeriodBudget = campaignBudget.match(regexnBudget)
        
                                                var campaign_tv_start_date = moment(PeriodCampaign[0], 'DD-MM-YYYY');
                                                var campaign_tv_end_date = moment(PeriodCampaign[1], 'DD-MM-YYYY');
                                                const Budget = PeriodBudget.join('')

                                                await ModelCampaignsTv.update({
                                                    campaign_tv_name: campaignName,
                                                    campaign_tv_start_date: moment(campaign_tv_start_date).format('YYYY-MM-DD'),
                                                    campaign_tv_end_date: moment(campaign_tv_end_date).format('YYYY-MM-DD'),
                                                    campaign_tv_user: campaignUser,
                                                    campaign_tv_budget: Budget,
                                                }, {
                                                    where: {
                                                        campaign_tv_id: campaign_tv_id
                                                    }
                                                }).then(async function () {

                                                localStorageTV.setItem('campaign_tv_ID-' + campaignsTv.campaign_tv_id, JSON.stringify(campaignObjects));
                                                return res.redirect(`/t/${campaignsTv.campaign_tv_crypt}`);
                                                })



                                            }

                                        });

                                    });
                            });

                        })
                    })

                }

            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}
exports.view = async (req, res) => {
    try {
        const data = new Object();

        var campaigntv = req.params.campaigntv;
        var campaign = await ModelCampaignsTv
            .findOne({
                where: {
                    campaign_tv_id: campaigntv
                },
                include: [{
                    model: ModelAdvertisersTV
                }]
            })
            .then(async function (campaign) {
           //    console.log(campaign)
                if (!campaign) {
                   return res
                        .status(404)
                        .render("error.ejs", {
                            statusCoded: 404
                        });
                }
            
                // Créer le fil d'ariane
                var breadcrumbLink = 'advertisers'
                breadcrumb = new Array({
                    'name': 'Campagnes',
                    'link': 'campaigns'
                }, {
                    'name': campaign.advertisers_tv.advertiser_tv_name,
                    'link': breadcrumbLink.concat('/', campaign.advertisers_tv)
                }, {
                    'name': campaign.campaign_tv_name,
                    'link': ''
                });
                data.breadcrumb = breadcrumb;
  
                      

               

                // Attribue les données de la campagne
                data.campaign = campaign;
                data.moment = moment;
                data.utilities = Utilities;

          

                res.render('manager/campaigns-tv/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.export = async (req, res) => {
    try {

        var type = 'campaigns_tv'
        // crée label avec le date du jour ex : 20210403
        const date = new Date();
        const JJ = ('0' + (
            date.getDate()
        )).slice(-2);

        const MM = ('0' + (
            date.getMonth()
        )).slice(-2);
        const AAAA = date.getFullYear();

        const label_now = AAAA + MM + JJ

        const data = new Object();
        data.moment = moment;
        data.utilities = Utilities;

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Liste les campagnes TV',
            'link': 'campaigns/tv'
        });
        data.breadcrumb = breadcrumb;

        // Récupére l'ensemble des annonceurs
        data.campaigns = await ModelCampaignsTv
            .findAll({
                order: [
                    ['campaign_tv_name', 'ASC']
                ],
                include: [{
                    model: ModelAdvertisersTV
                }]
            })

        const styles = {
            headerDark: {
                fill: {
                    fgColor: {
                        rgb: 'FF000000'
                    }

                },

                font: {
                    color: {
                        rgb: 'FFFFFFFF'
                    },
                    sz: 14,
                    bold: false,
                    underline: false
                }
            },
            cellNone: {

                numFmt: "0",

            },

            cellTc: {
                numFmt: "0",

            }
        };

        const heading = [
            [],
        ];

        const bilan_global = {

            id: { // <- the key should match the actual data key
                displayName: '#', // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                width: 100, // <- width in pixels
                cellStyle: styles.cellNone,
            },

            campagnes: {
                displayName: 'NOMS',
                headerStyle: styles.headerDark,
                width: 450, // <- width in chars (when the number is passed as string)
                cellStyle: styles.cellNone,

            },
            campaign_tv_crypt: {
                displayName: 'ID CRYPTAGE',
                headerStyle: styles.headerDark,
                width: 450, // <- width in chars (when the number is passed as string)
                cellStyle: styles.cellNone,

            },
            advertisers_tv: {
                displayName: 'ANNONCEURS',
                headerStyle: styles.headerDark,
                width: 450, // <- width in chars (when the number is passed as string)
                cellStyle: styles.cellNone,

            },
            date_start: {
                displayName: 'DATE DE DEBUT',
                headerStyle: styles.headerDark,
                width: 200, // <- width in pixels
                cellStyle: styles.cellNone,

            },
            date_end: {
                displayName: 'DATE DE FIN',
                headerStyle: styles.headerDark,
                width: 200, // <- width in pixels
                cellStyle: styles.cellNone,

            },
            campaign_tv_user: {
                displayName: 'UTILISATEURS',
                headerStyle: styles.headerDark,
                width: 200, // <- width in pixels
                cellStyle: styles.cellNone,

            },
            campaign_tv_type: {
                displayName: 'LES CIBLES',
                headerStyle: styles.headerDark,
                width: 200, // <- width in pixels
                cellStyle: styles.cellNone,

            },
            budget: {
                displayName: 'BUDGET',
                headerStyle: styles.headerDark,
                width: 100, // <- width in pixels
                cellStyle: styles.cellNone,

            },

            campaign_tv_file: {
                displayName: 'URLS FICHIERS',
                headerStyle: styles.headerDark,
                width: 300, // <- width in pixels
                cellStyle: styles.cellNone,

            },
        };

        const dataset_global = []

        if (!Utilities.empty(data)) {
            for (i = 0; i < data.campaigns.length; i++) {

                dataset_global.push({
                    id: data.campaigns[i].campaign_tv_id,
                    campagnes: data.campaigns[i].campaign_tv_name,
                    campaign_tv_crypt: data.campaigns[i].campaign_tv_crypt,
                    advertisers_tv: data.campaigns[i].advertisers_tv.advertiser_tv_name,
                    date_start: data.campaigns[i].campaign_tv_start_date,
                    date_end: data.campaigns[i].campaign_tv_end_date,
                    campaign_tv_user: data.campaigns[i].campaign_tv_user,
                    campaign_tv_type: data.campaigns[i].campaign_tv_type,
                    budget: data.campaigns[i].campaign_tv_budget,
                    campaign_tv_file: data.campaigns[i].campaign_tv_file,

                });

            }
        }

        const merges = [{
            start: {
                row: 1,
                column: 1
            },
            end: {
                row: 1,
                column: 5
            }
        }];

        // Create the excel report. This function will return Buffer
        const report = excel.buildExport([{ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
            name: 'Listes', // <- Specify sheet name (optional)
            heading: heading, // <- Raw heading array (optional)
            merges: merges, // <- Merge cell ranges
            specification: bilan_global, // <- Report specification
            data: dataset_global // <-- Report data
        }]);

        // You can then return this straight
        // rapport_antennesb-202105031152-ESPACE_DECO-67590.xls
        res.attachment(
            'exports-' + type + '-' + label_now + '.xlsx',

        ); // This is sails.js specific (in general you need to set headers)

        return res.send(report);

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}