const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Creativestypes = sequelize.define('creatives_types', {
    creative_type_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    creative_type_name: {
        type: Sequelize.STRING(),
        allowNull: false
    }
}, {
    tableName: 'asb_creatives_types',
    underscored: true,
    timestamps: false
});

module.exports = Creativestypes;



