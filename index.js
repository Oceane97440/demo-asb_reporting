const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const cors = require('cors');
var cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
var fileUpload = require('express-fileupload');


const db = require("./app/config/_config.database");

const campaings_epilot = require('./app/models/models.campaings_epilot');
const countries = require('./app/models/models.countries')
const sites = require('./app/models/models.sites')
const packs = require('./app/models/models.packs')
const packs_sites = require('./app/models/models.packs_sites')
const users = require('./app/models/models.users')
const roles = require('./app/models/models.roles')
const users_roles = require('./app/models/models.users_roles')
const campaigns = require('./app/models/models.campaigns')
const advertisers = require('./app/models/models.advertisers')
const agencies = require('./app/models/models.agencies')
const formats = require('./app/models/models.formats')
const groups_formats = require('./app/models/models.groups_formats')
const groups_formats_types = require('./app/models/models.formats_groups_types')
const insertions = require('./app/models/models.insertions')
const templates = require('./app/models/models.templates')
const insertions_templates = require('./app/models/models.insertionstemplates')
const creatives = require('./app/models/models.creatives')
const insertionstatus = require('./app/models/models.insertionstatus')




/* Mettre les relation ici */
/*sites.belongsTo(countries);
countries.hasMany(sites);*/

//un pack contien un site un site peut appartenir un à plusieur pack
packs.hasMany(packs_sites, {
    foreignKey: 'pack_id',
    onDelete: 'cascade',
    hooks: true
});
sites.hasMany(packs_sites, {
    foreignKey: 'site_id',
    onDelete: 'cascade',
    hooks: true
});

//un user possède un role un role possède un à plusieur user
users.hasOne(users_roles, {
    foreignKey: 'user_id',
    onDelete: 'cascade',
    hooks: true
});
roles.hasMany(users_roles, {
    foreignKey: 'role_id',
    onDelete: 'cascade',
    hooks: true
});

//un format possède un ou plusieur group un group possède un à plusieur format
formats.hasMany(groups_formats_types, {
    foreignKey: 'format_id',
    onDelete: 'cascade',
    hooks: true
});
groups_formats.hasMany(groups_formats_types, {
    foreignKey: 'group_format_id',
    onDelete: 'cascade',
    hooks: true
});

campaigns.belongsTo(advertisers, {
    foreignKey: 'advertiser_id',
    onDelete: 'cascade',
    hooks: true
}); // la campagne à un format.
advertisers.hasMany(campaigns, {
    foreignKey: 'advertiser_id',
    onDelete: 'cascade',
    hooks: true
});

insertions.belongsTo(campaigns, {
  foreignKey: 'campaign_id',
  onDelete: 'cascade',
  hooks: true
}); // la campagne à un format.
campaigns.hasMany(insertions, {
  foreignKey: 'campaign_id',
  onDelete: 'cascade',
  hooks: true
});

insertionstatus.belongsTo(insertions, {
  foreignKey: 'insertion_status_id',
  onDelete: 'cascade',
  hooks: true
}); 
insertions.hasMany(insertionstatus, {
  foreignKey: 'insertion_status_id',
  onDelete: 'cascade',
  hooks: true
});



insertions_templates.belongsTo(insertions, {
    foreignKey: 'insertion_id',
    onDelete: 'cascade',
    hooks: true
});
insertions.hasMany(insertions_templates, {
    foreignKey: 'insertion_id',
    onDelete: 'cascade',
    hooks: true
});
insertions_templates.belongsTo(templates, {
    foreignKey: 'template_id',
    onDelete: 'cascade',
    hooks: true
});
templates.hasMany(insertions_templates, {
    foreignKey: 'template_id',
    onDelete: 'cascade',
    hooks: true
});




creatives.belongsTo(insertions, {
    foreignKey: 'insertion_id',
    onDelete: 'cascade',
    hooks: true
});
insertions.hasMany(creatives, {
  as: 'Inserion',
    foreignKey: 'insertion_id',
    onDelete: 'cascade',
    hooks: true
});


db
    .sequelize
    .sync();
sequelize = db.sequelize;
Sequelize = db.Sequelize;




// Déclare le nom de domaine et le port du site
// const hostname = '127.0.0.1';
// const port = '3000';

// 
/** view engine setup*/
app.use(bodyParser.json());
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
/**L'image à une limite min=50px max=2000px */
app.use(fileUpload());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({
  extended: true
}));


/**
 * @MidleWare
 * UTILISATEUR CONNECTÉ
 */


app.get('/*', function (req, res, next) {
  res.locals.user = {}
  if (req.session.user) {

    res.locals.user.email = req.session.user.email;
    res.locals.user.role = req.session.user.role;

    //console.log(res.locals.user.email)
  }
  next();
});

app.post('/*', function (req, res, next) {
  res.locals.user = {}
  // nom de l'utilisateur connecté (dans le menu) accessible pour toutes les vues

  if (req.session.user) {

    res.locals.user.email = req.session.user.email;
    res.locals.user.role = req.session.user.role;

    //console.log(res.locals.user.email)
  }

  next();
});



app.post('/uploads', function (req) {
  console.log(req.files.file_csv.name); //requette.files.nom du file 


});


app.use(express.static(path.join(__dirname, 'public')));


// signup login home page
const index = require('./app/routes/routes.index');

app.use('/', index);

// action admin forecast
const forecast = require('./app/routes/routes.api_forecast');

app.use('/forecast', forecast);

// action admin reporting

const reporting = require('./app/routes/routes.api_report');

app.use('/r/', reporting);

// action liste campagne epilot

const epilot = require('./app/routes/routes.api_epilot');

app.use('/epilot', epilot);

// action admin recupération donnée api

const manager = require('./app/routes/routes.api_manager');

app.use('/manager', manager);

// action user forecast

const user = require('./app/routes/routes.api_user');

app.use('/utilisateur', user);

// Automatise la récupération de donnée
const automate = require('./app/routes/routes.automate');
app.use('/automate', automate);

// Crée des alerting 
const alert = require('./app/routes/routes.alerts');
app.use('/alerts', alert);


/**Le serveur ecoute sur le port 3000  */
// app.set("port", process.env.PORT || 3000);
app.set("port", process.env.PORT || 3000);



app.listen(app.get("port"), () => {
  console.log(`server on port ${app.get("port")}`);
});
//app.listen(3000, function () {
//  console.log(`Server running at http://${hostname}:${port}/`);
//});