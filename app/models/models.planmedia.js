const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Tvplanmedia = sequelize.define('tv_planmedia', {
    planmedia_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    planmedia_name: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    advertiser_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        //defaultValue: 0
    },
    planmedia_start_date: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    planmedia_end_date: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    planmedia_user: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
    },

    planmedia_budget: {
        type: Sequelize.DECIMAL,
        allowNull: true
    },

    planmedia_type: {
        type: Sequelize.STRING(255),
        allowNull: true
    },

    planmedia_crypt: {
        type: Sequelize.STRING(255),
        allowNull: true
    },

    planmedia_file: {
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
    tableName: 'asb_tv_planmedia',
    underscored: true,
    timestamps: true
});

module.exports = Tvplanmedia;