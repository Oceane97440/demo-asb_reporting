const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.api_forecast_user");
    

    // Affiche la page api
    router.get("/", api.index);
    router.post("/add", api.forecast_user);
   




    
module.exports = router;