const Sequelize = require('sequelize');


const sequelize = require('../config/_config.database').sequelize;


const Insertions = sequelize.define('insertions', {

    insertion_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    delivery_regulated: {
        type: Sequelize.BIGINT(),
        allowNull: false
    },
    used_guaranteed_deal: {
        type: Sequelize.BIGINT(),
        allowNull: true
    },
    used_non_guaranteed_deal: {
        type: Sequelize.BIGINT(),
        allowNull: true
    },
   
    voice_share: {
        type: Sequelize.FLOAT(),
        allowNull: true
    },
    event_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    insertion_name: {
        type: Sequelize.STRING(),
        allowNull: true
    },
    insertion_description: {
        type: Sequelize.TEXT(),
        allowNull: true
    },
    personalized_ad: {
        type: Sequelize.BIGINT(),
        allowNull: true
    },
 
   /* site_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },*/
    pack_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    insertion_status_id: {
        type: Sequelize.BIGINT(),
        allowNull: true
    },
    insertion_start_date: {
        type: Sequelize.DATE(),
        allowNull: true
    },
    insertion_end_date: {
        type: Sequelize.DATE(),
        allowNull: true
    },
   
    campaign_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    insertion_type_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    delivery_type_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    timezone_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    priority_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    periodic_capping_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    group_capping_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    max_impression: {
        type: Sequelize.FLOAT(),
        allowNull: true
    },
    weight: {
        type: Sequelize.DECIMAL(),
        allowNull: true
    },
    max_click: {
        type: Sequelize.DECIMAL(),
        allowNull: true
    },
    max_impression_perday: {
        type: Sequelize.DECIMAL(),
        allowNull: true
    },
    max_click_perday: {
        type: Sequelize.DECIMAL(),
        allowNull: true
    },
    insertion_groupe_volume: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    event_impression: {
        type: Sequelize.DECIMAL(),
        allowNull: true
    },
    holistic_yield_enabled: {
        type: Sequelize.BIGINT(),
        allowNull: true
    },
    deliver_left_volume_after_end_date: {
        type: Sequelize.BIGINT(),
        allowNull: true
    },
    global_capping: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    capping_per_visit: {
        type: Sequelize.DECIMAL(),
        allowNull: true
    },
    capping_per_click: {
        type: Sequelize.DECIMAL(),
        allowNull: true
    },
    auto_capping: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    periodic_capping_impression: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    periodic_capping_period: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    oba_icon_enabled: {
        type: Sequelize.BIGINT(),
        allowNull: true
    },
    format_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    external_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    external_description: {
        type: Sequelize.STRING(),
        allowNull: true
    },
    insertion_updated_at: {
        type: Sequelize.STRING(),
        allowNull: true
    },
   insertion_created_at: {
        type: Sequelize.STRING(),
        allowNull: true
    },
    insertion_archived: {
        type: Sequelize.DATE(),
        allowNull: true
    },
    rate_type_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    rate: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    rate_net: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    discount: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    currency_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    insertion_link_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    insertion_exclusion_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    
    customized_script: {
        type: Sequelize.STRING(),
        allowNull: true
    },
    sale_channel_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
   
















}, {
    tableName: 'asb_insertions',
    underscored: true,
    timestamps: false
});

module.exports = Insertions;