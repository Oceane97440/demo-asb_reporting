const Sequelize = require('sequelize');

const sequelize = require('../config/_config.database').sequelize;


const Pack_Site = sequelize.define('pack_site', {

    pack_site_id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    pack_id:{type: Sequelize.INTEGER(),allowNull:false},
    site_id:{type: Sequelize.INTEGER(),allowNull:false},




},
{tableName: 'asb_pack_sites', underscored: true, timestamps: false}
);

const pack = require('./models.pack');
const site = require('./models.site');


pack.belongsTo(site, {foreignKey: 'site_id', onDelete: 'cascade', hooks: true}); // un pack peut avoir 1 site
site.hasMany(pack,{foreignKey: 'pack_id', onDelete: 'cascade', hooks: true }); //un site peut avoir 1 ou N pack

module.exports = Pack_Site;


   



