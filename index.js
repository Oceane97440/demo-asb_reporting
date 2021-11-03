const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const path = require('path');
const cors = require('cors');
var cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session')
var fileUpload = require('express-fileupload');

const db = require("./app/config/_config.database");

const epilot_campaigns = require('./app/models/models.epilot_campaigns');
const epilot_insertions = require('./app/models/models.epilot_insertions');
const countries = require('./app/models/models.countries');
const sites = require('./app/models/models.sites');
const packs = require('./app/models/models.packs');
const packs_sites = require('./app/models/models.packs_sites');
const users = require('./app/models/models.users');
const roles = require('./app/models/models.roles');
const roles_users = require('./app/models/models.roles_users');
const campaigns = require('./app/models/models.campaigns');
const advertisers = require('./app/models/models.advertisers');
const campaigns_gam = require('./app/models/models.campaigns_gam');

const advertisers_users = require('./app/models/models.advertisers_users');
const agencies = require('./app/models/models.agencies');
const formats = require('./app/models/models.formats');

const groups_formats = require('./app/models/models.groups_formats');
const groups_formats_types = require(
    './app/models/models.formats_groups_types'
)
const formatstemplates = require("./app/models/models.formats_templates")
const insertions = require('./app/models/models.insertions');
const templates = require('./app/models/models.templates');
const insertions_templates = require('./app/models/models.insertions_templates');
const creatives = require('./app/models/models.creatives');
const insertions_status = require('./app/models/models.insertions_status');
const insertions_priorities = require('./app/models/models.insertions_priorities');

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

//un user posséde un role un role posséde un à plusieurs user
users.hasOne(roles_users, {
    foreignKey: 'user_id',
    onDelete: 'cascade',
    hooks: true
});
roles.hasMany(roles_users, {
    foreignKey: 'role_id',
    onDelete: 'cascade',
    hooks: true
});

//un user posséde un ou plusieurs annonceurs,  un role posséde un ou plusieurs users
users.hasOne(advertisers_users, {
    foreignKey: 'user_id',
    onDelete: 'cascade',
    hooks: true
});

advertisers.hasMany(advertisers_users, {
    foreignKey: 'advertiser_id',
    onDelete: 'cascade',
    hooks: true
});

//un format posséde un ou plusieur group un group posséde un à plusieur format
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

// un format posséde un ou plusieurs templates : un template posséde un à plusieurs formats

formatstemplates.belongsTo(templates, {
    foreignKey: 'template_id',
    onDelete: 'cascade',
    hooks: true
});

templates.hasMany(formatstemplates, {
    foreignKey: 'template_id',
    onDelete: 'cascade',
    hooks: true
});

formatstemplates.belongsTo(formats, {
    foreignKey: 'format_id',
    onDelete: 'cascade',
    hooks: true
});

formats.hasMany(formatstemplates, {
    foreignKey: 'format_id',
    onDelete: 'cascade',
    hooks: true
});

campaigns.belongsTo(advertisers, {
    foreignKey: 'advertiser_id',
  //  onDelete: 'cascade',
    hooks: true
});

advertisers.hasMany(campaigns, {
    foreignKey: 'advertiser_id',
  //  onDelete: 'cascade',
    hooks: true
});

campaigns_gam.belongsTo(campaigns, {
    foreignKey: 'campaign_id',
  //  onDelete: 'cascade',
    hooks: true
});

campaigns.hasMany(campaigns_gam, {
    foreignKey: 'campaign_id',
  //  onDelete: 'cascade',
    hooks: true
});


campaigns.belongsTo(agencies, {
    foreignKey: 'agency_id',
  //  onDelete: 'cascade',
    hooks: true
});
agencies.hasMany(campaigns, {
    foreignKey: 'agency_id',
  //  onDelete: 'cascade',
    hooks: true
});

insertions.belongsTo(campaigns, {
    foreignKey: 'campaign_id',
    onDelete: 'cascade',
    hooks: true
});

insertions.belongsTo(insertions_priorities, {
    foreignKey: 'priority_id',
    onDelete: 'cascade',
    hooks: true
});

insertions_status.hasMany(insertions, {
    foreignKey: 'insertion_status_id',
    onDelete: 'cascade',
    hooks: true
});
insertions.belongsTo(insertions_status, {
    foreignKey: 'insertion_status_id',
    onDelete: 'cascade',
    hooks: true
});

