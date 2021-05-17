const router = require("express").Router();
const Sequelize = require('sequelize');

const manager = require("../controllers/controllers.manager");
const manager_campaigns = require(
    "../controllers/controllers.manager_campaigns"
);
const manager_advertisers = require(
    "../controllers/controllers.manager_advertisers"
);


router.get("/", manager.index);

router.get("/", manager.error);


router.get("/campaigns", manager_campaigns.index);
router.get("/campaigns/list", manager_campaigns.list);
router.get("/campaigns/:id", manager_campaigns.view);

router.get("/advertisers", manager_advertisers.index);
router.get("/advertisers/list", manager_advertisers.list);
router.get("/advertisers/:id", manager_advertisers.view);




/* //router.get("/advertisers", api.advertiser_add);
 * router.get("/list_advertisers", manager.advertiser_liste);
 * router.get("/view_campagne/:id", manager.view_campagne);
 * router.get("/campagne_json/:id", manager.campagne_json);
 * //router.get("/campaigns", api.campaign_add);
 */
module.exports = router;