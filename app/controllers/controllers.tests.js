const {
    Op
} = require("sequelize");

// const excel = require('node-excel-export');
process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});

const {
    QueryTypes
} = require('sequelize');
//var nodemailer = require('nodemailer');
//var nodeoutlook = require('nodejs-nodemailer-outlook');
const ExcelJS = require('exceljs');
var axios = require('axios');
const fs = require('fs')
const moment = require('moment');

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


exports.log_error = async (req, res) => {




    var path = "proxy_error_log"
    var contents = fs.readFileSync(path).toString();
    console.log(contents)
    res.send(contents)


/*
    var data = contents.match('(.*)')
    console.log(data)
    console.log('data.length ' + data.length)


   var dataArray = new Array()

    function logArrayElements(element, index, array) {
        console.log("a[" + index + "] = " + element);

        dataArray.push(element.split(","));


    }
    data.forEach(logArrayElements);

    console.log(dataArray)

    res.send('test')
*/

}