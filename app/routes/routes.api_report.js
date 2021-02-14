const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.api_report");


// Affiche la page api
router.get("/", api.index);
router.get("/:advertiserid/:campaignid", api.report);
router.get("/liste_report", api.liste_report);
router.get("/json_report", api.json_report);
router.get("/view_report/:taskId", api.view_report);
router.get("/generate", api.generate);
router.get("/generate_link", api.generate_link)








module.exports = router;