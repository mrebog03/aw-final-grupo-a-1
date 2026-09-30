//IMPORTAMOS LOS MODULOS
const express = require ("express");
const router = express.Router();

//IMPORTAMOS LOS CONTROLADORES
const {
  crearGasto,
  obtenerGastosDeViaje,
  obtenerGastoEspecifico,
  obtenerGastosGeneral,
  actualizarGasto,
  eliminarGasto
} = require("../controllers/gastos_controller");

//IMPORTAMOS EL MIDDLEWARE DE AUTENTICACION PARA PROTEGER LAS RUTAS
const { userMiddleware: verifyToken } = require("../middlewares/userMiddleware");

//DEFINIMOS LAS RUTAS
router.post("/", verifyToken, crearGasto);
router.get("/", verifyToken, obtenerGastosGeneral);
router.get("/viaje/:viaje", verifyToken, obtenerGastosDeViaje);
router.get("/:gastoId", verifyToken, obtenerGastoEspecifico);
router.put("/:gastoId", verifyToken, actualizarGasto);
router.delete("/:gastoId", verifyToken, eliminarGasto);

//EXPORTAMOS EL ROUTER
module.exports = router;
