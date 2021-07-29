const router = require("express").Router();
const Sequelize = require('sequelize');

const api = require("../controllers/controllers.api_epilot");

// Affiche la page api
router.use(function (req, res, next) {
    if ((!req.session.user)) {
        console.log('no access');
        return res.redirect('../../login');
    }
    next();
});
router.get("/", api.index);
router.post("/csv_import/add", api.csv_import);
// router.get("/csv_import", api.csv_import);

module.exports = router;