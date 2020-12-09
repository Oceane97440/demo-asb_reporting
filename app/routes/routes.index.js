const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.index");
    

    // Affiche la page api
    router.get("/", api.index);
   




    
module.exports = router;