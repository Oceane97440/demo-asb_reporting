const router = require("express").Router();
const Sequelize = require('sequelize');

const reporting = require("../controllers/controllers.reporting");

// Gestion du reporting de l'API
router.get("/", reporting.index);
router.get("/report/:campaigncrypt", reporting.report);
router.get("/:campaigncrypt", reporting.generate);
router.get("/:campaigncrypt/export", reporting.export_excel);
router.get("/automate/:campaignid/", reporting.automate);

module.exports = router;