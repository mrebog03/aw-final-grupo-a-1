//IMPORTAMOS LOS MODULOS
const express = require("express");
const router = express.Router();

//IMPORTAMOS EL MIDDLEWARE DE AUTENTICACION PARA PROTEGER LAS RUTAS
const { userMiddleware: verifyToken } = require("../middlewares/userMiddleware");
const { authMiddleware: verifyAdmin } = require("../middlewares/authMiddleware");

//IMPORTAMOS FUNCIONES DEL CONTROLADOR
const {
    createAlojamiento,
    getAlojamientos,
    updateAlojamiento,
    deleteAlojamiento,
} = require("../controllers/alojamientos_controller");

//DEFINIMOS LAS RUTAS CLIENTE
router.get("/", verifyToken, getAlojamientos);

//DEFINIMOS LAS RUTAS ADMIN
router.post("/", verifyToken, verifyAdmin, createAlojamiento);
router.put("/:alojamientoID", verifyToken, verifyAdmin, updateAlojamiento);
router.delete("/:alojamientoID", verifyToken, verifyAdmin, deleteAlojamiento);

//EXPORTAMOS EL ROUTER
module.exports = router;