const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Users = sequelize.define('users', {
    user_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    user_email: {
        type: Sequelize.STRING(),
        allowNull: false
    },
    user_firstname: {
        type: Sequelize.STRING(),
        allowNull: false
    },
    user_lastname: {
        type: Sequelize.STRING(),
        allowNull: false
    },
    user_password: {
        type: Sequelize.STRING(),
        allowNull: false
    },
    user_role: {
        type: Sequelize.INTEGER(),
        allowNull: false
    }
}, {
    tableName: 'asb_users',
    underscored: true,
    timestamps: false
});

module.exports = Users;