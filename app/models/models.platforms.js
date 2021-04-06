const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Platforms = sequelize.define('platforms', {
    platform_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    platform_name: {
        type: Sequelize.STRING(),
        allowNull: false
    }
}, {
    tableName: 'asb_platforms',
    underscored: true,
    timestamps: false
});

module.exports = Platforms;