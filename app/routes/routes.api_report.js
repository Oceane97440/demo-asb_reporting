const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.api_report");


// Affiche la page api
router.get("/test", api.test);

router.get("/", api.index);
router.get("/rapport/:advertiserid/:campaignid/:startdate", api.report);
router.get("/generate/:advertiserid/:campaignid/:startdate", api.generate);
router.get("/automatisation/:campaignid/", api.automatisation);









module.exports = router;