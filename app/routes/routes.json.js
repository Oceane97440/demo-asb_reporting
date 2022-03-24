const router = require("express").Router();
const Sequelize = require('sequelize');

const json = require("../controllers/controllers.json");
router.get("/advertisers", json.advertisers);
router.get("/campaigns", json.campaigns);
router.get("/insertions", json.insertions);
router.get("/formats", json.formats);
router.get("/sites", json.sites);
router.get("/folder", json.folder);

/*

router.get("/platforms", json.platforms);

router.get("/agencies", json.agencies);
router.get("/countries", json.countries);
router.get("/templates", json.templates);
*/
module.exports = router;