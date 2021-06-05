const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const insertions_templates = sequelize.define('insertions_templates', {
    insertiontemplate_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    insertion_id: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    parameter_value: {
        type: Sequelize.TEXT(),
        allowNull: false
    },
    template_id: {
        type: Sequelize.INTEGER,
        allowNull: false

    },
}, {
    tableName: 'asb_insertions_templates',
    underscored: true,
    timestamps: false
});

module.exports = insertions_templates;