const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Roles = sequelize.define('roles', {
    role_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    label: {
        type: Sequelize.STRING(),
        allowNull: false
    }
}, {
    tableName: 'asb_roles',
    underscored: true,
    timestamps: false
});

module.exports = Roles;