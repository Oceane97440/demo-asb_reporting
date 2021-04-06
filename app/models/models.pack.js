const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;


const Pack = sequelize.define('packs', {

    pack_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    pack_name: {type: Sequelize.STRING(45),allowNull:false},
    pack_isArchived:{type: Sequelize.INTEGER(),allowNull:false},
    site_updated_at:{type: Sequelize.DATE(),allowNull:false},
    pack_datecreate:{type: Sequelize.DATE(),allowNull:false},
    pack_dateupdate:{type: Sequelize.DATE(),allowNull:false},



},
{tableName: 'asb_packs', underscored: true, timestamps: false}
);


module.exports = Pack;


   



