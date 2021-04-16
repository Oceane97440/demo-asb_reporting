const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const InsertionsTemplates = sequelize.define('insertionstemplates', {
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
    tableName: 'asb_insertionstemplates',
    underscored: true,
    timestamps: false
});

module.exports = InsertionsTemplates;