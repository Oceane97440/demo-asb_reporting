const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const EpilotCampaigns = sequelize.define('epilot_campaigns', {
    epilot_campaign_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    epilot_campaign_code: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    epilot_campaign_name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },    
    advertiser_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    epilot_advertiser_name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    epilot_campaign_nature: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    epilot_campaign_status: {
        type: Sequelize.TINYINT,
        allowNull: false
    },
    epilot_campaign_start_date: {
        type: Sequelize.DATE(),
        allowNull: false
    },
    epilot_campaign_end_date: {
        type: Sequelize.DATE(),
        allowNull: false
    },
    epilot_campaign_volume: {
        type: Sequelize.FLOAT(),
        allowNull: false
    },
    epilot_campaign_commercial: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    epilot_campaign_budget_brut: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    epilot_campaign_budget_net: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    epilot_campaign_cpm_net: {
        type: Sequelize.FLOAT(),
        allowNull: false
    },
    epilot_campaign_discount_rate: {
        type: Sequelize.FLOAT(),
        allowNull: false
    },
    epilot_campaign_mandataire: {
        type: Sequelize.STRING(255),
        allowNull: false
    }
}, {
    tableName: 'asb_epilot_campaigns',
    underscored: true,
    timestamps: false
});

module.exports = EpilotCampaigns;