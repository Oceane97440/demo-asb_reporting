const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.api_report");


// Affiche la page api
router.get("/", api.index);
router.get("/test", api.test);

//router.post("/add", api.reporting);





module.exports = router;