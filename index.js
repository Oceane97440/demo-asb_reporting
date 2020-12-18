const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const cors = require('cors');
var cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')



const db = require("./app/config/_config.database");

const campaing_epilot = require('./app/models/models.campaing_epilot');
const country=require('./app/models/models.country')
const formats=require('./app/models/models.format')
const sites=require('./app/models/models.site')
const packs=require('./app/models/models.pack')
const packs_sites=require('./app/models/models.pack_site')
const users =require('./app/models/models.user.js')
const roles  =require('./app/models/models.role')
const users_roles =require('./app/models/models.user_role')


 /* Mettre les relation ici */
sites.belongsTo(country);
country.hasMany(sites);

//un pack contien un site 
//un site peut appartenir un à plusieur pack
packs.hasOne(packs_sites, { foreignKey: 'pack_id', onDelete: 'cascade', hooks: true });
sites.hasMany(packs_sites, { foreignKey: 'site_id', onDelete: 'cascade', hooks: true }); 


//un user possède un role
//un role possède un à plusieur user
users.hasOne(users_roles, { foreignKey: 'user_id', onDelete: 'cascade', hooks: true });
roles.hasMany(users_roles, { foreignKey: 'role_id', onDelete: 'cascade', hooks: true }); 

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
app.use(cookieParser());
app.use(
  cookieSession({
    name: 'BI_antennesb',
    keys: ['asq4b4PR'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  })
)
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));


/**
 * @MidleWare
 * UTILISATEUR CONNECTÉ
 */
app.use('/*', function (req, res, next) {
  // console.log(req.session)
  res.locals.currentUser = {}
  if (req.session.user) {
    res.locals.currentUser.login = req.session.user.login // login de l'utilisateur connecté (dans le menu) accessible pour toutes les vues
    res.locals.currentUser.id = req.session.user.id
  }
  next()
})


app.use(express.static(path.join(__dirname, 'public')));



const index = require('./app/routes/routes.index');

app.use('/', index);


const forecast = require('./app/routes/routes.api_forecast');

app.use('/api/forecast', forecast);


const reporting = require('./app/routes/routes.api_report');

app.use('/api/reporting', reporting);

const epilot = require('./app/routes/routes.api_epilot');

app.use('/api/epilot', epilot);

const manager = require('./app/routes/routes.api_manager');

app.use('/api/manager', manager);

const user = require('./app/routes/routes.api_user');

app.use('/api/utilisateur', user);


/**Le serveur ecoute sur le port 3000  */
// app.set("port", process.env.PORT || 3000);
app.set("port", process.env.PORT || 3000);



 app.listen(app.get("port"), () => {
  console.log(`server on port ${app.get("port")}`);
 });
//app.listen(3000, function () {
//  console.log(`Server running at http://${hostname}:${port}/`);
//});