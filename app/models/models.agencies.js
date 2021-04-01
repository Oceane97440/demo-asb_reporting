const Sequelize = require('sequelize');


const sequelize = require('../config/_config.database').sequelize;


const Agencies = sequelize.define('agencies', {

    agency_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    agency_name: {type: Sequelize.STRING(),allowNull:false},
    agency_archived : {type: Sequelize.TINYINT(),allowNull:true},

},
{tableName: 'asb_agencies', underscored: true, timestamps: false}
);

module.exports = Agencies;
