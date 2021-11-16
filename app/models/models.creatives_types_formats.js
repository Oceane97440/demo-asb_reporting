const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Creativestypesformat = sequelize.define('creatives_types_formats', {
    creative_type_format_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    format_group_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    creative_type_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    }
}, {
    tableName: 'asb_creatives_types_formats',
    underscored: true,
    timestamps: false
});

module.exports = Creativestypesformat;