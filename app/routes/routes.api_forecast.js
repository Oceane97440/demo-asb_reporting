const router = require("express").Router();
const Sequelize = require('sequelize');

const api = require("../controllers/controllers.api_forecast");

// Affiche la page api
router.get("/", api.index);
router.post("/add", api.forecast);

// router.get("/indexa", api.indexa); router.get("/sites", api.sites);
// router.get("/countries", api.countries); router.get("/formats", api.formats);

module.exports = router;