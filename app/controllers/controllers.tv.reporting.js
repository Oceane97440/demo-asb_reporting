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
var nodeoutlook = require('nodejs-nodemailer-outlook');
const puppeteer = require('puppeteer')

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
const ModelUsers = require("../models/models.users")


var LocalStorage = require('node-localstorage').LocalStorage;
localStorageTV = new LocalStorage('data/tv/reporting');

exports.index = async (req, res) => {
    const file = req.files.planmedia_file;

    try {
        // Le fichier doit être un fichier excel ou csv
        if ((file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/octet-stream') || (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
            // Créer un dossier s'il n'existe pas (ex: public/uploads/epilot/2021/07/31)
            // dirDate + '/' +
            var dirDateNOW = moment().format('YYYY/MM/DD');

            // Déplace le fichier de l'upload vers le dossier
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
                // console.log(alphabet);

                var path_file = 'data/tv/' + dirDateNOW + '/' + file.name
                //  console.log(path_file)

                //  var fileXLS = 'data/tv/Campagne_Leclerc-Plan_Campagne-132748939578174030.xlsx';
                var fileXLS = path_file;

                var workbook = new ExcelJS.Workbook();
                workbook
                    .xlsx
                    // .readFile('data/tv/Campagne_Leclerc-Plan_Campagne-132748939578174030.xlsx')
                    .readFile(fileXLS)
                    .then(async function () {
                        cacheStorageID = path.basename(fileXLS, '.xlsx');

                        const campaignObjects = new Object();

                        // Note: workbook.worksheets.forEach will still work but this is better
                        workbook.eachSheet(async function (worksheet, sheetId) {
                            const regexEnsemble = /Ensemble/gi;

                            // Récupére le nom de la feuille
                            var worksheetName = worksheet.name;




                            if (worksheetName.match(/[a-zA ](-){1}(?!Paramétrage tarifaire\b)/gi)) {


                                const campaignName = worksheet.getCell('C3').value;
                                const campaignPeriod = worksheet.getCell('C4').value;
                                const campaignUser = worksheet.getCell('C5').value;
                                const campaignCurrency = worksheet.getCell('C7').value;
                             //  const campaignBudget = worksheet.getCell('C8').value;
                                const campaignBudget =Math.round(worksheet.getCell('H16').value);
                                const campaignWeightedNumber = worksheet.getCell('C9').value;
                                const campaignAdvertiser = worksheet.getCell('H3').value;
                                const campaignFormat = worksheet.getCell('H6').value;
                                const campaignTarget = worksheet.getCell('C11').value;



                                //recupère data cible filtrage du mot supprésion des accents et transforme en minuscule
                                const strip_tags = campaignTarget.normalize('NFD').replace(/[\u0300-\u036f  _$&+,:;=?@#|'<>.^*()%!-]/g, "")
                                const campaignLabel = strip_tags.toLowerCase();


                                campaignObjects[worksheetName] = {
                                    'campaignLabel': campaignLabel,
                                    'campaignTarget': campaignTarget,
                                    'campaignName': campaignName,
                                    'campaignPeriod': campaignPeriod,
                                    'campaignUser': campaignUser,
                                    'campaignCurrency': campaignCurrency,
                                    'campaignBudget': campaignBudget,
                                    'campaignWeightedNumber': campaignWeightedNumber,
                                    'campaignAdvertiser': campaignAdvertiser,
                                    'campaignFormat': campaignFormat
                                }


                               /* console.log('Campagne : ', campaignName);
                                 console.log('Label : ', campaignLabel);
                                 console.log('Cible : ', campaignTarget);
                                 console.log('Période : ', campaignPeriod);
                                 console.log('User : ', campaignUser);
                                 console.log('Monnaie : ', campaignCurrency);
                                 console.log('Budget : ', campaignBudget);
                                 console.log('Effectif pondéré : ', campaignWeightedNumber);
                                 console.log('Annonceur : ', campaignAdvertiser);
                                 console.log('Formats : ', campaignFormat);
                                 console.log('------------------------------------------')*/

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

                                    }

                                    // Récupére le numéro de la ligne où se trouve : "Journal tranches horaires" et le mets dans un tableau
                                    if (dataRow[1] === "Journal tranches horaires") {
                                        var timeSlotDiaryLineBegin = rowNumber;
                                        dataItemsLinesSelect['timeSlotDiaryLineBegin'] = rowNumber;

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
                                    // const regexTimeSlotDiary = /([0-9]{2}h[0-9]{2} [0-9]{2}h[0-9]{2})/gi;
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
                                              //  var value = ct_GRP.toFixed(2);

                                                var op =  campaignBudget / grp.toFixed(2)   
                                                //on calcule sur le bugget net / par le nombre de grp par cible
                                                var value = op.toFixed(2);
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
                                            // console.log('col : ', i1, ' -> ', cellValue, ' = ', worksheet.getCell(cellKey).value, ' => ', worksheet.getCell(cellValue).value);
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
                                            //console.log('col : ', i2, ' -> ', cellValue, ' = ', worksheet.getCell(cellKey).value, ' => ', worksheet.getCell(cellValue).value);
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
                                            // console.log('col : ', i3, ' -> ', cellValue, ' = ', worksheet.getCell(cellKey).value, ' => ', worksheet.getCell(cellValue).value);
                                            nameDayObject[label] = value;

                                            if (label === 'Répétition') {
                                                var repetition = worksheet
                                                    .getCell(cellValue)
                                                    .value;
                                                var value = repetition.toFixed(2);
                                            }

                                            // Récup Graph
                                        }

                                        //console.log(IncreaseInLoadPerDayArray);
                                        nameDayArray.push(nameDayObject);

                                        // Mets es données des données des tranches horaires
                                        campaignObjects[worksheetName].campaignNameDay = nameDayArray;


                                    }

                                })





                               // console.log(campaignObjects)



                            }

                        });


                        await ModelCampaignsTv.findOne({
                            attributes: [
                                'campaign_tv_id',
                                'campaign_tv_crypt',
                                'campaign_tv_file'

                            ],
                            where: {
                                campaign_tv_file: {
                                    [Op.like]: "%" + file.name + "%"
                                }
                            }

                        }).then(async function (foundcampaign_tv) {

                            if (Utilities.empty(foundcampaign_tv)) {

                                var regexnPeriod = /([0-9]{2}\/[0-9]{2}\/[0-9]{4})/gi
                                var regexnBudget = /([0-9])/gi

                                var PeriodCampaign = campaignObjects["a-Ensemble"].campaignPeriod.match(regexnPeriod)
                                //var PeriodBudget = campaignObjects["a-Ensemble"].campaignBudget.match(regexnBudget)

                                var campaign_tv_start_date = moment(PeriodCampaign[0], 'DD-MM-YYYY');
                                var campaign_tv_end_date = moment(PeriodCampaign[1], 'DD-MM-YYYY');
                                //const Budget = PeriodBudget.join('')

                               /* res.json({
									"campaign_tv_name": campaignObjects["a-Ensemble"].campaignName,
                                    "campaign_tv_start_date": moment(campaign_tv_start_date).format('YYYY-MM-DD'),
                                    "campaign_tv_end_date": moment(campaign_tv_end_date).format('YYYY-MM-DD'),
                                    "campaign_tv_user": campaignObjects["a-Ensemble"].campaignUser,
                                    "user_id": req.session.user.user_id,
                                    "campaign_tv_budget": campaignObjects["a-Ensemble"].campaignBudget,
                                    "campaign_tv_type": "a-Ensemble",
                                    "campaign_tv_file": path_file
									})

                                    process.exit()*/
                                await ModelCampaignsTv.create({
                                    campaign_tv_name: campaignObjects["a-Ensemble"].campaignName,
                                    campaign_tv_start_date: moment(campaign_tv_start_date).format('YYYY-MM-DD'),
                                    campaign_tv_end_date: moment(campaign_tv_end_date).format('YYYY-MM-DD'),
                                    campaign_tv_user: campaignObjects["a-Ensemble"].campaignUser,
                                    user_id: req.session.user.user_id,
                                    campaign_tv_budget: campaignObjects["a-Ensemble"].campaignBudget,
                                    campaign_tv_type: "a-Ensemble",
                                    campaign_tv_file: path_file

                                }).then(async function (campaign_tv) {

                                    const campaign_tv_id = await campaign_tv.campaign_tv_id

                                    let cacheStorageID = 'campaign_tv_ID-' + campaign_tv_id;
                                    localStorageTV.removeItem(cacheStorageID);
                                    localStorageTV.setItem(cacheStorageID, JSON.stringify(campaignObjects));

                                    const campaign_tv_crypt = crypto
                                        .createHash('md5')
                                        .update(campaign_tv_id.toString())
                                        .digest("hex");

                                    var foundAdvertiser = await ModelAdvertisersTV.findOne({
                                        where: {
                                            advertiser_tv_name: campaignObjects["a-Ensemble"].campaignAdvertiser
                                        }
                                    })

                                    if (Utilities.empty(foundAdvertiser)) {

                                        const advertiser = await ModelAdvertisersTV.create({
                                            advertiser_tv_name: campaignObjects["a-Ensemble"].campaignAdvertiser,
                                        })

                                        const advertiser_tv_id = advertiser.advertiser_tv_id

                                        await ModelCampaignsTv.update({
                                            campaign_tv_crypt: campaign_tv_crypt,
                                            advertiser_tv_id: advertiser_tv_id
                                        }, {
                                            where: {
                                                campaign_tv_id: campaign_tv_id
                                            }
                                        })

                                    } else {

                                        await ModelCampaignsTv.update({
                                            campaign_tv_crypt: campaign_tv_crypt,
                                            advertiser_tv_id: foundAdvertiser.advertiser_tv_id
                                        }, {
                                            where: {
                                                campaign_tv_id: campaign_tv_id
                                            }
                                        })
                                    }


                                    var founduser = await ModelUsers.findOne({
                                        where: {
                                            user_id: campaign_tv.user_id
                                        }
                                    })


                                    if (!Utilities.empty(founduser)) {

                                    const email = await founduser.user_email
                                    const user_firstname = await founduser.user_firstname
                                    const campaign_tv_name = await campaign_tv.campaign_tv_name

                                    nodeoutlook.sendEmail({

                                        auth: {
                                            user: "oceane.sautron@antennereunion.fr",
                                            pass: process.env.EMAIL_PASS
                                        },
                                        from: email,
                                        to: 'adtraffic@antennereunion.fr,oceane.sautron@antennereunion.fr',
                                        subject: 'Envoie du permalien de la campagne ' + campaign_tv_name,
                                        html: ' <head><style>font-family: Century Gothic;    font-size: large; </style></head>Bonjour ' +
                                            user_firstname + '<br><br>  Tu trouveras ci-dessous le permalien pour la campagne <b>"' +
                                            campaign_tv_name + '"</b> : <a traget="_blank" href="https://reporting.antennesb.fr/t/' +
                                            campaign_tv_crypt + '">https://reporting.antennesb.fr/t/' +
                                            campaign_tv_crypt + '</a> <br><br> À dispo pour échanger <br><br> <div style="font-size: 11pt;font-family: Calibri,sans-serif;"><img src="https://reporting.antennesb.fr/public/admin/photos/logo.png" width="79px" height="48px"><br><br><p><strong>L\'équipe Adtraffic</strong><br><small>Antenne Solutions Business<br><br> 2 rue Emile Hugot - Technopole de La Réunion<br> 97490 Sainte-Clotilde<br> Fixe : 0262 48 47 54<br> Fax : 0262 48 28 01 <br> Mobile : 0692 05 15 90<br> <a href="mailto:adtraffic@antennereunion.fr">adtraffic@antennereunion.fr</a></small></p></div>',

                                        onError: (e) => console.log(e),
                                        onSuccess: (i) => {
                                            return res.redirect(`/t/${campaign_tv_crypt}`)
                                        }

                                    })

                                    }



                                });
                            }

                            LocalStorageTVDATA = await localStorageTV.getItem('campaign_tv_ID-' + foundcampaign_tv.campaign_tv_id);

                            if (Utilities.empty(LocalStorageTVDATA)) {
                                localStorageTV.setItem('campaign_tv_ID-' + foundcampaign_tv.campaign_tv_id, JSON.stringify(campaignObjects));

                            }
                            return res.redirect(`/t/${foundcampaign_tv.campaign_tv_crypt}`);

                        })

                    });
            });

        } else {
            req.session.message = {
                type: 'danger',
                intro: 'L\'extension du fichier est invalide. ',
                message: 'Seul les fichiers Excel sont autorisés'
            }
            return res.redirect('/manager/campaigns/tv/list');
        }
    } catch (error) {
        console.log(error)
        var statusCoded = error.response;
        res.render("error.ejs", {
            statusCoded: statusCoded
        })

    }

}

