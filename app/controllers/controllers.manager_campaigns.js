// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require('axios');
var crypto = require('crypto');

// const request = require('request'); const bodyParser =
// require('body-parser');

const {Op} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

const {QueryTypes} = require('sequelize');

const {check, query} = require('express-validator');

const moment = require('moment');

const csv = require('csv-parser');
const fs = require('fs');

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const Utilities = require("../functions/functions.utilities");

// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAgencies = require("../models/models.agencies");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelInsertionsPriorities = require(
    "../models/models.insertions_priorities"
);
const ModelInsertionsStatus = require("../models/models.insertions_status");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const ModelEpilotCampaigns = require("../models/models.epilot_campaigns");
const ModelEpilotInsertions = require("../models/models.epilot_insertions");
const ModelUsers = require("../models/models.users");

const TEXT_REGEX = /^.{1,51}$/

const {promiseImpl} = require('ejs');
const {insertions} = require('./controllers.automate');

exports.index = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': ''
        },);
        data.breadcrumb = breadcrumb;

        data.campaigns = await ModelCampaigns.findAll({
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        // Affiche les campagnes se terminant aujourd'hui
        var dateNow = moment().format('YYYY-MM-DD');
        var dateTomorrow = moment()
            .add(1, 'days')
            .format('YYYY-MM-DD');
        var date5Days = moment()
            .add(5, 'days')
            .format('YYYY-MM-DD');

        data.campaigns_today = await ModelCampaigns.findAll({
            where: {
                campaign_end_date: {
                    [Op.like]: '%' + dateNow + '%'
                }
            },
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        // Affiche les campagnes se terminant demain
        data.campaigns_tomorrow = await ModelCampaigns.findAll({
            where: {
                campaign_end_date: {
                    [Op.like]: '%' + dateTomorrow + '%'
                }
            },
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        // Affiche les campagnes se terminant dans les 5 prochains jours
        data.campaigns_nextdays = await ModelCampaigns.findAll({
            where: {
                [Op.or]: [
                    {
                        campaign_start_date: {
                            [Op.between]: [dateNow, date5Days]
                        }
                    }
                ],
                [Op.or]: [
                    {
                        campaign_end_date: {
                            [Op.between]: [dateNow, date5Days]
                        }
                    }
                ]
            },
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['campaign_start_date', 'ASC']
            ],
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        // Affiche les campagnes se terminant dans les 5 prochains jours
        data.campaigns_online = await ModelCampaigns.findAll({
            where: {
                campaign_start_date: {
                    [Op.gte]: '%' + dateNow + '%'
                }
            },
            include: [
                {
                    model: ModelAdvertisers
                }
            ]
        });

        data.moment = moment;

        console.log('dateNow :', dateNow)
        console.log('dateTomorrow :', dateTomorrow)
        console.log('date5Days :', date5Days, ' - ', data.campaigns_nextdays.length)

        res.render('manager/campaigns/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.list = async (req, res) => {
    try {
        // Liste tous les campagnes
        const data = new Object();

        // Créer le fil d'ariane
        const breadcrumbLink = 'campaigns';
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Liste des campagnes',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.campaigns = await ModelCampaigns.findAll({
            include: [
                {
                    model: ModelAdvertisers
                }, {
                    model: ModelInsertions
                }
            ]
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['campaign_id', 'DESC']
            ]
        });

        data.moment = moment;
        res.render('manager/campaigns/list.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.view = async (req, res) => {
    try {
        const data = new Object();

        var insertionsIds = new Array();
        data.insertions = new Array();
        data.creatives = new Array();

        var campaign_id = req.params.id;
        var campaign = await ModelCampaigns
            .findOne({
                where: {
                    campaign_id: campaign_id
                },
                include: [
                    {
                        model: ModelAdvertisers
                    }, {
                        model: ModelAgencies
                    }, {
                        model: ModelInsertions
                    }
                ]
            })
            .then(async function (campaign) {
                if (!campaign) {
                    return res
                        .status(404)
                        .render("manager/error.ejs", {statusCoded: 404});
                }

                // Créer le fil d'ariane
                var breadcrumbLink = 'advertisers'
                breadcrumb = new Array({
                    'name': 'Campagnes',
                    'link': 'campaigns'
                }, {
                    'name': campaign.advertiser.advertiser_name,
                    'link': breadcrumbLink.concat('/', campaign.advertiser_id)
                }, {
                    'name': campaign.campaign_name,
                    'link': ''
                });
                data.breadcrumb = breadcrumb;

                // Récupére les données des campagnes epilot
                var epilot_campaign = await ModelEpilotCampaigns.findOne({
                    attributes: ['epilot_campaign_volume'],
                    where: {
                        campaign_id: campaign_id
                    }
                });

                console.log(epilot_campaign)
                //test si epilot_campaign existe
                if (!Utilities.empty(epilot_campaign)) {
                    data.epilot_campaign = epilot_campaign;
                }else{
                    data.epilot_campaign = 0;

                } 

                // Récupére les données des insertions de la campagne
                var insertionList = await ModelInsertions
                    .findAll({
                        where: {
                            campaign_id: campaign_id
                        },
                        include: [
                            {
                                model: ModelCampaigns,
                                attributes: ['campaign_id', 'campaign_name']
                            }, {
                                model: ModelFormats,
                                attributes: ['format_id', 'format_name']
                            }, {
                                model: ModelInsertionsPriorities,
                                attributes: ['priority_id', 'priority_name']
                            }, {
                                model: ModelInsertionsStatus,
                                attributes: ['insertion_status_id', 'insertion_status_name']
                            }
                        ]
                    })
                    .then(async function (insertionList) {

                        if (!Utilities.empty(insertionList) && (insertionList.length > 0)) {

                            data.insertions = insertionList;
                            for (i = 0; i < insertionList.length; i++) {
                                insertionsIds.push(insertionList[i].insertion_id);
                            }

                            // Récupére l'ensemble des insertions IDs pour afficher l'ensemble des créatives
                            if (insertionsIds) {
                                // Récupére les données des creatives de l'insertion
                                var creativesList = await ModelCreatives
                                    .findAll({
                                        attributes:["creative_url"],
                                        where: {
                                            insertion_id: insertionsIds
                                        },
                                        group: 'creative_url'
                                    })
                                    .then(async function (creativesList) {
                                        data.creatives = creativesList;
                                    });
                            }

                        }
                    });

                // Attribue les données de la campagne
                data.campaign = campaign;
                data.moment = moment;
                data.utilities = Utilities;

                // Récupére l'ensemble des données du rapport
                data_localStorage = localStorage.getItem('campaignID-' + campaign.campaign_id);
                data.reporting = JSON.parse(data_localStorage);

                res.render('manager/campaigns/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.create = async (req, res) => {
    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Créer une campagne',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        // Récupére l'ensemble des annonceurs
        var advertisers = await ModelAdvertisers
            .findAll({
                order: [
                    // Will escape title and validate DESC against a list of valid direction
                    // parameters
                    ['advertiser_name', 'ASC']
                ]
            })
            .then(async function (advertisers) {
                data.advertisers = advertisers;
            });

        res.render('manager/campaigns/create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.create_post = async (req, res) => {
    try {
        const advertiser = req.body.advertiser_id
        const campaign = req.body.campaign_name
        const start_date = req.body.campaign_start_date
        const end_date = req
            .body
            .campaign_end_date

            console
            .log(req.body)

        if (!TEXT_REGEX.test(campaign)) {
            req.session.message = {
                type: 'danger',
                intro: 'Erreur',
                message: 'Le nombre de caratère est limité à 50'
            }
            return res.redirect('/manager/campaigns/create')
        }

        if (advertiser == '' || campaign == '' || start_date == '' || end_date == '') {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Les champs doivent être complétés'
            }
            return res.redirect('/manager/campaigns/create')
        }

        const timstasp_start = Date.parse(start_date)
        const timstasp_end = Date.parse(end_date)

        // si date aujourd'hui est >= à la date selectionné envoie une erreur
        if (timstasp_end <= timstasp_start || timstasp_start >= timstasp_end) {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Saisissez une date valide'
            }
            return res.redirect('/manager/campaigns/create')
        }

        var requestCampaign = {
            "name": campaign,

            "advertiserId": advertiser,

            "agencyId": 0,

            "campaignStatusId": 3,

            "description": "",

            "externalCampaignId": "",

            "traffickedBy": 0,

            "startDate": start_date,

            "endDate": end_date,

            "globalCapping": 0,

            "visitCapping": 0,

            "isArchived": false

        }

        await ModelCampaigns
            .findOne({
                attributes: ['campaign_name'],
                where: {
                    campaign_name: campaign
                }
            })
            .then(async function (campaignFound) {

                //Test si le nom de la campagne exsite

                if (!campaignFound) {
                    //envoie les éléments de la requête POST

                    let campaign_create = await AxiosFunction.postManage(
                        'campaigns',
                        requestCampaign
                    );

                    //Si url location existe on recupère l'id avec une requête GET

                    if (campaign_create.headers.location) {

                        var url_location = campaign_create.headers.location

                        var campaign_get = await AxiosFunction.getManage(url_location);

                        var campaign_id = campaign_get.data.id

                        // on chiffre la campagne id
                        const campaign_crypt = crypto
                            .createHash('md5')
                            .update(campaign_id.toString())
                            .digest("hex");

                        await ModelCampaigns.create({
                            campaign_name: campaign,
                            campaign_crypt: campaign_crypt,
                            advertiser_id: advertiser,
                            campaign_start_date: start_date,
                            campaign_end_date: end_date,
                            campaign_archived: 0

                        });

                        req.session.message = {
                            type: 'success',
                            intro: 'Ok',
                            message: 'La campagne a été crée dans SMARTADSERVEUR'
                        }
                        return res.redirect('/manager/campaigns/create');
                    }

                } else {
                    req.session.message = {
                        type: 'danger',
                        intro: 'Erreur',
                        message: 'Campagne est déjà utilisé'
                    }
                    return res.redirect('/manager/advertisers/create');
                }

            })

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.list_epilot = async (req, res) => {

    try {
        // Liste tous les campagnes
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Ajouter une campagne EPILOT',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.epilot = await ModelEpilotCampaigns.findAll({});
        data.formats = await ModelFormats.findAll({
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
        data.moment = moment;
        data.utilities = Utilities;

        res.render('manager/campaigns/list_epilot.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.epilot_create = async (req, res) => {
    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Campagnes',
            'link': 'campaigns'
        }, {
            'name': 'Liste les campagnes EPILOT',
            'link': 'campaigns/epilot'
        }, {
            'name': 'Ajouter une campagne EPILOT',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        // Récupére l'ensemble des annonceurs
        var advertisers = await ModelAdvertisers
            .findAll({
                order: [
                    ['advertiser_name', 'ASC']
                ]
            })
            .then(async function (advertisers) {
                data.advertisers = advertisers;
            });

        // Récupére l'ensemble des annonceurs
        var formats = await ModelFormats
            .findAll({
                order: [
                    ['format_name', 'ASC']
                ]
            })
            .then(async function (formats) {
                data.formats = formats;
            });

        res.render('manager/campaigns/epilot_create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}

exports.epilot_import = async (req, res) => {
    try {
        var filename = "public/uploads/2021/07/30/AD_INS-JANV-JUILLET.CSV";

        var results = new Array();
        fs
            .createReadStream(filename)
            .pipe(csv({
                separator: '\;'
            },))
            .on('data', (data) => results.push(data))
            .on('end', () => {
                console.log(results.length);
                console.log(results[0]);

                for (i = 0; results.length; i++) {
                    console.log(results[i]['Campagne']);
                    // console.log(results[i]);

                    var commercial = results[i]['Responsable commercial'];
                    console.log('commercial :', commercial);

                    commercialIdentity = commercial.split(' ');
                    var user_id = null;

                    ModelUsers
                        .findOne({
                            where: {
                                user_firstname: commercialIdentity[1],
                                user_lastname: commercialIdentity[0]
                            }
                        })
                        .then(user => {
                            if (user.length === 1) {
                                user_id = user['user_id'];
                            }
                        });

                    process.exit(1);
                }

                // Récupére l'ensemble des données
                if (results.length > 0) {
                    result = results[0];

                    /*
                // Si les keys : Name & PAD => Campagne insertions
                if(!Utilities.empty(results[0]['PAD']) && !Utilities.empty(results[0]['Nom'])) {
                    console.log('INSERTIONS');
                    result = results[0];
                    console.log(result);
                    var campaign_name = result['Campagne'];
                    var insertion_name = result['Nom'];

                    if(result['Etat']) {
                        switch(result['Etat']) {
                            case 'Confirmée':
                            case 'Confirmee' :
                                var epilot_insertion_status = 1;
                            break;
                            case 'Reservée':
                            case 'Reservee':
                                var epilot_insertion_status = 2;
                            break;
                            default :
                              var epilot_insertion_status = 0;
                            break;
                        }
                    }

                    var epilot_insertion_volume = result['Volume total prévu'];

                    var commercial = result[0]['Responsable commercial'];
                        console.log('commercial :',commercial);

                    commercialIdentity = commercial.split(' ');
                    var user_id = null;

                    ModelUsers.findOne({
                        where : { user_firstname: commercialIdentity[1], user_lastname: commercialIdentity[0], }
                    }).then(user => {
                        if (user.length === 1) {
                            user_id = user['user_id'];
                        }
                    });


                    ModelAdvertisers.findOne({
                        where : { advertiser_name: advertiser_name }
                    }).then(advertiser => {
                        if (advertiser.length === 1) {
                            advertiser_id = advertiser['advertiser_id'];
                        }
                    });

                    // 'Responsable commercial'

                    var epilot_insertion_start_date = moment(result['Date de début prévue']).format('YYYY-MM-DD 00:00:00');
                    var epilot_insertion_end_date = moment(result['Date de fin prévue']).format('YYYY-MM-DD 23:59:00');


                      // Charge les données dans la base de donnée
                      var data_insertion = {
                        'epilot_campaign_name' : campaign_name,
                        'epilot_insertion_name' : insertion_name,
                        'epilot_insertion_status' : epilot_insertion_status,
                        'epilot_insertion_volume' : epilot_insertion_volume,
                        'epilot_insertion_start_date' : epilot_insertion_start_date,
                        'epilot_insertion_end_date' :  epilot_insertion_end_date,
                        'user_id' : user_id

                    }

                    console.log(data_insertion);
                    console.log('------------------')



                } else {
                    console.log('PAD : ',results[0]['PAD'], ' - Nom : ',results[0]['Nom']);
                    console.log('CAMPAGNES');

                    var campaign_name = result['Campagne'];

                    const regexCampaignCode = /([0-9]{5})/g;
                    regexCampaignCodeResult = campaign_name.match(regexCampaignCode);
                    if(regexCampaignCodeResult.length > 0) { var epilot_campaign_code = regexCampaignCodeResult[0]; } else { var epilot_campaign_code = null; }

                    var advertiser_name = result['Annonceur'];
                    var advertiser_id = null;

                    ModelAdvertisers.findOne({
                        where : { advertiser_name: advertiser_name }
                    }).then(advertiser => {
                        if (advertiser.length === 1) {
                            advertiser_id = advertiser['advertiser_id'];
                        }
                    });

                    if(result['Etat planning']) {
                        switch(result['Etat planning']) {
                            case 'Confirmée':
                            case 'Confirmee' :
                                var epilot_campaign_status = 1;
                            break;
                            case 'Reservée':
                            case 'Reservee':
                                var epilot_campaign_status = 2;
                            break;
                            default :
                              var epilot_insertion_status = 0;
                            break;
                        }
                    }


                    var epilot_campaign_start_date = moment(result['Début']).format('YYYY-MM-DD 00:00:00');
                    var epilot_campaign_end_date = moment(result['Fin']).format('YYYY-MM-DD 23:59:00');

                    var epilot_campaign_volume = result['Volume total prévu'];
                    var epilot_campaign_nature = result['Nature'];

                    // Charge les données dans la base de donnée
                    var data_campaign = {
                        'epilot_campaign_name' : campaign_name,
                        'epilot_advertiser_name' : advertiser_name,
                        'epilot_campaign_code' : epilot_campaign_code,
                        'advertiser_id' : advertiser_id,
                        'epilot_campaign_status' : epilot_campaign_status,
                        'epilot_campaign_start_date' : epilot_campaign_start_date,
                        'epilot_campaign_end_date' :  epilot_campaign_end_date,
                        'epilot_campaign_volume' : epilot_campaign_volume,
                        'epilot_campaign_nature' : epilot_campaign_nature
                    }

                    console.log(data_campaign);
                    console.log('------------------');

                }

                console.log(results[0]);
                 */
                    // Sinon
                    process.exit(1);
                }

            });

        /*

        var fileWords = fs.readFileSync(filename, 'utf8');
        var newFileWords = fileWords.replace('/,/', '.');
        console.log(newFileWords);

        var fileWords = 'Pr�te � diffuser';
        var newFileWords = fileWords.replace('/�/gi', '');
        console.log(newFileWords);

        process.exit(1);
*/
        /*
        fs
        .createReadStream('public/uploads/2021/07/30/AD_CAMP.CSV')
        // fs.createReadStream('public/admin/uploads/template_csv.csv')
        .pipe(csv({
            separator: '\;'
        },))
        .on('data', (data) => results.push(data))
        .on('end', () => {
            console.log(results.length);
        });


    fs
    .createReadStream('public/uploads/2021/07/30/AD_CAMP-JANV-JUILLET.CSV')
    // fs.createReadStream('public/admin/uploads/template_csv.csv')
    .pipe(csv({
        separator: '\;'
    },))
    .on('data', (data) => results.push(data))
    .on('end', () => {
        console.log(results.length);
    });




    var results = new Array();
    fs.createReadStream('public/uploads/2021/07/30/AD_CAMP-JANV-JUILLET.csv')
    .pipe(csv(
        {
            mapHeaders: ({ header, index }) => header.toLowerCase(),
            delimiter: '\;',
            mapValues: ({ header, index, value }) => value.toLowerCase()
        }
        ))
    .on('data', (row) => {
        //console.log(row);
        results.push(row)
    })
    .on('end', () => {
      //  console.log(' RESULT LENGTH : ',results.length);
       // console.log(results[0]);
        user = results[1];
        // loop over values
for (let value of Object.values(user)) {
    console.log(value);


 myArr = value.split(";");
 console.log('-----------------');

 console.log(myArr);

  }

      console.log('CSV file successfully processed');
    });
*/

        /*
        const file = req.files.epilot_file;
        console.log(file);

        // Le fichier doit être un fichier excel ou csv
        if ((file.mimetype === 'application/vnd.ms-excel' || file.mimetype === 'application/octet-stream')) {

            // Créer un dossier s'il n'existe pas (ex: public/uploads/epilot/2021/07/31)  dirDate + '/' +
            var dirDateNOW = moment().format('YYYY/MM/DD');

             // Créer un dossier si celui-ci n'existe pas
            fs.mkdir('public/uploads/' + dirDateNOW + '/', { recursive: true }, (err) => {
            if (err) throw err;
          })

           // Déplace le fichier de l'upload vers le dossier
            await file.mv('public/uploads/' + dirDateNOW + '/' + file.name, err => {
                if (err)
                return res.status(500).send('ERRORRRRRRRRRRRRRR :' + err);
            });

            fs
                .createReadStream('public/uploads/' + dirDateNOW + '/' + file.name)
                // fs.createReadStream('public/admin/uploads/template_csv.csv')
                .pipe(csv({
                    separator: '\;'
                },))
                .on('data', (data) => results.push(data))
                .on('end', () => {
                    console.log(results);

                });



        } else {
            req.session.message = {
                type: 'danger',
                intro: 'Erreur',
                message: 'L\'extension du fichier est invalide. '
            }
            return res.redirect('/manager/campaigns/epilot/create');
        }
        */

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        // res.render("manager/error.ejs", {statusCoded: statusCoded});
    }
}