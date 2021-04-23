const {
    Op
} = require("sequelize");

process.on('unhandledRejection', error => {
    // Will print "unhandledRejection err is not defined"
    console.log('unhandledRejection', error.message);
});
const {
    QueryTypes
} = require('sequelize');


// Charge l'ensemble des functions de l'API
const AxiosFunction = require('../functions/functions.axios');


// Initialise les models
//const ModelSite = require("../models/models.site");
const ModelFormat = require("../models/models.formats");
const ModelCountry = require("../models/models.countries")
const ModelPack = require("../models/models.packs")

exports.index = async (req, res) => {



    try {



            const formats = await ModelFormat.findAll({
                attributes: ['format_id', 'format_name', 'format_group'],
                group: ['format_group'],
                where: {
                    format_group: {
                        [Op.not]: null
                    }
                },
                order: [
                    ['format_group', 'ASC']
                ],
            })

            const packs = await ModelPack.findAll({
                attributes: ['pack_id', 'pack_name'],
                order: [
                    ['pack_name', 'ASC']
                ],
            })


            const countrys = await ModelCountry.findAll({
                attributes: ['country_id', 'country_name'],
                where: {
                    country_id: [61, 125, 184]
                },
                order: [
                    ['country_name', 'DESC']
                ],
            })

            res.render('forecast/form.ejs', {
                formats: formats,
                packs: packs,
                countrys: countrys
            });
        

    } catch (error) {
        console.log(error)
   
    }

};