const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const axios = require('axios');
const app = express();
var path = require('path');
var cors = require('cors');

// Initialisation de la connexion à la bdd
const db = require("./app/models/index.js");
db.sequelize.sync();
sequelize = db.sequelize;
Sequelize = db.Sequelize;

// Déclare le nom de domaine et le port du site
// const hostname = '127.0.0.1';
// const port = '3000';

// 
/** view engine setup*/
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(cors());

app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/', function (req, res) {
  const Advertiser = db.advertiser;

  // force: true will drop the table if it already exists
  var advertisers = Advertiser.findAll();
  console.log(advertisers);

  /* 
    Advertiser.findAll().then(function(advertisers) {
    console.log(advertisers)
    });

    console.log("Welcome to ASB REPORT.");
    res.json({
    message: "Welcome to ASB REPORT."
    });
    // smartApi();  


    ModelAdvertiser.findAll().then(function(advertisers) {
    console.log(advertisers)
    })
  */

 res.render('index', {advertisers: advertisers});
});


app.use(express.static(path.join(__dirname, 'public')));

// Gestion des urls de campagnes
require("./app/routes/routes.campaign")(app);

// Gestion des urls de api manager
require("./app/routes/routes.api_manager")(app);

// Gestion des urls de api report
require("./app/routes/routes.api_report")(app);

// Gestion des urls de annonceurs
require("./app/routes/routes.advertiser")(app);

// Gestion des urls d'insertions
require("./app/routes/routes.insertion")(app);

require("./app/routes/routes.api_forecast")(app);

require("./app/routes/_routes.api_forecast")(app);

//crud bdd
require("./app/routes/routes.crud")(app);




/**Le serveur ecoute sur le port 3000  */
// app.set("port", process.env.PORT || 3000);
app.set("port", process.env.PORT || 3000);



app.listen(app.get("port"), () => {
  console.log(`server on port ${app.get("port")}`);
});
// app.listen(3000, function () {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });