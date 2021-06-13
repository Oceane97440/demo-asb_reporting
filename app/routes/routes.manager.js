const router = require("express").Router();
const Sequelize = require('sequelize');

const manager = require("../controllers/controllers.manager");
const manager_campaigns = require(
    "../controllers/controllers.manager_campaigns"
);
const manager_advertisers = require(
    "../controllers/controllers.manager_advertisers"
);

const manager_sites = require(
    "../controllers/controllers.manager_sites"
);

const manager_users = require(
    "../controllers/controllers.manager_users"
);

/**
* Middleware to know if user is connected
 */
router.use(function (req, res, next) {
        if ((!req.session.user)) {           
            console.log('no access');
            return res.redirect('../../login');    
        }        
        next();  
});

const ModelFormats = require("../models/models.formats");
const ModelAdvertisers = require("../models/models.advertisers");
const {body, checkSchema, validationResult} = require('express-validator');
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
    campaign_epilot_code: {
        notEmpty: true,
        errorMessage: "Saisir un code campagne"
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
    },

    /*
    password: {
        isStrongPassword: {
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1
        },
        errorMessage: "Password must be greater than 8 and contain at least one uppercase letter, one lowercase letter, and one number",
    },
    phone: {
        notEmpty: true,
        errorMessage: "Phone number cannot be empty"
    },
    email: {
        normalizeEmail: true,
        custom: {
            options: value => {
                return User.find({
                    email: value
                }).then(user => {
                    if (user.length > 0) {
                        return Promise.reject('Email address already taken')
                    }
                })
            }
        }
    }
    */
}


router.get("/", manager.index);
// router.get("/", manager.error);

router.get("/campaigns", manager_campaigns.index);
router.get("/campaigns/list", manager_campaigns.list);
router.get('/campaigns/create', manager_campaigns.create);
router.post('/campaigns/create', manager_campaigns.create_post);
router.get("/campaigns/:id", manager_campaigns.view);
router.get('/campaigns/epilot/create', manager_campaigns.epilot_create);


router.post('/campaigns/epilot/create', checkSchema(campaignEpilotSchema), (req, res) => {
    // Validate incoming input
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({
            errors: errors.array()
        });
    }

    

    req.session.message = {
        type: 'success', 
        intro : '',   
        message: 'Registration successful',
    }

   res.redirect('/manager/campaigns/epilot/create');

})



router.get("/advertisers", manager_advertisers.index);
router.get("/advertisers/list", manager_advertisers.list);
router.get("/advertisers/:id", manager_advertisers.view);

router.get("/sites", manager_sites.index);
router.get("/sites/list", manager_sites.list);
router.get("/sites/:id", manager_sites.view);

router.get("/users", manager_users.index);
router.get("/users/list", manager_users.list);
router.get("/users/create", manager_users.create);
router.get("/users/:id", manager_users.view);
router.get("/users/:id/edit", manager_users.edit);






// router.get('/advertisers/create', manager_advertisers.create);

/* //router.get("/advertisers", api.advertiser_add);
 * router.get("/list_advertisers", manager.advertiser_liste);
 * router.get("/view_campagne/:id", manager.view_campagne);
 * router.get("/campagne_json/:id", manager.campagne_json);
 * //router.get("/campaigns", api.campaign_add);
 */
module.exports = router;