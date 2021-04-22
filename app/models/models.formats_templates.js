const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const FormatsTemplates = sequelize.define('formats_templates', {
    format_template_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    format_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    template_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    }
}, {
    tableName: 'asb_formats_templates',
    underscored: true,
    timestamps: false
});

module.exports = FormatsTemplates;