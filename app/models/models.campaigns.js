const Sequelize = require('sequelize');


const sequelize = require('../config/_config.database').sequelize;


const Campaigns = sequelize.define('campaigns', {

    campaign_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    campaign_name: {type: Sequelize.STRING(),allowNull:false},
    advertiser_id: {type: Sequelize.INTEGER,allowNull:false},
    agency_id: {type: Sequelize.INTEGER,allowNull:true},
    campaign_start_date: {type: Sequelize.STRING(),allowNull:false},
    campaign_end_date: {type: Sequelize.STRING(),allowNull:false},
    campaign_status_id: {type: Sequelize.INTEGER,allowNull:true},
    campaign_archived: {type: Sequelize.TINYINT,allowNull:true},


},
{tableName: 'asb_campaigns', underscored: true, timestamps: false}
);

module.exports = Campaigns;
