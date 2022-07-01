const {
    Op,
    ARRAY
} = require("sequelize");

// const excel = require('node-excel-export');
process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});
var LocalStorage = require('node-localstorage').LocalStorage;
localStorage = new LocalStorage('data/reporting/');
localStorageTasks = new LocalStorage('data/taskID/');
const {
    QueryTypes
} = require('sequelize');
//var nodemailer = require('nodemailer');
var nodeoutlook = require('nodejs-nodemailer-outlook');
const ExcelJS = require('exceljs');
var axios = require('axios');
const fs = require('fs')
const moment = require('moment');
const puppeteer = require('puppeteer')

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const Utilities = require('../functions/functions.utilities');
const SmartFunction = require("../functions/functions.smartadserver.api");

// Initialise les models
//const ModelSite = require("../models/models.site");
const ModelFormat = require("../models/models.formats");
const ModelCountry = require("../models/models.countries")
const ModelPack = require("../models/models.packs")
const ModelCampaigns = require("../models/models.campaigns");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelAgencies = require("../models/models.agencies");
const ModelInsertions = require("../models/models.insertions");
const ModelTemplates = require("../models/models.templates");
const ModelEpilotCampaigns = require("../models/models.epilot_campaigns");
const ModelFormatsGroupsTypes = require(
    "../models/models.formats_groups_types"
);
const ModelFormatsGroups = require("../models/models.formats_groups");
const ModelCampaignsTv = require("../models/models.campaigns_tv");
// Initialise les identifiants de connexion à l'api
const dotenv = require("dotenv");
dotenv.config({
    path: "./config.env"
})

// For the default version
const algoliasearch = require('algoliasearch');

exports.search = async (req, res) => {
    try {

        const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_SEARCH_APIKEY);
        const index = client.initIndex(process.env.ALGOLIA_INDEXNAME);

        // only query string
        index.search('rodzafer').then(({
            hits
        }) => {
            console.log(hits);
        });

        //process.exit();

        /*
        var campaigns = await ModelCampaigns.findAll({
            include: [
                { model: ModelAdvertisers },
                { model: ModelAgencies},
                { model: ModelInsertions}
            ]
        }).then(async function (campaigns) {
           
            const client = algoliasearch(process.env.ALGOLIA_APPLICATION_ID, process.env.ALGOLIA_SEARCH_APIKEY);
            const index = client.initIndex(process.env.ALGOLIA_INDEXNAME);
            campaignsObjects = new Array();
            campaigns.forEach(function(item){

                advertiserObject = new Array();
                if(!Utilities.empty(item.advertiser.advertiser_id)) {
                    advertiserObject = {
                        advertiser_id : item.advertiser.advertiser_id,
                        advertiser_name : item.advertiser.advertiser_name
                    }
                }

                agencyObject = new Array();
                if(!Object.is(item.agency_id,null)) {
                    agencyObject = {
                        agency_id : item.agency_id,
                        agency_name : item.agency.agency_name
                    }
                } 

                 // Liste les insertions
                 const insertions = item.insertions;
                 insertionsObject = new Array();
                 insertions.forEach(function(itemI){
                    
                     //  console.log('Insertions : ', itemI.insertion_id,' - ', itemI.insertion_name)
                     var insertionObject = {
                         insertion_id : itemI.insertion_id,
                         insertion_name : itemI.insertion_name,
                         insertion_start_date : itemI.insertion_start_date,
                         insertion_end_date : itemI.insertion_end_date,
                         campaign_id :  itemI.campaign_id,
                         priority_id: itemI.priority_id
                     }

                     insertionsObject.push(insertionObject);
                 });

                    var campaignObject = {
                        campaign_id : item.campaign_id,
                        advertiser : advertiserObject,
                        agency : agencyObject,
                        campaign_crypt : item.campaign_crypt,
                        campaign_name : item.campaign_name,
                        campaign_start_date : item.campaign_start_date,
                        campaign_end_date : item.campaign_end_date,
                        insertions : insertionsObject
                    }
                    campaignsObjects.push(campaignObject);
             })

             console.log(campaignsObjects)

             index.saveObjects(campaignsObjects, {'autoGenerateObjectIDIfNotExist': true}).then(({ objectIDs }) => {
                console.log(objectIDs);
             });

        });

*/

    } catch (error) {
        console.log(error);
    }
}

exports.lol = async (req, res) => {
    try {

        const client = algoliasearch('7L0LDMH42V', 'bf57bd2367126fc4d4a48d8549f48f03');
        const index = client.initIndex('index_campaigns');

        const objects = [{
            firstname: 'Jimmie',
            lastname: 'Barninger',
            objectID: 'myID1'
        }, {
            firstname: 'Warren',
            lastname: 'Speach',
            objectID: 'myID2'
        }];

        index.saveObjects(objects).then(({
            objectIDs
        }) => {
            console.log(objectIDs);
        });

        console.log('mqsmkd')

        process.exit();

        campaignsObjects = new Array();
        var campaigns = await ModelCampaigns.findAll({
            include: [{
                model: ModelAdvertisers
            },
            {
                model: ModelAgencies
            },
            {
                model: ModelInsertions
            }
            ],
            limit: 4

        }).then(async function (campaigns) {
            campaigns.forEach(function (item) {
                console.log(item.campaign_id, ' ', item.campaign_name)

                var campaignObject = {
                    campaign_id: item.campaign_id,
                    campaign_crypt: item.campaign_crypt,
                    campaign_name: item.campaign_name
                }

                advertiserObject = new Array();
                if (!Utilities.empty(item.advertiser.advertiser_id)) {
                    advertiserObject = {
                        advertiser_id: item.advertiser.advertiser_id,
                        advertiser_name: item.advertiser.advertiser_name
                    }
                }

                // Liste les insertions
                const insertions = item.insertions;
                insertionsObject = new Array();
                insertions.forEach(function (itemI) {

                    //  console.log('Insertions : ', itemI.insertion_id,' - ', itemI.insertion_name)
                    var insertionObject = {
                        insertion_id: itemI.insertion_id,
                        insertion_name: itemI.insertion_name,
                        insertion_start_date: itemI.insertion_start_date,
                        insertion_end_date: itemI.insertion_end_date,
                        campaign_id: itemI.campaign_id,
                        priority_id: itemI.priority_id
                    }

                    insertionsObject.push(insertionObject);
                });

                // campaignObject.insertions = insertionsObject;
                agencyObject = new Array();
                if (!Object.is(item.agency_id, null)) {
                    agencyObject = {
                        agency_id: item.agency_id,
                        agency_name: item.agency.agency_name
                    }
                }

                // Remplie l'object
                campaignsObjects.push({
                    campaign_id: item.campaign_id,
                    campaign_crypt: item.campaign_crypt,
                    campaign_name: item.campaign_name,
                    campaign_start_date: item.campaign_start_date,
                    campaign_end_date: item.campaign_end_date,
                    advertiser: advertiserObject,
                    agency: agencyObject,
                    insertions: insertionsObject
                });

            });
        });

        // console.log(campaignsObjects);

        index.saveObjects(campaignsObjects).then(({
            objectIDs
        }) => {
            console.log(objectIDs);
        });

        /*
           for(i = 0; i < campaigns.length; i++) {
            console.log(campaigns[i].campaign_id,' ',campaigns[i].campaign_name)

           }
           // const object = {
           
            const objects = [{
                firstname: 'Jimmie',
                lastname: 'Barninger',
                objectID: 'myID1'
              }, {
                firstname: 'Warren',
                lastname: 'Speach',
                objectID: 'myID2'
              }];
              
              index.saveObjects(campaignsObjects).then(({ objectIDs }) => {
                console.log(objectIDs);
              });*/

        // });
        // console.log(advertisers);

        //   return res.json(advertisers);

        process.exit(1);
    } catch (error) {
        console.log(error);
    }
}

exports.index = async (req, res) => {
    console.log('dfsd');
    process.exit(1);
    // Mettre à jour les formats
    // const groupFormats = await ModelFormatsGroups
    // .findAll();

    // console.log(groupFormats)

    // Crée label avec le date du jour ex : 20210403

    const dateNowLong = Date.now();

    // Affiche les annonceurs
    const advertiserExclus = new Array(
        418935,
        427952,
        409707,
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
        320778,
        464149,
        417716,
        464862
    );

    var dateNow = moment().format('YYYY-M-D 00:00:00'); // "2021-12-29 00:00:00";
    var dateNowRequest = moment().format('YYYY-M-DT00:00:00');
    var dateEnd = '2040-12-31 23:59:00';
    var dateEndRequest = '2021-12-31T23:59:00';
    console.log('dateNow : ', dateNow);

    // Affiche les campagnes en ligne
    /* var campaigns = await ModelCampaigns.findAll({
          where: {
                  advertiser_id: {
                      [Op.notIn]: advertiserExclus
                  },
                  [Op.or]: [{
                      campaign_start_date: {
                          [Op.between]: [dateNow, dateEnd]
                      }
                  }, {
                      campaign_end_date: {
                          [Op.between]: [dateNow, dateEnd]
                      }
                  }]
          },
          order: [
              ['campaign_end_date', 'ASC']
          ],
          include: [
              { model: ModelAdvertisers },
              { model: ModelInsertions }
              ]
      });

      */

    var campaignsMin = await ModelInsertions.findAll({
        attributes: [
            'insertion_id',
            [sequelize.fn('min', sequelize.col('insertion_start_date')), 'startDate']
        ],
        where: {
            insertion_start_date: {
                [Op.between]: [dateNow, dateEnd]
            }
        },
        include: [{
            model: ModelCampaigns,
            where: {
                advertiser_id: {
                    [Op.notIn]: advertiserExclus
                },
                campaign_name: {
                    [Op.notLike]: '% PARR %'
                }

            }
        }]
    });

    var campaignsMax = await ModelInsertions.findAll({
        attributes: [
            'insertion_id',
            [sequelize.fn('min', sequelize.col('insertion_end_date')), 'endDate']
        ],
        where: {
            insertion_end_date: {
                [Op.gte]: dateNow
            }
        },
        include: [{
            model: ModelCampaigns,
            where: {
                advertiser_id: {
                    [Op.notIn]: advertiserExclus
                },
                campaign_name: {
                    [Op.notLike]: '% PARR %'
                }

            }
        }]
    });

    /*
    console.log(campaigns.length); // process.exit(1);

    var campaign_ids = new Array();
    for(i = 0; i < campaigns.length; i++) {
      //  console.log(campaigns[i].campaign_name+' - '+campaigns[i].campaign_id);
      console.log(campaigns[i].campaign_name+' - '+campaigns[i].campaign_id);
      //  campaign_ids.push(campaigns[i].campaign_id);
    }*/

    return res.json({
        type: 'success',
        campaignsMin: campaignsMin,
        campaignsMax: campaignsMax
    });

    process.exit(1);
    // console.log(campaign_ids);

    // initialisation des requêtes
    var requestReporting = {
        "startDate": dateNowRequest,
        "endDate": dateEndRequest,
        "fields": [{
            "CampaignStartDate": {}
        }, {
            "CampaignEndDate": {}
        }, {
            "CampaignId": {}
        }, {
            "CampaignName": {}
        }, {
            "InsertionId": {}
        }, {
            "InsertionName": {}
        }, {
            "FormatId": {}
        }, {
            "FormatName": {}
        }, {
            "SiteId": {}
        }, {
            "SiteName": {}
        }, {
            "Impressions": {}
        }, {
            "ClickRate": {}
        }, {
            "Clicks": {}
        }, {
            "VideoCount": {
                "Id": "17",
                "OutputName": "Nbr_complete"
            }
        }],
        "filter": [{
            "CampaignId": '1989163'
            /*, 2007792, 1913649, 2003528,
                            1938504, 2007632, 1850218, 2003310,
                            2004336, 1909617, 1974651, 1913231,
                            1921937, 1974685, 1913245, 1971870,
                            2001079, 1989854, 1989864, 1863912,
                            1961451, 1997595, 1983659, 1996358,
                            2003316, 1965099, 1981048, 1975229,
                            1974724, 1985080, 1996479, 1989974,
                            1989977, 2009119, 2008909, 1992587,
                    2007959, 1698950]*/
        }]
    }

    console.log(requestReporting);
    let firstLink = await AxiosFunction.getReportingData(
        'POST',
        '',
        requestReporting
    );

    console.log('firstLink : ', firstLink);

    process.exit(1);
    /*
      await ModelEpilotCampaigns.update( data_campaign
    , {
        where: {
            epilot_campaign_code: 74648
        }
      });
    */

    /*
     // Ajoute ou MAJ la campagne EPILOT
     Utilities
     .updateOrCreate(ModelEpilotCampaigns, {
         epilot_campaign_code: '74648'
     }, data_campaign)
     .then(function (result) {
         result.item; // the model
         result.created; // bool, if a new item was created.
         console.log(result)
     });
    */

    process.exit(1);

    try {
        const test = await ModelCampaigns.findAll({

            attributes: ['campaign_id', 'campaign_name', 'campaign_start_date', 'campaign_end_date'],
            group: "campaign_id",
            where: {
                campaign_id: {
                    [Op.not]: null
                }
            },
            campaign_end_date: {
                [Op.between]: ['2021-11-29  04:00:00', '2021-12-05 04:00:00']
            },

            order: [
                ['campaign_id', 'ASC']
            ],
            include: [{
                model: ModelInsertions,
                attributes: ["format_id", "insertion_id", "insertion_end_date", "campaign_id"],
                where: {
                    format_id: 43791,
                    insertion_end_date: {
                        [Op.between]: ['2021-11-29  04:00:00', '2021-12-05 04:00:00']
                    }
                }

            }]

        })

        res.json(test)

        /* // SELECT `format_group` FROM `_asb_formats` WHERE `format_group` IS NOT NULL GROUP BY `format_group` ORDER BY `format_group` ASC
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

         const packs = await ModelPack.findAll({
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

         res.render('forecast/form.ejs', {
             formats: formats,
             packs: packs,
             countrys: countrys
         });*/
    } catch (error) {
        console.log(error);
    }
};

