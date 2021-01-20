const Sequelize = require('sequelize');


const sequelize = require('../config/_config.database').sequelize;


const Users = sequelize.define('utilisateurs', {

    id: {type: Sequelize.INTEGER, autoIncrement:true, primaryKey:true },
    email: {type: Sequelize.STRING(),allowNull:false},
    password:{type: Sequelize.STRING(),allowNull:false},
    role:{type: Sequelize.INTEGER(),allowNull:false},


},
{tableName: 'asb_utilisateurs', underscored: true, timestamps: false}
);

module.exports = Users;