exports.generate = async (req, res) => {

    let campaigncrypt = req.params.campaigncrypt;
    await ModelCampaignsTv
        .findOne({
            attributes: [
                'campaign_tv_id',
                'campaign_tv_crypt'
                // 'campaign_tv_name',
                // 'campaign_tv_crypt',
                // 'advertiser_tv_id',
                // 'campaign_tv_start_date',
                // 'campaign_tv_end_date',
                // 'campaign_tv_file'

            ],
            where: {
                campaign_tv_crypt: campaigncrypt
            }

        }).then(async function (campaign) {

            if (!campaign) {
                return res
                    .status(404)
                    .render("error.ejs", {
                        statusCoded: 404,
                        campaigncrypt: campaigncrypt
                    });

            }

            let cacheStorageID = 'campaign_tv_ID-' + campaign.campaign_tv_id;
            LocalStorageTVDATA = localStorageTV.getItem(cacheStorageID);

            var reportingData = JSON.parse(LocalStorageTVDATA);

            if (!LocalStorageTVDATA) {
                return res
                    .status(404)
                    .render("error.ejs", {
                        statusCoded: 404,
                        campaigncrypt: campaigncrypt
                    });
            }

            res.render('report-tv/template.ejs', {
                reporting: reportingData,
                campaign_crypt: campaigncrypt,
                moment: moment,
                utilities: Utilities
            });

        })
}

