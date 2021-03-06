const router = require("express").Router();
const Sequelize = require('sequelize');

const test = require("../controllers/controllers.tests");

// Affiche la page api
router.get("/", test.index);
router.get("/test_exportExcel", test.test_exportExcel);
router.get("/export_excel", test.export_excel);

module.exports = router;