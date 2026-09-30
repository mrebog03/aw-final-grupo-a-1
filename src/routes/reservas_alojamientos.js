//IMPORTAMOS LOS MODULOS
const express = require("express");
const router = express.Router();

//IMPORTAMOS MIDDLEWARE DE AUTENTICACION
const { userMiddleware: verifyToken } = require("../middlewares/userMiddleware");

//IMPORTAMOS FUNCIONES DEL CONTROLADOR
const {
  createReserva,
  deleteReserva,
  updateReserva,
  getReservas
} = require("../controllers/reservaAlojamiento_controller");

//DEFINIMOS LAS RUTAS
router.get("/", verifyToken, getReservas);
router.post("/", verifyToken, createReserva);
router.put("/:reservaID", verifyToken, updateReserva);
router.delete("/:reservaID", verifyToken, deleteReserva);

//EXPORTAMOS EL ROUTER
module.exports = router;