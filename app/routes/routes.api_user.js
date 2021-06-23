const router = require("express").Router();
const Sequelize = require('sequelize');

const api = require("../controllers/controllers.api_forecast_user-delete");

// Affiche la page api
router.use(function (req, res, next) {
    if ((!req.session.user)) {           
        console.log('no access');
        return res.redirect('../../login');    
    }        
    next();  
});
router.get("/", api.index);
router.post("/add", api.forecast_user);
router.get("/campagne_epilot", api.epilot)
router.post("/campagne_epilot/add", api.campaign_epilot);
router.get("/campagne_epilot/edit/:id", api.epilot_edit)
router.post("/campagne_epilot/update/:id", api.update)
router.get("/campagne_epilot/delete/:id", api.delete)

module.exports = router;