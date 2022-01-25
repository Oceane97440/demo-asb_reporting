const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Advertisers = sequelize.define(' tv_advertisers', {
    advertiser_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    advertiser_name: {
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
    tableName: ' asb_tv_advertisers',
    underscored: true,
    timestamps: true
});

module.exports = Advertisers;
