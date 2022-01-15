const router = require("express").Router();
const Sequelize = require('sequelize');

const index = require("../controllers/controllers.index");

router.get("/login", index.login);
router.get("/login/microsoft", index.login_microsoft);
router.get("/login/microsoft/redirect", index.login_microsoft_redirect);

router.get("/signup", index.signup);
router.post("/signup/add", index.signup_add);

router.post("/login", index.login_add);
router.get("/home_page", index.index);
router.get("/logout", index.logout)

module.exports = router;