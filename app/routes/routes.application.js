const router = require("express").Router();
const Sequelize = require('sequelize');


const app = require("../controllers/controllers.application");
    

    // Affiche la page app
   
    router.post("/login/add",app.login_add)
    router.get("/logout",app.logout)




    
module.exports = router;