const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;

const Formatssites = sequelize.define('formats_sites', {
    format_site_id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    format_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    },
    site_id: {
        type: Sequelize.INTEGER(),
        allowNull: false
    }
}, {
    tableName: 'asb_formats_sites',
    underscored: true,
    timestamps: false
});

module.exports = Formatssites;