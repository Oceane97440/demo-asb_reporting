const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Packs = sequelize.define('packs_smart', {
    packs_smart_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    pack_smart_name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    pack_smart_is_archived: {
        type: Sequelize.TINYINT(),
        allowNull: false
    },
    created_at: {
        type: Sequelize.DATE(),
        allowNull: true
    },
    updated_at: {
        type: Sequelize.DATE(),
        allowNull: true
    }
}, {
    tableName: 'asb_packs_smart',
    underscored: true,
    timestamps: true
});

module.exports = Packs;