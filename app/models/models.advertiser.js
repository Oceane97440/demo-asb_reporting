const Sequelize = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Advertiser = sequelize.define('advertiser', {
        advertiser_id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },
        advertiser_name: Sequelize.STRING,
        advertiser_description: Sequelize.TEXT,
        advertiser_is_direct_advertiser: Sequelize.BOOLEAN,
        advertiser_is_direct_advertiser: Sequelize.BOOLEAN,
        advertiser_is_house_ads:Sequelize.BOOLEAN,
        advertiser_address: Sequelize.TEXT,
        advertiser_contact_name: Sequelize.STRING,
        advertiser_contact_email: Sequelize.STRING,
        advertiser_contact_phone_number: Sequelize.STRING,
        advertiser_is_archived: Sequelize.BOOLEAN,
        advertiser_user_group_id: Sequelize.BIGINT,
        advertiser_date_created: Sequelize.DATE,
        advertiser_date_updated: Sequelize.DATE,
    }, {
        tableName: 'asb_advertiser',
        underscored: true,
        timestamps: false
    });
/*
    // Récupére le model annonceur
    const Campaign = require('./models.campaign.js');
    const campaignDb = Campaign(sequelize, Sequelize);
    
    Advertiser.hasOne(campaignDb, {
        as: 'campaigns',
        foreignKey: 'campaign_id',
        onDelete: 'cascade',
        hooks: true
    });
   
    Advertiser.hasMany(campaignDb, {
        foreignKey: 'advertiser_id',
        onDelete: 'cascade',
        hooks: true
    });
 */
    return Advertiser;
};