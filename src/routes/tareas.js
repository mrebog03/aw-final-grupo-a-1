const express = require("express");
const router = express.Router();

const {
  getTareas, crearTarea, marcarCompletada,
  marcarPendiente, eliminarTarea, actualizarTarea,
} = require("../controllers/tareas_controller");


const { userMiddleware: verifyToken } = require("../middlewares/userMiddleware");

//DEFINIMOS LAS RUTAS
router.post("/", verifyToken, crearTarea);
router.get("/", verifyToken, getTareas);
router.delete("/:id", verifyToken, eliminarTarea);
router.put("/:id", verifyToken, actualizarTarea);

//EXPORTAMOS EL ROUTER
module.exports = router;