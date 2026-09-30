const express = require("express");
const router = express.Router();

const {
    createReservaActividad, deleteReservaActividad, getReservasActividades 
} = require("../controllers/reservaActividades_controller");

const { userMiddleware: verifyToken } = require("../middlewares/userMiddleware");

router.get("/", verifyToken, getReservasActividades);
router.post("/", verifyToken, createReservaActividad);
router.delete("/:id", verifyToken, deleteReservaActividad);

module.exports = router;