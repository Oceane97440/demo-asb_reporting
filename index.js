const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const cors = require('cors');



const db = require("./app/config/_config.database");

const campaing_epilot = require('./app/models/models.campaing_epilot');
const country=require('./app/models/models.country')
const formats=require('./app/models/models.format')
const sites=require('./app/models/models.site')


// Routes handler


 /* Mettre les relation ici */
sites.belongsTo(country);
country.hasMany(sites);

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




app.use(express.static(path.join(__dirname, 'public')));


const index = require('./app/routes/routes.api_forecast');

app.use('/api/forecast', index);







/**Le serveur ecoute sur le port 3000  */
// app.set("port", process.env.PORT || 3000);
app.set("port", process.env.PORT || 3000);



app.listen(app.get("port"), () => {
  console.log(`server on port ${app.get("port")}`);
});
// app.listen(3000, function () {
//   console.log(`Server running at http://${hostname}:${port}/`);
// });