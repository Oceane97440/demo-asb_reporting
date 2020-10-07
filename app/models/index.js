// const dbConfig = require("../config/config.database");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.DB, process.env.USER, process.env.PASSWORD, {
  host: process.env.HOST,
  dialect: "mysql",
  operatorsAliases:false,


  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.campaign = require("./models.campaign.js")(sequelize, Sequelize);
db.campaignstatus = require("./models.campaignstatus.js")(sequelize, Sequelize);
db.advertiser = require("./models.advertiser.js")(sequelize, Sequelize);
db.insertion = require("./models.insertion.js")(sequelize, Sequelize);
db.site = require("./models.site.js")(sequelize, Sequelize);
db.format = require("./models.format.js")(sequelize, Sequelize);
db.country = require("./models.country.js")(sequelize, Sequelize);

module.exports = db;