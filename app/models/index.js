const dbConfig = require("../config/config.database");

const Sequelize = require("sequelize");
const sequelize = new Sequelize(dbConfig.DB, dbConfig.USER, dbConfig.PASSWORD, {
  host: dbConfig.HOST,
  dialect: dbConfig.dialect,

  pool: {
    max: dbConfig.pool.max,
    min: dbConfig.pool.min,
    acquire: dbConfig.pool.acquire,
    idle: dbConfig.pool.idle
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