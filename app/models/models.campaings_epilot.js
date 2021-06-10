const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const CampaingsEpilot = sequelize.define('campaigns_epilot', {

    campaign_epilot_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    campaign_epilot_code: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    campaign_epilot_name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    advertiser_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    format_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    campaign_epilot_status: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    campaign_epilot_start_date: {
        type: Sequelize.DATE(),
        allowNull: false
    },
    campaign_epilot_end_date: {
        type: Sequelize.DATE(),
        allowNull: false
    },
    campaign_epilot_volume: {
        type: Sequelize.BIGINT(),
        allowNull: false
    }
}, {
    tableName: 'asb_campaigns_epilot',
    underscored: true,
    timestamps: false
});

module.exports = CampaingsEpilot;
