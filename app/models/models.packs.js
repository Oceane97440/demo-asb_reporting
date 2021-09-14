const Sequelize = require('sequelize');

const sequelize = require('../config/config.database').sequelize;

const Packs = sequelize.define('packs', {
    pack_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    pack_name: {
        type: Sequelize.STRING(255),
        allowNull: false
    },
    pack_is_archived: {
        type: Sequelize.TINYINT(),
        allowNull: false
    },
   
}, {
    tableName: 'asb_packs',
    underscored: true,
    timestamps: false
});

module.exports = Packs;