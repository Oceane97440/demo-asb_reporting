module.exports = app => {
    const api = require("../controllers/_controllers.api_forecast");
    var router = require("express").Router();

    // Affiche la page api
    router.get("/", api.index);
	router.post("/add",api.forecast);

    // router.get("/indexa", api.indexa);
    // router.get("/sites", api.sites);
    // router.get("/countries", api.countries);
    // router.get("/formats", api.formats);

  

    app.use('/api/forecast/test', router);
  };