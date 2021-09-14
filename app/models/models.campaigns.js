const Sequelize = require('sequelize');

const sequelize = require('../config/config.database').sequelize;

const Campaigns = sequelize.define('campaigns', {
    campaign_id: {
        type: Sequelize.INTEGER,
        //autoIncrement: true,
         primaryKey: true
    },
    campaign_name: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    campaign_crypt: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    advertiser_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        //defaultValue: 0
    },
    agency_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    campaign_start_date: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    campaign_end_date: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    campaign_status_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    campaign_archived: {
        type: Sequelize.TINYINT,
        allowNull: true
    },
    created_at: {
        type: Sequelize.DATE(),
        allowNull: true
    }
    ,
    updated_at: {
        type: Sequelize.DATE(),
        allowNull: true
    }
}, {
    tableName: 'asb_campaigns',
    underscored: true,
    timestamps: true
});

module.exports = Campaigns;
