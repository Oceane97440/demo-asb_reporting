const router = require("express").Router();
const Sequelize = require('sequelize');

const manager = require("../controllers/controllers.manager");
const manager_campaigns = require("../controllers/controllers.manager_campaigns");
const manager_epilot = require("../controllers/controllers.manager_epilot");
const manager_gam = require("../controllers/controllers.manager_gam");

const manager_insertions = require("../controllers/controllers.manager_insertions");
const manager_agencies = require("../controllers/controllers.manager_agencies");
const manager_advertisers = require("../controllers/controllers.manager_advertisers");
const manager_formats = require("../controllers/controllers.manager_formats");
const manager_sites = require("../controllers/controllers.manager_sites");
const manager_users = require("../controllers/controllers.manager_users");
const manager_forecast = require("../controllers/controllers.manager_forecast");
const manager_search = require("../controllers/controllers.manager_search");
const manager_charts = require("../controllers/controllers.manager_charts");
const manager_campaigns_tv = require("../controllers/controllers.manager_campaigns_tv")

/**
* Middleware to know if user is connected
**/
router.use(function (req, res, next) {
    if ((!req.session.user)) {           
        console.log('no access');
        return res.redirect('../../login');    
    } 
    res.locals.user = req.session.user;  
    next();  
    // console.log('User Login :',req.session.user)
});

const ModelFormats = require("../models/models.formats");
const ModelAgencies = require("../models/models.agencies");
const ModelAdvertisers = require("../models/models.advertisers");
const ModelEpilotCampaigns = require("../models/models.epilot_campaigns");
const {body, checkSchema, validationResult} = require('express-validator');
const ValidateCustom = require("../functions/functions.form.validate");
const csvParser = require("csv-parser");

/*
const campaignEpilotSchema = {
    advertiser_id: {
        custom: {
            options: value => {
                return ModelAdvertisers.findOne({
                    where : { advertiser_id: value }
                }).then(advertiser => {
                    if (advertiser.length === 0) {
                        return Promise.reject('L\'annonceur n\'existe pas')
                    }
                })
            }
        }
    },   
    campaign_epilot_name: {
        notEmpty: true,
        errorMessage: "Saisir le nom de la campagne"
    },
    campaign_epilot_start_date: {
        notEmpty: true,
        errorMessage: "Saisir la date de début de la campagne"
    },
    campaign_epilot_end_date: {
        notEmpty: true,
        errorMessage: "Saisir la date de fin de la campagne"
    },
    format_id: {
        custom: {
            options: value => {
                return ModelFormats.findOne({
                    where : { format_id: value } 
                }).then(format => {
                    if (format.length === 0) {
                        return Promise.reject('Le format n\'existe pas')
                    }
                })
            }
        }
    },
    campaign_epilot_volume: {
        isInt: true,
        errorMessage: "Saisir le volume de diffusion pour ce format"
    }   
}
*/

router.get("/", manager.index);
// router.get("/", manager.error);

router.get("/campaigns", manager_campaigns.index);

router.get("/campaigns/list", manager_campaigns.list);
router.get("/campaigns/export", manager_campaigns.export);
router.get('/campaigns/create', manager_campaigns.create);
router.post('/campaigns/create', manager_campaigns.create_post);
router.get('/campaigns/repartitions', manager_campaigns.repartitions);
router.get("/campaigns/:id", manager_campaigns.view);
router.get("/campaigns/:campaign/email/:user", manager_campaigns.email);


router.get('/campaigns/tv/list', manager_campaigns_tv.list);
router.get('/campaigns/tv/edit/:campaigntv', manager_campaigns_tv.edit);
router.post('/campaigns/tv/edit/:campaigntv', manager_campaigns_tv.update);
router.get('/campaigns/tv/export', manager_campaigns_tv.export);
router.get('/campaigns/tv/:campaigntv', manager_campaigns_tv.view);


router.get('/campaigns/epilot/list', manager_epilot.list);
router.get('/campaigns/epilot/export', manager_epilot.export);

