module.exports = (sequelize, Sequelize) => {
    const CampaignStatus = sequelize.define('campaign_status', {
        campaign_status_id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },
        campaign_status_name: Sequelize.STRING
    }, {
        tableName: 'asb_campaign_status',
        underscored: true,
        timestamps: false
    });

    return CampaignStatus;
};