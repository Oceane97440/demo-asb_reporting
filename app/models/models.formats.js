const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Formats = sequelize.define('formats', {
    format_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    format_name: {
        type: Sequelize.STRING(45),
        allowNull: false
    },
    format_width: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    format_height: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    format_type_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    format_archived: {
        type: Sequelize.BIGINT(),
        allowNull: true
    },
    format_resource_url: {
        type: Sequelize.STRING(),
        allowNull: true
    }
}, {
    tableName: 'asb_formats',
    underscored: true,
    timestamps: false
});

module.exports = Formats;
