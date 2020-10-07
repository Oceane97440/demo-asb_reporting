// Initialisation de la connexion à la bdd
const db = require("../models/index.js");
db.sequelize.sync();
sequelize = db.sequelize;
Sequelize = db.Sequelize;

// Attribue le model annonceur à une constante
const Advertiser = db.advertiser;
// Attribue le model campagne à une constante
const Campaign = db.campaign;

exports.index = (req, res) => {

  // Récupére l'ensemble des données de la table Annonceurs
  Advertiser.findAll().then(data => {

      // Affiche le template 
      res.render('advertisers/index', {
        advertisers: data
      });

    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while retrieving tutorials."
      });
    });

};


// Create and Save a new Advertiser
exports.create = (req, res) => {
  // Validate request
  if (!req.body.advertiser_name) {
    res.status(400).send({
      message: "Le nom de annonceur est vide !"
    });
    return;
  }

  // Create a Advertiser
  const advertiser = {
    advertiser_id: req.body.advertiser_id,
    advertiser_name: req.body.advertiser_name,
    advertiser_id: req.body.advertiser_id,
    agency_id: req.body.agency_id,
    advertiser_status_id: req.body.advertiser_status_id,
    advertiser_description: req.body.advertiser_description,
    advertiser_external_id: req.body.advertiser_external_id,
    advertiser_trafficked_by: req.body.advertiser_trafficked_by,
    advertiser_traded_by: req.body.advertiser_traded_by,
    advertiser_start_date: req.body.advertiser_start_date,
    advertiser_end_date: req.body.advertiser_end_date,
    advertiser_global_capping: req.body.advertiser_global_capping,
    advertiser_visit_capping: req.body.advertiser_visit_capping,
    advertiser_isarchived: req.body.advertiser_isarchived
  };

  // Save Advertiser in the database
  Advertiser.create(advertiser)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message: err.message || "Some error occurred while creating the advertiser."
      });
    });
};

// Retrieve all Advertisers from the database.
exports.findAll = (req, res) => {

};

// Find a single Advertiser with an id
exports.findOne = (req, res) => {

  // Validate request
  if (!req.params.id) {
    res.status(400).send({
      message: "ID annonceur est vide !"
    });
  } else {

    var advertiser_id = req.params.id;
    Advertiser.findOne({
        where: {
          'advertiser_id': req.params.id,
        }
      }).then(data => {
        // Attribue l'Id Annonceur à une variable
        var advertiser_id = data.advertiser_id;

        // Affiche les campagnes de l'ID annonceur
        Campaign.findAll({
          where: {
            advertiser_id: advertiser_id
          },
          include: [{
            model: Advertiser,
            as: 'advertisers'
          }]
        }).then(campaignList => {

          // Affiche le template 
          res.render('advertisers/findOne', {
            info: data,
            campaigns: campaignList
          });

        });

      })
      .catch(err => {
        res.status(500).send({
          message: err.message || "Some error occurred while retrieving tutorials."
        });
      });

  }

};

// Update a Advertiser by the id in the request
exports.update = (req, res) => {

};

// Delete a Advertiser with the specified id in the request
exports.delete = (req, res) => {

};

// Delete all Advertisers from the database.
exports.deleteAll = (req, res) => {

};

// Find all published Advertisers
exports.findAllPublished = (req, res) => {

};