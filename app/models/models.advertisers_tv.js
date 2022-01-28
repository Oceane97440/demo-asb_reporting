const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const AdvertisersTV = sequelize.define('advertisers_tv', {
    advertiser_tv_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    advertiser_tv_name: {
        type: Sequelize.STRING(),
        allowNull: false
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
    tableName: 'asb_advertisers_tv',
    underscored: true,
    timestamps: true
});

module.exports = AdvertisersTV;
