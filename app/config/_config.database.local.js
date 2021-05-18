//BDD LOCALHOST

const Sequelize = require("sequelize");
const sequelize = new Sequelize("asb_report", "root", "", {
    host: "localhost",
    dialect: "mysql",
    operatorsAliases: true,
    logging: false,
    dialectOptions: {
        useUTC: false, //for reading from database
        dateStrings: true,
        typeCast: true
    },
    //timezone: '+04:00', for writing to database
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

module.exports = db;