exports.export = async (req, res) => {

    let campaigncrypt = req.params.campaigncrypt;

    try {

        await ModelCampaignsTv
            .findOne({
                attributes: [
                    'campaign_tv_id',
                    'campaign_tv_crypt',
                    'campaign_tv_file'

                ],
                where: {
                    campaign_tv_crypt: campaigncrypt
                }

            }).then(async function (campaign) {

                if (!campaign) {
                    req.session.message = {
                        type: 'danger',
                        intro: 'Erreur',
                        message: "Un problème est survenu lors de l'export du fichier excel"
                    }
                    return res.redirect('/manager/campaigns/tv/list');

                }

                res.download('./' + campaign.campaign_tv_file)

            })
    } catch (error) {
        console.log(error)
        var statusCoded = error.response;
        res.render("error.ejs", {
            statusCoded: statusCoded,
            campaigncrypt: campaigncrypt
        })
    }

}

exports.charts = async (req, res) => {

    try {

        let campaigncrypt = req.params.campaigncrypt;
        await ModelCampaignsTv
            .findOne({
                attributes: [
                    'campaign_tv_id',
                    'campaign_tv_crypt'
                    // 'campaign_tv_name',
                    // 'campaign_tv_crypt',
                    // 'advertiser_tv_id',
                    // 'campaign_tv_start_date',
                    // 'campaign_tv_end_date',
                    // 'campaign_tv_file'

                ],
                where: {
                    campaign_tv_crypt: campaigncrypt
                }

            }).then(async function (campaign) {

                let cacheStorageID = 'campaign_tv_ID-' + campaign.campaign_tv_id;
                LocalStorageTVDATA = localStorageTV.getItem(cacheStorageID);

                var reportingData = JSON.parse(LocalStorageTVDATA);
                var data = new Object();



                for (const property in reportingData) {
                    var i = reportingData[property].campaignLabel

                    data[property] = {}

                    data[property]['id'] = reportingData[property].campaignLabel,

                        data[property]['cible'] = {
                            name: reportingData[property].campaignTarget,
                            data: reportingData[property].campaignChannel.Couverture
                        };


                    // TRANCHES HORAIRES
                    if (reportingData[property].campaigntimeSlotDiary) {
                        var campaigntimeSlotDiaryHourArray = new Array();
                        var campaigntimeSlotDiaryGRPArray = new Array();
                        timeSlotDiary = reportingData[property].campaigntimeSlotDiary;

                        for (i = 0; i < timeSlotDiary.length; i++) {
                            campaigntimeSlotDiaryHourArray.push(timeSlotDiary[i]['Journal tranches horaires']);

                            var grp = timeSlotDiary[i]['GRP'];
                            var grpValue = grp.toFixed(2);
                            campaigntimeSlotDiaryGRPArray.push(grpValue);
                        }

                        //  console.log(campaigntimeSlotDiaryGRPArray)

                        data[property]['campaigntimeSlotDiaryGRP'] = {
                            name: 'GRP',
                            data: campaigntimeSlotDiaryGRPArray
                        };
                        data[property]['campaigntimeSlotDiaryTrancheHoraires'] = {
                            name: "Tranche horaires",
                            data: campaigntimeSlotDiaryHourArray
                        };
                    }

                    //  console.log(reportingData[property].campaignIncreaseInLoadPerDay)

                    if (reportingData[property].campaignIncreaseInLoadPerDay) {
                        var campaignIncreaseInLoadPerDayJourArray = new Array();
                        var campaignIncreaseInLoadPerDayCouvertureArray = new Array();
                        var campaignIncreaseInLoadPerDayRepetitionArray = new Array();
                        campaignIncreaseInLoadPerDay = reportingData[property].campaignIncreaseInLoadPerDay;

                        for (i = 0; i < campaignIncreaseInLoadPerDay.length; i++) {
                            campaignIncreaseInLoadPerDayJourArray.push(campaignIncreaseInLoadPerDay[i]['Montée en charge / Jour']);
                            campaignIncreaseInLoadPerDayCouvertureArray.push(campaignIncreaseInLoadPerDay[i]['Couverture']);

                            var repetition = campaignIncreaseInLoadPerDay[i]['Répétition'];
                            var repetitionValue = repetition.toFixed(2);
                            campaignIncreaseInLoadPerDayRepetitionArray.push(repetitionValue);
                        }

                        data[property]['campaignIncreaseInLoadPerDayCouverture'] = {
                            name: 'Couverture',
                            data: campaignIncreaseInLoadPerDayCouvertureArray
                        };
                        data[property]['campaignIncreaseInLoadPerDayJour'] = {
                            name: "Jour",
                            data: campaignIncreaseInLoadPerDayJourArray
                        };
                        data[property]['campaignIncreaseInLoadPerDayRepetition'] = {
                            name: "Répétition",
                            data: campaignIncreaseInLoadPerDayRepetitionArray
                        };
                    }

                    if (reportingData[property].campaignNameDay) {
                        var campaignNameDayJourArray = new Array();
                        var campaignNameDayCouvertureArray = new Array();
                        var campaignNameDayRepetitionArray = new Array();
                        campaignNameDay = reportingData[property].campaignNameDay;

                        for (i = 0; i < campaignNameDay.length; i++) {
                            campaignNameDayJourArray.push(campaignNameDay[i]["Jour nommé"]);

                            var couverture = campaignNameDay[i]['GRP'];
                            var couvertureValue = couverture.toFixed(2);
                            campaignNameDayCouvertureArray.push(couvertureValue);

                            var repetition = campaignNameDay[i]['Répétition'];
                            var repetitionValue = repetition.toFixed(2);
                            campaignNameDayRepetitionArray.push(repetitionValue);
                        }

                        data[property]['campaignNameDayGRP'] = {
                            name: 'GRP',
                            data: campaignNameDayCouvertureArray
                        };
                        data[property]['campaignNameDayJour'] = {
                            name: "Jour",
                            data: campaignNameDayJourArray
                        };
                        data[property]['campaignNameDayRepetition'] = {
                            name: "Répétition",
                            data: campaignNameDayRepetitionArray
                        };
                    }


                }

                //  console.log(data)

                return res
                    .status(200)
                    .json(data);


            })

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res
            .status(404)
            .json({
                statusCoded: statusCoded
            });
    }

}

