const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const insertions_priorities = sequelize.define('insertions_priorities', {
    priority_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    priority_name: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
}, {
    tableName: 'asb_insertions_priorities',
    underscored: true,
    timestamps: false
});

module.exports = insertions_priorities;