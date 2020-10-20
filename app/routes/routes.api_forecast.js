module.exports = app => {
    const api = require("../controllers/controllers.api_forecast");
    var router = require("express").Router();

    // Affiche la page api
    router.get("/", api.index);
    router.post("/add", api.forecast);
    router.get("/form_epilot", api.epilot)
    router.post("/campagne_epilot", api.campaign_epilot);

    // router.get("/indexa", api.indexa);
    // router.get("/sites", api.sites);
    // router.get("/countries", api.countries);
    // router.get("/formats", api.formats);



    app.use('/api/forecast', router);
};