exports.export_pdf = async (req, res) => {

    try {

        let campaigncrypt = req.params.campaigncrypt;
        await ModelCampaignsTv
            .findOne({
                attributes: [
                    'campaign_tv_id',
                    'campaign_tv_crypt'
                ],
                where: {
                    campaign_tv_crypt: campaigncrypt
                }

            }).then(async function (campaign) {

                if (!campaign) {
                    return res
                        .status(404)
                        .render("error.ejs", {
                            statusCoded: 404,
                            campaigncrypt: campaigncrypt
                        });

                }

                let cacheStorageID = 'campaign_tv_ID-' + campaign.campaign_tv_id;
                LocalStorageTVDATA = localStorageTV.getItem(cacheStorageID);

                var reportingData = JSON.parse(LocalStorageTVDATA);

                if (!LocalStorageTVDATA) {
                    return res
                        .status(404)
                        .render("error.ejs", {
                            statusCoded: 404,
                            campaigncrypt: campaigncrypt
                        });
                }

                res.render('report-tv/template_pdf.ejs', {
                    reporting: reportingData,
                    campaign_crypt: campaigncrypt,
                    moment: moment,
                    utilities: Utilities
                });

            })

    } catch (error) {

    }
}

exports.pdf = async (req, res) => {

    const campaigncrypt = req.params.campaigncrypt;

    await ModelCampaignsTv.findOne({
        attributes: [
            'campaign_tv_crypt',
            'campaign_tv_name'
        ],
        where: {
            campaign_tv_crypt: campaigncrypt
        }
    }).then(async function (campaign) {

        const campaign_tv_name = campaign.campaign_tv_name
        const dateNow = moment().format('YYYYMMDD');
        const label = "campagne-"+campaign_tv_name+"-"+dateNow+".pdf"

        async function generatePDF() {

            //We start a new browser, without showing UI
            const browser = await puppeteer.launch({
                headless: true
            });
            const page = await browser.newPage();
            const url = 'https://reporting.antennesb.fr/t/pdf/' + campaigncrypt;

            //We load the page, one of my blog post (networkidle0 means we're waiting for the network to stop making new calls for 500ms
            await page.goto(url, {
                waitUntil: 'networkidle2'
            });
            //We add style to hide some UI elements we don't want to see on our pdf
            //     await page.addStyleTag({
            //         content: `body {
            //       margin: 0;
            //       color: #000;
            //       background-color: red;
            //     }
            //   #boutton-info{
            //       diplay:none
            //   }
            //   `
            //     });

            //Let's generate the pdf and close the browser
            const pdf = await page.pdf({
              //  path: "campagne.pdf",
                format: 'A4'
            });
            await browser.close();
            res.attachment(label)
            return res.send(pdf);
        }

        generatePDF();
    })

}