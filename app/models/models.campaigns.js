const Sequelize = require('sequelize');


const sequelize = require('../config/_config.database').sequelize;


const Campaigns = sequelize.define('campaigns', {

    campaign_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    campaign_name: {type: Sequelize.STRING(),allowNull:false},
    advertiser_id: {type: Sequelize.INTEGER,allowNull:false},
    start_date: {type: Sequelize.STRING(),allowNull:false},
    end_date: {type: Sequelize.STRING(),allowNull:false},



},
{tableName: 'asb_campaigns', underscored: true, timestamps: false}
);

module.exports = Campaigns;
