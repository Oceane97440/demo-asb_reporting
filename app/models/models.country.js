const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;


const Country = sequelize.define('country', {

    country_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    country_iso3166: {type: Sequelize.STRING(45),allowNull:false},
    country_name: {type: Sequelize.STRING(45),allowNull:false},
    country_is_archived:{type:Sequelize.BIGINT(),allowNull:false},
    continent_id: {type: Sequelize.DATE(),allowNull:false},
    country_extended_name: {type: Sequelize.DATE(),allowNull:false},
    volume_prevue: {type: Sequelize.FLOAT,allowNull:false},
   id_users: {type: Sequelize.DOUBLE,allowNull:false},

},
{tableName: 'asb_country', underscored: true, timestamps: false}
);

module.exports = Country;







