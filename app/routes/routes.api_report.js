const router = require("express").Router();
const Sequelize = require('sequelize');

const api = require("../controllers/controllers.api_report");

// Affiche la page api
router.get("/", api.index);
router.get("/rapport/:campaigncrypt", api.report);
router.get("/:campaigncrypt", api.generate);
router.get("/:campaigncrypt/export", api.export_excel);
router.get("/automatisation/:campaignid/", api.automatisation);

module.exports = router;