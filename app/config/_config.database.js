//BDD LOCALHOST
const dotenv = require("dotenv");
dotenv.config({path:"./config.env"})


const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.BD_CONNECTION, process.env.BD_USER, process.env.BD_PASS, {
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