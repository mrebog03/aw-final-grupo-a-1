const express = require ("express");
const router = express.Router();
const {
    crearViaje, 
    listarViajes, 
    obtenerViaje, 
    editarViaje, 
    eliminarViaje, 
    añadirUsuario, 
    eliminarUsuario, 
    abandonarViaje,
    unirsePorCodigo
} = require("../controllers/viajes_controller");

const { userMiddleware: verifyToken } = require("../middlewares/userMiddleware");

router.post("/", verifyToken, crearViaje);
router.get("/", verifyToken, listarViajes);

router.post("/unirse", verifyToken, unirsePorCodigo);

router.get("/:id", verifyToken, obtenerViaje);
router.put("/:id", verifyToken, editarViaje);
router.delete("/:id", verifyToken, eliminarViaje);

router.post("/:id/usuarios", verifyToken, añadirUsuario);
router.delete("/:id/usuarios", verifyToken, eliminarUsuario);
router.post("/:id/abandonar", verifyToken, abandonarViaje);

module.exports = router;
