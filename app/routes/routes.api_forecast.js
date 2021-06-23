const router = require("express").Router();
const Sequelize = require('sequelize');

const api = require("../controllers/controllers.api_forecast");

// Affiche la page api
router.use(function (req, res, next) {
    if ((!req.session.user)) {           
        console.log('no access');
        return res.redirect('../../login');    
    }        
    next();  
});
router.get("/", api.index);
router.post("/add", api.forecast);

// router.get("/indexa", api.indexa); router.get("/sites", api.sites);
// router.get("/countries", api.countries); router.get("/formats", api.formats);

module.exports = router;