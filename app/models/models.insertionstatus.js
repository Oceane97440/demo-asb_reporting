const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const InsertionsStatus = sequelize.define('insertionstatus', {
    insertionstatus_id: {
        type: Sequelize.INTEGER,
        primaryKey: true
    },
    insertionstatus_name: {
        type: Sequelize.STRING(),
        allowNull: false
    }
}, {
    tableName: 'asb_insertionstatus',
    underscored: true,
    timestamps: false
});

module.exports = InsertionsStatus;
