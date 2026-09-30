//IMPORTAMOS LOS MODULOS
const express = require("express");
const router = express.Router();

//IMPORTAMOS LOS CONTROLADORES
const {register, login, logout, getCurrentUser, obtenerMisViajes} = require("../controllers/userController");

const { userMiddleware: verifyToken } = require("../middlewares/userMiddleware");

//DEFINIMOS LAS RUTAS
router.post("/register", register);
router.post("/login", login);
router.post("/logout", logout);
router.get("/profile", verifyToken, getCurrentUser);
router.get("/viajes", verifyToken, obtenerMisViajes);

//EXPORTAMOS EL ROUTER
module.exports = router;

