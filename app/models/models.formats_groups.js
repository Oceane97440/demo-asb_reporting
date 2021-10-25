const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const GroupsFormats = sequelize.define('groups_formats', {
    group_format_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    group_format_name: {
        type: Sequelize.STRING(),
        allowNull: false
    }
}, {
    tableName: 'asb_groups_formats',
    underscored: true,
    timestamps: false
});

module.exports = GroupsFormats;