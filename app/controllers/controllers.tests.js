const {
    Op
} = require("sequelize");

const excel = require('node-excel-export');

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});
const {
    QueryTypes
} = require('sequelize');


// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');


// Initialise les models
//const ModelSite = require("../models/models.site");
const ModelFormat = require("../models/models.formats");
const ModelCountry = require("../models/models.countries")
const ModelPack = require("../models/models.packs")

exports.index = async (req, res) => {



    try {


        // SELECT `format_group` FROM `_asb_formats` WHERE `format_group` IS NOT NULL GROUP BY `format_group` ORDER BY `format_group` ASC
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
        });


    } catch (error) {
        console.log(error)

    }

};

exports.export_excel = async (req, res) => {




    var data_localStorage = localStorage.getItem('campagneId' + '-' + '1839404');

    var data_report_view = JSON.parse(data_localStorage);

    var dts_table = data_report_view.table;


    const date = new Date();
    const JJ = ('0' + (date.getDate())).slice(-2)

    const MM = ('0' + (date.getMonth())).slice(-2)
    const AAAA = date.getFullYear();

    const label_now = AAAA + MM + JJ

    var campaign_name = dts_table.Campagne_name
    var date_now = dts_table.Date_rapport
    var StartDate = dts_table.StartDate
    var EndDate = dts_table.EndDate


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
                    // merges: merges2, // <- Merge cell ranges
                    specification: bilan_sites, // <- Report specification
                    data: dataset2 // <-- Report data
                }
            ]
        );

        // You can then return this straight
        //rapport_antennesb-202105031152-ESPACE_DECO-67590.xls
        res.attachment('rapport_antennesb-'+ label_now +'-'+ campaign_name + '.xlsx'); // This is sails.js specific (in general you need to set headers)

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