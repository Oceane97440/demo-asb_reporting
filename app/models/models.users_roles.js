const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const UsersRoles = sequelize.define('users_roles', {
    roles_users_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    role_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    user_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    }
}, {
    tableName: 'asb_roles_users',
    underscored: true,
    timestamps: false
});

module.exports = UsersRoles;