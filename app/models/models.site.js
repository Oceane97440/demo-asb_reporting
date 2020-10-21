const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;


const Site = sequelize.define('site', {

    site_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    site_is_child_directed:{type: Sequelize.BIGINT(),allowNull:false},
    country_id:{type: Sequelize.INTEGER(),allowNull:false},
    site_name: {type: Sequelize.STRING(45),allowNull:false},
    format_height:{type: Sequelize.INTEGER(),allowNull:false},
    site_is_archived:{type: Sequelize.INTEGER(),allowNull:false},
    site_extrenal_id:{type: Sequelize.INTEGER(),allowNull:false},
    user_group_id:{type: Sequelize.INTEGER(),allowNull:false},
    site_url:{type: Sequelize.STRING(255),allowNull:false},
    language_id:{type: Sequelize.INTEGER(),allowNull:false},
    site_updated_at:{type: Sequelize.DATE(),allowNull:false},
    site_business_model_type_id:{type: Sequelize.INTEGER(),allowNull:false},
    site_businessModelValue:{type: Sequelize.INTEGER(),allowNull:false},
    site_application_id:{type: Sequelize.DATE(),allowNull:false},


},
{tableName: 'asb_site', underscored: true, timestamps: false}
);


module.exports = Site;


   