exports.template = async (req, res) => {
    res.render('manager/template.ejs');
};

exports.campaignday = async (req, res) => {
    var file = 'https://reporting.smartadserverapis.com/2044/reports/E0F446DB-34BF-4975-9D1A-C502197C0D4F/file';
    // Récupère la date de chaque requête
    dataFile2 = await AxiosFunction.getReportingData('GET', file, '');
    res.json(dataFile2.data);
}

exports.export_excel = async (req, res) => {
    // Crée label avec le date du jour ex : 20210403
    const date = new Date();
    const JJ = ('0' + (date.getDate())).slice(-2);

    const MM = ('0' + (date.getMonth())).slice(-2);
    const AAAA = date.getFullYear();

    const label_now = AAAA + MM + JJ;
    // recherche dans le local storage id qui correspond à la campagne
    var data_localStorage = localStorage.getItem('campagneId' + '-' + '1883260');
    var data_report_view = JSON.parse(data_localStorage);

    var dts_table = data_report_view.table;

    var campaign_name = dts_table.Campagne_name
    var date_now = dts_table.Date_rapport
    var StartDate = dts_table.StartDate
    var EndDate = dts_table.EndDate

    var table = data_report_view.table;
    var data_interstitiel = data_report_view.data_interstitiel;
    var data_habillage = data_report_view.data_habillage;
    var data_masthead = data_report_view.data_masthead;
    var data_grand_angle = data_report_view.data_grand_angle;
    var data_native = data_report_view.data_native;
    var data_video = data_report_view.data_video;

    try {

        // You can define styles as json object
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
            cellTotal: {

                font: {
                    color: {
                        rgb: 'FF000000'
                    },
                    bold: true,
                    underline: false
                }

            },

            cellNone: {
                font: {
                    color: {
                        rgb: 'FF000000'
                    },

                }
            },

        };

        // 

        //Array of objects representing heading rows (very top)
        const heading = [
            [{
                value: 'Rapport : ' + campaign_name,
                style: styles.headerDark,
                alignment: styles.alignment
            }

            ],

            ['Date de génération : ' + date_now,

            ],
            ['Période diffusion : Du ' + StartDate + ' au ' + EndDate],
            ['                ']
        ];

        const headingformats = [
            [{
                value: 'Par Format',
                style: styles.headerDark,
            }

            ]

        ];
        const headingsites = [
            [{
                value: 'Par Sites',
                style: styles.headerDark,
            }

            ]

        ];

        //Here you specify the export structure
        const bilan_global = {

            impressions: { // <- the key should match the actual data key
                displayName: 'Impressions', // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                width: 400 // <- width in pixels
            },
            formats: { // <- the key should match the actual data key
                displayName: 'Formats', // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                width: 400 // <- width in pixels
            },
            clics: {
                displayName: 'Clics',
                headerStyle: styles.headerDark,
                width: 220 // <- width in chars (when the number is passed as string)
            },
            ctr_clics: {
                displayName: 'Taux de clics',
                headerStyle: styles.headerDark,
                width: 220 // <- width in pixels
            },
            vu: {
                displayName: 'Visiteurs Uniques',
                headerStyle: styles.headerDark,
                width: 220 // <- width in pixels
            },
            repetions: {
                displayName: 'Répétition',
                headerStyle: styles.headerDark,
                width: 220 // <- width in pixels
            }

        }

        const bilan_formats = {

            Formats: { // <- the key should match the actual data key
                displayName: 'Format', // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                cellStyle: function (value, row) { // <- style renderer function
                    // if the status is 1 then color in green else color in red
                    // Notice how we use another cell value to style the current one

                    return (value === "TOTAL") ? styles.cellTotal : styles.cellNone // <- Inline cell style is possible 
                },
                width: 220 // <- width in pixels
            },
            Impressions: {
                displayName: 'Impressions',
                headerStyle: styles.headerDark,
                width: 120 // <- width in chars (when the number is passed as string)
            },
            Clics: {
                displayName: 'Clics',
                headerStyle: styles.headerDark,
                width: 120 // <- width in chars (when the number is passed as string)
            },
            Ctr_clics: {
                displayName: 'Taux de clics',
                headerStyle: styles.headerDark,
                width: 120 // <- width in pixels
            },

        }

        const bilan_sites = {
            formats: { // <- the key should match the actual data key
                displayName: 'Formats', // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                width: 220 // <- width in pixels
            },
            sites: { // <- the key should match the actual data key
                displayName: 'Sites', // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                width: 220 // <- width in pixels
            },

            impressions: {
                displayName: 'Impressions',
                headerStyle: styles.headerDark,
                width: 120 // <- width in chars (when the number is passed as string)
            },
            clics: {
                displayName: 'Clics',
                headerStyle: styles.headerDark,
                width: 120 // <- width in chars (when the number is passed as string)
            },
            ctr_clics: {
                displayName: 'Taux de clics',
                headerStyle: styles.headerDark,
                width: 120 // <- width in pixels
            },
            vtr: {
                displayName: 'VTR',
                headerStyle: styles.headerDark,
                width: 220 // <- width in pixels
            }

        }

        // The data set should have the following shape (Array of Objects)
        // The order of the keys is irrelevant, it is also irrelevant if the
        // dataset contains more fields as the report is build based on the
        // specification provided above. But you should have all the fields
        // that are listed in the report specification
        const dataset_global = [{
            impressions: table.total_impression_format,
            clics: table.total_click_format,
            ctr_clics: table.CTR,
            vu: table.Total_VU,
            repetions: table.Repetition

        }

        ]
        const dataset_format = []

        if (table.sommeInterstitielImpression !== '0') {
            dataset_format[0] = {
                Formats: 'INTERSTITIEL',
                Impressions: table.sommeInterstitielImpression,
                Clics: table.sommeInterstitielClicks,
                Ctr_clics: table.CTR_interstitiel,

            }
        }

        if (table.sommeHabillageImpression !== '0') {
            dataset_format[1] = {

                Formats: 'HABILLAGE',
                Impressions: table.sommeHabillageImpression,
                Clics: table.sommeHabillageClicks,
                Ctr_clics: table.CTR_habillage,

            }
        }
        if (table.sommeMastheadImpression !== '0') {
            dataset_format[2] = {

                Formats: 'MASTHEAD',
                Impressions: table.sommeMastheadImpression,
                Clics: table.sommeMastheadClicks,
                Ctr_clics: table.CTR_masthead,

            }
        }

        if (table.sommeGrand_AngleImpression !== '0') {
            dataset_format[3] = {

                Formats: 'GRAND ANGLE',
                Impressions: table.sommeGrand_AngleImpression,
                Clics: table.sommeGrand_AngleClicks,
                Ctr_clics: table.CTR_grand_angle

            }
        }

        if (table.sommeNativeImpression !== '0') {
            dataset_format[4] = {
                Formats: 'NATIVE',
                Impressions: table.sommeNativeImpression,
                Clics: table.sommeNativeClicks,
                Ctr_clics: table.CTR_native

            }
        }
        if (table.sommeVideoImpression !== '0') {
            dataset_format[5] = {
                Formats: 'VIDEO',
                Impressions: table.sommeVideoImpression,
                Clics: table.sommeVideoClicks,
                Ctr_clics: table.CTR_video,

            }
        }
        dataset_format[6] = {
            Formats: 'TOTAL',
            Impressions: table.total_impression_format,
            Clics: table.total_click_format,
            Ctr_clics: table.CTR,
        }

        const dataset_site = []

        if (data_interstitiel.interstitielImpressions.length > 0) {

            if (data_interstitiel.total_impressions_linfoInterstitiel !== "0") {

                dataset_site[0] = {

                    formats: 'INTERSTITIEL',
                    sites: data_interstitiel.interstitiel_linfo_siteName,
                    impressions: data_interstitiel.total_impressions_linfoInterstitiel,
                    clics: data_interstitiel.total_clicks_linfoInterstitiel,
                    ctr_clics: data_interstitiel.interstitiel_linfo_ctr,
                    vtr: '-',

                }

            }
            if (data_interstitiel.total_impressions_linfo_androidInterstitiel !== "0") {
                dataset_site[1] = {
                    formats: 'INTERSTITIEL',
                    sites: data_interstitiel.interstitiel_linfo_android_siteName,
                    impressions: data_interstitiel.total_impressions_linfo_androidInterstitiel,
                    clics: data_interstitiel.total_clicks_linfo_androidInterstitiel,
                    ctr_clics: data_interstitiel.interstitiel_linfo_android_ctr,
                    vtr: '-',

                }
            }
            if (data_interstitiel.total_impressions_linfo_iosInterstitiel !== "0") {
                dataset_site[2] = {
                    formats: 'INTERSTITIEL',
                    sites: data_interstitiel.interstitiel_linfo_ios_siteName,
                    impressions: data_interstitiel.total_impressions_linfo_iosInterstitiel,
                    clics: data_interstitiel.total_clicks_linfo_iosInterstitiel,
                    ctr_clics: data_interstitiel.interstitiel_linfo_ios_ctr,
                    vtr: '-',

                }
            }

            if (data_interstitiel.total_impressions_dtjInterstitiel !== "0") {

                dataset_site[3] = {
                    formats: 'INTERSTITIEL',
                    sites: data_interstitiel.interstitiel_dtj_siteName,
                    impressions: data_interstitiel.total_impressions_dtjInterstitiel,
                    clics: data_interstitiel.total_clicks_dtjInterstitiel,
                    ctr_clics: data_interstitiel.interstitiel_dtj_ctr,
                    vtr: '-',

                }

            }
            if (data_interstitiel.total_impressions_antenneInterstitiel !== "0") {

                dataset_site[4] = {
                    formats: 'INTERSTITIEL',
                    sites: data_interstitiel.interstitiel_antenne_siteName,
                    impressions: data_interstitiel.total_impressions_antenneInterstitiel,
                    clics: data_interstitiel.total_clicks_antenneInterstitiel,
                    ctr_clics: data_interstitiel.interstitiel_antenne_ctr,
                    vtr: '-',

                }

            }

        }

        if (data_habillage.habillageImpressions.length > 0) {

            if (data_habillage.total_impressions_linfoHabillage !== "0") {

                dataset_site[5] = {

                    formats: 'HABILLAGE',
                    sites: data_habillage.habillage_linfo_siteName,
                    impressions: data_habillage.total_impressions_linfoHabillage,
                    clics: data_habillage.total_clicks_linfoHabillage,
                    ctr_clics: data_habillage.habillage_linfo_ctr,
                    vtr: '-',

                }

            }
            if (data_habillage.total_impressions_linfo_androidHabillage !== "0") {
                dataset_site[6] = {
                    formats: 'HABILLAGE',
                    sites: data_habillage.habillage_linfo_android_siteName,
                    impressions: data_habillage.total_impressions_linfo_androidHabillage,
                    clics: data_habillage.total_clicks_linfo_androidHabillage,
                    ctr_clics: data_habillage.habillage_linfo_android_ctr,
                    vtr: '-',

                }
            }
            if (data_habillage.total_impressions_linfo_iosHabillage !== "0") {
                dataset_site[7] = {
                    formats: 'HABILLAGE',
                    sites: data_habillage.habillage_linfo_ios_siteName,
                    impressions: data_habillage.total_impressions_linfo_iosHabillage,
                    clics: data_habillage.total_clicks_linfo_iosHabillage,
                    ctr_clics: data_habillage.habillage_linfo_ios_ctr,
                    vtr: '-',

                }
            }

            if (data_habillage.total_impressions_dtjHabillage !== "0") {

                dataset_site[8] = {
                    formats: 'HABILLAGE',
                    sites: data_habillage.habillage_dtj_siteName,
                    impressions: data_habillage.total_impressions_dtjHabillage,
                    clics: data_habillage.total_clicks_dtjHabillage,
                    ctr_clics: data_habillage.habillage_dtj_ctr,
                    vtr: '-',

                }

            }
            if (data_habillage.total_impressions_antenneHabillage !== "0") {

                dataset_site[9] = {
                    formats: 'HABILLAGE',
                    sites: data_habillage.habillage_antenne_siteName,
                    impressions: data_habillage.total_impressions_antenneHabillage,
                    clics: data_habillage.total_clicks_antenneHabillage,
                    ctr_clics: data_habillage.habillage_antenne_ctr,
                    vtr: '-',

                }

            }

        }

        if (data_masthead.mastheadImpressions.length > 0) {

            if (data_masthead.total_impressions_linfoMasthead !== "0") {

                dataset_site[10] = {

                    formats: 'MASTHEAD',
                    sites: data_masthead.masthead_linfo_siteName,
                    impressions: data_masthead.total_impressions_linfoMasthead,
                    clics: data_masthead.total_clicks_linfoMasthead,
                    ctr_clics: data_masthead.masthead_linfo_ctr,
                    vtr: '-',

                }

            }
            if (data_masthead.total_impressions_linfo_androidMasthead !== "0") {
                dataset_site[11] = {
                    formats: 'MASTHEAD',
                    sites: data_masthead.masthead_linfo_android_siteName,
                    impressions: data_masthead.total_impressions_linfo_androidMasthead,
                    clics: data_masthead.total_clicks_linfo_androidMasthead,
                    ctr_clics: data_masthead.masthead_linfo_android_ctr,
                    vtr: '-',

                }
            }
            if (data_masthead.total_impressions_linfo_iosMasthead !== "0") {
                dataset_site[12] = {
                    formats: 'MASTHEAD',
                    sites: data_masthead.masthead_linfo_ios_siteName,
                    impressions: data_masthead.total_impressions_linfo_iosMasthead,
                    clics: data_masthead.total_clicks_linfo_iosMasthead,
                    ctr_clics: data_masthead.masthead_linfo_ios_ctr,
                    vtr: '-',

                }
            }

            if (data_masthead.total_impressions_dtjMasthead !== "0") {

                dataset_site[13] = {
                    formats: 'MASTHEAD',
                    sites: data_masthead.masthead_dtj_siteName,
                    impressions: data_masthead.total_impressions_dtjMasthead,
                    clics: data_masthead.total_clicks_dtjMasthead,
                    ctr_clics: data_masthead.masthead_dtj_ctr,
                    vtr: '-',

                }

            }
            if (data_masthead.total_impressions_antenneMasthead !== "0") {

                dataset_site[14] = {
                    formats: 'MASTHEAD',
                    sites: data_masthead.masthead_antenne_siteName,
                    impressions: data_masthead.total_impressions_antenneMasthead,
                    clics: data_masthead.total_clicks_antenneMasthead,
                    ctr_clics: data_masthead.masthead_antenne_ctr,
                    vtr: '-',

                }

            }

        }

        if (data_grand_angle.grand_angleImpressions.length > 0) {

            if (data_grand_angle.total_impressions_linfoGrandAngle !== "0") {

                dataset_site[15] = {

                    formats: 'GRAND ANGLE',
                    sites: data_grand_angle.grandAngle_linfo_siteName,
                    impressions: data_grand_angle.total_impressions_linfoGrandAngle,
                    clics: data_grand_angle.total_clicks_linfoGrandAngle,
                    ctr_clics: data_grand_angle.grandAngle_linfo_ctr,
                    vtr: '-',

                }

            }
            if (data_grand_angle.total_impressions_linfo_androidGrandAngle !== "0") {
                dataset_site[12] = {
                    formats: 'GRAND ANGLE',
                    sites: data_grand_angle.grandAngle_linfo_android_siteName,
                    impressions: data_grand_angle.total_impressions_linfo_androidGrandAngle,
                    clics: data_grand_angle.total_clicks_linfo_androidGrandAngle,
                    ctr_clics: data_grand_angle.grandAngle_linfo_android_ctr,
                    vtr: '-',

                }
            }
            if (data_grand_angle.total_impressions_linfo_iosGrandAngle !== "0") {
                dataset_site[16] = {
                    formats: 'GRAND ANGLE',
                    sites: data_grand_angle.grandAngle_linfo_ios_siteName,
                    impressions: data_grand_angle.total_impressions_linfo_iosGrandAngle,
                    clics: data_grand_angle.total_clicks_linfo_iosGrandAngle,
                    ctr_clics: data_grand_angle.grandAngle_linfo_ios_ctr,
                    vtr: '-',

                }
            }

            if (data_grand_angle.total_impressions_dtjGrandAngle !== "0") {

                dataset_site[17] = {
                    formats: 'GRAND ANGLE',
                    sites: data_grand_angle.grandAngle_dtj_siteName,
                    impressions: data_grand_angle.total_impressions_dtjGrandAngle,
                    clics: data_grand_angle.total_clicks_dtjGrandAngle,
                    ctr_clics: data_grand_angle.grandAngle_dtj_ctr,
                    vtr: '-',

                }

            }
            if (data_grand_angle.total_impressions_antenneGrandAngle !== "0") {

                dataset_site[18] = {
                    formats: 'GRAND ANGLE',
                    sites: data_grand_angle.grandAngle_antenne_siteName,
                    impressions: data_grand_angle.total_impressions_antenneGrandAngle,
                    clics: data_grand_angle.total_clicks_antenneGrandAngle,
                    ctr_clics: data_grand_angle.grandAngle_antenne_ctr,
                    vtr: '-',

                }

            }

        }

        if (data_video.videoImpressions.length > 0) {

            if (data_video.total_impressions_linfoVideo !== "0") {

                dataset_site[19] = {

                    formats: 'VIDEO',
                    sites: data_video.video_linfo_siteName,
                    impressions: data_video.total_impressions_linfoVideo,
                    clics: data_video.total_clicks_linfoVideo,
                    ctr_clics: data_video.video_linfo_ctr,
                    vtr: data_video.VTR_linfo,

                }

            }
            if (data_video.total_impressions_linfo_androidVideo !== "0") {
                dataset_site[20] = {
                    formats: 'VIDEO',
                    sites: data_video.video_linfo_android_siteName,
                    impressions: data_video.total_impressions_linfo_androidVideo,
                    clics: data_video.total_clicks_linfo_androidVideo,
                    ctr_clics: data_video.video_linfo_android_ctr,
                    vtr: data_video.VTR_linfo_android,

                }
            }
            if (data_video.total_impressions_linfo_iosVideo !== "0") {
                dataset_site[21] = {
                    formats: 'VIDEO',
                    sites: data_video.video_linfo_ios_siteName,
                    impressions: data_video.total_impressions_linfo_iosVideo,
                    clics: data_video.total_clicks_linfo_iosVideo,
                    ctr_clics: data_video.video_linfo_ios_ctr,
                    vtr: data_video.VTR_linfo_ios,

                }
            }

            if (data_video.total_impressions_dtjVideo !== "0") {

                dataset_site[22] = {
                    formats: 'VIDEO',
                    sites: data_video.video_antenne_siteName,
                    impressions: data_video.total_impressions_antenneVideo,
                    clics: data_video.total_clicks_antenneVideo,
                    ctr_clics: data_video.video_antenne_ctr,
                    vtr: data_video.VTR_antenne,

                }

            }
            if (data_video.total_impressions_antenneVideo !== "0") {

                dataset_site[23] = {
                    formats: 'VIDEO',
                    sites: data_video.video_antenne_siteName,
                    impressions: data_video.total_impressions_antenneVideo,
                    clics: data_video.total_clicks_antenneVideo,
                    ctr_clics: data_video.video_antenne_ctr,
                    vtr: data_video.VTR_antenne,

                }

            }

            if (data_video.total_impressions_tf1Video !== "0") {

                dataset_site[24] = {
                    formats: 'VIDEO',
                    sites: data_video.video_tf1_siteName,
                    impressions: data_video.total_impressions_tf1Video,
                    clics: data_video.total_clicks_tf1Video,
                    ctr_clics: data_video.video_tf1_ctr,
                    vtr: data_video.VTR_tf1,

                }
            }

            if (data_video.total_impressions_m6Video !== "0") {

                dataset_site[25] = {
                    formats: 'VIDEO',
                    sites: data_video.video_m6_siteName,
                    impressions: data_video.total_impressions_m6Video,
                    clics: data_video.total_clicks_m6Video,
                    ctr_clics: data_video.video_m6_ctr,
                    vtr: data_video.VTR_m6,

                }
            }

            if (data_video.total_impressions_dailymotionVideo !== "0") {

                dataset_site[26] = {
                    formats: 'VIDEO',
                    sites: data_video.video_dailymotion_siteName,
                    impressions: data_video.total_impressions_dailymotionVideo,
                    clics: data_video.total_clicks_dailymotionVideo,
                    ctr_clics: data_video.video_dailymotion_ctr,
                    vtr: data_video.VTR_dailymotion,

                }
            }

        }

        if (data_native.nativeImpressions.length > 0) {

            if (data_native.total_impressions_linfoNative !== "0") {

                dataset_site[27] = {

                    formats: 'NATIVE',
                    sites: data_native.native_linfo_siteName,
                    impressions: data_native.total_impressions_linfoNative,
                    clics: data_native.total_clicks_linfoNative,
                    ctr_clics: data_native.native_linfo_ctr,
                    vtr: '-',

                }

            }
            if (data_native.total_impressions_linfo_androidNative !== "0") {
                dataset_site[28] = {
                    formats: 'NATIVE',
                    sites: data_native.native_linfo_android_siteName,
                    impressions: data_native.total_impressions_linfo_androidNative,
                    clics: data_native.total_clicks_linfo_androidNative,
                    ctr_clics: data_native.native_linfo_android_ctr,
                    vtr: '-',

                }
            }
            if (data_native.total_impressions_linfo_iosNative !== "0") {
                dataset_site[29] = {
                    formats: 'NATIVE',
                    sites: data_native.native_linfo_ios_siteName,
                    impressions: data_native.total_impressions_linfo_iosNative,
                    clics: data_native.total_clicks_linfo_iosNative,
                    ctr_clics: data_native.native_linfo_ios_ctr,
                    vtr: '-',

                }
            }

            if (data_native.total_impressions_dtjNative !== "0") {

                dataset_site[30] = {
                    formats: 'NATIVE',
                    sites: data_native.native_dtj_siteName,
                    impressions: data_native.total_impressions_dtjNative,
                    clics: data_native.total_clicks_dtjNative,
                    ctr_clics: data_native.native_dtj_ctr,
                    vtr: '-',

                }

            }
            if (data_native.total_impressions_antenneNative !== "0") {

                dataset_site[31] = {
                    formats: 'NATIVE',
                    sites: data_native.native_antenne_siteName,
                    impressions: data_native.total_impressions_antenneNative,
                    clics: data_native.total_clicks_antenneNative,
                    ctr_clics: data_native.native_antenne_ctr,
                    vtr: '-',

                }

            }

        }

        // Define an array of merges. 1-1 = A:1
        // The merges are independent of the data.
        // A merge will overwrite all data _not_ in the top-left cell.
        const merges = [{
            start: {
                row: 1,
                column: 1
            },
            end: {
                row: 1,
                column: 5
            }
        },

        ]

        // Create the excel report.
        // This function will return Buffer
        const report = excel.buildExport(
            [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                {
                    name: 'Bilan', // <- Specify sheet name (optional)
                    heading: heading, // <- Raw heading array (optional)
                    merges: merges, // <- Merge cell ranges
                    specification: bilan_global, // <- Report specification
                    data: dataset_global // <-- Report data
                },
                {
                    name: 'Formats',
                    // heading : headingformats,
                    specification: bilan_formats,
                    data: dataset_format
                },
                {
                    name: 'Sites',
                    // heading : headingsites, 
                    specification: bilan_sites, // <- Report specification
                    data: dataset_site // <-- Report data
                }
            ]
        );

        // You can then return this straight
        //rapport_antennesb-202105031152-ESPACE_DECO-67590.xls
        res.attachment('rapport_antennesb-' + label_now + '-' + campaign_name + '.xlsx'); // This is sails.js specific (in general you need to set headers)

        return res.send(report);

        // OR you can save this buffer to the disk by creating a file.

    } catch (error) {
        console.log(error)

    }

};

