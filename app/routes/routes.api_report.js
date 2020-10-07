  module.exports = app => {
    const api = require("../controllers/controllers.api_report");
    var router = require("express").Router();

    // Affiche la page api
    router.get("/", api.index);
    router.get("/test", api.test_reporting);

/*
    router.get("/campaigns", api.campaigns);
    router.get("/campaigns/status", api.campaignsstatus);
    router.get("/advertisers", api.advertisers);
    router.get("/insertions", api.insertions);
*/

        // Affiche les informations en fonction de l' :id
    router.get("/campaign/:id(\\d+)/", api.campaign);

    app.use('/api/report', router);
  };