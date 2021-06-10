const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Advertisers = sequelize.define('advertisers', {
    advertiser_id: {
        type: Sequelize.INTEGER,
      //  autoIncrement: true,
        primaryKey: true
    },
    advertiser_name: {
        type: Sequelize.STRING(),
        allowNull: false
    },
    advertiser_archived: {
        type: Sequelize.TINYINT(),
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
    tableName: 'asb_advertisers',
    underscored: true,
    timestamps: true
});

module.exports = Advertisers;
