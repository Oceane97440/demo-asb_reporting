// Initialisation de la connexion à la bdd
const db = require("../models/index.js");
// const modelsCampaign = require("../models/models.campaign.js");
db.sequelize.sync();
sequelize = db.sequelize;
Sequelize = db.Sequelize;

// Attribue le model annonceur à une constante
const Advertiser = db.advertiser;
// Attribue le model campagne à une constante
const Campaign = db.campaign;

exports.index = (req, res) => {

  // Récupére l'ensemble des données de la table Annonceurs
  Campaign.findAll(
    {
      include : [
        {
          model : Advertiser,
          as: 'advertisers'
        }
      ]
    }
  ).then(data => {

    // Affiche le template 
    res.render('campaigns/index', {
      campaigns: data
    });

  })
  .catch(err => {
    res.status(500).send({
      message:
        err.message || "Some error occurred while retrieving tutorials."
    });
  });

};


// Create and Save a new Campaign
exports.create = (req, res) => {
  // Validate request
  if (!req.body.campaign_name) {
    res.status(400).send({
      message: "Le nom de la campagne est vide !"
    });
    return;
  }

  // Create a Campaign
  const campaign = {
    campaign_id: req.body.campaign_id,
    campaign_name: req.body.campaign_name,
    advertiser_id: req.body.advertiser_id,
    agency_id: req.body.agency_id,
    campaign_status_id: req.body.campaign_status_id,
    campaign_description: req.body.campaign_description,
    campaign_external_id: req.body.campaign_external_id,
    campaign_trafficked_by: req.body.campaign_trafficked_by,
    campaign_traded_by: req.body.campaign_traded_by,
    campaign_start_date: req.body.campaign_start_date,
    campaign_end_date: req.body.campaign_end_date,
    campaign_global_capping: req.body.campaign_global_capping,
    campaign_visit_capping: req.body.campaign_visit_capping,
    campaign_isarchived: req.body.campaign_isarchived
  };

  // Save Campaign in the database
  Campaign.create(campaign)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the campaign."
      });
    });
};

// Retrieve all Campaigns from the database.
exports.findAll = (req, res) => {

};

// Find a single Campaign with an id
exports.findOne = (req, res) => {

  // Validate request
  if (!req.params.id) {
    res.status(400).send({
      message: "ID CAMPAIGN est vide !"
    });
  } else {

    var campaign_id = req.params.id;
    Campaign.findOne({
        where: {
          'campaign_id': req.params.id,
        } ,
        include : [
          {
            model : Advertiser,
            as: 'advertisers'
          }
        ]      
      }).then(data => {
        // Attribue l'Id Annonceur à une variable
        var campaign_id = data.campaign_id;
          // Affiche le template 
          res.render('campaigns/findOne', {
            info: data
          });
        
      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving tutorials."
        });
      });

  }

};



// Update a Campaign by the id in the request
exports.update = (req, res) => {

};

// Delete a Campaign with the specified id in the request
exports.delete = (req, res) => {

};

// Delete all Campaigns from the database.
exports.deleteAll = (req, res) => {

};

// Find all published Campaigns
exports.findAllPublished = (req, res) => {

};
