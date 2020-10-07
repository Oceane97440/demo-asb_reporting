const Sequelize = require('sequelize');

module.exports = (sequelize, Sequelize) => {

    const Campaign = sequelize.define('campaign', {
        campaign_id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },
        campaign_name: Sequelize.STRING,
        advertiser_id:  Sequelize.BIGINT,
        agency_id: Sequelize.BIGINT,
        campaign_status_id: Sequelize.BIGINT,
        campaign_description: Sequelize.TEXT,
        campaign_external_id: Sequelize.BIGINT,
        campaign_trafficked_by: Sequelize.BIGINT,
        campaign_traded_by: Sequelize.BIGINT,
        campaign_start_date: Sequelize.DATE,

        campaign_start_date : {
            type     : Sequelize.DATE,
            allowNull: false,
            set      : function(val) {
                var start_date = new Date(this.getDataValue('campaign_start_date'));
              this.setDataValue('campaign_start_date_format', start_date.getFullYear());
            }
          },
        campaign_end_date: Sequelize.DATE,
        campaign_global_capping: Sequelize.BIGINT,
        campaign_visit_capping: Sequelize.BIGINT,
        campaign_isarchived: Sequelize.BOOLEAN
    }, {
        tableName: 'asb_campaign',
        underscored: true,
        timestamps: false
    });

    // Récupére le model annonceur
    const Advertiser = require('./models.advertiser.js');
    const advertiserDb = Advertiser(sequelize, Sequelize);
   
    Campaign.belongsTo(advertiserDb, {
        as: 'advertisers',
        foreignKey: 'advertiser_id',
        onDelete: 'cascade',
        hooks: true
    });
  
    advertiserDb.hasMany(Campaign, {
        foreignKey: 'advertiser_id',
        onDelete: 'cascade',
        hooks: true
    });
   
    return Campaign;
};