const router = require("express").Router();
const Sequelize = require('sequelize');

const reportingTV = require("../controllers/controllers.tv.reporting");

// Gestion du reporting de l'API
router.post("/", reportingTV.index);
router.get("/charts/:campaigncrypt", reportingTV.charts);
router.get("/:campaigncrypt", reportingTV.generate);
router.get("/export/:campaigncrypt", reportingTV.export);

module.exports = router;