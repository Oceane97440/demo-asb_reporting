const router = require("express").Router();
const Sequelize = require('sequelize');

const manager = require("../controllers/controllers.manager");
const manager_campaigns = require("../controllers/controllers.manager_campaigns");
/*
// Affiche la page api
router.get('/', function (req, res) {
    // res.send('hello world');
    res.render("manager/index.ejs");
});
*/
router.get("/", manager.index);
router.get("/campaigns", manager_campaigns.index);
router.get("/campaigns/([0-9]+)", function (req, res) {
    res.send('hello world : '.req.param.id);
  
}

);


/*
//router.get("/advertisers", api.advertiser_add);
router.get("/list_advertisers", manager.advertiser_liste);
router.get("/view_campagne/:id", manager.view_campagne);
router.get("/campagne_json/:id", manager.campagne_json);
//router.get("/campaigns", api.campaign_add);
*/
module.exports = router;