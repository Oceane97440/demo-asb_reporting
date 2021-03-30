const router = require("express").Router();
const Sequelize = require('sequelize');

const automate = require("../controllers/controllers.automate");

// router.get("/agencies", automate.agencies);

router.get("/advertisers", automate.advertisers);
router.get("/campaigns", automate.campaigns);
/*

router.get("/cities", automate.cities);
router.get("/countries", automate.countries);
router.get("/continents", automate.continents);
router.get("/formats", automate.formats);
router.get("/insertions", automate.insertions);
router.get("/packs", automate.packs);
router.get("/pages", automate.pages);
router.get("/sites", automate.sites);
router.get("/templates", automate.templates);
*/
module.exports = router;