exports.test_exportExcel = async (req, res) => {

    var campaign_name = "ESPACE DECO - 67590"
    var date_now = "03/04/2021"
    var StartDate = "16/04/2021"
    var EndDate = "03/05/2021"

    try {

        // You can define styles as json object
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
                    bold: true,
                    underline: true
                },
                alignment: {
                    vertical: "center"
                }
            },

        };

        // 

        //Array of objects representing heading rows (very top)
        const heading = [
            [{
                value: 'Rapport :' + campaign_name,
                style: styles.headerDark,
                alignment: styles.alignment
            }

            ],
            // ['Date de génération : ' + date_now +' | ' + 'Période diffusion :' + StartDate + '-' + EndDate
            // ] 
            ['Date de génération : ' + date_now,

            ],
            ['Période diffusion :' + StartDate + '-' + EndDate]
        ];

        //Here you specify the export structure
        const bilan_global = {

            impressions: { // <- the key should match the actual data key
                displayName: 'Impressions', // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                width: 400 // <- width in pixels
            },
            clics: {
                displayName: 'Clics',
                headerStyle: styles.headerDark,
                width: 220 // <- width in chars (when the number is passed as string)
            },
            ctr_clics: {
                displayName: 'Taux de clics',
                headerStyle: styles.headerDark,
                width: 220 // <- width in pixels
            },
            vu: {
                displayName: 'Visiteurs Uniques',
                headerStyle: styles.headerDark,
                width: 220 // <- width in pixels
            },
            repetions: {
                displayName: 'Répétition',
                headerStyle: styles.headerDark,
                width: 220 // <- width in pixels
            }
        }

        const bilan_sites = {

            sites: { // <- the key should match the actual data key
                displayName: 'Sites', // <- Here you specify the column header
                headerStyle: styles.headerDark, // <- Header style
                width: 220 // <- width in pixels
            },
            impressions: {
                displayName: 'Impressions',
                headerStyle: styles.headerDark,
                width: 120 // <- width in chars (when the number is passed as string)
            },
            clics: {
                displayName: 'Clics',
                headerStyle: styles.headerDark,
                width: 120 // <- width in chars (when the number is passed as string)
            },
            ctr_clics: {
                displayName: 'Taux de clics',
                headerStyle: styles.headerDark,
                width: 120 // <- width in pixels
            },
            repetions: {
                displayName: 'Répétition',
                headerStyle: styles.headerDark,
                width: 120 // <- width in pixels
            },
            /* vtr: {
                 displayName: 'VTR',
                 headerStyle: styles.headerDark,
                 width: 220 // <- width in pixels
             }*/

        }

        // The data set should have the following shape (Array of Objects)
        // The order of the keys is irrelevant, it is also irrelevant if the
        // dataset contains more fields as the report is build based on the
        // specification provided above. But you should have all the fields
        // that are listed in the report specification
        const dataset = [{
            impressions: '19 535',
            clics: '1 101',
            ctr_clics: '5.64%',
            vu: '9 341',
            repetions: '2.09'

        },

        ]
        const dataset2 = [{
            sites: 'SM_LINFO.re',
            impressions: '1 503	',
            clics: '111',
            ctr_clics: '7.39%',
            // vtr: '55.76%',
            repetions: '0'

        },
        {
            sites: 'SM_LINFO.re',
            impressions: '1 503	',
            clics: '111',
            ctr_clics: '7.39%',
            // vtr: '55.76%',
            repetions: '0'

        },

        ]

        // Define an array of merges. 1-1 = A:1
        // The merges are independent of the data.
        // A merge will overwrite all data _not_ in the top-left cell.
        //permet fusionne des colonne
        const merges = [{
            start: {
                row: 1,
                column: 1
            },
            end: {
                row: 1,
                column: 5
            }
        },

        ]

        // Create the excel report.
        // This function will return Buffer
        const report = excel.buildExport(
            [ // <- Notice that this is an array. Pass multiple sheets to create multi sheet report
                {
                    name: 'Bilan_global', // <- Specify sheet name (optional)
                    heading: heading, // <- Raw heading array (optional)
                    merges: merges, // <- Merge cell ranges
                    specification: bilan_global, // <- Report specification
                    data: dataset // <-- Report data
                },
                {
                    name: 'Bilan_par_sites', // <- Specify sheet name (optional)
                    heading: headingformats,
                    // merges: merges2, // <- Merge cell ranges
                    specification: bilan_sites, // <- Report specification
                    data: dataset2 // <-- Report data
                }
            ]
        );

        // You can then return this straight
        //rapport_antennesb-202105031152-ESPACE_DECO-67590.xls
        res.attachment('rapport_antennesb-202105031152-' + campaign_name + '.xlsx'); // This is sails.js specific (in general you need to set headers)

        return res.send(report);

        // OR you can save this buffer to the disk by creating a file.

    } catch (error) {
        console.log(error)

    }

};

