const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.api_epilot");
    

    // Affiche la page api
    router.get("/", api.index);
    router.post("/csv_import/add", api.csv_import);
    //router.get("/csv_import", api.csv_import);



   




    
module.exports = router;