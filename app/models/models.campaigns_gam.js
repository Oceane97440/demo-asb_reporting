const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const CampaignsGam = sequelize.define('campaigns_admanager', {
    campaign_admanager_id: {
        type: Sequelize.DOUBLE,
         primaryKey: true
    },
    campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    advertiser_admanager_id: {
        type: Sequelize.DOUBLE,
        allowNull: true
    },
    campaign_admanager_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
    },

    campaign_admanager_start_date: {
        type: Sequelize.DATE,
        allowNull: true
    },
    campaign_admanager_end_date: {
        type: Sequelize.DATE,
        allowNull: true
    },
    campaign_admanager_status: {
        type: Sequelize.STRING(255),
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
    tableName: 'asb_campaigns_admanager',
    underscored: true,
    timestamps: true
});

module.exports = CampaignsGam;
