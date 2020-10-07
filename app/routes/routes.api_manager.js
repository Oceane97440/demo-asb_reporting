  module.exports = app => {
    const api = require("../controllers/controllers.api_manager");
    var router = require("express").Router();

    // Affiche la page api
    router.get("/", api.index);

    router.get("/campaigns", api.campaigns);
    router.get("/campaigns/status", api.campaignsstatus);
    router.get("/advertisers", api.advertisers);
    router.get("/insertions", api.insertions);

    router.get("/formats", api.formats)
    router.get("/sites", api.sites)
    router.get("/countries", api.countries);

    app.use('/api/manager', router);
  };