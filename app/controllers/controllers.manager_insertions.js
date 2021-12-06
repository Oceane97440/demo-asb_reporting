// Initialise le module
const https = require('https');
const http = require('http');
const dbApi = require("../config/config.api");
const axios = require(`axios`);

// const request = require('request'); const bodyParser =
// require('body-parser');

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

const moment = require('moment');

// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');
const Utilities = require("../functions/functions.utilities");

// Initialise les models const ModelSite = require("../models/models.site");
const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelCampaigns = require("../models/models.campaigns");
const ModelInsertions = require("../models/models.insertions");
const ModelInsertionsPriorities = require("../models/models.insertions_priorities");
const ModelInsertionsStatus = require("../models/models.insertions_status");
const ModelSites = require("../models/models.sites");
const ModelCreatives = require("../models/models.creatives");
const ModelDeliverytTypes = require("../models/models.deliverytypes")
const ModelPacksSmart = require("../models/models.packs_smart")
const ModelPacks = require("../models/models.packs")
const ModelPacksSites = require("../models/models.packs_sites")
const ModelFormatsGroupsTypes = require(
    "../models/models.formats_groups_types"
);
const ModelFormatsTemplates = require("../models/models.formats_templates")
const ModelFormatsGroups = require("../models/models.formats_groups");
const ModelGroupFormats = require("../models/models.formats_groups")
const ModelTemplates = require("../models/models.templates")
const ModelInsertionsTemplates = require("../models/models.insertions_templates")
const ModelFormatsSites = require("../models/models.formats_sites");
const ModelCreativesTypes = require("../models/models.creatives_types");
const ModelCreativesTypesFormats = require("../models/models.creatives_types_formats");


const TEXT_REGEX = /^.{1,51}$/

const {
    promiseImpl
} = require('ejs');
const {
    insertions
} = require('./controllers.automate');
const {
    types
} = require('util');

