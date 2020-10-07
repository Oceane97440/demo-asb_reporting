  module.exports = app => {
    const insertions = require("../controllers/controllers.insertion");
    var router = require("express").Router();

    // 
    router.get("/", insertions.index);

    app.use('/insertions', router);

  };