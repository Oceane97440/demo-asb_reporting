const Sequelize = require('sequelize');


const sequelize = require('../config/_config.database').sequelize;


const Format = sequelize.define('formats', {

    format_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    format_name: {type: Sequelize.STRING(45),allowNull:false},
    format_group: {type: Sequelize.STRING(45),allowNull:false},
    format_width:{type: Sequelize.INTEGER(),allowNull:false},
    format_height:{type: Sequelize.INTEGER(),allowNull:false},
    format_type_id:{type: Sequelize.INTEGER(),allowNull:false},
    format_is_archived:{type: Sequelize.BIGINT(),allowNull:false},
    format_resource_url:{type: Sequelize.STRING(),allowNull:false},


},
{tableName: 'asb_formats', underscored: true, timestamps: false}
);

module.exports = Format;