exports.index = async (req, res) => {
    try {
        // Liste toutes les insertions
        const data = new Object();
        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Insertions',
            'link': ''
        }, );
        data.breadcrumb = breadcrumb;

        data.insertions = await ModelInsertions.findAll({
            include: [{
                model: ModelCampaigns
            }]
        });

        data.moment = moment;

        res.render('manager/insertions/index.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.list = async (req, res) => {
    try {
        // Liste toutes les insertions
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Insertions',
            'link': 'insertions'
        }, {
            'name': 'Liste des insertions',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.insertions = await ModelInsertions.findAll({
            include: [{
                    model: ModelCampaigns,
                    attributes: ['campaign_id', 'campaign_name']
                },
                // { model: ModelAdvertisers, attributes: ['advertiser_id', 'advertiser_name'] },
                {
                    model: ModelFormats,
                    attributes: ['format_id', 'format_name']
                },
                {
                    model: ModelInsertionsPriorities,
                    attributes: ['priority_id', 'priority_name']
                },
                {
                    model: ModelInsertionsStatus,
                    attributes: ['insertion_status_id', 'insertion_status_name']
                },
            ]
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['insertion_id', 'DESC']
            ]
        });

        data.utilities = Utilities;
        data.moment = moment;
        res.render('manager/insertions/list.ejs', data);
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

        var campaign_id = req.params.campaign_id;
        var insertion_id = req.params.insertion_id;
        var insertion = await ModelInsertions
            .findOne({
                where: {
                    campaign_id: campaign_id,
                    insertion_id: insertion_id
                },
                include: [{
                        model: ModelCampaigns,
                        attributes: ['campaign_id', 'campaign_name']
                    },
                    // { model: ModelAdvertisers, attributes: ['advertiser_id', 'advertiser_name'] },
                    {
                        model: ModelFormats,
                        attributes: ['format_id', 'format_name']
                    },
                    {
                        model: ModelInsertionsPriorities,
                        attributes: ['priority_id', 'priority_name']
                    },
                    {
                        model: ModelInsertionsStatus,
                        attributes: ['insertion_status_id', 'insertion_status_name']
                    },
                ]
            })
            .then(async function (insertion) {
                if (!insertion) {
                    res.redirect(`/extension-chrome/insertion?insertion_id=${insertion_id}`)
                    /*return res
                        .status(404)
                        .render("manager/error.ejs", {
                            statusCoded: 404
                        });*/
                }

                // Créer le fil d'ariane
                var breadcrumbLink = 'campaigns'
                breadcrumb = new Array({
                    'name': 'Insertions',
                    'link': 'insertions'
                }, {
                    'name': insertion.campaign.campaign_name,
                    'link': breadcrumbLink.concat('/', insertion.campaign_id)
                }, {
                    'name': insertion.insertion_name,
                    'link': ''
                });
                data.breadcrumb = breadcrumb;
                // Récupére l'annonceur lié à cette campagne
                var campaign = await ModelCampaigns
                    .findOne({
                        where: {
                            campaign_id: campaign_id
                        },
                        include: [{
                            model: ModelAdvertisers
                        }]
                    });

                // Récupére les données des creatives de l'insertion
                var creativesList = await ModelCreatives.findAll({
                    where: {
                        insertion_id: insertion_id
                    }
                }).then(async function (creativesList) {
                    data.creatives = creativesList;
                    console.log(creativesList)
                });

                // Attribue les données de la campagne                   
                data.insertion = insertion;
                data.campaign = campaign;
                data.moment = moment;
                data.Utilities = Utilities;

                res.render('manager/insertions/view.ejs', data);
            });

    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.create = async (req, res) => {
    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Insertions',
            'link': 'insertions'
        }, {
            'name': 'Ajouter une insertion',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        data.campaigns = await ModelCampaigns.findAll({
            include: [{
                model: ModelAdvertisers
            }]
        }, {
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                // ['advertiser_id', 'ASC'],
                [{
                    model: ModelAdvertisers,
                    as: 'ModelAdvertisers'
                }, 'advertiser_name', 'ASC'],
                ['campaign_name', 'ASC']
            ]
        });
        const advertiserExclus = new Array(
            418935,
            //427952,
            // 409707,
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
            320778
        );

        data.advertisers = await ModelAdvertisers.findAll({
            where: {
                advertiser_archived: 0,
                [Op.and]: [{
                    advertiser_id: {
                        [Op.notIn]: advertiserExclus
                    }
                }],

            },
            include: [{
                model: ModelCampaigns,

            }],

            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['advertiser_name', 'ASC'],
                // ['campaign_name', 'ASC']
            ]
        });



        data.deliverytypes = await ModelDeliverytTypes.findAll({
            where: {
                deliverytype_id: [0, 10, 22]
            }
        });

        data.priorities = await ModelInsertionsPriorities.findAll({
            order: [
                // Will escape title and validate DESC against a list of valid direction
                // parameters
                ['priority_id', 'DESC']
            ]
        });

        data.group_formats = await ModelGroupFormats.findAll({
            attributes: ['format_group_id', 'format_group_name'],
            where: {
                format_group_id: [1, 2, 3, 4, 9, 12, 13,16, 17, 18]
            },
            order: [
                ['format_group_name', 'DESC']
            ],
        })

        data.utilities = Utilities

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
            ],
        })

        data.packs = await ModelPacks.findAll({

        });

        res.render('manager/insertions/create.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.create_post = async (req, res) => {

    try {



        var body = {
            advertiser_id: req.body.advertiser_id,
            campaign_id: req.body.campaign_id,
            date_start: req.body.date_start,
            date_end: req.body.date_end,
            format_group_id: req.body.format_group_id,
            creative_type_id: req.body.creative_type_id,
            insertion_name: req.body.insertion_name,

            display_mobile_file: req.body.display_mobile_file,
            display_mobile_url: req.body.display_mobile_url,
            display_tablet_file: req.body.display_tablet_file,
            display_tablet_url: req.body.display_tablet_url,
            display_desktop_file: req.body.display_desktop_file,
            display_desktop_url: req.body.display_desktop_url,

            display_linfo_file: req.body.display_linfo_file,
            display_linfo_url: req.body.display_linfo_url,
            display_linfo_appli_file: req.body.display_linfo_appli_file,
            display_linfo_appli_url: req.body.display_linfo_appli_url,
            display_ar_file: req.body.display_ar_file,
            display_ar_url: req.body.display_ar_url,
            display_dtj_file: req.body.display_dtj_file,
            display_dtj_url: req.body.display_dtj_url,
            display_mea_file: req.body.display_mea_file,
            display_mea_url: req.body.display_mea_url,

            video_file: req.body.video_file,
            video_url: req.body.video_url,
        }


        console.log(body)

        const advertiser_id = body.advertiser_id;
        const campaign_id = body.campaign_id;
        const format_group_id = body.format_group_id;
        var creative_type_id = body.creative_type_id;
        const insertion_name = body.insertion_name;



        const display_mobile_file = body.display_mobile_file;
        const display_mobile_url = body.display_mobile_url;

        const display_tablet_file = body.display_tablet_file;
        const display_tablet_url = body.display_tablet_url;

        const display_desktop_file = body.display_desktop_file;
        const display_desktop_url = body.display_desktop_url;

        const display_linfo_file = body.display_linfo_file
        const display_linfo_url = body.display_linfo_url
        const display_linfo_appli_file = body.display_linfo_appli_file
        const display_linfo_appli_url = body.display_linfo_appli_url
        const display_ar_file = body.display_ar_file
        const display_ar_url = body.display_ar_url
        const display_dtj_file = body.display_dtj_file
        const display_dtj_url = body.display_dtj_url
        const display_mea_file = body.display_mea_file
        const display_mea_url = body.display_mea_url

        const video_file = body.video_file;
        const video_url = body.video_url;




        if (Utilities.empty(advertiser_id) ||
            Utilities.empty(campaign_id) ||
            Utilities.empty(format_group_id)
        ) {
            req.session.message = {
                type: 'danger',
                intro: 'Champ invalides',
                message: 'Les champs de couleur rouge avec un astérisque * sont obligatoires'
            }
            return res.redirect('/manager/insertions/create');
        }

        if ((creative_type_id === '1') && ((Utilities.empty(display_mobile_file) ||
                    Utilities.empty(display_mobile_url) ||
                    Utilities.empty(display_tablet_file) ||
                    Utilities.empty(display_tablet_url) ||
                    Utilities.empty(display_desktop_file) ||
                    Utilities.empty(display_desktop_url)) && (format_group_id !== '1') && (format_group_id !== '13')

            )) {

            req.session.message = {
                type: 'danger',
                intro: 'Champ invalides',
                message: 'Les champs de couleur rouge avec un astérisque * sont obligatoires'
            }
            return res.redirect('/manager/insertions/create');
        }


        if ((creative_type_id === '2') && (Utilities.empty(video_file) || Utilities.empty(video_url))) {

            req.session.message = {
                type: 'danger',
                intro: 'Champ invalides',
                message: 'Les champs de couleur rouge avec un astérisque * sont obligatoires'
            }
            return res.redirect('/manager/insertions/create');
        }


        const formatGroup = await ModelFormatsGroups.findOne({
            where: {
                format_group_id: format_group_id
            }
        });

        //recupération du nom du format group
        var formatGroupName = formatGroup.format_group_name + ' -'

        //si format interstitel video
        if ((format_group_id === '2') && (creative_type_id === '2')) {
            formatGroupName = "INTERSTITIEL VIDEO -"
        }
        //si format instream
        if (format_group_id === '9') {
            formatGroupName = "PREROLL"
        }
        //GRAND ANGLE DUPLICATION POSITION MASTHEAD
        if (format_group_id === '16') {
            formatGroupName = "GRAND ANGLE M -"
        }
        //MASTHEAD DUPLICATION POSITION GRAND ANGLE
        if (format_group_id === '17') {
            formatGroupName = "MASTHEAD G -"
        }
        //RECTANGLE VIDEO DUPLICATION POSITION MASTHEAD
        if (format_group_id === '18') {
            formatGroupName = "RECTANGLE VIDEO M -"
        }
        if (format_group_id === '13') {
            formatGroupName = "MEA -"
        }

        //Recupère la campagne modèle + filtre en fonction du name du l'insertion
        await ModelInsertions.findAll({
            where: {
                campaign_id: 1988414, //campagne_id model
                insertion_name: {
                    [Op.like]: "%" + formatGroupName + "%"
                }
            }
        }).then(async function (insertion_model) {

            for (let i = 0; i < insertion_model.length; i++) {
                if (!Utilities.empty(insertion_model)) {

                    var insertion_id_model = insertion_model[i].insertion_id
                    var insertion_name_model = insertion_model[i].insertion_name

                    console.log(insertion_name_model)


                    //Si input text n'est pas vide
                    if (!Utilities.empty(insertion_name)) {
                        insertion_name_model = insertion_model[i].insertion_name + ' - ' + insertion_name
                    }

                    requestInsertionsCopy = {

                        "name": insertion_name_model, //recupération du nom de l'insertion GET
                        "campaignId": campaign_id,
                        "ignorePlacements": "false",
                        "ignoreCreatives": "false"

                    }

                    //requête duplication des insertions modèle
                    let insertion_copy = await AxiosFunction.copyManage(
                        'insertions',
                        requestInsertionsCopy,
                        insertion_id_model
                    );

                    // console.log(requestInsertionsCopy)


                    if (insertion_copy.headers.location) {

                        var url_location = insertion_copy.headers.location
                        var insertion_get = await AxiosFunction.getManage(url_location);
                        const insertion_id = insertion_get.data.id
                        // console.log('insertion_id dupliqués ' + insertion_id)

                        //recupération data des creatives
                        var insertions_creatives_get = await AxiosFunction.getManageCopy('creatives', insertion_id);
                        var dataValue = insertions_creatives_get.data;
                        var number_line_offset = insertions_creatives_get.data.length;

                        for (let d = 0; d < number_line_offset; d++) {
                            if (!Utilities.empty(dataValue)) {


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
                                    "url": display_desktop_file,
                                    "clickUrl": display_desktop_url,
                                    "name": creatives_name,
                                    "fileName": creatives_fileName,
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
                                if ((creatives_typeId === 1) && (format_group_id !== '1')) {

                                    //format grand angle mobile
                                    if (creatives_width === 300) {
                                        requestCreatives['url'] = display_mobile_file
                                        requestCreatives['clickUrl'] = display_mobile_url

                                    }
                                    //format masthead mobile
                                    if (creatives_width ===320) {
                                        requestCreatives['url'] = display_mobile_file
                                        requestCreatives['clickUrl'] = display_mobile_url
                                        requestCreatives['width'] = 320
                                        requestCreatives['height'] = 50

                                    }
                                    //format masthead tablette
                                    if (creatives_width ===640) {
                                        requestCreatives['url'] = display_tablet_file
                                        requestCreatives['clickUrl'] = display_tablet_url
                                        requestCreatives['width'] = 640
                                        requestCreatives['height'] = 100

                                    }

                                    //format interstitiel tablette
                                    if (creatives_width === 1536) {
                                        requestCreatives['url'] = display_tablet_file
                                        requestCreatives['clickUrl'] = display_tablet_url
                                        requestCreatives['width'] = 1536
                                        requestCreatives['height'] = 2048

                                    }

                                    //format interstitiel mobile
                                    if (creatives_width === 720) {
                                        requestCreatives['url'] = display_mobile_file
                                        requestCreatives['clickUrl'] = display_mobile_url
                                        requestCreatives['width'] = 720
                                        requestCreatives['height'] = 1280

                                    }

                                    //format interstitiel mobile
                                    if (creatives_width === 1024) {
                                        requestCreatives['url'] = display_mobile_file
                                        requestCreatives['clickUrl'] = display_mobile_url
                                        requestCreatives['width'] = 1024
                                        requestCreatives['height'] = 320

                                    }

                                    //format interstitiel mobile
                                    if (creatives_width === 354) {
                                        requestCreatives['url'] = display_mea_file
                                        requestCreatives['clickUrl'] = display_mea_url
                                        requestCreatives['width'] = 354
                                        requestCreatives['height'] = 500

                                    }

                                    await AxiosFunction.putManage(
                                        'imagecreatives',
                                        requestCreatives
                                    );
                                }

                                //Creative de type image - format habillage
                                if ((creatives_typeId === 1) && (format_group_id === '1')) {

                                    if (creatives_name.match(/HABILLAGE - AR/igm)) {
                                        requestCreatives['url'] = display_ar_file
                                        requestCreatives['clickUrl'] = display_ar_url
                                        requestCreatives['name'] = " HABILLAGE - AR"


                                    }

                                    if (creatives_name.match(/HABILLAGE - LINFO/igm)) {
                                        requestCreatives['url'] = display_linfo_file
                                        requestCreatives['clickUrl'] = display_linfo_url
                                        requestCreatives['name'] = "HABILLAGE - LINFO"


                                    }

                                    if (creatives_name.match(/HABILLAGE - LINFO MOBILE/igm)) {
                                        requestCreatives['url'] = display_linfo_appli_file
                                        requestCreatives['clickUrl'] = display_linfo_appli_url
                                        requestCreatives['name'] = " HABILLAGE - LINFO MOBILE"


                                    }

                                    if (creatives_name.match(/HABILLAGE - DOMTOMJOB/igm)) {
                                        requestCreatives['url'] = display_dtj_file
                                        requestCreatives['clickUrl'] = display_dtj_url
                                        requestCreatives['name'] = "HABILLAGE - DOMTOMJOB"


                                    }

                                    //format habillage appli linfo
                                    if (creatives_name.match(/habillage - appli linfo/igm)) {
                                        requestCreatives['url'] = display_linfo_appli_file
                                        requestCreatives['clickUrl'] = display_linfo_appli_url
                                        requestCreatives['name'] = "habillage - appli linfo"
                                        requestCreatives['fileName'] = "1024x320"
                                        requestCreatives['width'] = 1024
                                        requestCreatives['height'] = 320

                                    }

                                    await AxiosFunction.putManage(
                                        'imagecreatives',
                                        requestCreatives
                                    );
                                }

                                //Creative de type video
                                if (creatives_typeId === 2) {
                                    requestCreatives['url'] = video_file
                                    requestCreatives['clickUrl'] = video_url
                                    requestCreatives['fileName'] = "1280x720"
                                    requestCreatives['width'] = 1280
                                    requestCreatives['height'] = 720
                                    requestCreatives['creativeTypeId'] = 2
                                    requestCreatives['mimeType'] = "video/mp4"

                                    if (creatives_width === 300) {
                                        requestCreatives['fileName'] = "300x250 APPLI"
                                        requestCreatives['width'] = 300
                                        requestCreatives['height'] = 250

                                    }

                                    if (format_group_id === '2' && creative_type_id === '2') {
                                        requestCreatives['name'] = "interstitiel - video"

                                    }

                                    await AxiosFunction.putManage(
                                        'videocreatives',
                                        requestCreatives
                                    );
                                }

                                //Creative de type script
                                if (creatives_typeId === 4) {

                                    var scriptcreatives_get = await AxiosFunction.getManageCopy('scriptcreatives', creatives_id);
                                    var dataValueCreative = scriptcreatives_get.data;
                                    var script_creative = dataValueCreative.script
                                    // console.log(script_creative)

                                    const regex1 = /(http(s?):)([/|.|\w|\s|-])*\.(?:jpg|gif)/igm;
                                    const regex2 = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/i;

                                    replace = script_creative.replace(regex1, display_mobile_file)
                                    const replace_script = replace.replace(regex2, display_mobile_url)

                                    requestCreatives['script'] = replace_script
                                    requestCreatives['url'] = ""
                                    requestCreatives['clickUrl'] = ""
                                    requestCreatives['fileName'] = "300x250 script"
                                    requestCreatives['name'] = "300x250 APPLI"
                                    requestCreatives['width'] = 300
                                    requestCreatives['height'] = 250
                                    requestCreatives['creativeTypeId'] = 4
                                    requestCreatives['mimeType'] = "",

                                        await AxiosFunction.putManage(
                                            'scriptcreatives',
                                            requestCreatives
                                        );
                                }





                                //   console.log("--------------------------")







                            }
                        }



                    }
                }
            }



        })

        req.session.message = {
            type: 'success',
            intro: 'Les insertions ont été crées dans SMARTADSERVER',
            message: `https://manage.smartadserver.com/gestion/smartprog2.asp?CampagneID=${campaign_id}`
        }
        return res.redirect("/manager/insertions/create")

        /*
                const formatIdsArray = []
                const sites = []
                // si format site countrie ne sont pas vide selectionne le groupe format
                if (format_group_id.length != 0 && pack_id.length != 0 && campaign_id.length != 0) {
                    // select groupe format + format id
                    const formatIds = await ModelFormats.findAll({
                        attributes: ['format_id'],
                        where: {
                            format_group: {
                                [Op.eq]: format_group_id
                            }
                        }
                    });

                    // Create formatIdsArray's variable to handler more later
                    for (let l = 0; l < formatIds.length; l++) {
                        formatIdsArray.push(formatIds[l].format_id);
                    }
                }


                // recupération des site d'un pack
                const sitesdb = await ModelPacksSites.findAll({
                    attributes: ['pack_id', 'site_id'],
                    where: {
                        pack_id: {
                            [Op.eq]: pack_id
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

                // console.log('GRANG ANGLE ' + formatIdsArray)
                //   console.log('Pack GR ' + sites)


                formats_sites = await ModelFormatsSites.findAll({
                    where: {
                        format_id: formatIdsArray
                    },
                    include: [{
                            model: ModelFormats
                        },
                        {
                            model: ModelSites
                        }
                    ]
                });


                for (let index = 0; index < formats_sites.length; index++) {
                    if (!Utilities.empty(formats_sites)) {
                        const siteName = formats_sites[index].site.site_group
                        var siteIds = formats_sites[index].site.site_id

                        const formatName = formats_sites[index].format.format_name
                        const formatIds = formats_sites[index].format.format_id



                        // Regex libélé position remplace btf -> position 5
                        const regex = /BTF/igm;
                        var label = formatName.replace(regex, '5');
                        const found = label.match(/[0-9]/igm);
                        const libélé = format_group_id + " - " + siteName + ' - ' + 'POSITION ' + found




                        var requestInsertion = {
                            "isDeliveryRegulated": true,
                            "isUsedByGuaranteedDeal": false,
                            "isUsedByNonGuaranteedDeal": false,
                            "name": libélé,
                            "description": "",
                            "isPersonalizedAd": false,
                            "siteIds": [siteIds],
                            "insertionStatusId": 1,
                            "startDate": "2021-10-27T00:00:00",
                            "endDate": "2021-10-27T23:59:00",
                            "campaignId": 1764641,
                            "insertionTypeId": 0,
                            "deliveryTypeId": 1, //Categorie WEB
                            "timezoneId": 4, // Insertion TimezoneId
                            "priorityId": 62, // Insertion PriorityId Normal 3
                            "insertionGroupedVolumeId": 452054,
                            "globalCapping": 0, // Insertion CappingGlobal
                            "cappingPerVisit": 0, // Insertion CappingVisite
                            //   "cappingPerClick": 0,
                            //   "autoCapping": 0,
                            "PeriodicCappingImpressions": 0,
                            "PeriodicCappingPeriod": 0,
                            "isObaIconEnabled": false,
                            "formatId": formatIds,
                            "isArchived": false,
                             "insertionExclusionIds": [
                                 111233
                             ],
                            "customizedScript": "",
                            "salesChannelId": 1
                        }



                        //   PARAMETRE REQUETE   

                        //Condition si c du mobile
                        if (siteName.match(/APPLI/igm)) {

                            requestInsertion['deliveryTypeId'] = 10


                        }
                        if (siteName.match(/APPLI LINFO/igm)) {
                            //Attention j'ai delate SM-ANDROID LINFO
                            requestInsertion['siteIds'] = [299248, 299249]





                        }

                        //console.log(libélé)
                        //console.log('REQUEST : ', requestInsertion);

                        const type_creative = await ModelFormatsGroups.findOne({
                            where: {
                                format_group_name: format_group_id
                            },
                            include: [{
                                model: ModelCreativesTypesFormats,


                            }]
                        })

                        console.log(type_creative.format_group_name)
                        console.log(type_creative.creatives_types_formats)




                        let insertion_create = await AxiosFunction.postManage(
                            'insertions',
                            requestInsertion
                        );

                        if (insertion_create.headers.location) {
                            var url_location = insertion_create.headers.location
                            console.log(url_location)
                            var insertion_get = await AxiosFunction.getManage(url_location);
                            const insertion_id = insertion_get.data.id


                            //Ciblage reunion
                            var requestInsertionsTarget = {
                                "countryIds": [61],
                                "insertionId": insertion_id,
                                "isExactMatch": true,
                                "targetBrowserWithCookies": false
                            }

                            await AxiosFunction.putManage(
                                'insertiontargetings',
                                requestInsertionsTarget
                            );

                            res.json({
                                type: 'success',
                                intro: 'Ok',
                                message: 'L\'inserion a été crée dans SMARTADSERVEUR',

                            })
                        }

                        console.log("------------------------")

                    }

                }*/



    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }

}


