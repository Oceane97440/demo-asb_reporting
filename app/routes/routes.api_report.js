const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.api_report");


// Affiche la page api
//router.get("/", api.index);
router.get("/:advertiserid/:campaignid", api.index);
router.get("/dasbord_report", api.dasbord_report);
router.get("/json_report", api.json_report);
router.get("/view_report/:taskId", api.view_report);
router.get("/generate", api.generate);








module.exports = router;