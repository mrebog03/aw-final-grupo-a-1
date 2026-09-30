const express = require("express");
const router = express.Router();

const {
    crearActividad, editarActividad, eliminarActividad,
    obtenerActividades, obtenerActividad,
    reservarActividad, cancelarReserva
} = require("../controllers/actividades_controller");

const { userMiddleware: verifyToken } = require("../middlewares/userMiddleware");

const { authMiddleware } = require("../middlewares/authMiddleware");

//DEFINIMOS LAS RUTAS
router.post("/", verifyToken, authMiddleware, crearActividad);
router.put("/:id", verifyToken, authMiddleware, editarActividad);
router.delete("/:id", verifyToken, authMiddleware, eliminarActividad);

router.get("/", verifyToken, obtenerActividades);
router.get("/:id", verifyToken, obtenerActividad);
router.post("/:id/reservar/:viajeId", verifyToken, reservarActividad);
router.delete("/:id/reservar/:viajeId", verifyToken, cancelarReserva);

//EXPORTAMOS EL ROUTER
module.exports = router;