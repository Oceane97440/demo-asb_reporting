const Sequelize = require('sequelize');


const sequelize = require('../config/_config.database').sequelize;


const Templates = sequelize.define('templates', {

    template_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    template_name: {type: Sequelize.STRING(),allowNull:false},
    template_description : {type: Sequelize.TEXT(),allowNull:true},
    template_official: {type: Sequelize.TINYINT(),allowNull:true},
    template_archived: {type: Sequelize.TINYINT(),allowNull:true},
    parameter_default_values: {type: Sequelize.TEXT(),allowNull:true},
    template_original_id: {type: Sequelize.INTEGER(),allowNull:true},
    documentation_url: {type: Sequelize.TEXT(),allowNull:true},
    type: {type: Sequelize.INTEGER(),allowNull:true},	
    draft_script_id: {type: Sequelize.INTEGER(),allowNull:true},	
    replaced_by: {type: Sequelize.INTEGER(),allowNull:true},	
    editable: {type: Sequelize.TINYINT(),allowNull:true},	
    published: {type: Sequelize.TINYINT(),allowNull:true},	
    deprecated: {type: Sequelize.TINYINT(),allowNull:true},	
    hidden: {type: Sequelize.TINYINT(),allowNull:true},	
    template_updated_at: {type: Sequelize.STRING(),allowNull:true},	
    minor_version: {type: Sequelize.INTEGER(),allowNull:true},
    release_note: {type: Sequelize.STRING(),allowNull:true},
    recommendation: {type: Sequelize.STRING(),allowNull:true},
    sale_channel_id: {type: Sequelize.INTEGER(),allowNull:true},
    fixed_image_url:{type: Sequelize.STRING(),allowNull:true},
    dynamic_image_url:{type: Sequelize.STRING(),allowNull:true},

    gallery_url: {type: Sequelize.STRING(),allowNull:true},




},
{tableName: 'asb_templates', underscored: true, timestamps: false}
);

module.exports = Templates;
