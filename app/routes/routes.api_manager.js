const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.api_manager");


// Affiche la page api

router.get('/', function (req, res) {
    res.send('hello world');
});

router.get("/list_advertisers", api.advertiser_liste);
router.get("/view_campagne/:id", api.view_campagne);
router.get("/campagne_json/:id", api.campagne_json)





module.exports = router;