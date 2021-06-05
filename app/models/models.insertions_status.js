const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const InsertionsStatus = sequelize.define('insertions_status', {
    insertion_status_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    insertion_status_name: {
        type: Sequelize.STRING(),
        allowNull: false
    }
}, {
    tableName: 'asb_insertions_status',
    underscored: true,
    timestamps: false
});

module.exports = InsertionsStatus;
