const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Sites = sequelize.define('sites', {
    site_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    site_is_child_directed: {
        type: Sequelize.BIGINT(),
        allowNull: true
    },
    site_name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    site_group: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    site_archived: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    user_group_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    site_url: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    language_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    site_business_model_type_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    site_business_model_value: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    site_application_id: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    site_updated_at: {
        type: Sequelize.STRING(255),
        allowNull: true
    }
}, {
    tableName: 'asb_sites',
    underscored: true,
    timestamps: false
});

module.exports = Sites;