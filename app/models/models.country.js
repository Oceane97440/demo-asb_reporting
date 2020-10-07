const Sequelize = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Country = sequelize.define('country', {
        country_id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },     
        country_iso3166: Sequelize.STRING,
        country_name: Sequelize.STRING,
        country_is_archived: Sequelize.BIGINT,
        continent_id: Sequelize.BIGINT,
        country_extended_name:Sequelize.STRING,
    }, {
        tableName: 'heroku_e2bdbc337a87f5c.asb_country',
        underscored: true,
        timestamps: false
    });

    // Récupére le model country
   // const Country = require('./index.js');
   // const countryDb = Country(sequelize, Sequelize);
/*
    Country.belongsTo(countryDb, {
        as: 'country',
        foreignKey: 'country_id',
        onDelete: 'cascade',
        hooks: true
    });*/

    return Country;
};