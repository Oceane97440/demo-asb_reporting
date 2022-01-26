const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const CampaignsTV = sequelize.define('campaigns_tv', {
    campaign_tv_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    campaign_tv_name: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    advertiser_tv_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    campaign_tv_start_date: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    campaign_tv_end_date: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    campaign_tv_user: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },
    campaign_tv_budget: {
        type: Sequelize.DECIMAL,
        allowNull: true
    },
    campaign_tv_type: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    campaign_tv_crypt: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    campaign_tv_file: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    created_at: {
        type: Sequelize.DATE(),
        allowNull: true
    },
    updated_at: {
        type: Sequelize.DATE(),
        allowNull: true
    }
}, {
    tableName: 'asb_campaigns_tv',
    underscored: true,
    timestamps: true
});

module.exports = CampaignsTV;