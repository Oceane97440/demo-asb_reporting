const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const advertisersUsers = sequelize.define('advertisers_users', {
    advertisers_users_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    advertiser_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    user_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    }
}, {
    tableName: 'asb_advertisers_users',
    underscored: true,
    timestamps: false
});

module.exports = advertisersUsers;