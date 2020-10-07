  module.exports = app => {
    const advertisers = require("../controllers/controllers.advertiser");
    var router = require("express").Router();

    // Liste les annonceurs
    router.get("/", advertisers.index);

    // Affiche les informations en fonction de l' :id
    router.get("/:id(\\d+)/", advertisers.findOne);

    app.use('/advertisers', router);

    /*
      // Retrieve all Tutorials
      router.get("/advertisers", campaign.findAll);

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