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

const manager_campaigns_epilot = require(
    "../controllers/controllers.manager_campaigns_epilot"
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

router.get("/", manager.index);
router.get("/api/data", manager.data);

// router.get("/", manager.error);

router.get("/campaigns", manager_campaigns.index);
router.get("/campaigns/list", manager_campaigns.list);
router.get('/campaigns/create', manager_campaigns.create);
router.post('/campaigns/create', manager_campaigns.create_post);
router.get("/campaigns/:id", manager_campaigns.view);

router.get('/insertions/create', manager_campaigns.create_insertions);
router.post('/insertions/create', manager_campaigns.create_post_insertions);

router.get("/epilot/list", manager_campaigns_epilot.list);


router.get("/advertisers", manager_advertisers.index);
router.get("/advertisers/list", manager_advertisers.list);
router.get('/advertisers/create', manager_advertisers.create);
router.post('/advertisers/create', manager_advertisers.create_post);
router.get("/advertisers/:id", manager_advertisers.view);



/*
router.get("/sites", manager_sites.index);
router.get("/sites/list", manager_sites.list);
router.get("/sites/:id", manager_sites.view);*/


// router.get('/advertisers/create', manager_advertisers.create);



/* //router.get("/advertisers", api.advertiser_add);
 * router.get("/list_advertisers", manager.advertiser_liste);
 * router.get("/view_campagne/:id", manager.view_campagne);
 * router.get("/campagne_json/:id", manager.campagne_json);
 * //router.get("/campaigns", api.campaign_add);
 */
module.exports = router;