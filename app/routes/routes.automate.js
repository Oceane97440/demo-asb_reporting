const router = require("express").Router();
const Sequelize = require('sequelize');

const automate = require("../controllers/controllers.automate");

router.get("/agencies", automate.agencies);
router.get("/advertisers", automate.advertisers);
router.get("/campaigns", automate.campaigns);
router.get("/formats", automate.formats);

router.get("/sites", automate.sites);
router.get("/templates", automate.templates);
router.get("/platforms", automate.platforms);
router.get("/deliverytypes", automate.deliverytypes);
router.get("/insertionstatus", automate.insertionstatus);

router.get("/insertions", automate.insertions);

router.get("/insertionstemplates", automate.insertionstemplates);
router.get("/creatives", automate.creatives);
router.get("/countries", automate.countries);
router.get("/reports", automate.reports);

/* router.get("/cities", automate.cities);
router.get("/continents",
 * automate.continents);
router.get("/packs", automate.packs);
 * router.get("/pages", automate.pages);
 */
module.exports = router;