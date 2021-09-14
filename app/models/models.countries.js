const Sequelize = require('sequelize');

const sequelize = require('../config/config.database').sequelize;

const Countries = sequelize.define('countries', {
    country_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    country_iso3166: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    country_name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    country_archived: {
        type: Sequelize.TINYINT(),
        allowNull: true
    },
    continent_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    country_extended_name: {
        type: Sequelize.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'asb_countries',
    underscored: true,
    timestamps: false
});

module.exports = Countries;
