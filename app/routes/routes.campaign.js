  module.exports = app => {
    const campaigns = require("../controllers/controllers.campaign");
    var router = require("express").Router();

    router.get("/", campaigns.index);

    // Affiche les informations en fonction de l' :id
    router.get("/:id(\\d+)/", campaigns.findOne);

    app.use('/campaigns', router);

    /*
    // Retrieve all Tutorials
    router.get("/campaigns", campaign.findAll);


    // Create a new Tutorial
    router.post("/", tutorials.create);
  
    // Retrieve all Tutorials
    router.get("/", tutorials.findAll);
  
    // Retrieve all published Tutorials
    router.get("/published", tutorials.findAllPublished);
  
    // Retrieve a single Tutorial with id
    router.get("/:id", tutorials.findOne);
  
    // Update a Tutorial with id
    router.put("/:id", tutorials.update);
  
    // Delete a Tutorial with id
    router.delete("/:id", tutorials.delete);
  
    // Create a new Tutorial
    router.delete("/", tutorials.deleteAll);
  */
  };