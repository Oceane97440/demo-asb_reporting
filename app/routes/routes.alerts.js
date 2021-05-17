const router = require("express").Router();
const Sequelize = require('sequelize');

const alert = require("../controllers/controllers.alerts");

// Affiche la page api
router.get("/", alert.alerts);

module.exports = router;