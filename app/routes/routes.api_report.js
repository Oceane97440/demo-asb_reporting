const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.api_report");


// Affiche la page api
router.get("/", api.index);
router.get("/rapport/:advertiserid/:campaignid/:startdate", api.report);
//router.get("/liste_report", api.liste_report);
//router.get("/json_report", api.json_report);
//router.get("/view_report/:taskId", api.view_report);
router.get("/generate/:advertiserid/:campaignid/:startdate", api.generate);








module.exports = router;