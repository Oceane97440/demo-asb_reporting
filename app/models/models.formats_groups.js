const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const FormatsGroups = sequelize.define('formats_groups', {
    format_group_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    format_group_name: {
        type: Sequelize.STRING(),
        allowNull: false
    }
}, {
    tableName: 'asb_formats_groups',
    underscored: true,
    timestamps: false
});

module.exports = FormatsGroups;