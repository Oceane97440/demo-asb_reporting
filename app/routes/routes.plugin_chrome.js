const router = require("express").Router();
const Sequelize = require('sequelize');

const automate = require("../controllers/controllers.plugin_chrome");

router.get("/advertiser", automate.advertiser);

router.get("/campaign", automate.campaign);

router.get("/insertion", automate.insertion);




module.exports = router;