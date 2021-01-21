const router = require("express").Router();
const Sequelize = require('sequelize');


const api = require("../controllers/controllers.api_forecast_user");
    

    // Affiche la page api
    router.get("/", api.index);
    router.post("/add", api.forecast_user);
    router.get("/campagne_epilot", api.epilot)
    router.post("/campagne_epilot/add", api.campaign_epilot);




    
module.exports = router;