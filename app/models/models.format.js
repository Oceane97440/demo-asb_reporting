const Sequelize = require('sequelize');

module.exports = (sequelize, Sequelize) => {
    const Format = sequelize.define('formats', {
        format_id: {
            type: Sequelize.BIGINT,
            primaryKey: true
        },        
        format_name:Sequelize.STRING,
		format_group:Sequelize.STRING,
        format_width:Sequelize.INTEGER,
        format_height:Sequelize.INTEGER,
        format_type_id:Sequelize.INTEGER,
        format_is_archived: Sequelize.BIGINT,
        format_resource_url: Sequelize.STRING        
    }, {
        tableName: 'asb_formats',
        underscored: true,
        timestamps: false
    });

    return Format;
};