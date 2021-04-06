const router = require("express").Router();
const Sequelize = require('sequelize');

const api = require("../controllers/controllers.index");

// Affiche la page api
router.get("/", api.login)
router.post("/login/add", api.login_add)
router.get("/home_page", api.index);
router.get("/signup", api.signup)
router.post("/signup/add", api.signup_add)
router.get("/logout", api.logout)

module.exports = router;