exports.create_creative = async (req, res) => {

    try {
        const data = new Object();

        // Créer le fil d'ariane
        breadcrumb = new Array({
            'name': 'Creatives',
            'link': 'creatives/list'
        }, {
            'name': 'Ajouter une créative à l\'insertion',
            'link': ''
        });
        data.breadcrumb = breadcrumb;

        // Récupére l'ensemble les données


        data.insertions = await ModelInsertions.findOne({
            where: {
                insertion_id: req.body.params.id
            },

        });

        data.formats_templates = await ModelFormatsTemplates.findOne({
            where: {
                format_id: data.insertions.format_id
            },

            include: [{
                    model: ModelFormats

                },
                {
                    model: ModelTemplates,

                }
            ]

        });



        res.render('manager/insertions/create_creative.ejs', data);
    } catch (error) {
        console.log(error);
        var statusCoded = error.response;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}

exports.create_creative_post = async (req, res) => {
    try {
        const insertion = req.body.insertion
        const creative = req.body.creative
        const template = req.body.template
        const type = req.body.type
        const url = req.body.url
        const url_click = req.body.url_click



        if (!TEXT_REGEX.test(creative)) {
            req.session.message = {
                type: 'danger',
                intro: 'Erreur',
                message: 'Le nombre de caratère est limité à 50'
            }
            return res.redirect(`/manager/creatives/create/${insertion}`)

        }

        if (insertion == '' || creative == '' || type == '' || url == '' || url_click == '') {
            req.session.message = {
                type: 'danger',
                intro: 'Un problème est survenu',
                message: 'Les champs doivent être complétés'
            }
            return res.redirect(`/manager/creatives/create/${insertion}`)
        }



        var requestCreatives = {

            "InsertionId": insertion,

            "Name": creative,

            "FileName": creative,

            "Url": url,

            "clickUrl": url_click,

            "Width": 350,

            "Height": 250,

            "CreativeTypeId": type,

            "IsActivated": "true"

        }



        await ModelCreatives
            .findOne({
                attributes: ['creative_name'],
                where: {
                    creative_name: creative
                }
            }).then(async function (creativeFound) {


                if (!creativeFound) {


                    let creative_create = await AxiosFunction.postManage(
                        'creatives',
                        requestCreatives
                    );

                    if (creative_create.headers.location) {


                        var url_location = creative_create.headers.location


                        var creative_get = await AxiosFunction.getManage(url_location);

                        const creative_id = creative_get.data.id
                        const file_name = creative_get.data.fileName
                        const creative_mime_type = creative_get.data.mimeType
                        const creative_width = creative_get.data.width
                        const creative_height = creative_get.data.height


                        await ModelCreatives.create({
                            creative_id: creative_id,
                            creative_name: creative,
                            file_name: file_name,
                            insertion_id: insertion,
                            creative_url: url,
                            creative_click_url: url_click,
                            creative_width: creative_width,
                            creative_height: creative_height,
                            creative_mime_type: creative_mime_type,
                            creative_type_id: type,
                            creative_activated: 1,
                            creative_archived: 0

                        });

                        const templateId = await ModelTemplates.findOne({
                            where: {
                                template_id: template
                            }
                        })

                        var RequestInsertionTemplate = {
                            "InsertionId": insertion,
                            "ParameterValues": templateId.parameter_default_values,
                            "TemplateId": templateId.template_id
                        }

                        await AxiosFunction.putManage(
                            'insertiontemplates',
                            RequestInsertionTemplate
                        );

                        await ModelInsertionsTemplates.create({
                            insertion_id: insertion,
                            parameter_value: templateId.parameter_default_values,
                            template_id: templateId.template_id,


                        });
                        req.session.message = {
                            type: 'success',
                            intro: 'Ok',
                            message: 'La créative a été crée dans SMARTADSERVEUR',

                        }
                        return res.redirect(`/manager/creatives/create/${insertion}`)



                    }





                } else {
                    req.session.message = {
                        type: 'danger',
                        intro: 'Erreur',
                        message: 'Créatives est déjà utilisé'
                    }
                    return res.redirect(`/manager/creatives/create/${insertion}`)
                }


            })





    } catch (error) {
        console.log(error);
        var statusCoded = error.response.status;
        res.render("manager/error.ejs", {
            statusCoded: statusCoded
        });
    }
}