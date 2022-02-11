const router = require("express").Router();
const Sequelize = require('sequelize');

const test = require("../controllers/controllers.tests");

// Affiche la page api
router.get("/", test.index);
router.get("/test_exportExcel", test.test_exportExcel);
router.get("/export_excel", test.export_excel);
router.get('/campaignday', test.campaignday);
router.get("/template", test.template);

router.get("/search", test.search);
router.get("/array", test.array_unique);
router.get("/nodemail",test.nodemail)
router.get("/read",test.read_excel)
router.get("/creative",test.creative)
router.get("/taskid",test.taskid)
router.get("/taskid2",test.test_taskid)
router.get("/duplication",test.duplication)
router.get("/logs",test.logs)
router.get("/pdf",test.pdf)
router.get("/report",test.reports)



module.exports = router;