const router = require("express").Router();
const Sequelize = require('sequelize');


const alert = require("../controllers/controllers.alerts");
    

    // Affiche la page api
    router.get("/creatives", alert.creativeUrl);
    router.get("/insertions",alert.insertionsOffligne)
   



   




    
module.exports = router;