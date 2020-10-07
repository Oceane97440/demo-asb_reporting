const { update } = require("../controllers/controllers.api_manager");

module.exports = app => {
    const api = require("../controllers/controllers.CRUD");
    var router = require("express").Router();

    router.get("/campaign",api.campaign)
    router.get("/campaign_form",api.campaign_form)
    router.post("/add_campaign",api.add_campaign)

     router.get("/advertiser",api.advertiser)
     router.post("/add_advertiser",api.add_advertiser)
    router.get("/edit/:id",api.edit_advertiser)
    router.post("/update/:id",api.update_advertiser)
    router.get('/delete/:id',api.delete)
    // router.get("/test",api.test)



    app.use('/api/manager/crud', router);
};