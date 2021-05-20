const ModelFormat = require("../models/models.formats");
const ModelCountry = require("../models/models.countries")
const ModelPack = require("../models/models.packs")





exports.isDateValide = function (date) {
    date_now = '19-05-2021'

    if (date_now >= date) {
        return false

    } else {
        return true

    }

}



 exports.isFormatValide =  function (format) {

   
    const formats =  "HABILLAGE"
  
     if (formats ===format) {
         return true
 
     } else {
         return false
 
     }
 
 }

 
/*
exports.isPacksValide =  function (pack) {

  
    const packs =  "Rotation Générale"

 
     if (packs === pack) {
         return true
 
     } else {
         return false
 
     }
 
 }*/