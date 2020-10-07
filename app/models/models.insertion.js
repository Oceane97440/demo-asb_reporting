const Sequelize = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Insertion = sequelize.define('insertion', {
        insertion_id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },
        insertion_is_used_by_guaranteed_deal: Sequelize.INTEGER,
        insertion_is_used_by_non_guaranteed_deal: Sequelize.BIGINT,
        insertion_voice_share: Sequelize.BIGINT,
        insertion_event_id: Sequelize.BIGINT,
        insertion_name: Sequelize.STRING,
        insertion_description: Sequelize.TEXT,
        insertion_is_personalize_ad: Sequelize.INTEGER,
        insertion_status_id: Sequelize.BIGINT,
        insertion_start_date: Sequelize.DATE,
        insertion_end_date: Sequelize.DATE,
        //index
        campaign_id: Sequelize.BIGINT,
        insertion_type_id: Sequelize.BIGINT,
        insertion_delivery_type_id: Sequelize.BIGINT,
        insertion_timezone_id: Sequelize.BIGINT,
        insertion_priority_id: Sequelize.BIGINT,
        insertion_group_capping_id: Sequelize.BIGINT,
        insertion_max_impressions: Sequelize.BIGINT,
        insertion_weight: Sequelize.BIGINT,
        insertion_max_clicks: Sequelize.BIGINT,
        insertion_max_impressions_per_day: Sequelize.BIGINT,
        insertion_max_clicks_per_day: Sequelize.BIGINT,
        insertion_grouped_volume_id: Sequelize.BIGINT,
        insertion_event_impressions: Sequelize.BIGINT,
        insertion_is_holistic_yield_enabled: Sequelize.INTEGER,
        insertion_deliver_left_volume_after_end_date: Sequelize.INTEGER,
        insertion_global_capping: Sequelize.BIGINT,
        insertion_capping_per_visit: Sequelize.BIGINT,
        insertion_capping_per_click: Sequelize.BIGINT,
        insertion_auto_capping: Sequelize.BIGINT,
        insertion_periodic_capping_impressions: Sequelize.BIGINT,
        insertion_periodic_capping_period: Sequelize.BIGINT,
        insertion_is_oba_icon_enabled: Sequelize.INTEGER,
        //index
        format_id: Sequelize.BIGINT,
        insertion_external_id: Sequelize.BIGINT,
        insertion_external_description: Sequelize.TEXT,
        insertion_update_at: Sequelize.DATE,
        insertion_created_at: Sequelize.DATE,
        insertion_is_archived: Sequelize.INTEGER,
        insertion_rate_type_id: Sequelize.BIGINT,
        insertion_rate: Sequelize.DOUBLE,
        insertion_rate_net: Sequelize.DOUBLE,
        insertion_discount: Sequelize.DOUBLE,
        insertion_audience_data_cpm: Sequelize.DOUBLE,
        insertion_semantic_data_cpm: Sequelize.DOUBLE,
        insertion_currency_id: Sequelize.BIGINT,
        //index
        insertion_link_id: Sequelize.BIGINT,
        insertion_customized_script: Sequelize.STRING,
        insertion_sales_channel_id: Sequelize.BIGINT
    }, {
        tableName: 'asb_insertion',
        underscored: true,
        timestamps: false
    });

    // Récupére le model campaign
    const Campaign = require('./models.campaign.js');
    const campaignDb = Campaign(sequelize, Sequelize);
   
    Insertion.belongsTo(campaignDb, {
        as: 'campaigns',
        foreignKey: 'campaign_id',
        onDelete: 'cascade',
        hooks: true
    });
 
    return Insertion;
};