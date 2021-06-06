const router = require("express").Router();
const Sequelize = require('sequelize');

const automate = require("../controllers/controllers.automate");

router.get("/json", automate.json);

router.get("/agencies", automate.agencies);
router.get("/advertisers", automate.advertisers);
router.get("/campaigns", automate.campaigns);
router.get("/campaigns/insertions", automate.campaignsInsertions);
router.get("/formats", automate.formats);

router.get("/sites", automate.sites);
router.get("/templates", automate.templates);
router.get("/platforms", automate.platforms);
router.get("/deliverytypes", automate.deliverytypes);
router.get("/insertions_status", automate.insertions_status);

router.get("/insertions", automate.insertions);

router.get("/insertions_templates", automate.insertions_templates);
router.get("/insertions_priorities", automate.insertions_priorities);
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