exports.array_unique = async (req, res) => {
    const startingArray = [
        '1906349', '1906349', '1907952',
        '1907952', '1910250', '1910250',
        '1910676', '1910676', '1912561',
        '1913293', '1913826', '1913885',
        '1913826', '1914459', '1914459',
        '1914459', '1915190', '1915190',
        '1915907', '1915907', 'N/A',
    ];

    function unique(array) {
        return array.filter(function (el, index, arr) {
            return index == arr.indexOf(el);
        });
    }

    const uniqueArray = unique(startingArray);

    console.log(uniqueArray);
}

exports.nodemail = async (req, res) => {

    var campaign_crypt = "c4ca4238a0b923820dcc509a6f75849b"
    var campaign_tv_name = "Campagne soldes Mairie du Port février 2022"
    var email = "alvine.didier@antennereunion.fr"
    var user_firstname = "Océane"

    nodeoutlook.sendEmail({

       // debug:true,
        //logs:true,
        auth: {
            user: "oceane.sautron@antennereunion.fr",
            pass: ""
        },
        from: 'oceane.sautron@antennereunion.fr',
        to: email,
        subject: 'Envoie du permalien de la campagne ' + campaign_tv_name,
        html: ' <head><style>font-family: Century Gothic;    font-size: large; </style></head>Bonjour ' +
            user_firstname + '<br><br>  Tu trouveras ci-dessous le permalien pour la campagne <b>"' +
            campaign_tv_name + '"</b> : <a traget="_blank" href="https://reporting.antennesb.fr/t/' +
            campaign_crypt + '">https://reporting.antennesb.fr/t/' +
            campaign_crypt + '</a> <br><br> À dispo pour échanger <br><br> <div style="font-size: 11pt;font-family: Calibri,sans-serif;"><img src="https://reporting.antennesb.fr/public/admin/photos/logo.png" width="79px" height="48px"><br><br><p><strong>L\'équipe Adtraffic</strong><br><small>Antenne Solutions Business<br><br> 2 rue Emile Hugot - Technopole de La Réunion<br> 97490 Sainte-Clotilde<br> Fixe : 0262 48 47 54<br> Fax : 0262 48 28 01 <br> Mobile : 0692 05 15 90<br> <a href="mailto:adtraffic@antennereunion.fr">adtraffic@antennereunion.fr</a></small></p></div>'

        ,

        onError: (e) => console.log(e),
        onSuccess: (i) => res.json({message:"ok"})


    })

};

