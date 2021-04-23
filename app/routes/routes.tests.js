const router = require("express").Router();
const Sequelize = require('sequelize');


const test = require("../controllers/controllers.tests");
    

    // Affiche la page api
    router.get("/", test.index);
   



   




    
module.exports = router;