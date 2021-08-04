const router = require("express").Router();
const Sequelize = require('sequelize');

const index = require("../controllers/controllers.index");

// Affiche la page Index
router.get("/", index.home_page);
router.get("/login", index.login);
router.get("/signup", index.signup);
router.post("/signup/add", index.signup_add);


router.post("/login/add", index.login_add);
router.get("/home_page", index.index);
router.get("/logout", index.logout)

module.exports = router;