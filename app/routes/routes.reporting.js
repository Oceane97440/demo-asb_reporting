const router = require("express").Router();
const Sequelize = require('sequelize');

const reporting = require("../controllers/controllers.reporting");

// Gestion du reporting de l'API
router.get("/campaigns", reporting.report_campaign);
router.get("/campaigns/export", reporting.export_excel_campaigns);
router.get("/report/:campaigncrypt", reporting.report);
router.get("/:campaigncrypt", reporting.generate);
router.get("/:campaigncrypt/export", reporting.export_excel);
router.get("/automate/:campaignid/", reporting.automate);
router.get("/taskid/:campaignid", reporting.taskid);

module.exports = router;