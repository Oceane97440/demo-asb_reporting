const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.api_manager");


// Affiche la page api

router.get('/', function (req, res) {
    res.send('hello world');
});

router.get("/formats", api.formats_add);



module.exports = router;