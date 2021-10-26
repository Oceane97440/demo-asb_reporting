const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const FormatsGroupsTypes = sequelize.define('formats_groups_types', {
    format_group_type_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    format_group_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    format_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    }
}, {
    tableName: 'asb_formats_groups_types',
    underscored: true,
    timestamps: false
});

module.exports = FormatsGroupsTypes;