const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Alerts = sequelize.define('alerts', {
    alert_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    alert_message: {
        type: Sequelize.STRING(255),
        allowNull: true
    },   
    alert_table_name: {
        type: Sequelize.STRING(255),
        allowNull: true
    },   
    alert_table_id: {
        type: Sequelize.STRING(255),
        allowNull: true
    },   
    alert_code: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    alert_type: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
    },
    alert_status: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0
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
    tableName: 'asb_alerts',
    underscored: true,
    timestamps: true
});

module.exports = Alerts;
