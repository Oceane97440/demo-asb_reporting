const Sequelize = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Site = sequelize.define('site', {
        site_id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },
        site_is_child_directed: Sequelize.BIGINT,
        country_id:Sequelize.INTEGER,
        site_name:Sequelize.STRING,
        site_group:Sequelize.STRING,
        site_is_archived:Sequelize.INTEGER,
        site_extrenal_id:Sequelize.INTEGER,
        user_group_id:Sequelize.INTEGER,
        site_url:Sequelize.STRING,
        language_id:Sequelize.INTEGER,
        site_updated_at:Sequelize.DATE,
        site_business_model_type_id:Sequelize.INTEGER,
        site_business_model_type_id:Sequelize.INTEGER,
        site_application_id:Sequelize.STRING,
    }, {
        tableName: 'asb_site',
        underscored: true,
        timestamps: false
    });

    // Récupére le model country
    const Country = require('./models.country.js');
    const countryDb = Country(sequelize, Sequelize);

    Site.belongsTo(countryDb, {
        as: 'country',
        foreignKey: 'country_id',
        onDelete: 'cascade',
        hooks: true
    });
 
  
    countryDb.hasMany(Site, {
        foreignKey: 'country_id',
        onDelete: 'cascade',
        hooks: true
    });
   


    return Site;
};