exports.read_excel = async (req, res) => {

    var workbook = new ExcelJS.Workbook();
    workbook.xlsx.readFile('data/tv/Campagne_Leclerc-Plan_Campagne-132748939578174030.xlsx')

        .then(function () {

            // Note: workbook.worksheets.forEach will still work but this is better
            workbook.eachSheet(function (worksheet, sheetId) {

                /*
                worksheet.eachRow({
                    includeEmpty: true
                }, async (row, rowNumber) => {

                     //console.log(row.values);

                    data = row.values
                    numberLine = data.length
                    console.log(numberLine)

                    for (i = 1; i < numberLine; i++) {
                        dataList.push(row.values[i])

                        if (dataList.match(/(?='Montée en charge)(.*)(?<='Total')/igm)) {
                            dataList1.push(row.values[i])

                        }
                    }
                })
                */

                if (sheetId === 1) {
                    console.log(worksheet.name)
                    console.log(sheetId);

                    console.log()

                    const campagne = worksheet.getCell('C3').value;
                    const periode = worksheet.getCell('C4').value;
                    const monnaie = worksheet.getCell('C7').value;
                    const budget = worksheet.getCell('C8').value;
                    const effectif = worksheet.getCell('C9').value;
                    const annonceur = worksheet.getCell('H3').value;
                    const version = worksheet.getCell('H6').value;

                    console.log('campagne', campagne)
                    console.log('periode', periode)
                    console.log('monnaie', monnaie)
                    console.log('budget', budget)
                    console.log('effectif', effectif)
                    console.log('annonceur', annonceur)
                    console.log('version', version)
                    console.log('------------------------------------------')

                    const vT = worksheet.getCell('A20').value;
                    const vT1 = worksheet.getCell('A30').value;

                    console.log(' A20 : ', vT);
                    console.log(' A30 : ', vT1);

                    console.log('------------------------------------------')

                    dataLines = new Array();
                    dataLinesName = new Object();
                    dataItems = new Array();

                    // Iterate over all rows that have values in a worksheet
                    worksheet.eachRow(function (row, rowNumber) {
                        value = row.values;
                        dataLines.push(row.values);
                        numberCols = value.length;

                        if (value[1] === "Chaîne") {
                            var chaine_begin = rowNumber;
                            dataItems['chaine_begin'] = rowNumber;
                            console.log('[x] Chaîne - Begin :' + chaine_begin);
                        }
                        // if(value[1] === "Total") { var chaine_end = rowNumber;  console.log('[x] Chaîne - End : ' + chaine_end) }

                        if (value[1] === "Montée en charge / Jour") {
                            var montee_en_charge_begin = rowNumber;
                            dataItems['montee_en_charge_begin'] = rowNumber;
                            console.log('[x] Montée en charge / Jour - Begin :' + montee_en_charge_begin);
                        }
                        // if(value[1] === "Total") { var montee_en_charge_end = rowNumber;  console.log('[x] Montée en charge / Jour - End : ' + montee_en_charge_end) }

                        if (value[1] === "Journal tranches horaires") {
                            var tranches_horaires_begin = rowNumber;
                            dataItems['tranches_horaires_begin'] = rowNumber;
                            console.log('[x] Journal tranches horaires - End : ' + tranches_horaires_begin);
                        }
                        // if(value[1] === "Total") { var tranches_horaires_end = rowNumber;  console.log('[x] Journal tranches horaires / Jour - End : ' + tranches_horaires_end) }

                        if (value[1] === "Jour nommé") {
                            var jour_nomme_begin = rowNumber;
                            dataItems['jour_nomme_begin'] = rowNumber;
                            console.log('[x] Jour nommé - Begin : ' + jour_nomme_begin);
                        }
                        // if(value[1] === "Total") { var jour_nomme_end = rowNumber;  console.log('[x] Jour nommé - End : ' + jour_nomme_end) }

                        // console.log('Ligne ' + rowNumber + ' (Item : '+ numberCols +') = ' + JSON.stringify(row.values) + ' - | - '+value[1]);
                    })

                    console.log('dataItems :', dataItems);

                    worksheet.eachRow(function (row, rowNumber) {
                        value = row.values;
                        dataLines.push(row.values);
                        numberCols = value.length;
                        naming = value[1];
                        const regexDateMonteeEnCharge = /([0-9]{2}\/[0-9]{2}\/[0-9]{2})/gi;
                        const regexTranchesHoraires = /([0-9]{2}h[0-9]{2} [0-9]{2}h[0-9]{2})/gi;
                        const regexChaine = /Antenne Réunion/gi;
                        const regexJourSemaine = /(Lundi|Mardi|Mercredi|Jeudi|Vendredi|Samedi|Dimanche)/gi;

                        if ((rowNumber > dataItems['chaine_begin']) && naming.match(regexChaine) && (numberCols > 2)) {
                            console.log('chaine_begin : Ligne ' + rowNumber + ' (Item : ' + numberCols + ') = ' + JSON.stringify(row.values) + ' - | - ' + value[1]);
                        }

                        if ((rowNumber > dataItems['montee_en_charge_begin']) && naming.match(regexDateMonteeEnCharge) && (numberCols > 2)) {
                            console.log('montee_en_charge_begin : Ligne ' + rowNumber + ' (Item : ' + numberCols + ') = ' + JSON.stringify(row.values) + ' - | - ' + value[1]);
                        }

                        if ((rowNumber > dataItems['tranches_horaires_begin']) && naming.match(regexTranchesHoraires) && (numberCols > 2)) {
                            console.log('tranches_horaires_begin : Ligne ' + rowNumber + ' (Item : ' + numberCols + ') = ' + JSON.stringify(row.values) + ' - | - ' + value[1]);
                        }

                        if ((rowNumber > dataItems['jour_nomme_begin']) && naming.match(regexJourSemaine) && (numberCols > 2)) {
                            console.log('jour_nomme_begin : Ligne ' + rowNumber + ' (Item : ' + numberCols + ') = ' + JSON.stringify(row.values) + ' - | - ' + value[1]);
                        }

                        // console.log('Ligne ' + rowNumber + ' (Item : '+ numberCols +') = ' + JSON.stringify(row.values) + ' - | - '+value[1]);
                    })

                    console.log('Total lignes :' + dataLines.length);
                    console.log('numberCols :' + dataLinesName);
                }

            });

        });

};

exports.creative = async (req, res) => {

    var body = {
        insertion_id: '10524742',
        format_group_id: 'GRAND ANGLE',
        pack_id: '1',
        display_mobile_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LEAL_REUNION/20201104/BMWSERIE4-63594/300x250.jpg',
        display_mobile_url: 'https://www.bmw.re/',
        display_tablet_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LEAL_REUNION/20201104/BMWSERIE4-63594/300x250.jpg',
        display_tablet_url: 'https://www.bmw.re/',
        display_desktop_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LEAL_REUNION/20201104/BMWSERIE4-63594/300x600.jpg',
        display_desktop_url: 'https://www.bmw.re/',
        video_file: '',
        video_url: '',
        submit: 'Créer une nouvelle insertion'
    }

    requestCreatives = {

        "InsertionId": body.insertion_id,

        "Name": "Creative test",

        "FileName": "File desktop bmw",

        "Url": body.display_desktop_file,

        "clickUrl": body.display_desktop_url,

        "Width": 300,

        "Height": 600,

        "CreativeTypeId": 1, //creative type image (jpeg,gif)

        "IsActivated": "true"

    }

    let creative_create = await AxiosFunction.postManage(
        'creatives',
        requestCreatives
    );

    if (creative_create.headers.location) {
        console.log(creative_create.headers.location)

        const templateId = await ModelTemplates.findOne({
            where: {
                template_id: 84585 //Default Banner
            }
        })

        var RequestInsertionTemplate = {
            "InsertionId": body.insertion_id,
            "ParameterValues": templateId.parameter_default_values,
            "TemplateId": templateId.template_id
        }

        await AxiosFunction.putManage(
            'insertiontemplates',
            RequestInsertionTemplate
        );

        return res.json({
            type: 'success',
            intro: 'Ok',
            message: 'La créative a été crée dans SMARTADSERVEUR',

        })
    }
}

