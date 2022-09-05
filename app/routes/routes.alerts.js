const router = require("express").Router();
const Sequelize = require('sequelize');

const alert = require("../controllers/controllers.alerts");

// Affiche la page api
router.get("/campaigns", alert.campaigns);
router.get("/forecast", alert.alert_delivered_percentage);
router.get("/creatives", alert.alert_manage_creative);
router.get("/campaigns_status",alert.alert_campaignOnline)




module.exports = router;