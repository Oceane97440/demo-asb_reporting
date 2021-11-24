const router = require("express").Router();
const Sequelize = require('sequelize');

const app = require("../controllers/controllers.application");

// Affiche la page app

router.post("/login/add", app.login_add)
router.get("/logout", app.logout)
router.post("/forecast/add", app.forcast)

router.get("/json/formats", app.formast_json)
router.get("/json/packs", app.packs_json)
router.get("/json/countrys", app.countrys_json)
router.get("/json/packs/sites", app.packs_sites_json)
router.get("/json/campaign/:advertiser_id", app.campaign_json)
router.get("/json/creative/:format_group_id", app.creativeType_json)



module.exports = router;