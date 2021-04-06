const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Users = sequelize.define('users', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: Sequelize.STRING(),
        allowNull: false
    },
    password: {
        type: Sequelize.STRING(),
        allowNull: false
    },
    role: {
        type: Sequelize.INTEGER(),
        allowNull: false
    }
}, {
    tableName: 'asb_users',
    underscored: true,
    timestamps: false
});

module.exports = Users;