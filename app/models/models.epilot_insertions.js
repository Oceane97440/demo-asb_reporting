const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const EpilotInsertions = sequelize.define('epilot_insertions', {
    epilot_insertion_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    epilot_campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },
    epilot_campaign_name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    epilot_campaign_code: {
        type: Sequelize.INTEGER,
        allowNull: false
    },    
    user_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },  
    group_format_id: {
        type: Sequelize.INTEGER,
        allowNull: true
    },   
    epilot_insertion_name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },    
    epilot_insertion_commercial: {
        type: Sequelize.STRING(255),
        allowNull: false
    },    
    epilot_insertion_start_date: {
        type: Sequelize.DATE(),
        allowNull: false
    },
    epilot_insertion_end_date: {
        type: Sequelize.DATE(),
        allowNull: false
    },
    epilot_insertion_volume: {
        type: Sequelize.FLOAT(),
        allowNull: false
    },
    epilot_insertion_status: {
        type: Sequelize.TINYINT,
        allowNull: false
    }
}, {
    tableName: 'asb_epilot_insertions',
    underscored: true,
    timestamps: false
});

module.exports = EpilotInsertions;
