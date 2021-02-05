const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.api_report");


// Affiche la page api
//router.get("/", api.index);
router.get("/:advertiserid/:campaignid", api.index);
router.get("/cache", api.testcache);


router.get("/test/:advertiserid/:campaignid", api.test);

//router.post("/add", api.reporting);





module.exports = router;