router.get('/campaigns/gam/list', manager_gam.list);
router.get('/campaigns/gam/export', manager_gam.export);

router.get('/campaigns/epilot/insertions', manager_epilot.insertions);
router.get('/campaigns/epilot/create', manager_epilot.create);
router.post('/campaigns/epilot/import', manager_epilot.import);
//router.get('/campaigns/epilot/import', manager_epilot.import);
router.get("/campaigns/:campaign_id/insertions/:insertion_id", manager_insertions.view);

router.get("/formats", manager_formats.index);
router.get("/formats/list", manager_formats.list);
router.get("/formats/groups", manager_formats.groups);
router.get("/formats/:id", manager_formats.view);

router.get("/insertions", manager_insertions.index);
router.get("/insertions/list", manager_insertions.list);
router.get("/insertions/create", manager_insertions.create);
router.post("/insertions/create_post", manager_insertions.create_post);
/*
router.get("/insertions/create/", manager_insertions.create);
router.post("/insertions/create", manager_insertions.create_post);

router.get("/insertions/:id", manager_insertions.view);
*/

router.get("/creatives/create/:id", manager_insertions.create_creative);
router.post("/creatives/create", manager_insertions.create_creative_post);

router.get("/search", manager_search.index);
router.get("/search/import", manager_search.import);

router.get("/charts", manager_charts.index);
router.get("/charts/campaigns", manager_charts.campaigns);
router.get("/charts/advertisers/", manager_charts.advertisers);
router.get("/charts/advertisers/:advertiser_id", manager_charts.advertisers);
router.get("/charts/campaign/report", manager_charts.campaignReport);

/*
router.post('/campaigns/epilot/create', checkSchema(ValidateCustom.campaignEpilotSchema), (req, res) => {
    // Validate incoming input
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    } 

    // Supprime l'object submit
    delete req.body.submit;
    var where = req.body;
    console.log(req.body)

    const foundItem =  ModelEpilotCampaigns.findOne(where).count();
   
    console.log('WHERE : ',where)

    console.log('Number : ',foundItem.length)
    if (!foundItem) {
        // Item not found, create a new one
        const item =  ModelEpilotCampaigns.create(where);
        if(item) {
            req.session.message = {
                type: 'success', 
                intro : '',   
                message: 'La campagne a bien été ajouté.',
            }        
        }
    } else {
        req.session.message = {
            type: 'error', 
            intro : '',   
            message: 'Cette campagne existe déjà dans la base de donnée.',
        }        
    }

 //   ModelEpilotCampaigns.findOne(req.body)  
   res.redirect('/manager/campaigns/epilot/create');
})
*/

router.get("/agencies", manager_agencies.index);
router.get("/agencies/list", manager_agencies.list);
router.get("/agencies/:id", manager_agencies.view);

router.get("/advertisers", manager_advertisers.index);
router.get("/advertisers/list", manager_advertisers.list);
router.get("/advertisers/export", manager_advertisers.export);

router.get('/advertisers/create', manager_advertisers.create);
router.post('/advertisers/create', manager_advertisers.create_post);
router.get("/advertisers/:id", manager_advertisers.view);

router.get("/sites", manager_sites.index);
router.get("/sites/list", manager_sites.list);
router.get("/sites/:id", manager_sites.view);

router.get("/users", manager_users.index);
router.get("/users/list", manager_users.list);
router.get("/users/export", manager_users.export);

router.get("/users/create", manager_users.create);
router.get("/users/:id", manager_users.view);
router.get("/users/:id/edit", manager_users.edit);

router.get("/forecast", manager_forecast.index);
router.post("/forecast", manager_forecast.forecast);

// router.get('/advertisers/create', manager_advertisers.create);

/* //router.get("/advertisers", api.advertiser_add);
 * router.get("/list_advertisers", manager.advertiser_liste);
 * router.get("/view_campagne/:id", manager.view_campagne);
 * router.get("/campagne_json/:id", manager.campagne_json);
 * //router.get("/campaigns", api.campaign_add);
 */
module.exports = router;