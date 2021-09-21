const router = require("express").Router();
const Sequelize = require('sequelize');

const test = require("../controllers/controllers.tests");

// Affiche la page api
router.get("/", test.index);
router.get("/test_exportExcel", test.test_exportExcel);
router.get("/export_excel", test.export_excel);
router.get('/campaignday', test.campaignday);
router.get("/template", test.template);

router.get("/array", test.array_unique);
router.get("/nodemail",test.nodemail)
router.get("/read",test.read_excel)
router.get("/log",test.log_error)



module.exports = router;