exports.taskid = async (req, res) => {

    campaign = {
        campaign_id: '1922883',
        campaign_name: 'GAMM VERT - 68873',
        campaign_crypt: '00641bb74c0a9ee8f67a6300e8909ea4',
        campaign_start_date: '2021-07-05 00:00:00',
        campaign_end_date: '2021-12-26 23:59:00',
        advertiser: {
            advertiser_id: '445116',
            advertiser_name: 'AGRI DEV'

        }

    }

    var campaign_id = campaign.campaign_id;
    var campaign_date_start = moment(campaign.campaign_start_date);
    var campaign_date_end = moment(campaign.campaign_end_date);

    var endDate_day = new Date(campaign_date_end);
    var endDate_last = endDate_day.setDate(endDate_day.getDate() + 1);

    const now = new Date();
    const timestamp_datenow = now.getTime();

    if (endDate_last > timestamp_datenow) {
        campaign_date_end = moment(timestamp_datenow);
        console.log(campaign_date_end)
    }

    var diff_day = campaign_date_end.diff(campaign_date_start, 'd');
    let cacheStorageID = 'campaignID-' + campaign_id;

    /*----------- Si la campagne > 30j ------------*/

    var NbrTask = Math.ceil(diff_day / 30);
    console.log('NbrTask : ' + NbrTask);

    let TaskIDG = localStorageTasks.getItem(cacheStorageID + '-TaskIdAll');

    //Si localStorage avec tous les taskId n'existe pas on lance la génération des taskId
    if (!TaskIDG) {

        const arrayTaskId = new Array()

        for (var index = 0; index < NbrTask; index++) {

            if (index === 0) {
                console.log('NbrTask : ' + index);

                campaign_date_startOne = moment(campaign_date_start, "DD/MM/YYYY").format('YYYY-MM-DDT00:00:00')
                var campaign_task_date_end = campaign_date_start.add(30, 'days');
                campaign_task_date_endOne = moment(campaign_task_date_end, "DD/MM/YYYY").format('YYYY-MM-DDT23:59:00')
                var campaign_task_date_tomorrow = campaign_task_date_end = campaign_task_date_end.add(1, 'days');

                taskOne = await Utilities.RequestReportDate(campaign_date_startOne, campaign_task_date_endOne, campaign_id)
                arrayTaskId.push(taskOne)

            }

            if ((index >= 1) && (index < (NbrTask - 1)) && campaign_task_date_tomorrow) {
                console.log('NbrTask : ' + index);

                var campaign_start_date_tomorrow = moment(campaign_task_date_tomorrow, "DD/MM/YYYY").format('YYYY-MM-DDT00:00:00')
                var campaign_task_date_end = campaign_task_date_tomorrow.add(30, 'days');
                var campaign_start_end_tomorrow = moment(campaign_task_date_end, "DD/MM/YYYY").format('YYYY-MM-DDT23:59:00')
                var campaign_task_date_tomorrow = campaign_task_date_end = campaign_task_date_end.add(1, 'days');

                taskTwo = await Utilities.RequestReportDate(campaign_start_date_tomorrow, campaign_start_end_tomorrow, campaign_id)
                arrayTaskId.push(taskTwo)

            }

            if (index === (NbrTask - 1) && (index > 1) && campaign_task_date_tomorrow) {
                console.log('NbrTask : ' + index);
                var campaign_start_last = moment(campaign_task_date_tomorrow, "DD/MM/YYYY").format('YYYY-MM-DDT00:00:00')
                var campaign_enf_last = moment(campaign_date_end, "DD/MM/YYYY").format('YYYY-MM-DDT23:59:00')

                taskThree = await Utilities.RequestReportDate(campaign_start_last, campaign_enf_last, campaign_id)
                arrayTaskId.push(taskThree)

            }

        }
        localStorageTasks.setItem(cacheStorageID + '-TaskIdAll', arrayTaskId);
        console.log('Create localStorage TaskIdAll')

    } else {

        const taskLength = TaskIDG.split(',')
        var dataObjTaskGlobalAll = new Object()

        var time = 5000;
        let timerFile = setInterval(async () => {

            var dataLSTaskGlobalAll = localStorageTasks.getItem(
                cacheStorageID + '-taskGlobalAll'
            );

            if (!dataLSTaskGlobalAll && !Utilities.empty(TaskIDG)) {
                var ObjTaskProgress = new Array()

                for (let index = 0; index < taskLength.length; index++) {
                    const taskId = taskLength[index];

                    time += 10000;

                    let requete_global = `https://reporting.smartadserverapis.com/2044/reports/${taskId}`;

                    console.log('requete_global' + requete_global)

                    let threeLink = await AxiosFunction.getReportingData('GET', requete_global, '');

                    var jobProgress = threeLink.data.lastTaskInstance.jobProgress
                    var instanceStatus = threeLink.data.lastTaskInstance.instanceStatus

                    var itemProgress = {
                        'task': taskId,
                        'jobProgress': jobProgress,
                        'instanceStatus': instanceStatus

                    }

                    ObjTaskProgress.push(itemProgress)

                    if ((ObjTaskProgress[index].jobProgress == '1.0') && (ObjTaskProgress[index].instanceStatus == 'SUCCESS')) {

                        dataFile = await AxiosFunction.getReportingData(
                            'GET',
                            `https://reporting.smartadserverapis.com/2044/reports/${taskId}/file`,
                            ''
                        );

                        var itemData = {
                            'dataFile': dataFile.data

                        };
                        dataObjTaskGlobalAll[taskId] = itemData;

                        localStorageTasks.setItem(
                            cacheStorageID + '-taskGlobalAll',
                            JSON.stringify(dataObjTaskGlobalAll)
                        );
                        console.log(dataObjTaskGlobalAll)

                        console.log('No clear setTimeOut');

                    }
                }

                console.log(ObjTaskProgress);

            } else {

                clearInterval(timerFile);

                console.log('Stop clearInterval timerFile - else');

                process.exit()

            }
        }, time)

    }

}

exports.test_taskid = async (req, res) => {
    campaign = {
        campaign_id: '1922883',
        campaign_name: 'GAMM VERT - 68873',
        campaign_crypt: '00641bb74c0a9ee8f67a6300e8909ea4',
        campaign_start_date: '2021-07-05 00:00:00',
        campaign_end_date: '2021-12-26 23:59:00',
        advertiser: {
            advertiser_id: '445116',
            advertiser_name: 'AGRI DEV'

        }

    }

    let cacheStorageID = 'campaignID-' + campaign_id;

    // Permet de faire l'addition
    const reducer = (accumulator, currentValue) => accumulator + currentValue;

    const InsertionName = [];
    const Impressions = [];
    const Clicks = [];
    const Complete = [];
    const ViewableImpressions = [];

    const dataList = [];

    let TaskIDG = localStorageTasks.getItem(cacheStorageID + '-taskGlobalAll');
    const dataSplitGlobalALL = JSON.parse(TaskIDG);

    const keyTaskID = Object.keys(dataSplitGlobalALL);

    for (let index = 0; index < Object.keys(dataSplitGlobalALL).length; index++) {
        const element = keyTaskID[index];
        dataSplitGlobalOne = dataSplitGlobalALL[element].dataFile;

        var dataSplitGlobal = dataSplitGlobalOne.split(/\r?\n/);
        var numberLine = dataSplitGlobal.length;

        if (numberLine > 1) {
            console.log('----------------');
            console.log('TASKID : ', element, ' - ', numberLine);
            for (i = 1; i < numberLine; i++) {

                console.log('TASKID : ', element, ' - INDEX : ', i);
                line = dataSplitGlobal[i].split(';');
                // console.log(line[0])

                if (!Utilities.empty(line[0])) {

                    insertion_type = line[5];

                    InsertionName.push(line[5]);
                    Impressions.push(parseInt(line[10]));
                    Clicks.push(parseInt(line[12]));
                    Complete.push(parseInt(line[13]));
                    ViewableImpressions.push(parseInt(line[14]));

                    var itemData = {
                        'i': element + ' - ' + i,
                        'campaign_start_date': line[0],
                        'campaign_end_date': line[1],
                        'campaign_id': line[2],
                        'campaign_name': line[3],
                        'insertion_id': line[4],
                        'insertion_name': line[5],
                        'format_id': line[6],
                        'format_name': line[7],
                        'site_id': line[8],
                        'site_name': line[9],
                        // 'impressions': parseInt(line[10]),
                        'click_rate': parseInt(line[11]),
                        'clicks': parseInt(line[12]),
                        //'complete': parseInt(line[13]),
                        // 'viewable_impressions': parseInt(line[14])
                    }

                    if (insertion_type.match(/SLIDER{1}/igm)) {
                        itemData['impressions'] = parseInt(line[14]);
                    } else {
                        itemData['impressions'] = parseInt(line[10]);
                    }

                    if (insertion_type.match(/PREROLL|MIDROLL{1}/igm)) {
                        itemData['complete'] = parseInt(line[13]);
                    } else {
                        itemData['complete'] = 0;
                    }

                    // console.log(itemData)

                    //  dataList[i] = itemData;
                    dataList.push(itemData)

                }

            }
        }

    }

    // console.log(dataList)

    var formatObjects = new Object();
    if (dataList && dataList.length > 0) {

        // Initialise les formats
        var formatHabillage = new Array();
        var formatInterstitiel = new Array();
        var formatGrandAngle = new Array();
        var formatMasthead = new Array();
        var formatInstream = new Array();
        var formatRectangleVideo = new Array();
        var formatLogo = new Array();
        var formatNative = new Array();
        var formatSlider = new Array();
        var formatMea = new Array();
        var formatSliderVideo = new Array();
        var formatClickCommand = new Array();

        var siteLINFO = new Array();
        var siteLINFO_ANDROID = new Array();
        var siteLINFO_IOS = new Array();
        var siteANTENNEREUNION = new Array();

        var siteDOMTOMJOB = new Array();
        var siteIMMO974 = new Array();
        var siteRODZAFER_LP = new Array();
        var siteRODZAFER_ANDROID = new Array();
        var siteRODZAFER_IOS = new Array();
        var siteRODALI = new Array();
        var siteORANGE_REUNION = new Array();
        var siteTF1 = new Array();
        var siteM6 = new Array();
        var siteDAILYMOTION = new Array();

        for (var index = 0; index < dataList.length; index++) {
            var insertion_name = dataList[index].insertion_name;
            var site_id = dataList[index].site_id;
            var site_name = dataList[index].site_name;

            // console.log(site_name + ' - ' + index)
            // console.log(insertion_name + ' - ' + index)

            // Créer les tableaux des formats
            if (insertion_name.match(/HABILLAGE{1}/igm)) {
                formatHabillage.push(index);
            }
            if (insertion_name.match(/INTERSTITIEL{1}/igm)) {
                formatInterstitiel.push(index);
            }
            if (insertion_name.match(/MASTHEAD{1}/igm)) {
                formatMasthead.push(index);
            }
            if (insertion_name.match(/GRAND ANGLE{1}/igm)) {
                formatGrandAngle.push(index);
            }
            if (insertion_name.match(/PREROLL|MIDROLL{1}/igm)) {
                formatInstream.push(index);
            }
            if (insertion_name.match(/RECTANGLE VIDEO{1}/igm)) {
                formatRectangleVideo.push(index);
            }
            if (insertion_name.match(/LOGO{1}/igm)) {
                formatLogo.push(index);
            }
            if (insertion_name.match(/NATIVE{1}/igm)) {
                formatNative.push(index);
            }
            if (insertion_name.match(/SLIDER VIDEO{1}/igm)) {
                formatSliderVideo.push(index);
            }
            if (insertion_name.match(/SLIDER{1}/igm)) {
                formatSlider.push(index);
            }
            if (insertion_name.match(/^\MEA{1}/igm)) {
                formatMea.push(index);
            }
            if (insertion_name.match(/CLICK COMMAND{1}|CC/igm)) {
                formatClickCommand.push(index);
            }

            // Créer les tableaux des sites
            if (site_name.match(/^\SM_LINFO.re{1}/igm)) {
                siteLINFO.push(index);
            }
            if (site_name.match(/^\SM_LINFO_ANDROID{1}/igm)) {
                siteLINFO_ANDROID.push(index);
            }
            if (site_name.match(/^\SM_LINFO_IOS{1}/igm)) {
                siteLINFO_IOS.push(index);
            }
            if (site_name.match(/^\SM_ANTENNEREUNION{1}/igm)) {
                siteANTENNEREUNION.push(index);
            }
            if (site_name.match(/^\SM_DOMTOMJOB{1}/igm)) {
                siteDOMTOMJOB.push(index);
            }
            if (site_name.match(/^\SM_IMMO974{1}/igm)) {
                siteIMMO974.push(index);
            }
            if (site_name.match(/^\SM_RODZAFER_LP{1}/igm)) {
                siteRODZAFER_LP.push(index);
            }
            if (site_name.match(/^\SM_RODZAFER_ANDROID{1}/igm)) {
                siteRODZAFER_ANDROID.push(index);
            }
            if (site_name.match(/^\SM_RODZAFER_IOS{1}/igm)) {
                siteRODZAFER_IOS.push(index);
            }
            if (site_name.match(/^\SM_ORANGE_REUNION{1}/igm)) {
                siteORANGE_REUNION.push(index);
            }
            if (site_name.match(/^\SM_TF1{1}/igm)) {
                siteTF1.push(index);
            }
            if (site_name.match(/^\SM_M6{1}/igm)) {
                siteM6.push(index);
            }
            if (site_name.match(/^\SM_DAILYMOTION{1}/igm)) {
                siteDAILYMOTION.push(index);
            }
            if (site_name.match(/^\SM_RODALI{1}/igm)) {
                siteRODALI.push(index);
            }

        }
        // Trie les formats et compatibilise les insertions et autres clics
        if (!Utilities.empty(formatHabillage)) {
            formatObjects.habillage = SmartFunction.sortDataReport(
                formatHabillage,
                dataList
            );
        }
        if (!Utilities.empty(formatInterstitiel)) {
            formatObjects.interstitiel = SmartFunction.sortDataReport(
                formatInterstitiel,
                dataList
            );
        }
        if (!Utilities.empty(formatMasthead)) {
            formatObjects.masthead = SmartFunction.sortDataReport(formatMasthead, dataList);
        }
        if (!Utilities.empty(formatGrandAngle)) {
            formatObjects.grandangle = SmartFunction.sortDataReport(
                formatGrandAngle,
                dataList
            );
        }
        if (!Utilities.empty(formatInstream)) {
            formatObjects.instream = SmartFunction.sortDataReport(formatInstream, dataList);
        }
        if (!Utilities.empty(formatRectangleVideo)) {
            formatObjects.rectanglevideo = SmartFunction.sortDataReport(
                formatRectangleVideo,
                dataList
            );
        }
        if (!Utilities.empty(formatLogo)) {
            formatObjects.logo = SmartFunction.sortDataReport(formatLogo, dataList);
        }
        if (!Utilities.empty(formatNative)) {
            formatObjects.native = SmartFunction.sortDataReport(formatNative, dataList);
        }
        if (!Utilities.empty(formatSlider)) {
            formatObjects.slider = SmartFunction.sortDataReport(formatSlider, dataList);
        }
        if (!Utilities.empty(formatMea)) {
            formatObjects.mea = SmartFunction.sortDataReport(formatMea, dataList);
        }
        if (!Utilities.empty(formatSliderVideo)) {
            formatObjects.slidervideo = SmartFunction.sortDataReport(
                formatSliderVideo,
                dataList
            );
        }

        if (!Utilities.empty(formatClickCommand)) {
            formatObjects.clickcommand = SmartFunction.sortDataReport(
                formatClickCommand,
                dataList
            );
        }

    }

    // Ajoute les infos de la campagne
    if (Impressions.length > 0) {
        campaignImpressions = Impressions.reduce(reducer);
    } else {
        campaignImpressions = null;
    }

    if (Clicks.length > 0) {
        campaignClicks = Clicks.reduce(reducer);
    } else {
        campaignClicks = null;
    }
    if (!Utilities.empty(campaignClicks) && !Utilities.empty(campaignImpressions)) {
        campaignCtr = parseFloat((campaignClicks / campaignImpressions) * 100).toFixed(
            2
        );
    } else {
        campaignCtr = null;
    }
    if (Complete.length > 0) {
        campaignComplete = Complete.reduce(reducer);
    } else {
        campaignComplete = null;
    }

    if (!Utilities.empty(campaignComplete) && !Utilities.empty(campaignImpressions)) {
        campaignCtrComplete = parseFloat(
            (campaignComplete / campaignImpressions) * 100
        ).toFixed(2);
    } else {
        campaignCtrComplete = null;
    }

    formatObjects.campaign = {
        campaign_id: campaign.campaign_id,
        campaign_name: campaign.campaign_name,
        campaign_start_date: campaign.campaign_start_date,
        campaign_end_date: campaign.campaign_end_date,
        campaign_crypt: campaign.campaign_crypt,
        advertiser_id: campaign.advertiser.advertiser_id,
        advertiser_name: campaign.advertiser.advertiser_name,
        impressions: campaignImpressions,
        clicks: campaignClicks,
        ctr: campaignCtr,
        complete: campaignComplete,
        ctrComplete: campaignCtrComplete
    }

    formatObjects.reporting_start_date = moment().format('YYYY-MM-DD HH:m:s');
    formatObjects.reporting_end_date = moment()
        .add(2, 'hours')
        .format('YYYY-MM-DD HH:m:s');

    // Créer le localStorage
    console.log(formatObjects)
    localStorage.setItem(cacheStorageID, JSON.stringify(formatObjects));

    process.exit();

}

