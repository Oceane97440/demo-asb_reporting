// Initialisation de la connexion à la bdd
const db = require("../models/index.js");
db.sequelize.sync();
sequelize = db.sequelize;
Sequelize = db.Sequelize;

// Attribue le model annonceur à une constante
const Advertiser = db.advertiser;
// Attribue le model campagne à une constante
const Campaign = db.campaign;
// Attribue le model campagne à une constante
const Insertion = db.insertion;

exports.index = (req, res) => {

    // Récupére l'ensemble des données de la table Insertions
    Insertion.findAll(
      {
        include : [
          {
            model : Campaign,
            as: 'campaigns'
          }
        ]
      }
    ).then(data => {
  
      // Affiche le template 
      res.render('insertions/index', {
        insertions: data
      });
  
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving tutorials."
      });
    });
  
  };
  
  