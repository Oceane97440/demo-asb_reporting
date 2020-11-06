const Sequelize = require('sequelize');

const sequelize = require('../config/config.database.local').sequelize;


const Campaing_epilot = sequelize.define('campaign_epilot', {

    
    campaign_epilot_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    campaign_name: {type: Sequelize.STRING(45),allowNull:false},
    format_name: {type: Sequelize.STRING(45),allowNull:false},
    etat:{type:Sequelize.BIGINT(),allowNull:false},
    campaign_start_date: {type: Sequelize.DATE(),allowNull:false},
    campaign_end_date: {type: Sequelize.DATE(),allowNull:false},
    volume_prevue: {type: Sequelize.FLOAT,allowNull:false},

},
{tableName: 'asb_campaign_epilot', underscored: true, timestamps: false}
);

module.exports = Campaing_epilot;
