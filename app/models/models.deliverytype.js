const Sequelize = require('sequelize');


const sequelize = require('../config/_config.database').sequelize;


const DeliveryTypes = sequelize.define('deliverytypes', {

    deliverytype_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    deliverytype_name: {type: Sequelize.STRING(),allowNull:false},

},
{tableName: 'asb_deliverytypes', underscored: true, timestamps: false}
);

module.exports = DeliveryTypes;
