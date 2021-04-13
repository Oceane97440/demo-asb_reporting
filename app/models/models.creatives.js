const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Creatives = sequelize.define('creatives', {
    creative_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    creative_name: {
        type: Sequelize.STRING(),
        allowNull: false
    },
    file_name: {
        type: Sequelize.STRING(),
        allowNull: true
    },
    insertion_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    creative_resource_url: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    creative_url: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    creative_click_url: {
        type: Sequelize.STRING(255),
        allowNull: true
    },
    creative_width: {
        type: Sequelize.DECIMAL(),
        allowNull: true
    },
    creative_height: {
        type: Sequelize.DECIMAL(),
        allowNull: true
    },
    creative_mime_type: {
        type: Sequelize.STRING(255),
        allowNull: true
    },

    creative_percentage_delivery: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },

    creatives_type_id: {
        type: Sequelize.INTEGER(),
        allowNull: true
    },
    
    creatives_activated: {
        type: Sequelize.TINYINT(),
        allowNull: true
    },

    creatives_archived: {
        type: Sequelize.TINYINT(),
        allowNull: true
    }
}, {
    tableName: 'asb_creatives',
    underscored: true,
    timestamps: false
});

module.exports = Creatives;