exports.duplication = async (req, res) => {

    try {

        /*const body = {
            campaign_id: 1987679, //campagne selectionnée
            //insertion_id_model: 10535965,
            display_mobile_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LEAL_REUNION/20201104/BMWSERIE4-63594/300x250.jpg',
            display_mobile_url: 'https://www.bmw.re/',
            display_tablet_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LEAL_REUNION/20201104/BMWSERIE4-63594/300x250.jpg',
            display_tablet_url: 'https://www.bmw.re/',
            display_desktop_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LEAL_REUNION/20201104/BMWSERIE4-63594/300x600.jpg',
            display_desktop_url: 'https://www.bmw.re/',

            url_clic: 'https://www.distripc.com/',
            url_cdn: 'https://cdn.antennepublicite.re/linfo/IMG/pub/video/DISTRI_PC/20211119/DISTRI_PC_VU_SUR_ANTENNE-73641/1280x720_DISTRIPC_v3_15s.mp4'
        }*/

        const body = {
            // campaign_id: 1987679, //campagne selectionnée
            // campaign_id: 1989230, //campagne selectionnée
            // campaign_id:  1989229,

            campaign_id: 1990069,

            display_desktop_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LUCA/20211123/LA_GRANDE_RECRE-74162/SITE/300x600.jpg',
            display_desktop_url: 'https://lagranderecre.re/?utm_source=antenne&utm_medium=banner&utm_campaign=LGR_Noel&utm_id=LGR+Noel',

            display_mobile_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LUCA/20211123/LA_GRANDE_RECRE-74162/SITE/300x250.jpg',
            display_mobile_url: 'https://lagranderecre.re/?utm_source=antenne&utm_medium=banner&utm_campaign=LGR_Noel&utm_id=LGR+Noel',

            display_tablette_file: 'https://cdn.antennepublicite.re/linfo/IMG/pub/display/LUCA/20211123/LA_GRANDE_RECRE-74162/SITE/300x250.jpg',
            display_tablette_url: 'https://lagranderecre.re/?utm_source=antenne&utm_medium=banner&utm_campaign=LGR_Noel&utm_id=LGR+Noel',

        }

        await ModelInsertions.findAll({
            where: {
                campaign_id: 1988414, //campagne_id model
                insertion_id: {
                    [Op.in]: [

                        /* GRAND ANGLE */
                        10535957,
                        10535958,
                        10535959,
                        10535960,
                        10535961,
                        10535962,
                        10535963,
                        10535964,
                        10535965,
                        10535966,
                        10535967,
                        10535968,
                        10535969

                        /*Rectangle video
                        10536724,
                         10536725,
                         10536726,
                         10536727,
                         10536728,
                         10536729,
                         10536730,
                         10536731,
                         10536732,
                         10536733,
                         10536734,
                         10536735,
                         10536736*/

                        /* MASTHEAD
                        10543043,
                        10543044,
                        10543045,
                        10543046,
                        10543047,
                        10543048,
                        10543049,
                        10543050,
                        10543051,
                        10543052,
                        10543053,
                        10543054,
                        10543055 */

                        /*INTERSTITIEL
                        10543020,
                        10543021,
                        10543024,
                        10543025,
                        10543026, */

                        /*INTERSTITIEL VIDEO

                        10543022,
                        10543023,
                        10543027,
                        10543028,
                        10543029*/

                    ]
                }
            }
        }).then(async function (insertion_model) {

            for (let i = 0; i < insertion_model.length; i++) {
                if (!Utilities.empty(insertion_model)) {

                    var insertion_id_model = insertion_model[i].insertion_id
                    var insertion_name_model = insertion_model[i].insertion_name

                    requestInsertionsCopy = {

                        "name": insertion_name_model, //recupération du nom de l'insertion GET
                        "campaignId": body.campaign_id,
                        "ignorePlacements": "false",
                        "ignoreCreatives": "false"

                    }

                    let insertion_copy = await AxiosFunction.copyManage(
                        'insertions',
                        requestInsertionsCopy,
                        insertion_id_model
                    );

                    console.log(requestInsertionsCopy)

                    if (insertion_copy.headers.location) {

                        var url_location = insertion_copy.headers.location
                        var insertion_get = await AxiosFunction.getManage(url_location);
                        const insertion_id = insertion_get.data.id
                        console.log('insertion_id dupliqués ' + insertion_id)

                        var insertions_creatives_get = await AxiosFunction.getManageCopy('creatives', insertion_id);
                        var dataValue = insertions_creatives_get.data;
                        var number_line_offset = insertions_creatives_get.data.length;

                        for (let d = 0; d < number_line_offset; d++) {
                            if (!Utilities.empty(dataValue)) {

                                console.log(number_line_offset)
                                var creatives_id = dataValue[d].id
                                var creatives_name = dataValue[d].name
                                var creatives_fileName = dataValue[d].fileName
                                var creatives_width = dataValue[d].width
                                var creatives_height = dataValue[d].height
                                var creatives_typeId = dataValue[d].creativeTypeId

                                console.log({
                                    'creatives_id': creatives_id,
                                    'creatives_name': creatives_name,
                                    'creatives_fileName': creatives_fileName,
                                    'creatives_width': creatives_width,
                                    'creatives_height': creatives_height,
                                    'creatives_typeId': creatives_typeId,

                                })

                                var requestCreatives = {
                                    "fileSize": 0,
                                    "id": creatives_id,
                                    "insertionId": insertion_id,
                                    "url": body.display_desktop_file,
                                    "clickUrl": body.display_desktop_url,
                                    "name": creatives_name,
                                    "fileName": creatives_name,
                                    "width": creatives_width,
                                    "height": creatives_height,
                                    "isActivated": true,
                                    "creativeTypeId": 1,
                                    "mimeType": "image/jpeg",
                                    "percentageOfDelivery": 0,
                                    "isArchived": false,
                                    "partnerMeasurementScriptIds": []
                                }

                                //Creative de type image
                                if (creatives_typeId === 1) {

                                    //format grand angle mobile
                                    if (creatives_name.match(/300x250/igm)) {
                                        //Attention j'ai delate SM-ANDROID LINFO
                                        requestCreatives['url'] = body.display_mobile_file
                                        requestCreatives['clickUrl'] = body.display_mobile_url

                                    }
                                    //format masthead mobile
                                    if (creatives_name.match(/320x50/igm)) {
                                        //Attention j'ai delate SM-ANDROID LINFO
                                        requestCreatives['url'] = body.display_mobile_file
                                        requestCreatives['clickUrl'] = body.display_mobile_url
                                        requestCreatives['width'] = 320
                                        requestCreatives['height'] = 50

                                    }
                                    //format masthead tablette
                                    if (creatives_name.match(/640x100/igm)) {
                                        //Attention j'ai delate SM-ANDROID LINFO
                                        requestCreatives['url'] = body.display_tablette_file
                                        requestCreatives['clickUrl'] = body.display_tablette_url
                                        requestCreatives['width'] = 640
                                        requestCreatives['height'] = 100

                                    }

                                    //format interstitiel tablette
                                    if (creatives_name.match(/1536x2048_20211112141143307/igm)) {
                                        //Attention j'ai delate SM-ANDROID LINFO
                                        requestCreatives['url'] = body.display_tablette_file
                                        requestCreatives['clickUrl'] = body.display_tablette_url
                                        requestCreatives['width'] = 1536
                                        requestCreatives['height'] = 2048

                                    }

                                    //format interstitiel mobile
                                    if (creatives_name.match(/720x1280_20211112141153742/igm)) {
                                        //Attention j'ai delate SM-ANDROID LINFO
                                        requestCreatives['url'] = body.display_mobile_file
                                        requestCreatives['clickUrl'] = body.display_mobile_url
                                        requestCreatives['width'] = 720
                                        requestCreatives['height'] = 1280

                                    }

                                    await AxiosFunction.putManage(
                                        'imagecreatives',
                                        requestCreatives
                                    );
                                }

                                //Creative de type video

                                if (creatives_typeId === 2) {
                                    requestCreatives['url'] = body.url_video
                                    requestCreatives['clickUrl'] = body.url_clic_video
                                    requestCreatives['fileName'] = "1280x720"
                                    requestCreatives['width'] = 1280
                                    requestCreatives['height'] = 720
                                    requestCreatives['creativeTypeId'] = 2
                                    requestCreatives['mimeType'] = "video/mp4",
                                        requestCreatives['height'] = 720

                                    await AxiosFunction.putManage(
                                        'videocreatives',
                                        requestCreatives
                                    );
                                }

                                //Creative de type script

                                if (creatives_typeId === 4) {
                                    // (https?):\/\/[a-z0-9\/:%_+.,#?!@&=-]+

                                    // https://cdn.antennepublicite.re/linfo/IMG/pub/(video|display)/(.*).(jpg|gif)

                                    var scriptcreatives_get = await AxiosFunction.getManageCopy('scriptcreatives', creatives_id);
                                    var dataValueCreative = scriptcreatives_get.data;
                                    var script_creative = dataValueCreative.script
                                    console.log(script_creative)

                                    //   const found = script_creative.match(/(https?):\/\/[a-z0-9\/:%_+.,#?!@&=-]+/igm);

                                    const regex1 = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif)/igm;
                                    const regex2 = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;

                                    replace = script_creative.replace(regex1, body.display_mobile_file)
                                    const replace_script = replace.replace(regex2, body.display_mobile_url)

                                    requestCreatives['script'] = replace_script
                                    requestCreatives['url'] = ""
                                    requestCreatives['clickUrl'] = ""
                                    requestCreatives['fileName'] = ""
                                    requestCreatives['name'] = "300x250 APPLI"
                                    requestCreatives['width'] = 300
                                    requestCreatives['height'] = 250
                                    requestCreatives['creativeTypeId'] = 4
                                    requestCreatives['mimeType'] = "",

                                        /*requestScriptCreatives = {
                                            "script": replace_script,
                                            "id": creatives_id,
                                            "insertionId": insertion_id,
                                            "name": "300x250 APPLI",
                                            "width": 300,
                                            "height": 250,
                                            "isActivated": true,
                                            "creativeTypeId": 4,
                                            "percentageOfDelivery": 0,
                                            "isArchived": false,
                                            "partnerMeasurementScriptIds": []
                                        }*/

                                        await AxiosFunction.putManage(
                                            'scriptcreatives',
                                            requestCreatives
                                        );
                                }

                                console.log("--------------------------")

                            }
                        }

                    }
                }
            }

        })

    } catch (error) {
        console.log(error)
    }
}

