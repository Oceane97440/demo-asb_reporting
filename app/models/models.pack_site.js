const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;


const Pack_Site = sequelize.define('packs_sites', {

    pack_site_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    pack_id:{type: Sequelize.INTEGER(),allowNull:false},
    site_id:{type: Sequelize.INTEGER(),allowNull:false},




},
{tableName: 'asb_packs_sites', underscored: true, timestamps: false}
);



module.exports = Pack_Site;


   