// la campagne a un format.
campaigns.hasMany(insertions, {
    foreignKey: 'campaign_id',
    onDelete: 'cascade',
    hooks: true
});

insertions.belongsTo(formats, {
    foreignKey: 'format_id',
    onDelete: 'cascade',
    hooks: true
});

// l'insertion a un format.
formats.hasMany(insertions, {
    foreignKey: 'format_id',
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
    as: 'insertions',
    foreignKey: 'insertion_id',
    onDelete: 'cascade',
    hooks: true
});

epilot_campaigns.belongsTo(campaigns, {
    foreignKey: 'campaign_id',
    onDelete: 'cascade',
    hooks: true
});

epilot_campaigns.belongsTo(advertisers, {
    foreignKey: 'advertiser_id',
    onDelete: 'cascade',
    hooks: true
});

epilot_campaigns.belongsTo(users, {
    foreignKey: 'user_id',
    onDelete: 'cascade',
    hooks: true
});

epilot_campaigns.hasMany(epilot_insertions, {
    foreignKey: 'epilot_campaign_id',
    onDelete: 'cascade',
    hooks: true
});

epilot_insertions.belongsTo(epilot_campaigns, {
    foreignKey: 'epilot_campaign_id',
    onDelete: 'cascade',
    hooks: true
});

epilot_insertions.belongsTo(users, {
    foreignKey: 'user_id',
    onDelete: 'cascade',
    hooks: true
});

epilot_insertions.belongsTo(groups_formats, {
    foreignKey: 'group_format_id',
    onDelete: 'cascade',
    hooks: true
});


db
    .sequelize
    .sync();
sequelize = db.sequelize;
Sequelize = db.Sequelize;

// Déclare le nom de domaine et le port du site const hostname = '127.0.0.1';
// const port = '3000';

//
/** view engine setup*/

app.use(cors());
app.use(bodyParser.json());
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs');
app.use(cors());
app.use(cookieParser());
app.use(cookieSession({
    name: 'BI_antennesb',
    keys: ['asq4b4PR'],
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))
/**L'image à une limite min=50px max=2000px */
app.use(fileUpload());
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended: true}));

/**
 * @MidleWare
 * UTILISATEUR CONNECTÉ
 */

app.get('/*', function (req, res, next) {
    res.locals.user = {}
    if (req.session.user) {

        res.locals.user.user_email = req.session.user.user_email;
        res.locals.user.user_role = req.session.user.user_role;

        //console.log(res.locals.user.user_email)
    }
    next();
});

app.post('/*', function (req, res, next) {
    res.locals.user = {}
    // nom de l'utilisateur connecté (dans le menu) accessible pour toutes les vues
    if (req.session.user) {
        res.locals.user.user_email = req.session.user.user_email;
        res.locals.user.user_role = req.session.user.user_role;
        //console.log(res.locals.user.user_email)
    }
    next();
});

//flash message middleware
app.use((req, res, next) => {
    res.locals.message = req.session.message
    delete req.session.message
    next()
})

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
// const reporting = require('./app/routes/routes.api_report');
// app.use('/r/', reporting);


// action liste campagne epilot
const epilot = require('./app/routes/routes.api_epilot');
app.use('/epilot', epilot);

// action user forecast
const user = require('./app/routes/routes.api_user');
app.use('/utilisateur', user);

// Créer des alerting
const alerts = require('./app/routes/routes.alerts');
app.use('/alerts', alerts);

const tests = require('./app/routes/routes.tests');
app.use('/test', tests);

const application = require('./app/routes/routes.application');
app.use('/app', application);

// Gestion du reporting DIGITAL
const reporting_rs = require('./app/routes/routes.reporting');
app.use('/r/', reporting_rs);


// Gestion du reporting TV
const reportingTV = require('./app/routes/routes.tv.reporting');
app.use('/t/', reportingTV);

// Gestion du management
const manager = require('./app/routes/routes.manager');
app.use('/manager', manager);

// Automatise la récupération de donnée
const automate = require('./app/routes/routes.automate');
const { campaign } = require('./app/controllers/controllers.automate');
app.use('/automate', automate);

// Le serveur ecoute sur le port 3022
app.set("port", process.env.PORT || 3001);

console.log('ENVIRONNEMENT : ',process.env.MY_VARIABLE)

app.listen(app.get("port"), () => {
    console.log(`server on port ${app.get("port")}`);
});