exports.logs = async (req, res) => {

    var test = await Utilities.logs('info')

    test.info("TEst fonction");
    res.send("ok")
    /*
    logger.trace("Entering cheese testing");
    logger.debug("Got cheese.");
    logger.info("Cheese is Comté.");
    logger.warn("Cheese is quite smelly.");
    logger.error("Cheese is too ripe!");
    logger.fatal("Cheese was breeding ground for listeria.");*/

}

exports.pdf = async (req, res) => {

    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://reporting.antennesb.fr/', {
      waitUntil: 'networkidle2',
    });
    await page.pdf({ path: 'testPDF.pdf', format: 'a4' });
  
    await browser.close();

}

exports.reports = async (req, res) => {
    try {
        // 1- Liste les campagnes en lignes Affiche les campagnes se terminant
        // aujourd'hui
        var dateNow = moment().format('YYYY-MM-DD');
        var dateTomorrow = moment()
            .add(1, 'days')
            .format('YYYY-MM-DD');
        var dateSub30Days = moment()
            .subtract(30, 'days')
            .format('YYYY-MM-DD');

        //   var dateLastMonday = moment().startOf('isoWeek').format('YYYY-MM-DD');
        var dateLastDay = moment().format('YYYY-MM-DD');
        var cacheStorageID = 'REPARTITION-TaskRepartition-'.dateLastDay;

        // Affiche les annonceurs à exclure
        const advertiserExclus = new Array(
            418935,
            427952,
            409707,
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
            320778,
            417716,
            421871,
            459132,
            464862
        );

        //   console.log( [dateNow, dateSub30Days]); process.exit(1);
        // Affiche les campagnes en ligne
        let insertions = await ModelInsertions
            .findAll({
                where: {
                    [Op.and]: [{
                        insertion_start_date: {
                            [Op.between]: [dateSub30Days, dateNow]
                        }
                    },
                    {
                        insertion_end_date: {
                            [Op.between]: [dateSub30Days, dateNow]
                        }
                    }
                    ]
                },
                group: ['campaign_id'],
                include: [{
                    model: ModelCampaigns,
                    where: {
                        [Op.and]: [{
                            campaign_name: {
                                [Op.notLike]: '% PARR %'
                            }
                        }],
                        /*  [Op.or]: [
                                  { campaign_start_date: { [Op.between]: [dateNow, dateSub30Days] } }, 
                                  { campaign_end_date: { [Op.between]: [dateNow, dateSub30Days] } }
                              ]
                              */
                    },
                    order: [
                        ['campaign_start_date', 'ASC']
                    ],
                    include: [{
                        model: ModelAdvertisers,
                        where: {
                            [Op.and]: [{
                                advertiser_id: {
                                    [Op.notIn]: advertiserExclus
                                }
                            }]
                        }
                    }]
                }]
            });

        console.log('nbCampaigns :', insertions.length);
        campaignsIds = new Array();
        for (i = 0; i < insertions.length; i++) {
            console.log(' - StartDate : ', insertions[i].insertion_start_date, ' - EndDate : ', insertions[i].campaign.campaign_start_date, ' - ', insertions[i].campaign_id, ' - ', insertions[i].campaign.campaign_name)
            campaignsIds.push(insertions[i].campaign_id);
        }

        console.log('nbCampaigns :', campaignsIds);

        // Affiche la date minimum de l'insertion
        let insertionMinDate = await ModelInsertions.min(
            'insertion_start_date', {
            where: {
                campaign_id: {
                    [Op.in]: campaignsIds
                },
                insertion_start_date: {
                    [Op.gte]: dateSub30Days
                }
            }
        });
        // Transforme la date en format YYYY-MM-DD
        var insertionStartDate = moment(insertionMinDate, "YYYY-MM-DD").format("YYYY-MM-DD");

        // Rapport de campagne - initialisation des requêtes
        var requestReporting = {
            "startDate": insertionStartDate.concat('T00:00:00'),
            "endDate": dateNow.concat('T23:59:00'), // '2022-01-09T00:00:00', /// ,
            "fields": [{
                "CampaignStartDate": {}
            }, {
                "CampaignEndDate": {}
            }, {
                "CampaignId": {}
            }, {
                "CampaignName": {}
            }, {
                "InsertionId": {}
            }, {
                "InsertionName": {}
            }, {
                "FormatId": {}
            }, {
                "FormatName": {}
            }, {
                "SiteId": {}
            }, {
                "SiteName": {}
            }, {
                "Impressions": {}
            }, {
                "ClickRate": {}
            }, {
                "Clicks": {}
            }, {
                "VideoCount": {
                    "Id": "17",
                    "OutputName": "Nbr_complete"
                }
            }, {
                "ViewableImpressions": {}
            }],
            "filter": [{
                "CampaignId": campaignsIds
            }]
        };

        console.log(requestReporting);

        let requestRepartition = await AxiosFunction.getReportingData(
            'POST',
            '',
            requestReporting
        );

        // si firstLink existe (!= de null) on save la taskId dans le localStorage sinon firstLinkTaskId = vide
        if (requestRepartition) {
            if (requestRepartition.status == 201) {
                /* 
                localStorageTasks.setItem(
                    cacheStorageID,
                    requestRepartition.data.taskId
                );*/

                requestRepartitionTaskID = requestRepartition.data.taskId;
                console.log(requestRepartitionTaskID);
            }
        }

        // 2) Requete GET boucle jusqu'a que le rapport generer 100% delais 1min on
        // commence à 10sec
        var time = 5000;
        let timerFile = setInterval(async () => {
            console.log('setInterval begin') //  DATA STORAGE - TASK 1 et 2
            var dataLSTaskGlobal = localStorageTasks.getItem(cacheStorageID);
            console.log(dataLSTaskGlobal)
            // Vérifie que dataLSTaskGlobal -> existe OU (dataLSTaskGlobalVU -> existe && taskID_uu -> not null)
            if (dataLSTaskGlobal) {
                if (dataLSTaskGlobal && Utilities.empty(requestRepartitionTaskID)) {
                    time += 10000;
                    let requete_global = `https://reporting.smartadserverapis.com/2044/reports/${requestRepartitionTaskID}`;

                    let threeLink = await AxiosFunction.getReportingData('GET', requete_global, '');
                    if ((threeLink.data.lastTaskInstance.jobProgress == '1.0') && (threeLink.data.lastTaskInstance.instanceStatus == 'SUCCESS')) {
                        // 3) Récupère la date de chaque requête
                        let dataLSTaskGlobal = localStorageTasks.getItem(
                            cacheStorageID + '-taskGlobal'
                        );
                        console.log('1979 : ' + cacheStorageID);
                        if (!dataLSTaskGlobal) {
                            dataFile = await AxiosFunction.getReportingData(
                                'GET',
                                `https://reporting.smartadserverapis.com/2044/reports/${requestRepartitionTaskID}/file`,
                                ''
                            );
                            // save la data requête 1 dans le local storage
                            dataLSTaskGlobal = {
                                'datafile': dataFile.data
                            };
                            localStorageTasks.setItem(
                                cacheStorageID + '-taskGlobal',
                                JSON.stringify(dataLSTaskGlobal)
                            );
                        }
                    }
                }
            } else {
                // Stoppe l'intervalle timerFile
                clearInterval(timerFile);
                console.log('Stop clearInterval timerFile');
            }

        });

        console.log('dlfskdjflks');

    } catch (error) {
        console.error('Error : ' + error);
    }
}